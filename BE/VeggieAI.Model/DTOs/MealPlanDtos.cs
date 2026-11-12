using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class UpdateMealPlanStatusRequest
{
    [Required, RegularExpression("^(draft|active|completed|cancelled)$",
        ErrorMessage = "status phải là draft, active, completed hoặc cancelled.")]
    public string Status { get; set; } = "active";
}

public class ToggleShoppingItemRequest
{
    public bool IsBought { get; set; } = true;
}

public record ShoppingListItemDto(int Id, int IngredientId, string IngredientName, decimal QuantityG, bool IsBought);

public record ShoppingListDto(int Id, int PlanId, DateTime CreatedAt, int BoughtCount, int TotalCount,
    IReadOnlyList<ShoppingListItemDto> Items);
