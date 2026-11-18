using Microsoft.EntityFrameworkCore;
using VeggieAI.Repository.Data;

namespace VeggieAI.Service.Services;

/// <summary>
/// Chấm điểm báo cáo theo số lượng người báo cáo và độ uy tín của họ (tuổi tài khoản).
/// Điểm của một nội dung = tổng trọng số của các người báo cáo khác nhau có báo cáo đang mở.
/// Chống lạm dụng: tài khoản mới (spam/clone) có trọng số rất thấp, cần nhiều tài khoản lâu năm hơn để vượt ngưỡng.
/// </summary>
public static class ReportScoring
{
    /// <summary>Đạt ngưỡng này → nội dung tự bị ẩn tạm thời chờ moderator xem.</summary>
    public const double AutoFlagThreshold = 5.0;
    public const double HighPriority = 5.0;
    public const double MediumPriority = 2.5;

    public static double ReporterWeight(DateTime accountCreatedAtUtc, DateTime? nowUtc = null)
    {
        var days = ((nowUtc ?? DateTime.UtcNow) - accountCreatedAtUtc).TotalDays;
        return days switch
        {
            < 1 => 0.2,
            < 7 => 0.5,
            < 30 => 1.0,
            < 90 => 1.5,
            < 365 => 2.0,
            _ => 2.5,
        };
    }

    public static string Priority(double score) =>
        score >= HighPriority ? "high" : score >= MediumPriority ? "medium" : "low";

    public record TargetScore(int ReportCount, double Score)
    {
        public string Priority => ReportScoring.Priority(Score);
    }

    public static async Task<TargetScore> ScoreAsync(VeggieAIDbContext db, string targetType, int targetId, CancellationToken ct)
    {
        var reporters = await db.Reports.AsNoTracking()
            .Where(r => r.TargetType == targetType && r.TargetId == targetId && r.Status == "open")
            .Select(r => new { r.ReporterId, r.Reporter!.CreatedAt })
            .ToListAsync(ct);
        var distinct = reporters.GroupBy(r => r.ReporterId).Select(g => g.First()).ToList();
        var score = Math.Round(distinct.Sum(r => ReporterWeight(r.CreatedAt)), 2);
        return new TargetScore(distinct.Count, score);
    }
}
