async (page) => {
  const base = 'http://127.0.0.1:5173';
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const errors = [], writes = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.unrouteAll({ behavior: 'wait' });
  await page.goto(base);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  const date = await page.evaluate(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
  const tomorrow = new Date(date + 'T12:00:00Z'); tomorrow.setUTCDate(tomorrow.getUTCDate() + 1); const nextDate = tomorrow.toISOString().slice(0, 10);
  const user = { id: 42, displayName: 'Người dùng kiểm thử', email: 'design@example.test', role: 'user', hasHealthProfile: true };
  const recipe = { id: 'r1', title: 'Đậu hũ hấp gừng', category: 'Main dish', status: 'published', servings: 2, instructions: '1. Rửa và chuẩn bị nguyên liệu.\n2. Hấp chín đậu hũ cùng gừng.', kcalPerServing: 300, proteinG: 20, ingredients: [{ ingredientId: 2, name: 'Đậu hũ', quantityG: 200, unit: 'g' }] };
  const meal = (id, mealType, recipeTitle = recipe.title) => ({ id, mealType, recipeId: 1, recipeTitle, servings: 1, nutrition: { kcal: 300, proteinG: 20 } });
  let current = { id: 7, status: 'active', startDate: date, endDate: nextDate, days: [{ date, total: { kcal: 600 }, meals: [meal(101, 'breakfast'), meal(102, 'lunch')] }, { date: nextDate, total: { kcal: 300 }, meals: [meal(103, 'dinner', 'Bữa ngày mai')] }] };
  let dailyFail = false;
  let logs = [{ id: 51, planItemId: 101, recipeTitle: recipe.title, servings: 1, kcalConsumed: 300 }];
  let shopping = { id: 4, items: [{ id: 8, ingredientName: 'Đậu hũ', quantityG: 200, isBought: false }] };
  await page.route('https://veggieai-api.onrender.com/api/**', async route => {
    const req = route.request(), url = new URL(req.url()), p = url.pathname.toLowerCase(), method = req.method();
    const body = (req.headers()['content-type'] || '').includes('json') && req.postData() ? req.postDataJSON() : null;
    if (method !== 'GET') writes.push({ p, method, body });
    const ok = data => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
    if (p.endsWith('/auth/me')) return ok(user);
    if (p.endsWith('/recipes') || p.endsWith('/recipes/favorites')) return ok(p.endsWith('/favorites') ? { items: [recipe], totalPages: 1 } : [recipe]);
    if (p.endsWith('/recipes/r1') || p.endsWith('/recipes/1')) return ok(recipe);
    if (p.endsWith('/meal-plans/current')) return current ? ok(current) : route.fulfill({ status: 204 });
    if (p.endsWith('/meal-plans')) return ok({ items: [{ ...current, itemCount: 3 }], totalPages: 1 });
    if (p.endsWith('/shopping-list')) return ok(shopping);
    if (p.endsWith('/shopping-list/items/8')) { shopping.items[0].isBought = body.isBought; return ok(shopping.items[0]); }
    if (p.endsWith('/nutrition/daily')) return dailyFail ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Nhật ký tạm thời không khả dụng.' }) }) : ok({ date, consumed: { kcal: logs.length * 300, proteinG: logs.length * 20, ironMg: 2, b12Mcg: 0 }, target: { kcal: 1800, proteinG: 70, ironMg: 18, b12Mcg: 2.4 }, logs, steps: 2400, kcalBurned: 100, alerts: [] });
    if (p.endsWith('/nutrition/logs')) { const entry = { id: 52, planItemId: body.planItemId, recipeTitle: recipe.title, servings: 1, kcalConsumed: 300 }; logs.push(entry); return ok(entry); }
    if (p.endsWith('/allergies')) return ok([{ id: 2, name: 'Đậu phộng' }]);
    if (p.endsWith('/health-profile')) return ok({ id: 1, gender: 'female', dateOfBirth: '2000-01-01', heightCm: 165, weightKg: 57, activityLevel: 'moderate', healthGoal: 'maintain', allergyIds: [], bmi: 20.9, tdee: 1800, targets: { proteinG: 70 } });
    if (p.endsWith('/chat/sessions')) return ok([{ id: 5, lastMessage: 'Cách thay nguyên liệu', createdAt: date + 'T10:00:00Z' }]);
    if (p.endsWith('/chat/sessions/5/messages')) return ok([{ id: 3, sender: 'user', content: 'Mình có đậu hũ.' }]);
    if (p.endsWith('/notifications')) return ok({ items: [{ id: 3, content: 'Bạn có thể cập nhật hồ sơ sức khỏe.', isRead: false, createdAt: date + 'T09:00:00Z' }], totalPages: 1 });
    if (p.endsWith('/community/posts') || p.endsWith('/community/posts/mine')) return ok({ items: [{ id: 12, title: 'Một bữa chay ở nhà', postType: 'blog', authorName: 'Bạn đọc', status: 'published', score: 2, commentCount: 0, createdAt: date + 'T09:00:00Z' }], totalPages: 1 });
    if (p.endsWith('/community/posts/12')) return ok({ id: 12, title: 'Một bữa chay ở nhà', postType: 'blog', content: '## Một góc bếp\n\nChia sẻ từ căn bếp nhỏ.', authorName: 'Bạn đọc', status: 'published', score: 2, comments: [], createdAt: date + 'T09:00:00Z' });
    return ok([]);
  });
  const themeButton = (mode) => page.getByRole('button', { name: `Bật giao diện ${mode}`, exact: true });
  const theme = () => page.locator('.vp').getAttribute('data-theme');
  const contrast = (selector) => page.locator(selector).first().evaluate(element => {
    const luminance = color => {
      const channels = color.match(/[\d.]+/g).slice(0, 3).map(value => Number(value) / 255);
      return channels.map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
        .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    };
    const style = getComputedStyle(element);
    let surface = element;
    while (getComputedStyle(surface).backgroundColor === 'rgba(0, 0, 0, 0)') surface = surface.parentElement;
    const levels = [luminance(style.color), luminance(getComputedStyle(surface).backgroundColor)].sort((a, b) => a - b);
    return (levels[1] + 0.05) / (levels[0] + 0.05);
  });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto(base);
  await themeButton('tối').waitFor();
  check(await theme() === 'light', 'Initial theme must be light');
  await themeButton('tối').click();
  await themeButton('sáng').waitFor();
  check(await contrast('.vp-hero .vp-button') >= 4.5, 'Dark home CTA text contrast');
  await page.reload();
  await themeButton('sáng').waitFor();
  await page.setViewportSize({ width: 320, height: 844 });
  check(await themeButton('sáng').isVisible(), 'Theme switch missing on mobile');
  check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'Guest header overflows at 320px');
  await page.goto(base + '/register');
  await page.getByLabel('Tên hiển thị').waitFor();
  check(await theme() === 'dark' && await contrast('.vp-auth input') >= 4.5, 'Dark registration form contrast');
  await page.evaluate(() => sessionStorage.setItem('veggie:pending-verification', JSON.stringify({
    email: 'theme@example.test', resendAt: Date.now(), expiresAt: Date.now() + 300000,
  })));
  await page.reload();
  await page.getByLabel('Mã xác thực').fill('123456');
  check(await theme() === 'dark' && await contrast('.vp-otp-slots > span') >= 4.5, 'Dark OTP contrast or persistence');
  await themeButton('sáng').click();
  await page.reload();
  await themeButton('tối').waitFor();
  check(await theme() === 'light', 'Light preference lost on reload');
  await themeButton('tối').click();
  await page.emulateMedia({ colorScheme: null });
  await page.evaluate(u => {
    sessionStorage.removeItem('veggie:pending-verification');
    localStorage.setItem('token', 'fixture');
    localStorage.setItem('veggie_user', JSON.stringify(u));
  }, user);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.getByRole('heading', { name: 'Bếp hôm nay.', exact: true }).waitFor();
  await page.waitForFunction(() => !document.querySelector('.vp-spinner'));
  check(await page.locator('.vp-bottom-nav a').count() === 5, 'Five tabs missing');
  check(await page.locator('.vp-bottom-nav').getByRole('link', { name: 'Hôm nay', exact: true }).getAttribute('aria-current') === 'page', 'Today tab inactive');
  await page.evaluate(() => document.fonts.ready);
  const layout = await page.evaluate(() => ({
    nutrition: document.querySelector('.vp-today-nutrition').getBoundingClientRect().top,
    meals: document.querySelector('.vp-today-plan').getBoundingClientRect().top,
    lastMeal: [...document.querySelectorAll('.vp-today-meal')].at(-1).getBoundingClientRect().bottom,
    dock: document.querySelector('.vp-bottom-nav').getBoundingClientRect().top,
    font: getComputedStyle(document.querySelector('h1')).fontFamily,
  }));
  check(layout.nutrition < layout.meals, 'Mobile nutrition is below meals');
  check(layout.lastMeal <= layout.dock, 'Two mobile meals do not fit above bottom nav at 390x844');
  check(layout.font.includes('Be Vietnam Pro'), 'Heading typography differs from V2');
  const record = page.getByRole('button', { name: 'Ghi nhận đã ăn ' + recipe.title, exact: true });
  check(await record.first().isDisabled(), 'Recorded breakfast can be logged twice');
  await record.nth(1).click();
  await page.waitForFunction(() => Array.from(document.querySelectorAll('.vp-record-meal')).every(button => button.disabled));
  check(writes.filter(w => w.p.endsWith('/nutrition/logs')).length === 1 && writes[0].body.planItemId === 102, 'Home logging uses wrong ID');
  await page.goto(base + '/planner');
  await page.locator('.vp-day-picker button').nth(1).click();
  await page.getByRole('button', { name: 'Bữa ngày mai', exact: true }).waitFor();
  check(await page.getByRole('button', { name: recipe.title, exact: true }).count() === 0, 'Inactive day meals remained visible');
  await page.getByRole('button', { name: 'Danh sách đi chợ', exact: true }).click();
  const dialog = page.getByRole('dialog'); await dialog.waitFor();
  check(await contrast('dialog') >= 4.5, 'Dark shopping dialog text contrast');
  await page.getByLabel('Đậu hũ · 200 g', { exact: true }).click();
  await page.getByLabel('Đậu hũ · 200 g', { exact: true }).filter({ visible: true }).waitFor();
  await page.waitForFunction(() => document.querySelector('dialog input[type="checkbox"]')?.checked);
  check(writes.some(w => w.p.endsWith('/shopping-list/items/8') && w.body.isBought === true), 'Shopping toggle missing');
  await page.keyboard.press('Tab');
  check(await page.evaluate(() => !!document.activeElement.closest('dialog')), 'Dialog focus escaped');
  await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' });
  check(await page.evaluate(() => document.body.style.overflow) !== 'hidden', 'Dialog locked body after close');
  await page.goto(base + '/chatbot');
  await page.getByRole('button', { name: 'Trò chuyện gần đây', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cách thay nguyên liệu', exact: false }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByText('Mình có đậu hũ.', { exact: true }).waitFor();
  dailyFail = true;
  await page.goto(base);
  await page.getByRole('alert').waitFor();
  check(await contrast('.vp-state-error [role="alert"]') >= 4.5, 'Dark error text contrast');
  check(await page.locator('.vp-today-meal').count() === 2, 'Nutrition failure hid available meals');
  check(await record.nth(1).isDisabled(), 'Unknown diary permits duplicate logging');
  dailyFail = false; current = null;
  await page.reload();
  await page.getByRole('heading', { name: 'Bếp đang chờ một kế hoạch mới', exact: true }).waitFor();
  check(!writes.some(w => w.p.includes('/generate')), 'Home created plan automatically');
  current = { id: 7, status: 'active', startDate: date, endDate: nextDate, days: [{ date, total: { kcal: 600 }, meals: [meal(101, 'breakfast'), meal(102, 'lunch')] }, { date: nextDate, total: { kcal: 300 }, meals: [meal(103, 'dinner', 'Bữa ngày mai')] }] };
  const routes = ['/', '/discover', '/article-detail?id=r1', '/planner', '/create-plan', '/meal-history', '/user-nutrition', '/chatbot', '/community', '/post-detail?id=12', '/create-post', '/user-posts', '/user-collection', '/me', '/user-profile', '/user-settings', '/notifications', '/welcome'];
  const photos = { '/': 'today', '/planner': 'planner', '/user-nutrition': 'nutrition', '/chatbot': 'chat', '/user-profile': 'profile', '/user-settings': 'settings', '/create-post': 'compose' };
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(base + route);
      await page.locator('.vp-screen h1').first().waitFor();
      await page.waitForFunction(() => !document.querySelector('.vp-spinner'));
      check(await theme() === 'dark', 'Theme reset on ' + route);
      check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'Overflow ' + route + ' at ' + width);
      if ((width === 390 || width === 1440) && photos[route]) {
        await page.evaluate(() => document.fonts.ready);
        await page.screenshot({ path: `docs/screenshots/redesign-${photos[route]}-${width}.png` });
      }
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(base + '/discover');
  check(await page.locator('.vp-screen').evaluate(element => getComputedStyle(element).animationName) === 'none', 'Reduced motion ignored');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  check(errors.length === 0, errors.join('; '));
  await page.unrouteAll({ behavior: 'wait' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(base);
}
