namespace VeggieAI.Application.Interfaces;

public record LlmImage(byte[] Data, string MimeType);

public record LlmMessage(string Role, string Content)   // Role: "user" | "assistant"
{
    public static LlmMessage User(string c) => new("user", c);
    public static LlmMessage Assistant(string c) => new("assistant", c);
}

public class LlmRequest
{
    public string? SystemPrompt { get; set; }
    public List<LlmMessage> Messages { get; set; } = new();
    /// <summary>Images attached to the LAST user message (vision models).</summary>
    public List<LlmImage> Images { get; set; } = new();
    /// <summary>Ask the provider for a pure JSON answer.</summary>
    public bool JsonOutput { get; set; }
    public double Temperature { get; set; } = 0.4;
    public int MaxOutputTokens { get; set; } = 4096;
    /// <summary>meal_planner | chatbot | vision — chooses the model configured for that task and the AiModel row to log to.</summary>
    public string Task { get; set; } = "chatbot";
    public int? UserId { get; set; }
}

public record LlmResponse(string Text, string Provider, string Model, int? TokensUsed, int LatencyMs);

/// <summary>Provider-agnostic LLM/VLM client (Gemini or OpenAI, chosen in appsettings "Ai:Provider").</summary>
public interface ILlmClient
{
    bool IsConfigured { get; }
    Task<LlmResponse> GenerateAsync(LlmRequest request, CancellationToken ct = default);
}
