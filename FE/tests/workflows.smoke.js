async (page) => {
 await page.unroute('https://veggieai-api.onrender.com/api/**'); await page.evaluate(()=>localStorage.clear());
 const base='http://127.0.0.1:5173'; const check=(ok,message)=>{if(!ok)throw new Error(message)}; const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const pending = new Map();
 const hold = async kind => {
  const response = new Promise(resolve => pending.set(kind, resolve));
  await page.evaluate(kind => (window.__pendingAi ||= []).push(kind), kind);
  return response;
 };
 const activity = kind => page.locator(`[data-activity="${kind}"][role="status"]`);
 const finish = async kind => {
  await activity(kind).waitFor();
  await page.waitForFunction(() => !document.querySelector('.vp-ai-pulse i').getAnimations().length);
  await page.waitForFunction(kind => window.__pendingAi?.includes(kind), kind);
  check(pending.has(kind), `Activity without pending request: ${kind}`);
  pending.get(kind)();
  await activity(kind).waitFor({state:'hidden'});
 };
 await page.emulateMedia({reducedMotion:'reduce'});
 const user={id:999,email:'fixture@example.test',displayName:'Test',role:'AuthorizedUser'}; const writes=[];
 await page.route('https://veggieai-api.onrender.com/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname.toLowerCase(),body=(req.headers()['content-type'] || '').includes('application/json') ? req.postDataJSON() : null;
  const ok=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
  if(req.method()!=='GET')writes.push({path,body});
  if(path.endsWith('/auth/me'))return ok(user);
  if(path.endsWith('/health-profile'))return ok({id:1});
  if(path.endsWith('/auth/register'))return ok({resendAfterSeconds:60});
  if(path.endsWith('/auth/verify-code'))return ok({token:'fixture',user});
  if(path.endsWith('/recipes'))return ok([]);
  const plan={id:1,startDate:'2026-11-01',endDate:'2026-11-02',status:'draft',days:[{date:'2026-11-01',total:{kcal:500},meals:[{id:1,mealType:'lunch',recipeId:1,recipeTitle:'Cơm đậu hũ',servings:1,nutrition:{kcal:500}}]}]};
  if(path.endsWith('/meal-plans/ai/generate')){await hold('generate');return ok({plan,validationWarnings:[]})}
  if(path.endsWith('/items/1/swap')){await hold('swap');plan.days[0].meals[0].recipeTitle='Canh nấm';return ok({plan})}
  if(path.endsWith('/chat/sessions'))return ok(req.method()==='POST'?{id:1}:[]);
  if(path.endsWith('/chat/sessions/1/messages')){
   await hold('chat');
   return route.fulfill({status:504,contentType:'application/json',body:'{}'});
  }
  if(path.endsWith('/scans') && req.method()==='POST'){await hold('scan');return ok({scanId:1,detectedItems:[{ingredientId:2,nameVi:'Đậu hũ'}],suggestedRecipes:[]})}
  if(path.endsWith('/scans/1/confirm'))return ok({scanId:1,detectedItems:[{ingredientId:2,nameVi:'Đậu hũ'}],suggestedRecipes:[]});
  return route.fulfill({status:404,contentType:'application/json',body:'{}'});
 });
 await page.goto(base+'/register');
 await page.getByLabel('Tên hiển thị').fill('Test'); await page.getByLabel('Email',{exact:true}).fill(user.email); await page.getByLabel('Mật khẩu',{exact:true}).fill('TestPassword!123'); await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
 await page.getByLabel('Mã xác thực').fill('123456'); await page.getByRole('button',{name:'Xác thực & tiếp tục'}).click();
 await page.getByRole('heading',{name:'Chào bạn đến với VeggieAI.',exact:true}).waitFor();
 await page.goto(base+'/planner'); await page.getByRole('button',{name:'Tạo thực đơn mới',exact:true}).click(); await page.getByLabel('Số ngày',{exact:true}).fill('2'); await page.getByRole('button',{name:'Tạo thực đơn',exact:true}).click(); await finish('generate'); await page.getByRole('button',{name:'Cơm đậu hũ',exact:true}).waitFor();
 check(writes.find(w=>w.path.endsWith('/generate')).body.days===2,'Planner lost days');
 await page.getByRole('button',{name:'Đổi Cơm đậu hũ',exact:true}).click();
 await activity('swap').waitFor();
 check(await page.getByRole('button',{name:'Cơm đậu hũ',exact:true}).isVisible(),'Swap replaced meal before response');
 await finish('swap');
 await page.getByRole('button',{name:'Canh nấm',exact:true}).waitFor();
 await page.getByRole('button',{name:'Dùng thực đơn này',exact:true}).click(); await page.getByRole('alert').waitFor();
 await page.goto(base+'/vision');
 await page.locator('input[type=file]').setInputFiles({name:'pantry.png',mimeType:'image/png',buffer:Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1sAAAAASUVORK5CYII=','base64')});
 await page.getByRole('button',{name:'Nhận diện nguyên liệu',exact:true}).click(); await finish('scan'); await page.getByLabel('Đậu hũ',{exact:true}).waitFor(); await page.getByRole('button',{name:'Xác nhận nguyên liệu'}).click();
 check(writes.some(w=>w.path.endsWith('/confirm') && w.body.ingredientIds[0]===2),'Confirmation failed');
 await page.goto(base+'/chatbot');
 const input = page.getByRole('textbox',{name:'Tin nhắn'});
 await input.fill('Món chay với đậu hũ?');
 await page.getByRole('button',{name:'Gửi tin nhắn'}).click();
 await finish('chat');
 await page.getByRole('alert').filter({hasText:'Máy chủ phản hồi chậm'}).waitFor();
 check(await input.inputValue()==='Món chay với đậu hũ?','Chat lost the draft on timeout');
 check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Mobile overflow'); check(errors.length===0,errors.join(';'));
 await page.unroute('https://veggieai-api.onrender.com/api/**'); await page.evaluate(()=>localStorage.clear()); await page.goto(base);
}
