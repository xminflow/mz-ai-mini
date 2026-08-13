'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, type PanInfo } from 'framer-motion'

import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui'

import { SERVICES, THEMES } from '../custom-software/data'
import { ServiceArtwork } from './ServiceArtwork'

const COUNT = SERVICES.length
const LAST_INDEX = COUNT - 1

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

// 首尾相接：每张卡取到当前项的「最短环形距离」，第一张的左边就是最后一张，
// 因此往任一方向都滑不到头。取值范围 -5…+6（12 张时），对跖点落在 ±6 附近。
const wrappedDelta = (index: number, active: number) => {
  const raw = ((index - active) % COUNT + COUNT) % COUNT
  return raw > COUNT / 2 ? raw - COUNT : raw
}

// 一张卡绕到队伍另一头时不能用动画，否则它会横穿整个版面。
// 判据是「换位前后都在视野外」：最窄的手机上 |delta| ≥ 2 就已经出屏，取 3 留一档余量。
const OFFSCREEN_DELTA = 3

// 卡片宽度由容器实测宽度算出，不用断点类名：3D 舞台的横向占位是卡宽的倍数，
// 交给 CSS 断点会在中间尺寸上失控。
// 桌面要并排放下五张（当前卡 + 左右各两张），卡宽必须比三张时收一档，否则最外侧那对
// 会被挤到轨道边缘、被淡出遮罩吃掉。窄屏本来就只露得出三张，维持原尺寸。
const geometry = (width: number) => {
  if (width < 640) return { cardW: clamp(width * 0.72, 232, 300) }
  if (width < 1024) return { cardW: clamp(width * 0.4, 272, 330) }
  return { cardW: clamp(width * 0.24, 288, 336) }
}

/**
 * 3D 舞台：按「离当前卡第几张」给出位置、转角、缩放和暗面强度。
 *
 * 一屏留五张：当前卡加左右各两张，第三张起淡出。
 *
 * x 是卡宽的倍数，z 是像素。转角比参考站的 45° 收敛：深色底能撑住大角度，
 * 浅色底上白卡一旦转过 45°，正面几乎没有明暗差，只剩一块变形的白。
 *
 * dim 是叠在卡面上的暗色强度。这是浅色方案能不能立住的关键——面转开就该变暗，
 * 不加这一层，倾斜的白卡在米白底上会糊在一起，完全分不出前后。
 *
 * dim 的数值在卡面改成玻璃后重调过一轮：玻璃卡本身读起来就比实心白卡暗一档，
 * 沿用实心时代的 0.16 / 0.26 / 0.32 会把侧卡压成灰片。
 *
 * 每一档的 x 要让本档卡的内边缘落在上一档卡的外边缘之外，否则会被压住只剩一条。
 * 透视会把远处的卡往中间拉（z 越负拉得越多），所以 x 的增量必须比「看上去需要的」更大，
 * 这几个值是逐档实测投影边界调出来的，不是等差数列。
 *
 * 性能实测（2026-08-13，1440×900 Chrome，rAF 连续采样 10 秒）：12 张玻璃卡同屏自动播放，
 * 未节流平均 216fps、p99 12.6ms、无超 33ms 的帧；6 倍 CPU 节流下平均 193fps、p99 20.8ms、
 * 超 33ms 的帧占 0.36%。远高于 50fps 门槛，因此没有做「只给可见卡开 backdrop-filter」的降级。
 * 注意这组数据不能用来判断低端安卓：backdrop-filter 的开销主要在 GPU，CPU 节流模拟不了弱 GPU，
 * 那一侧仍然只靠 glass-* 里的 prefers-reduced-transparency 回退兜底。
 */
const STAGE = [
  { x: 0, z: 0, rotate: 0, scale: 1, dim: 0, opacity: 1 },
  { x: 0.97, z: -150, rotate: 36, scale: 0.9, dim: 0.1, opacity: 1 },
  { x: 1.71, z: -260, rotate: 40, scale: 0.84, dim: 0.17, opacity: 1 },
  { x: 2.35, z: -400, rotate: 46, scale: 0.76, dim: 0.22, opacity: 0 },
]

const stageFor = (delta: number, cardW: number) => {
  const distance = Math.min(Math.abs(delta), STAGE.length - 1)
  const side = Math.sign(delta)
  const stage = STAGE[distance]
  return {
    // 右侧的卡转正角：rotateY(+θ) 把右边缘推向远处，卡面朝内翻，和参考站量到的一致
    x: side * stage.x * cardW,
    z: stage.z,
    rotateY: side * stage.rotate,
    scale: stage.scale,
    opacity: stage.opacity,
    dim: stage.dim,
  }
}

