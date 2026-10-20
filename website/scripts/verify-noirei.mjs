/** 全路由、双语、四档视口与主要交互验收；不依赖额外测试包。 */
import assert from 'node:assert/strict'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'
const origin = process.env.TEMPLATE_ORIGIN || 'http://localhost:3000'
const root = '/templates/noirei/site'
const media = JSON.parse(await readFile(new URL('../src/features/site-templates/catalog/noirei/media.json', import.meta.url), 'utf8'))
const output = new URL('../../artifacts/noirei-verification/', import.meta.url)
await mkdir(output, { recursive: true })
const report = { pages: [], interactions: [], errors: [] }
const browser = await openBrowser()
const check = (value, message) => assert.ok(value, message)
async function ready(path) {
  const selector = path.startsWith(root) ? '.nr-footer' : '.market-page-link'
  for (let n = 0; n < 200; n++) {
    if (await browser.evaluate(`location.pathname===${JSON.stringify(path)}&&document.readyState==='complete'&&!!document.querySelector(${JSON.stringify(selector)})`)) { await delay(200); return }
    await delay(100)
  }
  throw new Error(`Page not ready: ${path}`)
}
async function visit(path) { await browser.page('Page.navigate', { url: origin + path }); await ready(path.split('?')[0].split('#')[0]) }
async function click(selector) { await browser.evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`); await delay(300) }
async function count(selector) { return browser.evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length`) }
try {
  await browser.page('Page.bringToFront')
  await browser.page('Log.enable')
  await browser.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  for (const width of [1440, 834, 390, 320]) {
    await browser.page('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false })
    await visit(root)
    const nav = await browser.evaluate(`(()=>{const nav=document.querySelector('.nr-nav'),button=nav.querySelector('.nr-reserve');return {arrows:document.querySelector('.nr-site').textContent.includes('↗'),font:parseFloat(getComputedStyle(nav.querySelector('.nr-brand')).fontSize),buttonFont:parseFloat(getComputedStyle(button).fontSize),height:button.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth,clipped:[...nav.querySelectorAll('a')].filter(a=>a.getBoundingClientRect().width).some(a=>{const r=a.getBoundingClientRect();return r.x<0||r.right>innerWidth})}})()`)
    check(!nav.arrows && !nav.overflow && !nav.clipped && nav.font === 18 && nav.buttonFont === 13 && nav.height >= 36, `final navigation at ${width}px: ${JSON.stringify(nav)}`)
    const brand = await browser.evaluate(`(()=>{const a=document.querySelector('.nr-home-entry'),r=a.getBoundingClientRect(),s=getComputedStyle(a);return {href:a.getAttribute('href'),label:a.textContent,textVisible:getComputedStyle(a.querySelector('span')).display!=='none',height:r.height,right:innerWidth-r.right,bottom:innerHeight-r.bottom,radius:s.borderRadius}})()`)
    check(brand.href === '/templates' && brand.label === '微域生光' && brand.textVisible === (width > 640) && brand.height >= (width > 640 ? 44 : 42) && brand.right >= 14 && brand.bottom >= 14 && brand.radius === '12px', `brand button at ${width}px: ${JSON.stringify(brand)}`)
    await browser.evaluate('window.__noireiBrandNavigation=true')
    await click('.nr-home-entry')
    for (let attempt = 0; attempt < 100 && !await browser.evaluate(`location.pathname==='/templates'`); attempt++) await delay(100)
    check(await browser.evaluate(`location.pathname==='/templates'&&window.__noireiBrandNavigation`), 'brand button opens marketplace through client navigation')
  }
  report.interactions.push('四档视口导航与品牌按钮尺寸、移动文字收起、安全边距及模板市场跳转')
  for (const [width, height] of (process.env.NOIREI_INTERACTIONS_ONLY ? [] : [[1440, 1000], [834, 1180], [390, 844], [320, 844]])) {
    await browser.page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
    for (const locale of ['zh', 'en']) {
      for (const slug of Object.keys(media)) {
        const path = root + (locale === 'en' ? '/en' : '') + (slug === '/' ? '' : slug)
        await visit(path)
        const result = await browser.evaluate(`(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{})}));const h=document.querySelector('h1'),nav=document.querySelector('.nr-nav');const r=el=>{const b=el.getBoundingClientRect();return {x:b.x,right:b.right,width:b.width}};return {overflow:document.documentElement.scrollWidth>innerWidth,h1:document.querySelectorAll('h1').length,title:h.textContent,font:getComputedStyle(h).fontFamily,size:parseFloat(getComputedStyle(h).fontSize),badImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),navLinks:[...nav.querySelectorAll('a')].filter(a=>a.getBoundingClientRect().width).map(r),containers:[...document.querySelectorAll('main .nr-container')].map(r),locale:document.querySelector('.nr-site').dataset.locale}})()`)
        check(!result.overflow, `${path} ${width}px overflow`)
        check(result.h1 === 1 && result.size <= 44 && result.size >= 26, `${path} heading`)
        check(result.badImages.length === 0, `${path} broken images: ${result.badImages}`)
        check(result.navLinks.every(rect => rect.x >= 0 && rect.right <= width), `${path} clipped navigation`)
        check(result.containers.every(rect => rect.x >= 19 && rect.right <= width - 19), `${path} missing margins`)
        check(result.locale === locale && result.font.includes(locale === 'zh' ? 'Weelume MiSans' : 'Weelume Poppins'), `${path} locale/font`)
        report.pages.push({ width, locale, slug, ...result })
      }
      console.log(`PASS ${width}px ${locale}: ${Object.keys(media).length} pages`)
    }
  }
  await browser.page('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: false })
  await visit(root)
  await click('.nr-menu-toggle')
  check(await count('.nr-mobile-menu a') === 6, 'mobile menu links')
  await browser.page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape' })
  await delay(300)
  check(await count('.nr-mobile-menu') === 0, 'Escape closes menu')
  await click('.nr-menu-toggle')
  await browser.evaluate(`window.__noireiMarker=true;document.querySelector('.nr-mobile-menu a[href$="/room"]').click()`)
  await ready(root + '/room')
  check(await browser.evaluate('window.__noireiMarker'), 'client-side navigation')
  report.interactions.push('手机菜单、Escape、客户端导航')
  check(await count('[data-room-results] .nr-room-card') === 6, 'all rooms')
  for (const index of [2, 3, 4]) {
    await click(`.nr-filters button:nth-child(${index})`)
    check(await count('[data-room-results] .nr-room-card') === 2, 'room filter')
  }
  await click('.nr-filters button:first-child')
  check(await count('[data-room-results] .nr-room-card') === 6, 'reset room filter')
  await click('.nr-faq-item button')
  check(await count('.nr-faq [role=region]') === 1, 'FAQ opens')
  await click('.nr-faq-item:nth-child(2) button')
  await delay(300)
  check(await count('.nr-faq [role=region]') === 1, 'FAQ single expanded item')
  report.interactions.push('六种房型筛选、重置与 FAQ 展开')
  await visit(root + '/journal')
  check(await count('[data-journal-results] .nr-journal-card') === 6, 'all journal entries')
  await click('.nr-filters button:nth-child(3)')
  check(await count('[data-journal-results] .nr-journal-card') === 2, 'journal travel filter')
  await click('.nr-filters button:nth-child(5)')
  check(await count('[data-journal-results] .nr-journal-card') === 1, 'journal wellness filter')
  report.interactions.push('日志分类筛选')
  await visit(root + '/room/lake-classic-room?arrival=2027-01-12#room-details')
  await browser.evaluate('window.__noireiMarker=true')
  await click('.nr-language')
  await ready(root + '/en/room/lake-classic-room')
  check(await browser.evaluate(`document.querySelector('.nr-home-entry span').textContent==='Weelume'&&document.querySelector('.nr-home-entry').getAttribute('href')==='/templates'`), 'English brand button')
  check(await browser.evaluate(`location.search==='?arrival=2027-01-12'&&location.hash==='#room-details'&&window.__noireiMarker`), 'language preserves path, query, hash and client session')
  await click('.nr-language')
  await ready(root + '/room/lake-classic-room')
  await click('.nr-photo-grid button')
  check(await browser.evaluate('document.querySelector("dialog").open'), 'lightbox opens')
  const before = await browser.evaluate('document.querySelector("dialog img").src')
  await browser.page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowRight', code: 'ArrowRight' })
  check(before !== await browser.evaluate('document.querySelector("dialog img").src'), 'lightbox keyboard next')
  await browser.page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 })
  await browser.page('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 })
  await delay(200)
  check(!await browser.evaluate('document.querySelector("dialog").open'), 'lightbox Escape')
  report.interactions.push('双向语言切换保留路径/参数/锚点、照片灯箱及键盘操作')
  await visit(root)
  await click('.nr-booking button')
  check(await count('.nr-booking [role=alert]') === 1, 'missing booking date error')
  const dates = [30, 34].map(days => new Date(Date.now() + days * 86400000).toISOString().slice(0, 10))
  await browser.evaluate(`{const f=document.querySelector('.nr-booking');for(const [name,value]of Object.entries(${JSON.stringify({ arrival: dates[0], departure: dates[1], guests: '4', room: 'villa-cipresso' })})){const input=f.elements.namedItem(name);Object.getOwnPropertyDescriptor(input.tagName==='SELECT'?HTMLSelectElement.prototype:HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}))}f.requestSubmit()}`)
  await ready(root + '/contact')
  check(await browser.evaluate(`document.querySelector('#nr-enquiry [name=arrival]').value===${JSON.stringify(dates[0])}&&document.querySelector('#nr-enquiry [name=room]').value==='villa-cipresso'&&document.querySelector('#nr-enquiry [name=guests]').value==='4'`), 'booking query prefills contact')
  await click('#nr-enquiry button[type=submit]')
  check(await count('#nr-enquiry [aria-invalid=true]') >= 3, 'empty enquiry validation')
  const requestStart = browser.events.length
  await browser.evaluate(`{const f=document.querySelector('#nr-enquiry');f.elements.name.value='Demo Guest';f.elements.email.value='guest@example.com';f.elements.message.value='A quiet family stay';f.elements.consent.checked=true;f.requestSubmit()}`)
  check((await browser.evaluate('document.querySelector("#nr-enquiry [role=status]").textContent')).includes('没有发送'), 'honest local success')
  check(!browser.events.slice(requestStart).some(event => event.method === 'Network.requestWillBeSent' && event.params.request.method === 'POST'), 'form must not send data')
  await click('.nr-newsletter button')
  check(await browser.evaluate('document.querySelector(".nr-newsletter input").getAttribute("aria-invalid")==="true"'), 'newsletter invalid email')
  await browser.evaluate(`document.querySelector('.nr-newsletter input').value='demo@example.com';document.querySelector('.nr-newsletter form').requestSubmit()`)
  check((await browser.evaluate('document.querySelector("#nr-newsletter-notice").textContent')).includes('尚未订阅'), 'newsletter local demo')
  report.interactions.push('日期栏必填与行程传递、联系页预填/校验/无网络提交、订阅格式校验')
  await visit(root)
  const first = await browser.evaluate('document.querySelector(".nr-experience-image img").src')
  await click('.nr-experience-tabs button:nth-child(2)')
  check(first !== await browser.evaluate('document.querySelector(".nr-experience-image img").src'), 'experience switching')
  await click('.nr-offer-item:nth-child(3)>button')
  check(await count('.nr-offer-item.is-active a[href$="/the-honeymoon-itinerary"]') === 1, 'offer accordion link')
  await click('.nr-day-times button:nth-child(6)')
  check((await browser.evaluate('document.querySelector(".nr-image-caption").textContent')).includes('22:30'), 'day gallery time')
  await click('.nr-gallery-stage')
  check(await browser.evaluate('document.querySelector("dialog").open'), 'day gallery lightbox')
  await click('.nr-lightbox-close')
  report.interactions.push('体验切换、礼遇展开与详情链接、时段照片切换与灯箱')
  await visit('/templates/noirei')
  check(await browser.evaluate(`!!document.querySelector('a[href="${root}"][target="_blank"]')`), 'new tab preview')
  check(await count('.market-page-link') === 28, 'market lists all 28 pages')
  report.interactions.push('模板详情完整页面清单与新标签页预览入口')
  for (const [device, width] of [['tablet', 834], ['mobile', 390]]) {
    await browser.page('Page.navigate', { url: `${origin}/templates/noirei/preview?viewport=${device}` })
    let loaded = false
    for (let attempt = 0; attempt < 150; attempt++) {
      loaded = await browser.evaluate('(()=>{const d=document.querySelector("iframe")?.contentDocument,b=d?.querySelector(".nr-menu-toggle");return d?.readyState==="complete"&&!!d.querySelector(".nr-footer")&&!!b&&Object.keys(b).some(key=>key.startsWith("__reactProps"))})()')
      if (loaded) break
      await delay(100)
    }
    check(loaded, `${device} iframe loads`)
    check(await browser.evaluate(`document.querySelector('iframe').contentWindow.innerWidth===${width}&&document.querySelector('iframe').contentDocument.documentElement.scrollWidth<=${width}`), `${device} true CSS viewport`)
    await delay(1000)
    await browser.evaluate(`document.querySelector('iframe').contentDocument.querySelector('.nr-menu-toggle').click()`)
    await delay(300)
    check(await browser.evaluate(`document.querySelector('iframe').contentDocument.querySelector('.nr-menu-toggle').getAttribute('aria-expanded')==='true'`), 'iframe mobile navigation')
  }
  report.interactions.push('iPad/H5 模拟设备真实视口与菜单操作')
  report.errors = browser.events.filter(event => event.method === 'Runtime.exceptionThrown' || (event.method === 'Log.entryAdded' && event.params.entry.level === 'error') || (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error')).map(event => event.params)
  check(report.errors.length === 0, `browser errors: ${JSON.stringify(report.errors).slice(0,3000)}`)
  console.log(`PASS ${report.pages.length} page combinations; ${report.interactions.length} interaction groups; no browser errors`)
} finally {
  report.errors = browser.events.filter(event => event.method === 'Runtime.exceptionThrown' || (event.method === 'Log.entryAdded' && event.params.entry.level === 'error') || (event.method === 'Runtime.consoleAPICalled' && event.params.type === 'error')).map(event => event.params)
  await writeFile(new URL(process.env.NOIREI_INTERACTIONS_ONLY ? 'interactions.json' : 'report.json', output), JSON.stringify(report, null, 2))
  await browser.close()
}
