namespace VeggieAI.Application.Interfaces;

public interface IChatbotService
{
    Task<string> AnswerNutritionQueryAsync(string query, Guid? userId = null);
}
