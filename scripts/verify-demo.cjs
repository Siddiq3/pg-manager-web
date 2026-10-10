// Run against a local server; optional PLAYWRIGHT_MODULE and CHROMIUM_PATH reuse tooling.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const base = process.env.DEMO_WEB_URL || 'http://127.0.0.1:5186';
const out = path.resolve(__dirname, '../docs/screenshots');
fs.mkdirSync(out, { recursive: true });
const report = { layouts: [], media: [], errors: [], checks: [] };
const check = label => { report.checks.push(label); console.log('PASS', label); };
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const widths = [320,390,768,1024,1440];
(async () => {
 const { demoGroups } = await import('../src/data/demoSteps.js');
 const browser = await chromium.launch({ headless:true, ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH} : {}) });
 try {
  const page = await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')report.errors.push(m.text());});
  await page.goto(base);await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.ds-showcase').count(),5);
  assert.deepEqual(await page.locator('.ds-showcase').evaluateAll(cards=>cards.map(c=>c.querySelectorAll('.ds-choice').length)),[3,3,3,3,3]);
  const ids=await page.locator('.ds-copy').evaluateAll(es=>es.map(e=>e.id));assert.equal(new Set(ids).size,5);check('Five independent feature cards, three named clips each, unique accessible content IDs');
  const tour=page.locator('.ds-showcase').first();
  for(const width of widths){
   await page.setViewportSize({width,height:1000});await tour.scrollIntoViewIfNeeded();
   await page.evaluate(()=>scrollTo(0,scrollY+document.querySelector('.ds-showcase').getBoundingClientRect().top-document.querySelector('.lp-nav').offsetHeight-16));await pause(150);
   const boxes=await page.locator('.ds-showcase').evaluateAll(cards=>cards.map(c=>{
    const phone=c.querySelector('.ds-phone').getBoundingClientRect(),panel=c.querySelector('.ds-panel').getBoundingClientRect();
    return {width:innerWidth,overflow:document.documentElement.scrollWidth-innerWidth,phone:{x:phone.x,y:phone.y,width:phone.width,bottom:phone.bottom},panel:{x:panel.x,y:panel.y}};
   }));
   for(const b of boxes){assert.ok(b.overflow<=0,'Overflow at '+width);assert.ok(b.phone.x<b.panel.x, "Video stays left of the information at "+width);assert.ok(width>560?Math.abs(b.phone.width-(width>900?220:200))<1:b.phone.width>=90&&b.phone.width<=176, "Phone fits the mobile column");}
   report.layouts.push({width,cards:boxes});await tour.screenshot({path:path.join(out,`tour-${width}.png`)});
   if([390,1440].includes(width)){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:path.join(out,`landing-${width}.png`),fullPage:true});}
  }
  check('All five cards at 320, 390, 768, 1024 and 1440px: no overflow, correct arrangement and phone sizes');
  await page.setViewportSize({width:1440,height:1000});
  for(let g=0;g<demoGroups.length;g++){
   const card=page.locator('.ds-showcase').nth(g);await card.scrollIntoViewIfNeeded();
   for(let i=0;i<3;i++){
    await card.locator('.ds-choice').nth(i).click();assert.equal(await card.locator('.ds-badge').innerText(),demoGroups[g].steps[i].label);
    const video=card.locator('video');assert.equal(await video.count(),1);
    await video.evaluate(v=>new Promise((resolve,reject)=>{if(v.readyState>=1)return resolve();v.addEventListener('loadedmetadata',resolve,{once:true});v.addEventListener('error',()=>reject(new Error('Media unavailable')),{once:true});}));
    const m=await video.evaluate(v=>({src:v.getAttribute('src'),duration:v.duration,width:v.videoWidth,height:v.videoHeight,muted:v.muted,inline:v.playsInline,paused:v.paused}));
    assert.ok(m.duration>=8&&m.duration<=15.5,`${m.src}: ${m.duration}s`);assert.ok(m.muted&&m.inline&&m.paused);assert.equal(m.width/m.height,9/20);report.media.push(m);
    await card.getByRole('button',{name:'Play demo',exact:true}).click();await page.waitForFunction(idx=>{const v=document.querySelectorAll('.ds-showcase')[idx].querySelector('video');return v&&!v.paused&&v.currentTime>.1;},g);
    await card.getByRole('button',{name:'Pause demo',exact:true}).click();
   }
   await card.locator('.ds-dot').nth(0).click();await card.getByRole('button',{name:'Next clip',exact:true}).click();assert.equal(await card.locator('.ds-badge').innerText(),demoGroups[g].steps[1].label);
   await card.getByRole('button',{name:'Previous clip',exact:true}).click();assert.equal(await card.locator('.ds-badge').innerText(),demoGroups[g].steps[0].label);
   await card.locator('.ds-dot').nth(2).click();await card.getByRole('button',{name:'Play demo',exact:true}).click();
   await page.waitForFunction(idx=>!document.querySelectorAll('.ds-showcase')[idx].querySelector('video').paused,g);
   await card.locator('video').evaluate(v=>v.currentTime=v.duration-.25);
   await page.waitForFunction(({idx,label})=>document.querySelectorAll('.ds-showcase')[idx].querySelector('.ds-badge').textContent===label,{idx:g,label:demoGroups[g].steps[0].label});
   await card.getByRole('button',{name:'Pause demo',exact:true}).click();
   if([390,1440].includes(page.viewportSize().width))await card.screenshot({path:path.join(out,`card-${demoGroups[g].key}-1440.png`)});
  }
  check('All 15 real MP4s load and play; three choices, dots, previous/next and automatic wrap work in every card');
  await tour.scrollIntoViewIfNeeded();await tour.getByRole('button',{name:'Play demo',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('.ds-showcase video').paused);
  await page.evaluate(()=>scrollTo(0,0));await pause(350);assert.ok(await tour.locator('video').evaluate(v=>v.paused));
  await tour.scrollIntoViewIfNeeded();await page.waitForFunction(()=>!document.querySelector('.ds-showcase video').paused);await tour.getByRole('button',{name:'Pause demo',exact:true}).click();check('Off-screen tour pauses and visible tour resumes');
  const t=await tour.locator('video').evaluate(v=>v.currentTime);await pause(300);assert.ok(Math.abs(await tour.locator('video').evaluate(v=>v.currentTime)-t)<.1);check('Manual pause remains paused under reduced motion');
  await page.keyboard.press('Tab');await tour.locator('.ds-choice').nth(1).focus();assert.notEqual(await tour.locator('.ds-choice').nth(1).evaluate(e=>getComputedStyle(e).outlineStyle),'none');check('Named clip selectors have visible keyboard focus');
  const lazy=await browser.newPage({viewport:{width:1440,height:700}});await lazy.goto(base);assert.equal(await lazy.locator('.ds-showcase video').count(),0);check('No off-screen feature card loads its video before entering view');await lazy.close();
  const failed=await browser.newPage({viewport:{width:1440,height:1000}});await failed.route('**/*.mp4',r=>r.abort());await failed.goto(base);const fc=failed.locator('.ds-showcase').first();await fc.scrollIntoViewIfNeeded();await fc.getByRole('status').filter({hasText:'could not load'}).waitFor();assert.ok(await fc.locator('.ds-media img').evaluate(i=>i.complete&&i.naturalWidth>0));await fc.locator('.ds-choice').nth(1).click();assert.equal(await fc.locator('.ds-badge').innerText(),'Occupancy reports');await failed.screenshot({path:path.join(out,'video-error-fallback.png')});await failed.close();check('Network error preserves real poster and named clip navigation');
  const blocked=await browser.newPage({viewport:{width:1440,height:1000}});await blocked.addInitScript(()=>{HTMLMediaElement.prototype.play=()=>Promise.reject(new DOMException('Autoplay blocked','NotAllowedError'));});await blocked.goto(base);const bc=blocked.locator('.ds-showcase').first();await bc.scrollIntoViewIfNeeded();await bc.getByRole('status').filter({hasText:'paused by your browser'}).waitFor();assert.ok(await bc.locator('.ds-media img').evaluate(i=>i.complete&&i.naturalWidth>0));assert.ok(await bc.getByRole('button',{name:'Play demo',exact:true}).isVisible());await blocked.close();check('Blocked autoplay shows a real poster and explicit Play');
  if(process.env.DEMO_SESSION_FILE){
   const s=JSON.parse(fs.readFileSync(process.env.DEMO_SESSION_FILE,'utf8'));const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
   const login=await context.request.post('http://127.0.0.1:4020/api/v1/auth/login',{data:{identifier:s.email,password:s.password}});assert.equal(login.status(),200);
   const dashboard=await context.newPage();dashboard.on('pageerror',e=>report.errors.push(e.message));await dashboard.goto(base+'/#app');await dashboard.locator('.account-summary').waitFor();await dashboard.getByRole('heading',{name:'Sai Residency PG',exact:false}).waitFor();
   for(const width of widths){await dashboard.setViewportSize({width,height:1000});await pause(150);assert.ok(await dashboard.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Dashboard overflow at '+width);}
   for(const width of [390,1440]){await dashboard.setViewportSize({width,height:1000});await dashboard.screenshot({path:path.join(out,`dashboard-${width}.png`),fullPage:true});}
   await dashboard.getByRole('button',{name:'View plan & billing',exact:true}).click();await dashboard.locator('.plan-grid').waitFor();for(const width of widths){await dashboard.setViewportSize({width,height:1000});await pause(200);assert.ok(await dashboard.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'Billing overflow at '+width);}
   await dashboard.screenshot({path:path.join(out,'billing-1440.png'),fullPage:true});await context.close();check('Dummy account dashboard and billing retain all five responsive layouts');
  }
  assert.deepEqual(report.errors,[]);check('No unexpected browser console errors or uncaught exceptions');fs.writeFileSync(path.resolve(__dirname,'../docs/validation.json'),JSON.stringify(report,null,2));
 } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
