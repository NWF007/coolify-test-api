using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace CoolifyTestApi.Hubs;

[Authorize]
public class ChatHub : Hub
{
    public async Task JoinRoom(string roomId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("UserJoined", Context.User?.Identity?.Name, $"{Context.User?.Identity?.Name} joined the chat");
    }

    public async Task LeaveRoom(string roomId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomId);
        await Clients.Group(roomId).SendAsync("UserLeft", Context.User?.Identity?.Name, $"{Context.User?.Identity?.Name} left the chat");
    }

    public async Task SendMessageToRoom(string roomId, string message)
    {
        var username = Context.User?.Identity?.Name ?? "Anonymous";
        await Clients.Group(roomId).SendAsync("ReceiveMessage", username, message, DateTime.UtcNow);
    }

    public async Task SendPrivateMessage(string toUserId, string message)
    {
        var fromUsername = Context.User?.Identity?.Name ?? "Anonymous";
        await Clients.User(toUserId).SendAsync("ReceivePrivateMessage", fromUsername, message, DateTime.UtcNow);
        await Clients.Caller.SendAsync("ReceivePrivateMessage", fromUsername, message, DateTime.UtcNow);
    }

    public override async Task OnConnectedAsync()
    {
        var username = Context.User?.Identity?.Name ?? "Anonymous";
        await Clients.All.SendAsync("UserConnected", username);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var username = Context.User?.Identity?.Name ?? "Anonymous";
        await Clients.All.SendAsync("UserDisconnected", username);
        await base.OnDisconnectedAsync(exception);
    }
}