namespace VeggieAI.Application.Interfaces;

public class DetectedIngredientDto
{
    public string Name { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string FreshnessStatus { get; set; } = "Fresh"; // Fresh, Moderate, Use Soon
}

public class VisionDetectionResultDto
{
    public List<DetectedIngredientDto> DetectedIngredients { get; set; } = new();
    public List<string> SuggestedRecipeTitles { get; set; } = new();
}

public interface IComputerVisionService
{
    Task<VisionDetectionResultDto> DetectIngredientsFromImageAsync(byte[] imageBytes);
}
