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
    /// <summary>Ngắt mạch đơn giản: 3 lần lỗi hạ tầng liên tiếp → mở 60 giây (chỉ lỗi quá tải/timeout, không tính lỗi 400).</summary>
    internal static class Breaker
    {
        private const int Threshold = 3;
        private static readonly TimeSpan OpenFor = TimeSpan.FromSeconds(60);
        private static readonly object Gate = new();
        private static int _fails;
        private static DateTime _openUntil = DateTime.MinValue;

        public static bool IsOpen(out int retryInSeconds)
        {
            lock (Gate)
            {
                var left = _openUntil - DateTime.UtcNow;
                retryInSeconds = left > TimeSpan.Zero ? (int)Math.Ceiling(left.TotalSeconds) : 0;
                return left > TimeSpan.Zero;
            }
        }

        public static void Success() { lock (Gate) { _fails = 0; _openUntil = DateTime.MinValue; } }

        public static void Failure()
        {
            lock (Gate)
            {
                if (++_fails >= Threshold) { _openUntil = DateTime.UtcNow + OpenFor; _fails = 0; }
            }
        }
    }

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

        // Ngắt mạch: Gemini lỗi liên tiếp → tạm không gọi, để caller dùng thuật toán dự phòng ngay thay vì chờ timeout
        if (Breaker.IsOpen(out var retryIn))
            throw new AppException($"Trợ lý AI đang tạm quá tải, thử lại sau khoảng {retryIn} giây.", 503, "AI_CIRCUIT_OPEN");

        var sw = Stopwatch.StartNew();
        try
        {
            var (text, tokens, model) = UseOpenAi
                ? await _openai.CallAsync(request, ct)
                : await _gemini.CallAsync(request, ct);
            sw.Stop();
            Breaker.Success();
            var res = new LlmResponse(text, _opt.Provider, model, tokens, (int)sw.ElapsedMilliseconds);
            await LogAsync(request, res.LatencyMs, tokens, true, null);
            return res;
        }
        catch (Exception ex) when (ex is not OperationCanceledException || !ct.IsCancellationRequested)
        {
            sw.Stop();
            if (ex is HttpRequestException or TaskCanceledException) Breaker.Failure();
            _log.LogWarning(ex, "LLM call failed ({Task})", request.Task);
            await LogAsync(request, (int)sw.ElapsedMilliseconds, null, false, ex.Message);
            if (ex is AppException) throw;
            // Chi tiết lỗi nhà cung cấp chỉ ghi log/AiModelLog, không trả cho người dùng
            throw new AppException(ex switch
            {
                GeminiProvider.LlmUnavailableException u => $"Dịch vụ AI đang quá tải hoặc không phản hồi ({u.Summary}).",
                HttpRequestException h when System.Text.RegularExpressions.Regex.Match(h.Message, @"Gemini (\d{3})") is { Success: true } m
                    => $"Gemini từ chối yêu cầu (HTTP {m.Groups[1].Value}) — kiểm tra API key/quyền/cấu hình model.",
                _ => "Dịch vụ AI đang quá tải hoặc không phản hồi, vui lòng thử lại sau.",
            }, 502);
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

    /// <summary>Lỗi tạm thời của một model (quá tải/timeout/không tìm thấy) → chuyển sang model dự phòng.</summary>
    private sealed class TransientLlmException : Exception
    {
        public string Code { get; }
        public TransientLlmException(string code, string message) : base(message) { Code = code; }
    }

    /// <summary>Mọi model đều lỗi tạm thời. Summary chỉ gồm tên model + mã lỗi (an toàn để hiển thị).</summary>
    internal sealed class LlmUnavailableException : HttpRequestException
    {
        public string Summary { get; }
        public LlmUnavailableException(string summary, string message) : base(message) { Summary = summary; }
    }

    // ---- Tự dò model khả dụng của API key (ListModels) để chọn dự phòng đúng, tránh 404 do tên model không tồn tại ----
    private static readonly SemaphoreSlim ModelsGate = new(1, 1);
    private static (DateTime At, HashSet<string>? Names)? _modelsCache;

    private static readonly System.Text.RegularExpressions.Regex ExcludedModel = new(
        "preview|exp|image|tts|audio|live|embedding|thinking|vision|robotics|computer|customtools|8b|gemma|aqa|learnlm",
        System.Text.RegularExpressions.RegexOptions.IgnoreCase | System.Text.RegularExpressions.RegexOptions.Compiled);

    private async Task<HashSet<string>?> AvailableModelsAsync(GeminiOptions g, CancellationToken ct)
    {
        bool Fresh() => _modelsCache is { } c && DateTime.UtcNow - c.At < (c.Names is null ? TimeSpan.FromMinutes(2) : TimeSpan.FromMinutes(30));
        if (Fresh()) return _modelsCache!.Value.Names;
        await ModelsGate.WaitAsync(ct);
        try
        {
            if (Fresh()) return _modelsCache!.Value.Names;
            try
            {
                using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
                cts.CancelAfter(TimeSpan.FromSeconds(8));
                using var msg = new HttpRequestMessage(HttpMethod.Get, $"{g.BaseUrl.TrimEnd('/')}/models?pageSize=200");
                msg.Headers.Add("x-goog-api-key", g.ApiKey);
                using var resp = await _http.SendAsync(msg, cts.Token);
                if (!resp.IsSuccessStatusCode) { _modelsCache = (DateTime.UtcNow, null); return null; }
                using var doc = JsonDocument.Parse(await resp.Content.ReadAsStringAsync(cts.Token));
                var names = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
                if (doc.RootElement.TryGetProperty("models", out var arr))
                    foreach (var m in arr.EnumerateArray())
                    {
                        var ok = m.TryGetProperty("supportedGenerationMethods", out var sm)
                                 && sm.EnumerateArray().Any(x => x.GetString() == "generateContent");
                        if (ok && m.TryGetProperty("name", out var n) && n.GetString() is { } name)
                            names.Add(name.StartsWith("models/") ? name[7..] : name);
                    }
                _modelsCache = (DateTime.UtcNow, names.Count > 0 ? names : null);
                return _modelsCache.Value.Names;
            }
            catch (Exception) when (!ct.IsCancellationRequested)
            {
                _modelsCache = (DateTime.UtcNow, null);
                return null;
            }
        }
        finally { ModelsGate.Release(); }
    }

    /// <summary>Model chính + dự phòng cấu hình (chỉ giữ tên có thật) + tự thêm các model Flash/Flash-Lite ổn định khác, tối đa 4 model.</summary>
    private async Task<List<string>> BuildModelChainAsync(GeminiOptions g, string primary, CancellationToken ct)
    {
        var available = await AvailableModelsAsync(g, ct);
        var chain = new List<string> { primary };
        void Add(string m) { if (!string.IsNullOrWhiteSpace(m) && !chain.Contains(m, StringComparer.OrdinalIgnoreCase)) chain.Add(m); }

        foreach (var m in g.FallbackModels)
            if (available is null || available.Contains(m)) Add(m);
        if (available is not null)
        {
            foreach (var m in available
                         .Where(n => n.StartsWith("gemini-", StringComparison.OrdinalIgnoreCase) && n.Contains("flash", StringComparison.OrdinalIgnoreCase) && !ExcludedModel.IsMatch(n))
                         .OrderBy(n => n.Contains("lite", StringComparison.OrdinalIgnoreCase) ? 0 : 1)
                         .ThenBy(n => n.Contains("latest", StringComparison.OrdinalIgnoreCase) ? 1 : 0)
                         .ThenByDescending(n => n, StringComparer.OrdinalIgnoreCase))
                Add(m);
        }
        return chain.Take(4).ToList();
    }

    public async Task<(string text, int? tokens, string model)> CallAsync(LlmRequest req, CancellationToken ct)
    {
        var g = _opt.Gemini;
        var primary = req.Images.Count > 0 ? g.VisionModel : g.Model;
        var models = await BuildModelChainAsync(g, primary, ct);

        var codes = new List<string>();
        string? lastMsg = null;
        for (var i = 0; i < models.Count; i++)
        {
            try { return await CallModelAsync(req, g, models[i], retryOnOverload: i == 0, ct); }
            catch (TransientLlmException ex) { codes.Add($"{models[i]}: {ex.Code}"); lastMsg = ex.Message; }
        }
        throw new LlmUnavailableException(string.Join("; ", codes), $"Tất cả model Gemini đều không khả dụng ({string.Join("; ", codes)}). Lỗi cuối: {lastMsg}");
    }

    private async Task<(string text, int? tokens, string model)> CallModelAsync(LlmRequest req, GeminiOptions g, string model,
        bool retryOnOverload, CancellationToken ct)
    {
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
        // Gemini 2.5: thinkingBudget; Gemini 3+/"*-latest": thinkingLevel. Model không hỗ trợ → gọi lại không kèm cấu hình suy nghĩ.
        if (model.Contains("2.5") && g.ThinkingBudget >= -1)
            genConfig["thinkingConfig"] = new JsonObject { ["thinkingBudget"] = g.ThinkingBudget };
        else if (!string.IsNullOrWhiteSpace(g.ThinkingLevel) && !model.Contains("lite", StringComparison.OrdinalIgnoreCase))
            genConfig["thinkingConfig"] = new JsonObject { ["thinkingLevel"] = g.ThinkingLevel.Trim().ToLowerInvariant() };

        var body = new JsonObject { ["contents"] = contents, ["generationConfig"] = genConfig };
        if (!string.IsNullOrWhiteSpace(req.SystemPrompt))
            body["systemInstruction"] = new JsonObject { ["parts"] = new JsonArray { new JsonObject { ["text"] = req.SystemPrompt } } };

        async Task<(int status, string raw)> PostTimedAsync()
        {
            // Mỗi lần gọi có timeout riêng (ngắn hơn HttpClient.Timeout) để model treo thì chuyển model dự phòng sớm
            using var cts = CancellationTokenSource.CreateLinkedTokenSource(ct);
            cts.CancelAfter(TimeSpan.FromSeconds(Math.Max(5, g.AttemptTimeoutSeconds)));
            try { return await PostAsync(g, model, body, cts.Token); }
            catch (OperationCanceledException) when (!ct.IsCancellationRequested)
            {
                throw new TransientLlmException("hết thời gian chờ", $"{model}: quá thời gian chờ {g.AttemptTimeoutSeconds}s");
            }
            catch (HttpRequestException ex) { throw new TransientLlmException("lỗi kết nối", $"{model}: {ex.Message}"); }
        }

        var (status, raw) = await PostTimedAsync();
        if (status == 503 && retryOnOverload)
        {
            await Task.Delay(TimeSpan.FromSeconds(1.5), ct);
            (status, raw) = await PostTimedAsync();
        }
        if (status == 400 && genConfig.ContainsKey("thinkingConfig") && raw.Contains("thinking", StringComparison.OrdinalIgnoreCase))
        {
            genConfig.Remove("thinkingConfig");
            (status, raw) = await PostTimedAsync();
        }
        if (status is 429 or 404 or 408 or >= 500)
            throw new TransientLlmException(status.ToString(), $"{model}: HTTP {status} {Trim(raw)}");
        if (status is < 200 or >= 300)
            throw new HttpRequestException($"Gemini {status}: {Trim(raw)}");

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

    private async Task<(int status, string raw)> PostAsync(GeminiOptions g, string model, JsonObject body, CancellationToken ct)
    {
        using var msg = new HttpRequestMessage(HttpMethod.Post, $"{g.BaseUrl.TrimEnd('/')}/models/{model}:generateContent")
        {
            Content = new StringContent(body.ToJsonString(), System.Text.Encoding.UTF8, "application/json"),
        };
        msg.Headers.Add("x-goog-api-key", g.ApiKey);
        using var resp = await _http.SendAsync(msg, ct);
        return ((int)resp.StatusCode, await resp.Content.ReadAsStringAsync(ct));
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
