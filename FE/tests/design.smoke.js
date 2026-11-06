async (page) => {
 const base='http://127.0.0.1:5173';const check=(ok,message)=>{if(!ok)throw new Error(message)};const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base);await page.locator('.vp-recipe').first().waitFor({timeout:100000});
 for(const width of [320,390,768,1440]) {await page.setViewportSize({width,height:900});check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Overflow home '+width)}
 check(await page.locator('.vp-hero-still-life img').evaluate(img=>img.complete&&img.naturalWidth>0),'Brand illustration failed to load');
 await page.getByRole('textbox',{name:'Hôm nay bạn muốn nấu gì?',exact:true}).fill('dau');
 await page.getByRole('button',{name:'Tìm món trong thư viện',exact:true}).click();
 check(await page.locator('.vp-recipe').count()>0,'Hero search failed with Vietnamese text');
 check(await page.getByRole('textbox',{name:'Tìm công thức',exact:true}).inputValue()==='dau','Hero search lost its query');
 await page.getByRole('textbox',{name:'Tìm công thức',exact:true}).fill('');
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.screenshot({path:'docs/screenshots/home-refined-desktop.png'});
 await page.locator('.vp-recipe h3 button').first().click();await page.getByRole('button',{name:'Vào bếp',exact:true}).waitFor({timeout:100000});await page.getByRole('button',{name:'Vào bếp',exact:true}).click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();check(await dialog.getByRole('heading',{level:1}).innerText()!=='','Missing recipe');
 await page.setViewportSize({width:390,height:844});check(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth),'Cooking mode overflow');await page.screenshot({path:'docs/screenshots/kitchen-mobile.png'});await page.keyboard.press('Escape');check(await dialog.count()===0,'Dialog did not close');check(await page.evaluate(()=>document.body.style.overflow)!=='hidden','Scroll left locked');
 await page.goto(base+'/article-detail?id=r1');await page.getByRole('button',{name:'Vào bếp',exact:true}).waitFor({timeout:100000});await page.getByRole('button',{name:'Vào bếp',exact:true}).click();const kitchen=page.getByRole('dialog');const ingredientCount=await kitchen.getByRole('checkbox').count();check(ingredientCount>0,'Live recipe ingredients missing');await kitchen.getByRole('checkbox').first().check();await kitchen.getByText('1/'+ingredientCount,{exact:true}).waitFor();await page.screenshot({path:'docs/screenshots/kitchen-mobile.png'});await page.getByRole('button',{name:'Đóng chế độ nấu ăn'}).click();
 for(const route of ['/login','/register','/planner','/vision','/chatbot','/community']){await page.goto(base+route);await page.locator('.vp-main').waitFor();check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Overflow '+route)}
 check(errors.length===0,errors.join(';'));await page.goto(base);
}
