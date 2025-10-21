namespace CoolifyTestApi.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
}

public record LoginRequest(string Username, string Password);

public record LoginResponse(string Token, string Username, int UserId);

public record ChatMessage(int Id, string Content, string SenderUsername, int SenderId, DateTime Timestamp, string? RoomId = null, int? RecipientId = null);

public record SendMessageRequest(string Content, string? RoomId = null, int? RecipientId = null);

public record ChatRoom(string Id, string Name, List<string> Participants);

public record RegisterRequest(string Username, string Email, string Password);