using System.Text.RegularExpressions;

namespace VeggieAI.Service.Services;

public record PreScreenResult(string Label, decimal Confidence, string RiskLevel, string Note);

/// <summary>
/// Sàng lọc rủi ro bài viết trước khi moderator duyệt (rule-based, chạy tức thì, không gọi dịch vụ ngoài).
/// Chỉ để xếp ưu tiên hàng đợi — không bao giờ tự đăng hay tự gỡ bài (người duyệt quyết định).
/// </summary>
public static class ContentPreScreen
{
    private static readonly Regex Link = new(@"https?://", RegexOptions.IgnoreCase | RegexOptions.Compiled);
    private static readonly string[] SpamWords =
    {
        "giảm cân cấp tốc", "kiếm tiền", "cam kết hiệu quả 100%", "liên hệ zalo", "inbox", "mua ngay", "khuyến mãi sốc", "hàng chính hãng giá rẻ",
    };
    private static readonly string[] MedicalClaims =
    {
        "chữa khỏi", "chữa bệnh", "điều trị ung thư", "thay thế thuốc", "bỏ thuốc", "chữa tiểu đường", "khỏi hẳn",
    };
    private static readonly string[] NonVegan =
    {
        "thịt bò", "thịt heo", "thịt gà", "cá hồi", "tôm", "mực", "trứng", "sữa tươi", "nước mắm",
    };

    public static PreScreenResult Score(string title, string? content, string? mediaUrl)
    {
        var text = $"{title}\n{content}".ToLowerInvariant();
        var notes = new List<string>();
        var points = 0;

        var links = Link.Matches(text).Count;
        if (links >= 3) { points += 2; notes.Add("nhiều liên kết ngoài"); }
        else if (links >= 1 && !string.IsNullOrEmpty(content) && content.Length < 120) { points += 1; notes.Add("liên kết trong bài rất ngắn"); }

        if (SpamWords.Any(text.Contains)) { points += 2; notes.Add("từ khóa quảng cáo/spam"); }
        if (MedicalClaims.Any(text.Contains)) { points += 2; notes.Add("tuyên bố y tế cần kiểm chứng"); }

        // Không có "nấu món có thịt/cá" làm vi phạm — chỉ nhắc moderator kiểm tra tiêu chuẩn thuần chay
        var nonVegan = NonVegan.Where(w => Regex.IsMatch(text, $@"(?<![\p{{L}}]){Regex.Escape(w)}(?![\p{{L}}])")).Take(3).ToList();
        if (nonVegan.Count > 0 && !text.Contains("chay") && !text.Contains("thuần thực vật"))
        {
            points += 1;
            notes.Add($"nhắc đến nguyên liệu không chay ({string.Join(", ", nonVegan)})");
        }

        if (mediaUrl is not null && !mediaUrl.StartsWith("https://", StringComparison.OrdinalIgnoreCase) && !mediaUrl.StartsWith("/uploads/", StringComparison.Ordinal))
        {
            points += 1;
            notes.Add("liên kết media không dùng HTTPS");
        }

        var (risk, label, confidence) = points switch
        {
            0 => ("low", "ok", 0.90m),
            1 => ("medium", "review", 0.70m),
            _ => ("high", "suspicious", 0.85m),
        };
        return new PreScreenResult(label, confidence, risk,
            notes.Count == 0 ? "Sàng lọc tự động: chưa thấy dấu hiệu bất thường." : "Sàng lọc tự động: " + string.Join("; ", notes) + ".");
    }
}
