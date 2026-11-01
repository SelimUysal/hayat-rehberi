import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { encodedFixtures } from '../fixtures/accountProgress';

const password='Demo-only-cloud-test-2026!';
async function openAccount(page:Page) {
  const dialog=page.getByRole('dialog',{name:/Hesabım|Hayat Rehberi hesabı/});
  if(!await dialog.isVisible())
    await page.getByRole('button',{name:/Hesaba giriş yap|Hesabım ve eşitleme/}).click();
  await expect(dialog).toBeVisible();
}
async function chooseImportIfNeeded(page:Page,choice:'merge'|'cloud'):Promise<boolean> {
  const dialog=page.getByRole('dialog',{name:/Hesabım|Hayat Rehberi hesabı/});
  const merge=dialog.getByRole('button',{name:'Bu cihazdaki kayıtları da hesabıma ekle',exact:true});
  const cloud=dialog.getByRole('button',{name:'Yalnızca hesabımdaki kayıtları aç',exact:true});
  const status=dialog.getByRole('status');
  // Auth can arrive before the one-time import decision is rendered.
  await expect.poll(async()=>{
    if(!await dialog.isVisible().catch(()=>false))return 'closed';
    if(await merge.isVisible().catch(()=>false) && await cloud.isVisible().catch(()=>false))return 'choice';
    if(await status.count())return 'status';
    return 'loading';
  },{timeout:30_000}).toMatch(/^(closed|choice|status)$/);
  if(!await merge.isVisible().catch(()=>false) || !await cloud.isVisible().catch(()=>false))return false;

  // Choosing merge/cloud starts the first cloud synchronization itself.
  // Do not immediately call sync() again: the success effect may be closing
  // this dialog, and reopening it during that transition races with React.
  await (choice==='merge'?merge:cloud).click();
  const outcome=async():Promise<string>=>{
    if(!await dialog.isVisible().catch(()=>false))return 'closed';
    if(!await status.count())return 'loading';
    const message=await status.innerText({timeout:1_000}).catch(()=>'');
    if(message.includes('Kayıtların eşitlendi.'))return 'synced';
    if(/başka açık sekmede|diğer açık sekmede/.test(message))return 'delegated';
    if(/Cihaz kayıtları korunuyor|Çevrimdışı:/.test(message))return 'error';
    return 'waiting';
  };
  await expect.poll(outcome,{timeout:60_000}).toMatch(/^(closed|synced|delegated|error)$/);
  const result=await outcome();
  if(result==='error')throw new Error(await status.innerText({timeout:1_000}).catch(()=>'İlk bulut eşitlemesi tamamlanamadı.'));
  if(result==='synced')await expect(dialog).toBeHidden({timeout:10_000});
  return true;
}
async function authenticate(page:Page,email:string,register=false,choice:'merge'|'cloud'='cloud') {
  await openAccount(page);
  await expect(page.getByRole('button',{name:'Google ile giriş yap',exact:true})).toBeEnabled();
  await page.getByText('E-posta ve şifreyle devam et',{exact:true}).click();
  if(register)await page.getByRole('button',{name:'Yeni hesap oluştur',exact:true}).click();
  await page.getByLabel('E-posta',{exact:true}).fill(email);
  await page.getByLabel('Şifre',{exact:true}).fill(password);
  await page.getByRole('button',{name:register?'Hesap oluştur':'E-posta ile giriş yap',exact:true}).click();
  await expect(page.getByRole('button',{name:/^(Hesaptan çıkış yap|Misafir kullanıma dön)$/})).toBeVisible();
  const importHandledSync=await chooseImportIfNeeded(page,choice);
  if(!importHandledSync)await sync(page);
}
async function sync(page:Page) {
  await openAccount(page);
  const dialog=page.getByRole('dialog',{name:/Hesabım|Hayat Rehberi hesabı/});
  const button=dialog.getByRole('button',{name:'Şimdi eşitle',exact:true});
  const status=dialog.getByRole('status');
  const merge=dialog.getByRole('button',{name:'Bu cihazdaki kayıtları da hesabıma ekle',exact:true});
  const cloud=dialog.getByRole('button',{name:'Yalnızca hesabımdaki kayıtları aç',exact:true});
  const outcome=async():Promise<string>=>{
    if(!await dialog.isVisible().catch(()=>false))return 'closed';
    if(await merge.isVisible().catch(()=>false) || await cloud.isVisible().catch(()=>false))return 'import';
    if(!await status.count())return 'loading';
    const message=await status.innerText({timeout:1_000}).catch(()=>'');
    if(message.includes('Kayıtların eşitlendi.'))return 'synced';
    if(message.includes('Bulut eşitlemesi diğer açık sekmede yönetiliyor.'))return 'delegated';
    if(/başka açık sekmede|diğer açık sekmede/.test(message))return 'delegated-wait';
    if(/Cihaz kayıtları korunuyor|Çevrimdışı:/.test(message))return 'error';
    if(/Eşitleniyor|Bulut bağlantısı kuruluyor/.test(message))return 'syncing';
    if(await button.isEnabled().catch(()=>false))return 'ready';
    return 'waiting';
  };
  let current=await outcome();
  if(['closed','synced','delegated','delegated-wait'].includes(current))return;
  if(current==='import')throw new Error('Eşitleme başlamadan önce cihaz kayıtları için seçim yapılmalı.');
  if(current==='ready')await button.click();
  else if(['waiting','loading'].includes(current)) {
    await expect.poll(outcome,{timeout:30_000}).toMatch(/^(closed|synced|delegated|delegated-wait|syncing|ready|error|import)$/);
    current=await outcome();
    if(current==='ready')await button.click();
    if(current==='import')throw new Error('Eşitleme başlamadan önce cihaz kayıtları için seçim yapılmalı.');
  }
  if(current==='error')throw new Error(await status.innerText({timeout:1_000}).catch(()=>'Bulut eşitlemesi başarısız oldu.'));
  // If the first import or sign-in already started syncing, wait for its real
  // completion. A delegated tab is checked by the cross-device assertions.
  await expect.poll(outcome,{timeout:60_000}).toMatch(/^(closed|synced|delegated|delegated-wait|error)$/);
  current=await outcome();
  if(current==='error')throw new Error(await status.innerText({timeout:1_000}).catch(()=>'Bulut eşitlemesi başarısız oldu.'));
}
async function closeAccount(page:Page) {
  const dialog=page.getByRole('dialog',{name:/Hesabım|Hayat Rehberi hesabı/});
  if(await dialog.isVisible())await dialog.getByRole('button',{name:'Hesap penceresini kapat'}).click();
}
async function read(page:Page,key:string) {return page.evaluate(k=>localStorage.getItem(k),key);}
async function prepare(context:BrowserContext) {
  // Prevent unrelated maps/audio/CDN endpoints from influencing cloud tests.
  await context.route('**/*',route=>{
    const url=new URL(route.request().url());
    return ['127.0.0.1','localhost'].includes(url.hostname) || ['data:','blob:'].includes(url.protocol) ? route.continue() : route.abort();
  });
}

