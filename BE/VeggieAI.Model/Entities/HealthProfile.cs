using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace VeggieAI.Model.Entities;

[Table("HealthProfile", Schema = "veggieai")]
public class HealthProfile
{
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }

    [Required]
    public int UserId { get; set; }

    [Required]
    [MaxLength(10)]
    public string Gender { get; set; } = "female"; // 'male', 'female'

    [Required]
    public DateOnly DateOfBirth { get; set; }

    [Required]
    [Column(TypeName = "numeric(5,1)")]
    public decimal HeightCm { get; set; }

    [Required]
    [Column(TypeName = "numeric(5,1)")]
    public decimal WeightKg { get; set; }

    [Required]
    [MaxLength(20)]
    public string ActivityLevel { get; set; } = "moderate"; // 'sedentary', 'light', 'moderate', 'active', 'very_active'

    [Required]
    [MaxLength(20)]
    public string HealthGoal { get; set; } = "maintain"; // 'loss', 'gain', 'maintain'

    [Column(TypeName = "numeric(5,2)")]
    public decimal? Bmi { get; set; }

    [Column(TypeName = "numeric(7,2)")]
    public decimal? Bmr { get; set; }

    [Column(TypeName = "numeric(7,2)")]
    public decimal? Tdee { get; set; }

    [Column(TypeName = "numeric(7,2)")]
    public decimal? DailyKcalTarget { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? ProteinTargetG { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? CarbTargetG { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? FatTargetG { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? IronTargetMg { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? B12TargetMcg { get; set; }

    [Column(TypeName = "numeric(7,2)")]
    public decimal? CalciumTargetMg { get; set; }

    [Column(TypeName = "numeric(6,2)")]
    public decimal? ZincTargetMg { get; set; }

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [ForeignKey(nameof(UserId))]
    public virtual User? User { get; set; }
}
