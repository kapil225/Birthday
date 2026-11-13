import {test,expect} from '@playwright/test';

test('living collage independently cycles every tile, avoids duplicates, and pauses for the viewer',async({browser})=>{
 const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'no-preference'});
 const page=await context.newPage();
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('http://127.0.0.1:4173/');
 await page.getByRole('button',{name:'Open Your Surprise',exact:true}).click();
 await page.locator('#memories').scrollIntoViewIfNeeded();
 await expect(page.locator('.living-memory-wall')).toHaveAttribute('data-paused','false');
 await expect(page.locator('.collage-tile')).toHaveCount(12);
 const positions=await page.locator('.collage-tile').evaluateAll(tiles=>tiles.map(tile=>({x:tile.offsetLeft,y:tile.offsetTop,w:tile.offsetWidth,h:tile.offsetHeight})));
 const samples=await page.evaluate(async()=>{
  const seen=Array.from({length:12},()=>new Set());let duplicates=0;let broken=0;
  const end=performance.now()+8500;
  while(performance.now()<end){
   const occupied=[];
   document.querySelectorAll('.collage-tile').forEach((tile,i)=>{
    seen[i].add(tile.dataset.photoIndex);
    occupied.push(tile.dataset.photoIndex);
    if(tile.dataset.nextIndex)occupied.push(tile.dataset.nextIndex);
    tile.querySelectorAll('img').forEach(img=>{if(img.complete&&img.naturalWidth===0)broken++;});
   });
   if(new Set(occupied).size!==occupied.length)duplicates++;
   await new Promise(resolve=>setTimeout(resolve,40));
  }
  return {seen:seen.map(set=>set.size),duplicates,broken};
 });
 expect(samples.duplicates).toBe(0);
 expect(samples.broken).toBe(0);
 expect(samples.seen.every(count=>count>=2)).toBe(true);
 const afterPositions=await page.locator('.collage-tile').evaluateAll(tiles=>tiles.map(tile=>({x:tile.offsetLeft,y:tile.offsetTop,w:tile.offsetWidth,h:tile.offsetHeight})));
 afterPositions.forEach((r,i)=>{expect(Math.abs(r.x-positions[i].x)).toBeLessThan(4);expect(Math.abs(r.y-positions[i].y)).toBeLessThan(4);expect(r.w).toBeCloseTo(positions[i].w,0);expect(r.h).toBeCloseTo(positions[i].h,0);});
 await page.getByRole('button',{name:'Pause collage',exact:true}).click();
 await expect(page.locator('.living-memory-wall')).toHaveAttribute('data-paused','true');
 const signature=()=>page.locator('.collage-tile').evaluateAll(tiles=>tiles.map(tile=>[tile.dataset.photoIndex,tile.dataset.nextIndex]));
 const paused=await signature();
 await page.waitForTimeout(5000);
 expect(await signature()).toEqual(paused);
 await page.getByRole('button',{name:'Play collage',exact:true}).click();
 await page.locator('.collage-tile').first().click();
 await expect(page.getByRole('dialog')).toBeVisible();
 const inViewer=await signature();
 await page.waitForTimeout(2200);
 expect(await signature()).toEqual(inViewer);
 await page.keyboard.press('Escape');
 await page.mouse.move(0,0);
 await expect(page.locator('.living-memory-wall')).toHaveAttribute('data-paused','false');
 await expect.poll(signature,{timeout:9000}).not.toEqual(inViewer);
 await page.locator('#memories').screenshot({path:'test-results/collage-desktop.png'});
 expect(errors).toEqual([]);
 await context.close();
});

test('mobile collage uses a real two-column grid, honors reduced motion and supports manual shuffle',async({browser})=>{
 const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
 const page=await context.newPage();await page.goto('http://127.0.0.1:4173/');
 await page.getByRole('button',{name:'Open Your Surprise',exact:true}).tap();
 await expect(page.getByRole('heading',{name:'A Thousand Memories, One Beautiful You ✨'})).toBeVisible();
 await expect(page.locator('.collage-tile')).toHaveCount(6);
 expect(await page.locator('.memory-collage').evaluate(el=>getComputedStyle(el).gridTemplateColumns.split(' ').length)).toBe(2);
 await expect(page.locator('.living-memory-wall')).toHaveAttribute('data-paused','true');
 await expect(page.getByRole('button',{name:'Pause collage',exact:true})).toHaveCount(0);
 const before=await page.locator('.collage-tile').evaluateAll(tiles=>tiles.map(tile=>tile.dataset.photoIndex));
 await page.getByRole('button',{name:'Shuffle memories',exact:true}).tap();
 const after=await page.locator('.collage-tile').evaluateAll(tiles=>tiles.map(tile=>tile.dataset.photoIndex));
 expect(after).not.toEqual(before);expect(new Set(after).size).toBe(6);
 await page.locator('.collage-tile').first().tap();
 await page.setViewportSize({width:844,height:390});
 await expect(page.locator('.collage-tile')).toHaveCount(6);
 await page.getByRole('button',{name:'Close',exact:true}).tap();
 expect(await page.evaluate(()=>window.scrollY)).toBeGreaterThan(0);
 await page.setViewportSize({width:390,height:844});
 await expect(page.locator('.collage-tile')).toHaveCount(6);
 await page.locator('#memories').screenshot({path:'test-results/collage-mobile.png'});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await context.close();
});
