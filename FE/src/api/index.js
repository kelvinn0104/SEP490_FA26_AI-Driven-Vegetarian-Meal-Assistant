/**
 * VeggieAI API Service Central Hub
 * Compliant with VeggieAI_API_Frontend_Guide.md
 */

// Core HTTP Client primitives
export * from './client';

// User Feature Services (RESTful & AI endpoints)
export { authService } from './services/authService';
export { healthProfileService } from './services/healthProfileService';
export { recipeService } from './services/recipeService';
export { mealPlanService } from './services/mealPlanService';
export { nutritionService } from './services/nutritionService';
export { scanService } from './services/scanService';
export { chatService } from './services/chatService';
export { notificationService } from './services/notificationService';
export { communityService } from './services/communityService';
export { veganShopService } from './services/veganShopService';
export { healthCheckService } from './services/healthCheckService';

// Admin & Legacy APIs (for backwards compatibility across Mod/Admin dashboards)
export * from './adminApis';

// Default export
import client from './client';
export default client;
