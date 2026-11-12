using Microsoft.EntityFrameworkCore;
using VeggieAI.Model.DTOs;
using VeggieAI.Model.Entities;
using VeggieAI.Repository.Data;
using VeggieAI.Service.Services.AI;

namespace VeggieAI.Service.Services;

public interface IHealthProfileService
{
    Task<HealthProfileDto?> GetAsync(int userId, CancellationToken ct = default);
    Task<HealthProfileDto> UpsertAsync(int userId, HealthProfileRequest req, CancellationToken ct = default);
    Task<HealthProfilePreviewDto> PreviewAsync(HealthProfileRequest req, CancellationToken ct = default);
    Task<IReadOnlyList<AllergyDto>> GetAllAllergiesAsync(CancellationToken ct = default);
    Task<IReadOnlyList<AllergyDto>> GetUserAllergiesAsync(int userId, CancellationToken ct = default);
    Task<IReadOnlyList<AllergyDto>> SetUserAllergiesAsync(int userId, IReadOnlyCollection<int> allergyIds, CancellationToken ct = default);
}

/// <summary>Hồ sơ sức khỏe: chỉ số cơ thể, mục tiêu, BMI/TDEE, mục tiêu dinh dưỡng/ngày và dị ứng.</summary>
public class HealthProfileService : IHealthProfileService
{
    /// <summary>Quá số ngày này chưa cập nhật → needsUpdate = true để FE nhắc người dùng.</summary>
    private const int UpdateReminderDays = 30;

    private readonly VeggieAIDbContext _db;

    public HealthProfileService(VeggieAIDbContext db)
    {
        _db = db;
    }

    public async Task<HealthProfileDto?> GetAsync(int userId, CancellationToken ct = default)
    {
        var p = await _db.HealthProfiles.AsNoTracking().FirstOrDefaultAsync(h => h.UserId == userId, ct);
        return p is null ? null : ToDto(p, await GetUserAllergiesAsync(userId, ct));
    }

    public async Task<HealthProfileDto> UpsertAsync(int userId, HealthProfileRequest req, CancellationToken ct = default)
    {
        ValidateAge(req.DateOfBirth);
        if (!await _db.Users.AnyAsync(u => u.Id == userId, ct)) throw AppException.NotFound("Người dùng");

        var t = await NutritionTargetsResolver.ResolveAsync(_db, req.Gender, req.DateOfBirth, req.HeightCm, req.WeightKg,
            req.ActivityLevel, req.HealthGoal, ct);

        var p = await _db.HealthProfiles.FirstOrDefaultAsync(h => h.UserId == userId, ct);
        if (p is null)
        {
            p = new HealthProfile { UserId = userId };
            _db.HealthProfiles.Add(p);
        }

        p.Gender = req.Gender;
        p.DateOfBirth = req.DateOfBirth;
        p.HeightCm = req.HeightCm;
        p.WeightKg = req.WeightKg;
        p.ActivityLevel = req.ActivityLevel;
        p.HealthGoal = req.HealthGoal;
        p.Bmi = t.Bmi;
        p.Bmr = t.Bmr;
        p.Tdee = t.Tdee;
        p.DailyKcalTarget = t.DailyKcal;
        p.ProteinTargetG = t.ProteinG;
        p.CarbTargetG = t.CarbG;
        p.FatTargetG = t.FatG;
        p.IronTargetMg = t.IronMg;
        p.B12TargetMcg = t.B12Mcg;
        p.CalciumTargetMg = t.CalciumMg;
        p.ZincTargetMg = t.ZincMg;
        p.UpdatedAt = DateTime.UtcNow;

        if (req.AllergyIds is not null) await ReplaceAllergiesAsync(userId, req.AllergyIds, ct);

        await _db.SaveChangesAsync(ct);
        return ToDto(p, await GetUserAllergiesAsync(userId, ct));
    }

    public async Task<HealthProfilePreviewDto> PreviewAsync(HealthProfileRequest req, CancellationToken ct = default)
    {
        ValidateAge(req.DateOfBirth);
        var t = await NutritionTargetsResolver.ResolveAsync(_db, req.Gender, req.DateOfBirth, req.HeightCm, req.WeightKg,
            req.ActivityLevel, req.HealthGoal, ct);
        var age = NutritionCalculator.AgeAt(req.DateOfBirth, AiMappers.TodayVn());
        return new HealthProfilePreviewDto(age, t.Bmi, NutritionTargetsResolver.BmiCategory(t.Bmi), t.Bmr, t.Tdee,
            t.ToAmounts().Rounded());
    }

    public async Task<IReadOnlyList<AllergyDto>> GetAllAllergiesAsync(CancellationToken ct = default) =>
        await _db.Allergies.AsNoTracking().OrderBy(a => a.Name).Select(a => new AllergyDto(a.Id, a.Name)).ToListAsync(ct);

    public async Task<IReadOnlyList<AllergyDto>> GetUserAllergiesAsync(int userId, CancellationToken ct = default) =>
        await _db.UserAllergies.AsNoTracking()
            .Where(ua => ua.UserId == userId)
            .OrderBy(ua => ua.Allergy!.Name)
            .Select(ua => new AllergyDto(ua.AllergyId, ua.Allergy!.Name))
            .ToListAsync(ct);

    public async Task<IReadOnlyList<AllergyDto>> SetUserAllergiesAsync(int userId, IReadOnlyCollection<int> allergyIds, CancellationToken ct = default)
    {
        await ReplaceAllergiesAsync(userId, allergyIds, ct);
        await _db.SaveChangesAsync(ct);
        return await GetUserAllergiesAsync(userId, ct);
    }

    private async Task ReplaceAllergiesAsync(int userId, IReadOnlyCollection<int> allergyIds, CancellationToken ct)
    {
        var wanted = allergyIds.Distinct().ToList();
        var existingIds = await _db.Allergies.Where(a => wanted.Contains(a.Id)).Select(a => a.Id).ToListAsync(ct);
        var unknown = wanted.Except(existingIds).ToList();
        if (unknown.Count > 0) throw new AppException("Dị ứng không tồn tại: " + string.Join(", ", unknown));

        var current = await _db.UserAllergies.Where(ua => ua.UserId == userId).ToListAsync(ct);
        _db.UserAllergies.RemoveRange(current.Where(ua => !wanted.Contains(ua.AllergyId)));
        foreach (var id in wanted.Where(id => current.All(ua => ua.AllergyId != id)))
        {
            _db.UserAllergies.Add(new UserAllergy { UserId = userId, AllergyId = id });
        }
    }

    private static void ValidateAge(DateOnly dob)
    {
        var age = NutritionCalculator.AgeAt(dob, AiMappers.TodayVn());
        if (age is < 10 or > 120) throw new AppException("Tuổi phải trong khoảng 10–120.");
    }

    private static HealthProfileDto ToDto(HealthProfile p, IReadOnlyList<AllergyDto> allergies)
    {
        var age = NutritionCalculator.AgeAt(p.DateOfBirth, AiMappers.TodayVn());
        var bmi = p.Bmi ?? 0;
        return new HealthProfileDto(
            p.Id, p.Gender, p.DateOfBirth, age,
            p.HeightCm, p.WeightKg, p.ActivityLevel, p.HealthGoal,
            bmi, NutritionTargetsResolver.BmiCategory(bmi), p.Bmr ?? 0, p.Tdee ?? 0,
            p.Targets().Rounded(), p.UpdatedAt,
            DateTime.UtcNow - p.UpdatedAt > TimeSpan.FromDays(UpdateReminderDays),
            allergies);
    }
}
