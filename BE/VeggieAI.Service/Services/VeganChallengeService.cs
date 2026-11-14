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
    Task<bool> DeleteChallengeAsync(int id);
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
        await EnsureSeedChallengesAsync();

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
        var tasksJson = request.DailyTasks != null ? JsonSerializer.Serialize(request.DailyTasks) : null;

        var challenge = new VeganChallenge
        {
            Title = request.Title.Trim(),
            Slug = slug,
            Description = request.Description.Trim(),
            DurationDays = request.DurationDays,
            Category = request.Category,
            Difficulty = request.Difficulty,
            BadgeName = string.IsNullOrWhiteSpace(request.BadgeName) ? "Hiệp Sĩ Thực Dưỡng" : request.BadgeName.Trim(),
            BadgeIcon = string.IsNullOrWhiteSpace(request.BadgeIcon) ? "military_tech" : request.BadgeIcon.Trim(),
            BannerUrl = request.BannerUrl ?? "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
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
        await _unitOfWork.CommitAsync();

        return (await GetChallengeByIdAsync(challenge.Id))!;
    }

    public async Task<VeganChallengeDto?> UpdateChallengeAsync(int id, UpdateVeganChallengeRequest request, int moderatorId)
    {
        var item = await _unitOfWork.Context.VeganChallenges.FindAsync(id);
        if (item == null) return null;

        item.Title = request.Title.Trim();
        item.Description = request.Description.Trim();
        item.DurationDays = request.DurationDays;
        item.Category = request.Category;
        item.Difficulty = request.Difficulty;
        item.BadgeName = request.BadgeName;
        item.BadgeIcon = request.BadgeIcon;
        if (!string.IsNullOrWhiteSpace(request.BannerUrl))
        {
            item.BannerUrl = request.BannerUrl;
        }
        item.Status = request.Status;
        if (request.DailyTasks != null)
        {
            item.DailyTasks = JsonSerializer.Serialize(request.DailyTasks);
        }
        item.NutritionistNote = request.NutritionistNote;
        item.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.CommitAsync();

        return (await GetChallengeByIdAsync(id))!;
    }

    public async Task<bool> DeleteChallengeAsync(int id)
    {
        var item = await _unitOfWork.Context.VeganChallenges.FindAsync(id);
        if (item == null) return false;

        _unitOfWork.Context.VeganChallenges.Remove(item);
        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<List<ChallengeCheckinDto>> GetCheckinsQueueAsync(int? challengeId = null, string? status = null, string? search = null)
    {
        await EnsureSeedChallengesAsync();

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

        return list.Select(c => new ChallengeCheckinDto
        {
            Id = c.Id,
            ChallengeId = c.ChallengeId,
            ChallengeTitle = c.Challenge?.Title ?? "Thử thách chay",
            UserId = c.UserId,
            UserName = c.User?.DisplayName ?? "Người tham gia",
            UserEmail = c.User?.Email ?? "user@veggie.vn",
            UserAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            DayNumber = c.DayNumber,
            MealTitle = c.MealTitle,
            MediaUrl = c.MediaUrl ?? "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=80",
            Notes = c.Notes,
            Status = c.Status,
            NutritionistComment = c.NutritionistComment,
            CreatedAt = c.CreatedAt.ToString("dd/MM/yyyy HH:mm"),
            ReviewedByName = c.Reviewer?.DisplayName
        }).ToList();
    }

    public async Task<bool> ReviewCheckinAsync(int checkinId, ReviewCheckinRequest request, int reviewerId)
    {
        var item = await _unitOfWork.Context.ChallengeCheckins.FindAsync(checkinId);
        if (item == null) return false;

        item.Status = request.Decision;
        item.NutritionistComment = request.NutritionistComment;
        item.ReviewedBy = reviewerId;
        item.ReviewedAt = DateTime.UtcNow;

        await _unitOfWork.CommitAsync();
        return true;
    }

    public async Task<ChallengeOverviewStatsDto> GetStatsAsync()
    {
        await EnsureSeedChallengesAsync();

        var total = await _unitOfWork.Context.VeganChallenges.CountAsync();
        var active = await _unitOfWork.Context.VeganChallenges.CountAsync(c => c.Status == "active");
        var participants = await _unitOfWork.Context.VeganChallenges.SumAsync(c => c.ParticipantsCount);
        var pendingCheckins = await _unitOfWork.Context.ChallengeCheckins.CountAsync(c => c.Status == "pending");

        var completed = await _unitOfWork.Context.VeganChallenges.SumAsync(c => c.CompletedCount);
        decimal completionRate = participants > 0 ? Math.Round((decimal)completed / participants * 100, 1) : 68.5m;

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
            BannerUrl = c.BannerUrl ?? "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
            ParticipantsCount = c.ParticipantsCount,
            CompletedCount = c.CompletedCount,
            PendingCheckinsCount = c.Checkins.Count(chk => chk.Status == "pending"),
            Status = c.Status,
            StatusLabel = MapStatusLabel(c.Status),
            DailyTasks = tasks,
            NutritionistNote = c.NutritionistNote,
            CreatedAt = c.CreatedAt.ToString("dd/MM/yyyy"),
            CreatorName = c.Creator?.DisplayName ?? "Chuyên gia Dinh dưỡng Mod"
        };
    }

    private static string MapCategoryLabel(string cat) => cat switch
    {
        "sugar_free" => "Không Đường Tinh Luyện",
        "detox" => "Thanh Lọc Cơ Thể",
        "fitness" => "Tăng Cơ Thuần Chay",
        "habit" => "Tạo Lập Thói Quen",
        _ => "Khởi Đầu Chay"
    };

    private static string MapDifficultyLabel(string diff) => diff switch
    {
        "hard" => "Thử thách Nâng cao",
        "medium" => "Mức độ Trung bình",
        _ => "Dễ tiếp cận"
    };

    private static string MapStatusLabel(string st) => st switch
    {
        "upcoming" => "Sắp diễn ra",
        "completed" => "Đã kết thúc",
        "draft" => "Bản nháp",
        _ => "Đang diễn ra"
    };

    private static string GenerateSlug(string text)
    {
        return text.ToLower()
                   .Replace(" ", "-")
                   .Replace("đ", "d")
                   .Replace("á", "a").Replace("à", "a").Replace("ả", "a").Replace("ã", "a").Replace("ạ", "a")
                   .Replace("é", "e").Replace("è", "e").Replace("ẻ", "e").Replace("ẽ", "e").Replace("ẹ", "e")
                   .Replace("í", "i").Replace("ì", "i").Replace("ỉ", "i").Replace("ĩ", "i").Replace("ị", "i")
                   .Replace("ó", "o").Replace("ò", "o").Replace("ỏ", "o").Replace("õ", "o").Replace("ọ", "o")
                   .Replace("ú", "u").Replace("ù", "u").Replace("ủ", "u").Replace("ũ", "u").Replace("ụ", "u");
    }

    private async Task EnsureSeedChallengesAsync()
    {
        if (!await _unitOfWork.Context.VeganChallenges.AnyAsync())
        {
            var mod = await _unitOfWork.Context.Users.FirstOrDefaultAsync(u => u.Role == "moderator") 
                      ?? await _unitOfWork.Context.Users.FirstOrDefaultAsync();
            var modId = mod?.Id ?? 1;

            var challenges = new List<VeganChallenge>
            {
                new()
                {
                    Title = "Thử thách 7 ngày Không Đường Tinh Luyện (7-Day Sugar-Free Vegan)",
                    Slug = "thu-thach-7-ngay-khong-duong",
                    Description = "Loại bỏ hoàn toàn đường tinh luyện và bánh kẹo công nghiệp. Thay thế bằng vị ngọt tự nhiên từ chà là, chuối chín và táo đỏ hữu cơ giúp thanh lọc vị giác và kiểm soát đường huyết.",
                    DurationDays = 7,
                    Category = "sugar_free",
                    Difficulty = "medium",
                    BadgeName = "Chiến Binh Không Đường",
                    BadgeIcon = "eco",
                    BannerUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
                    ParticipantsCount = 3840,
                    CompletedCount = 2650,
                    Status = "active",
                    DailyTasks = JsonSerializer.Serialize(new List<string>
                    {
                        "Ngày 1: Thay thế đường cà phê/trà bằng cỏ ngọt tự nhiên hoặc uống nguyên vị",
                        "Ngày 2: Uống đủ 2.2L nước ấm + 1 đĩa salad sốt chanh leo không đường",
                        "Ngày 3: Nấu canh củ sen táo đỏ thanh lọc gan thận",
                        "Ngày 4: Tự làm snack thanh năng lượng từ yến mạch và quả chà là",
                        "Ngày 5: Thay thế sốt chấm đóng chai bằng sốt tương tamari hữu cơ",
                        "Ngày 6: Thưởng thức bữa tối hoàn toàn từ rau củ luộc chấm muối mè",
                        "Ngày 7: Hoàn thành thử thách & ghi nhận cảm nhận vị giác tinh tế hơn"
                    }),
                    NutritionistNote = "Trong 3 ngày đầu bạn có thể cảm thấy hơi nhạt miệng do thói quen vị giác cũ. Hãy uống nhiều nước dừa tươi hoặc trà gạo lứt rang để bổ sung khoáng chất tự nhiên.",
                    CreatedBy = modId,
                    CreatedAt = DateTime.UtcNow.AddDays(-10),
                    UpdatedAt = DateTime.UtcNow
                },
                new()
                {
                    Title = "Thử thách 21 ngày Thuần Chay Khởi Đầu (Beginner Kickstart Camp)",
                    Slug = "thu-thach-21-ngay-thuan-chay-khoi-dau",
                    Description = "Lộ trình 3 tuần từng bước chuyển dịch sang lối sống thực vật khoa học. Đảm bảo đủ chất, không lo thiếu đạm, học cách nấu các món chay gia đình thơm ngon và lành mạnh.",
                    DurationDays = 21,
                    Category = "beginner",
                    Difficulty = "easy",
                    BadgeName = "Hiệp Sĩ Rau Xanh",
                    BadgeIcon = "military_tech",
                    BannerUrl = "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80",
                    ParticipantsCount = 5920,
                    CompletedCount = 3890,
                    Status = "active",
                    DailyTasks = JsonSerializer.Serialize(new List<string>
                    {
                        "Tuần 1: Làm quen với nguồn đạm thực vật từ Đậu hũ non, Đậu nành, Nấm",
                        "Tuần 2: Bổ sung ngũ cốc nguyên cám (Gạo lứt, Yến mạch, Diêm mạch Quinoa)",
                        "Tuần 3: Thành thạo cách kết hợp Men dinh dưỡng bổ sung Vitamin B12 mỗi ngày"
                    }),
                    NutritionistNote = "Hãy chia nhỏ các bữa ăn và lắng nghe cơ thể. Đừng ngại thử các công thức soup rau củ nấu chậm để hệ tiêu hóa hấp thu dinh dưỡng tốt nhất.",
                    CreatedBy = modId,
                    CreatedAt = DateTime.UtcNow.AddDays(-20),
                    UpdatedAt = DateTime.UtcNow
                },
                new()
                {
                    Title = "Thử thách 7 ngày Đạm Thực Vật Cho Gymer (High-Protein Vegan)",
                    Slug = "thu-thach-7-ngay-dam-thuc-vat-gymer",
                    Description = "Xóa bỏ định kiến 'ăn chay không thể tăng cơ'. Thiết kế riêng cho người yêu thể thao với chỉ tiêu nạp ít nhất 80g đạm thực vật hoàn chỉnh mỗi ngày từ Tempeh, Đậu gà, Tảo xoắn.",
                    DurationDays = 7,
                    Category = "fitness",
                    Difficulty = "hard",
                    BadgeName = "Lực Sĩ Thuần Chay",
                    BadgeIcon = "fitness_center",
                    BannerUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80",
                    ParticipantsCount = 2150,
                    CompletedCount = 1420,
                    Status = "active",
                    DailyTasks = JsonSerializer.Serialize(new List<string>
                    {
                        "Ngày 1: Nạp 30g đạm từ Tempeh áp chảo + Bông cải xanh luộc",
                        "Ngày 2: Sinh tố phục hồi sau tập (Bột protein đậu nành + Hạt chia + Chuối)",
                        "Ngày 3: Salad đậu gà Chickpeas nướng giòn rụm",
                        "Ngày 4: Mì căn Seitan xào sả ớt giàu amino acid thiết yếu",
                        "Ngày 5: Cơm gạo lứt huyết rồng ăn kèm nấm đùi gà áp chảo sốt tiêu",
                        "Ngày 6: Bổ sung 5g Tảo xoắn Spirulina vào nước ép xanh",
                        "Ngày 7: Đo lại chỉ số vòng cơ và cảm nhận độ hồi phục cơ bắp"
                    }),
                    NutritionistNote = "Đạm thực vật cần đa dạng nguồn để bù trừ axit amin giới hạn (ví dụ kết hợp Họ đậu + Ngũ cốc nguyên hạt để tạo thành Protein hoàn chỉnh).",
                    CreatedBy = modId,
                    CreatedAt = DateTime.UtcNow.AddDays(-5),
                    UpdatedAt = DateTime.UtcNow
                }
            };

            await _unitOfWork.Context.VeganChallenges.AddRangeAsync(challenges);
            await _unitOfWork.CommitAsync();

            // Seed sample check-in submissions for Mod review queue
            var user = await _unitOfWork.Context.Users.FirstOrDefaultAsync() ?? mod;
            if (user != null)
            {
                var checkins = new List<ChallengeCheckin>
                {
                    new()
                    {
                        ChallengeId = challenges[0].Id,
                        UserId = user.Id,
                        DayNumber = 3,
                        MealTitle = "Bữa trưa Ngày 3: Canh củ sen hầm táo đỏ và nấm hương không dùng hạt nêm",
                        MediaUrl = "https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80",
                        Notes = "Canh ngọt thanh tự nhiên nhờ củ sen tươi và táo hữu cơ, không cần dùng đường hay bột ngọt. Cảm thấy cơ thể rất nhẹ nhõm sau 3 ngày!",
                        Status = "pending",
                        CreatedAt = DateTime.UtcNow.AddHours(-2)
                    },
                    new()
                    {
                        ChallengeId = challenges[2].Id,
                        UserId = user.Id,
                        DayNumber = 1,
                        MealTitle = "Bữa ăn sau tập: 150g Tempeh áp chảo sốt tamari + Bông cải xanh hấp",
                        MediaUrl = "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80",
                        Notes = "Tổng đạm bữa này ước tính 32g protein thực vật, ăn rất chắc bụng và không bị cảm giác nặng nề như khi dùng ức gà trước đây.",
                        Status = "pending",
                        CreatedAt = DateTime.UtcNow.AddHours(-4)
                    }
                };

                await _unitOfWork.Context.ChallengeCheckins.AddRangeAsync(checkins);
                await _unitOfWork.CommitAsync();
            }
        }
    }
}

