/** 真实 CDP 输入验收场景动态、滚动条与减少动态偏好，不以静态截图代替动效验证。 */
import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { openBrowser, delay } from './lib/browser-cdp.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const base = process.env.UNSEEN_PREVIEW_URL || 'http://localhost:3000'
const site = '/templates/unseen/site'
const output = resolve(root, '../.local/unseen-motion')
await mkdir(output, { recursive: true })
const browser = await openBrowser()
const { page, evaluate } = browser
const report = { testedAt: new Date().toISOString(), checks: [], evidence: [], debug: [] }
const check = (name, value) => { assert.ok(value, name); report.checks.push({ name, passed: true }); console.log(`PASS ${name}`) }
const wait = async expression => {
  for (let i = 0; i < 200; i++) { if (await evaluate(expression)) return; await delay(100) }
  throw new Error(`Timed out: ${expression}`)
}
const navigate = async path => {
  const result = await page('Page.navigate', { url: `${base}${path}` })
  if (result.errorText) throw new Error(result.errorText)
  await wait(`location.pathname===${JSON.stringify(path.split('?')[0])} && document.readyState==='complete' && !!document.querySelector('.us-footer,.market-footer,.nb-scrollbar')`)
  await evaluate(`document.querySelector('nextjs-portal')?.setAttribute('style','display:none')`)
}
const mouse = (x, y) => page('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y, buttons: 0 })
const click = async (x, y) => {
  await mouse(x, y)
  await page('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', buttons: 1, clickCount: 1 })
  await page('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', buttons: 0, clickCount: 1 })
}
const key = async (key, code) => {
  await page('Input.dispatchKeyEvent', { type: 'keyDown', key, code: key, windowsVirtualKeyCode: code })
  await page('Input.dispatchKeyEvent', { type: 'keyUp', key, code: key, windowsVirtualKeyCode: code })
  await delay(120)
}
const shot = async name => {
  const result = await page('Page.captureScreenshot', { format: 'webp', quality: 85 })
  await writeFile(resolve(output, name), Buffer.from(result.data, 'base64'))
  report.evidence.push(`.local/unseen-motion/${name}`)
}
const scrollbar = (prefix = 'us') => evaluate(`(()=>{
  const rail=document.querySelector('.${prefix}-scrollbar'),thumb=document.querySelector('.${prefix}-scrollbar-thumb');
  const r=rail.getBoundingClientRect(),t=thumb.getBoundingClientRect(),max=document.documentElement.scrollHeight-innerHeight;
  return {y:scrollY,max,now:Number(rail.getAttribute('aria-valuenow')),ariaMax:Number(rail.getAttribute('aria-valuemax')),active:rail.dataset.active,dragging:rail.dataset.dragging,opacity:getComputedStyle(rail).opacity,
  width:innerWidth,pageWidth:document.documentElement.getBoundingClientRect().width,overflow:document.documentElement.scrollWidth>innerWidth,
  track:{x:r.x,y:r.y,height:r.height,width:r.width},thumb:{x:t.x,y:t.y,width:t.width,height:t.height}};
})()`)
const sync = state => Math.abs(state.now - state.y) <= 1 && state.ariaMax === state.max && Math.abs(state.thumb.y - state.track.y - state.y / state.max * (state.track.height - state.thumb.height)) < 2
try {
  await page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await navigate('/templates')
  const original = await evaluate(`({width:getComputedStyle(document.documentElement).scrollbarWidth,gutter:getComputedStyle(document.documentElement).scrollbarGutter})`)
  await navigate(site)
  await wait(`document.querySelector('.us-scene')?.dataset.state==='running'`)
  check('GPU scene is running', await evaluate(`document.querySelector('.us-scene').dataset.renderer==='webgl'`))
  await evaluate(`window.__sceneFrame=document.querySelector('.us-scene canvas').toDataURL()`)
  await delay(250)
  check('Water changes between real frames', await evaluate(`window.__sceneFrame!==document.querySelector('.us-scene canvas').toDataURL()`))
  await mouse(120, 800); await delay(700)
  const left = await evaluate(`(()=>{const c=document.querySelector('.us-scene canvas'),g=c.getContext('webgl'),p=g.getParameter(g.CURRENT_PROGRAM),u=g.getUniform(p,g.getUniformLocation(p,'uPointer'));return {pointer:[...u],title:new DOMMatrix(getComputedStyle(document.querySelector('.us-hero-follow')).transform).m41}})()`)
  await shot('desktop-pointer-left.webp')
  await mouse(1320, 850); await delay(700)
  const right = await evaluate(`(()=>{const c=document.querySelector('.us-scene canvas'),g=c.getContext('webgl'),p=g.getParameter(g.CURRENT_PROGRAM),u=g.getUniform(p,g.getUniformLocation(p,'uPointer'));return {pointer:[...u],title:new DOMMatrix(getComputedStyle(document.querySelector('.us-hero-follow')).transform).m41}})()`)
  await shot('desktop-pointer-right.webp')
  check('Pointer changes the GPU camera in both directions', left.pointer[0] < -.6 && right.pointer[0] > .6)
  check('Title follows in the opposite direction', left.title > 10 && right.title < -10)
  check('Moving over water creates ripple impulses', await evaluate(`Number(document.querySelector('.us-scene').dataset.rippleCount)>=2`))
  await click(680, 820)
  check('Clicking water creates another ripple', await evaluate(`Number(document.querySelector('.us-scene').dataset.rippleCount)>=3`))

  await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await wait(`document.querySelector('.us-scene').dataset.state==='still'`)
  await evaluate(`window.__sceneFrame=document.querySelector('.us-scene canvas').toDataURL();window.__rippleCount=document.querySelector('.us-scene').dataset.rippleCount`)
  await mouse(1000, 810); await delay(300)
  check('Reduced motion freezes the rendered water', await evaluate(`window.__sceneFrame===document.querySelector('.us-scene canvas').toDataURL()`))
  check('Reduced motion disables pointer ripples', await evaluate(`window.__rippleCount===document.querySelector('.us-scene').dataset.rippleCount`))
  await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] })
  await wait(`document.querySelector('.us-scene').dataset.state==='running'`)
  await evaluate(`document.querySelector('.us-menu-button').click()`)
  await delay(140)
  check('Menu has an intermediate reveal frame', await evaluate(`document.querySelector('.us-menu').open && !['none','inset(0px)'].includes(getComputedStyle(document.querySelector('.us-menu')).clipPath)`))
  check('Menu locks the background document', await evaluate(`document.body.style.overflow==='hidden'`))
  check('Modal hides the document scrollbar', (await scrollbar()).opacity === '0')
  await delay(800); await shot('desktop-menu-open.webp')
  await key('Escape', 27)
  await wait(`!document.querySelector('.us-menu').open`)
  check('Animated menu closes and restores focus', await evaluate(`document.activeElement===document.querySelector('.us-menu-button') && document.body.style.overflow!=='hidden'`))

  await mouse(700, 500)
  await page('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 700, y: 500, deltaX: 0, deltaY: 600 })
  await delay(70)
  const early = await evaluate('scrollY')
  await delay(140)
  const middle = await evaluate('scrollY')
  await delay(750)
  let state = await scrollbar()
  check('Desktop wheel interpolates without replacing document scrolling', early > 0 && early < middle && middle <= state.y && Math.abs(state.y - 600) < 3)
  check('Scrollbar follows the actual scroll position', sync(state))
  check('No reserved white gutter or horizontal overflow', state.width === state.pageWidth && !state.overflow)
  check('Scrollbar is visible while scrolling', state.active === 'true' && Number(state.opacity) > .9)
  await shot('desktop-scrolling.webp')
  await delay(1600)
  state = await scrollbar()
  check('Scrollbar fades out when idle', state.active === 'false' && Number(state.opacity) < .01)
  const x = state.track.x + state.track.width / 2, start = state.thumb.y + state.thumb.height / 2, end = state.track.y + state.track.height * .7
  await mouse(x, start)
  await page('Input.dispatchMouseEvent', { type: 'mousePressed', x, y: start, button: 'left', buttons: 1, clickCount: 1 })
  for (let i = 1; i <= 10; i++) { await page('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: start + (end - start) * i / 10, buttons: 1 }); await delay(20) }
  await page('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y: end, button: 'left', buttons: 0, clickCount: 1 })
  await delay(150)
  state = await scrollbar()
  check('Thumb drag reaches lower content and releases capture', state.y > state.max * .5 && state.dragging === 'false' && sync(state))
  await evaluate(`document.querySelector('.us-scrollbar').focus({preventScroll:true})`)
  await key('End', 35); state = await scrollbar()
  check('Scrollbar End reaches the page footer', Math.abs(state.y - state.max) < 2 && sync(state))
  await key('Home', 36); state = await scrollbar()
  check('Scrollbar Home reaches the top', state.y === 0 && sync(state))
  await key('PageDown', 34); state = await scrollbar()
  check('Scrollbar PageDown advances one viewport', Math.abs(state.y - 900) < 2 && sync(state))
  await click(x, state.track.y + state.track.height * .3); await delay(150); state = await scrollbar()
  check('Clicking the rail seeks the document', state.y > state.max * .15 && state.y < state.max * .4 && sync(state))
  await evaluate(`window.scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'})`)
  await wait(`document.querySelector('.us-scene').dataset.state==='paused'`)
  check('Offscreen GPU scene pauses', await evaluate(`document.querySelector('.us-scene').dataset.state==='paused'`))

  for (const device of [{ width: 834, height: 1180 }, { width: 390, height: 844, mobile: true }, { width: 320, height: 568, mobile: true }]) {
    await page('Emulation.setDeviceMetricsOverride', { ...device, mobile: !!device.mobile, deviceScaleFactor: 1 })
    await page('Emulation.setTouchEmulationEnabled', { enabled: !!device.mobile })
    await navigate(site)
    await wait(`document.querySelector('.us-scene')?.dataset.state==='running'`)
    state = await scrollbar()
    check(`${device.width}px: no gutter or overflow`, state.width === state.pageWidth && !state.overflow)
    check(`${device.width}px: document scrollbar synchronized`, sync(state))
    if (device.mobile) {
      await page('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: device.width / 2, y: device.height * .75 }] })
      for (let i = 1; i <= 12; i++) {
        await page('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: device.width / 2, y: device.height * (.75 - .47 * i / 12) }] })
        await delay(20)
      }
      await page('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await delay(400)
      state = await scrollbar()
      check(`${device.width}px: real touch scroll remains native`, state.y > 150 && sync(state))
    }
    await shot(`${device.width}px-scroll.webp`)
  }
  await page('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await page('Emulation.setTouchEmulationEnabled', { enabled: false })
  await navigate(`${site}/en/contact`)
  await wait(`document.querySelector('.us-scene')?.dataset.state==='running'`)
  check('English contact uses the interactive scene', await evaluate(`document.querySelector('h1').textContent==='Say hello'`))
  await navigate(`${site}/world`)
  await wait(`Object.keys(document.querySelector('.us-view-switch button')||{}).some(k=>k.startsWith('__reactProps$'))`)
  await evaluate(`document.querySelectorAll('.us-view-switch button')[1].click()`)
  await wait(`!!document.querySelector('.us-world-tile video')`)
  await evaluate(`document.querySelector('.us-world-tile video').closest('button').scrollIntoView({block:'center',behavior:'instant'})`)
  await wait(`[...document.querySelectorAll('.us-world-tile video')].some(v=>!v.paused&&v.currentTime>0)`)
  check('Visible World video previews play automatically', await evaluate(`[...document.querySelectorAll('.us-world-tile video')].some(v=>!v.paused&&v.currentTime>0)`))
  await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] })
  await wait(`[...document.querySelectorAll('.us-world-tile video')].every(v=>v.paused)`)
  check('Reduced motion pauses all World previews', await evaluate(`[...document.querySelectorAll('.us-world-tile video')].every(v=>v.paused)`))
  await navigate('/templates/nubo/site')
  await wait(`document.querySelector('.nb-scrollbar')?.dataset.scrollable==='true'`)
  check('Existing Nubo keeps its visible scrollbar', Number((await scrollbar('nb')).opacity) === 1)
  await evaluate(`document.querySelector('.nb-scrollbar').focus({preventScroll:true})`)
  await key('End', 35)
  state = await scrollbar('nb')
  check('Shared scrollbar preserves Nubo behavior', Math.abs(state.y - state.max) < 2 && sync(state))
  await navigate('/templates')
  const restored = await evaluate(`({width:getComputedStyle(document.documentElement).scrollbarWidth,gutter:getComputedStyle(document.documentElement).scrollbarGutter})`)
  check('Leaving Unseen restores document scrollbar styles', JSON.stringify(restored) === JSON.stringify(original) && await evaluate(`!document.querySelector('.us-scrollbar')`))
  const errors = browser.events.filter(e => e.method === 'Runtime.exceptionThrown').map(e => e.params.exceptionDetails.text)
  check('No uncaught browser exceptions', errors.length === 0)
  const consoleErrors = browser.events.filter(e => e.method === 'Runtime.consoleAPICalled' && e.params.type === 'error').map(e => e.params.args.map(a => a.value || a.description).join(' '))
  check('No browser console errors', consoleErrors.length === 0)
  report.debug = browser.events.filter(e => e.method === 'Runtime.consoleAPICalled' && e.params.type === 'debug').map(e => e.params.args.map(a => a.value || a.description).join(' '))
  check('Scene state is observable in debug logs', report.debug.some(line => line.includes('[unseen/scene] image-ready')))
  await writeFile(resolve(root, 'src/features/site-templates/catalog/unseen/motion-verification.json'), JSON.stringify(report, null, 2))
  console.log(`Verified ${report.checks.length} motion and scrollbar checks.`)
} finally { await browser.close() }
