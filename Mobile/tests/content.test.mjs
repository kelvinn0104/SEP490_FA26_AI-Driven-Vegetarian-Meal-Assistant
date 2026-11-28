import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addDays,
  allowedIngredient,
  chatContent,
  chatUnavailable,
  dietLabel,
  duplicateImageUrls,
  fold,
  formatPostDate,
  groupShoppingByAisle,
  ingredientLabel,
  initialsOf,
  listOf,
  loggedMealIds,
  number,
  nutrientRatio,
  parseSteps,
  planDisplayStatus,
  sortRecipes,
  today,
  validDate,
} from '../src/styles/content.mjs';

test('dữ liệu thiếu không được hiển thị như giá trị 0 và kcal làm tròn số nguyên', () => {
  assert.equal(number(null, 'g'), '—');
  assert.equal(number('', 'g'), '—');
  assert.equal(number(0, 'g'), '0 g');
  assert.equal(number(530.4, 'kcal'), '530 kcal');
  assert.equal(number(18.6, 'g'), '18,6 g');
  assert.deepEqual(listOf({ items: [{ id: 1 }], totalPages: 2 }), [{ id: 1 }]);
});

test('tìm tên món không phụ thuộc chữ hoa hay dấu tiếng Việt', () => {
  assert.equal(fold('  ĐẬU HŨ  '), 'dau hu');
});

test('ngày bữa ăn cắt theo giờ Việt Nam và từ chối ngày không tồn tại', () => {
  assert.equal(today(new Date('2026-11-26T16:59:59Z')), '2026-11-26');
  assert.equal(today(new Date('2026-11-26T17:00:00Z')), '2026-11-27');
  assert.equal(validDate('2026-02-29'), false);
  assert.equal(validDate('2028-02-29'), true);
});

test('nhật ký chỉ đánh dấu đúng ID thuộc ngày đang xem', () => {
  assert.equal(loggedMealIds(undefined, undefined).size, 0);
  const data = { date: '2026-11-26', logs: [{ planItemId: 4 }, { planItemId: '4' }, { recipeId: 7 }] };
  assert.deepEqual([...loggedMealIds(data, '2026-11-26')], ['4']);
  assert.equal(loggedMealIds(data, '2026-11-27').size, 0);
});

test('thực đơn đã qua ngày kết thúc phải hiển thị Đã kết thúc thay vì Đang dùng', () => {
  assert.deepEqual(
    planDisplayStatus({ status: 'active', endDate: '2026-11-04' }, '2026-11-28'),
    { label: 'Đã kết thúc', expired: true }
  );
  assert.deepEqual(
    planDisplayStatus({ status: 'active', endDate: '2026-12-02' }, '2026-11-28'),
    { label: 'Đang dùng', expired: false }
  );
});

test('loại nguyên liệu chưa định danh, không chay hoặc có dấu hiệu hỏng', () => {
  assert.equal(allowedIngredient({ ingredientId: null }), false);
  assert.equal(allowedIngredient({ ingredientId: 1, isVegetarian: false }), false);
  assert.equal(allowedIngredient({ ingredientId: 2, freshness: 'spoiled' }), false);
  assert.equal(allowedIngredient({ ingredientId: 3, freshness: 'fresh' }), true);
});

test('câu trả lời hệ thống bận không được coi là một phản hồi thành công', () => {
  assert.equal(chatUnavailable('Xin lỗi, trợ lý AI đang bận. Bạn vui lòng thử lại sau ít phút.'), true);
  assert.equal(chatUnavailable('   '), true);
  assert.equal(chatUnavailable('Có thể nấu đậu hũ kho.'), false);
});

test('thực đơn bảy ngày tính cả ngày bắt đầu và qua đúng tháng', () => {
  assert.equal(addDays('2026-11-27', 6), '2026-12-03');
  assert.equal(addDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addDays('2026-02-30', 6), '');
});

