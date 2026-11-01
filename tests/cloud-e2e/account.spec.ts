import { test, expect, type Page, type BrowserContext } from '@playwright/test';
import { encodedFixtures } from '../fixtures/accountProgress';

const password='Demo-only-cloud-test-2026!';
async function openAccount(page:Page) {
  if(!await page.getByRole('dialog',{name:/Hesabım|Hayat Rehberi hesabı/}).isVisible())
    await page.getByRole('button',{name:/Hesaba giriş yap|Hesabım ve eşitleme/}).click();
}
async function authenticate(page:Page,email:string,register=false,choice:'merge'|'cloud'='cloud') {
  await openAccount(page);
  await expect(page.getByRole('button',{name:'Google ile giriş yap',exact:true})).toBeEnabled();
  if(register)await page.getByRole('button',{name:'Yeni hesap oluştur',exact:true}).click();
  await page.getByLabel('E-posta',{exact:true}).fill(email);
  await page.getByLabel('Şifre',{exact:true}).fill(password);
  await page.getByRole('button',{name:register?'Hesap oluştur':'E-posta ile giriş yap',exact:true}).click();
  const importButton=page.getByRole('button',{name:'Bu cihazdaki kayıtları da hesabıma ekle',exact:true});
  await expect(page.getByRole('button',{name:/^(Hesaptan çıkış yap|Misafir kullanıma dön)$/})).toBeVisible();
  if(await importButton.isVisible())await page.getByRole('button',{name:choice==='merge'?'Bu cihazdaki kayıtları da hesabıma ekle':'Yalnızca hesabımdaki kayıtları aç',exact:true}).click();
  await sync(page);
}
async function sync(page:Page) {
  await openAccount(page);
  const button=page.getByRole('button',{name:'Şimdi eşitle',exact:true});
  await expect(button).toBeEnabled({timeout:60_000});await button.click();
  await expect(page.getByRole('status').filter({hasText:'Kayıtların eşitlendi.'})).toBeVisible({timeout:60_000});
}
async function closeAccount(page:Page) {await page.getByRole('button',{name:'Hesap penceresini kapat'}).click();}
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
  },{...encodedFixtures,hayat_rehberi_hadis_activity_logs_v1:JSON.stringify(Array.from({length:5000},(_,i)=>({id:`history-${i}`,hadisId:1,timestamp:'2026-11-01T10:00:00.000Z',action:'review',kategori:'İman ve güzel ahlak'})))});
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
  await page.getByRole('button',{name:'Hesaptan çıkış yap',exact:true}).click();
  await expect(page.getByRole('button',{name:'Google ile giriş yap',exact:true})).toBeEnabled();
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
