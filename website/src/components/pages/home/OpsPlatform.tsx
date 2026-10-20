'use client'

import { motion, useReducedMotion, type PanInfo } from 'framer-motion'
import { useEffect, useState } from 'react'

import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui'
import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import { EN_OPS_SCREENS } from './home.en'

import { OPS_SCREENS as ZH_OPS_SCREENS, OPS_SHOT_FRAME, OPS_SHOT_HEIGHT, OPS_SHOT_WIDTH } from './ops-data'

/**
 * 「我们的维保优势」：一列向右后方排开的屏幕，最前面那块正对着看。
 *
 * 这一节不讲道理只给实物，因此整节没有任何分项文案——一屏几十个项目的存活、
 * 每 30 秒一轮的巡检输出、告警的处理时间线、按错误签名归一的异常聚类，
 * 这些东西写成排比句没人信，把界面摆出来才有分量。
 *
 * 与首页「软件类型」那套 3D 轮播的分工：那边是双侧对称摊牌，卡上是文字；
 * 这边是单侧队列，摆的是产品截图，主屏必须够大够清楚。两者共用透视语言，
 * 但构图与内容不重叠，不会读成同一个组件出现两次。
 */

/**
 * 队列各档的位姿。distance 是「离主屏第几位」。
 *
 * x 是主屏宽度的倍数（framer-motion 的 x 传百分比即相对元素自身宽度，
 * 因此不需要测量像素，容器怎么伸缩都对）。z 是像素，透视灭点在容器上。
 *
 * 三件事同时在拉开前后：位移、缩放、模糊。截图是深色的，转开之后不像浅色卡那样自然变暗，
 * 光靠位移与缩放前后会糊在一起；模糊是这里区分层次的主力，顺带把远处那些
 * 密密麻麻的小字压成色块——不模糊的话，缩到三成大的表格会变成一片摩尔纹噪点。
 *
 * 最后一档 opacity 为 0：四张图循环时，主屏往前翻会绕回队尾，
 * 让这一步发生在看不见的位置，就不会看到一块屏幕凭空出现在队伍最后。
 * 代价是画面上只有「主屏 + 两块」，这是四张图循环能给到的最干净的形态。
 */
const STAGE = [
  { x: 0, z: 0, rotate: 0, scale: 1, blur: 0, opacity: 1 },
  { x: 0.98, z: -180, rotate: 32, scale: 0.88, blur: 0.8, opacity: 1 },
  { x: 1.6, z: -340, rotate: 37, scale: 0.78, blur: 1.6, opacity: 0.62 },
  { x: 2.1, z: -500, rotate: 41, scale: 0.7, blur: 5, opacity: 0 },
]

/**
 * 主屏占舞台宽度的比例，以及主屏中心落在舞台的横向哪一处。
 *
 * 这两个数是一起定的，定的依据是「档 1、档 2 不能被压成一条」：
 * 每一档转开之后的投影半宽 ≈ 0.5·scale·cos(rotate)，再乘透视收缩 1400/(1400+|z|)；
 * 下一档的中心必须落在上一档投影外缘之外，x 才排得开。按上面那组位姿倒推，
 * 档 2 的外缘正好落在舞台右缘，于是主屏中心只能压到 36%——再往右，队列就出界了。
 *
 * 主屏因此不在正中。这是队列构图的必然结果：一列屏往右后方排开，
 * 重心本来就该偏左，摆正中反而会把整节的墨色全堆到右半边。
 */
const MAIN_RATIO = 0.48
const MAIN_CENTER = 0.36

/** 容器宽高比：主屏铺满高度，容器宽是主屏宽的 1/MAIN_RATIO */
const STAGE_ASPECT = (OPS_SHOT_WIDTH / OPS_SHOT_HEIGHT) / MAIN_RATIO

/** 窄屏截图的呈现宽度。1760px 的控制台压进手机屏是 0.22 倍，字全糊；880px 是仍可辨认的下限 */
const COMPACT_SHOT_WIDTH = 880

const TRANSITION = { duration: 0.62, ease: [0.22, 1, 0.26, 1] as const }

/** 拖动超过这个距离才翻页，避免轻微横向抖动就切走 */
const DRAG_THRESHOLD = 60

const COUNT = ZH_OPS_SCREENS.length

