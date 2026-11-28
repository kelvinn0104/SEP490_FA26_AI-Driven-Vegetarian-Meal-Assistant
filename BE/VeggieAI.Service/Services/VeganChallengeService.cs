using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Repositories;

namespace VeggieAI.Service.Services;

public interface IVeganChallengeService
{
    Task<List<VeganChallengeDto>> GetChallengesAsync(string? status = null, string? category = null, string? difficulty = null, string? search = null);
    Task<VeganChallengeDto?> GetChallengeByIdAsync(int id);
    Task<VeganChallengeDto> CreateChallengeAsync(CreateVeganChallengeRequest request, int moderatorId);
    Task<VeganChallengeDto?> UpdateChallengeAsync(int id, UpdateVeganChallengeRequest request, int moderatorId);
    Task<bool> DeleteChallengeAsync(int id, int moderatorId);
    Task<ChallengeCheckinDto?> SubmitCheckinAsync(int challengeId, CreateChallengeCheckinRequest request, int userId);
    Task<List<ChallengeCheckinDto>> GetCheckinsQueueAsync(int? challengeId = null, string? status = null, string? search = null);
    Task<bool> ReviewCheckinAsync(int checkinId, ReviewCheckinRequest request, int reviewerId);
    Task<ChallengeOverviewStatsDto> GetStatsAsync();
}

public class VeganChallengeService : IVeganChallengeService
{
    private readonly IUnitOfWork _unitOfWork;

    public VeganChallengeService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<List<VeganChallengeDto>> GetChallengesAsync(string? status = null, string? category = null, string? difficulty = null, string? search = null)
    {
        var query = _unitOfWork.Context.VeganChallenges
            .Include(c => c.Creator)
            .Include(c => c.Checkins)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(c => c.Status.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(category) && category != "all")
        {
            query = query.Where(c => c.Category.ToLower() == category.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(difficulty) && difficulty != "all")
        {
            query = query.Where(c => c.Difficulty.ToLower() == difficulty.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c => c.Title.ToLower().Contains(s) || c.Description.ToLower().Contains(s));
        }

        var list = await query.OrderByDescending(c => c.CreatedAt).ToListAsync();
        return list.Select(MapToDto).ToList();
    }

    public async Task<VeganChallengeDto?> GetChallengeByIdAsync(int id)
    {
        var item = await _unitOfWork.Context.VeganChallenges
            .Include(c => c.Creator)
            .Include(c => c.Checkins)
            .FirstOrDefaultAsync(c => c.Id == id);

        return item == null ? null : MapToDto(item);
    }

    public async Task<VeganChallengeDto> CreateChallengeAsync(CreateVeganChallengeRequest request, int moderatorId)
    {
        var slug = GenerateSlug(request.Title);
        var tasksJson = request.DailyTasks != null ? JsonSerializer.Serialize(request.DailyTasks) : "[]";

        var challenge = new VeganChallenge
        {
            Title = request.Title.Trim(),
            Slug = slug,
            Description = request.Description.Trim(),
            DurationDays = Math.Clamp(request.DurationDays, 3, 90),
            Category = request.Category,
            Difficulty = request.Difficulty,
            BadgeName = string.IsNullOrWhiteSpace(request.BadgeName) ? "Hiệp Sĩ Thực Dưỡng" : request.BadgeName.Trim(),
            BadgeIcon = string.IsNullOrWhiteSpace(request.BadgeIcon) ? "military_tech" : request.BadgeIcon.Trim(),
            BannerUrl = string.IsNullOrWhiteSpace(request.BannerUrl) ? null : request.BannerUrl.Trim(),
            Status = request.Status,
            DailyTasks = tasksJson,
            NutritionistNote = request.NutritionistNote,
            CreatedBy = moderatorId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            ParticipantsCount = 0,
            CompletedCount = 0
        };

        await _unitOfWork.Context.VeganChallenges.AddAsync(challenge);
        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = moderatorId,
            Action = "Tạo thử thách chay",
            Target = challenge.Title,
            Details = $"Tạo thử thách '{challenge.Title}' ({challenge.DurationDays} ngày)",
            LogType = "moderation"
        });
        await _unitOfWork.CommitAsync();

