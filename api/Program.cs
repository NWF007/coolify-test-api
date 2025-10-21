using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using CoolifyTestApi.Services;
using CoolifyTestApi.Hubs;
using CoolifyTestApi.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Add services
builder.Services.AddSingleton<IJwtService, JwtService>();
builder.Services.AddSingleton<IUserService, UserService>();

// Add SignalR
builder.Services.AddSignalR();

// Add JWT Authentication - Use same configuration as JwtService
var jwtSecret = builder.Configuration["JWT:Secret"] ?? "YourVeryLongSecretKeyThatIsAtLeast32CharactersLong!";
var jwtIssuer = builder.Configuration["JWT:Issuer"] ?? "CoolifyTestApi";
var jwtAudience = builder.Configuration["JWT:Audience"] ?? "CoolifyTestApi";
var key = Encoding.UTF8.GetBytes(jwtSecret);

Console.WriteLine($"JWT Secret length: {jwtSecret.Length}");
Console.WriteLine($"JWT Issuer: {jwtIssuer}");
Console.WriteLine($"JWT Audience: {jwtAudience}");
Console.WriteLine($"Environment: {builder.Environment.EnvironmentName}");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
        
        // Configure SignalR JWT authentication
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chathub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            },
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"JWT Authentication failed: {context.Exception.Message}");
                Console.WriteLine($"Path: {context.Request.Path}");
                return Task.CompletedTask;
            },
            OnTokenValidated = context =>
            {
                Console.WriteLine($"JWT Token validated successfully for path: {context.Request.Path}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:5173", "https://test-app.stor8.cloud")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");

// Add authentication middleware
app.UseAuthentication();
app.UseAuthorization();

// Health check endpoint
app.MapGet("/health", () => new { status = "healthy", timestamp = DateTime.UtcNow })
.WithName("HealthCheck");

// Authentication endpoints
app.MapPost("/login", async (LoginRequest request, IJwtService jwtService, IUserService userService) =>
{
    var user = await userService.AuthenticateAsync(request.Username, request.Password);
    
    if (user == null)
    {
        return Results.Unauthorized();
    }
    
    var token = jwtService.GenerateToken(user);
    return Results.Ok(new LoginResponse(token, user.Username, user.Id));
})
.WithName("Login");

// Get all users (authenticated)
app.MapGet("/users", [Authorize] async (IUserService userService) =>
{
    var users = await userService.GetAllUsersAsync();
    return Results.Ok(users);
})
.WithName("GetUsers");

// Get current user info
app.MapGet("/me", [Authorize] async (ClaimsPrincipal user, IUserService userService) =>
{
    var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier);
    if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
    {
        return Results.Unauthorized();
    }
    
    var currentUser = await userService.GetByIdAsync(userId);
    return currentUser != null ? Results.Ok(currentUser) : Results.NotFound();
})
.WithName("GetCurrentUser");

// Map SignalR hub
app.MapHub<ChatHub>("/chathub");

app.Run();
