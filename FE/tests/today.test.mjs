import test from "node:test";
import assert from "node:assert/strict";
import { vietnamDate, mealsForDate, nutrientProgress } from "../src/user/data.js";

test("today follows Vietnam day boundary rather than browser timezone", () => {
  assert.equal(vietnamDate(new Date("2026-11-04T16:59:59Z")), "2026-11-04");
  assert.equal(vietnamDate(new Date("2026-11-04T17:00:00Z")), "2026-11-05");
});

test("daily meals match date and plan item ID, with no title-based guesses or test dishes", () => {
  const plan = { days: [{ date: "2026-11-04", meals: [
    { id: 2, mealType: "dinner", recipeTitle: "Đậu hũ" },
    { id: 1, mealType: "breakfast", recipeTitle: "Đậu hũ" },
    { id: 3, mealType: "lunch", recipeTitle: "Món (dummy)" },
  ] }, { date: "2026-11-05", meals: [{ id: 4, recipeTitle: "Bữa ngày mai" }] }] };
  const meals = mealsForDate(plan, "2026-11-04", [{ planItemId: "2" }, { planItemId: null, recipeTitle: "Đậu hũ" }]);
  assert.deepEqual(meals.map(meal => [meal.id, meal.recorded]), [[1, false], [2, true]]);
  assert.deepEqual(mealsForDate(plan, "2026-11-06", []), []);
  assert.deepEqual(mealsForDate(null, "2026-11-04", null), []);
});

test("nutrition progress preserves zero, rejects unknown targets and caps visual overflow", () => {
  assert.equal(nutrientProgress(0, 100), 0);
  assert.equal(nutrientProgress(40, 100), 40);
  assert.equal(nutrientProgress(200, 100), 100);
  for (const [value, target] of [[null, 100], [undefined, 100], ["", 100], [0, 0], [20, null], [20, -1], [-1, 100], [Infinity, 100], [20, NaN]]) assert.equal(nutrientProgress(value, target), null);
});
