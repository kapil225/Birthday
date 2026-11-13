import { test,expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
const photos=JSON.parse(readFileSync(new URL('../src/data/photo-manifest.json',import.meta.url)));
const total=photos.length || 100;
test('complete birthday journey, gallery controls, letter download, wishes and replay',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.getByRole('heading',{name:/Some people/})).toBeVisible();
 await expect(page.locator('audio')).toHaveAttribute('autoplay','');
 await page.screenshot({path:'test-results/welcome-desktop.png',fullPage:true});
 await page.getByRole('button',{name:'Open Your Surprise',exact:true}).click();
 await expect(page.getByRole('heading',{name:/Happy Birthday,/})).toBeVisible();
 await expect(page.locator('.collage-tile')).toHaveCount(Math.min(total,12));
 await expect(page.locator('.polaroid-caption,.viewer-caption')).toHaveCount(0);
 await page.locator('.collage-tile').first().click();
 await expect(page.getByRole('dialog')).toBeVisible();
 await page.keyboard.press('ArrowRight');
 await expect(page.locator('.viewer-top')).toContainText(`2 / ${total}`);
 await page.keyboard.press('Escape');
 await expect(page.getByRole('dialog')).toHaveCount(0);
 await expect(page.locator('.collage-tile').first()).toBeFocused();
 const beforeShuffle=await page.locator('.collage-tile').first().getAttribute('data-photo-index');
 await page.getByRole('button',{name:'Shuffle memories'}).click();
 await expect(page.locator('.collage-tile').first()).not.toHaveAttribute('data-photo-index',beforeShuffle);
 await page.getByRole('button',{name:'Relive Memories'}).click();
 await expect(page.getByRole('button',{name:'Pause slideshow'})).toBeVisible();
 await page.getByRole('button',{name:'Pause slideshow'}).click();
 await page.getByRole('combobox').selectOption('3');
 await page.keyboard.press('Escape');
 await page.getByRole('button',{name:'Open My Letter'}).click();
 await expect(page.locator('.letter-paper')).toContainText('Someone who');
 const download=page.waitForEvent('download');
 await page.getByRole('button',{name:'Keep This Letter'}).click();
 expect((await download).suggestedFilename()).toBe('A-letter-for-U.pdf');
 await page.locator('#wish').getByRole('button',{name:'Blow out all candles',exact:true}).click();
 await expect(page.locator('#wish .candle.out')).toHaveCount(5);
 await expect(page.locator('.wish-message')).toContainText('May every beautiful wish');
 await page.getByRole('button',{name:'Relight the candles'}).click();
 await expect(page.locator('#wish .candle.out')).toHaveCount(0);
 await page.locator('.appreciation-card').first().click();
 await expect(page.locator('.appreciation-card').first()).toHaveAttribute('aria-expanded','true');
 for(const star of await page.getByRole('button',{name:'Discover a hidden star'}).all())await star.click();
 await expect(page.getByRole('status').last()).toContainText('3 of 3');
 await page.getByRole('button',{name:'Unlock Your Final Surprise'}).click();
 await expect(page.getByRole('dialog')).toContainText('You matter.');
 await page.screenshot({path:'test-results/final-surprise.png'});
 await page.getByRole('button',{name:'Replay our little universe'}).click();
 await expect(page.getByRole('button',{name:'Open Your Surprise',exact:true})).toBeVisible();
 expect(errors).toEqual([]);
});
test('mobile welcome and gallery fit the viewport; swipe navigation works',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await page.screenshot({path:'test-results/welcome-mobile.png',fullPage:true});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('button',{name:'Open Your Surprise',exact:true}).click();
 await page.locator('.collage-tile').first().click();
 await page.locator('.viewer-image').dispatchEvent('touchstart',{changedTouches:[{identifier:0,clientX:300}]});
 await page.locator('.viewer-image').dispatchEvent('touchend',{changedTouches:[{identifier:0,clientX:80}]});
 await expect(page.locator('.viewer-top')).toContainText(`2 / ${total}`);
 await page.getByRole('button',{name:'Close',exact:true}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});

