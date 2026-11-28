async (page) => {
  const base = 'http://127.0.0.1:5173';
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  const user = { id: 42, displayName: 'Minh', role: 'user', hasHealthProfile: true };
  const image = '/images/brand/basil-sprout.webp';
  const scan = {
    scanId: 5,
    imageUrl: base + image,
    dishName: 'Đậu hũ áp chảo',
    estimatedDishNutrition: { kcal: 210, proteinG: 0 },
    detectedItems: [
      { ingredientId: 2, nameVi: 'Đậu hũ', confidence: 0.9 },
      { ingredientId: 7, nameVi: 'Cà chua', confidence: 0.9, freshness: 'spoiled' },
    ],
    suggestedRecipes: [{ recipeId: 18, title: 'Đậu hũ kho', reason: 'Khớp 1 nguyên liệu: Đậu hũ' }],
    suggestedMenu: { meals: [{ mealType: 'lunch', recipeId: 18, recipeTitle: 'Đậu hũ kho', nutrition: { kcal: 230 } }] },
  };
  let uploadCount = 0, confirms, generate, chat, failChat = true;
  await page.unrouteAll({ behavior: 'wait' });
  await page.goto(base);
  await page.evaluate(user => {
    localStorage.clear();
    localStorage.setItem('token', 'fixture');
    localStorage.setItem('veggie_user', JSON.stringify(user));
  }, user);
  await page.route('https://veggieai-api.onrender.com/api/**', route => {
    const req = route.request(), path = new URL(req.url()).pathname.toLowerCase();
    const respond = (data, status = 200) => route.fulfill({ status, json: { success: status === 200, data } });
    if (path.endsWith('/auth/me')) return respond(user);
    if (path.endsWith('/scans') && req.method() === 'POST') {
      uploadCount++;
      check(req.headers()['content-type']?.includes('multipart/form-data'), 'Photo request is not multipart');
      return respond(scan);
    }
    if (path.endsWith('/scans/5/confirm')) {
      confirms = req.postDataJSON();
      return respond(scan);
    }
    if (path.endsWith('/health-profile')) return respond({ healthGoal: 'gain' });
    if (path.endsWith('/meal-plans/current')) return route.fulfill({ status: 204 });
    if (path.endsWith('/meal-plans/ai/generate')) {
      generate = req.postDataJSON();
      return respond(null, 503);
    }
    if (path.endsWith('/chat/sessions') && req.method() === 'POST') return respond({ id: 6 });
    if (path.endsWith('/chat/sessions/6/messages')) {
      chat = req.postDataJSON();
      if (failChat) return respond(null, 503);
      return respond({ userMessage: { sender: 'user', content: chat.content }, aiMessage: { sender: 'ai', content: 'Bạn có thể làm đậu hũ kho.' } });
    }
    return respond([]);
  });
  const photo = { name: 'ingredients.webp', mimeType: 'image/webp', buffer: Buffer.from('fixture') };
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/scan');
  await page.locator('input[type=file]').setInputFiles(photo);
  await page.getByRole('button', { name: 'Nhận diện nguyên liệu' }).click();
  await page.getByRole('heading', { name: scan.dishName }).waitFor();
  check(await page.getByRole('checkbox', { name: /Cà chua/ }).isDisabled(), 'Spoiled ingredient can be selected');
  check(await page.locator('.vp-scan-metrics dd').allTextContents().then(values => values.includes('0 g') && values.includes('— g')), 'Missing nutrients shown as zero');
  await page.getByRole('button', { name: 'Xác nhận nguyên liệu', exact: true }).click();
  await page.getByRole('heading', { name: 'Gợi ý bữa ăn trong ngày' }).waitFor();
  check(JSON.stringify(confirms?.ingredientIds) === '[2]', 'Wrong ingredients confirmed');
  await page.getByRole('button', { name: 'Lên thực đơn từ nguyên liệu' }).click();
  await page.getByRole('button', { name: 'Tạo thực đơn', exact: true }).click();
  await page.getByRole('alert').waitFor();
  check(generate?.scanId === scan.scanId && !('healthGoal' in generate), 'Planner lost scan or overwrote profile goal');

  await page.goto(base + '/chatbot');
  await page.getByRole('button', { name: 'Đính kèm ảnh nguyên liệu' }).focus();
  const chooser = page.waitForEvent('filechooser');
  await page.keyboard.press('Enter');
  await (await chooser).setFiles(photo);
  const input = page.getByRole('textbox', { name: 'Tin nhắn' });
  await input.fill('Có thể nấu món gì?');
  await page.getByRole('button', { name: 'Gửi tin nhắn' }).click();
  await page.getByRole('alert').waitFor();
  check(await input.inputValue() === 'Có thể nấu món gì?', 'Failed send lost input');
  await page.getByRole('img', { name: 'Ảnh sẽ gửi' }).waitFor();
  failChat = false;
  await page.getByRole('button', { name: 'Gửi tin nhắn' }).click();
  await page.getByText('Bạn có thể làm đậu hũ kho.', { exact: true }).waitFor();
  check(uploadCount === 2, 'Retry uploaded the same attachment again');
  check(chat?.content.includes('Đậu hũ'), 'Chat did not receive scan context');
  check(await page.getByRole('img', { name: 'Ảnh bạn đã gửi' }).evaluate(img => img.complete && img.naturalWidth > 0), 'Sent photo was lost');
  await page.unrouteAll({ behavior: 'wait' });
  await page.evaluate(() => localStorage.clear());
}
