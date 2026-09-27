using System.ComponentModel.DataAnnotations;

namespace VeggieAISEP490.Model.DTOs.Auth;

public class RegisterRequest
{
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = null!;
    
    [Required]
    [EmailAddress]
    [MaxLength(100)]
    public string Email { get; set; } = null!;
    
    [Required]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters long")]
    public string Password { get; set; } = null!;
    
    [MaxLength(100)]
    public string? FullName { get; set; }
}
