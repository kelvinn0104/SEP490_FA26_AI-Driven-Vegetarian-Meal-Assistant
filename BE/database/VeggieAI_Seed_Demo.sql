-- =====================================================================
-- VeggieAI - DEMO SEED DATA (run AFTER VeggieAI_Database.sql)
-- Adds: 1 system moderator (cannot log in), 34 more ingredients,
--       25 published vegetarian recipes (nutrition auto-calculated by trigger),
--       sample vegan shops.  Re-runnable (idempotent).
-- Nutrition per 100 g: approximate values from USDA FoodData Central
-- (to be verified by a moderator before production use).
-- =====================================================================
SET search_path TO veggieai;

-- ---------- system moderator (owner/verifier of seed recipes) ----------
-- PasswordHash 'AA==' is not a valid ASP.NET Identity hash -> this account can never log in.
INSERT INTO "User" ("Email", "PasswordHash", "DisplayName", "Role", "Status")
VALUES ('system.moderator@veggieai.local', 'AA==', 'VeggieAI Nutrition Team', 'moderator', 'locked')
ON CONFLICT ("Email") DO NOTHING;

DELETE FROM "VeganShop" WHERE "Tags" LIKE '%[demo]%';

-- ---------- ingredients ----------
INSERT INTO "Ingredient"
    ("Name", "KcalPer100g", "ProteinPer100g", "CarbPer100g", "FatPer100g",
     "IronPer100g", "B12Per100g", "CalciumPer100g", "ZincPer100g", "DataSource") VALUES
    ('Tempeh',                        192, 20.30,  7.60, 10.80,  2.70, 0.08, 111.00, 1.14, 'USDA FoodData Central'),
    ('Chickpeas, cooked',             164,  8.86, 27.40,  2.59,  2.89, 0.00,  49.00, 1.53, 'USDA FoodData Central'),
    ('Oats, rolled',                  379, 13.20, 67.70,  6.52,  4.25, 0.00,  52.00, 3.64, 'USDA FoodData Central'),
    ('Banana',                         89,  1.09, 22.80,  0.33,  0.26, 0.00,   5.00, 0.15, 'USDA FoodData Central'),
    ('Tomato',                         18,  0.88,  3.89,  0.20,  0.27, 0.00,  10.00, 0.17, 'USDA FoodData Central'),
    ('Carrot',                         41,  0.93,  9.58,  0.24,  0.30, 0.00,  33.00, 0.24, 'USDA FoodData Central'),
    ('Bok choy',                       13,  1.50,  2.18,  0.20,  0.80, 0.00, 105.00, 0.19, 'USDA FoodData Central'),
    ('Rice noodles (bun/pho), cooked',108,  1.79, 24.00,  0.20,  0.14, 0.00,   4.00, 0.25, 'USDA FoodData Central'),
    ('White rice, cooked',            130,  2.69, 28.20,  0.28,  0.20, 0.00,  10.00, 0.49, 'USDA FoodData Central'),
    ('Sweet potato, cooked',           90,  2.01, 20.70,  0.15,  0.69, 0.00,  38.00, 0.32, 'USDA FoodData Central'),
    ('Pumpkin',                        26,  1.00,  6.50,  0.10,  0.80, 0.00,  21.00, 0.32, 'USDA FoodData Central'),
    ('Edamame',                       121, 11.90,  8.91,  5.20,  2.27, 0.00,  63.00, 1.37, 'USDA FoodData Central'),
    ('Sesame seeds',                  573, 17.70, 23.40, 49.70, 14.60, 0.00, 975.00, 7.75, 'USDA FoodData Central'),
    ('Cashews',                       553, 18.20, 30.20, 43.80,  6.68, 0.00,  37.00, 5.78, 'USDA FoodData Central'),
    ('Nutritional yeast, fortified',  375, 50.00, 36.00,  5.00,  3.60, 24.00, 30.00, 7.00, 'Label average (fortified)'),
    ('Water spinach (rau muong)',      19,  2.60,  3.14,  0.20,  1.67, 0.00,  77.00, 0.18, 'USDA FoodData Central'),
    ('Bean sprouts',                   30,  3.04,  5.94,  0.18,  0.91, 0.00,  13.00, 0.41, 'USDA FoodData Central'),
    ('Oyster mushroom',                33,  3.31,  6.09,  0.41,  1.33, 0.00,   3.00, 0.77, 'USDA FoodData Central'),
    ('Whole wheat bread',             252, 12.40, 43.10,  3.50,  2.47, 0.00, 163.00, 1.80, 'USDA FoodData Central'),
    ('Avocado',                       160,  2.00,  8.53, 14.70,  0.55, 0.00,  12.00, 0.64, 'USDA FoodData Central'),
    ('Orange',                         47,  0.94, 11.80,  0.12,  0.10, 0.00,  40.00, 0.07, 'USDA FoodData Central'),
    ('Coconut milk',                  230,  2.29,  5.54, 23.80,  1.64, 0.00,  16.00, 0.67, 'USDA FoodData Central'),
    ('Vegetable oil',                 884,  0.00,  0.00,100.00,  0.05, 0.00,   0.00, 0.00, 'USDA FoodData Central'),
    ('Soy sauce',                      53,  8.14,  4.93,  0.57,  1.45, 0.00,  33.00, 0.43, 'USDA FoodData Central'),
    ('Black beans, cooked',           132,  8.86, 23.70,  0.54,  2.10, 0.00,  27.00, 1.12, 'USDA FoodData Central'),
    ('Mung beans, cooked',            105,  7.02, 19.20,  0.38,  1.40, 0.00,  27.00, 0.84, 'USDA FoodData Central'),
    ('Cucumber',                       15,  0.65,  3.63,  0.11,  0.28, 0.00,  16.00, 0.20, 'USDA FoodData Central'),
    ('Lotus seeds, dried',            332, 15.40, 64.50,  1.97,  3.53, 0.00, 163.00, 1.05, 'USDA FoodData Central'),
    ('Sweet corn, cooked',             96,  3.41, 21.00,  1.50,  0.45, 0.00,   3.00, 0.62, 'USDA FoodData Central'),
    ('Glutinous rice, cooked',         97,  2.02, 21.10,  0.19,  0.14, 0.00,   2.00, 0.41, 'USDA FoodData Central'),
    ('Cabbage',                        25,  1.28,  5.80,  0.10,  0.47, 0.00,  40.00, 0.18, 'USDA FoodData Central'),
    ('Mango',                          60,  0.82, 15.00,  0.38,  0.16, 0.00,  11.00, 0.09, 'USDA FoodData Central'),
    ('Chia seeds',                    486, 16.50, 42.10, 30.70,  7.72, 0.00, 631.00, 4.58, 'USDA FoodData Central'),
    ('Silken tofu',                    55,  4.80,  2.90,  2.70,  0.83, 0.00,  31.00, 0.50, 'USDA FoodData Central')
