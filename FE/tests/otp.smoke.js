async (page) => {
 const base='http://127.0.0.1:5173';const check=(ok,m)=>{if(!ok)throw new Error(m)};const errors=[];page.on('pageerror',e=>errors.push(e.message));let registerBody;let profileBody;let profile=null;
 await page.unroute('https://veggieai-api.onrender.com/api/**');await page.goto(base);await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});
 const user={id:'u1',email:'otp@example.test',name:'Người dùng test',role:'user',hasHealthProfile:false};
 await page.route('https://veggieai-api.onrender.com/api/**',async route=>{
  const req=route.request(),path=new URL(req.url()).pathname.toLowerCase(),body=(req.headers()['content-type']||'').includes('json')?req.postDataJSON():null;
  const reply=(data,status=200)=>route.fulfill({status,contentType:'application/json',body:JSON.stringify(status===200?{success:true,data}:{success:false,message:data})});
  if(path.endsWith('/auth/register')){registerBody=body;return reply({email:user.email,requiresVerification:true,codeSent:false,expiresInSeconds:120,resendAfterSeconds:0})}
  if(path.endsWith('/auth/resend-code'))return reply({email:user.email,requiresVerification:true,codeSent:true,expiresInSeconds:300,resendAfterSeconds:60});
  if(path.endsWith('/auth/verify-code'))return body.otpCode==='123456'?reply({token:'fixture',user}):reply('Mã OTP không chính xác.',400);
  if(path.endsWith('/auth/me'))return reply(user);
  if(path.endsWith('/allergies'))return reply([{id:3,name:'Peanut'},{id:8,name:'Soy'},{id:9,name:'Tree nuts'},{id:10,name:'Sesame'},{id:11,name:'Gluten'},{id:12,name:'Mushroom'}]);
  if(path.endsWith('/health-profile')){
   if(req.method()==='PUT'){profileBody=body;profile={...body,id:1,bmi:21,tdee:1800,targets:{proteinG:70},allergies:[{id:3,name:'Đậu phộng'}]};return reply(profile)}
   return profile?reply(profile):reply('Bạn chưa tạo hồ sơ sức khỏe.',404)
  }
  return reply([],200);
 });
 await page.goto(base+'/register');await page.setViewportSize({width:390,height:844});
 await page.getByLabel('Tên hiển thị').fill('Người dùng test');await page.getByLabel('Email',{exact:true}).fill(user.email);await page.getByLabel('Mật khẩu',{exact:true}).fill('test123');await page.getByLabel('Tên hiển thị').fill('  ');
 await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Tên hiển thị cần ít nhất'}).waitFor();
 check(!registerBody,'Whitespace name reached backend');
 await page.getByLabel('Tên hiển thị').fill('Người dùng test');
 await page.getByRole('button',{name:'Tạo tài khoản',exact:true}).click();
 await page.getByText('Mã đã được gửi trước đó.',{exact:false}).waitFor();check(registerBody.role==='user','Registration role incorrect');
 await page.goto(base+'/login');
 await page.getByRole('heading',{name:'Đăng nhập',exact:true}).waitFor();
 await page.getByRole('button',{name:'Tiếp tục xác thực '+user.email,exact:true}).click();
 await page.getByLabel('Mã xác thực').waitFor();
 await page.reload();await page.getByLabel('Mã xác thực').waitFor();check(await page.getByRole('button',{name:'Gửi lại mã',exact:true}).isEnabled(),'Zero cooldown lost after refresh');
 await page.getByLabel('Mã xác thực').fill('111111');await page.getByRole('button',{name:'Xác thực & tiếp tục'}).click();await page.getByText('Mã OTP không chính xác.',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Gửi lại mã',exact:true}).click();await page.getByRole('button',{name:/Gửi lại sau/}).waitFor();check(await page.getByRole('button',{name:/Gửi lại sau/}).isDisabled(),'Cooldown not enforced');
 check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'OTP mobile overflow');await page.screenshot({path:'docs/screenshots/otp-mobile.png'});
 await page.getByLabel('Mã xác thực').fill('123456');await page.getByRole('button',{name:'Xác thực & tiếp tục'}).click();await page.getByRole('heading',{name:'Chào bạn đến với VeggieAI.',exact:true}).waitFor();await page.getByRole('button',{name:'Thiết lập hồ sơ',exact:true}).click();await page.getByRole('heading',{name:'Hồ sơ sức khỏe',exact:true}).waitFor();
 check(await page.evaluate(()=>sessionStorage.getItem('veggie:pending-verification'))===null,'Pending email not cleared');
 await page.getByRole('combobox',{name:'Giới tính',exact:true}).selectOption('female');await page.getByLabel('Ngày sinh').fill('2000-01-01');await page.getByLabel('Chiều cao (cm)').fill('165');await page.getByLabel('Cân nặng (kg)').fill('57');await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();await page.getByRole('combobox',{name:'Vận động',exact:true}).selectOption('moderate');
 await page.getByRole('combobox',{name:'Mục tiêu',exact:true}).selectOption('maintain');
 await page.getByRole('button',{name:'Lưu hồ sơ',exact:true}).click();
 await page.getByRole('alert').filter({hasText:'Chọn thực phẩm bạn bị dị ứng'}).waitFor();
 await page.getByLabel('Không có dị ứng thực phẩm đã biết',{exact:true}).check();
 await page.getByLabel('Đậu phộng (lạc)',{exact:true}).check();
 check(!await page.getByLabel('Không có dị ứng thực phẩm đã biết',{exact:true}).isChecked(),'None conflicts with selected allergy');

 await page.getByLabel('Đậu nành',{exact:true}).check();
 await page.getByText('Đã chọn 2 mục',{exact:true}).waitFor();
 await page.getByRole('button',{name:'Bỏ chọn tất cả'}).click();
 check(await page.locator('.vp-allergy-options input:checked').count()===0,'Clear allergies failed');
 await page.getByLabel('Đậu phộng (lạc)',{exact:true}).check();await page.getByRole('button',{name:'Lưu hồ sơ',exact:true}).click();await page.getByRole('heading',{name:'Hồ sơ đã lưu.',exact:true}).waitFor();check(profileBody.allergyIds[0]===3,'Allergies lost');
 await page.reload();
 await page.getByLabel('Ngày sinh').waitFor();
 await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 check(await page.getByLabel('Đậu phộng (lạc)',{exact:true}).isChecked(),'Saved allergy lost on reload');
 check(!await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),'Allergy mobile overflow');
 await page.getByLabel('Không có dị ứng thực phẩm đã biết',{exact:true}).check();
 check(await page.locator('.vp-allergy-options input:checked').count()===0,'None did not clear conflicting allergies');
 await page.getByRole('button',{name:'Lưu hồ sơ',exact:true}).click();
 await page.getByRole('heading',{name:'Hồ sơ đã lưu.',exact:true}).waitFor();
 check(profileBody.allergyIds.length===0,'Explicitly cleared allergies were not submitted');
 await page.reload();
 await page.getByLabel('Ngày sinh').waitFor();
 await page.getByRole('button',{name:'Tiếp tục',exact:true}).click();
 check(await page.getByLabel('Không có dị ứng thực phẩm đã biết',{exact:true}).isChecked(),'No known allergies lost after reload');

 check(errors.length===0,errors.join(';'));await page.unroute('https://veggieai-api.onrender.com/api/**');await page.evaluate(()=>{localStorage.clear();sessionStorage.clear()});await page.goto(base+'/register');await page.setViewportSize({width:1280,height:900});await page.getByRole('heading',{name:'Tạo tài khoản',exact:true}).waitFor();await page.screenshot({path:'docs/screenshots/register-desktop.png'});
}
