import json, re, uuid

KEEP_QUOTED = {"{{email}}", "{{password}}", "{{today}}"}


def req(name, method, path, body=None, tests=None, auth=True, form=None, desc=None):
    base, _, qs = path.partition("?")
    url = {"raw": "{{baseUrl}}" + path, "host": ["{{baseUrl}}"], "path": base.strip("/").split("/")}
    if qs:
        url["query"] = [{"key": kv.split("=")[0], "value": kv.split("=", 1)[1] if "=" in kv else ""} for kv in qs.split("&")]
    r = {"method": method, "header": [], "url": url}
    if desc:
        r["description"] = desc
    if not auth:
        r["auth"] = {"type": "noauth"}
    if body is not None:
        raw = json.dumps(body, ensure_ascii=False, indent=2)
        # numeric ids: "{{recipeId}}" -> {{recipeId}} so the JSON sends a number
        raw = re.sub(r'"(\{\{\w+\}\})"', lambda m: m.group(0) if m.group(1) in KEEP_QUOTED else m.group(1), raw)
        r["header"].append({"key": "Content-Type", "value": "application/json"})
        r["body"] = {"mode": "raw", "raw": raw, "options": {"raw": {"language": "json"}}}
    if form:
        r["body"] = {"mode": "formdata", "formdata": form}
    ev = ["pm.test('Status 2xx', () => pm.expect(pm.response.code).to.be.within(200, 299));"] + (tests or [])
    return {"name": name, "request": r, "event": [{"listen": "test", "script": {"type": "text/javascript", "exec": ev}}]}


def folder(name, items):
    return {"name": name, "item": items}


def S(var, expr):
    return (f"try {{ const j = pm.response.json(); const v = {expr}; "
            f"if (v !== undefined && v !== null) pm.collectionVariables.set('{var}', v); }} catch (e) {{}}")


