async (page) => {
  const base = 'http://127.0.0.1:5173';
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.unrouteAll({ behavior: 'wait' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(base);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.reload();
  await page.locator('.vp-hero').waitFor({ timeout: 100000 });
  check(!await page.evaluate(() => performance.getEntriesByType('resource').some(r => r.name.includes('/src/index.css') || r.name.includes('Material+Symbols') || r.name.includes('AdminView'))), 'Guest loads admin resources');
  let staff = true;
  const identity = () => ({ id: 77, role: staff ? 'Admin' : 'User', displayName: 'Boundary fixture', email: 'boundary@example.test' });
  await page.route('https://veggieai-api.onrender.com/api/**', route => {
    const p = new URL(route.request().url()).pathname.toLowerCase();
    const data = p.endsWith('/auth/me') ? identity() : [];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
  });
  await page.evaluate(user => { localStorage.setItem('token', 'fixture'); localStorage.setItem('veggie_user', JSON.stringify(user)); }, identity());
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/user-management');
  await page.locator('.min-h-screen').waitFor();
  check(await page.locator('.vp').count() === 0, 'Admin received user portal');
  check(await page.evaluate(() => getComputedStyle(document.querySelector('.font-sans')).fontFamily.includes('Plus Jakarta Sans')), 'Admin original font theme missing');
  staff = false;
  await page.evaluate(user => localStorage.setItem('veggie_user', JSON.stringify(user)), identity());
  await page.goto(base);
  await page.getByRole('heading', { name: 'Bếp hôm nay.', exact: true }).waitFor();
  check(await page.locator('.vp').count() === 1, 'User shell did not recover after staff view');
  check(errors.length === 0, errors.join('; '));
  await page.unrouteAll({ behavior: 'wait' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(base);
}
