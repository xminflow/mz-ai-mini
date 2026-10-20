/** Tabfolio 中英文及四档视口的真实浏览器验收；复用本地 Chrome，无新增依赖。 */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { openBrowser, delay } from './lib/browser-cdp.mjs'

const base = process.env.TABFOLIO_PREVIEW_URL || 'http://127.0.0.1:3000'
const output = new URL('../../artifacts/tabfolio-alignment/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await openBrowser()
const report = { pages: [], interactions: [] }
const routes = ['', '/experiments', '/about', '/resume', '/contact', '/privacy-policy', '/terms-of-service', '/case-studies/aviera-financial-dashboard', '/case-studies/music-discovery-app', '/case-studies/designing-a-portfolio-system', '/case-studies/expanding-aviera-for-finance-teams']
async function ready(pathname) {
  for (let attempt = 0; attempt < 150; attempt++) {
    if (await browser.evaluate(`location.pathname === ${JSON.stringify(pathname)} && document.readyState === 'complete' && !!document.querySelector('.tf-footer')`)) return
    await delay(100)
  }
  throw new Error(`页面加载超时：${pathname}`)
}
try {
  for (const width of [1440, 834, 390, 320]) {
    await browser.page('Emulation.setDeviceMetricsOverride', { width, height: 1000, deviceScaleFactor: 1, mobile: false })
    for (const locale of ['zh', 'en']) {
      for (const route of routes) {
        const path = `/templates/tabfolio/site${locale === 'en' ? '/en' : ''}${route}`
        await browser.page('Page.navigate', { url: base + path })
        await ready(path)
        if (!route) await delay(650)
        const result = await browser.evaluate(`(async () => {
          await document.fonts.ready;
          const broken = (await Promise.all([...document.images].map(i=>i.decode().then(()=>null,()=>i.src)))).filter(Boolean);
          const rect=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height}};
          const nav=document.querySelector('.tf-nav');
          const project=document.querySelector('.tf-project-image');
          return {broken,overflow:document.documentElement.scrollWidth>innerWidth,nav:rect(nav),navLinks:[...nav.querySelectorAll('a')].map(rect),font:getComputedStyle(document.querySelector('h1')).fontFamily,project:project?rect(project):null,columns:getComputedStyle(document.querySelector('.tf-experiment-grid-desktop')||nav).gridTemplateColumns};
        })()`)
        assert.equal(result.broken.length, 0, `${path} 图片加载失败`)
        assert.equal(result.overflow, false, `${path} ${width}px 横向溢出`)
        assert.ok(result.navLinks.every(r => r.width > 0 && r.x >= 0 && r.x + r.width <= width), `${path} 导航被裁切`)
        assert.ok(result.font.includes(locale === 'en' ? 'Tabfolio Manrope' : 'Weelume MiSans'), `${path} 标题字体不正确`)
        if (width === 1440 && !route) {
          assert.ok(Math.abs(result.project.width - 564) < .1)
          assert.ok(Math.abs(result.project.height - 423) < .1)
          if (locale === 'en') assert.ok(Math.abs(result.project.y - 346.4) < 1, `首屏项目纵坐标异常：${result.project.y}`)
        }
        if (width === 834 && route === '/experiments') assert.equal(result.columns.split(' ').length, 3)
        if (width < 810) assert.equal(result.nav.y, 20)
        report.pages.push({ width, locale, route, ...result })
      }
    }
    console.log(`通过 ${width}px 中英文全部 ${routes.length * 2} 页`)
  }

  await browser.page('Page.navigate', { url: `${base}/templates/tabfolio/site/en` })
  await ready('/templates/tabfolio/site/en')
  await browser.evaluate("window.__tabfolioNavigationMarker = true; document.querySelector('.tf-nav a[href$=\"/about\"]').click()")
  await ready('/templates/tabfolio/site/en/about')
  assert.equal(await browser.evaluate('window.__tabfolioNavigationMarker'), true, '主导航发生整页刷新')
  await browser.evaluate("document.querySelector('.tf-language').click()")
  await ready('/templates/tabfolio/site/about')
  assert.equal(await browser.evaluate("document.querySelector('.tf-site').dataset.locale"), 'zh')
  report.interactions.push('手机胶囊导航客户端切页、当前页语言切换')

  await browser.page('Page.navigate', { url: `${base}/templates/tabfolio/site/en` })
  await ready('/templates/tabfolio/site/en')
  await browser.evaluate("window.__tabfolioProjectMarker = true; document.querySelector('.tf-project-card').click()")
  await ready('/templates/tabfolio/site/en/case-studies/aviera-financial-dashboard')
  assert.equal(await browser.evaluate('window.__tabfolioProjectMarker'), true, '项目卡片发生整页刷新')
  report.interactions.push('项目卡片客户端跳转案例详情')

  await browser.page('Page.navigate', { url: `${base}/templates/tabfolio/site/contact` })
  await ready('/templates/tabfolio/site/contact')
  assert.equal(await browser.evaluate("document.querySelector('form').checkValidity()"), false)
  await browser.evaluate(`document.querySelector('[name=name]').value='设计验收'; document.querySelector('[name=email]').value='qa@example.com'; document.querySelector('[name=message]').value='本地验证，不发送数据'; document.querySelector('button[type=submit]').click()`)
  await delay(100)
  assert.equal(await browser.evaluate("document.querySelector('button[type=submit]').innerText"), '已收到，谢谢')
  report.interactions.push('联系演示表单必填校验、有效提交本地反馈')
  const exceptions = browser.events.filter(e => e.method === 'Runtime.exceptionThrown')
  assert.equal(exceptions.length, 0, JSON.stringify(exceptions))
  const consoleErrors = browser.events.filter(e => e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error')
  assert.equal(consoleErrors.length, 0, JSON.stringify(consoleErrors))
  const failedResponses = browser.events.filter(e => e.method === 'Network.responseReceived' && e.params.response.status >= 400)
  assert.equal(failedResponses.length, 0, JSON.stringify(failedResponses))
  report.exceptions = exceptions
  report.consoleErrors = consoleErrors
  report.failedResponses = failedResponses
  await writeFile(new URL('verification.json', output), JSON.stringify(report, null, 2))
  console.log(`完成 ${report.pages.length} 个页面检查及 ${report.interactions.length} 项交互验证，未捕获 JavaScript 异常。`)
} finally { await browser.close() }