// 淡的是卡片里的内容，不是卡片本身：整张卡一起淡下去会连纸面也化掉，
// 只剩线条和文字浮在背景上；纸面留着，一排卡才立得住。
const contentOpacityFor = (distance: number) =>
  distance === 0 ? 1 : distance === 1 ? 0.92 : distance === 2 ? 0.8 : 0.4

const TRANSITION = { duration: 0.62, ease: [0.22, 1, 0.26, 1] as const }

/**
 * 入场展开：滚到板块之前，所有卡重合在正中心（x 全为 0、不转角、略微缩小、透明）；
 * 滚进视口后按「离当前卡第几张」逐档延迟摊开，做出摊牌的层次感，而不是十二张一起亮。
 *
 * 只有 distance ≤ 2 的卡在舞台上可见（第三档 opacity 为 0），所以延迟只需覆盖三档。
 */
const UNFOLD = { duration: 0.78, ease: [0.16, 1, 0.3, 1] as const }
/** 轨道露出这么多就开始展开；跌回完全不可见才收回折叠态 */
const UNFOLD_ENTER_RATIO = 0.25
const UNFOLD_STEP_MS = 90
const FOLDED = { x: 0, z: -260, rotateY: 0, scale: 0.88, opacity: 0 }
// 最后一档起步时间 + 单张时长：过了它才把控制权交还给轮播，免得展开途中就被自动播放推走
const UNFOLD_TOTAL_MS = UNFOLD.duration * 1000 + UNFOLD_STEP_MS * (STAGE.length - 1)

/** 每张停留时长。当前卡上只有一句钩子加三条要点，读完约 4 秒 */
const AUTOPLAY_MS = 4500