ON CONFLICT ("Name") DO NOTHING;

INSERT INTO "IngredientAllergy" ("IngredientId", "AllergyId")
SELECT i."Id", a."Id" FROM "Ingredient" i JOIN "Allergy" a ON
     (i."Name" IN ('Tempeh', 'Edamame', 'Silken tofu', 'Soy sauce') AND a."Name" = 'Soy')
  OR (i."Name" IN ('Soy sauce', 'Whole wheat bread')               AND a."Name" = 'Gluten')
  OR (i."Name" = 'Sesame seeds'                                    AND a."Name" = 'Sesame')
  OR (i."Name" = 'Cashews'                                         AND a."Name" = 'Tree nuts')
  OR (i."Name" = 'Oyster mushroom'                                 AND a."Name" = 'Mushroom')
ON CONFLICT DO NOTHING;

-- ---------- helper: add a published recipe from {ingredient name: grams} ----------
CREATE OR REPLACE FUNCTION pg_temp.add_recipe(p_title TEXT, p_category TEXT, p_servings INT, p_instructions TEXT, p_ings JSONB)
RETURNS void AS $$
DECLARE
    v_mod INT := (SELECT "Id" FROM veggieai."User" WHERE "Email" = 'system.moderator@veggieai.local');
    v_cat INT := (SELECT "Id" FROM veggieai."Category" WHERE "Name" = p_category AND "Type" = 'recipe');
    v_id  INT;
    k TEXT; v JSONB;
