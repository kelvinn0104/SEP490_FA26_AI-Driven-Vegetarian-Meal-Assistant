using System.ComponentModel.DataAnnotations;

namespace VeggieAI.Model.DTOs;

public class CategoryDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = "recipe";
    public int RecipeCount { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string Icon { get; set; } = "restaurant";
    public string Description { get; set; } = string.Empty;
    public string AvgCalories { get; set; } = "180 - 280 kcal";
    public bool Featured { get; set; } = false;
    public List<string> DietCompatibility { get; set; } = new() { "Thuần chay" };
}

public class CreateCategoryRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = "recipe"; // 'food_type', 'recipe'
}

public class UpdateCategoryRequest
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    public string Type { get; set; } = "recipe";
}

public class RecipeDto
{
    public string Id { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string PublishedAt { get; set; } = string.Empty;
    public int Views { get; set; }
    public string Status { get; set; } = "published";
    public string? ImageUrl { get; set; }
    public int Servings { get; set; } = 1;
    public decimal KcalPerServing { get; set; }
    public decimal ProteinG { get; set; }
    public decimal CarbG { get; set; }
    public decimal FatG { get; set; }
    public decimal IronMg { get; set; }
    public decimal B12Mcg { get; set; }
    public decimal CalciumMg { get; set; }
    public decimal ZincMg { get; set; }
    public string? Instructions { get; set; }

    /// <summary>Chỉ trả ở GET /api/recipes/{id} (null ở danh sách).</summary>
    public List<RecipeIngredientDto>? Ingredients { get; set; }
}

public class RecipeIngredientDto
{
    public int IngredientId { get; set; }
    public string Name { get; set; } = string.Empty;
    /// <summary>Khối lượng cho cả công thức (ứng với Servings khẩu phần).</summary>
    public decimal QuantityG { get; set; }
}

public class CreateRecipeRequest
{
    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public int CategoryId { get; set; }

    public string? ImageUrl { get; set; }

    [Required]
    public string Instructions { get; set; } = string.Empty;

    public int Servings { get; set; } = 1;
    public List<RecipeIngredientItemDto>? Ingredients { get; set; }
}

public class RecipeIngredientItemDto
{
    public int IngredientId { get; set; }
    public decimal QuantityG { get; set; }
}

public class UpdateRecipeStatusRequest
{
    [Required]
    public string Status { get; set; } = "published"; // 'draft', 'pending_verification', 'published', 'hidden'
}
