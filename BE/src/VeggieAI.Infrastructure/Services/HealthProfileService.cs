using Microsoft.EntityFrameworkCore;
using VeggieAI.Application.Common;
using VeggieAI.Application.DTOs;
using VeggieAI.Application.Interfaces;
using VeggieAI.Application.Nutrition;
using VeggieAI.Domain.Entities;
using VeggieAI.Infrastructure.Common;
using VeggieAI.Infrastructure.Persistence;

namespace VeggieAI.Infrastructure.Services;

public class HealthProfileService : IHealthProfileService
{
    private readonly VeggieAiDbContext _db;
    public HealthProfileService(VeggieAiDbContext db) => _db = db;

    public async Task<HealthProfileDto?> GetAsync(int userId, CancellationToken ct = default)
    {
        var p = await _db.HealthProfiles.AsNoTracking().FirstOrDefaultAsync(h => h.UserId == userId, ct);
        return p is null ? null : await ToDtoAsync(p, ct);
    }

    public async Task<HealthProfileDto> UpsertAsync(int userId, HealthProfileRequest req, CancellationToken ct = default)
    {
        Validate(req);
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
        p.UpdatedAt = DateTime.UtcNow;
        await _db.ApplyTargetsAsync(p, ct);

        if (req.AllergyIds is not null)
            await SetAllergiesInternalAsync(userId, req.AllergyIds, ct);

        await _db.SaveChangesAsync(ct);
        return await ToDtoAsync(p, ct);
    }

    public async Task<NutrientAmountsDto> PreviewAsync(HealthProfileRequest req, CancellationToken ct = default)
    {
        Validate(req);
        var t = await _db.CalculateTargetsAsync(req.Gender, req.DateOfBirth, req.HeightCm, req.WeightKg,
            req.ActivityLevel, req.HealthGoal, ct);
        return new NutrientAmountsDto(t.DailyKcal, t.ProteinG, t.CarbG, t.FatG, t.IronMg, t.B12Mcg, t.CalciumMg, t.ZincMg);
    }

    public async Task<IReadOnlyList<AllergyDto>> GetMyAllergiesAsync(int userId, CancellationToken ct = default) =>
        await _db.Users.Where(u => u.Id == userId).SelectMany(u => u.Allergies)
            .OrderBy(a => a.Name).Select(a => new AllergyDto(a.Id, a.Name)).ToListAsync(ct);

    public async Task<IReadOnlyList<AllergyDto>> SetMyAllergiesAsync(int userId, List<int> allergyIds, CancellationToken ct = default)
    {
        await SetAllergiesInternalAsync(userId, allergyIds, ct);
        await _db.SaveChangesAsync(ct);
        return await GetMyAllergiesAsync(userId, ct);
    }

    private async Task SetAllergiesInternalAsync(int userId, List<int> allergyIds, CancellationToken ct)
    {
        var user = await _db.Users.Include(u => u.Allergies).FirstOrDefaultAsync(u => u.Id == userId, ct)
                   ?? throw AppException.NotFound("Người dùng");
        var ids = allergyIds.Distinct().ToList();
        var allergies = await _db.Allergies.Where(a => ids.Contains(a.Id)).ToListAsync(ct);
        if (allergies.Count != ids.Count) throw new AppException("Có mã dị ứng không hợp lệ.");
        user.Allergies.Clear();
        foreach (var a in allergies) user.Allergies.Add(a);
    }

    private static void Validate(HealthProfileRequest req)
    {
        var age = NutritionCalculator.AgeAt(req.DateOfBirth, Mappers.TodayVn());
        if (age is < 10 or > 120) throw new AppException("Tuổi phải nằm trong khoảng 10–120.");
    }

    private async Task<HealthProfileDto> ToDtoAsync(HealthProfile p, CancellationToken ct)
    {
        var allergies = await GetMyAllergiesAsync(p.UserId, ct);
        var reminderDays = await _db.SystemSettings.Where(s => s.Key == "profile.reminder_days")
            .Select(s => s.Value).FirstOrDefaultAsync(ct);
        var days = int.TryParse(reminderDays, out var d) ? d : 30;
        return new HealthProfileDto(p.Id, p.Gender, p.DateOfBirth, NutritionCalculator.AgeAt(p.DateOfBirth, Mappers.TodayVn()),
            p.HeightCm, p.WeightKg, p.ActivityLevel, p.HealthGoal, p.Bmi,
            p.Bmi is null ? null : NutritionCalculator.BmiCategory(p.Bmi.Value), p.Bmr, p.Tdee,
            p.Targets(), p.UpdatedAt, p.UpdatedAt < DateTime.UtcNow.AddDays(-days), allergies);
    }
}
