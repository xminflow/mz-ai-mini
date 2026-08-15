'use client'

import { motion, useReducedMotion } from 'framer-motion'

import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui'

import { ADVANTAGES } from './advantage-data'

/**
 * 「我们与其他定制商的不同」：八个问题，两种答案。
 *
 * 版面的全部主张压在一条中轴上——一条贯穿整节的竖线把两方分成阵营，
 * 左边的行规被一条红线整句划掉，右边每答一条就在轴上点亮一段蓝。
 * 红与蓝是全站仅有的两支功能色，用在语义最强的地方：红＝被否决，蓝＝我们。
 * 全站没有第二处用删除线，这是这个板块被记住的那一件事。
 *
 * 几个刻意的决定：
 * - 没有 01-08 编号。这八条不是流程、没有先后，编号会是假的结构信号。
 * - 问句与被划掉的答案同属左块、上下叠放，不给问句单独开一栏。
 *   单开一栏试过：问句左对齐、被划掉的短句右对齐贴轴，中间空出一条一百多像素的带子，
 *   问句就悬在那片空档里。叠放之后左右各自成型，隔轴相对。
 * - 桌面上没有横向分隔线，行与行只靠留白分开。横线一多就变回表格，
 *   而这一节要的是「两个阵营隔轴对峙」。唯一的两条横线在顶（阵营标签下）和底（收口），
 *   与竖轴合成一个封闭的坐标。
 *
 * 性能：整节没有 backdrop-filter、没有 3D、没有自动播放，动的只有轴上那段蓝的
 * scaleY 与整行的 Reveal，都是纯 transform。首页已有 3D 轮播与七步手风琴两套重交互，
 * 这里不能再加第三套。
 */

/**
 * 两栏骨架。阵营标签、正文行、底部收口共用，改一处必须三处一起改，否则轴会歪。
 *
 * 比例是按「两侧留白对称」倒推的，不是随手取的整数：左块最长一行约 207px，右块正文
 * 用 OURS_MAX 卡在 31rem。在版心 72rem 下，左栏留白（左栏宽 - 207）与右栏留白
 * （右栏宽 - 内边距 - 31rem）大致相等，整节的墨色才落在版心中线上。
 * 改这里的任一个数，另一个要跟着重算，否则整节会往一边偏。
 */
const GRID = 'lg:grid lg:grid-cols-[0.35fr_0.65fr] lg:gap-x-12'

/** 右块正文宽度上限。同时管着行长（约 34 个汉字一行）和上面那笔留白对称的账 */
const OURS_MAX = 'lg:max-w-[31rem]'

/**
 * 右块（我们的答案）在桌面上的内边距。
 *
 * 内边距必须挂在这一列自身而不是行容器上：中轴是它的 border-left，
 * 只有当这段 padding 也属于该列时，轴才会连着上下两行、不断成一截一截。
 *
 * 上下不等是为了对齐基线——左块开头是 23px 的问句，右块开头是 14.5px 的正文，
 * 同样 pt 时右块会浮在问句上方。轴上那段蓝的 top/bottom 与这里一一对应，改动时要一起改。
 */
const OURS_PAD = 'lg:pt-11 lg:pb-10'