BEGIN
    IF v_cat IS NULL THEN RAISE EXCEPTION 'Unknown category %', p_category; END IF;
    IF EXISTS (SELECT 1 FROM veggieai."Recipe" WHERE "Title" = p_title AND "CreatedBy" = v_mod) THEN RETURN; END IF;  -- idempotent
    INSERT INTO veggieai."Recipe" ("CategoryId", "CreatedBy", "VerifiedBy", "Title", "Instructions", "Servings", "Status", "VerifiedAt")
    VALUES (v_cat, v_mod, v_mod, p_title, p_instructions, p_servings, 'published', now())
    RETURNING "Id" INTO v_id;
    FOR k, v IN SELECT * FROM jsonb_each(p_ings) LOOP
        IF NOT EXISTS (SELECT 1 FROM veggieai."Ingredient" WHERE "Name" = k) THEN
            RAISE EXCEPTION 'Unknown ingredient % in recipe %', k, p_title;
        END IF;
        INSERT INTO veggieai."RecipeIngredient" ("RecipeId", "IngredientId", "QuantityG")
        SELECT v_id, "Id", (v #>> '{}')::NUMERIC FROM veggieai."Ingredient" WHERE "Name" = k;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ---------- Breakfast ----------
SELECT pg_temp.add_recipe('Yến mạch sữa đậu nành chuối hạt chia', 'Breakfast', 1,
 E'1. Nấu yến mạch với sữa đậu nành 3–4 phút.\n2. Thêm chuối thái lát và hạt chia.\n3. Để nguội 2 phút rồi dùng.',
 '{"Oats, rolled":60,"Soy milk, fortified":250,"Banana":100,"Chia seeds":10}');
SELECT pg_temp.add_recipe('Bánh mì nguyên cám kẹp đậu phụ sốt cà', 'Breakfast', 1,
 E'1. Áp chảo đậu phụ với ít dầu đến vàng.\n2. Xào cà chua thành sốt, cho đậu vào đảo đều.\n3. Kẹp vào bánh mì nguyên cám.',
 '{"Whole wheat bread":100,"Firm tofu (calcium-set)":120,"Tomato":60,"Vegetable oil":5}');
SELECT pg_temp.add_recipe('Xôi đậu xanh mè rang', 'Breakfast', 1,
 E'1. Ngâm nếp và đậu xanh qua đêm.\n2. Hấp chín 30 phút.\n3. Rưới nước cốt dừa, rắc mè rang.',
 '{"Glutinous rice, cooked":200,"Mung beans, cooked":80,"Sesame seeds":8,"Coconut milk":20}');
SELECT pg_temp.add_recipe('Cháo yến mạch nấm hương đậu hũ non', 'Breakfast', 1,
 E'1. Nấu yến mạch với nước dùng rau củ.\n2. Thêm cà rốt, nấm hương, cải thìa.\n3. Cho đậu hũ non, nêm nước tương.',
 '{"Oats, rolled":50,"Carrot":50,"Shiitake mushroom, raw":50,"Bok choy":60,"Silken tofu":100,"Soy sauce":10}');
SELECT pg_temp.add_recipe('Sinh tố bơ chuối sữa đậu nành', 'Breakfast', 1,
 E'1. Cho bơ, chuối, sữa đậu nành vào máy xay.\n2. Xay mịn, thêm hạt chia.',
 '{"Avocado":80,"Banana":100,"Soy milk, fortified":250,"Chia seeds":10}');

-- ---------- Main dish ----------
SELECT pg_temp.add_recipe('Đậu phụ sốt cà chua & cơm gạo lứt', 'Main dish', 1,
 E'1. Chiên đậu phụ vàng đều.\n2. Phi hành, xào cà chua nhừ, nêm nước tương.\n3. Cho đậu vào rim 5 phút, ăn kèm cơm gạo lứt.',
 '{"Firm tofu (calcium-set)":150,"Tomato":150,"Vegetable oil":8,"Brown rice, cooked":200,"Soy sauce":5}');
SELECT pg_temp.add_recipe('Cà ri chay đậu gà khoai lang', 'Main dish', 1,
 E'1. Phi sả, bột cà ri.\n2. Cho khoai lang, cà rốt, đậu gà, nước cốt dừa, nấu 20 phút.\n3. Ăn với cơm trắng.',
 '{"Chickpeas, cooked":150,"Sweet potato, cooked":150,"Coconut milk":60,"Carrot":60,"Vegetable oil":5,"White rice, cooked":120}');
SELECT pg_temp.add_recipe('Bún xào tempeh rau củ', 'Main dish', 1,
 E'1. Áp chảo tempeh thái miếng.\n2. Xào giá, cà rốt, cho bún vào đảo.\n3. Nêm nước tương, thêm tempeh.',
 '{"Rice noodles (bun/pho), cooked":200,"Tempeh":100,"Bean sprouts":60,"Carrot":40,"Vegetable oil":10,"Soy sauce":10}');
SELECT pg_temp.add_recipe('Cơm chiên đậu nành Nhật & bắp', 'Main dish', 1,
 E'1. Xào cà rốt, bắp, đậu nành Nhật.\n2. Cho cơm vào chiên tơi, nêm nước tương.',
 '{"White rice, cooked":200,"Edamame":80,"Sweet corn, cooked":60,"Carrot":40,"Vegetable oil":10,"Soy sauce":8}');
SELECT pg_temp.add_recipe('Rau muống xào tỏi, đậu phụ chiên & cơm', 'Main dish', 1,
 E'1. Chiên đậu phụ.\n2. Xào rau muống với tỏi lửa lớn.\n3. Dọn kèm cơm trắng.',
 '{"Water spinach (rau muong)":200,"Firm tofu (calcium-set)":120,"Vegetable oil":12,"White rice, cooked":180}');
SELECT pg_temp.add_recipe('Nấm sò kho tiêu, đậu phụ & cơm gạo lứt', 'Main dish', 1,
 E'1. Xé nấm sò, ướp nước tương, tiêu.\n2. Kho liu riu cùng đậu phụ 15 phút.\n3. Ăn với cơm gạo lứt.',
 '{"Oyster mushroom":200,"Firm tofu (calcium-set)":80,"Soy sauce":15,"Vegetable oil":8,"Brown rice, cooked":200}');
SELECT pg_temp.add_recipe('Đậu lăng hầm cà chua rau bina', 'Main dish', 1,
 E'1. Phi hành, cho cà chua và đậu lăng, hầm 15 phút.\n2. Thêm rau bina cuối cùng.\n3. Ăn kèm bánh mì nguyên cám.',
 '{"Lentils, cooked":200,"Tomato":120,"Spinach, raw":80,"Vegetable oil":8,"Whole wheat bread":60}');
SELECT pg_temp.add_recipe('Bông cải xanh xào đậu phụ nấm hương & cơm lứt', 'Main dish', 1,
 E'1. Chần bông cải.\n2. Xào nấm hương, đậu phụ, bông cải, nêm nước tương.\n3. Dọn với cơm gạo lứt.',
 '{"Broccoli, raw":150,"Firm tofu (calcium-set)":120,"Shiitake mushroom, raw":60,"Vegetable oil":10,"Brown rice, cooked":180,"Soy sauce":8}');

-- ---------- Soup ----------
SELECT pg_temp.add_recipe('Canh nấm hạt sen rau củ', 'Soup', 1,
 E'1. Hầm hạt sen 20 phút.\n2. Thêm nấm hương, cà rốt, cải thìa.\n3. Cho đậu hũ non, nêm nhạt.',
 '{"Shiitake mushroom, raw":80,"Lotus seeds, dried":30,"Carrot":60,"Bok choy":80,"Silken tofu":150}');
SELECT pg_temp.add_recipe('Canh bí đỏ đậu xanh', 'Soup', 1,
 E'1. Nấu đậu xanh mềm.\n2. Cho bí đỏ cắt khối, nấu chín.\n3. Nêm muối, tiêu, hành lá.',
 '{"Pumpkin":200,"Mung beans, cooked":100,"Vegetable oil":5}');
SELECT pg_temp.add_recipe('Phở chay nấm đậu phụ', 'Soup', 1,
 E'1. Nấu nước dùng rau củ với quế, hồi.\n2. Trụng bánh phở, xếp đậu phụ, nấm, cải.\n3. Chan nước dùng, thêm giá.',
 '{"Rice noodles (bun/pho), cooked":250,"Shiitake mushroom, raw":60,"Firm tofu (calcium-set)":100,"Bean sprouts":50,"Bok choy":50}');
SELECT pg_temp.add_recipe('Súp đậu lăng cà rốt', 'Soup', 1,
 E'1. Xào cà rốt, cà chua.\n2. Cho đậu lăng và nước, nấu 20 phút.\n3. Xay nhuyễn một nửa cho sánh.',
 '{"Lentils, cooked":180,"Carrot":80,"Tomato":100,"Vegetable oil":6}');
SELECT pg_temp.add_recipe('Đậu đen hầm bí đỏ nước cốt dừa', 'Soup', 1,
 E'1. Hầm đậu đen mềm.\n2. Thêm bí đỏ, nước cốt dừa, nấu 10 phút.',
 '{"Black beans, cooked":150,"Pumpkin":200,"Coconut milk":40,"Vegetable oil":5}');

-- ---------- Salad ----------
SELECT pg_temp.add_recipe('Gỏi cuốn chay đậu phụ', 'Salad', 1,
 E'1. Chiên đậu phụ thái thanh.\n2. Cuốn bánh tráng với bún, dưa leo, cà rốt, giá, đậu phụ.\n3. Chấm tương đậu phộng.',
 '{"Rice noodles (bun/pho), cooked":100,"Firm tofu (calcium-set)":100,"Cucumber":60,"Carrot":40,"Bean sprouts":40,"Peanuts, raw":20}');
SELECT pg_temp.add_recipe('Salad bơ đậu gà rau bina', 'Salad', 1,
 E'1. Trộn rau bina, cà chua, đậu gà.\n2. Thêm bơ cắt khối, rắc mè, sốt chanh dầu ô liu.',
 '{"Avocado":70,"Chickpeas, cooked":120,"Spinach, raw":60,"Tomato":80,"Sesame seeds":5}');
SELECT pg_temp.add_recipe('Salad bông cải tempeh mè rang', 'Salad', 1,
 E'1. Chần bông cải.\n2. Áp chảo tempeh.\n3. Trộn với nước tương, dầu mè, rắc mè rang.',
 '{"Broccoli, raw":150,"Tempeh":100,"Sesame seeds":10,"Soy sauce":8,"Vegetable oil":5}');

-- ---------- Dessert / snack ----------
SELECT pg_temp.add_recipe('Chè đậu xanh hạt sen', 'Dessert', 1,
 E'1. Nấu đậu xanh và hạt sen mềm.\n2. Thêm ít đường, nước cốt dừa.',
 '{"Mung beans, cooked":100,"Lotus seeds, dried":20,"Coconut milk":30}');
SELECT pg_temp.add_recipe('Pudding hạt chia xoài', 'Dessert', 1,
 E'1. Ngâm hạt chia trong sữa đậu nành 4 giờ.\n2. Phủ xoài chín cắt hạt lựu.',
 '{"Chia seeds":20,"Soy milk, fortified":200,"Mango":100}');
SELECT pg_temp.add_recipe('Hạt điều rang & cam tươi', 'Dessert', 1,
 E'Ăn nhẹ giữa buổi: 1 nắm hạt điều rang và 1 quả cam.',
 '{"Cashews":30,"Orange":150}');
SELECT pg_temp.add_recipe('Khoai lang luộc & sữa đậu nành', 'Dessert', 1,
 E'Luộc khoai lang chín mềm, dùng kèm 1 ly sữa đậu nành.',
 '{"Sweet potato, cooked":200,"Soy milk, fortified":200}');
SELECT pg_temp.add_recipe('Sữa chua đậu nành men dinh dưỡng & chuối (tăng B12)', 'Dessert', 1,
 E'Trộn sữa đậu nành đặc với chuối nghiền, rắc 1 thìa men dinh dưỡng tăng cường B12.',
 '{"Soy milk, fortified":200,"Banana":100,"Nutritional yeast, fortified":8}');

-- ---------- sample vegan shops (fictional demo data) ----------
INSERT INTO "VeganShop" ("Name", "Address", "Latitude", "Longitude", "Phone", "Tags") VALUES
 ('Quán Chay An Nhiên (demo)',  'Quận 1, TP. Hồ Chí Minh',      10.776889, 106.700806, NULL, 'phở chay, bún chay, cơm chay [demo]'),
 ('Bếp Chay Lá Sen (demo)',     'Quận 3, TP. Hồ Chí Minh',      10.784000, 106.686000, NULL, 'lẩu nấm, đậu phụ, cơm chay [demo]'),
 ('Tiệm Thuần Chay Mộc (demo)', 'TP. Thủ Đức, TP. Hồ Chí Minh', 10.841000, 106.809000, NULL, 'salad, sinh tố, tempeh [demo]'),
 ('Chay Xanh Hà Nội (demo)',    'Hoàn Kiếm, Hà Nội',            21.028511, 105.854167, NULL, 'bún chay, nem chay, chè [demo]');

-- quick check
SELECT r."Title", c."Name" AS category, r."KcalPerServing", r."ProteinG", r."IronMg", r."B12Mcg"
FROM "Recipe" r JOIN "Category" c ON c."Id" = r."CategoryId" ORDER BY c."Name", r."Id";
