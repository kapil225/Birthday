import {test,expect,chromium} from '@playwright/test';

test('starts music immediately when the browser permits autoplay',async({},testInfo)=>{
 const browser=await chromium.launch({...testInfo.project.use.launchOptions,args:['--autoplay-policy=no-user-gesture-required']});
 try{
  const page=await browser.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('audio')).toHaveJSProperty('paused',false);
  await expect(page.getByRole('button',{name:'Pause background music'})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Pause background music'}).click();
  await page.getByRole('button',{name:'Open Your Surprise',exact:true}).click();
  await expect(page.getByRole('heading',{name:/Happy Birthday,/})).toBeVisible();
  await expect(page.locator('audio')).toHaveJSProperty('paused',true);
 }finally{await browser.close();}
});

test('blocked autoplay starts on the first tap and respects later pauses',async({},testInfo)=>{
 const browser=await chromium.launch({...testInfo.project.use.launchOptions,args:['--autoplay-policy=user-gesture-required']});
 try{
  const page=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
  await page.goto('http://127.0.0.1:4173/');
  await expect.poll(()=>page.locator('audio').evaluate(el=>el.readyState)).toBeGreaterThanOrEqual(2);
  await expect(page.locator('audio')).toHaveJSProperty('paused',true);
  await expect(page.locator('.audio-error')).toHaveCount(0);
  await page.getByRole('button',{name:'Open Your Surprise',exact:true}).tap();
  await expect(page.locator('audio')).toHaveJSProperty('paused',false);
  await page.getByRole('button',{name:'Pause background music'}).tap();
  await page.getByRole('button',{name:'Celebrate again'}).tap();
  await expect(page.locator('audio')).toHaveJSProperty('paused',true);
  await page.getByRole('button',{name:'Play background music'}).tap();
  await expect(page.locator('audio')).toHaveJSProperty('paused',false);
 }finally{await browser.close();}
});
