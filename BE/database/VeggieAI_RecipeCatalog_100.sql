-- VeggieAI: 100 công thức biên soạn, nhập để moderator kiểm duyệt.
-- PostgreSQL, chạy trên schema đã có. USDA SR Legacy April 2018 (dinh dưỡng trên 100 g).
-- Giữ dữ liệu đã có. Không xuất bản hoặc gán người duyệt khi nhập.
BEGIN;
SET LOCAL search_path TO veggieai, public;
SELECT pg_advisory_xact_lock(hashtext('veggieai-catalog-100-v1'));

CREATE TEMP TABLE catalog_food (
    key text PRIMARY KEY, name text UNIQUE NOT NULL, fdc_id integer UNIQUE NOT NULL,
    kcal numeric, protein numeric, carb numeric, fat numeric,
    iron numeric, b12 numeric, calcium numeric, zinc numeric, allergens text[]
) ON COMMIT DROP;

INSERT INTO catalog_food VALUES
    ('tofu', 'Đậu hũ cứng kết tủa canxi', 172475, 144, 17.27, 2.78, 8.72, 2.66, 0, 683, 1.57, ARRAY['soy']::text[]), -- Tofu, raw, firm, prepared with calcium sulfate
    ('soft', 'Đậu hũ mềm', 172449, 61, 7.17, 1.18, 3.69, 1.11, 0, 111, 0.64, ARRAY['soy']::text[]), -- Tofu, soft, prepared with calcium sulfate and magnesium chloride (nigari)
    ('tempeh', 'Tempeh đậu nành đã nấu', 172467, 195, 19.91, 7.62, 11.38, 2.13, 0.14, 96, 1.57, ARRAY['soy']::text[]), -- Tempeh, cooked
    ('chickpea', 'Đậu gà luộc không muối', 173757, 164, 8.86, 27.42, 2.59, 2.89, 0, 49, 1.53, ARRAY[]::text[]), -- Chickpeas (garbanzo beans, bengal gram), mature seeds, cooked, boiled, without salt
    ('lentil', 'Đậu lăng luộc không muối', 172421, 116, 9.02, 20.13, 0.38, 3.33, 0, 19, 1.27, ARRAY[]::text[]), -- Lentils, mature seeds, cooked, boiled, without salt
    ('mung', 'Đậu xanh luộc không muối', 174257, 105, 7.02, 19.15, 0.38, 1.4, 0, 27, 0.84, ARRAY[]::text[]), -- Mung beans, mature seeds, cooked, boiled, without salt
    ('black', 'Đậu đen luộc không muối', 173735, 132, 8.86, 23.71, 0.54, 2.1, 0, 27, 1.12, ARRAY[]::text[]), -- Beans, black, mature seeds, cooked, boiled, without salt
    ('kidney', 'Đậu thận đỏ luộc không muối', 175194, 127, 8.67, 22.8, 0.5, 2.94, 0, 28, 1.07, ARRAY[]::text[]), -- Beans, kidney, red, mature seeds, cooked, boiled, without salt
    ('white', 'Đậu trắng luộc không muối', 175203, 139, 9.73, 25.09, 0.35, 3.7, 0, 90, 1.38, ARRAY[]::text[]), -- Beans, white, mature seeds, cooked, boiled, without salt
    ('edamame', 'Đậu nành non đã luộc', 168411, 121, 11.91, 8.91, 5.2, 2.27, 0, 63, 1.37, ARRAY['soy']::text[]), -- Edamame, frozen, prepared
    ('bun', 'Bún gạo đã chín', 168914, 108, 1.79, 24.01, 0.2, 0.14, 0, 4, 0.25, ARRAY[]::text[]), -- Rice noodles, cooked
    ('quinoa', 'Hạt quinoa đã nấu', 168917, 120, 4.4, 21.3, 1.92, 1.49, 0, 17, 1.09, ARRAY[]::text[]), -- Quinoa, cooked
    ('oat', 'Yến mạch cán khô', 173904, 379, 13.15, 67.7, 6.52, 4.25, 0, 52, 3.64, ARRAY['gluten']::text[]), -- Cereals, oats, regular and quick, not fortified, dry
    ('rice', 'Cơm gạo trắng không muối', 169757, 130, 2.69, 28.17, 0.28, 0.2, 0, 10, 0.49, ARRAY[]::text[]), -- Rice, white, long-grain, regular, unenriched, cooked without salt
    ('brown', 'Cơm gạo lứt đã nấu', 169704, 123, 2.74, 25.58, 0.97, 0.56, 0, 3, 0.71, ARRAY[]::text[]), -- Rice, brown, long-grain, cooked (Includes foods for USDA's Food Distribution Program)
    ('oyster', 'Nấm bào ngư tươi', 168580, 33, 3.31, 6.09, 0.41, 1.33, 0, 3, 0.77, ARRAY['mushroom']::text[]), -- Mushrooms, oyster, raw
    ('shiitakec', 'Nấm hương luộc không muối', 168437, 56, 1.56, 14.39, 0.22, 0.44, 0, 3, 1.33, ARRAY['mushroom']::text[]), -- Mushrooms, shiitake, cooked, without salt
    ('mushroom', 'Nấm mỡ tươi', 169251, 22, 3.09, 3.26, 0.34, 0.5, 0.04, 3, 0.52, ARRAY['mushroom']::text[]), -- Mushrooms, white, raw
    ('bok', 'Cải thìa', 170390, 13, 1.5, 2.18, 0.2, 0.8, 0, 105, 0.19, ARRAY[]::text[]), -- Cabbage, chinese (pak-choi), raw
    ('coconut', 'Nước cốt dừa tươi', 170172, 230, 2.29, 5.54, 23.84, 1.64, 0, 16, 0.67, ARRAY[]::text[]), -- Nuts, coconut milk, raw (liquid expressed from grated meat and water)
    ('soyalt', 'Sữa đậu nành ít béo không đường bổ sung canxi', 173768, 34, 2.62, 3.85, 0.85, 0.46, 0.23, 123, 0.1, ARRAY['soy']::text[]), -- Soymilk, original and vanilla, light, unsweetened, with added calcium, vitamins A and D
    ('lotus', 'Hạt sen khô', 170149, 332, 15.41, 64.47, 1.97, 3.53, 0, 163, 1.05, ARRAY[]::text[]), -- Seeds, lotus seeds, dried
    ('lime', 'Nước cốt chanh xanh', 168156, 25, 0.42, 8.42, 0.07, 0.09, 0, 14, 0.08, ARRAY[]::text[]), -- Lime juice, raw
    ('pineapple', 'Dứa tươi', 169124, 50, 0.54, 13.12, 0.12, 0.29, 0, 13, 0.12, ARRAY[]::text[]), -- Pineapple, raw, all varieties
    ('cucumber', 'Dưa leo để vỏ', 168409, 15, 0.65, 3.63, 0.11, 0.28, 0, 16, 0.2, ARRAY[]::text[]), -- Cucumber, with peel, raw
    ('pumpkin', 'Bí đỏ tươi', 168448, 26, 1, 6.5, 0.1, 0.8, 0, 21, 0.32, ARRAY[]::text[]), -- Pumpkin, raw
    ('spinach', 'Cải bó xôi', 168462, 23, 2.86, 3.63, 0.39, 2.71, 0, 99, 0.53, ARRAY[]::text[]), -- Spinach, raw
    ('sweet', 'Khoai lang tươi', 168482, 86, 1.57, 20.12, 0.05, 0.61, 0, 30, 0.3, ARRAY[]::text[]), -- Sweet potato, raw, unprepared (Includes foods for USDA's Food Distribution Program)
    ('corn', 'Ngô vàng luộc không muối', 169999, 96, 3.41, 20.98, 1.5, 0.45, 0, 3, 0.62, ARRAY[]::text[]), -- Corn, sweet, yellow, cooked, boiled, drained, without salt
    ('whole', 'Bột mì nguyên cám', 168893, 340, 13.21, 71.97, 2.5, 3.6, 0, 34, 2.6, ARRAY['gluten']::text[]), -- Wheat flour, whole-grain (Includes foods for USDA's Food Distribution Program)
    ('mango', 'Xoài tươi', 169910, 60, 0.82, 14.98, 0.38, 0.16, 0, 11, 0.09, ARRAY[]::text[]), -- Mangos, raw
    ('papaya', 'Đu đủ tươi', 169926, 43, 0.47, 10.82, 0.26, 0.25, 0, 20, 0.08, ARRAY[]::text[]), -- Papayas, raw
    ('cabbage', 'Bắp cải trắng', 169975, 25, 1.28, 5.8, 0.1, 0.47, 0, 40, 0.18, ARRAY[]::text[]), -- Cabbage, raw
    ('purple', 'Bắp cải tím', 169977, 31, 1.43, 7.37, 0.16, 0.8, 0, 45, 0.22, ARRAY[]::text[]), -- Cabbage, red, raw
    ('napa', 'Cải thảo', 169979, 16, 1.2, 3.23, 0.2, 0.31, 0, 77, 0.23, ARRAY[]::text[]), -- Cabbage, chinese (pe-tsai), raw
    ('cauli', 'Súp lơ trắng', 169986, 25, 1.92, 4.97, 0.28, 0.42, 0, 22, 0.27, ARRAY[]::text[]), -- Cauliflower, raw
    ('celery', 'Cần tây', 169988, 14, 0.69, 2.97, 0.17, 0.2, 0, 40, 0.13, ARRAY[]::text[]), -- Celery, raw
    ('cilantro', 'Rau mùi tươi', 169997, 23, 2.13, 3.67, 0.52, 1.77, 0, 67, 0.5, ARRAY[]::text[]), -- Coriander (cilantro) leaves, raw
    ('onion', 'Hành tây', 170000, 40, 1.1, 9.34, 0.1, 0.21, 0, 23, 0.17, ARRAY[]::text[]), -- Onions, raw
    ('scallion', 'Hành lá', 170005, 32, 1.83, 7.34, 0.19, 1.48, 0, 72, 0.39, ARRAY[]::text[]), -- Onions, spring or scallions (includes tops and bulb), raw
    ('pepper', 'Ớt chuông đỏ', 170108, 26, 0.99, 6.03, 0.3, 0.43, 0, 7, 0.25, ARRAY[]::text[]), -- Peppers, sweet, red, raw
    ('sesame', 'Mè nguyên vỏ rang', 170151, 565, 16.96, 25.74, 48, 14.76, 0, 989, 7.16, ARRAY['sesame']::text[]), -- Seeds, sesame seeds, whole, roasted and toasted
    ('cashew', 'Hạt điều chưa rang', 170162, 553, 18.22, 30.19, 43.85, 6.68, 0, 37, 5.78, ARRAY['tree']::text[]), -- Nuts, cashew nuts, raw
    ('broccoli', 'Bông cải xanh', 170379, 34, 2.82, 6.64, 0.37, 0.73, 0, 47, 0.41, ARRAY[]::text[]), -- Broccoli, raw
    ('carrot', 'Cà rốt tươi', 170393, 41, 0.93, 9.58, 0.24, 0.3, 0, 33, 0.24, ARRAY[]::text[]), -- Carrots, raw
    ('tomato', 'Cà chua chín', 170457, 18, 0.88, 3.89, 0.2, 0.27, 0, 10, 0.17, ARRAY[]::text[]), -- Tomatoes, red, ripe, raw, year round average
    ('chia', 'Hạt chia khô', 170554, 486, 16.54, 42.12, 30.74, 7.72, 0, 631, 4.58, ARRAY[]::text[]), -- Seeds, chia seeds, dried
    ('curry', 'Bột cà ri', 170924, 325, 14.29, 55.83, 14.01, 19.1, 0, 525, 4.7, ARRAY[]::text[]), -- Spices, curry powder
    ('blackpep', 'Tiêu đen xay', 170931, 251, 10.39, 63.95, 3.26, 9.71, 0, 443, 1.19, ARRAY[]::text[]), -- Spices, pepper, black
    ('cinnamon', 'Bột quế', 171320, 247, 3.99, 80.59, 1.24, 8.32, 0, 1002, 1.83, ARRAY[]::text[]), -- Spices, cinnamon, ground
    ('apple', 'Táo tươi để vỏ', 171688, 52, 0.26, 13.81, 0.17, 0.12, 0, 6, 0.04, ARRAY[]::text[]), -- Apples, raw, with skin (Includes foods for USDA's Food Distribution Program)
    ('avocado', 'Bơ tươi', 171705, 160, 2, 8.53, 14.66, 0.55, 0, 12, 0.64, ARRAY[]::text[]), -- Avocados, raw, all commercial varieties
    ('turmeric', 'Bột nghệ', 172231, 312, 9.68, 67.14, 3.25, 55, 0, 168, 4.5, ARRAY[]::text[]), -- Spices, turmeric, ground
    ('basil', 'Húng quế tươi', 172232, 23, 3.15, 2.65, 0.64, 3.17, 0, 177, 0.81, ARRAY[]::text[]), -- Basil, fresh
    ('oil', 'Dầu hạt cải', 172336, 884, 0, 0, 100, 0, 0, 0, 0, ARRAY[]::text[]), -- Oil, canola
    ('soysauce', 'Nước tương đậu nành và lúa mì', 174277, 53, 8.14, 4.93, 0.57, 1.45, 0, 33, 0.87, ARRAY['soy', 'gluten']::text[]), -- Soy sauce made from soy and wheat (shoyu)
    ('bread', 'Bánh mì nguyên cám', 172688, 252, 12.45, 42.71, 3.5, 2.47, 0, 161, 1.77, ARRAY['gluten']::text[]), -- Bread, whole-wheat, commercially prepared
    ('salt', 'Muối ăn', 173468, 0, 0, 0, 0, 0.33, 0, 24, 0.1, ARRAY[]::text[]), -- Salt, table
    ('vinegar', 'Giấm táo', 173469, 21, 0, 0.93, 0, 0.2, 0, 7, 0.04, ARRAY[]::text[]), -- Vinegar, cider
    ('mint', 'Bạc hà tươi', 173475, 44, 3.29, 8.41, 0.73, 11.87, 0, 199, 1.09, ARRAY[]::text[]), -- Spearmint, fresh
    ('water', 'Nước uống', 173647, 0, 0, 0, 0, 0, 0, 3, 0.01, ARRAY[]::text[]), -- Beverages, water, tap, drinking
    ('peanut', 'Đậu phộng rang không muối', 173806, 587, 24.35, 21.26, 49.66, 1.58, 0, 58, 2.77, ARRAY['peanut']::text[]), -- Peanuts, all types, dry-roasted, without salt
    ('banana', 'Chuối chín', 173944, 89, 1.09, 22.84, 0.33, 0.26, 0, 5, 0.15, ARRAY[]::text[]), -- Bananas, raw
    ('cornflour', 'Tinh bột bắp', 169698, 381, 0.26, 91.27, 0.05, 0.47, 0, 2, 0.06, ARRAY[]::text[]), -- Cornstarch
    ('garlic', 'Tỏi tươi', 169230, 149, 6.36, 33.06, 0.5, 1.7, 0, 181, 1.16, ARRAY[]::text[]), -- Garlic, raw
    ('ginger', 'Gừng tươi', 169231, 80, 1.82, 17.77, 0.75, 0.6, 0, 16, 0.34, ARRAY[]::text[]), -- Ginger root, raw
    ('zucchini', 'Bí ngòi để vỏ', 169291, 17, 1.21, 3.11, 0.32, 0.37, 0, 16, 0.32, ARRAY[]::text[]), -- Squash, summer, zucchini, includes skin, raw
    ('eggplant', 'Cà tím tươi', 169228, 25, 0.98, 5.88, 0.18, 0.23, 0, 9, 0.16, ARRAY[]::text[]), -- Eggplant, raw
    ('sugar', 'Đường cát', 169655, 387, 0, 99.98, 0, 0.05, 0, 1, 0.01, ARRAY[]::text[]), -- Sugars, granulated
    ('riceflour', 'Bột gạo trắng', 169714, 366, 5.95, 80.13, 1.42, 0.35, 0, 10, 0.8, ARRAY[]::text[]), -- Rice flour, white, unenriched
    ('orange', 'Cam tươi', 169097, 47, 0.94, 11.75, 0.12, 0.1, 0, 40, 0.07, ARRAY[]::text[]), -- Oranges, raw, all commercial varieties
    ('stickydry', 'Gạo nếp khô', 168883, 370, 6.81, 81.68, 0.55, 1.6, 0, 11, 1.2, ARRAY[]::text[]), -- Rice, white, glutinous, unenriched, uncooked
    ('rau', 'Rau muống tươi', 169301, 19, 2.6, 3.13, 0.2, 1.67, 0, 77, 0.18, ARRAY[]::text[]), -- Water convolvulus,raw
    ('xa', 'Sả tươi', 168573, 99, 1.82, 25.31, 0.49, 8.17, 0, 65, 2.23, ARRAY[]::text[]), -- Lemon grass (citronella), raw
    ('chili', 'Ớt đỏ xay khô', 170932, 318, 12.01, 56.63, 17.27, 7.8, 0, 148, 2.48, ARRAY[]::text[]), -- Spices, pepper, red or cayenne
    ('cacao', 'Bột cacao không đường', 169593, 228, 19.6, 57.9, 13.7, 13.86, 0, 128, 6.81, ARRAY[]::text[]); -- Cocoa, dry powder, unsweetened

INSERT INTO "Ingredient"
    ("Name", "KcalPer100g", "ProteinPer100g", "CarbPer100g", "FatPer100g",
     "IronPer100g", "B12Per100g", "CalciumPer100g", "ZincPer100g", "DataSource", "UpdatedAt")
SELECT name, kcal, protein, carb, fat, iron, b12, calcium, zinc,
       'https://fdc.nal.usda.gov/food-details/' || fdc_id || '/nutrients', now()
FROM catalog_food
ON CONFLICT ("Name") DO NOTHING;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM catalog_food f JOIN "Ingredient" i ON i."Name" = f.name
        WHERE i."DataSource" IS DISTINCT FROM 'https://fdc.nal.usda.gov/food-details/' || f.fdc_id || '/nutrients'
    ) THEN
        RAISE EXCEPTION 'Existing ingredient name has a different nutrition source';
    END IF;
END $$;

-- Khớp cả bộ dị ứng trong schema SQL và tên hiển thị tiếng Việt của ứng dụng.
CREATE TEMP TABLE catalog_allergies ON COMMIT DROP AS
SELECT a."Id" AS id, keys.tag
FROM "Allergy" a
JOIN (VALUES ('soy', 'soy', 'đậu nành'), ('gluten', 'gluten', 'gluten'),
             ('peanut', 'peanut', 'đậu phộng'), ('tree', 'tree', 'hạt cây'),
             ('sesame', 'sesame', 'vừng'), ('mushroom', 'mushroom', 'nấm')) AS keys(tag, en, vi)
  ON lower(a."Name") LIKE '%' || keys.en || '%' OR lower(a."Name") LIKE '%' || keys.vi || '%';

DO $$
BEGIN
    IF (SELECT COUNT(DISTINCT tag) FROM catalog_allergies) <> 6 THEN
        RAISE EXCEPTION 'Catalog requires the six standard VeggieAI allergen groups';
    END IF;
END $$;

INSERT INTO "IngredientAllergy" ("IngredientId", "AllergyId")
SELECT i."Id", a.id
FROM catalog_food f
JOIN "Ingredient" i ON i."Name" = f.name
JOIN catalog_allergies a ON a.tag = ANY(f.allergens)
ON CONFLICT DO NOTHING;

INSERT INTO "User" ("Email", "PasswordHash", "DisplayName", "Role", "Status", "CreatedAt", "TokenVersion")
VALUES ('catalog.import@veggieai.local', 'AA==', 'Kho công thức VeggieAI', 'user', 'locked', now(), 0)
ON CONFLICT ("Email") DO NOTHING;

CREATE TEMP TABLE catalog_recipe (
    title text PRIMARY KEY, category text NOT NULL, portions integer NOT NULL CHECK (portions > 0),
    quantities jsonb NOT NULL, instructions text NOT NULL
) ON COMMIT DROP;

INSERT INTO catalog_recipe VALUES
    ('Cháo yến mạch chuối quế', 'Breakfast', 2, '{"oat":90,"banana":180,"soyalt":320,"water":160,"cinnamon":1,"chia":10}', '1. Đun yến mạch với sữa đậu nành và nước 5 phút, khuấy từ đáy.
2. Dằm một nửa chuối vào cháo khi bắc xuống.
3. Chia hai bát, xếp chuối còn lại rồi rắc quế và hạt chia.'),
    ('Bánh mì bơ nghiền chanh mè', 'Breakfast', 2, '{"bread":140,"avocado":180,"lime":18,"sesame":10,"salt":1}', '1. Nướng bánh mì đến khi hai mặt giòn.
2. Dằm bơ, trộn nước cốt chanh và muối.
3. Phết bơ lên bánh ngay trước khi ăn, rắc mè rang.'),
    ('Cháo gạo lứt đậu xanh gừng', 'Breakfast', 2, '{"brown":240,"mung":160,"water":530,"ginger":10,"scallion":12,"salt":2}', '1. Đun cơm gạo lứt đã nấu với nước 12 phút cho hạt nở mềm.
2. Thêm đậu xanh chín và gừng thái chỉ, đun 6 phút.
3. Nêm muối rồi rắc hành lá lên từng bát.'),
    ('Bún trộn đậu hũ dưa leo và rau mùi', 'Breakfast', 2, '{"bun":300,"tofu":220,"cucumber":160,"cilantro":12,"soysauce":20,"lime":22,"oil":10}', '1. Thấm khô đậu hũ, cắt lát và áp chảo bằng phần dầu đã cân, 3 phút mỗi mặt.
2. Cắt dưa leo, trụng bún đã chín rồi để ráo.
3. Trộn nước tương với chanh, chan lên bún, đậu hũ và rau mùi.'),
    ('Xôi nếp đậu xanh nước cốt dừa', 'Breakfast', 2, '{"stickydry":120,"mung":140,"coconut":45,"sesame":10,"salt":1}', '1. Ngâm gạo nếp 4 giờ, để thật ráo rồi trộn muối.
2. Hấp nếp khoảng 25 phút, xới với đậu xanh đã chín và nước cốt dừa.
3. Hấp tiếp 5 phút, chia phần và rắc mè rang.'),
    ('Bánh yến mạch áp chảo với táo', 'Breakfast', 2, '{"oat":100,"apple":160,"banana":100,"soyalt":120,"cinnamon":1,"oil":8}', '1. Xay yến mạch với chuối, sữa và quế, để bột nghỉ 8 phút.
2. Bào táo rồi vắt nhẹ trước khi trộn vào bột.
3. Chia bột thành bánh nhỏ, áp chảo có dầu 3 phút mỗi mặt tới khi lõi chín.'),
    ('Khoai lang hấp bơ hạt điều', 'Breakfast', 2, '{"sweet":440,"cashew":30,"salt":1,"water":35}', '1. Cắt khoai làm đôi theo chiều dọc và hấp tới khi xiên đũa qua được.
2. Rang hạt điều rồi xay với nước ấm và muối thành sốt sệt.
3. Rạch mặt khoai, rưới sốt và ăn ấm.'),
    ('Cơm sáng cuộn cải thảo nấm và cà rốt', 'Breakfast', 2, '{"rice":300,"napa":180,"oyster":130,"carrot":100,"soysauce":18,"oil":8}', '1. Trụng lá cải thảo 45 giây, ngâm nhanh nước lạnh rồi thấm khô.
2. Xào nấm xé với cà rốt bào và nước tương đến khi chảo ráo.
3. Chia nhân và cơm nóng lên lá cải rồi cuộn chặt.'),
    ('Yến mạch ngâm lạnh xoài và hạt chia', 'Breakfast', 2, '{"oat":100,"soyalt":300,"chia":18,"mango":230}', '1. Khuấy sữa đậu nành với yến mạch và hạt chia trong hai hũ.
2. Đậy nắp, để tủ lạnh ít nhất 6 giờ.
3. Kiểm tra yến mạch đã mềm rồi thêm xoài thái hạt lựu ngay trước khi ăn.'),
    ('Bánh mì kẹp đậu gà nghiền dưa leo', 'Breakfast', 2, '{"bread":160,"chickpea":220,"cucumber":130,"lime":20,"salt":1,"blackpep":1,"oil":8}', '1. Dằm đậu gà chín với dầu, chanh, muối và tiêu, giữ lại một ít hạt nguyên.
2. Nướng bánh và thái mỏng dưa leo.
3. Phết nhân đậu, kẹp dưa leo và cắt đôi.'),
    ('Cháo bí đỏ ngô và hành lá', 'Breakfast', 2, '{"rice":240,"pumpkin":200,"corn":110,"water":540,"scallion":12,"salt":2}', '1. Nấu bí đỏ cắt miếng trong nước khoảng 12 phút rồi dằm một nửa.
2. Thêm cơm và ngô đã chín, nấu liu riu 10 phút.
3. Nêm muối và rắc hành lá.'),
    ('Đậu hũ vụn xào nghệ ăn với bánh mì', 'Breakfast', 2, '{"tofu":300,"turmeric":3,"onion":60,"pepper":100,"spinach":75,"bread":120,"oil":10,"salt":2}', '1. Ép ráo đậu hũ và bóp vụn.
2. Xào hành và ớt chuông bằng dầu, sau đó đảo đậu hũ với nghệ và muối 5 phút.
3. Thêm rau bina, đảo đến khi rau vừa xẹp và dọn cùng bánh mì nóng.'),
    ('Bát quinoa táo quế và hạt điều', 'Breakfast', 2, '{"quinoa":300,"apple":230,"cashew":30,"soyalt":180,"cinnamon":1}', '1. Hâm quinoa đã nấu với sữa đậu nành trong 4 phút.
2. Thêm táo thái mỏng và quế, đun tiếp đến khi táo vừa mềm.
3. Chia bát và rắc hạt điều rang giã thô.'),
    ('Bánh bột gạo đậu xanh áp chảo', 'Breakfast', 2, '{"riceflour":100,"mung":160,"water":180,"oil":12,"scallion":15,"salt":2}', '1. Dằm đậu xanh chín, trộn với bột gạo, nước, hành lá và muối.
2. Để bột nghỉ 10 phút rồi múc thành sáu phần nhỏ.
3. Áp chảo trên lửa vừa với dầu, chờ viền cứng mới lật và rán đến khi giữa bánh chín.'),
    ('Bánh mì cà chua húng quế với đậu hũ', 'Breakfast', 2, '{"bread":150,"tofu":200,"tomato":180,"basil":12,"garlic":5,"oil":12,"salt":2}', '1. Chà mặt bánh nóng với tỏi.
2. Áp chảo đậu hũ, nêm muối rồi xếp lên bánh.
3. Trộn cà chua xắt nhỏ với húng quế và dầu còn lại, múc lên ngay trước khi dùng.'),
    ('Bún nước gừng cải thìa đậu nành non', 'Breakfast', 2, '{"bun":280,"edamame":160,"bok":160,"ginger":14,"water":700,"soysauce":18}', '1. Đun gừng thái lát trong nước 10 phút, thêm nước tương.
2. Luộc cải thìa trong nước dùng rồi cho đậu nành non đã luộc vào hâm nóng.
3. Trụng bún, chia hai bát và chan nước dùng đang nóng.'),
    ('Súp sáng cà rốt đậu lăng sánh', 'Breakfast', 2, '{"carrot":270,"lentil":240,"onion":70,"water":500,"oil":9,"curry":3,"salt":2}', '1. Xào hành với dầu và bột cà ri tới khi thơm.
2. Thêm cà rốt và nước, nấu mềm rồi xay mịn.
3. Khuấy đậu lăng đã luộc vào súp, đun lại và thêm muối.'),
    ('Cơm chiên sáng nấm mỡ và bắp hạt', 'Breakfast', 2, '{"rice":360,"mushroom":190,"corn":120,"scallion":20,"oil":13,"soysauce":18}', '1. Thái nấm mỡ và xào lửa lớn đến khi nước nấm bốc hơi.
2. Thêm cơm nguội được bảo quản lạnh, ngô chín và nước tương, đảo tới khi nóng đều.
3. Tắt bếp rồi trộn hành lá.'),
    ('Sinh tố bơ chuối sữa đậu nành tăng cường', 'Breakfast', 2, '{"avocado":160,"banana":160,"soyalt":350,"lime":10}', '1. Làm lạnh sữa và chuối.
2. Xay với bơ và nước cốt chanh đến khi mịn.
3. Rót ngay sau khi xay và chia đều hai ly.'),
    ('Bánh dẹt khoai lang nguyên cám', 'Breakfast', 2, '{"sweet":260,"whole":100,"water":55,"oil":12,"salt":2}', '1. Hấp chín khoai, nghiền rồi nhào với bột mì, nước và muối.
2. Chia bột thành bốn miếng và cán mỏng.
3. Quét dầu chảo, áp bánh lửa vừa, lật khi xuất hiện đốm vàng và nướng tới khi bột chín.'),
    ('Đậu hũ kho sả nước tương', 'Main dish', 2, '{"tofu":330,"xa":24,"garlic":12,"soysauce":25,"sugar":6,"oil":12,"water":90,"blackpep":1}', '1. Băm phần lõi sả và tỏi, thấm khô đậu hũ rồi cắt miếng vuông.
2. Áp chảo đậu vàng cạnh, thêm sả tỏi và đảo đến thơm.
3. Cho tương, đường, nước và tiêu vào, kho lửa nhỏ đến khi sốt bám đậu.'),
    ('Cà tím om cà chua và húng quế', 'Main dish', 2, '{"eggplant":360,"tomato":300,"basil":16,"garlic":10,"oil":16,"salt":2}', '1. Cắt cà tím thành miếng vừa ăn, áp chảo hai mặt với nửa dầu.
2. Xào tỏi và cà chua bằng phần dầu còn lại, đậy vung nấu đến khi cà chua ra nước.
3. Om cà tím trong sốt 10 phút rồi nêm muối và thêm húng quế.'),
    ('Đậu gà cà ri bí đỏ nước cốt dừa', 'Main dish', 3, '{"chickpea":330,"pumpkin":450,"onion":100,"curry":8,"coconut":120,"water":220,"oil":12,"salt":3}', '1. Xào hành với dầu và bột cà ri.
2. Cho bí đỏ, nước và cốt dừa, nấu lửa nhỏ 12 phút.
3. Khuấy đậu gà đã luộc vào, nấu đến khi bí mềm rồi nêm muối.'),
    ('Nấm bào ngư xé áp chảo sả tiêu', 'Main dish', 2, '{"oyster":360,"xa":24,"soysauce":22,"oil":16,"garlic":10,"blackpep":2,"lime":16}', '1. Lau ráo nấm, xé theo thớ.
2. Áp chảo nấm trên lửa lớn theo mẻ đến khi xém cạnh.
3. Cho sả băm, tỏi và nước tương vào đảo thêm 1 phút, tắt bếp mới thêm tiêu và chanh.'),
    ('Cơm gạo lứt đậu đen với bơ và ngô', 'Main dish', 2, '{"brown":300,"black":220,"corn":150,"avocado":120,"lime":22,"cilantro":14,"salt":2}', '1. Hâm nóng cơm, đậu đen và ngô chín riêng.
2. Cắt bơ khối rồi trộn nhẹ với chanh và muối.
3. Chia cơm, xếp đậu ngô và bơ lên trên, rắc rau mùi.'),
    ('Tempeh áp chảo sốt gừng mè', 'Main dish', 2, '{"tempeh":260,"ginger":15,"sesame":10,"soysauce":20,"water":40,"oil":12,"sugar":6}', '1. Thái tempeh đã nấu thành lát, áp chảo tới khi vàng.
2. Đun gừng băm, nước tương, nước và đường ngay trong chảo đến khi sệt nhẹ.
3. Lăn đều tempeh qua sốt rồi rắc mè.'),
    ('Bí đỏ nướng nhồi đậu lăng nấm mỡ', 'Main dish', 3, '{"pumpkin":620,"lentil":330,"mushroom":180,"onion":90,"oil":16,"garlic":8,"blackpep":1,"salt":3}', '1. Cắt bí thành ba miếng hình thuyền, bỏ hạt và nướng ở 200 °C cho vừa mềm.
2. Xào hành, tỏi, nấm với đậu lăng chín và tiêu.
3. Cho nhân lên bí, nướng lại 8 phút rồi chia phần.'),
    ('Bánh xèo chay nấm bào ngư cải thảo', 'Main dish', 2, '{"riceflour":120,"coconut":85,"turmeric":2,"water":215,"oyster":190,"napa":170,"oil":18,"salt":2}', '1. Khuấy bột gạo, cốt dừa, nước, nghệ và muối thành bột lỏng.
2. Xào nấm xé và cải thảo thái sợi tới khi ráo.
3. Tráng bột mỏng trên chảo nóng có dầu, thêm nhân rồi gập lúc viền vàng giòn.'),
    ('Rau muống xào tỏi vàng', 'Main dish', 2, '{"rau":360,"garlic":14,"oil":14,"salt":2}', '1. Nhặt rau, tách phần cọng và lá.
2. Phi tỏi đập dập trong dầu tới khi vàng nhạt, vớt một ít ra.
3. Xào cọng trước rồi cho lá và muối, đảo tới khi rau chín giòn, rắc phần tỏi đã vớt.'),
    ('Đậu hũ sốt cà chua hành lá', 'Main dish', 2, '{"tofu":340,"tomato":340,"scallion":22,"garlic":9,"soysauce":18,"oil":14}', '1. Áp chảo đậu hũ khô cho vàng hai mặt.
2. Phi tỏi, thêm cà chua và nước tương, đun đến khi sốt sánh.
3. Om đậu trong sốt 6 phút rồi thêm hành lá thái nhỏ.'),
    ('Cải thìa xào nấm hương và gừng', 'Main dish', 2, '{"bok":360,"shiitakec":190,"ginger":14,"garlic":8,"soysauce":20,"oil":12}', '1. Để ráo nấm hương đã luộc rồi thái lát.
2. Phi gừng tỏi, đảo phần cọng cải với nấm trên lửa lớn.
3. Thêm lá cải và nước tương, đảo đến khi lá mềm và sốt phủ đều.'),
    ('Cơm rang nghệ bông cải và đậu nành non', 'Main dish', 2, '{"brown":380,"edamame":160,"broccoli":200,"turmeric":3,"garlic":10,"oil":14,"salt":2}', '1. Cắt bông cải nhỏ và xào nhanh với tỏi.
2. Cho cơm gạo lứt, nghệ và muối vào đảo đều trên lửa lớn.
3. Thêm đậu nành non đã luộc và đảo đến khi cơm nóng đều.'),
    ('Ớt chuông nướng nhồi quinoa đậu đỏ', 'Main dish', 3, '{"pepper":540,"quinoa":300,"kidney":240,"tomato":160,"onion":70,"oil":12,"salt":3}', '1. Bổ dọc ớt chuông và lấy hạt.
2. Xào hành với cà chua, trộn quinoa và đậu đỏ đã luộc rồi nêm muối.
3. Nhồi hỗn hợp vào ớt và nướng 190 °C khoảng 25 phút tới khi ớt mềm.'),
    ('Bún xào rau củ nấm bào ngư', 'Main dish', 2, '{"bun":330,"oyster":180,"carrot":90,"cabbage":150,"soysauce":22,"oil":14,"garlic":8}', '1. Trụng bún rồi để thật ráo.
2. Phi tỏi, xào nấm trước, sau đó thêm cà rốt và bắp cải thái sợi.
3. Cho bún và nước tương vào, dùng đũa đảo theo mẻ tới khi nóng đều.'),
    ('Đậu hũ hấp gừng hành', 'Main dish', 2, '{"soft":340,"ginger":18,"scallion":28,"soysauce":20,"oil":9}', '1. Cắt đậu hũ mềm thành lát dày, đặt lên đĩa chịu nhiệt và rải gừng.
2. Hấp 7–9 phút, chắt nước đọng rồi rưới nước tương.
3. Rắc hành thái chỉ và rưới dầu đã làm nóng lên hành.'),
    ('Súp lơ nướng sốt đậu phộng chanh', 'Main dish', 2, '{"cauli":450,"peanut":48,"lime":25,"water":65,"oil":12,"garlic":6,"salt":2}', '1. Tách súp lơ thành hoa vừa, trộn dầu và muối rồi nướng 210 °C tới khi xém cạnh.
2. Giã hoặc xay đậu phộng với tỏi, chanh và nước ấm thành sốt.
3. Rưới sốt lên súp lơ ngay trước khi dọn.'),
    ('Khoai lang và đậu đỏ hầm cà chua', 'Main dish', 3, '{"sweet":360,"kidney":360,"tomato":350,"onion":95,"water":280,"oil":12,"curry":5,"salt":3}', '1. Xào hành với dầu và bột cà ri.
2. Thêm khoai cắt khối, cà chua và nước, hầm khoảng 15 phút.
3. Cho đậu đỏ đã luộc vào, hầm tiếp đến khi khoai mềm và nêm muối.'),
    ('Chả đậu gà cà rốt nướng', 'Main dish', 3, '{"chickpea":340,"carrot":120,"oat":65,"onion":65,"cilantro":16,"oil":13,"salt":3}', '1. Nghiền đậu gà chín với yến mạch và muối, trộn cà rốt bào, hành và rau mùi.
2. Nén thành sáu miếng dẹt và quét dầu.
3. Nướng ở 205 °C khoảng 22 phút, trở mặt giữa chừng.'),
    ('Cơm trộn đậu hũ áp chảo bắp cải tím', 'Main dish', 2, '{"brown":360,"tofu":240,"purple":190,"carrot":100,"vinegar":18,"sesame":12,"soysauce":20,"oil":10}', '1. Trộn bắp cải thái sợi với giấm và để 10 phút.
2. Áp chảo đậu hũ; xào nhanh cà rốt trong cùng chảo.
3. Xếp mọi thứ trên cơm nóng, rưới nước tương và rắc mè.'),
    ('Nấm mỡ nhồi cải bó xôi hạt điều', 'Main dish', 2, '{"mushroom":380,"spinach":160,"cashew":44,"garlic":9,"oil":12,"salt":2}', '1. Bỏ cuống nấm, băm cuống rồi xào với tỏi và cải bó xôi.
2. Băm hạt điều, trộn vào nhân đã rút nước với muối.
3. Nhồi vào mũ nấm, quét dầu và nướng 190 °C khoảng 18 phút.'),
    ('Canh cải thìa đậu hũ non', 'Soup', 2, '{"bok":260,"soft":230,"ginger":12,"water":840,"salt":3,"scallion":14}', '1. Nấu gừng trong nước 6 phút.
2. Thả cọng cải vào trước, sau 2 phút cho lá cải và đậu hũ mềm.
3. Để sôi nhẹ trở lại, thêm muối và hành lá rồi nhấc xuống.'),
    ('Canh bí đỏ đậu xanh', 'Soup', 3, '{"pumpkin":420,"mung":220,"water":840,"salt":3,"scallion":16}', '1. Gọt bí, cắt miếng bằng nhau và nấu trong nước khoảng 12 phút.
2. Thêm đậu xanh đã luộc, đun liu riu 5 phút để vị đậu hòa vào nước.
3. Nêm muối và rắc hành khi múc.'),
    ('Canh chua dứa cà chua với nấm', 'Soup', 3, '{"pineapple":220,"tomato":280,"oyster":210,"water":900,"lime":25,"sugar":8,"salt":4,"cilantro":16}', '1. Đun dứa và cà chua khoảng 8 phút cho ra vị.
2. Thả nấm bào ngư xé, nấu 5 phút rồi thêm muối và đường.
3. Tắt lửa mới thêm chanh và rau mùi.'),
    ('Canh cải thảo nấm mỡ tiêu đen', 'Soup', 3, '{"napa":420,"mushroom":220,"water":900,"blackpep":2,"salt":4,"ginger":10}', '1. Nấu gừng với nước, thêm nấm đã cắt lát.
2. Sau 5 phút cho bẹ cải, tiếp đến cho lá cải và nấu đến vừa mềm.
3. Nêm muối, rắc tiêu và dùng nóng.'),
    ('Súp cà chua đậu trắng kiểu nhà', 'Soup', 3, '{"tomato":560,"white":320,"onion":100,"celery":100,"water":480,"oil":13,"basil":15,"salt":4}', '1. Phi hành và cần tây trước khi cho cà chua thái nhỏ.
2. Thêm nước và đậu trắng đã luộc, đun liu riu 15 phút.
3. Nghiền một ít đậu trong nồi để làm sánh, thêm húng quế và muối.'),
    ('Súp súp lơ xay với hạt điều', 'Soup', 3, '{"cauli":560,"cashew":60,"onion":90,"water":700,"oil":12,"salt":3,"blackpep":1}', '1. Ngâm hạt điều trong nước nóng 20 phút bằng phần nước nấu.
2. Xào hành với dầu, thêm súp lơ và phần nước còn lại rồi nấu mềm.
3. Xay với hạt điều, đun lại nhẹ và nêm muối tiêu.'),
    ('Canh rau muống nấu chua chanh', 'Soup', 2, '{"rau":300,"tomato":180,"water":700,"lime":26,"salt":3,"sugar":6}', '1. Xắt cà chua, đun trong nước cho ra vị ngọt.
2. Cho cọng rau muống vào trước, thêm lá và đun đến chín.
3. Tắt bếp rồi nêm chanh, muối và đường.'),
    ('Súp ngô vàng đậu hũ non', 'Soup', 3, '{"corn":340,"soft":250,"water":840,"cornflour":18,"scallion":18,"salt":4}', '1. Xay một nửa ngô đã luộc cùng một phần nước.
2. Đun ngô xay và ngô nguyên hạt, thêm đậu hũ thái hạt lựu.
3. Hòa bột bắp với nước lạnh đã cân, khuấy vào súp tới khi trong sánh rồi thêm hành và muối.'),
    ('Canh bắp cải cà rốt nấu đậu hũ', 'Soup', 3, '{"cabbage":320,"carrot":200,"tofu":220,"water":860,"salt":4,"scallion":16}', '1. Nấu cà rốt cắt lát trong nước trước 5 phút.
2. Cho bắp cải thái miếng và đậu hũ cắt khối, đun nhẹ 7 phút.
3. Nêm muối và thêm hành.'),
    ('Súp đậu lăng cà chua và cần tây', 'Soup', 3, '{"lentil":350,"tomato":340,"celery":100,"carrot":120,"onion":80,"water":700,"oil":12,"salt":4}', '1. Xào hành, cần tây và cà rốt 5 phút.
2. Thêm cà chua và nước, nấu tới khi cà rốt mềm.
3. Cho đậu lăng đã chín vào đun thêm 5 phút rồi nêm muối.'),
    ('Canh bí ngòi nấm bào ngư gừng', 'Soup', 2, '{"zucchini":340,"oyster":160,"ginger":12,"water":680,"salt":3,"cilantro":12}', '1. Đun gừng thái chỉ trong nước 5 phút.
2. Cho nấm vào, sau 3 phút thêm bí ngòi cắt nửa khoanh.
3. Nấu tới khi bí vừa mềm, nêm muối và rắc rau mùi.'),
    ('Canh cải bó xôi ngô và đậu hũ', 'Soup', 3, '{"spinach":260,"tofu":210,"corn":170,"water":850,"salt":4,"blackpep":1}', '1. Đun ngô đã luộc với nước và đậu hũ cắt khối.
2. Thả lá cải bó xôi khi nước sôi, đảo nhẹ tới khi rau vừa chín.
3. Thêm muối và tiêu, chia phần.'),
    ('Nước dùng rau củ nấm hương với bún', 'Soup', 3, '{"bun":420,"shiitakec":230,"carrot":210,"onion":160,"water":1140,"ginger":20,"soysauce":26,"scallion":24}', '1. Nướng xém hành và gừng trên chảo khô rồi nấu cùng cà rốt trong 20 phút.
2. Thêm nấm hương đã luộc và nước tương, nấu 5 phút.
3. Trụng bún, chan nước dùng cùng rau củ và rắc hành.'),
    ('Súp khoai lang nghệ nước cốt dừa', 'Soup', 3, '{"sweet":490,"turmeric":4,"coconut":110,"onion":100,"water":680,"oil":10,"salt":4}', '1. Xào hành và nghệ với dầu, cho khoai và nước vào.
2. Khi khoai mềm, xay kỹ rồi cho lại vào nồi cùng cốt dừa.
3. Đun nhẹ, nêm muối và khuấy trước khi múc.'),
    ('Canh hạt sen cà rốt và ngô ngọt', 'Soup', 3, '{"lotus":105,"carrot":200,"corn":170,"water":930,"salt":4,"scallion":14}', '1. Ngâm hạt sen khô cho nở, bỏ tâm nếu còn.
2. Nấu hạt sen với nước đến gần mềm thì cho cà rốt thái khoanh.
3. Khi hạt mềm hẳn, thêm ngô đã luộc, đun lại rồi nêm muối và hành.'),
    ('Súp bông cải đậu gà xay thô', 'Soup', 3, '{"broccoli":400,"chickpea":265,"onion":110,"water":700,"oil":12,"garlic":8,"salt":3}', '1. Xào hành và tỏi, cho phần thân bông cải cắt mỏng và nước vào nấu.
2. Khi thân bắt đầu mềm, thêm hoa bông cải và đậu gà luộc.
3. Xay thô một nửa súp, trộn lại và nêm muối.'),
    ('Canh bắp cải cuộn đậu hũ nấm', 'Soup', 3, '{"cabbage":360,"tofu":220,"oyster":180,"carrot":90,"scallion":28,"water":960,"salt":4,"blackpep":1}', '1. Trụng lá bắp cải và hành dài tới khi cuộn được.
2. Nghiền đậu hũ, trộn nấm và cà rốt băm với một phần muối tiêu, cuộn trong lá cải và buộc hành.
3. Nấu cuộn trên lửa nhỏ 12–15 phút đến chín, nêm nước canh với phần muối còn lại.'),
    ('Canh cà chua đậu xanh và cải thìa', 'Soup', 3, '{"tomato":320,"mung":270,"bok":240,"water":860,"garlic":8,"oil":8,"salt":4}', '1. Phi tỏi rồi xào cà chua tới khi mềm.
2. Thêm nước và đậu xanh đã luộc, đun 7 phút.
3. Cho cọng và lá cải lần lượt vào, nấu thêm vài phút rồi nêm muối.'),
    ('Súp quinoa đậu đỏ rau củ', 'Soup', 3, '{"quinoa":260,"kidney":270,"celery":100,"carrot":140,"tomato":260,"water":820,"onion":90,"oil":10,"salt":4}', '1. Xào hành, cần tây và cà rốt cắt hạt lựu.
2. Đun với cà chua và nước tới khi rau củ mềm.
3. Thêm quinoa và đậu đã nấu, làm nóng đều rồi nêm muối.'),
    ('Canh cà tím nấm hương nước tương', 'Soup', 2, '{"eggplant":260,"shiitakec":180,"water":730,"soysauce":22,"ginger":13,"scallion":14}', '1. Đun gừng cùng nước, cho cà tím cắt khối đều vào.
2. Cà vừa mềm thì thêm nấm hương đã luộc và nước tương.
3. Đun tiếp 4 phút, rắc hành rồi tắt bếp.'),
    ('Gỏi bắp cải tím đậu phộng chanh', 'Salad', 2, '{"purple":270,"carrot":110,"peanut":38,"lime":32,"sugar":9,"salt":2,"cilantro":14}', '1. Thái bắp cải tím thật mảnh và bào cà rốt.
2. Hòa tan đường và muối trong nước cốt chanh rồi trộn với rau.
3. Để 5 phút, thêm rau mùi và đậu phộng giã ngay trước khi ăn.'),
    ('Salad quinoa dưa leo cà chua rau mùi', 'Salad', 2, '{"quinoa":300,"cucumber":180,"tomato":200,"cilantro":18,"lime":30,"oil":12,"salt":2}', '1. Xới tơi quinoa đã nấu và để nguội.
2. Bỏ phần hạt ướt của dưa leo, cắt hạt lựu cùng cà chua.
3. Trộn với rau mùi, dầu, chanh và muối.'),
    ('Gỏi xoài dưa leo và hạt điều', 'Salad', 2, '{"mango":240,"cucumber":160,"cashew":28,"lime":22,"sugar":6,"salt":2,"mint":10}', '1. Chọn xoài hơi chín còn chắc rồi thái sợi cùng dưa leo.
2. Trộn chanh, muối và đường cho tan, rưới vào rau quả.
3. Xé bạc hà và rắc hạt điều rang lên khi dọn.'),
    ('Salad khoai lang nướng đậu đen', 'Salad', 2, '{"sweet":350,"black":220,"pepper":160,"cilantro":15,"lime":28,"oil":12,"salt":2}', '1. Cắt khoai và ớt chuông khối, trộn dầu, nướng 205 °C cho khoai chớm vàng.
2. Để ấm rồi trộn với đậu đen đã luộc, để ráo.
3. Rưới chanh, nêm muối và thêm rau mùi.'),
    ('Gỏi đu đủ chín vừa cà rốt mè rang', 'Salad', 2, '{"papaya":300,"carrot":120,"sesame":14,"lime":28,"vinegar":12,"sugar":5,"salt":2,"mint":8}', '1. Chọn đu đủ vừa chín còn chắc, bỏ hạt rồi cắt sợi dày.
2. Bào cà rốt và trộn với đu đủ, giấm, chanh, đường và muối.
3. Thêm bạc hà và mè rang trước khi dọn.'),
    ('Salad đậu gà dứa và ớt chuông', 'Salad', 2, '{"chickpea":250,"pineapple":200,"pepper":130,"lime":25,"cilantro":14,"oil":10,"salt":2}', '1. Để ráo đậu gà chín.
2. Cắt dứa và ớt chuông hạt lựu đều nhau.
3. Trộn với chanh, dầu, rau mùi và muối, để 10 phút cho thấm.'),
    ('Gỏi nấm bào ngư bắp cải trắng', 'Salad', 2, '{"oyster":260,"cabbage":230,"carrot":90,"lime":28,"mint":12,"salt":2,"sugar":8,"oil":8}', '1. Áp chảo nấm xé trên lửa lớn với dầu đến chín, để nguội bớt.
2. Thái mỏng bắp cải và cà rốt, trộn chanh, muối và đường.
3. Xới nấm và bạc hà vào ngay trước khi dùng.'),
    ('Salad bơ cam và cải bó xôi', 'Salad', 2, '{"avocado":160,"orange":240,"spinach":115,"lime":16,"oil":8,"sesame":10,"salt":1}', '1. Rửa và làm ráo lá cải bó xôi non.
2. Tách cam thành múi bỏ màng, thái bơ và trộn nước cốt chanh.
3. Xếp rau quả xen kẽ rồi rưới dầu, rắc muối và mè.'),
    ('Nộm rau muống trụng đậu phộng', 'Salad', 2, '{"rau":350,"peanut":35,"lime":30,"sugar":8,"salt":2,"garlic":6}', '1. Chẻ cọng rau muống và trụng đến chín giòn, ngâm lạnh nhanh và vắt nhẹ.
2. Khuấy chanh, đường, muối và tỏi băm.
3. Trộn rau với nước nộm rồi rắc đậu phộng giã thô.'),
    ('Salad tempeh dưa leo mè gừng', 'Salad', 2, '{"tempeh":240,"cucumber":260,"sesame":14,"ginger":8,"vinegar":22,"oil":10,"soysauce":18}', '1. Áp chảo tempeh đã nấu, cắt dải và để ấm.
2. Đập nhẹ dưa leo, cắt miếng và để ráo nước.
3. Trộn giấm, gừng bào và tương, đảo với dưa leo, tempeh và mè.'),
    ('Salad đậu đỏ ngô cà chua', 'Salad', 2, '{"kidney":260,"corn":190,"tomato":220,"lime":30,"oil":12,"cilantro":12,"salt":2}', '1. Để ráo đậu đỏ và ngô đã luộc.
2. Cắt cà chua và bỏ bớt hạt.
3. Trộn đậu, ngô, cà chua với dầu, chanh, muối và rau mùi.'),
    ('Nộm cà rốt táo chua ngọt', 'Salad', 2, '{"carrot":210,"apple":230,"lime":27,"vinegar":13,"chia":8,"sugar":7,"salt":2,"mint":10}', '1. Bào thành sợi dài cà rốt và táo, trộn táo với chanh ngay khi cắt.
2. Pha giấm với đường và muối, đảo đều vào phần rau quả.
3. Rắc hạt chia và bạc hà, để 5 phút rồi dùng.'),
    ('Salad bún lạnh cải tím và đậu hũ', 'Salad', 2, '{"bun":280,"tofu":200,"purple":150,"cucumber":150,"soysauce":20,"lime":26,"oil":12,"chili":1}', '1. Trụng bún và xả lạnh, để ráo.
2. Áp chảo đậu hũ bằng dầu và thái cải cùng dưa leo thành sợi.
3. Trộn bún với nước tương, chanh, ớt rồi xếp rau và đậu lên trên.'),
    ('Salad bông cải chần hạt điều', 'Salad', 2, '{"broccoli":380,"cashew":40,"lime":24,"garlic":5,"oil":10,"salt":2}', '1. Chần bông cải đến khi chín giòn rồi xả lạnh và để ráo.
2. Rang hạt điều, đập dập một nửa.
3. Khuấy dầu, tỏi, chanh và muối, trộn với bông cải và cả hai phần hạt điều.'),
    ('Gỏi dứa bắp cải cà rốt', 'Salad', 2, '{"pineapple":210,"cabbage":230,"carrot":100,"lime":24,"vinegar":12,"mint":12,"salt":2}', '1. Cắt dứa lát nhỏ, cho ráo bớt nước.
2. Thái sợi bắp cải và cà rốt, bóp nhẹ với muối.
3. Trộn dứa, chanh, giấm và bạc hà lúc sắp ăn.'),
    ('Salad quinoa bí đỏ nướng mè', 'Salad', 2, '{"quinoa":320,"pumpkin":370,"sesame":15,"lime":22,"oil":12,"salt":2,"basil":10}', '1. Cắt bí khối và nướng với dầu ở 205 °C tới khi mềm và xém cạnh.
2. Xới quinoa đã chín với chanh và muối.
3. Gấp nhẹ bí vào quinoa rồi thêm mè và húng quế.'),
    ('Salad dưa leo cà chua húng quế', 'Salad', 2, '{"cucumber":280,"tomato":300,"basil":15,"onion":40,"vinegar":20,"oil":13,"salt":2}', '1. Thái hành tây thật mỏng và ngâm trong giấm 10 phút.
2. Cắt cà chua và dưa leo thành miếng vừa ăn.
3. Trộn rau với hành, giấm, dầu, muối và lá húng xé.'),
    ('Salad cải thảo đậu nành non chanh gừng', 'Salad', 2, '{"napa":290,"edamame":220,"carrot":100,"lime":28,"ginger":8,"sesame":12,"salt":2}', '1. Thái cải thảo và cà rốt thành sợi, bỏ vỏ đậu nành non đã luộc.
2. Trộn chanh, gừng và muối.
3. Đảo đều rau với đậu, chan nước trộn rồi rắc mè rang.'),
    ('Gỏi nấm hương dưa leo và hành gừng', 'Salad', 2, '{"shiitakec":210,"cucumber":250,"scallion":20,"ginger":10,"vinegar":22,"soysauce":18,"oil":8}', '1. Thấm khô nấm hương đã nấu và đảo nhanh với dầu cùng gừng.
2. Thái dưa leo và ngâm nhẹ với giấm trong 5 phút.
3. Trộn nấm, dưa leo, nước tương và hành cắt sợi.'),
    ('Salad bí ngòi nướng đậu lăng', 'Salad', 2, '{"zucchini":350,"lentil":240,"pepper":150,"lime":22,"oil":13,"basil":15,"salt":2}', '1. Cắt bí ngòi và ớt chuông lát dày, quét dầu rồi áp chảo đến chín.
2. Để ráo đậu lăng luộc và trộn với muối, chanh.
3. Xếp rau nướng lên đậu, rắc húng quế xé.'),
    ('Chè đậu xanh gừng nước cốt dừa', 'Dessert', 3, '{"mung":330,"coconut":70,"water":430,"ginger":14,"sugar":38,"salt":1}', '1. Đun đậu xanh đã luộc cùng nước và gừng thái lát 10 phút.
2. Thêm đường, nếm độ ngọt rồi khuấy đến tan.
3. Hâm cốt dừa với muối, rưới lên mỗi chén chè.'),
    ('Chè đậu đen cốt dừa mè rang', 'Dessert', 3, '{"black":350,"coconut":95,"water":500,"sugar":42,"salt":1,"sesame":10}', '1. Nấu đậu đen đã luộc với nước 12 phút.
2. Hòa đường vào chè rồi đun nhỏ thêm 3 phút.
3. Hâm cốt dừa cùng muối, thêm vào chén và rắc mè.'),
    ('Chè bắp bột bắp nước cốt dừa', 'Dessert', 3, '{"corn":300,"water":500,"sugar":42,"cornflour":20,"coconut":80,"salt":1}', '1. Đun ngô với phần lớn lượng nước và đường.
2. Khuấy bột bắp trong phần nước nguội còn lại, rót từ từ vào nồi, đun đến sánh.
3. Trộn muối vào cốt dừa đã hâm và rưới khi múc.'),
    ('Chè hạt sen gừng thanh', 'Dessert', 3, '{"lotus":120,"ginger":15,"water":940,"sugar":48}', '1. Ngâm hạt sen khô tới khi nở rồi bỏ tâm còn sót.
2. Nấu sen trong nước cho mềm hẳn rồi thêm gừng.
3. Thêm đường sau cùng, đun 5 phút để thấm rồi chia chén.'),
    ('Bánh chuối yến mạch nướng', 'Dessert', 3, '{"banana":350,"oat":160,"soyalt":135,"oil":14,"cinnamon":2}', '1. Nghiền chuối chín, khuấy sữa và dầu.
2. Trộn yến mạch và quế rồi đổ vào khuôn lót giấy, dàn dày khoảng 2 cm.
3. Nướng 180 °C khoảng 30 phút, để nguội bớt rồi cắt phần.'),
    ('Khoai lang nướng quế và mè', 'Dessert', 2, '{"sweet":440,"oil":9,"sesame":14,"cinnamon":1,"salt":1}', '1. Cắt khoai thành múi đồng đều, trộn dầu, quế và muối.
2. Nướng 200 °C, lật sau 15 phút và nướng đến mềm.
3. Rắc mè rang lên khoai nóng.'),
    ('Pudding chia xoài cốt dừa', 'Dessert', 3, '{"chia":36,"mango":340,"coconut":105,"water":230,"sugar":15}', '1. Khuấy cốt dừa với nước và đường rồi cho hạt chia vào.
2. Khuấy lần nữa sau 10 phút và để lạnh ít nhất 4 giờ.
3. Dằm một ít xoài làm sốt, bày cùng phần xoài cắt miếng.'),
    ('Táo nướng quế nhân yến mạch', 'Dessert', 2, '{"apple":360,"oat":50,"cashew":25,"oil":8,"cinnamon":2,"sugar":12}', '1. Bổ đôi táo, khoét lõi nhưng giữ đáy.
2. Trộn yến mạch, hạt điều băm, dầu, quế và đường rồi cho vào hốc táo.
3. Nướng 185 °C khoảng 25 phút tới khi táo mềm.'),
    ('Xôi xoài nước cốt dừa', 'Dessert', 3, '{"stickydry":190,"mango":330,"coconut":130,"sugar":22,"salt":2}', '1. Ngâm nếp 4 giờ rồi để ráo và hấp đến khi chín dẻo.
2. Hâm cốt dừa với đường muối, trộn phần lớn vào nếp rồi đậy 8 phút.
3. Chia xôi, xếp xoài và rưới phần cốt còn lại.'),
    ('Đậu hũ mềm sốt gừng ấm', 'Dessert', 3, '{"soft":360,"ginger":22,"sugar":48,"water":320}', '1. Đun gừng đập dập với nước 10 phút.
2. Hòa đường vào nước gừng rồi đun thêm 3 phút.
3. Hấp đậu hũ mềm đến nóng, múc lát mỏng thành từng chén và chan siro ấm.'),
    ('Dứa áp chảo quế và nước cam', 'Dessert', 2, '{"pineapple":370,"orange":140,"cinnamon":1,"oil":6}', '1. Cắt dứa thành lát dày và thấm khô.
2. Quét dầu, áp chảo hai mặt đến vàng cạnh.
3. Vắt cam vào chảo, rắc quế và đảo nhẹ tới khi sốt rút còn một lớp mỏng.'),
    ('Kem chuối xoài xay lạnh', 'Dessert', 3, '{"banana":270,"mango":310,"lime":13,"soyalt":60}', '1. Cắt quả thành miếng nhỏ, cấp đông rời ít nhất 4 giờ.
2. Xay từng nhịp với chanh và sữa, vét thành cối để hỗn hợp mịn.
3. Chia ngay hoặc để đông thêm 30 phút cho chắc.'),
    ('Thạch dẻo bắp cốt dừa', 'Dessert', 3, '{"corn":220,"coconut":155,"water":240,"cornflour":48,"sugar":28,"salt":1}', '1. Xay nhuyễn một nửa ngô cùng nước.
2. Hòa bột bắp với hỗn hợp lạnh, thêm cốt dừa, phần ngô còn lại, đường và muối.
3. Khuấy lửa nhỏ tới khi sánh và sôi lục bục, đổ khuôn rồi làm lạnh trước khi cắt.'),
    ('Sữa đậu nành quế và cam', 'Dessert', 2, '{"soyalt":420,"orange":190,"cinnamon":1,"sugar":10}', '1. Gọt lấy ít vỏ cam mỏng và bỏ phần cùi trắng.
2. Hâm sữa với vỏ, quế và đường trên lửa nhỏ 5 phút, vớt vỏ.
3. Chia sữa vào hai cốc, dọn kèm múi cam riêng.'),
    ('Chuối hấp nước cốt dừa mè rang', 'Dessert', 3, '{"banana":430,"coconut":130,"water":100,"cornflour":10,"sesame":13,"sugar":18,"salt":1}', '1. Hấp chuối cắt đôi khoảng 8 phút đến nóng mềm.
2. Hòa bột bắp vào nước nguội, đun với cốt dừa, đường và muối đến khi sánh.
3. Chan lên chuối và rắc mè.'),
    ('Bánh gạo hấp đường mè', 'Dessert', 3, '{"riceflour":145,"cornflour":18,"water":295,"sugar":35,"oil":5,"sesame":14}', '1. Khuấy bột gạo, bột bắp, đường và nước, để nghỉ 15 phút.
2. Quét dầu lên ba chén và chia bột đã khuấy lại.
3. Hấp 18–22 phút tới khi mặt bánh trong hơn và tăm rút sạch, rắc mè khi dọn.'),
    ('Bơ nghiền cacao và chuối', 'Dessert', 2, '{"avocado":210,"banana":170,"cacao":16,"soyalt":75}', '1. Xay bơ và chuối đến nhuyễn bằng từng nhịp ngắn.
2. Thêm bột cacao và rót sữa từ từ, xay đến khi không còn vệt bột.
3. Chia ly rồi để lạnh 30 phút.'),
    ('Đu đủ cam bạc hà ướp lạnh', 'Dessert', 2, '{"papaya":370,"orange":230,"lime":14,"mint":9}', '1. Cắt đu đủ vừa miếng, tách múi cam và bỏ hạt.
2. Trộn nhẹ với nước cốt chanh rồi đậy kín làm lạnh 20 phút.
3. Thêm bạc hà xé trước khi dọn.'),
    ('Chè khoai lang hạt sen', 'Dessert', 3, '{"sweet":350,"lotus":95,"water":800,"sugar":38,"ginger":12}', '1. Ngâm hạt sen rồi nấu trong nước đến gần mềm.
2. Thêm khoai lang khối và gừng thái lát, nấu đến khi hai nguyên liệu đều mềm.
3. Khuấy đường cho tan và chia chén.'),
    ('Bánh chuối bột gạo áp chảo', 'Dessert', 2, '{"banana":220,"riceflour":100,"water":90,"oil":13,"sesame":10,"salt":1}', '1. Dằm chuối với bột gạo, nước và muối, để bột nghỉ 8 phút.
2. Múc thành miếng nhỏ vào chảo quét dầu.
3. Rán lửa vừa hai mặt đến khi lõi chín và rắc mè khi còn nóng.');


INSERT INTO "Category" ("Name", "Type")
SELECT DISTINCT category, 'recipe' FROM catalog_recipe
ON CONFLICT ("Name", "Type") DO NOTHING;

DO $$
BEGIN
    IF (SELECT COUNT(*) FROM catalog_recipe) <> 100 OR EXISTS (
        SELECT 1 FROM catalog_recipe r CROSS JOIN LATERAL jsonb_each_text(r.quantities) q
        LEFT JOIN catalog_food f ON f.key = q.key
        WHERE f.key IS NULL OR q.value::numeric <= 0
    ) THEN
        RAISE EXCEPTION 'Invalid catalog recipe or ingredient quantity';
    END IF;
END $$;

-- Tính dinh dưỡng cả trên database được tạo bằng EF (có thể chưa có trigger).
WITH portions AS (
    SELECT r.title,
        round(sum(q.value::numeric * i."KcalPer100g")    / r.portions / 100, 2) AS kcal,
        round(sum(q.value::numeric * i."ProteinPer100g") / r.portions / 100, 2) AS protein,
        round(sum(q.value::numeric * i."CarbPer100g")    / r.portions / 100, 2) AS carb,
        round(sum(q.value::numeric * i."FatPer100g")     / r.portions / 100, 2) AS fat,
        round(sum(q.value::numeric * i."IronPer100g")    / r.portions / 100, 2) AS iron,
        round(sum(q.value::numeric * i."B12Per100g")     / r.portions / 100, 2) AS b12,
        round(sum(q.value::numeric * i."CalciumPer100g") / r.portions / 100, 2) AS calcium,
        round(sum(q.value::numeric * i."ZincPer100g")    / r.portions / 100, 2) AS zinc
    FROM catalog_recipe r
    CROSS JOIN LATERAL jsonb_each_text(r.quantities) q
    JOIN catalog_food f ON f.key = q.key
    JOIN "Ingredient" i ON i."Name" = f.name
    GROUP BY r.title, r.portions
), inserted AS (
    INSERT INTO "Recipe"
        ("CategoryId", "CreatedBy", "Title", "Instructions", "Servings", "Status",
         "KcalPerServing", "ProteinG", "CarbG", "FatG", "IronMg", "B12Mcg", "CalciumMg", "ZincMg",
         "CreatedAt", "UpdatedAt", "ViewCount")
    SELECT c."Id", u."Id", r.title, r.instructions, r.portions, 'pending_verification',
           p.kcal, p.protein, p.carb, p.fat, p.iron, p.b12, p.calcium, p.zinc, now(), now(), 0
    FROM catalog_recipe r
    JOIN portions p ON p.title = r.title
    JOIN "Category" c ON c."Name" = r.category AND c."Type" = 'recipe'
    JOIN "User" u ON u."Email" = 'catalog.import@veggieai.local'
    WHERE NOT EXISTS (
        SELECT 1 FROM "Recipe" e WHERE e."CreatedBy" = u."Id" AND e."Title" = r.title
    )
    RETURNING "Id", "Title"
)
INSERT INTO "RecipeIngredient" ("RecipeId", "IngredientId", "QuantityG")
SELECT inserted."Id", i."Id", q.value::numeric
FROM inserted
JOIN catalog_recipe r ON r.title = inserted."Title"
CROSS JOIN LATERAL jsonb_each_text(r.quantities) q
JOIN catalog_food f ON f.key = q.key
JOIN "Ingredient" i ON i."Name" = f.name;

COMMIT;
