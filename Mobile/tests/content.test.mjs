import test from 'node:test';
import assert from 'node:assert/strict';
import { addDays, allowedIngredient, chatContent, chatUnavailable, fold, listOf, loggedMealIds, number, today, validDate } from '../src/styles/content.mjs';

test('dữ liệu thiếu không được hiển thị như giá trị 0', () => {
  assert.equal(number(null, 'g'), '—');
  assert.equal(number('', 'g'), '—');
  assert.equal(number(0, 'g'), '0 g');
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
