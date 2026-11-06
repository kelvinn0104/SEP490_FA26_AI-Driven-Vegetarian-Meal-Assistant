import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { amount, listOf, safeImage, userError, validatePhoto } from '../src/user/data.js';

test('missing nutrients stay unknown; zero remains zero; portions scale', () => {
  assert.equal(amount(null), '—'); assert.equal(amount(undefined), '—');
  assert.equal(amount(0), '0'); assert.equal(amount(20, 2), '40');
  assert.deepEqual(listOf({ items: [1] }), [1]); assert.deepEqual(listOf(null), []);
});
test('images reject executable schemes and preserve relative upload paths', () => {
  assert.equal(safeImage('javascript:alert(1)'), undefined);
  assert.equal(safeImage('data:text/html,unsafe'), undefined);
  assert.equal(safeImage('/uploads/meal.jpg'), 'https://veggieai-api.onrender.com/uploads/meal.jpg');
});
test('photo validation enforces type and 8 MB before upload', () => {
  assert.equal(validatePhoto({ type: 'image/png', size: 8 * 1024 * 1024 }), '');
  assert.ok(validatePhoto({ type: 'image/png', size: 8 * 1024 * 1024 + 1 }));
  assert.ok(validatePhoto({ type: 'text/html', size: 1 }));
});
test('HTTP failures remain failures and session expires only on 401', async () => {
  let token = 'test-token'; let expired = 0;
  globalThis.__client = { API_BASE_URL: 'https://example.test/api', getAuthToken: () => token, setAuthToken: v => token = v, setStoredUser: () => {}, unwrap: v => v?.data ?? v };
  const source = (await readFile(new URL('../src/user/api.js', import.meta.url), 'utf8')).replace(/import\s*\{[\s\S]*?\}\s*from\s*["']\.\.\/api\/client["'];/, 'const { API_BASE_URL, getAuthToken, setAuthToken, setStoredUser, unwrap } = globalThis.__client;');
  const { request } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
  const originalFetch = globalThis.fetch; const originalWindow = globalThis.window;
  globalThis.window = { dispatchEvent: () => expired++ };
  try {
    globalThis.fetch = async (url, options) => { assert.equal(options.headers['Content-Type'], undefined); assert.equal(options.headers.Authorization, 'Bearer test-token'); return new Response(JSON.stringify({ success: true, data: [1] }), { headers: { 'content-type': 'application/json' } }); };
    assert.deepEqual(await request('/Recipes'), [1]);
    globalThis.fetch = async () => new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
    await assert.rejects(request('/missing'), e => e.status === 404);
    assert.equal(expired, 0);
    globalThis.fetch = async () => new Response(JSON.stringify({message:'Vui lòng chờ 60 giây.',errors:['TOO_MANY_REQUESTS','retryAfterSeconds=60']}), { status:429,headers:{'content-type':'application/json','Retry-After':'60'} });
    await assert.rejects(request('/Auth/resend-code'), e => e.status===429 && e.retryAfterSeconds===60 && e.message==='Vui lòng chờ 60 giây.');
    globalThis.fetch = async () => new Response('', { status: 401 });
    await assert.rejects(request('/private'), e => e.status === 401);
    assert.equal(expired, 1); assert.equal(token, null);
    globalThis.fetch = async () => new Response(null, { status: 204 });
    assert.equal(await request('/delete', undefined, 'DELETE'), null);
    assert.match(userError({ status: 404 }), /chưa sẵn sàng/);
  } finally { globalThis.fetch = originalFetch; globalThis.window = originalWindow; delete globalThis.__client; }
});
import { pendingVerification, secondsUntil, readPending, PENDING_KEY } from '../src/user/otp.js';
test('OTP deadlines use backend values, preserve zero cooldown, and survive refresh', () => {
  const pending = pendingVerification({ email:'Test@Example.com', expiresInSeconds:120, resendAfterSeconds:0, codeSent:false }, 'ignored', 1000);
  assert.equal(pending.email,'test@example.com'); assert.equal(secondsUntil(pending.expiresAt,1000),120); assert.equal(secondsUntil(pending.resendAt,1000),0); assert.equal(secondsUntil(pending.expiresAt,121001),0);
  assert.deepEqual(readPending({getItem:key => key === PENDING_KEY ? JSON.stringify(pending) : null}),pending);
  assert.equal(readPending({getItem:()=>'broken'}),null);
  assert.equal(pendingVerification({}, 'test@example.com',1000).expiresAt,null);
});
import { isTestContent } from '../src/user/data.js';
test('explicit test markers are excluded without hiding ordinary recipes',()=>{
 assert.equal(isTestContent({title:'Bún trộn tempeh (dummy)'}),true);
 assert.equal(isTestContent({mediaUrl:'/uploads/videos/dummy-pho.mp4'}),true);
 assert.equal(isTestContent({title:'Món chay cho bữa tối'}),false);
});
import { isUnavailableChat } from '../src/user/data.js';
test('backend busy fallback is not treated as a successful AI answer',()=>{
 assert.equal(isUnavailableChat('Xin lỗi, trợ lý AI đang bận. Bạn vui lòng thử lại sau ít phút.'),true);
 assert.equal(isUnavailableChat('Bạn có thể nấu canh đậu hũ.'),false);
});
