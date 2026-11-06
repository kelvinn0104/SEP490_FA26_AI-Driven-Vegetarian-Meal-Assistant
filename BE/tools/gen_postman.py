import json, re, uuid

KEEP_QUOTED = {"{{email}}", "{{password}}", "{{today}}", "{{otp}}", "{{resetOtp}}", "{{refreshToken}}", "{{uploadUrl}}", "{{planStartDate}}"}


def req(name, method, path, body=None, tests=None, auth=True, form=None, desc=None, expect=None):
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
    ev = ([f"pm.test('Status {expect}', () => pm.expect(pm.response.code).to.eql({expect}));"] if expect
          else ["pm.test('Status 2xx', () => pm.expect(pm.response.code).to.be.within(200, 299));"]) + (tests or [])
    return {"name": name, "request": r, "event": [{"listen": "test", "script": {"type": "text/javascript", "exec": ev}}]}


def folder(name, items):
    return {"name": name, "item": items}


def S(var, expr):
    # j = phần data của ApiResponse { success, message, data, errors }
    return (f"try {{ const j = pm.response.json().data; const v = {expr}; "
            f"if (v !== undefined && v !== null) pm.collectionVariables.set('{var}', v); }} catch (e) {{}}")


RID = "parseInt(String({0}).replace(/^r/, ''))"  # RecipeDto.id dạng "r12" → số 12