items = [
    folder("0. Health", [req("Health check (DB + AI)", "GET", "/api/health", auth=False)]),
    folder("1. Auth", [
        req("Register", "POST", "/api/auth/register", {"email": "{{email}}", "password": "{{password}}", "displayName": "Test User"},
            auth=False, tests=[S("token", "j.accessToken"), S("userId", "j.user.id")],
            desc="Đăng ký và tự lưu token vào {{token}}. Email tự sinh ngẫu nhiên (biến email); 409 nếu email đã tồn tại."),
        req("Login", "POST", "/api/auth/login", {"email": "{{email}}", "password": "{{password}}"}, auth=False,
            tests=[S("token", "j.accessToken")]),
        req("Me", "GET", "/api/auth/me"),
        req("Update me", "PUT", "/api/auth/me", {"displayName": "Henry Veggie"}),
        req("Change password", "POST", "/api/auth/change-password", {"currentPassword": "{{password}}", "newPassword": "{{password}}"},
            desc="Ví dụ đổi sang chính mật khẩu cũ để không làm hỏng các request phía sau."),
    ]),
    folder("2. Catalog (public)", [
        req("Allergies", "GET", "/api/allergies", auth=False, tests=[S("allergyId", "j[0].id")]),
        req("Categories (recipe)", "GET", "/api/categories?type=recipe", auth=False, tests=[S("categoryId", "j[0].id")]),
        req("Ingredients search", "GET", "/api/ingredients?keyword=tofu&page=1&pageSize=20", auth=False,
            tests=[S("ingredientId", "j.items[0].id")]),
        req("Ingredient detail", "GET", "/api/ingredients/{{ingredientId}}", auth=False),
    ]),
    folder("3. Health profile", [
        req("Preview targets (no save)", "POST", "/api/health-profile/preview",
            {"gender": "female", "dateOfBirth": "2002-03-15", "heightCm": 158, "weightKg": 52, "activityLevel": "light", "healthGoal": "loss"},
            auth=False),
        req("Create / update profile", "PUT", "/api/health-profile",
            {"gender": "male", "dateOfBirth": "2003-05-10", "heightCm": 170, "weightKg": 65, "activityLevel": "moderate",
             "healthGoal": "maintain", "allergyIds": ["{{allergyId}}"]},
            desc="activityLevel: sedentary|light|moderate|active|very_active · healthGoal: loss|gain|maintain"),
        req("Get profile", "GET", "/api/health-profile"),
        req("My allergies", "GET", "/api/health-profile/allergies"),
        req("Set my allergies", "PUT", "/api/health-profile/allergies", {"allergyIds": ["{{allergyId}}"]}),
    ]),
    folder("4. Recipes", [
        req("Search recipes", "GET", "/api/recipes?keyword=đậu&sort=protein_desc&page=1&pageSize=10",
            tests=[S("recipeId", "j.items[0].id"), S("recipeId2", "j.items[1] && j.items[1].id")],
            desc="sort: newest|kcal_asc|kcal_desc|protein_desc|popular · lọc thêm: categoryId, maxKcal, minProtein, excludeMyAllergens"),
        req("Recipe detail", "GET", "/api/recipes/{{recipeId}}"),
        req("Suggest by ingredients", "GET", "/api/recipes/suggest?ingredientIds=1&ingredientIds=3&take=10"),
        req("Add favorite", "POST", "/api/recipes/{{recipeId}}/favorite"),
        req("My favorites", "GET", "/api/recipes/favorites?page=1&pageSize=20"),
        req("Remove favorite", "DELETE", "/api/recipes/{{recipeId}}/favorite"),
    ]),
    folder("5. Meal plans (AI)", [
        req("AI - Generate meal plan", "POST", "/api/meal-plans/generate",
            {"days": 7, "mealTypes": ["breakfast", "lunch", "dinner"], "note": "thích món Việt, ít dầu mỡ", "preferredIngredientIds": []},
            tests=[S("planId", "j.plan.id"), S("planItemId", "j.plan.days[0].meals[0].id"),
                   S("planItemId2", "j.plan.days[0].meals[1] && j.plan.days[0].meals[1].id"),
                   "pm.test('Có generatedBy', () => pm.expect(pm.response.json().generatedBy).to.be.a('string'));"],
            desc="startDate mặc định = ngày mai; có thể thêm startDate, healthGoal, scanId. generatedBy = ai:<provider>/<model> hoặc rule-based (chưa có API key)."),
        req("AI - Swap one meal", "POST", "/api/meal-plans/{{planId}}/items/{{planItemId2}}/swap", {"reason": "muốn món nước, nhiều đạm hơn"}),
        req("List my plans", "GET", "/api/meal-plans?page=1&pageSize=10"),
        req("Plan detail", "GET", "/api/meal-plans/{{planId}}"),
        req("Activate plan", "PATCH", "/api/meal-plans/{{planId}}/status", {"status": "active"}, desc="draft|active|completed|cancelled"),
        req("Current plan (today)", "GET", "/api/meal-plans/current", desc="204 No Content nếu hôm nay không có thực đơn."),
        req("Create manual plan", "POST", "/api/meal-plans",
            {"startDate": "2026-12-01", "endDate": "2026-12-02", "healthGoal": "maintain",
             "items": [{"recipeId": "{{recipeId}}", "planDate": "2026-12-01", "mealType": "lunch", "servings": 1}]},
            tests=[S("manualPlanId", "j.id"), S("manualItemId", "j.days[0].meals[0].id")]),
        req("Add item", "POST", "/api/meal-plans/{{manualPlanId}}/items",
            {"recipeId": "{{recipeId2}}", "planDate": "2026-12-02", "mealType": "dinner", "servings": 1.5}),
        req("Update item", "PUT", "/api/meal-plans/{{manualPlanId}}/items/{{manualItemId}}", {"servings": 2}),
        req("Remove item", "DELETE", "/api/meal-plans/{{manualPlanId}}/items/{{manualItemId}}"),
        req("Delete manual plan", "DELETE", "/api/meal-plans/{{manualPlanId}}"),
    ]),
    folder("6. Shopping list", [
        req("Generate shopping list", "POST", "/api/meal-plans/{{planId}}/shopping-list", tests=[S("shoppingItemId", "j.items[0].id")]),
        req("Get shopping list", "GET", "/api/meal-plans/{{planId}}/shopping-list"),
        req("Mark item bought", "PATCH", "/api/meal-plans/{{planId}}/shopping-list/items/{{shoppingItemId}}", {"isBought": True}),
    ]),
    folder("7. Scan image (AI vision)", [
        req("AI - Scan image", "POST", "/api/scans",
            form=[{"key": "image", "type": "file", "src": [], "description": "Chọn ảnh JPEG/PNG/WEBP ≤ 8MB"}],
            tests=[S("scanId", "j.scanId")],
            desc="Tab Body → form-data → key image → Select Files chọn ảnh rau củ/món ăn rồi Send. Trả về detectedItems, suggestedRecipes, suggestedMenu."),
        req("Confirm / correct ingredients", "POST", "/api/scans/{{scanId}}/confirm", {"ingredientIds": [1, 3, 8]},
            desc="Sửa tay danh sách nguyên liệu khi AI nhận sai hoặc chưa có API key."),
        req("Scan detail", "GET", "/api/scans/{{scanId}}"),
        req("Scan history", "GET", "/api/scans?page=1&pageSize=10"),
        req("AI - Generate plan from scan", "POST", "/api/meal-plans/generate", {"days": 3, "scanId": "{{scanId}}"}),
    ]),
    folder("8. Chatbot (AI)", [
        req("Create session", "POST", "/api/chat/sessions", {"planId": None}, tests=[S("chatSessionId", "j.id")],
            desc="Truyền planId (số) để hỏi AI về thực đơn đó."),
        req("AI - Send message", "POST", "/api/chat/sessions/{{chatSessionId}}/messages",
            {"content": "Người ăn chay như tôi có cần bổ sung B12 không? Gợi ý món giàu sắt."}),
        req("List sessions", "GET", "/api/chat/sessions"),
        req("Messages", "GET", "/api/chat/sessions/{{chatSessionId}}/messages"),
        req("Delete session", "DELETE", "/api/chat/sessions/{{chatSessionId}}"),
    ]),
    folder("9. Nutrition tracking", [
        req("Log meal from plan", "POST", "/api/nutrition/logs", {"planItemId": "{{planItemId}}"}, tests=[S("mealLogId", "j.id")]),
        req("Log meal (recipe, today)", "POST", "/api/nutrition/logs", {"recipeId": "{{recipeId}}", "mealType": "lunch", "servings": 1}),
        req("Daily summary", "GET", "/api/nutrition/daily", desc="Thêm ?date=yyyy-MM-dd (mặc định hôm nay)."),
        req("Trend (7 days)", "GET", "/api/nutrition/trend", desc="?from=yyyy-MM-dd&to=yyyy-MM-dd"),
        req("Upsert activity", "PUT", "/api/nutrition/activity", {"activityDate": "{{today}}", "kcalBurned": 350, "steps": 8000}),
        req("Delete log", "DELETE", "/api/nutrition/logs/{{mealLogId}}"),
    ]),
    folder("10. Notifications", [
        req("List", "GET", "/api/notifications?page=1&pageSize=20", tests=[S("notificationId", "j.items[0] && j.items[0].id")]),
        req("Unread count", "GET", "/api/notifications/unread-count"),
        req("Mark read (needs a notification)", "PATCH", "/api/notifications/{{notificationId}}/read"),
        req("Mark all read", "PATCH", "/api/notifications/read-all"),
    ]),
    folder("11. Vegan shops", [
        req("Nearby (HCMC)", "GET", "/api/vegan-shops?lat=10.7769&lng=106.7009&radiusKm=10", auth=False),
        req("Search keyword", "GET", "/api/vegan-shops?keyword=phở", auth=False),
    ]),
    folder("12. Community", [
        req("Create post (pending)", "POST", "/api/community/posts",
            {"postType": "blog", "title": "Món chay giàu đạm cho người tập gym", "content": "Chia sẻ thực đơn...", "recipeId": "{{recipeId}}"},
            tests=[S("postId", "j.id")]),
        req("Published posts", "GET", "/api/community/posts?sort=top&page=1&pageSize=10", auth=False),
        req("My posts", "GET", "/api/community/posts/mine"),
        req("Post detail", "GET", "/api/community/posts/{{postId}}"),
        req("Comment (post must be published)", "POST", "/api/community/posts/{{postId}}/comments", {"content": "Hay quá!"},
            tests=[S("commentId", "j.id")], desc="Bài mới tạo ở trạng thái pending nên sẽ 404 cho tới khi được duyệt."),
        req("Vote (post must be published)", "PUT", "/api/community/posts/{{postId}}/vote", {"value": 1}, desc="1 | -1 | 0 (bỏ vote)"),
        req("Delete comment", "DELETE", "/api/community/comments/{{commentId}}"),
        req("Report", "POST", "/api/community/reports",
            {"targetType": "recipe", "targetId": "{{recipeId}}", "category": "nutrition_misinformation", "reason": "Số liệu calo có vẻ sai"}),
        req("Delete my post", "DELETE", "/api/community/posts/{{postId}}"),
    ]),
]

