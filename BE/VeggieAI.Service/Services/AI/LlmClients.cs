using System.Diagnostics;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services.AI;

/// <summary>Provider-agnostic LLM/VLM client (Gemini or OpenAI, chosen in appsettings "Ai:Provider").</summary>
public interface ILlmClient
{
    bool IsConfigured { get; }
    Task<LlmResponse> GenerateAsync(LlmRequest request, CancellationToken ct = default);
}

/// <summary>
/// Facade used by the services: picks the provider from config, measures latency
/// and writes one row to AiModelLog per call (FR8.2 — monitoring from day one).
/// </summary>
public class LlmClient : ILlmClient
{
    private readonly AiOptions _opt;
    private readonly GeminiProvider _gemini;
    private readonly OpenAiProvider _openai;
    private readonly IServiceScopeFactory _scopes;
    private readonly ILogger<LlmClient> _log;

    public LlmClient(IOptions<AiOptions> opt, GeminiProvider gemini, OpenAiProvider openai,
        IServiceScopeFactory scopes, ILogger<LlmClient> log)
    {
        _opt = opt.Value; _gemini = gemini; _openai = openai; _scopes = scopes; _log = log;
    }

    private bool UseOpenAi => _opt.Provider.Equals("OpenAI", StringComparison.OrdinalIgnoreCase);

    public bool IsConfigured => UseOpenAi ? !string.IsNullOrWhiteSpace(_opt.OpenAI.ApiKey) : !string.IsNullOrWhiteSpace(_opt.Gemini.ApiKey);

    public async Task<LlmResponse> GenerateAsync(LlmRequest request, CancellationToken ct = default)
    {
        if (!IsConfigured)
            throw new AppException($"Chưa cấu hình API key cho AI provider '{_opt.Provider}' (appsettings: Ai:{_opt.Provider}:ApiKey).", 503);

        var sw = Stopwatch.StartNew();
        try
        {
            var (text, tokens, model) = UseOpenAi
                ? await _openai.CallAsync(request, ct)
                : await _gemini.CallAsync(request, ct);
            sw.Stop();
            var res = new LlmResponse(text, _opt.Provider, model, tokens, (int)sw.ElapsedMilliseconds);
            await LogAsync(request, res.LatencyMs, tokens, true, null);
            return res;
        }
        catch (Exception ex) when (ex is not OperationCanceledException || !ct.IsCancellationRequested)
        {
            sw.Stop();
            _log.LogWarning(ex, "LLM call failed ({Task})", request.Task);
            await LogAsync(request, (int)sw.ElapsedMilliseconds, null, false, ex.Message);
            if (ex is AppException) throw;
            throw new AppException("Dịch vụ AI đang gặp sự cố, vui lòng thử lại sau. Chi tiết: " + ex.Message, 502);
        }
    }

    private async Task LogAsync(LlmRequest req, int latency, int? tokens, bool ok, string? error)
    {
        try
        {
            using var scope = _scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<VeggieAIDbContext>();
            var modelId = await db.AiModels.Where(m => m.Type == req.Task && m.Status == "active")
                .OrderByDescending(m => m.UpdatedAt).Select(m => (int?)m.Id).FirstOrDefaultAsync();
            if (modelId is null) return;
            db.AiModelLogs.Add(new AiModelLog
            {
                ModelId = modelId.Value, UserId = req.UserId, LatencyMs = latency, TokensUsed = tokens,
                IsSuccess = ok, ErrorMessage = error?.Length > 1000 ? error[..1000] : error,
            });
            await db.SaveChangesAsync();
        }
        catch (Exception e)
        {
            _log.LogWarning(e, "Cannot write AiModelLog");
        }
    }
}

/// <summary>Google Gemini REST API (generateContent). Docs: ai.google.dev/api/generate-content</summary>
public class GeminiProvider
{
    private readonly HttpClient _http;
    private readonly AiOptions _opt;

    public GeminiProvider(HttpClient http, IOptions<AiOptions> opt)
    {
        _http = http; _opt = opt.Value;
        _http.Timeout = TimeSpan.FromSeconds(_opt.TimeoutSeconds);
    }

    public async Task<(string text, int? tokens, string model)> CallAsync(LlmRequest req, CancellationToken ct)
    {
        var g = _opt.Gemini;
        var model = req.Images.Count > 0 ? g.VisionModel : g.Model;

        var contents = new JsonArray();
        for (var i = 0; i < req.Messages.Count; i++)
        {
            var m = req.Messages[i];
            var parts = new JsonArray { new JsonObject { ["text"] = m.Content } };
            if (i == req.Messages.Count - 1 && m.Role == "user")
                foreach (var img in req.Images)
                    parts.Add(new JsonObject
                    {
                        ["inline_data"] = new JsonObject { ["mime_type"] = img.MimeType, ["data"] = Convert.ToBase64String(img.Data) },
                    });
            contents.Add(new JsonObject { ["role"] = m.Role == "assistant" ? "model" : "user", ["parts"] = parts });
        }

        var genConfig = new JsonObject
        {
            ["temperature"] = req.Temperature,
            ["maxOutputTokens"] = req.MaxOutputTokens,
        };
        if (req.JsonOutput) genConfig["responseMimeType"] = "application/json";
        if (model.Contains("2.5") && g.ThinkingBudget >= -1)
            genConfig["thinkingConfig"] = new JsonObject { ["thinkingBudget"] = g.ThinkingBudget };

        var body = new JsonObject { ["contents"] = contents, ["generationConfig"] = genConfig };
        if (!string.IsNullOrWhiteSpace(req.SystemPrompt))
            body["systemInstruction"] = new JsonObject { ["parts"] = new JsonArray { new JsonObject { ["text"] = req.SystemPrompt } } };

        using var msg = new HttpRequestMessage(HttpMethod.Post, $"{g.BaseUrl.TrimEnd('/')}/models/{model}:generateContent")
        {
            Content = JsonContent.Create(body),
        };
        msg.Headers.Add("x-goog-api-key", g.ApiKey);
        using var resp = await _http.SendAsync(msg, ct);
        var raw = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode)
            throw new HttpRequestException($"Gemini {(int)resp.StatusCode}: {Trim(raw)}");