items = [
    folder("0. Health", [req("Health check (DB + AI + storage)", "GET", "/api/health", auth=False)]),
    folder("1. Auth", [
        req("Register (OTP)", "POST", "/api/auth/register", {"email": "{{email}}", "password": "{{password}}", "displayName": "Test User"},
            auth=False, tests=[S("otp", "j.devOtp")],
            desc="Tạo tài khoản pending + gửi OTP. devOtp chỉ có khi Otp__ExposeOtpInResponse=true. Email chưa cấu hình → 503 EMAIL_NOT_CONFIGURED."),
        req("Verify OTP", "POST", "/api/auth/verify-code", {"email": "{{email}}", "otpCode": "{{otp}}"}, auth=False,
            tests=[S("token", "j.token"), S("refreshToken", "j.refreshToken")]),
        req("Login", "POST", "/api/auth/login", {"email": "{{email}}", "password": "{{password}}"}, auth=False,
            tests=[S("token", "j.token"), S("refreshToken", "j.refreshToken")]),
        req("Refresh token", "POST", "/api/auth/refresh", {"refreshToken": "{{refreshToken}}"}, auth=False,
            tests=[S("token", "j.token"), S("refreshToken", "j.refreshToken")],
            desc="Rotation: refresh token cũ hết hiệu lực ngay. 401 + errors[0] = INVALID_REFRESH_TOKEN | REFRESH_TOKEN_EXPIRED | REFRESH_TOKEN_REUSED."),
        req("Me", "GET", "/api/auth/me"),
        req("Update me", "PUT", "/api/auth/me", {"displayName": "Henry Veggie"},
            desc="{ displayName?, avatarUrl? } — avatarUrl lấy từ POST /api/uploads (purpose=avatar), \"\" để bỏ ảnh."),
        req("Change password", "POST", "/api/auth/change-password", {"currentPassword": "{{password}}", "newPassword": "{{password}}-new"},
            tests=[S("token", "j.token"), S("refreshToken", "j.refreshToken")],
            desc="Thu hồi mọi phiên cũ và trả cặp token mới (FE thay token đang lưu)."),
        req("Change password back", "POST", "/api/auth/change-password", {"currentPassword": "{{password}}-new", "newPassword": "{{password}}"},
            tests=[S("token", "j.token"), S("refreshToken", "j.refreshToken")]),
        req("Forgot password", "POST", "/api/auth/forgot-password", {"email": "{{email}}"}, auth=False, tests=[S("resetOtp", "j.devOtp")],
            desc="Luôn 200 (không lộ email có tồn tại). Mã OTP gửi qua email."),
        req("Reset password", "POST", "/api/auth/reset-password", {"email": "{{email}}", "otpCode": "{{resetOtp}}", "newPassword": "{{password}}"},
            auth=False, desc="Thành công → mọi phiên cũ bị thu hồi, cần Login lại."),
        req("Login again", "POST", "/api/auth/login", {"email": "{{email}}", "password": "{{password}}"}, auth=False,
            tests=[S("token", "j.token"), S("refreshToken", "j.refreshToken")]),
    ]),
    folder("2. Catalog (public)", [
        req("Allergies", "GET", "/api/allergies", auth=False, tests=[S("allergyId", "j[0].id")]),
        req("Categories (recipe)", "GET", "/api/categories?type=recipe", auth=False, tests=[S("categoryId", "j[0].id")]),
        req("Ingredients search", "GET", "/api/ingredients?search=tofu&limit=20", auth=False, tests=[S("ingredientId", "j[0].id")],
            desc="Tìm không phân biệt dấu/hoa thường."),
    ]),
    folder("3. Health profile", [
        req("Preview targets (no save)", "POST", "/api/health-profile/preview",
            {"gender": "female", "dateOfBirth": "2002-03-15", "heightCm": 158, "weightKg": 52, "activityLevel": "light", "healthGoal": "loss"},
            auth=False),
        req("Create / update profile", "PUT", "/api/health-profile",
            {"gender": "male", "dateOfBirth": "2003-05-10", "heightCm": 170, "weightKg": 65, "activityLevel": "moderate",
             "healthGoal": "maintain", "allergyIds": []},
            desc="activityLevel: sedentary|light|moderate|active|very_active · healthGoal: loss|gain|maintain"),
        req("Get profile", "GET", "/api/health-profile"),
        req("My allergies", "GET", "/api/health-profile/allergies"),
        req("Set my allergies", "PUT", "/api/health-profile/allergies", {"allergyIds": []}),
    ]),
    folder("4. Recipes", [
        req("All recipes (sorted)", "GET", "/api/recipes?sort=protein", auth=False,
            desc="Không phân trang. sort: newest|oldest|popular|protein|kcal_asc|kcal_desc|title"),
        req("Recipes paged", "GET", "/api/recipes/paged?search=đậu&sort=protein&page=1&pageSize=10", auth=False,
            tests=[S("recipeId", RID.format("j.items[0].id")), S("recipeId2", "j.items[1] && " + RID.format("j.items[1].id"))]),
        req("Recipe detail (isFavorite)", "GET", "/api/recipes/{{recipeId}}",
            desc="Có token → isFavorite. Công thức chưa published: chỉ tác giả/staff xem được (người khác 404)."),
        req("Suggest by ingredients", "GET", "/api/recipes/suggest?ingredientIds={{ingredientId}}&take=10"),
        req("Add favorite", "POST", "/api/recipes/{{recipeId}}/favorite"),
        req("My favorites", "GET", "/api/recipes/favorites?page=1&pageSize=20", desc="Chỉ món còn published."),
        req("Remove favorite", "DELETE", "/api/recipes/{{recipeId}}/favorite"),
    ]),
    folder("5. Meal plans (AI)", [
        req("AI - Generate meal plan", "POST", "/api/meal-plans/ai/generate",
            {"days": 3, "mealTypes": ["breakfast", "lunch", "dinner"], "note": "thích món Việt, ít dầu mỡ", "preferredIngredientIds": []},
            tests=[S("planId", "j.plan.id"), S("planItemId", "j.plan.days[0].meals[0].id"),
                   S("planItemId2", "j.plan.days[0].meals[1] && j.plan.days[0].meals[1].id"),
                   S("planStartDate", "j.plan.startDate")],
            desc="Chỉ chọn món published, có nguyên liệu và không chứa chất dị ứng. generatedBy = ai:<provider>/<model> hoặc rule-based."),
        req("AI - Swap one meal", "POST", "/api/meal-plans/ai/{{planId}}/items/{{planItemId2}}/swap", {"reason": "muốn món nước, nhiều đạm hơn"}),
        req("Swap to a chosen recipe", "POST", "/api/meal-plans/ai/{{planId}}/items/{{planItemId2}}/swap",
            {"recipeId": "{{recipeId2}}", "servings": 1.5}, desc="recipeId/servings tùy chọn. Danh sách đi chợ (nếu có) tự cập nhật."),
        req("Add item", "POST", "/api/meal-plans/{{planId}}/items",
            {"planDate": "{{planStartDate}}", "mealType": "snack", "recipeId": "{{recipeId}}", "servings": 1},
            tests=["try { const d = pm.response.json().data; const m = d.days.flatMap(x => x.meals).filter(x => x.mealType === 'snack'); "
                   "if (m.length) pm.collectionVariables.set('manualItemId', m[m.length - 1].id); } catch (e) {}"]),
        req("Update item", "PATCH", "/api/meal-plans/{{planId}}/items/{{manualItemId}}", {"servings": 2}),
        req("Remove item", "DELETE", "/api/meal-plans/{{planId}}/items/{{manualItemId}}"),
        req("List my plans", "GET", "/api/meal-plans?status=all&page=1&pageSize=10"),
        req("Plan detail", "GET", "/api/meal-plans/{{planId}}"),
        req("Activate plan", "PATCH", "/api/meal-plans/{{planId}}/status", {"status": "active"}, desc="draft|active|completed|cancelled"),
        req("Current plan (today)", "GET", "/api/meal-plans/current", desc="204 No Content nếu không có thực đơn active."),
    ]),
    folder("6. Shopping list", [
        req("Generate shopping list", "POST", "/api/meal-plans/{{planId}}/shopping-list", tests=[S("shoppingItemId", "j.items[0].id")]),
        req("Get shopping list", "GET", "/api/meal-plans/{{planId}}/shopping-list"),
        req("Mark item bought", "PATCH", "/api/meal-plans/{{planId}}/shopping-list/items/{{shoppingItemId}}", {"isBought": True}),
    ]),
    folder("7. Uploads & scan", [
        req("Upload file", "POST", "/api/uploads",
            form=[{"key": "file", "type": "file", "src": [], "description": "Ảnh ≤ 8MB hoặc video MP4/WEBM/MOV ≤ 50MB (purpose=post)"},
                  {"key": "purpose", "value": "avatar", "type": "text", "description": "post | avatar | recipe"}],
            tests=[S("uploadUrl", "j.url")], desc="Trả { url, contentType, size, kind, durable }."),
        req("Set avatar", "PUT", "/api/auth/me", {"avatarUrl": "{{uploadUrl}}"}),
        req("AI - Scan image", "POST", "/api/scans",
            form=[{"key": "image", "type": "file", "src": [], "description": "Chọn ảnh JPEG/PNG/WEBP ≤ 8MB"}],
            tests=[S("scanId", "j.scanId")]),
        req("Confirm / correct ingredients", "POST", "/api/scans/{{scanId}}/confirm", {"ingredientIds": ["{{ingredientId}}"]}),
        req("Scan detail", "GET", "/api/scans/{{scanId}}"),
        req("Scan history", "GET", "/api/scans?page=1&pageSize=10"),
        req("AI - Generate plan from scan", "POST", "/api/meal-plans/ai/generate", {"days": 3, "scanId": "{{scanId}}"}),
        req("Delete scan", "DELETE", "/api/scans/{{scanId}}"),
    ]),
    folder("8. Chatbot (AI)", [
        req("Create session", "POST", "/api/chat/sessions", {"planId": None}, tests=[S("chatSessionId", "j.id")]),
        req("AI - Send message", "POST", "/api/chat/sessions/{{chatSessionId}}/messages",
            {"content": "Người ăn chay như tôi có cần bổ sung B12 không? Gợi ý món giàu sắt."},
            desc="AI lỗi/chưa cấu hình → 503 + errors[0] = AI_UNAVAILABLE | AI_NOT_CONFIGURED (không lưu câu báo lỗi)."),
        req("List sessions", "GET", "/api/chat/sessions"),
        req("Messages", "GET", "/api/chat/sessions/{{chatSessionId}}/messages"),
        req("Delete session", "DELETE", "/api/chat/sessions/{{chatSessionId}}"),
    ]),
    folder("9. Nutrition tracking", [
        req("Log meal from plan", "POST", "/api/nutrition/logs", {"planItemId": "{{planItemId}}"},
            desc="Thực đơn mặc định bắt đầu từ ngày mai → 400 (không ghi bữa cho ngày tương lai) cho tới ngày đó."),
        req("Log meal (recipe, today)", "POST", "/api/nutrition/logs", {"recipeId": "{{recipeId}}", "mealType": "lunch", "servings": 1},
            tests=[S("mealLogId", "j.id")]),
        req("Update log", "PATCH", "/api/nutrition/logs/{{mealLogId}}", {"servings": 1.5, "mealType": "dinner"}),
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
        req("Edit my post", "PUT", "/api/community/posts/{{postId}}",
            {"title": "Món chay giàu đạm (bản sửa)", "content": "Nội dung đã cập nhật", "recipeId": "{{recipeId}}"},
            desc="Chỉ tác giả. Bài quay về pending để duyệt lại; bài bị từ chối cũng sửa rồi gửi lại được."),
        req("Published posts", "GET", "/api/community/posts?sort=top&page=1&pageSize=10", auth=False,
            desc="Mỗi bài có excerpt, authorId, canEdit, canDelete."),
        req("My posts", "GET", "/api/community/posts/mine?page=1&pageSize=10", desc="Kèm moderation { decision, note, reviewedAt } và updatedAt."),
        req("Post detail", "GET", "/api/community/posts/{{postId}}"),
        req("Comments (paged)", "GET", "/api/community/posts/{{postId}}/comments?page=1&pageSize=20", auth=False),
        req("Comment (post must be published)", "POST", "/api/community/posts/{{postId}}/comments", {"content": "Hay quá!"},
            tests=[S("commentId", "j.id")], desc="Bài pending trả 400 cho tới khi được duyệt."),
        req("Edit comment", "PUT", "/api/community/comments/{{commentId}}", {"content": "Hay quá, cảm ơn bạn!"}),
        req("Vote (post must be published)", "PUT", "/api/community/posts/{{postId}}/vote", {"value": 1}, desc="1 | -1 | 0 (bỏ vote)"),
        req("Delete comment", "DELETE", "/api/community/comments/{{commentId}}"),
        req("Report", "POST", "/api/community/reports",
            {"targetType": "recipe", "targetId": "{{recipeId}}", "category": "nutrition_misinformation", "reason": "Số liệu calo có vẻ sai"}),
        req("My reports", "GET", "/api/community/reports/mine?page=1&pageSize=10"),
        req("Delete my post", "DELETE", "/api/community/posts/{{postId}}"),
    ]),
    folder("13. Staff (admin/moderator token)", [
        req("Pending moderation", "GET", "/api/moderation/pending"),
        req("Approve post", "POST", "/api/moderation/{{postId}}/approve", {"reason": "Đạt chuẩn"}, desc="Tác giả nhận thông báo post_review."),
        req("Reports (open)", "GET", "/api/moderation/reports?status=open&page=1&pageSize=20", tests=[S("reportId", "j.items[0] && j.items[0].id")]),
        req("Handle report", "POST", "/api/moderation/reports/{{reportId}}/handle", {"status": "resolved", "removeContent": False, "note": "Đã xem xét"},
            desc="status: resolved|dismissed. Người báo cáo nhận thông báo report_result."),
    ]),
    folder("14. Logout", [
        req("Logout (all devices)", "POST", "/api/auth/logout", {"refreshToken": "{{refreshToken}}"},
            desc="Thu hồi mọi access/refresh token. Sau đó Me trả 401 SESSION_REVOKED."),
        req("Me after logout (expect 401)", "GET", "/api/auth/me", expect=401,
            tests=["pm.test('401 SESSION_REVOKED', () => pm.expect(pm.response.json().errors[0]).to.eql('SESSION_REVOKED'));"]),
    ]),
]