export const ServiceTypes = () => {
  const reduce = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // 当前项和上一个当前项一起放进 state：判断某张卡这一步是「移动」还是「绕到队伍另一头」
  // 需要拿到上一次的位置，而这个判断发生在渲染期间，用 ref 存会在渲染中读 ref。
  //
  // 从正中间那张起步：落在第一张时左半边是空的，一排卡看着像被推到了左边，
  // 也不容易看出来左右都还有内容。
  const [nav, setNav] = useState(() => {
    const middle = Math.floor(COUNT / 2)
    return { active: middle, prev: middle }
  })
  const { active, prev: prevActive } = nav
  const [width, setWidth] = useState(0)

  // 自动播放的四个刹车：还没展开完、滚出视口、指针停在板块内、用户已经自己翻过
  const [inView, setInView] = useState(false)
  const [pointerInside, setPointerInside] = useState(false)
  const [userTookOver, setUserTookOver] = useState(false)
  // idle=折叠态 → unfolding=正在展开 → live=交给轮播。轨道滚出视野会退回 idle，下次经过重播
  const [phase, setPhase] = useState<'idle' | 'unfolding' | 'live'>('idle')
  const autoplay = !reduce && phase === 'live' && inView && !pointerInside && !userTookOver

  // 宽度实测：容器是整屏宽，断点数值猜不准，尤其是有滚动条和缩放的时候
  useEffect(() => {
    const node = trackRef.current
    if (!node) return
    const update = () => setWidth(node.getBoundingClientRect().width)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const node = sectionRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      threshold: 0.3,
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // 展开的触发点盯轨道，不盯板块：板块还含标题和上下留白，按板块算比例会在卡片
  // 一点没露头时就先摊开，动作全发生在屏幕外。露出四分之一条轨道再展开，
  // 正好是卡片顶边进入视野的时刻。
  //
  // 上下滚动每次经过都要重播，所以轨道完全离开视野时把状态收回折叠态。进出用两条不同的
  // 线（进 0.25、出 0）是为了留出滞后区：同一条线上来回会在边界反复触发，卡片抖成一团。
  useEffect(() => {
    const node = trackRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio >= UNFOLD_ENTER_RATIO) {
          setPhase((current) => (current === 'idle' ? 'unfolding' : current))
        } else if (!entry.isIntersecting) {
          setPhase('idle')
        }
      },
      { threshold: [0, UNFOLD_ENTER_RATIO] },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  // 展开跑完再把控制权交给轮播，否则第一张会在摊开途中就被自动播放推走。
  // 这个定时器必须单独放一个 effect：和上面的触发写在一起会自毁——setPhase('unfolding')
  // 让那个 effect 重跑，清理函数把刚设的定时器清掉，之后又被 guard 挡住不再重设
  useEffect(() => {
    if (phase !== 'unfolding') return
    const timer = setTimeout(() => setPhase('live'), UNFOLD_TOTAL_MS)
    return () => clearTimeout(timer)
  }, [phase])

  // 每张一个 setTimeout 而不是 setInterval：依赖 active 重建，
  // 手动翻过去之后也能拿到完整停留时长，不会刚翻到就被推走
  useEffect(() => {
    if (!autoplay) return
    const timer = setTimeout(
      () => setNav((current) => ({ active: (current.active + 1) % COUNT, prev: current.active })),
      AUTOPLAY_MS,
    )
    return () => clearTimeout(timer)
  }, [autoplay, active])

  const goTo = useCallback((index: number) => {
    setUserTookOver(true)
    setNav((current) => ({ active: clamp(index, 0, LAST_INDEX), prev: current.active }))
  }, [])

  const step = useCallback((delta: number) => {
    setUserTookOver(true)
    setNav((current) => ({
      active: ((current.active + delta) % COUNT + COUNT) % COUNT,
      prev: current.active,
    }))
  }, [])

  // 位移和甩动速度任取其一达标就翻页：慢慢拖过半张要认，快速一甩也要认
  const handleDragEnd = (_event: unknown, info: PanInfo) => {
    const distance = info.offset.x
    const velocity = info.velocity.x
    const threshold = width < 640 ? 36 : 56
    if (distance > threshold || velocity > 500) step(-1)
    else if (distance < -threshold || velocity < -500) step(1)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      step(-1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      step(1)
    }
  }

  const { cardW } = geometry(width || 1200)
  // 比原先的 1.24 更竖长，接近参考站 450×660 的比例：3D 舞台上矮胖的卡转起来像牌，
  // 竖长的才像一块板
  const cardH = Math.round(cardW * 1.4)
  const ready = width > 0
  const folded = phase === 'idle'

  return (
    <section
      ref={sectionRef}
      id="services"
      onMouseEnter={() => setPointerInside(true)}
      onMouseLeave={() => setPointerInside(false)}
      className="w-full py-20 sm:py-28"
    >
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* once=false：卡片每次经过都重播，标题跟着一起，不然滚回来只有卡片在动 */}
        <Reveal once={false}>
          <SectionHeading eyebrow="Services" title="我们做过的软件类型" />
        </Reveal>
      </div>

      <div className="relative mt-12 w-full sm:mt-14">
      <div
        ref={trackRef}
        role="group"
        aria-roledescription="轮播"
        aria-label="软件类型"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className="relative w-full overflow-hidden transition-opacity duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
        style={{
          height: cardH + 56,
          opacity: ready ? 1 : 0,
          // 这里曾经挂过 maskImage 做左右淡出，已移除，不要加回来：
          // mask 会创建 backdrop root，导致轨道内部所有元素的 backdrop-filter 全部失效，
          // 十二张玻璃卡会一起变成普通半透明色块。实测过同一配置仅差 mask，结果截然不同。
          // 淡出改由父层的两块渐变覆盖层实现，见轨道之后的两块渐变覆盖层。
          //
          // 透视点放在这一层，十二张卡共用同一个灭点；若逐卡写 transformPerspective，
          // 每张会有各自的灭点，一排卡的透视方向就对不上了
          perspective: 1500,
        }}
      >
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.16}
          onDragStart={() => setUserTookOver(true)}
          onDragEnd={handleDragEnd}
          className="relative h-full w-full cursor-grab active:cursor-grabbing"
          // preserve-3d 是为了让上一层的 perspective 穿透到孙节点的卡片上；
          // 缺了它，卡片的 rotateY 会被拍平成一次纯粹的横向压扁
          style={{ touchAction: 'pan-y', transformStyle: 'preserve-3d' }}
        >
          {SERVICES.map((service, index) => {
            const delta = wrappedDelta(index, active)
            const distance = Math.abs(delta)
            const isActive = index === active
            const theme = THEMES[service.theme]
            // 这一步是绕场换位（比如从队尾跳到队首）就不要动画，直接落位
            const teleports =
              distance >= OFFSCREEN_DELTA &&
              Math.abs(wrappedDelta(index, prevActive)) >= OFFSCREEN_DELTA
            const stage = stageFor(delta, cardW)
            const hidden = stage.opacity === 0

            return (
              <motion.div
                key={service.code}
                role={isActive ? 'group' : 'button'}
                tabIndex={isActive ? -1 : 0}
                aria-label={isActive ? service.title : `查看 ${service.title}`}
                aria-hidden={hidden ? true : undefined}
                onClick={() => !isActive && goTo(index)}
                onKeyDown={(event) => {
                  if (isActive || (event.key !== 'Enter' && event.key !== ' ')) return
                  event.preventDefault()
                  event.stopPropagation()
                  goTo(index)
                }}
                animate={
                  folded
                    ? FOLDED
                    : {
                        x: stage.x,
                        z: stage.z,
                        rotateY: stage.rotateY,
                        scale: stage.scale,
                        opacity: stage.opacity,
                      }
                }
                // 收回折叠态发生在轨道完全滚出视野之后，直接落位就行，没人看得见；
                // 展开这一步的判断则要排在 teleports 之前——外侧卡在展开时也满足
                // 「换位前后都在视野外」，走那条分支会被判成绕场换位、直接落位，
                // 逐档摊开的层次就没了
                //
                // hidden 这一档是性能修复：opacity 为 0 的卡（distance ≥ 3，12 张里占 7 张）
                // 直接落位，不参与补间。它们本来就看不见，动不动没有任何视觉差别，
                // 但每一张参与补间的 motion 组件都会让 framer-motion 的 projection 系统
                // 每帧调一次 measureScroll 去读几何属性，而此时样式已被动画作废，
                // 于是触发强制同步布局。6 倍 CPU 节流下实测：滚入并展开这一段累计
                // 强制重排 434ms，伴随 461/409/344ms 三个超长帧——就是那种「顿一下」的观感。
                // 把同时补间的卡从 12 张压到 5 张，是这条链路上收益最大、改动最小的一刀。
                // hidden 必须排在 unfolding 之前：展开正是最卡的一段，而那 7 张隐藏卡
                // 起点（FOLDED.opacity 0）与终点（stage.opacity 0）都不可见，
                // 让它们参与逐档摊开毫无视觉收益，只是白白多 7 份重排。
                transition={
                  reduce || folded || hidden
                    ? { duration: 0 }
                    : phase === 'unfolding'
                      ? { ...UNFOLD, delay: (distance * UNFOLD_STEP_MS) / 1000 }
                      : teleports
                        ? { duration: 0 }
                        : TRANSITION
                }
                style={{
                  width: cardW,
                  height: cardH,
                  marginLeft: -cardW / 2,
                  zIndex: 50 - distance,
                  transformStyle: 'preserve-3d',
                  // 隐藏的卡不能再吃点击：它就压在可见卡的正后方
                  pointerEvents: hidden ? 'none' : undefined,
                }}
                // 这一层只负责轮播位姿，卡面样式全在里层：悬停反馈交给 CSS，
                // 才不会被这里 620ms 的轮播缓动拖成一坨钝响应
                className="absolute left-1/2 top-7 select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                {/* 卡面走 glass-thin，自带一道 1px 白描边作为玻璃厚度的体现——这与改造前
                    「不描线」的判断不同，因为当时卡面是纸白实心、描线只会显碎，现在描线是
                    玻璃质感的一部分。近乎直角：与本页「合作流程」的面板同一套规格。
                    悬停用纯 CSS。侧卡放得比中心卡明显得多——它是可点的，要请人点；
                    中心卡没有可点的动作，跟着放大只是「活」的反馈，所以留一档差值。
                    放大幅度受轨道高度约束：轨道只比卡高 56px，1.09 已经吃掉大半余量，再大就会被裁 */}
                <div
                  className={[
                    'group/card glass-thin relative flex h-full w-full flex-col overflow-hidden rounded-[3px] p-5 sm:p-6',
                    'transition-transform duration-300 ease-out',
                    isActive ? 'hover:scale-[1.04]' : 'cursor-pointer hover:scale-[1.09]',
                  ].join(' ')}
                >
                {/* 品牌色只作为卡片顶部的一层薄染，到文字区之前退成纸白，不额外套一层面板 */}
                <motion.span
                  aria-hidden
                  animate={{ opacity: isActive ? 1 : 0.45 }}
                  transition={reduce ? { duration: 0 } : TRANSITION}
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: `linear-gradient(172deg, rgb(${theme.rgb} / 0.14) 0%, rgb(${theme.rgb} / 0.04) 45%, rgb(${theme.rgb} / 0) 72%)`,
                  }}
                />

                <motion.div
                  animate={{ opacity: contentOpacityFor(distance) }}
                  transition={reduce ? { duration: 0 } : TRANSITION}
                  className="relative flex h-full flex-col"
                >
                  <div className="flex min-h-0 flex-1 items-center justify-center px-1 text-graphite-dim">
                    <ServiceArtwork code={service.code} accent={theme.hex} />
                  </div>

                  <h3 className="pt-4 text-[16.5px] font-semibold leading-snug tracking-[-0.01em] text-graphite sm:text-[17.5px]">
                    {service.title}
                  </h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-graphite-soft">
                    {service.hook}
                  </p>
                  <ul className="mt-3.5 flex flex-col gap-1.5 border-t border-rule pt-3.5">
                    {service.points.map((point) => (
                      <li
                        key={point}
                        className="flex items-start gap-2 text-[12.5px] leading-relaxed text-graphite-dim"
                      >
                        <span
                          aria-hidden
                          className="mt-[7px] h-1 w-1 shrink-0 rounded-full"
                          style={{ backgroundColor: theme.hex, opacity: 0.6 }}
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {/* 暗面：卡面转开多少就压暗多少，模拟受光。压在内容之上而不是之下，
                    否则文字仍然是纯黑、只有纸面变暗，看着像蒙了层脏东西。
                    悬停时收掉大半，等于「这一面转回来朝向你了」。

                    颜色是中灰而不是近黑：卡面改成玻璃之后，近黑蒙层叠在半透明面上
                    会把透上来的底光一起压死，侧卡看起来像蒙了灰。中灰蒙层压的是
                    明度、留得住色相，转开的面仍然带着底光的调子。

                    原值是偏蓝的冷灰 rgb(108 118 138)，配的是那一版的冷色光域；
                    光域换成红黄蓝之后冷灰不再配套，且它本身带蓝相，违反「三色之外不用彩色」，
                    因此收敛到与 paper 同族的中性灰。 */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 transition-opacity duration-300 ease-out group-hover/card:opacity-[var(--dim-hover)]"
                  style={
                    {
                      backgroundColor: 'rgb(118 118 112)',
                      opacity: 'var(--dim)',
                      '--dim': stage.dim,
                      '--dim-hover': stage.dim * 0.3,
                    } as React.CSSProperties
                  }
                />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>

      {/* 左右淡出。原先是轨道上的 maskImage，因为会废掉内部的 backdrop-filter 而改成
          覆盖层。z-index 必须高过卡片（卡片是 50 - distance，最高 50），否则盖不住。
          宽度取 8%：再宽会把最外侧那对卡整个吃掉，也会在底部光域上压出一条可见的
          米白带 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-[60] w-[8%] bg-gradient-to-r from-paper to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-[60] w-[8%] bg-gradient-to-l from-paper to-transparent"
      />

      {/* 箭头贴着侧卡外缘、垂直居中，是转盘的读法。
          z-[70] 必须高于淡出覆盖层的 z-[60]：两者在同一层叠上下文里，不抬高的话
          覆盖层会绘制在按钮之上，1280px 以下整颗钮会被那层 paper 渐变糊掉。
          循环之后位置刻度没有意义——没有第一张也没有最后一张，所以只留翻动方向，不做圆点 */}
      {/* 容器比版心（max-w-6xl）宽一档：舞台摊到五张后外缘已经超出版心，
          按版心摆箭头会正好压在最外侧那对卡上。1280 以下仍会轻微相叠——
          那个宽度下五张卡加两侧箭头本来就排不开，而被叠住的是最暗、最不吃重的一张 */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 z-[70] flex w-full max-w-7xl -translate-x-1/2 items-center justify-between px-3 sm:px-6">
        <PagerButton label="上一类" onClick={() => step(-1)}>
          <path d="M10 3 L5 8 L10 13" />
        </PagerButton>
        <PagerButton label="下一类" onClick={() => step(1)}>
          <path d="M6 3 L11 8 L6 13" />
        </PagerButton>
      </div>
      </div>
    </section>
  )
}

const PagerButton = ({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) => (
  <button
    type="button"
    aria-label={label}
    onClick={onClick}
    // pointer-events-auto 抵消父层的 none：父层铺满整个舞台，不关掉指针会挡住卡片的点击
    className="glass-medium pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-btn text-graphite-soft transition-colors duration-200 hover:bg-white/75 hover:text-graphite focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
  >
    <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  </button>
)
