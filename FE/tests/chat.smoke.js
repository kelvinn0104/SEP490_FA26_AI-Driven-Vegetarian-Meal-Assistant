async (page) => {
 const check=(ok,message)=>{if(!ok)throw new Error(message)};
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const base='http://127.0.0.1:5173';
 await page.unrouteAll({behavior:'wait'});
 await page.goto(base);
 await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 const user={id:99,email:'chat@example.test',role:'user'};
 const answer='Trứng có **3 vai trò chính**: tạo độ ẩm, **kết dính**, và tạo độ xốp.\n\n## Cách thay\n\n1. Chuối nghiền.\n2. Hạt chia.\n\n| Nguyên liệu | Lượng |\n| --- | --- |\n| Chuối | 1/2 quả |\n\n    '+'long_code_'.repeat(80);
 const busy='Xin lỗi, trợ lý AI đang bận. Bạn vui lòng thử lại sau ít phút.';
 let release,started,outcome='success',writes=0,historyFail=true;
 await page.route('https://veggieai-api.onrender.com/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname.toLowerCase();
  const ok=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
  if(path.endsWith('/auth/me'))return ok(user);
  if(path.endsWith('/chat/sessions'))return ok(req.method()==='POST'?{id:9}:[{id:3,lastMessage:busy,createdAt:'2026-11-08T00:00:00Z'}]);
  if(path.endsWith('/chat/sessions/3/messages')){
   if(historyFail)return route.fulfill({status:503,contentType:'application/json',body:'{}'});
   return ok([{id:90,sender:'user',content:'Lịch sử câu hỏi'},{id:91,sender:'ai',content:answer}]);
  }
  if(path.endsWith('/chat/sessions/9/messages')){
   writes++;
   const body=req.postDataJSON();
   await new Promise(resolve=>{release=resolve;started()});
   if(outcome==='timeout')return route.fulfill({status:504,contentType:'application/json',body:'{}'});
   return ok({userMessage:{id:writes*2,sender:'user',content:body.content},aiMessage:{id:writes*2+1,sender:'ai',content:outcome==='empty'?'  ':outcome==='busy'?busy:answer}});
  }
  return ok([]);
 });
 await page.evaluate(user=>{localStorage.setItem('token','fixture');localStorage.setItem('veggie_user',JSON.stringify(user))},user);
 await page.setViewportSize({width:1440,height:900});
 await page.goto(base+'/chatbot');
 await page.getByRole('button',{name:/Cuộc trò chuyện chưa có phản hồi/}).waitFor();
 const input=page.getByRole('textbox',{name:'Tin nhắn'});
 const firstStarted=new Promise(resolve=>{started=resolve});
 await input.fill('Thay **trứng** khi làm bánh?');
 await page.getByRole('button',{name:'Gửi tin nhắn'}).click();
 await page.getByLabel('Tin nhắn đang gửi',{exact:true}).waitFor();
 check(await input.getAttribute('readonly')!==null,'Draft changes during send');
 await firstStarted;
 check(typeof release==='function','Missing pending request');
 release();
 await page.locator('.vp-message .vp-prose strong').filter({hasText:'3 vai trò chính'}).waitFor();
 const style=await page.locator('.vp-message .vp-prose strong').first().evaluate(el=>({display:getComputedStyle(el).display,transform:getComputedStyle(el).textTransform,size:parseFloat(getComputedStyle(el).fontSize)}));
 check(style.display==='inline'&&style.transform==='none'&&style.size>=14,'Markdown emphasis inherits sender label styling');
 check(await page.locator('.vp-chat-table table').count()===1,'Markdown table missing');
 await page.evaluate(()=>{Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copiedAnswer=text}}})});
 await page.getByRole('button',{name:'Sao chép câu trả lời',exact:true}).first().click();
 check(await page.evaluate(()=>window.__copiedAnswer)===answer,'Copy lost answer text');
 await page.getByRole('button',{name:'Tóm tắt thành các bước ngắn',exact:true}).click();
 check(await input.inputValue()==='Tóm tắt thành các bước ngắn','Follow-up did not fill draft');
 check(writes===1,'Follow-up sent without confirmation');
 await input.fill('');

 check((await page.locator('.vp-message.own').innerText()).includes('**trứng**'),'User message reformatted');
 for(const mode of ['light','dark']){
  await page.evaluate(mode=>document.querySelector('.vp').setAttribute('data-theme',mode),mode);
  for(const width of [320,390,1440]){
   await page.setViewportSize({width,height:width===1440?900:844});
   check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Chat overflow '+width);
   check(await page.locator('.vp-page-heading').evaluate(el=>el.getBoundingClientRect().top >= document.querySelector('.vp-header').getBoundingClientRect().bottom),'Chat heading behind header');

   check(await page.locator('.vp-chat-form').evaluate(el=>el.getBoundingClientRect().bottom < (document.querySelector('.vp-bottom-nav')?.getBoundingClientRect().height ? document.querySelector('.vp-bottom-nav').getBoundingClientRect().top : innerHeight)),'Composer obscured by dock');
  }
 }
 await page.setViewportSize({width:390,height:600});
 await page.waitForFunction(()=>document.querySelector('.vp-chat-form').getBoundingClientRect().bottom<innerHeight-65);
 check(await page.locator('.vp-messages').evaluate(el=>el.clientHeight>100),'Transcript collapsed in short viewport');
 await page.setViewportSize({width:1440,height:900});
  for(const failure of ['timeout','empty','busy']){
  outcome=failure;
  const nextStarted=new Promise(resolve=>{started=resolve});
  await input.fill('Câu hỏi cần gửi lại');
  await page.getByRole('button',{name:'Gửi tin nhắn'}).click();
  await page.getByLabel('Tin nhắn đang gửi',{exact:true}).waitFor();
  await nextStarted;
  release();
  await page.getByRole('alert').waitFor();
  check(await input.inputValue()==='Câu hỏi cần gửi lại','Draft lost '+failure);
  check(await page.locator('[data-activity="chat"]').count()===0,'Stuck loading '+failure);
 }
 const oldCount=await page.locator('.vp-message').count();
 await page.getByRole('button',{name:/Cuộc trò chuyện chưa có phản hồi/}).click();
 await page.getByRole('alert').waitFor();
 check(await page.locator('.vp-message').count()===oldCount,'History error replaced transcript');
 historyFail=false;
 await page.getByRole('button',{name:/Cuộc trò chuyện chưa có phản hồi/}).click();
 await page.getByText('Lịch sử câu hỏi',{exact:true}).waitFor();
 check(await page.locator('.vp-message').count()===2,'History mixed conversations');
  await page.getByRole('button',{name:'Cuộc trò chuyện mới',exact:true}).click();
 check(await input.inputValue()==='','New conversation kept draft');
 check(await page.locator('.vp-message').count()===0,'New conversation kept messages');
 check(errors.length===0,errors.join(';'));
 await page.unrouteAll({behavior:'wait'});
 await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
}
