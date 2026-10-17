namespace VeggieAI.Infrastructure.AI;

public class AiOptions
{
    public const string Section = "Ai";

    /// <summary>"Gemini" (default, free tier) or "OpenAI" (or any OpenAI-compatible endpoint).</summary>
    public string Provider { get; set; } = "Gemini";
    public int TimeoutSeconds { get; set; } = 90;
    public GeminiOptions Gemini { get; set; } = new();
    public OpenAiOptions OpenAI { get; set; } = new();
}

public class GeminiOptions
{
    public string ApiKey { get; set; } = "";
    public string BaseUrl { get; set; } = "https://generativelanguage.googleapis.com/v1beta";
    public string Model { get; set; } = "gemini-3.8-flash";
    public string VisionModel { get; set; } = "gemini-3.8-flash";
    /// <summary>0 = disable "thinking" on 2.5 models (faster, cheaper); -1 = dynamic.</summary>
    public int ThinkingBudget { get; set; } = 0;
}

public class OpenAiOptions
{
    public string ApiKey { get; set; } = "";
    public string BaseUrl { get; set; } = "https://api.openai.com/v1";
    public string Model { get; set; } = "gpt-4o-mini";
    public string VisionModel { get; set; } = "gpt-4o-mini";
}
