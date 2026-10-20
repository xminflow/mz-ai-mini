/** 由 capture-nubo.mjs 调用；复用同一 CDP 会话，检查真实页面和关键交互。 */
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function verifyNubo({ page, evaluate, delay, base, root }) {
  const report = { pages: [], interactions: [] }
  const slugs = ['', 'about', 'cases', 'updates', 'contact', 'waitlist', 'legal/privacy-and-cookies', 'legal/terms-of-service', 'cases/kitchen', 'cases/family', 'cases/daily-duties', 'cases/housekeeping', '404']
  const assert = (condition, label, details) => { if (!condition) throw new Error(`${label}: ${JSON.stringify(details)}`) }
  const run = (fn, ...args) => evaluate(`(${fn.toString()})(...${JSON.stringify(args)})`)
  const navigate = async path => {
    const url = `${base}${path}`
    const result = await page('Page.navigate', { url })
    assert(!result.errorText, 'navigation', result)
    for (let i = 0; i < 150; i++) {
      if (await run(expected => location.href === expected && document.readyState === 'complete' && !!document.querySelector(expected.endsWith('/templates/nubo') ? '.market-footer' : '.nb-footer'), url)) return
      await delay(100)
    }
    throw new Error(`页面未就绪 ${url}`)
  }
  const settle = () => delay(200)
  const click = async selector => {
    const box = await run(selector => {
      const el = document.querySelector(selector)
      if (!el) throw new Error(`Missing element ${selector}`)
      el.scrollIntoView({ block: 'center', behavior: 'instant' })
      const r = el.getBoundingClientRect()
      return { x: r.x + r.width / 2, y: r.y + r.height / 2 }
    }, selector)
    await page('Input.dispatchMouseEvent', { type: 'mousePressed', ...box, button: 'left', clickCount: 1 })
    await page('Input.dispatchMouseEvent', { type: 'mouseReleased', ...box, button: 'left', clickCount: 1 })
    await settle()
  }
  for (const width of [1440, 834, 390, 320]) {
    const height = width === 1440 ? 1000 : width === 834 ? 1180 : 844
    await page('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false })
    for (const locale of ['zh', 'en']) {
      for (const slug of slugs) {
        const path = `/templates/nubo/site${locale === 'en' ? '/en' : ''}${slug ? '/' + slug : ''}`
        await navigate(path)
        const result = await run(async () => {
          document.querySelector('nextjs-portal')?.setAttribute('style', 'display:none')
          ;[...document.images].forEach(image => image.loading = 'eager')
          await document.fonts.ready
          const broken = (await Promise.all([...document.images].map(image => image.decode().then(() => null, () => image.src)))).filter(Boolean)
          const chinese = [...document.fonts].filter(f => f.family === 'Weelume MiSans' && f.status === 'loaded').map(f => f.weight)
          return { width: innerWidth, overflow: document.documentElement.scrollWidth > innerWidth, broken, h1: document.querySelectorAll('h1').length, language: document.querySelector('.nb-site').lang, chineseFontWeights: [...new Set(chinese)], emptyLinks: [...document.querySelectorAll('.nb-site a')].filter(a => !a.getAttribute('href')).length, filing: !!document.querySelector('a[href="https://beian.miit.gov.cn/"]'), title: document.querySelector('h1')?.innerText, clipped: [...document.querySelectorAll('h1,h2,h3,input,select,textarea')].filter(el => el.scrollWidth > el.clientWidth + 2).map(el => el.textContent?.slice(0,100)) }
        })
        assert(result.width === width && !result.overflow && !result.broken.length && result.h1 === 1 && result.filing && !result.emptyLinks && !result.clipped.length && result.language === (locale === 'zh' ? 'zh-CN' : 'en'), 'page validation', { path, ...result })
        if (locale === 'zh') assert(['400', '700'].every(weight => result.chineseFontWeights.includes(weight)), 'font weights', result)
        report.pages.push({ path, ...result })
      }
      console.log(`Verified ${width}px ${locale}: ${slugs.length} pages`)
    }
  }
  await navigate('/templates/nubo/site')
  await click('.nb-nav button')
  assert(await run(() => document.querySelector('.nb-nav button').ariaExpanded === 'true' && document.querySelectorAll('.nb-menu-links a').length === 6), 'menu opens')
  await page('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await page('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27 })
  await settle()
  assert(await run(() => document.querySelector('.nb-nav button').ariaExpanded === 'false' && document.activeElement === document.querySelector('.nb-nav button')), 'Escape restores focus')
  await click('.nb-nav button')
  await click('.nb-menu-links a[href$="/cases"]')
  let menuNavigated = false
  for (let attempt = 0; attempt < 100; attempt++) {
    menuNavigated = await run(() => location.pathname.endsWith('/cases') && document.querySelector('.nb-nav button')?.ariaExpanded === 'false')
    if (menuNavigated) break
    await delay(100)
  }
  assert(menuNavigated, 'menu navigation', menuNavigated ? undefined : await run(() => ({ path: location.pathname, expanded: document.querySelector('.nb-nav button')?.ariaExpanded })))
  report.interactions.push('手机菜单、Escape 焦点返回、客户端导航')

  await navigate('/templates/nubo/site')
  await click('.nb-material-tabs button:nth-child(3)')
  assert(await run(() => document.querySelector('.nb-material-image img').src.includes('S4oLeqj0sxUIqgM2rpSfZv66U') && document.querySelectorAll('.nb-material-tabs button[aria-pressed="true"]').length === 1), 'material selection')
  await click('.nb-faq-item:nth-child(2) button')
  assert(await run(() => document.querySelector('.nb-faq-item:nth-child(2) button').ariaExpanded === 'true' && document.querySelectorAll('.nb-faq-item button[aria-expanded="true"]').length === 1), 'FAQ opens one item')
  await click('.nb-faq-item:nth-child(2) button')
  assert(await run(() => document.querySelector('.nb-faq-item:nth-child(2) button').ariaExpanded === 'false'), 'FAQ closes')
  assert(await run(() => document.querySelector('.nb-hero video').paused), 'reduced motion stops autoplay')
  report.interactions.push('四项材质切换、FAQ 展开收起、减少动态效果')

  await navigate('/templates/nubo/site/waitlist?plan=pro#nb-main')
  assert(await run(() => document.querySelector('select[name="plan"]').value === 'pro'), 'selected plan retained')
  await click('.nb-language')
  assert(await run(() => location.pathname.endsWith('/en/waitlist') && location.search === '?plan=pro' && location.hash === '#nb-main'), 'language preserves document/query/hash')
  report.interactions.push('套餐带入、语言切换保留页面/查询/锚点')

  for (const kind of ['contact', 'waitlist', 'updates']) {
    await navigate(`/templates/nubo/site/${kind}`)
    const form = kind === 'updates' ? '.nb-updates-layout form' : '.nb-contact-layout form'
    const invalid = await run(selector => !document.querySelector(selector).checkValidity(), form)
    assert(invalid, 'empty form invalid', kind)
    await run(selector => {
      const form = document.querySelector(selector)
      for (const input of form.querySelectorAll('input:not([type="radio"]),textarea')) {
        const value = input.type === 'email' ? 'demo@example.com' : input.name === 'message' ? '希望了解演示产品的日常能力。' : '演示用户'
        const setter = Object.getOwnPropertyDescriptor(input.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value').set
        setter.call(input, value)
        input.dispatchEvent(new Event('input', { bubbles: true }))
      }
      const household = form.querySelector('[name="household"]')
      if (household) { household.value = 'apartment'; household.dispatchEvent(new Event('change', { bubbles: true })) }
    }, form)
    await click(`${form} button[type="submit"]`)
    assert(await run(selector => document.querySelector(`${selector} [role="status"]`).textContent.includes('校验成功'), form), 'valid form status', kind)
    report.interactions.push(`${kind} 表单空值拦截与有效本地校验`)
  }

  for (const device of ['desktop', 'tablet', 'mobile']) {
    await navigate('/templates/nubo')
    const link = await run(device => [...document.querySelectorAll('a[target="_blank"]')].find(a => device === 'desktop' ? a.href.endsWith('/nubo/site') : a.href.includes(`viewport=${device}`))?.href, device)
    assert(link, 'new tab preview entry', device)
    if (device !== 'desktop') {
      await page('Page.navigate', { url: link })
      // iframe 的服务端 HTML 先于客户端事件就绪，等待导航按钮完成水合后再点击。
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await run(() => { const doc = document.querySelector('iframe')?.contentDocument; return doc?.readyState === 'complete' && !!doc.querySelector('.nb-footer') && typeof doc.querySelector('.nb-nav button')?.onclick === 'function' })) break
        await delay(100)
      }
      const frame = await run(() => { const iframe = document.querySelector('iframe'); return iframe && { src: iframe.src, width: iframe.contentWindow.innerWidth, height: iframe.contentWindow.innerHeight } })
      assert(frame && frame.src.includes('/nubo/site') && frame.width === (device === 'tablet' ? 834 : 390) && frame.height === (device === 'tablet' ? 1180 : 844), 'device preview frame', frame)
      await run(() => document.querySelector('iframe').contentDocument.querySelector('.nb-nav button').click())
      await delay(300)
      assert(await run(() => document.querySelector('iframe').contentDocument.querySelector('.nb-nav button').ariaExpanded === 'true'), 'menu inside preview', device)
      await run(() => document.querySelector('iframe').contentDocument.querySelector('.nb-menu-links a[href$="/cases"]').click())
      for (let attempt = 0; attempt < 100; attempt++) {
        if (await run(() => document.querySelector('iframe').contentWindow.location.pathname.endsWith('/cases'))) break
        await delay(100)
      }
      assert(await run(() => document.querySelector('iframe').contentWindow.location.pathname.endsWith('/cases')), 'navigation inside preview', device)
    }
    report.interactions.push(`${device} 新标签预览入口${device === 'desktop' ? '' : '、真实视口、框内菜单和导航'}`)
  }
  await writeFile(join(root, 'src/features/site-templates/catalog/nubo/verification.json'), JSON.stringify({ verifiedAt: new Date().toISOString(), base, ...report }, null, 2))
  console.log(`Verified ${report.pages.length} page loads and ${report.interactions.length} interaction groups`)
}
