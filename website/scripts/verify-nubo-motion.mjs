/** 同时验收正常动效和减少动态效果，保留真实滚动位置、变换值与三端过程截图。 */
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function verifyNuboMotion({ page, evaluate, delay, base, root }) {
  const assert = (condition, label, data) => { if (!condition) throw new Error(`${label}: ${JSON.stringify(data)}`) }
  const run = (fn, ...args) => evaluate(`(${fn.toString()})(...${JSON.stringify(args)})`)
  const output = join(root, 'public/templates/nubo/screenshots/motion')
  await mkdir(output, { recursive: true })
  const report = { viewports: [], carousel: [], showreels: [], frames: [], previews: [], runtimeErrors: [] }
  await page('Page.addScriptToEvaluateOnNewDocument', { source: `window.__nuboRuntimeErrors=[];window.addEventListener('error',event=>window.__nuboRuntimeErrors.push({message:event.message,file:event.filename,line:event.lineno}));window.addEventListener('unhandledrejection',event=>window.__nuboRuntimeErrors.push({message:String(event.reason)}));` })
  const metrics = () => run(() => {
    const hero = document.querySelector('.nb-hero')
    const title = document.querySelector('.nb-hero h1')
    const y = element => { const value = getComputedStyle(element).transform; return value === 'none' ? 0 : new DOMMatrixReadOnly(value).m42 }
    return {
      width: innerWidth, height: innerHeight, scroll: scrollY, heroHeight: hero.getBoundingClientRect().height, heroTop: hero.getBoundingClientRect().top,
      titleY: y(title), titleOpacity: [...title.querySelectorAll('.nb-title-line > span')].map(e => Number(getComputedStyle(e).opacity)),
      portraitOpacity: Number(getComputedStyle(document.querySelector('.nb-hero-portrait')).opacity),
      introY: y(document.querySelector('.nb-intro-title')), overflow: document.documentElement.scrollWidth > innerWidth,
      titleFont: parseFloat(getComputedStyle(title).fontSize), bodyFont: parseFloat(getComputedStyle(document.querySelector('.nb-hero p')).fontSize),
      actionsVisible: [...document.querySelectorAll('.nb-hero .nb-button')].every(e => { const r = e.getBoundingClientRect(); return r.top > 80 && r.bottom < innerHeight - 20 }),
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    }
  })
  const scroll = async top => { await run(top => window.scrollTo({ top, behavior: 'instant' }), top); await delay(250) }
  const snapshot = async name => {
    const result = await metrics()
    const screenshot = await page('Page.captureScreenshot', { format: 'webp', quality: 85, captureBeyondViewport: false })
    await writeFile(join(output, `${name}.webp`), Buffer.from(screenshot.data, 'base64'))
    report.frames.push({ file: `${name}.webp`, ...result })
  }
  for (const mode of ['no-preference', 'reduce']) {
    await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: mode }] })
    for (const [width, height] of [[1440, 1000], [834, 1180], [390, 844], [1440, 650], [1440, 1400], [390, 600], [320, 568]]) {
      await page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
      await page('Page.navigate', { url: `${base}/templates/nubo/site` })
      let ready = false
      for (let i = 0; i < 120; i++) {
        ready = await run(() => document.readyState === 'complete' && typeof document.querySelector('.nb-nav button')?.onclick === 'function')
        if (ready) break
        await delay(100)
      }
      assert(ready, 'motion page hydration', ready ? undefined : await run(() => ({ url: location.href, ready: document.readyState, errors: window.__nuboRuntimeErrors, scripts: [...document.scripts].filter(e => e.src).map(e => e.src) })))
      await run(async () => { document.documentElement.style.scrollBehavior = 'auto'; document.querySelector('nextjs-portal')?.setAttribute('style', 'display:none'); await document.fonts.ready })
      await scroll(0)
      await delay(1300)
      const start = await metrics()
      assert(Math.abs(start.heroHeight - height) < 1 && !start.overflow && start.actionsVisible && start.titleOpacity.every(value => value > 0.98), 'full viewport hero and visible content', start)
      const standard = [1000, 1180, 844].includes(height)
      if (standard) assert(start.titleFont >= (width === 1440 ? 109 : width === 834 ? 71 : 51) && start.bodyFont === 18, 'reference typography scale', start)
      if (mode === 'no-preference' && standard) await snapshot(`${width}-start`)
      await scroll(height * 0.25)
      const quarter = await metrics()
      if (mode === 'no-preference') {
        assert(Math.abs(quarter.heroTop) < 1 && Math.abs(quarter.titleY + height * 0.075) < 2 && quarter.portraitOpacity > 0.4 && quarter.introY > 0, 'sticky and synchronized parallax', quarter)
        if (standard) await snapshot(`${width}-quarter`)
        await scroll(height * 0.5)
        const middle = await metrics()
        assert(middle.portraitOpacity > 0.98 && middle.titleY < quarter.titleY, 'portrait transition and continuing parallax', middle)
        if (standard) await snapshot(`${width}-middle`)
        await scroll(height)
        if (standard) await snapshot(`${width}-showreel`)
        await scroll(height * 1.25)
        const later = await metrics()
        assert(Math.abs(later.heroTop) < 1, 'background stays pinned behind showreel', later)
      } else {
        assert(quarter.heroTop < 0 && quarter.titleY === 0 && quarter.introY === 0 && quarter.portraitOpacity === 0, 'reduced motion stays static', quarter)
      }
      report.viewports.push({ mode, start, quarter })
      const errors = await run(() => window.__nuboRuntimeErrors)
      assert(!errors.length, 'motion runtime errors', errors)
      if (!standard) continue

      await scroll(height)
      await delay(1100)
      const reel = await run(() => {
        const e = document.querySelector('.nb-showreel'), r = e.getBoundingClientRect()
        return { cover: !!e.querySelector('button img'), video: !!e.querySelector('video'), scale: new DOMMatrixReadOnly(getComputedStyle(e).transform).m11, width: r.width, height: r.height, x: r.x + r.width / 2, y: r.y + r.height / 2 }
      })
      assert(reel.cover && !reel.video && Math.abs(reel.scale - 1) < 0.01 && Math.abs(reel.width / reel.height - 1.5) < 0.02, 'showreel cover settles without native controls', reel)
      await page('Input.dispatchMouseEvent', { type: 'mousePressed', x: reel.x, y: reel.y, button: 'left', clickCount: 1 })
      await page('Input.dispatchMouseEvent', { type: 'mouseReleased', x: reel.x, y: reel.y, button: 'left', clickCount: 1 })
      let played = false
      for (let attempt = 0; attempt < 30; attempt++) { played = await run(() => { const e = document.querySelector('.nb-showreel video'); return !!e && e.currentTime > 0 && !e.paused && e.controls }); if (played) break; await delay(100) }
      assert(played, 'showreel click plays local video')
      await run(() => document.querySelector('.nb-showreel video').pause())
      await page('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 })
      report.showreels.push({ mode, width, cover: true, aspectRatio: 1.5, clickPlayback: true })

      await run(() => document.querySelector('.nb-carousel-viewport').scrollIntoView({ block: 'center', behavior: 'instant' }))
      await delay(1200)
      await run(() => document.querySelector('.nb-carousel-dots button').click())
      await delay(1000)
      await run(() => document.querySelectorAll('.nb-carousel-dots button')[2].click())
      await delay(1000)
      const selected = await run(() => ({ index: [...document.querySelectorAll('.nb-carousel-dots button')].findIndex(e => e.ariaCurrent === 'true'), x: new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.nb-capabilities')).transform).m41, width: document.querySelector('.nb-capabilities').getBoundingClientRect().width }))
      assert(selected.index === 2 && Math.abs(selected.x + selected.width * 3) < 2, 'carousel selection slides track with leading loop slide', selected)
      const still = await run(() => getComputedStyle(document.querySelector('.nb-capabilities')).transform)
      await delay(5100)
      assert(await run(value => getComputedStyle(document.querySelector('.nb-capabilities')).transform === value, still), 'manual selection pauses carousel')
      if (mode === 'no-preference') {
        await run(() => document.querySelector('.nb-carousel-play').click())
        await delay(6200)
        assert(await run(() => [...document.querySelectorAll('.nb-carousel-dots button')].findIndex(e => e.ariaCurrent === 'true') !== 2), 'carousel autoplay advances')
        // 最后一项向前跨界后应回到第一项，轨道同步复位到首张的真实位置。
        await run(() => document.querySelectorAll('.nb-carousel-dots button')[6].click())
        await delay(1000)
        await run(() => document.querySelector('.nb-carousel-play').click())
        await delay(6200)
        const wrapped = await run(() => ({ index: [...document.querySelectorAll('.nb-carousel-dots button')].findIndex(e => e.ariaCurrent === 'true'), x: new DOMMatrixReadOnly(getComputedStyle(document.querySelector('.nb-capabilities')).transform).m41, width: document.querySelector('.nb-capabilities').getBoundingClientRect().width }))
        assert(wrapped.index === 0 && Math.abs(wrapped.x + wrapped.width) < 2, 'carousel loops forward without reverse flyback', wrapped)
        // 鼠标/触摸共用拖拽路径，按真实坐标拖动后应停留在所选页。
        const box = await run(() => { const r = document.querySelector('.nb-carousel-viewport').getBoundingClientRect(); return { x: innerWidth / 2, y: r.top + Math.min(r.height / 2, innerHeight / 2) } })
        await page('Input.dispatchMouseEvent', { type: 'mouseMoved', ...box })
        await delay(100)
        const before = await run(() => [...document.querySelectorAll('.nb-carousel-dots button')].findIndex(e => e.ariaCurrent === 'true'))
        await page('Input.dispatchMouseEvent', { type: 'mousePressed', ...box, button: 'left', clickCount: 1 })
        for (let i = 1; i <= 6; i++) { await page('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x - i * 20, y: box.y, button: 'left', buttons: 1 }); await delay(30) }
        await page('Input.dispatchMouseEvent', { type: 'mouseReleased', x: box.x - 120, y: box.y, button: 'left', clickCount: 1 })
        await delay(1200)
        assert(await run(before => [...document.querySelectorAll('.nb-carousel-dots button')].findIndex(e => e.ariaCurrent === 'true') === before + 1, before), 'drag changes carousel')
      } else {
        assert(await run(() => !document.querySelector('.nb-carousel-play') && document.querySelector('.nb-capability video').paused), 'reduced motion disables autoplay')
      }
      report.carousel.push({ mode, width, manualSelection: true, paused: true, autoplay: mode !== 'reduce', drag: mode !== 'reduce' })
      console.log(`Verified motion ${mode} ${width}x${height}`)
    }
  }
  await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  for (const [device, width, height] of [['tablet', 834, 1180], ['mobile', 390, 844]]) {
    await page('Page.navigate', { url: `${base}/templates/nubo/preview?viewport=${device}` })
    let ready = false
    for (let i = 0; i < 120; i++) {
      ready = await run(() => { const doc = document.querySelector('iframe')?.contentDocument; return doc?.readyState === 'complete' && typeof doc.querySelector('.nb-nav button')?.onclick === 'function' })
      if (ready) break
      await delay(100)
    }
    assert(ready, 'preview motion hydration', device)
    await delay(1300)
    await run(height => { const frame = document.querySelector('iframe'); frame.contentDocument.documentElement.style.scrollBehavior = 'auto'; frame.contentWindow.scrollTo({ top: height * 0.25, behavior: 'instant' }) }, height)
    await delay(500)
    const result = await run(() => {
      const frame = document.querySelector('iframe'), win = frame.contentWindow, doc = frame.contentDocument
      const hero = doc.querySelector('.nb-hero'), title = doc.querySelector('.nb-hero h1')
      return { width: win.innerWidth, height: win.innerHeight, heroHeight: hero.getBoundingClientRect().height, heroTop: hero.getBoundingClientRect().top, titleY: new DOMMatrixReadOnly(win.getComputedStyle(title).transform).m42, portraitOpacity: Number(win.getComputedStyle(doc.querySelector('.nb-hero-portrait')).opacity), errors: win.__nuboRuntimeErrors ?? [] }
    })
    assert(result.width === width && result.height === height && result.heroHeight === height && Math.abs(result.heroTop) < 1 && Math.abs(result.titleY + height * 0.075) < 2 && result.portraitOpacity > 0.4 && !result.errors.length, 'preview viewport and parallax', result)
    report.previews.push({ device, ...result })
  }
  await writeFile(join(root, 'src/features/site-templates/catalog/nubo/motion-verification.json'), JSON.stringify({ verifiedAt: new Date().toISOString(), base, ...report }, null, 2))
  console.log(`Verified ${report.viewports.length} viewport/motion combinations, ${report.carousel.length} carousel cases and ${report.previews.length} device previews`)
}