test('all durable screens restore across two browser devices; live edits refresh without restarting playback',async({browser,context,page},info)=>{
  test.setTimeout(180_000);await prepare(context);
  await context.addInitScript(values=>{
    if(!localStorage.getItem('cloud-test-seeded')){
      for(const [key,value]of Object.entries(values))localStorage.setItem(key,value);
      localStorage.setItem('cloud-test-seeded','1');
    }
  // The 5,000-entry chunking case is covered by the cloud integration suite.
  // Keep this browser test focused on UI and cross-device restoration on mobile.
  },encodedFixtures);
  const email=`screen-${info.project.name}-${Date.now()}@example.test`;
  await page.goto('/#esma');await authenticate(page,email,true,'merge');
  const expected=await page.evaluate(keys=>Object.fromEntries(keys.map(k=>[k,localStorage.getItem(k)])),Object.keys(encodedFixtures));
  await closeAccount(page);
  const second=await browser.newContext({viewport:info.project.use.viewport,isMobile:info.project.use.isMobile,hasTouch:info.project.use.hasTouch});
  try {
    await prepare(second);const other=await second.newPage();await other.goto('/#esma');await authenticate(other,email);
    for(const [key,value]of Object.entries(expected))await expect.poll(()=>read(other,key),{message:`restored screen data: ${key}`}).toBe(value);
    await closeAccount(other);
    await expect(other.getByRole('button',{name:/Ezberlendi işaretini kaldır/}).first()).toBeVisible();
    const learned=other.getByRole('button',{name:/Ezber.*olarak işaretle/}).first();await learned.click();
    await sync(other);await closeAccount(other);
    await expect.poll(async()=>Object.keys(JSON.parse(await read(page,'esma_learned_names') || '{}')).length).toBe(2);
    await expect(page.getByRole('button',{name:/Ezberlendi işaretini kaldır/})).toHaveCount(2);

    for(const [route,text]of [['kaza','Sabah'],['hadis','Hadis'],['elifba','Elif'],['namaz','Namaz'],['listen','Dinle'],['ezber','Ezber']] as const){
      await test.step(`restore and open ${route}`,async()=>{
        await other.goto('/#'+route);await expect(other.locator('#root')).toContainText(text);
        await expect(other.getByText('Hesap kayıtları hazırlanıyor…',{exact:true})).toHaveCount(0);
      });
    }
    await other.goto('/#mushaf');
    const mushaf=other.frameLocator('iframe');await expect(mushaf.locator('body')).toContainText('Fatiha yer imi');
    // The standalone same-origin frame writes the same storage while the main
    // application remains open to capture and sync the change immediately.
    const tesbih=await second.newPage();await tesbih.goto('/tesbih.html');
    await expect(tesbih.locator('#hayat-account-frame')).toHaveCount(1);await other.close();
    await expect(tesbih.getByText('Deneme A',{exact:true})).toBeVisible();await tesbih.getByRole('button',{name:/Sağa Taşı/}).click();
    await expect.poll(async()=>JSON.parse(await read(page,'appData') || '{}').right?.length).toBe(2);
    await tesbih.close();await openAccount(page);await page.screenshot({path:info.outputPath('account-sync.png'),fullPage:false});
  } finally {await second.close();}
});

