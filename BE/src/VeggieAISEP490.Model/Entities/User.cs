using System.ComponentModel.DataAnnotations;

namespace VeggieAISEP490.Model.Entities;

public class User
{
    [Key]
    public int Id { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = null!;
    
    [Required]
    [MaxLength(100)]
    [EmailAddress]
    public string Email { get; set; } = null!;
    
    [Required]
    public string PasswordHash { get; set; } = null!;
    
    [MaxLength(100)]
    public string? FullName { get; set; }
}