collection = {
    "info": {
        "_postman_id": str(uuid.uuid4()),
        "name": "VeggieAI API (User flow + AI)",
        "description": ("Collection test VeggieAI backend. Chạy lần lượt từ trên xuống (hoặc Collection Runner). "
                        "Register → Verify OTP / Login tự lưu {{token}} + {{refreshToken}}; các id (recipeId, planId, scanId...) tự lưu từ response. "
                        "Folder 13 cần token admin/moderator. Lỗi trả errors[0] là mã máy đọc được (vd. TOKEN_EXPIRED → gọi Refresh).\n"
                        "baseUrl mặc định http://localhost:59610 (https://localhost:59609 nếu chạy HTTPS)."),
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    "auth": {"type": "bearer", "bearer": [{"key": "token", "value": "{{token}}", "type": "string"}]},
    "event": [{"listen": "prerequest", "script": {"type": "text/javascript", "exec": [
        "if (!pm.collectionVariables.get('email')) pm.collectionVariables.set('email', `user${Date.now()}@veggieai.test`);",
        "pm.collectionVariables.set('today', new Date(Date.now() + 7 * 3600 * 1000).toISOString().slice(0, 10));",
    ]}}],
    "variable": [{"key": k, "value": v} for k, v in [
        ("baseUrl", "http://localhost:59610"), ("email", ""), ("password", "Test@1234"), ("token", ""), ("refreshToken", ""),
        ("otp", ""), ("resetOtp", ""), ("today", ""), ("allergyId", "1"), ("categoryId", ""), ("ingredientId", "1"),
        ("recipeId", "1"), ("recipeId2", "2"), ("planId", ""), ("planItemId", ""), ("planItemId2", ""), ("planStartDate", ""),
        ("manualItemId", ""), ("shoppingItemId", ""), ("uploadUrl", ""), ("scanId", ""), ("chatSessionId", ""), ("mealLogId", ""),
        ("notificationId", ""), ("postId", ""), ("commentId", ""), ("reportId", "")]],
    "item": items,
}

import os
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "postman", "VeggieAI.postman_collection.json")
json.dump(collection, open(out, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print("requests:", sum(len(f["item"]) for f in items))
