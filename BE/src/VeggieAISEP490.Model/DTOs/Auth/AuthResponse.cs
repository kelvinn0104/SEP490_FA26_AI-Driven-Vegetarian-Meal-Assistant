namespace VeggieAISEP490.Model.DTOs.Auth;

public class AuthResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = null!;
    public string? Token { get; set; }
    public string? Username { get; set; }
    public string? Email { get; set; }
}
