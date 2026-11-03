async (page) => {
 const check=(ok,m)=>{if(!ok)throw new Error(m)};const base='http://127.0.0.1:5173';const writes=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.unroute('https://veggieai-api.onrender.com/api/**');await page.goto(base);await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 const user={id:'u1',name:'Test',email:'test@example.test',role:'user',hasHealthProfile:true};
 const meal={id:1,recipeId:31,recipeTitle:'Cơm chay',mealType:'lunch',servings:1,nutrition:{kcal:400}};
 const plan={id:1,status:'active',startDate:'2026-11-03',endDate:'2026-11-03',days:[{date:'2026-11-03',total:{kcal:400},meals:[meal]}]};
 await page.route('https://veggieai-api.onrender.com/api/**',async route=>{
  const req=route.request(),u=new URL(req.url()),p=u.pathname.toLowerCase();const data=(req.headers()['content-type']||'').includes('json')?req.postDataJSON():null;
  if(req.method()!=='GET')writes.push({p,method:req.method(),data});
  const ok=data=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({success:true,data})});
  if(p.endsWith('/auth/me'))return ok(user);
  if(p.endsWith('/recipes/favorites')){const number=Number(u.searchParams.get('page')||1);return ok({items:[{id:'r'+number,title:'Món đã lưu '+number,kcalPerServing:400,proteinG:20}],page:number,pageSize:1,totalCount:2,totalPages:2})}
  if(p.endsWith('/meal-plans/current'))return ok(plan);
  if(p.endsWith('/shopping-list'))return ok({id:1,planId:1,items:[{id:2,ingredientName:'Đậu hũ',quantityG:200,isBought:false}]});
  if(p.endsWith('/items/2'))return ok({id:2,isBought:true});
  if(p.endsWith('/nutrition/daily'))return ok({consumed:{kcal:400,proteinG:20,ironMg:3,b12Mcg:0},target:{kcal:1800,proteinG:70},logs:[{id:1,recipeTitle:'Cơm chay',servings:1,kcalConsumed:400}],alerts:[],steps:2000,kcalBurned:90});
  if(p.endsWith('/nutrition/activity'))return ok({});
  if(p.endsWith('/notifications'))return ok({items:[{id:2,content:'Cập nhật hồ sơ',isRead:false,createdAt:'2026-11-03T00:00:00Z'}],totalPages:1});
  if(p.endsWith('/read'))return ok(true);
  return ok([]);
 });
 await page.evaluate(u=>{localStorage.setItem('token','fixture');localStorage.setItem('veggie_user',JSON.stringify(u))},user);
 await page.goto(base+'/user-collection');await page.getByRole('button',{name:'Món đã lưu 1',exact:true}).waitFor();await page.getByRole('button',{name:'Trang sau'}).click();await page.getByRole('button',{name:'Món đã lưu 2',exact:true}).waitFor();
 await page.goto(base+'/planner');await page.getByRole('button',{name:'Danh sách đi chợ'}).click();await page.getByLabel('Đậu hũ · 200 g').click();await page.locator('input[type=checkbox]:checked').waitFor();check(!writes.some(w=>w.p.endsWith('/shopping-list')&&w.method==='POST'),'Existing shopping list overwritten');
 await page.goto(base+'/user-nutrition');await page.getByRole('heading',{name:'Bữa đã ghi nhận'}).waitFor();check((await page.locator('.vp-daily-totals').innerText()).includes('400'),'Consumed not rendered');await page.getByLabel('Số bước').fill('3000');await page.getByRole('button',{name:'Lưu vận động'}).click();check(writes.some(w=>w.data?.steps===3000),'Activity not submitted');
 await page.goto(base+'/notifications');await page.getByRole('button',{name:'Đánh dấu đã đọc',exact:true}).click();check(writes.some(w=>w.p.endsWith('/notifications/2/read')),'Read notification missing');check(errors.length===0,errors.join(';'));
 await page.unroute('https://veggieai-api.onrender.com/api/**');await page.evaluate(()=>localStorage.clear());await page.goto(base);
}
