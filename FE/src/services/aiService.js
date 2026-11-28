import { aiApi } from '../api';

/**
 * VeggieAI Service layer delegating nutrition & ingredient analysis strictly to Backend API.
 * No API keys or mock setTimeout simulations exist on Frontend.
 */
export async function analyzeRecipeIngredients(ingredientsText) {
  if (!ingredientsText || !ingredientsText.trim()) {
    throw new Error('Vui lòng nhập danh sách nguyên liệu cần phân tích.');
  }

  const result = await aiApi.parseNutrition(ingredientsText.trim());
  return {
    success: Boolean(result?.analyzed),
    data: result,
  };
}

export default {
  analyzeRecipeIngredients,
};