        using var doc = JsonDocument.Parse(raw);
        var root = doc.RootElement;
        if (!root.TryGetProperty("candidates", out var cands) || cands.GetArrayLength() == 0)
            throw new HttpRequestException("Gemini trả về rỗng (có thể bị chặn bởi safety filter): " + Trim(raw));
        var cand = cands[0];
        var text = string.Concat(cand.GetProperty("content").GetProperty("parts").EnumerateArray()
            .Where(p => p.TryGetProperty("text", out _) && !(p.TryGetProperty("thought", out var th) && th.ValueKind == JsonValueKind.True))
            .Select(p => p.GetProperty("text").GetString()));
        int? tokens = root.TryGetProperty("usageMetadata", out var u) && u.TryGetProperty("totalTokenCount", out var t) ? t.GetInt32() : null;
        return (text, tokens, model);
    }

    private static string Trim(string s) => s.Length > 500 ? s[..500] : s;
}

/// <summary>OpenAI Chat Completions (also works with OpenAI-compatible servers: Groq, OpenRouter, Ollama...).</summary>
public class OpenAiProvider
{
    private readonly HttpClient _http;
    private readonly AiOptions _opt;

    public OpenAiProvider(HttpClient http, IOptions<AiOptions> opt)
    {
        _http = http; _opt = opt.Value;
        _http.Timeout = TimeSpan.FromSeconds(_opt.TimeoutSeconds);
    }

    public async Task<(string text, int? tokens, string model)> CallAsync(LlmRequest req, CancellationToken ct)
    {
        var o = _opt.OpenAI;
        var model = req.Images.Count > 0 ? o.VisionModel : o.Model;
        var messages = new JsonArray();
        if (!string.IsNullOrWhiteSpace(req.SystemPrompt))
            messages.Add(new JsonObject { ["role"] = "system", ["content"] = req.SystemPrompt });
        for (var i = 0; i < req.Messages.Count; i++)
        {
            var m = req.Messages[i];
            if (i == req.Messages.Count - 1 && m.Role == "user" && req.Images.Count > 0)
            {
                var parts = new JsonArray { new JsonObject { ["type"] = "text", ["text"] = m.Content } };
                foreach (var img in req.Images)
                    parts.Add(new JsonObject
                    {
                        ["type"] = "image_url",
                        ["image_url"] = new JsonObject { ["url"] = $"data:{img.MimeType};base64,{Convert.ToBase64String(img.Data)}" },
                    });
                messages.Add(new JsonObject { ["role"] = "user", ["content"] = parts });
            }
            else messages.Add(new JsonObject { ["role"] = m.Role, ["content"] = m.Content });
        }
        var body = new JsonObject
        {
            ["model"] = model, ["messages"] = messages,
            ["temperature"] = req.Temperature, ["max_tokens"] = req.MaxOutputTokens,
        };
        if (req.JsonOutput) body["response_format"] = new JsonObject { ["type"] = "json_object" };

        using var msg = new HttpRequestMessage(HttpMethod.Post, $"{o.BaseUrl.TrimEnd('/')}/chat/completions") { Content = JsonContent.Create(body) };
        msg.Headers.Add("Authorization", $"Bearer {o.ApiKey}");
        using var resp = await _http.SendAsync(msg, ct);
        var raw = await resp.Content.ReadAsStringAsync(ct);
        if (!resp.IsSuccessStatusCode)
            throw new HttpRequestException($"OpenAI {(int)resp.StatusCode}: {(raw.Length > 500 ? raw[..500] : raw)}");
        using var doc = JsonDocument.Parse(raw);
        var text = doc.RootElement.GetProperty("choices")[0].GetProperty("message").GetProperty("content").GetString() ?? "";
        int? tokens = doc.RootElement.TryGetProperty("usage", out var u) && u.TryGetProperty("total_tokens", out var t) ? t.GetInt32() : null;
        return (text, tokens, model);
    }
}

public static class LlmJson
{
    public static readonly JsonSerializerOptions Options = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = true,
        NumberHandling = System.Text.Json.Serialization.JsonNumberHandling.AllowReadingFromString,
    };

    /// <summary>Extracts the JSON object from a model answer (removes ```json fences / extra text).</summary>
    public static T? Parse<T>(string text)
    {
        var s = text.Trim();
        if (s.StartsWith("```"))
        {
            var nl = s.IndexOf('\n');
            s = nl >= 0 ? s[(nl + 1)..] : s;
            var end = s.LastIndexOf("```", StringComparison.Ordinal);
            if (end >= 0) s = s[..end];
        }
        var first = s.IndexOfAny(new[] { '{', '[' });
        var last = Math.Max(s.LastIndexOf('}'), s.LastIndexOf(']'));
        if (first >= 0 && last > first) s = s[first..(last + 1)];
        return JsonSerializer.Deserialize<T>(s, Options);
    }
}
