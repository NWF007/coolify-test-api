using CoolifyTestApi.Models;
using System.Security.Cryptography;
using System.Text;

namespace CoolifyTestApi.Services;

public interface IUserService
{
    Task<User?> AuthenticateAsync(string username, string password);
    Task<User?> GetByIdAsync(int id);
    Task<User?> GetByUsernameAsync(string username);
    Task<List<User>> GetAllUsersAsync();
}

public class UserService : IUserService
{
    private readonly List<User> _users;

    public UserService()
    {
        // Create two test users: Alice and Bob
        _users = new List<User>
        {
            new User
            {
                Id = 1,
                Username = "alice",
                Email = "alice@example.com",
                PasswordHash = HashPassword("password123")
            },
            new User
            {
                Id = 2,
                Username = "bob",
                Email = "bob@example.com",
                PasswordHash = HashPassword("password456")
            }
        };
    }

    public async Task<User?> AuthenticateAsync(string username, string password)
    {
        await Task.Delay(50); // Simulate async operation
        
        var user = _users.FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
        
        if (user != null && VerifyPassword(password, user.PasswordHash))
        {
            return user;
        }
        
        return null;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        await Task.Delay(10);
        return _users.FirstOrDefault(u => u.Id == id);
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        await Task.Delay(10);
        return _users.FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));
    }

    public async Task<List<User>> GetAllUsersAsync()
    {
        await Task.Delay(10);
        return _users.ToList();
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password + "salt123"));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}