namespace VeggieAI.Model.DTOs;

public record NotificationDto(int Id, string Type, string Content, bool IsRead, DateTime CreatedAt);

public record UnreadCountDto(int Count);

public record VeganShopDto(
    int Id, string Name, string Address, decimal Latitude, decimal Longitude,
    string? Phone, IReadOnlyList<string> Tags, double? DistanceKm);
