async (page) => {
  const base = 'http://127.0.0.1:5173';
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.unrouteAll({ behavior: 'wait' });
  await page.goto(base);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  const user = { id: 999, displayName: 'Người kiểm thử', email: 'community@example.test', role: 'user', hasHealthProfile: true };
  let comments = [{ id: 31, userId: 998, authorName: 'Bạn đọc', content: 'Cảm ơn bạn!', createdAt: '2026-11-04T03:00:00Z' }, { id: 32, userId: 999, authorName: user.displayName, content: 'Bình luận của tôi', createdAt: '2026-11-04T04:00:00Z' }];
  let posts = [
    { id: 1, postType: 'blog', title: 'Bữa chay cuối tuần', content: '## Chuẩn bị\n\nMột chia sẻ với đậu hũ và rau tươi.', authorName: 'Bạn đọc', recipeId: 1, recipeTitle: 'Đậu hũ hấp', status: 'published', score: 3, myVote: 0, createdAt: '2026-11-04T02:00:00Z' },
    { id: 2, postType: 'blog', title: 'Bài đang chờ duyệt', content: 'Nội dung vừa gửi', authorName: user.displayName, status: 'pending', score: 0, myVote: 0, createdAt: '2026-11-04T01:00:00Z' },
    { id: 3, postType: 'video', title: 'Nấu canh buổi tối', content: 'Chuẩn bị nguyên liệu.', mediaUrl: 'https://media.example.test/clip.mp4', videoSummary: 'Nấu canh với rau tươi.', authorName: 'Bạn đọc', status: 'published', score: 0, myVote: 0, createdAt: '2026-11-04T01:00:00Z' }
  ];
  const writes = [], queries = [], reports = [];
  let failCreate = true, failComment = true, failDelete = true;
  await page.route('https://media.example.test/**', route => route.fulfill({ status: 404, body: '' }));
  await page.route('https://veggieai-api.onrender.com/api/**', async route => {
    const req = route.request(), url = new URL(req.url()), path = url.pathname.toLowerCase(), method = req.method();
    const body = req.postData() ? req.postDataJSON() : null;
    const ok = data => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data }) });
    const fail = (status, message) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: false, message }) });
    if (method !== 'GET') writes.push({ path, method, body });
    if (path.endsWith('/auth/me')) return ok(user);
    if (path.endsWith('/recipes')) return ok([{ id: 'r1', title: 'Đậu hũ hấp', status: 'published' }, { id: 'r34', title: 'Món (dummy)', status: 'published' }]);
    if (path.endsWith('/community/reports')) {
      const duplicate = reports.some(r => r.targetId === body.targetId && r.targetType === body.targetType);
      if (duplicate) return fail(409, 'Bạn đã báo cáo nội dung này và đang chờ xử lý.');
      reports.push(body); return ok({ id: reports.length, ...body, status: 'open' });
    }
    if (/\/community\/comments\/\d+$/.test(path)) { comments = comments.filter(c => c.id !== Number(path.split('/').pop())); return ok(true); }
    if (path.endsWith('/community/posts') && method === 'POST') {
      if (failCreate) { failCreate = false; return fail(503, 'Chưa thể gửi bài, vui lòng thử lại.'); }
      await new Promise(resolve => setTimeout(resolve, 300));
      const created = { id: posts.length + 1, ...body, status: 'pending', authorName: user.displayName, score: 0, myVote: 0, createdAt: '2026-11-04T05:00:00Z', comments: [] };
      posts.push(created); return ok(created);
    }
    if (path.endsWith('/community/posts') || path.endsWith('/community/posts/mine')) {
      queries.push(url.searchParams.toString());
      const mine = path.endsWith('/mine');
      let items = posts.filter(p => mine ? p.authorName === user.displayName : p.status === 'published');
      if (url.searchParams.get('keyword')) items = items.filter(p => p.title.includes(url.searchParams.get('keyword')));
      if (url.searchParams.get('postType')) items = items.filter(p => p.postType === url.searchParams.get('postType'));
      if (url.searchParams.get('sort') === 'top') items.sort((a, b) => b.score - a.score);
      return ok({ items: items.map(p => ({ ...p, content: undefined, comments: undefined, commentCount: p.id === 1 ? comments.length : 0 })), page: 1, pageSize: 12, totalCount: items.length, totalPages: 1 });
    }
    const postId = Number(path.match(/\/posts\/(\d+)/)?.[1]);
    const post = posts.find(p => p.id === postId);
    if (post && path.endsWith('/vote')) { post.score += body.value - post.myVote; post.myVote = body.value; return ok(post.score); }
    if (post && path.endsWith('/comments')) {
      if (failComment) { failComment = false; return fail(503, 'Chưa gửi được bình luận.'); }
      const saved = { id: 100, userId: user.id, authorName: user.displayName, content: body.content, createdAt: '2026-11-04T05:00:00Z' };
      comments.push(saved); return ok(saved);
    }
    if (post && method === 'DELETE') {
      if (failDelete) { failDelete = false; return fail(503, 'Chưa thể xóa bài.'); }
      posts = posts.filter(p => p.id !== post.id); return ok(true);
    }
    if (post) return ok({ ...post, comments: post.id === 1 ? comments : [], commentCount: post.id === 1 ? comments.length : 0 });
    return fail(404, 'Không tìm thấy bài viết');
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(base + '/community');
  await page.getByRole('heading', { name: 'Bữa chay cuối tuần', exact: true }).waitFor();
  await page.getByRole('searchbox', { name: 'Tìm bài viết' }).fill('không có bài');
  await page.getByRole('button', { name: 'Tìm', exact: true }).click();
  await page.getByRole('heading', { name: 'Chưa có bài phù hợp' }).waitFor();
  await page.getByRole('button', { name: 'Xóa tìm kiếm' }).click();
  await page.getByRole('button', { name: 'Video', exact: true }).click();
  await page.getByRole('heading', { name: 'Nấu canh buổi tối' }).waitFor();
  check(await page.getByRole('heading', { name: 'Bữa chay cuối tuần' }).count() === 0, 'Type filter did not apply');
  await page.getByRole('button', { name: 'Tất cả', exact: true }).click();
  await page.getByRole('combobox', { name: 'Sắp xếp bài viết' }).selectOption('top');
  await page.getByRole('link', { name: 'Bữa chay cuối tuần', exact: true }).click();
  await page.getByRole('heading', { name: 'Bữa chay cuối tuần', exact: true }).waitFor();
  await page.reload();
  await page.getByRole('heading', { name: 'Bữa chay cuối tuần', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Hữu ích', exact: true }).click();
  await page.getByRole('heading', { name: 'Đăng nhập', exact: true }).waitFor();
  check(writes.length === 0, 'Guest mutation reached API');
  await page.evaluate(u => { localStorage.setItem('token', 'fixture'); localStorage.setItem('veggie_user', JSON.stringify(u)); }, user);
  await page.goto(base + '/post-detail?id=1');
  await page.getByRole('button', { name: 'Hữu ích', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[aria-label="Điểm cộng đồng"]')?.textContent === '4');
  check(await page.getByRole('button', { name: 'Hữu ích', exact: true }).getAttribute('aria-pressed') === 'true', 'Vote not retained');
  await page.getByRole('button', { name: 'Chưa hữu ích', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[aria-label="Điểm cộng đồng"]')?.textContent === '2');
  await page.getByRole('button', { name: 'Chưa hữu ích', exact: true }).click();
  await page.waitForFunction(() => document.querySelector('[aria-label="Điểm cộng đồng"]')?.textContent === '3');
  const comment = page.getByRole('textbox', { name: 'Chia sẻ suy nghĩ của bạn' });
  await comment.fill('  Mình muốn thử món này  ');
  await page.getByRole('button', { name: 'Gửi bình luận', exact: true }).click();
  await page.getByRole('alert').waitFor();
  check((await comment.inputValue()).includes('Mình muốn thử'), 'Failed comment erased draft');
  await page.getByRole('button', { name: 'Gửi bình luận', exact: true }).click();
  await page.getByText('Mình muốn thử món này', { exact: true }).waitFor();
  check(await comment.inputValue() === '', 'Successful comment kept draft');
  check(writes.filter(w => w.path.endsWith('/comments')).every(w => w.body.content === 'Mình muốn thử món này'), 'Comment not trimmed');
  check(await page.getByRole('button', { name: 'Xóa bình luận của Bạn đọc', exact: true }).count() === 0, 'Delete offered for another user');
  await page.getByRole('button', { name: 'Xóa bình luận của Người kiểm thử', exact: true }).first().click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa bình luận', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  check(!comments.some(c => c.id === 32), 'Comment delete not applied');
  await page.getByRole('button', { name: 'Báo cáo', exact: true }).first().click();
  await page.getByLabel('Lý do báo cáo').selectOption('nutrition_misinformation');
  await page.getByLabel('Thông tin thêm (không bắt buộc)').fill('Thiếu nguồn tham khảo');
  await page.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  check(reports[0].targetType === 'post' && reports[0].targetId === 1 && reports[0].category === 'nutrition_misinformation', 'Report contract mismatch');
  await page.getByRole('button', { name: 'Báo cáo', exact: true }).first().click();
  await page.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await page.getByRole('dialog').getByRole('alert').waitFor();
  await page.keyboard.press('Escape');
  check(await page.evaluate(() => document.body.style.overflow) !== 'hidden', 'Dialog left background scrolling locked');
  await page.getByRole('button', { name: 'Báo cáo bình luận của Bạn đọc', exact: true }).click();
  await page.getByRole('button', { name: 'Gửi báo cáo', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  check(reports[1].targetType === 'comment' && reports[1].targetId === 31, 'Comment report mismatch');
  await page.goto(base + '/post-detail?id=2');
  await page.getByText('Bài chưa hiển thị công khai.', { exact: false }).waitFor();
  check(await page.getByRole('button', { name: 'Hữu ích', exact: true }).count() === 0, 'Pending post can vote');
  check(await page.getByRole('button', { name: 'Gửi bình luận', exact: true }).count() === 0, 'Pending post can comment');
  await page.goto(base + '/create-post');
  await page.getByLabel('Tiêu đề', { exact: true }).fill('Cách nấu của mình');
  await page.getByLabel('Nội dung', { exact: true }).fill('## Bữa tối\n\nĐậu hũ hấp với gừng tươi.');
  await page.getByLabel('Nội dung', { exact: true }).evaluate(field => field.setSelectionRange(0, 2));
  await page.getByRole('button', { name: 'In đậm', exact: true }).click();
  check((await page.getByLabel('Nội dung', { exact: true }).inputValue()).startsWith('**##**'), 'Formatting toolbar lost selection');
  await page.getByLabel('Nội dung', { exact: true }).fill('## Bữa tối\n\nĐậu hũ hấp với gừng tươi.');
  await page.getByLabel('Công thức đính kèm (không bắt buộc)').selectOption('1');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'docs/screenshots/community-compose-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'docs/screenshots/community-compose-mobile.png', fullPage: true });
  check(await page.locator('option').filter({ hasText: 'dummy' }).count() === 0, 'Dummy recipe option');
  await page.reload();
  check(await page.getByLabel('Tiêu đề', { exact: true }).inputValue() === 'Cách nấu của mình', 'Draft lost after refresh');
  await page.getByRole('button', { name: 'Xem trước', exact: true }).click();
  await page.getByRole('heading', { name: 'Bữa tối', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Gửi bài viết', exact: true }).click();
  await page.getByRole('alert').waitFor();
  check(await page.getByRole('heading', { name: 'Đã gửi bài viết', exact: true }).count() === 0, 'False publish success');
  await page.getByRole('button', { name: 'Tiếp tục viết', exact: true }).click();
  check(await page.getByLabel('Nội dung', { exact: true }).inputValue() === '## Bữa tối\n\nĐậu hũ hấp với gừng tươi.', 'Post error erased content');
  await page.getByRole('button', { name: 'Gửi bài viết', exact: true }).dblclick();
  await page.getByRole('heading', { name: 'Đã gửi bài viết', exact: true }).waitFor();
  check(writes.filter(w => w.path.endsWith('/community/posts') && w.method === 'POST').length === 2, 'Duplicate post submitted');
  const createdBody = writes.filter(w => w.path.endsWith('/community/posts') && w.method === 'POST').at(-1).body;
  check(createdBody.recipeId === 1 && createdBody.postType === 'blog', 'Post contract recipe ID mismatch');
  check(await page.evaluate(() => sessionStorage.getItem('veggie:community-draft:v1:999')) === null, 'Sent draft not cleared');
  await page.getByRole('button', { name: 'Xem bài vừa gửi', exact: true }).click();
  await page.getByRole('heading', { name: 'Cách nấu của mình', exact: true }).waitFor();
  await page.goto(base + '/user-posts');
  await page.getByRole('button', { name: 'Xóa bài Cách nấu của mình', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa bài viết', exact: true }).click();
  await page.getByRole('dialog').getByRole('alert').waitFor();
  check(posts.some(p => p.title === 'Cách nấu của mình'), 'Failed delete removed post');
  await page.getByRole('dialog').getByRole('button', { name: 'Xóa bài viết', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'hidden' });
  await page.getByRole('heading', { name: 'Bài đang chờ duyệt', exact: true }).waitFor();
  check(!posts.some(p => p.title === 'Cách nấu của mình'), 'Post not deleted');
  await page.goto(base + '/create-video');
  await page.getByLabel('Tiêu đề', { exact: true }).fill('Một video từ bếp');
  await page.getByLabel('Liên kết video', { exact: true }).fill('https://youtu.be/abcdefghijk');
  await page.getByRole('button', { name: 'Xem trước', exact: true }).click();
  check(await page.locator('iframe').count() === 0, 'YouTube loaded before user chose playback');
  await page.getByRole('button', { name: 'Gửi bài viết', exact: true }).click();
  await page.getByRole('heading', { name: 'Đã gửi bài viết', exact: true }).waitFor();
  check(writes.at(-1).body.postType === 'video' && writes.at(-1).body.content === null, 'Optional video content rejected');
  await page.goto(base + '/post-detail?id=3');
  await page.getByRole('button', { name: 'Xem video', exact: false }).click();
  await page.getByText('Video chưa phát được tại đây.', { exact: true }).waitFor();
  await page.getByText('Tóm tắt video', { exact: true }).click();
  await page.getByText('Nấu canh với rau tươi.', { exact: true }).waitFor();
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/community', '/post-detail?id=1', '/create-post', '/user-posts']) {
      await page.goto(base + route);
      if (route === '/create-post') await page.getByLabel('Tiêu đề', { exact: true }).waitFor();
      else if (route.startsWith('/post-detail')) await page.getByRole('heading', { name: 'Bữa chay cuối tuần', exact: true }).waitFor();
      else await page.locator('.vp-post-card').first().waitFor();
      check(!await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), 'Overflow ' + route + ' at ' + width);
    }
  }
  await page.goto(base + '/post-detail?id=99999');
  await page.getByText('Bài viết không còn hiển thị hoặc bạn chưa có quyền xem.', { exact: true }).waitFor();
  check(queries.some(q => q.includes('postType=video')) && queries.some(q => q.includes('sort=top')) && queries.every(q => q.includes('page.PageSize=12')), 'Filter/page query mismatch');
  check(errors.length === 0, errors.join('; '));
  await page.unrouteAll({ behavior: 'wait' });
  await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
  await page.goto(base + '/community');
}
