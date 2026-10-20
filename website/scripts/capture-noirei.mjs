import { mkdir, writeFile } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'

const origin = process.env.TEMPLATE_ORIGIN || 'http://localhost:3000'
const output = new URL('../public/templates/noirei/screenshots/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await openBrowser()
try {
  await browser.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  for (const [device, width, height] of [['desktop', 1440, 1000], ['tablet', 834, 1180], ['mobile', 390, 844]]) {
    await browser.page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
    for (const [name, slug] of [['home', ''], ['rooms', '/room'], ['journal', '/journal'], ['contact', '/contact']]) {
      await browser.page('Page.navigate', { url: `${origin}/templates/noirei/site${slug}` })
      let ready = false
      for (let attempt = 0; attempt < 150; attempt++) {
        await delay(200)
        ready = await browser.evaluate('!!document.querySelector(".nr-footer") && document.readyState === "complete"')
        if (ready) break
      }
      if (!ready) throw new Error(`Page not ready: ${device}/${name}`)
      await browser.evaluate('Promise.all([document.fonts.ready,...[...document.images].map(i=>{i.loading="eager";return i.decode().catch(()=>{})})])')
      await browser.evaluate(name === 'rooms' ? 'window.scrollTo({top:scrollY+document.querySelector(".nr-catalog-section").getBoundingClientRect().top-90,behavior:"instant"})' : 'window.scrollTo({top:0,behavior:"instant"})')
      if (name === 'contact' && device === 'mobile') await browser.evaluate('window.scrollTo({top:scrollY+document.querySelector("#nr-enquiry").getBoundingClientRect().top-74,behavior:"instant"})')
      await delay(1700)
      // 开发工具浮层不属于交付页面，截图排除本地 Next.js 调试入口。
      await browser.evaluate('document.querySelector("nextjs-portal")?.remove()')
      const check = await browser.evaluate('({width:innerWidth,pageWidth:document.documentElement.clientWidth,gutter:getComputedStyle(document.documentElement).scrollbarGutter,overflow:document.documentElement.scrollWidth>innerWidth,badImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),title:document.querySelector("h1")?.textContent})')
      if (check.overflow || check.badImages.length || check.pageWidth !== width || check.gutter !== 'auto') throw new Error(JSON.stringify({ device, name, ...check }))
      const screenshot = await browser.page('Page.captureScreenshot', { format: 'webp', quality: 90 })
      await writeFile(new URL(`${device}-${name}.webp`, output), Buffer.from(screenshot.data, 'base64'))
      console.log(JSON.stringify({ device, name, width, height, ...check }))
    }
  }
} finally { await browser.close() }

