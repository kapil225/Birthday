import {test,expect} from '@playwright/test';

const sizes=[[320,568],[360,740],[390,844],[430,932],[768,1024],[1024,768],[844,390],[667,375],[1280,800]];
for(const [width,height] of sizes){
 test(`all chapters and controls fit at ${width}×${height}`,async({browser})=>{
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:width<1100,reducedMotion:'reduce'});
  const page=await context.newPage();
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/');
  const inspect=async()=>{
   const issues=await page.evaluate(()=>{
    const outside=[...document.querySelectorAll('h1,h2,h3,p,.eyebrow,.primary,.outline,.envelope,.cake-wrap')].filter(el=>{const r=el.getBoundingClientRect();return r.width>0&&(r.left< -1||r.right>innerWidth+1);}).map(el=>el.textContent.slice(0,80));
    const small=[...document.querySelectorAll('button,a,select')].filter(el=>{const r=el.getBoundingClientRect();return !el.disabled&&r.width>0&&r.height>0&&(r.width<43.9||r.height<43.9)&&!el.closest('.memory-collage');}).map(el=>el.getAttribute('aria-label')||el.textContent.slice(0,35));
    const landscapePhotos=[...document.querySelectorAll('.collage-tile')].filter(el=>el.offsetWidth>=el.offsetHeight).map(el=>el.getAttribute('aria-label'));
    return{outside,small,landscapePhotos,overflow:document.documentElement.scrollWidth>innerWidth};
   });
   expect(issues).toEqual({outside:[],small:[],landscapePhotos:[],overflow:false});
  };
  await inspect();await page.screenshot({path:`test-results/mobile-${width}-welcome.png`,fullPage:true});
  await page.getByRole('button',{name:'Open Your Surprise',exact:true}).tap();
  await expect(page.getByRole('heading',{name:/Happy Birthday,/})).toBeVisible();
  await page.getByRole('button',{name:'Open My Letter'}).tap();
  await expect(page.locator('.letter-paper')).toBeVisible();
  await inspect();
  // Reserve room for the open flap, and keep the paper legible at narrow sizes.
  await page.locator('#letter').screenshot({path:`test-results/mobile-${width}-letter.png`});
  await page.getByRole('link',{name:'Chapter 5: Make a wish',exact:true}).tap();
  await page.getByRole('button',{name:'Blow out all candles',exact:true}).tap();
  await expect(page.locator('#wish .candle.out')).toHaveCount(5);
  await expect(page.locator('.wish-message')).toContainText('May every beautiful wish');
  await page.getByRole('button',{name:'Relight the candles'}).tap();
  await expect(page.locator('#wish .candle.out')).toHaveCount(0);
  await page.locator('.appreciation-card').first().tap();
  await expect(page.locator('.appreciation-card').first()).toHaveAttribute('aria-expanded','true');
  await page.locator('.collage-tile').first().scrollIntoViewIfNeeded();
  const before=await page.evaluate(()=>window.scrollY);
  await page.locator('.collage-tile').first().tap();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.locator('#root')).toHaveAttribute('inert','');
  await inspect();
  const visibleControls=await page.locator('.viewer-controls').evaluate(el=>{const r=el.getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;});
  expect(visibleControls).toBe(true);
  await page.screenshot({path:`test-results/mobile-${width}-viewer.png`});
  await page.getByRole('button',{name:'Next memory',exact:true}).tap();
  await expect(page.locator('.viewer-top')).toContainText('2 /');
  await page.getByRole('button',{name:'Close',exact:true}).tap();
  await expect(page.locator('#root')).not.toHaveAttribute('inert','');
  expect(Math.abs(await page.evaluate(()=>window.scrollY)-before)).toBeLessThan(2);
  await page.getByRole('button',{name:'Unlock Your Final Surprise'}).tap();
  await inspect();
  await page.getByRole('button',{name:'Replay our little universe'}).tap();
  await expect(page.getByRole('button',{name:'Open Your Surprise',exact:true})).toBeVisible();
  expect(await page.evaluate(()=>window.scrollY)).toBe(0);
  expect(errors).toEqual([]);
  await context.close();
 });
}

test('mobile motion, touch scrolling and orientation changes stay usable',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'no-preference'});
 const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');
 await page.getByRole('button',{name:'Open Your Surprise',exact:true}).tap();
 await expect(page.getByRole('heading',{name:/Happy Birthday,/})).toBeVisible();
 await page.getByRole('link',{name:'Chapter 3: Memories',exact:true}).tap();
 await page.locator('#memories').scrollIntoViewIfNeeded();
 await page.getByRole('button',{name:'Pause collage',exact:true}).tap();
 await expect(page.getByRole('button',{name:'Play collage',exact:true})).toBeVisible();
 await page.locator('.collage-tile').first().tap();
 await page.setViewportSize({width:844,height:390});
 await expect(page.getByRole('button',{name:'Close',exact:true})).toBeInViewport();
 await expect(page.getByRole('button',{name:'Next memory',exact:true})).toBeInViewport();
 await page.getByRole('button',{name:'Close',exact:true}).tap();
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('button',{name:'Open My Letter'}).tap();
 await expect(page.locator('.letter-paper')).toBeVisible();
 await context.close();
});
