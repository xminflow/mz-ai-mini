/** 生成 Viral 模板详情页所需的三端四页本地截图。 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { openBrowser, delay } from './lib/browser-cdp.mjs'

const base = process.env.VIRAL_PREVIEW_URL || 'http://127.0.0.1:3100'
const output = resolve('public/templates/viral/screenshots')
const shots = [
  { name: 'home', path: '' },
  { name: 'features', path: '/about' },
  { name: 'blog', path: '/blog' },
  { name: 'contact', path: '/book-a-call' },
]
const devices = [
  { prefix: '', width: 1440, height: 1000 },
  { prefix: 'tablet-', width: 834, height: 1180 },
  { prefix: 'mobile-', width: 390, height: 844 },
]

await mkdir(output, { recursive: true })
const browser = await openBrowser()
const report = []
try {
  await browser.page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  for (const device of devices) {
    await browser.page('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: 1, mobile: false })
    for (const shot of shots) {
      const url = `${base}/templates/viral/site${shot.path}`
      const navigation = await browser.page('Page.navigate', { url })
      if (navigation.errorText) throw new Error(navigation.errorText)
      let ready = false
      // 开发环境首次编译与字体加载可能超过 10 秒；超时仍明确失败。
      for (let attempt = 0; attempt < 300; attempt += 1) {
        // 以模板 DOM 和下方字体/图片检查判定可截图，避免被宿主统计脚本的 load 阻塞。
        ready = await browser.evaluate(`location.href === ${JSON.stringify(url)} && document.readyState !== 'loading' && !!document.querySelector('.vl-footer') && !!document.querySelector('h1')`)
        if (ready) break
        await delay(100)
      }
      if (!ready) {
        const state = await browser.evaluate(`({url:location.href,state:document.readyState,title:document.title,text:document.body?.innerText.slice(0,500)})`)
        throw new Error(`页面未就绪: ${url}; ${JSON.stringify(state)}`)
      }
      const result = await browser.evaluate(`(async () => {
        document.querySelector('nextjs-portal')?.setAttribute('style', 'display:none');
        [...document.images].forEach(image => { image.loading = 'eager' });
        await document.fonts.ready;
        const broken = (await Promise.all([...document.images].map(image => image.decode().then(()=>null,()=>image.src)))).filter(Boolean);
        window.scrollTo({top:0,behavior:'instant'});
        // SSR 字体就绪不代表客户端已经开始动画，按实际样式等待入场完成。
        for (let attempt = 0; attempt < 100; attempt += 1) {
          const heading = document.querySelector('h1');
          const headingStyle = heading ? getComputedStyle(heading) : null;
          const mainStyle = getComputedStyle(document.querySelector('main'));
          if (headingStyle?.opacity === '1' && ['none', 'blur(0px)'].includes(headingStyle.filter) && mainStyle.opacity === '1') break;
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        const title = document.querySelector('h1');
        const style = title ? getComputedStyle(title) : null;
        return {width:innerWidth,height:innerHeight,broken,overflow:document.documentElement.scrollWidth>innerWidth,title:document.title,titleFilter:style?.filter,titleOpacity:style?.opacity,mainOpacity:getComputedStyle(document.querySelector('main')).opacity};
      })()`)
      if (result.broken.length || result.overflow || result.width !== device.width || result.height !== device.height || !['none', 'blur(0px)'].includes(result.titleFilter) || result.titleOpacity !== '1' || result.mainOpacity !== '1') throw new Error(JSON.stringify({url,...result}))
      const screenshot = await browser.page('Page.captureScreenshot', { format: 'webp', quality: 86, captureBeyondViewport: false })
      const file = `${device.prefix}${shot.name}.webp`
      await writeFile(resolve(output, file), Buffer.from(screenshot.data, 'base64'))
      report.push({file,...result})
      console.log(`Captured ${file}: ${result.width}x${result.height}, titleFilter=${result.titleFilter}`)
    }
  }
  await writeFile(resolve(output, 'capture-report.json'), JSON.stringify({capturedAt:new Date().toISOString(),base,reducedMotion:true,shots:report},null,2)+'\n')
} finally {
  await browser.close()
}