test('chat chỉ gửi nguyên liệu đã xác nhận bằng văn bản', () => {
  const scan = { ingredients: ['đậu hũ', 'nấm', 'đậu hũ'], photoUri: 'private' };
  assert.equal(chatContent('  Nấu món gì?  ', scan), 'Nấu món gì?\n\nNguyên liệu đã xác nhận từ ảnh: đậu hũ, nấm');
  assert.equal(chatContent('  ', scan), '');
  assert.equal(chatContent('Nấu món gì?', undefined), 'Nấu món gì?');
});

test('tỷ lệ dinh dưỡng không sinh 0% giả khi thiếu mục tiêu', () => {
  assert.equal(nutrientRatio(500, null), null);
  assert.equal(nutrientRatio(500, 0), null);
  assert.equal(nutrientRatio(null, 1800), null);
  assert.equal(nutrientRatio(900, 1800), 50);
  assert.equal(nutrientRatio(2200, 1800), 100);
});

test('tách các bước chế biến sạch số thứ tự và tiêu đề phụ', () => {
  const raw = '## Cách nấu\n1. Rửa sạch đậu hũ.\nBước 2: Áp chảo vàng đều hai mặt.\n- Rưới sốt nấm.';
  assert.deepEqual(parseSteps(raw), [
    'Rửa sạch đậu hũ.',
    'Áp chảo vàng đều hai mặt.',
    'Rưới sốt nấm.',
  ]);
});

test('chữ viết tắt đại diện, chế độ ăn và sắp xếp công thức theo đạm / kcal', () => {
  assert.equal(initialsOf('Nguyễn Minh Khang'), 'MK');
  assert.equal(initialsOf(''), 'V');
  assert.equal(dietLabel('flexitarian'), 'Ăn chay linh hoạt');
  const items = [
    { id: '1', kcalPerServing: 350, proteinG: 8 },
    { id: '2', kcalPerServing: 180, proteinG: 18 },
  ];
  assert.equal(sortRecipes(items, 'protein')[0].id, '2');
  assert.equal(sortRecipes(items, 'kcal_asc')[0].id, '2');
});

test('nhóm danh sách đi chợ theo quầy chợ Việt và dịch tên nguyên liệu USDA', () => {
  assert.equal(ingredientLabel('Firm tofu (calcium-set)'), 'Đậu hũ cứng (giàu canxi)');
  assert.equal(ingredientLabel('Silken tofu'), 'Đậu hũ non');
  assert.equal(ingredientLabel('Black beans, cooked'), 'Đậu đen (đã nấu)');
  const groups = groupShoppingByAisle([
    { id: 1, ingredientName: 'Firm tofu (calcium-set)', isBought: true },
    { id: 2, ingredientName: 'Bok choy', isBought: false },
    { id: 3, ingredientName: 'Shiitake mushrooms', isBought: false },
    { id: 4, ingredientName: 'Soy milk', isBought: false },
  ]);
  assert.deepEqual(groups.map(g => g.key), ['greens', 'protein', 'mushroom']);
  // Chưa mua xếp trước đã mua trong cùng quầy
  assert.deepEqual(groups.find(g => g.key === 'protein').items.map(i => i.id), [4, 1]);
});

test('phát hiện URL ảnh stock trùng lặp giữa nhiều công thức', () => {
  const dupes = duplicateImageUrls([
    { id: 1, imageUrl: 'https://img/a.jpg' },
    { id: 2, imageUrl: 'https://img/b.jpg' },
    { id: 3, imageUrl: 'https://img/a.jpg' },
    { id: 4, imageUrl: null },
  ]);
  assert.equal(dupes.has('https://img/a.jpg'), true);
  assert.equal(dupes.has('https://img/b.jpg'), false);
});

test('định dạng ngày bài viết nhận diện hôm nay và hôm qua theo giờ Việt Nam', () => {
  const ref = new Date('2026-11-27T08:00:00Z');
  assert.equal(formatPostDate('2026-11-27T02:00:00Z', ref), 'Hôm nay');
  assert.equal(formatPostDate('2026-11-26T02:00:00Z', ref), 'Hôm qua');
});