test('cloud outage does not block startup; offline edits persist and sign-out isolates the next account',async({context,page},info)=>{
  test.setTimeout(150_000);await prepare(context);
  const email=`offline-${info.project.name}-${Date.now()}@example.test`;
  await page.goto('/#esma');await authenticate(page,email,true,'merge');await closeAccount(page);
  const block=async(route:any)=>route.abort();
  await context.route('http://127.0.0.1:8088/**',block);await context.route('http://127.0.0.1:9099/**',block);
  await page.reload();await expect(page.getByLabel("Esmaü'l-Hüsnâ isim ve anlam araması")).toBeVisible();
  await page.getByRole('button',{name:/Ezber.*olarak işaretle/}).first().click();
  await page.evaluate(()=>window.dispatchEvent(new Event('pagehide')));
  await expect.poll(async()=>JSON.parse(await read(page,'esma_learned_names') || '{}')['1']).toBe(true);
  await context.unroute('http://127.0.0.1:8088/**',block);await context.unroute('http://127.0.0.1:9099/**',block);
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));await sync(page);
  await openAccount(page);
  await page.getByRole('button',{name:'Hesaptan çıkış yap',exact:true}).click();
  await expect(page.getByRole('button',{name:'Google ile giriş yap',exact:true})).toBeEnabled();
  // Wait for the auth observer and account store to finish switching to guest
  // before immediately creating another account.
  await expect.poll(()=>read(page,'hayat-account-owner-v1')).toBe('guest');
  await expect.poll(()=>read(page,'esma_learned_names')).not.toBe('{"1":true}');
  await authenticate(page,`second-${info.project.name}-${Date.now()}@example.test`,true,'cloud');
  await expect.poll(()=>read(page,'esma_learned_names')).not.toBe('{"1":true}');
});

test('first visit defaults to light; account dialog follows live theme changes and remembers dark preference',async({page})=>{
  await page.goto('/#takvim');
  await expect(page.locator('html')).toHaveAttribute('data-theme','light');
  await openAccount(page);
  const dialog=page.getByRole('dialog',{name:/Hesabım|Hayat Rehberi hesabı/});
  await expect(dialog).toBeVisible();
  await expect.poll(()=>dialog.evaluate(element=>getComputedStyle(element).backgroundColor)).toBe('rgb(255, 254, 251)');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('app-theme-changed',{detail:{isDark:true,theme:'dark'}})));
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await expect.poll(()=>dialog.evaluate(element=>getComputedStyle(element).backgroundColor)).toBe('rgb(17, 28, 23)');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme','dark');
  await openAccount(page);
  await expect.poll(()=>page.getByRole('dialog').evaluate(element=>getComputedStyle(element).backgroundColor)).toBe('rgb(17, 28, 23)');
});
