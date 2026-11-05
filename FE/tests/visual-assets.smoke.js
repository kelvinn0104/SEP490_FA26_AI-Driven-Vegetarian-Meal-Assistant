async (page) => {
  const base = 'http://127.0.0.1:5173';
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  await page.unrouteAll({ behavior: 'wait' });
  await page.goto(base);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  const date = await page.evaluate(() => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
  const user = { id: 42, displayName: 'Kiểm thử hình ảnh', role: 'user', hasHealthProfile: true };
  const image = 'https://image.fixture.test/meal.svg';
  const missing = { id: 'r1', title: 'Món chưa có ảnh', status: 'published', instructions: 'Chuẩn bị nguyên liệu.' };
  const broken = { ...missing, id: 'r2', title: 'Món lỗi ảnh', imageUrl: 'https://image.fixture.test/broken.webp' };
  const meals = [{ id: 101, recipeId: 1, recipeTitle: missing.title, mealType: 'breakfast', imageUrl: 'javascript:alert(1)' }, { id: 102, recipeId: 2, recipeTitle: 'Món có ảnh', mealType: 'lunch', imageUrl: image }];
  await page.route('https://image.fixture.test/**', route => route.request().url() === image
    ? route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" fill="#d9ed94"/></svg>' })
    : route.fulfill({ status: 404, body: '' }));
  await page.route('https://veggieai-api.onrender.com/api/**', route => {
    const p = new URL(route.request().url()).pathname.toLowerCase();
    let data = [];
    if (p.endsWith('/auth/me')) data = user;
    if (p.endsWith('/recipes')) data = [missing, broken];
    if (p.endsWith('/recipes/r1')) data = missing;
    if (p.endsWith('/recipes/r2')) data = broken;
    if (p.endsWith('/meal-plans/current')) data = { id: 7, days: [{ date, meals }] };
    if (p.endsWith('/nutrition/daily')) data = { consumed: { kcal: 300 }, target: { kcal: 0 }, logs: [] };
    if (p.endsWith('/community/posts')) data = { items: [{ id: 12, title: 'Bài có ảnh thật từ API', postType: 'blog', status: 'published', mediaUrl: image }, { id: 13, title: 'Bài lỗi ảnh', postType: 'blog', status: 'published', mediaUrl: broken.imageUrl }], totalPages: 1 };
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
  });
  await page.evaluate(u => { localStorage.setItem('token', 'fixture'); localStorage.setItem('veggie_user', JSON.stringify(u)); }, user);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base);
  await page.locator('.vp-today-meal').nth(1).waitFor();
  check(await page.locator('.vp-today-meal').first().locator('img').count() === 0, 'Unsafe meal image accepted');
  check(await page.locator('.vp-today-meal').nth(1).locator('img').getAttribute('src') === image, 'Meal image lost API URL');
  check(await page.locator('.vp-today-macros').innerText().then(text => text.includes('—')), 'Unknown macro became fake zero');
  check(await page.locator('.vp-energy-gauge svg > path').count() === 1, 'Unknown target fabricated nutrition progress');
  for (const id of ['r1', 'r2']) {
    await page.goto(base + '/article-detail?id=' + id);
    await page.locator('.vp-detail-top .vp-image-placeholder').waitFor({ state: 'attached' });
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.vp-detail-top > .vp-image-placeholder')).display === 'none');
    check(await page.locator('.vp-detail-top').evaluate(el => el.getBoundingClientRect().height < 400), 'Missing-image detail wastes first viewport');
  }
  await page.goto(base + '/community');
  await page.locator('.vp-post-preview img').first().waitFor();
  check(await page.locator('.vp-post-preview img').first().getAttribute('src') === image, 'Community cover differs from API');
  await page.getByText('Ảnh đính kèm chưa tải được.', { exact: true }).waitFor();
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/planner', '/article-detail?id=r1', '/user-nutrition', '/community']) {
      await page.goto(base + route);
      await page.locator('.vp-screen h1').first().waitFor();
      await page.waitForFunction(() => !document.querySelector('.vp-spinner'));
      check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'V2 asset layout overflows ' + route + ' at ' + width);
      if (width === 390 && route === '/planner') await page.screenshot({ path: '.playwright-cli/v2-planner-edge.png' });
    }
  }
  await page.unrouteAll({ behavior: 'wait' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(base);
}