        return (await GetChallengeByIdAsync(challenge.Id))!;
    }

    public async Task<VeganChallengeDto?> UpdateChallengeAsync(int id, UpdateVeganChallengeRequest request, int moderatorId)
    {
        var item = await _unitOfWork.Context.VeganChallenges.FindAsync(id);
        if (item == null) return null;

        item.Title = request.Title.Trim();
        item.Slug = GenerateSlug(request.Title);
        item.Description = request.Description.Trim();
        item.DurationDays = Math.Clamp(request.DurationDays, 3, 90);
        item.Category = request.Category;
        item.Difficulty = request.Difficulty;
        item.BadgeName = request.BadgeName;
        item.BadgeIcon = request.BadgeIcon;
        item.BannerUrl = string.IsNullOrWhiteSpace(request.BannerUrl) ? item.BannerUrl : request.BannerUrl.Trim();
        item.Status = request.Status;
        if (request.DailyTasks != null)
        {
            item.DailyTasks = JsonSerializer.Serialize(request.DailyTasks);
        }
        item.NutritionistNote = request.NutritionistNote;
        item.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = moderatorId,
            Action = "Cập nhật thử thách chay",
            Target = item.Title,
            Details = $"Cập nhật thử thách #{id}",
            LogType = "moderation"
        });
        await _unitOfWork.CommitAsync();

        return (await GetChallengeByIdAsync(id))!;
    }

    public async Task<bool> DeleteChallengeAsync(int id, int moderatorId)
    {
        var item = await _unitOfWork.Context.VeganChallenges.FindAsync(id);
        if (item == null) return false;

        _unitOfWork.Context.VeganChallenges.Remove(item);
        await _unitOfWork.Context.SystemLogs.AddAsync(new SystemLog
        {
            UserId = moderatorId,
            Action = "Xóa thử thách chay",
            Target = item.Title,
            Details = $"Đã xóa thử thách #{id}",
            LogType = "moderation"
        });
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<ChallengeCheckinDto?> SubmitCheckinAsync(int challengeId, CreateChallengeCheckinRequest request, int userId)
    {
        var challenge = await _unitOfWork.Context.VeganChallenges.FindAsync(challengeId);
        if (challenge == null || challenge.Status != "active") return null;

        var user = await _unitOfWork.Context.Users.FindAsync(userId);
        var uName = user?.DisplayName ?? "Người tham gia";

        var checkin = new ChallengeCheckin
        {
            ChallengeId = challengeId,
            UserId = userId,
            DayNumber = Math.Clamp(request.DayNumber, 1, challenge.DurationDays),
            MealTitle = request.MealTitle.Trim(),
            MediaUrl = string.IsNullOrWhiteSpace(request.MediaUrl) ? null : request.MediaUrl.Trim(),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            Status = "pending",
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Context.ChallengeCheckins.AddAsync(checkin);
        await _unitOfWork.CommitAsync();

        return new ChallengeCheckinDto
        {
            Id = checkin.Id,
            ChallengeId = challenge.Id,
            ChallengeTitle = challenge.Title,
            UserId = userId,
            UserName = uName,
            UserEmail = user?.Email ?? string.Empty,
            UserAvatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(uName)}&background=006948&color=ffffff",
            DayNumber = checkin.DayNumber,
            MealTitle = checkin.MealTitle,
            MediaUrl = checkin.MediaUrl,
            Notes = checkin.Notes,
            Status = checkin.Status,
            CreatedAt = checkin.CreatedAt.ToString("dd/MM/yyyy HH:mm")
        };
    }

    public async Task<List<ChallengeCheckinDto>> GetCheckinsQueueAsync(int? challengeId = null, string? status = null, string? search = null)
    {
        var query = _unitOfWork.Context.ChallengeCheckins
            .Include(c => c.Challenge)
            .Include(c => c.User)
            .Include(c => c.Reviewer)
            .AsQueryable();

        if (challengeId.HasValue && challengeId.Value > 0)
        {
            query = query.Where(c => c.ChallengeId == challengeId.Value);
        }

        if (!string.IsNullOrWhiteSpace(status) && status != "all")
        {
            query = query.Where(c => c.Status.ToLower() == status.Trim().ToLower());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(c =>
                c.MealTitle.ToLower().Contains(s) ||
                (c.User != null && c.User.DisplayName.ToLower().Contains(s)) ||
                (c.Challenge != null && c.Challenge.Title.ToLower().Contains(s)));
        }

        var list = await query.OrderBy(c => c.Status == "pending" ? 0 : 1)
                              .ThenByDescending(c => c.CreatedAt)
                              .ToListAsync();

        return list.Select(c =>
        {
            var uName = c.User?.DisplayName ?? "Người tham gia";
            return new ChallengeCheckinDto
            {
                Id = c.Id,
                ChallengeId = c.ChallengeId,
                ChallengeTitle = c.Challenge?.Title ?? "Thử thách chay",
                UserId = c.UserId,
                UserName = uName,
                UserEmail = c.User?.Email ?? string.Empty,
                UserAvatar = $"https://ui-avatars.com/api/?name={Uri.EscapeDataString(uName)}&background=006948&color=ffffff",
                DayNumber = c.DayNumber,
                MealTitle = c.MealTitle,
                MediaUrl = c.MediaUrl,
                Notes = c.Notes,
                Status = c.Status,
                NutritionistComment = c.NutritionistComment,
                CreatedAt = c.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
                ReviewedByName = c.Reviewer?.DisplayName
            };
        }).ToList();
    }

    public async Task<bool> ReviewCheckinAsync(int checkinId, ReviewCheckinRequest request, int reviewerId)
    {
        var item = await _unitOfWork.Context.ChallengeCheckins
            .Include(c => c.Challenge)
            .FirstOrDefaultAsync(c => c.Id == checkinId);
        if (item == null) return false;

        var prevStatus = item.Status;
        item.Status = request.Decision == "rejected" ? "rejected" : "approved";
        item.NutritionistComment = request.NutritionistComment;
        item.ReviewedBy = reviewerId;
        item.ReviewedAt = DateTime.UtcNow;

        if (prevStatus != "approved" && item.Status == "approved" && item.Challenge != null)
        {
            var distinctApprovedUsers = await _unitOfWork.Context.ChallengeCheckins
                .Where(x => x.ChallengeId == item.ChallengeId && (x.Status == "approved" || x.Id == item.Id))
                .Select(x => x.UserId)
                .Distinct()
                .CountAsync();
            item.Challenge.ParticipantsCount = Math.Max(item.Challenge.ParticipantsCount, distinctApprovedUsers);
            if (item.DayNumber >= item.Challenge.DurationDays)
            {
                item.Challenge.CompletedCount += 1;
            }
        }

        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<ChallengeOverviewStatsDto> GetStatsAsync()
    {
        var total = await _unitOfWork.Context.VeganChallenges.CountAsync();
        var active = await _unitOfWork.Context.VeganChallenges.CountAsync(c => c.Status == "active");
        var participants = await _unitOfWork.Context.VeganChallenges.SumAsync(c => c.ParticipantsCount);
        var pendingCheckins = await _unitOfWork.Context.ChallengeCheckins.CountAsync(c => c.Status == "pending");
        var completed = await _unitOfWork.Context.VeganChallenges.SumAsync(c => c.CompletedCount);

        decimal completionRate = participants > 0
            ? Math.Round((decimal)completed / participants * 100m, 1)
            : 0m;

        return new ChallengeOverviewStatsDto
        {
            TotalChallenges = total,
            ActiveChallenges = active,
            TotalParticipants = participants,
            PendingCheckins = pendingCheckins,
            AvgCompletionRate = completionRate
        };
    }

    private static VeganChallengeDto MapToDto(VeganChallenge c)
    {
        var tasks = new List<string>();
        if (!string.IsNullOrWhiteSpace(c.DailyTasks))
        {
            try
            {
                tasks = JsonSerializer.Deserialize<List<string>>(c.DailyTasks) ?? new();
            }
            catch { }
        }

        return new VeganChallengeDto
        {
            Id = c.Id,
            Title = c.Title,
            Slug = c.Slug,
            Description = c.Description,
            DurationDays = c.DurationDays,
            Category = c.Category,
            CategoryLabel = MapCategoryLabel(c.Category),
            Difficulty = c.Difficulty,
            DifficultyLabel = MapDifficultyLabel(c.Difficulty),
            BadgeName = c.BadgeName,
            BadgeIcon = c.BadgeIcon,
            BannerUrl = c.BannerUrl,
            ParticipantsCount = c.ParticipantsCount,
            CompletedCount = c.CompletedCount,
            PendingCheckinsCount = c.Checkins?.Count(ch => ch.Status == "pending") ?? 0,
            Status = c.Status,
            StatusLabel = MapStatusLabel(c.Status),
            DailyTasks = tasks,
            NutritionistNote = c.NutritionistNote,
            CreatedAt = c.CreatedAt.ToString("dd/MM/yyyy"),
            CreatorName = c.Creator?.DisplayName ?? "Điều phối viên (Mod)"
        };
    }

    private static string MapCategoryLabel(string category) => category switch
    {
        "beginner" => "Khởi đầu Chay",
        "detox" => "Thanh lọc Xanh",
        "fitness" => "Đạm Cao & Thể Thao",
        "sugar_free" => "Giảm Đường Tinh Luyện",
        _ => "Thói Quen Sống Khỏe"
    };

    private static string MapDifficultyLabel(string diff) => diff switch
    {
        "easy" => "Dễ tiếp cận",
        "medium" => "Trung bình",
        "hard" => "Nâng cao",
        _ => "Tiêu chuẩn"
    };

    private static string MapStatusLabel(string status) => status switch
    {
        "active" => "Đang diễn ra",
        "upcoming" => "Sắp mở",
        "completed" => "Đã kết thúc",
        _ => "Bản nháp"
    };

    private static string GenerateSlug(string title)
    {
        return title.Trim().ToLowerInvariant()
            .Replace(" ", "-")
            .Replace("&", "va")
            .Replace("/", "-");
    }
}
