const API_BASE_URL = 'http://localhost:5000/api';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return res.json();
}

export async function generateMealPlan(ingredients) {
  const res = await fetch(`${API_BASE_URL}/mealplanner/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ingredients)
  });
  return res.json();
}

export async function detectIngredients() {
  const res = await fetch(`${API_BASE_URL}/vision/detect`, {
    method: 'POST'
  });
  return res.json();
}

export async function askChatbot(query) {
  const res = await fetch(`${API_BASE_URL}/chatbot/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  return res.json();
}

export async function fetchPendingModeration() {
  const res = await fetch(`${API_BASE_URL}/moderation/pending-posts`);
  return res.json();
}