export const OpsPlatform = () => {
  const { locale, copy } = useSiteLocale()
  const OPS_SCREENS = locale === 'en' ? ZH_OPS_SCREENS.map((screen) => ({ ...screen, ...EN_OPS_SCREENS[screen.id] })) : ZH_OPS_SCREENS
  const reduce = useReducedMotion()

  // 当前项与上一个当前项一起存：判断某块屏这一步是「在队列里前移」还是「绕回队尾」，
  // 需要拿到上一次的位次，而这个判断发生在渲染期间，用 ref 存会变成渲染中读 ref
  const [nav, setNav] = useState({ active: 0, prev: 0 })
  const { active, prev } = nav

  /**
   * 3D 队列只在桌面成立：窄屏主屏本身才三百多像素，右边根本排不下队列。
   * 用 matchMedia 在 JS 里分叉而不是靠 CSS 隐藏，是因为两种形态的 DOM 结构本就不同
   * （一个是透视舞台，一个是横向滚动的单图），用 CSS 硬凑只会两边都别扭。
   *
   * SSR 与首帧一律按窄屏渲染。这一节在首页最底部，滚到时早已 hydrate 完，看不到切换。
   */
  const [wide, setWide] = useState(false)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)')
    const sync = () => setWide(query.matches)
    sync()
    query.addEventListener('change', sync)
    return () => query.removeEventListener('change', sync)
  }, [])

  const goTo = (next: number) =>
    setNav((current) => ({ active: (next + COUNT) % COUNT, prev: current.active }))

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -DRAG_THRESHOLD) goTo(active + 1)
    else if (info.offset.x > DRAG_THRESHOLD) goTo(active - 1)
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      goTo(active + 1)
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goTo(active - 1)
    }
  }

  // 版心开在 section 里面而不是 section 上：标题跟着全站的 72rem 走，
  // 舞台要更宽——队列排在主屏右后方，版心那点宽度装不下两档还不把主屏压小
  return (
    <section id="ops-platform" className="w-full px-4 py-20 sm:px-6 sm:py-28">
      {/* once=false 与本页其余板块一致：滚回来时标题重播 */}
      <Reveal once={false} className="mx-auto w-full max-w-6xl">
        {/* text-wrap 是可继承属性，挂在外层容器上即可传到里面的标题与描述：
            这句副标题正好比一行长一点，不平衡时末行只剩「信任的基石。」孤零零一撮 */}
        <SectionHeading
          className="text-balance"
          eyebrow="Ops platform"
          title={copy.ops}
          description={copy.opsDescription}
        />
      </Reveal>

      <Reveal once={false} className="mx-auto mt-12 w-full max-w-[1400px] sm:mt-16">
        {wide ? (
          <div
            role="group"
            aria-roledescription={copy.carousel}
            aria-label={copy.opsGroup}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="relative w-full overflow-hidden focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
            style={{
              aspectRatio: `${STAGE_ASPECT}`,
              // 透视点放在这一层，四块屏共用同一个灭点；逐块写 transformPerspective
              // 会让每块有各自的灭点，一列屏的透视方向就对不上了
              perspective: 1400,
            }}
          >
            <motion.div
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.14}
              onDragEnd={handleDragEnd}
              className="relative h-full w-full cursor-grab active:cursor-grabbing"
              // preserve-3d 让上一层的 perspective 穿透到孙节点；缺了它，
              // rotateY 会被拍平成一次纯粹的横向压扁
              style={{ touchAction: 'pan-y', transformStyle: 'preserve-3d' }}
            >
              {OPS_SCREENS.map((screen, index) => {
                // 单侧队列：位次一律取非负值，谁都排在主屏右后方，不会跑到左边去
                const distance = (index - active + COUNT) % COUNT
                const stage = STAGE[distance]
                const isActive = distance === 0
                const hidden = stage.opacity === 0
                // 绕回队尾这一步的起点和终点都在看不见的那一档，直接落位不做补间
                const teleports =
                  hidden && STAGE[(index - prev + COUNT) % COUNT].opacity === 0

                return (
                  <motion.div
                    key={screen.id}
                    aria-hidden={isActive ? undefined : true}
                    animate={{
                      x: `${stage.x * 100}%`,
                      z: stage.z,
                      rotateY: stage.rotate,
                      scale: stage.scale,
                      opacity: stage.opacity,
                    }}
                    transition={reduce || hidden || teleports ? { duration: 0 } : TRANSITION}
                    className="absolute top-0 h-full rounded-card p-1.5 shadow-soft-lg"
                    style={{
                      // 负 margin 居中而不是 translateX(-50%)：transform 整条留给 motion，
                      // 两边都写 transform 会互相覆盖
                      left: `${MAIN_CENTER * 100}%`,
                      width: `${MAIN_RATIO * 100}%`,
                      marginLeft: `${(-MAIN_RATIO * 100) / 2}%`,
                      backgroundColor: OPS_SHOT_FRAME,
                      // 一道朝内的亮边。相邻两块屏都是深色，紧挨着时会读成一条长物；
                      // 这道 1px 高光把每块的轮廓咬出来，是它们各自成形的唯一依据
                      boxShadow: 'inset 0 0 0 1px rgb(255 255 255 / 0.1)',
                      // 队列里的屏朝内翻，背面永远不该露出来
                      backfaceVisibility: 'hidden',
                      filter: stage.blur > 0 ? `blur(${stage.blur}px)` : undefined,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    {/* alt 恒定：队列里那几块屏由外层的 aria-hidden 挡住，读屏只会念到当前这块 */}
                    <img
                      src={screen.src}
                      alt={screen.alt}
                      width={OPS_SHOT_WIDTH}
                      height={OPS_SHOT_HEIGHT}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="block h-full w-full select-none"
                    />
                  </motion.div>
                )
              })}

              {/**
               * 队列的点击热区。
               *
               * 不把点击挂在队列那几块屏上，是因为挂了也没用：Chrome 里带 rotateY 的元素
               * 收不到指针事件，实测在整块舞台上逐点探测，转开的屏一个命中点都没有
               * （首页「软件类型」那套 3D 轮播也是同一回事，侧卡的 onClick 实际是空的）。
               * 与其留一个看着能点、按下去没反应的假交互，不如叠一块平的热区：
               * 它没有 transform，命中测试正常，语义也更直白——点后面那堆屏，队伍往前走一位。
               *
               * 放在拖拽层内部而不是舞台上：drag 的 pointerdown 靠冒泡拿到，
               * 热区盖住的这片区域仍然可以起手拖。
               */}
              <button
                type="button"
                aria-label={copy.nextScreen}
                onClick={() => goTo(active + 1)}
                className="absolute inset-y-0 right-0 z-10 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue"
                style={{ left: `${(MAIN_CENTER + MAIN_RATIO / 2) * 100}%` }}
              />
            </motion.div>

            {/* 队列末端渐隐。舞台是 overflow-hidden，最远那块会被右缘齐刷刷切一刀，
                切口是条垂直硬边，把「一列屏往深处排下去」读成「一张图被裁了」。
                这里用一层纸色渐变把它化掉，而不是用 mask——mask 会创建 backdrop root，
                本节虽然没有 backdrop-filter，但沿用站内既有的处理方式更安全。 */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 w-[7%] bg-gradient-to-l from-paper to-transparent"
            />
          </div>
        ) : (
          /* 窄屏：不做队列，主屏原尺寸横向滚动。缩到手机宽度的截图只剩噪点，
             那就不再是「实物」而是一块脏东西 */
          <div className="relative">
            <div
              className="overflow-x-auto rounded-card p-1.5 shadow-soft-lg"
              style={{ backgroundColor: OPS_SHOT_FRAME }}
            >
              <div
                className="relative"
                style={{
                  width: COMPACT_SHOT_WIDTH,
                  aspectRatio: `${OPS_SHOT_WIDTH} / ${OPS_SHOT_HEIGHT}`,
                }}
              >
                {OPS_SCREENS.map((screen, index) => (
                  <img
                    key={screen.id}
                    src={screen.src}
                    alt={screen.alt}
                    width={OPS_SHOT_WIDTH}
                    height={OPS_SHOT_HEIGHT}
                    loading="lazy"
                    decoding="async"
                    aria-hidden={index !== active}
                    className={`absolute inset-0 block h-full w-full transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                      index === active ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* 右缘压暗，暗示图还没到头。移动端的滚动条是浮动的，不滑一下看不出这里能滑；
                与其加一行「横向滑动查看」的说明，不如让画面自己说——整节没有一句多余的字。
                挂在滚动容器外面：跟着容器的可视区走，不会被内容一起推到很远的右端。 */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-1.5 right-1.5 w-12"
              style={{
                backgroundImage: `linear-gradient(to left, ${OPS_SHOT_FRAME}, transparent)`,
              }}
            />
          </div>
        )}

        {/* 序号与翻页。刻意不写页面名——整节的主张是「看界面，不看说明」，
            一排标签会把注意力从画面上拽走；名字留在每张图的 alt 与按钮的 aria-label 里，
            读屏与搜索引擎都拿得到 */}
        {/* 桌面上这一行对齐主屏中心而不是版心中心：舞台的重心本来就随队列偏左，
            序号摆在版心正中会飘在主屏与队列之间的缝上，看着不知道在标注谁 */}
        <div
          className="mt-6 flex w-max items-center gap-4 sm:mt-7"
          style={
            wide
              ? { marginLeft: `${MAIN_CENTER * 100}%`, transform: 'translateX(-50%)' }
              : { marginLeft: 'auto', marginRight: 'auto' }
          }
        >
          <span className="font-mono text-[12px] tracking-[0.14em] text-graphite-dim">
            {String(active + 1).padStart(2, '0')}
            <span className="mx-1.5 text-graphite-dim/60">—</span>
            {String(COUNT).padStart(2, '0')}
          </span>

          <span aria-hidden className="h-px w-8 bg-rule-strong" />

          <div className="flex items-center gap-1">
            {OPS_SCREENS.map((screen, index) => (
              <button
                key={screen.id}
                type="button"
                aria-label={`${copy.view} ${screen.label}`}
                aria-current={index === active}
                onClick={() => goTo(index)}
                // 命中区做到 32×32，指示条本身只有 6px 高——手指点得到，眼睛看到的仍是一枚小记号
                className="group flex h-8 w-8 items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
              >
                <span
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out motion-reduce:transition-none ${
                    index === active
                      ? 'w-5 bg-blue'
                      : 'w-1.5 bg-graphite-dim/35 group-hover:bg-graphite-dim'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