collection = {
    "info": {
        "_postman_id": str(uuid.uuid4()),
        "name": "VeggieAI API (User flow + AI)",
        "description": ("Collection test VeggieAI backend. Chạy lần lượt từ trên xuống (hoặc Collection Runner). "
                        "Register/Login tự lưu {{token}}; các id (recipeId, planId, scanId...) tự lưu từ response.\n"
                        "baseUrl mặc định http://localhost:59610 (https://localhost:59609 nếu chạy HTTPS)."),
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    "auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{token}}", "type": "string"}]},
    "event": [{"listen": "prerequest", "script": {"type": "text/javascript", "exec": [
        "if (!pm.collectionVariables.get('email')) pm.collectionVariables.set('email', `user${Date.now()}@veggieai.test`);",
        "pm.collectionVariables.set('today', new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10));",
    ]}}],
    "variable": [{"key": k, "value": v} for k, v in [
        ("baseUrl", "http://localhost:59610"), ("email", ""), ("password", "Test@123"), ("token", ""), ("today", ""),
        ("userId", ""), ("allergyId", "1"), ("categoryId", ""), ("ingredientId", "1"), ("recipeId", "1"), ("recipeId2", "2"),
        ("planId", ""), ("planItemId", ""), ("planItemId2", ""), ("manualPlanId", ""), ("manualItemId", ""),
        ("shoppingItemId", ""), ("scanId", ""), ("chatSessionId", ""), ("mealLogId", ""), ("notificationId", ""),
        ("postId", ""), ("commentId", "")]],
    "item": items,
}

out = "/home/claude/BE/postman/VeggieAI.postman_collection.json"
json.dump(collection, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("requests:", sum(len(f["item"]) for f in items))
