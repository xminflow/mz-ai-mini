import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

/** 通过真实 CDP 输入验收滚轮、拖动、键盘与触屏，不替换 document 的滚动来源。 */
export async function verifyNuboScrollbar({ page, evaluate, delay, base, root }) {
  const results = []
  const read = () => evaluate(`(() => {
    const rail=document.querySelector('.nb-scrollbar'),thumb=document.querySelector('.nb-scrollbar-thumb');
    const track=rail.getBoundingClientRect(),handle=thumb.getBoundingClientRect(),max=document.documentElement.scrollHeight-innerHeight;
    return {width:innerWidth,pageWidth:document.documentElement.getBoundingClientRect().width,y:scrollY,max,
      now:Number(rail.getAttribute('aria-valuenow')),ariaMax:Number(rail.getAttribute('aria-valuemax')),
      dragging:rail.dataset.dragging,track:{x:track.x,y:track.y,width:track.width,height:track.height},
      thumb:{x:handle.x,y:handle.y,width:handle.width,height:handle.height},
      gutter:getComputedStyle(document.documentElement).scrollbarGutter,
      overflow:document.documentElement.scrollWidth>innerWidth};
  })()`)
  const sync = state => {
    assert.equal(state.now, Math.round(state.y), '无障碍读数与实际滚动位置一致')
    assert.equal(state.ariaMax, state.max)
    const expected = state.max ? state.y / state.max * (state.track.height - state.thumb.height) : 0
    assert.ok(Math.abs(state.thumb.y - state.track.y - expected) < 1, '滑块位置与文档进度一致')
  }
  const key = async (name, code) => {
    await page('Input.dispatchKeyEvent', { type: 'keyDown', key: name, code: name, windowsVirtualKeyCode: code })
    await page('Input.dispatchKeyEvent', { type: 'keyUp', key: name, code: name, windowsVirtualKeyCode: code })
    await delay(100)
  }
  const top = async () => { await evaluate(`window.scrollTo({top:0,behavior:'instant'})`); await delay(100) }
  const devices = [
    { width: 1440, height: 1000 }, { width: 834, height: 1180 },
    { width: 390, height: 844, mobile: true }, { width: 320, height: 568, mobile: true },
    { width: 1440, height: 1000, locale: '/en' },
    { width: 1440, height: 1000, reduced: true },
  ]
  for (const device of devices) {
    await page('Emulation.setDeviceMetricsOverride', { width: device.width, height: device.height, deviceScaleFactor: 1, mobile: !!device.mobile })
    await page('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: device.reduced ? 'reduce' : 'no-preference' }] })
    await page('Emulation.setTouchEmulationEnabled', { enabled: !!device.mobile })
    const url = `${base}/templates/nubo/site${device.locale || ''}`
    await page('Page.navigate', { url })
    let ready = false
    for (let n = 0; n < 150; n++) {
      ready = await evaluate(`location.href===${JSON.stringify(url)} && document.readyState==='complete' && document.querySelector('.nb-scrollbar')?.dataset.scrollable==='true'`)
      if (ready) break
      await delay(100)
    }
    assert.ok(ready, `页面已就绪: ${url}`)
    await evaluate('document.fonts.ready.then(()=>true)')
    await delay(1200)
    await top()
    let state = await read()
    assert.equal(state.pageWidth, state.width, '页面不预留滚动条白边')
    assert.equal(state.gutter, 'auto')
    assert.equal(state.overflow, false)
    sync(state)

    await page('Input.dispatchMouseEvent', { type: 'mouseWheel', x: device.width / 2, y: device.height / 2, deltaX: 0, deltaY: 500 })
    await delay(500)
    state = await read()
    assert.ok(state.y > 100, '滚轮继续驱动 document')
    sync(state)

    await top()
    state = await read()
    const x = state.thumb.x + state.thumb.width / 2
    const start = state.thumb.y + state.thumb.height / 2
    const finish = state.track.y + state.track.height * .65
    await page('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: start, buttons: 0 })
    await page('Input.dispatchMouseEvent', { type: 'mousePressed', x, y: start, button: 'left', buttons: 1, clickCount: 1 })
    for (let step = 1; step <= 10; step++) {
      await page('Input.dispatchMouseEvent', { type: 'mouseMoved', x, y: start + (finish - start) * step / 10, buttons: 1 })
      await delay(20)
    }
    await page('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y: finish, button: 'left', buttons: 0, clickCount: 1 })
    await delay(150)
    state = await read()
    assert.ok(state.y > state.max * .5, `真实指针拖动可到达文档下半部: ${JSON.stringify({device,state,x,start,finish})}`)
    assert.equal(state.dragging, 'false', '释放指针后结束拖动')
    sync(state)

    const trackTarget = { x, y: state.track.y + state.track.height * .25 }
    await page('Input.dispatchMouseEvent', { type: 'mouseMoved', ...trackTarget, buttons: 0 })
    await page('Input.dispatchMouseEvent', { type: 'mousePressed', ...trackTarget, button: 'left', buttons: 1, clickCount: 1 })
    await page('Input.dispatchMouseEvent', { type: 'mouseReleased', ...trackTarget, button: 'left', buttons: 0, clickCount: 1 })
    await delay(100)
    state = await read()
    assert.ok(state.y > state.max * .1 && state.y < state.max * .4, '点击轨道可以定位')
    sync(state)

    await evaluate(`document.querySelector('.nb-scrollbar').focus({preventScroll:true})`)
    await key('End', 35)
    state = await read()
    assert.ok(Math.abs(state.y - state.max) < 2, 'End 到达页底')
    sync(state)
    await key('Home', 36)
    assert.equal((await read()).y, 0)
    await key('ArrowDown', 40)
    assert.equal((await read()).y, 40)
    await key('PageDown', 34)
    assert.ok((await read()).y > device.height * .8)

    if (device.mobile) {
      await top()
      state = await read()
      const finger = { x: state.thumb.x + state.thumb.width / 2, y: state.thumb.y + state.thumb.height / 2 }
      await page('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [finger] })
      for (let step = 1; step <= 6; step++) {
        await page('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: finger.x, y: finger.y + state.track.height * .6 * step / 6 }] })
        await delay(40)
      }
      await page('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await delay(100)
      assert.ok((await read()).y > state.max * .5, '手机可直接拖动滑块')
      await top()
      await page('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: device.width / 2, y: device.height * .7 }] })
      for (let step = 1; step <= 6; step++) {
        await page('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: device.width / 2, y: device.height * (.7 - .4 * step / 6) }] })
        await delay(40)
      }
      await page('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
      await delay(500)
      assert.ok((await read()).y > 100, '内容区域的触屏滑动保持有效')
    }
    results.push({ ...device, wheel: true, drag: true, keyboard: true, touch: !!device.mobile, fullWidth: true })
    console.log(`Scrollbar verified: ${device.width}x${device.height}${device.locale || ''}${device.reduced ? ' reduced' : ''}`)
  }
  await page('Emulation.setTouchEmulationEnabled', { enabled: false })
  await evaluate(`document.querySelector('.nb-market-logo').click()`)
  let unloaded = false
  for (let n = 0; n < 100; n++) {
    unloaded = await evaluate(`location.pathname==='/templates' && !document.querySelector('[data-template=nubo]') && document.readyState==='complete'`)
    if (unloaded) break
    await delay(100)
  }
  assert.ok(unloaded)
  assert.equal(await evaluate(`getComputedStyle(document.documentElement).scrollbarWidth==='none'`), false, '离开模板后恢复宿主滚动条')
  await writeFile(resolve(root, 'src/features/site-templates/catalog/nubo/scrollbar-verification.json'), JSON.stringify({ verifiedAt: new Date().toISOString(), base, results, hostRestored: true }, null, 2))
}