export const Advantages = () => {
  const reduce = useReducedMotion()

  return (
    <section id="advantages" className="mx-auto w-full max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
      {/* once=false 与本页其余板块一致：滚回来时标题重播，不然只有下面的行在动 */}
      <Reveal once={false}>
        <SectionHeading
          eyebrow="Why us"
          title="我们与其他定制商的不同"
        />
      </Reveal>

      {/* 阵营标签只在桌面出现：窄屏是上下堆叠，一行标签对不上任何一列。
          两个标签都贴着中轴、隔轴相对——它们标的是轴两侧的阵营，不是某一栏文字，
          所以左边这个要右对齐。它底下这条横线同时是中轴的起点。 */}
      <div className={`mt-12 hidden border-b border-rule pb-4 sm:mt-16 ${GRID}`}>
        <span className="text-right text-[12px] tracking-[0.16em] text-graphite-dim">常见做法</span>
        {/* pl-12 与右块的 border-left + pl-12 对齐 */}
        <span className="pl-12 text-[12px] font-medium tracking-[0.16em] text-graphite">
          微域生光
        </span>
      </div>

      {/* 窄屏没有中轴，改回逐行横线分隔，因此列表底部要自己收口；桌面的收口是下面那条 border-t */}
      <div role="list" className="mt-12 border-b border-rule sm:mt-16 lg:mt-0 lg:border-b-0">
        {ADVANTAGES.map((item) => (
          <Reveal
            key={item.question}
            role="listitem"
            y={16}
            className={`group border-t border-rule py-8 lg:border-t-0 lg:py-0 ${GRID}`}
          >
            {/* 左块：问句领起，行规的答案紧随其下被划掉。
                桌面整体右对齐——左块最长也就二十来字，左对齐时它与中轴之间会空出两百多像素，
                轴看着不属于任何一方。齐到轴上之后，两块的边缘互相齐平，才是隔轴相对。 */}
            <div className="lg:py-10 lg:text-right">
              <h3 className="text-[20px] font-semibold leading-[1.35] tracking-[-0.025em] text-graphite sm:text-[22px] lg:text-[23px]">
                {item.question}
              </h3>

              {/* 删除线用 text-decoration 而不是绝对定位的线条：文案万一在窄屏折成两行，
                  text-decoration 会每行都划到，绝对定位的线只会划中间那一行。
                  也正因如此 theirs 必须写短——见 advantage-data.ts 的字数约束 */}
              {/* 窄屏上问句与两个答案的间距刻意不等：问句下留 16px、两个答案之间只留 10px，
                  两句才会读成「同一个问题的两种答案」，而不是三行并列的字 */}
              <p className="mt-4 text-[14.5px] leading-[1.8] text-graphite-dim line-through decoration-red decoration-[1.5px] transition-opacity duration-300 group-hover:opacity-60 lg:mt-3">
                {item.theirs}
              </p>
            </div>

            {/* 右块：桌面上左边缘就是那条中轴，蓝色由下面那段绝对定位的短线承担——
                轴是灰的，被点亮的只有八处。
                轴色不用 rule-strong：那是给发丝分隔线定的档位（16%），1px 竖线在浅底上
                几乎看不见，撑不起「贯穿全段的脊柱」这个角色。取 graphite-dim 的 28%，
                比横向分隔线重一档、又不至于抢过文字。

                窄屏不给这一块套边框：整条蓝边加内边距会读成一个嵌套的引用块，
                与本站「不堆卡片、不套容器」的取向相反。窄屏只留一枚齐着首行的短蓝标记，
                文字缩进 12px 让折行对齐到标记之外。 */}
            <div
              className={`relative mt-2.5 pl-3 lg:mt-0 lg:border-l lg:border-graphite-dim/28 lg:pl-12 ${OURS_PAD}`}
            >
              {/* 窄屏的短标记：只齐首行高度，是个记号而不是一条边 */}
              <span
                aria-hidden
                className="absolute left-0 top-[7px] h-[1.05rem] w-[2px] rounded-full bg-blue lg:hidden"
              />

              {/* 桌面：-left-px 让 2px 的蓝段正好压住 1px 的灰轴。top/bottom 对应 OURS_PAD。
                  外发光让这一段读起来是「轴被点亮」而不是「轴上贴了根蓝棍」——
                  这是全站唯一一处发光，与背景那片蓝光域同源 */}
              <motion.span
                aria-hidden
                className="absolute -left-px top-10 bottom-9 hidden w-[2px] origin-top rounded-full bg-blue shadow-[0_0_18px_rgb(15_95_216/0.5)] transition-[width] duration-300 group-hover:w-[3px] lg:block"
                initial={reduce ? undefined : { scaleY: 0 }}
                whileInView={reduce ? undefined : { scaleY: 1 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: 0.12 }}
              />

              <p className={`text-[14.5px] leading-[1.9] text-graphite ${OURS_MAX}`}>{item.ours}</p>
            </div>
          </Reveal>
        ))}
      </div>

      {/* 桌面收口：与阵营标签下那条线成对，把中轴封在两条横线之间 */}
      <div className="hidden border-t border-rule lg:block" />
    </section>
  )
}