test('all prepared personal photos and thumbnails decode in the browser',async({page})=>{
 await page.goto('/');
 const failed=await page.evaluate(async photos=>{
  const results=await Promise.all(photos.filter(p=>p.type!=='video').flatMap(p=>[p.src,p.thumbnail]).map(async src=>{const img=new Image();img.src=src;try{await img.decode();return img.naturalWidth>0?null:src;}catch{return src;}}));
  return results.filter(Boolean);
 },photos);
 expect(failed).toEqual([]);
 const blankConverted=await page.evaluate(async photos=>{
  const converted=photos.filter(p=>/\.(dng|heic)$/i.test(p.filename));
  return (await Promise.all(converted.map(async p=>{
   const img=new Image();img.src=p.thumbnail;await img.decode();
   const canvas=document.createElement('canvas');canvas.width=16;canvas.height=16;
   const ctx=canvas.getContext('2d');ctx.drawImage(img,0,0,16,16);
   const pixels=ctx.getImageData(0,0,16,16).data;
   let low=255,high=0;
   for(let i=0;i<pixels.length;i++)if(i%4!==3){low=Math.min(low,pixels[i]);high=Math.max(high,pixels[i]);}
   return high-low<3?p.filename:null;
  }))).filter(Boolean);
 },photos);
 expect(blankConverted).toEqual([]);
});

test('videos open with controls and the slideshow waits for playback to finish',async({page})=>{
 await page.goto('/');
 // Generate a tiny test-only clip in memory; no sample video enters the project.
 const clip=await page.evaluate(async()=>{
  const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
  const ctx=canvas.getContext('2d'),stream=canvas.captureStream(10);
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];
  recorder.ondataavailable=e=>chunks.push(e.data);
  const done=new Promise(resolve=>recorder.onstop=resolve);
  recorder.start();let frame=0;
  const tick=setInterval(()=>{ctx.fillStyle=frame++%2?'#d9b7ca':'#baa5ce';ctx.fillRect(0,0,64,64);},50);
  await new Promise(resolve=>setTimeout(resolve,500));recorder.stop();await done;
  clearInterval(tick);stream.getTracks().forEach(t=>t.stop());
  const bytes=new Uint8Array(await new Blob(chunks,{type:'video/webm'}).arrayBuffer());
  return btoa(String.fromCharCode(...bytes));
 });
 await page.route('**/__test-memory.webm',route=>route.fulfill({contentType:'video/webm',body:Buffer.from(clip,'base64')}));
 await page.route('**/src/data/memories.js*',async route=>{
  const response=await route.fetch();const body=await response.text();
  const declaration='const discovered = [...personalPhotos, ...directPhotos, ...directVideos];';
  expect(body).toContain(declaration);
  await route.fulfill({response,body:body.replace(declaration,"const discovered = [...personalPhotos, ...directPhotos, ...directVideos, {type:'video',src:'/__test-memory.webm',filename:'test.webm'}];")});
 });
 await page.reload();
 await page.getByRole('button',{name:'Open Your Surprise',exact:true}).click();
 await expect(page.locator('.memory-video-collection,.video-space')).toHaveCount(0);
 await page.getByRole('button',{name:'Relive Memories'}).click();
 await page.getByRole('button',{name:'Pause slideshow',exact:true}).click();
 await page.getByRole('button',{name:'Previous memory'}).click();
 const video=page.locator('.memory-video');
 await expect(video).toHaveAttribute('controls','');
 await expect.poll(()=>video.evaluate(v=>v.readyState)).toBeGreaterThanOrEqual(2);
 await page.getByRole('button',{name:'Play slideshow',exact:true}).click();
 await video.evaluate(v=>v.play());
 await expect(video).toHaveCount(0);
 await expect(page.locator('.viewer-top')).toContainText(`1 / ${total+1}`);
 await page.keyboard.press('Escape');
});
