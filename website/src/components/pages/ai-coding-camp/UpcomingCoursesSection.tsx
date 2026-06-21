'use client'

import { Reveal, GradientText } from '../../motion'
import { SectionEyebrow } from './primitives'
import { THEMES } from './data'
import type { Theme } from './data'

/* ─────────────────────────  后续课程预告  ─────────────────────────
 * 「敬请期待」性质的进阶课程预告：信息密度低，采用轻量线+圆点列表
 * （复用 JourneyMap 的线+辉光圆点语言），不堆叠卡片、不嵌套容器。
 * 每门课：标题 + 敬请期待标签 + 一句话定位 + 3~4 个看点内联标签。
 * 配色复用 data.ts 的 THEMES 品牌色板，保持与正式大纲一致。
 * ──────────────────────────────────────────────────────────────── */

type UpcomingCourse = {
  key: string
  theme: Theme
  title: string
  positioning: string
  highlights: string[]
}

const UPCOMING_COURSES: UpcomingCourse[] = [
  {
    key: 'rag',
    theme: THEMES.frontend,
    title: '海量数据 RAG 知识库与评测系统',
    positioning:
      '把海量文档变成"问得准、答得对"的企业知识库，并用一套评测体系量化它到底有多准。',
    highlights: [
      '文档切分 / 向量检索 / 重排全链路',
      'RAG 自动评测：召回率·准确率·幻觉率',
      '关键词 + 向量混合检索',
      '大规模索引与性能优化',
    ],
  },
  {
    key: 'agent-saas',
    theme: THEMES.cognition,
    title: 'AI 工作流与智能体 SaaS 平台',
    positioning:
      '做一个让用户自己拖拽编排 AI 工作流、一键发布智能体的多租户 SaaS 平台。',
    highlights: [
      '可视化工作流编排（节点·连线·分支）',
      '多智能体协作与工具调用（Function Calling / MCP）',
      '多租户·权限·计费',
      '工作流版本管理与运行监控',
    ],
  },
  {
    key: 'im',
    theme: THEMES.agent,
    title: '百万并发 AI + 即时通信系统',
    positioning:
      '从零搭一套能扛百万人同时在线、还能边聊边调用 AI 的即时通信系统。',
    highlights: [
      '高并发长连接架构（WebSocket·网关·集群）',
      '消息可靠投递与离线消息',
      'AI 实时介入对话（流式回复）',
      '限流·削峰·水平扩展',
    ],
  },
]

export function UpcomingCoursesSection() {
  return (
    <section className="relative mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 sm:pb-24 lg:pb-32">
      <Reveal>
        <div className="flex flex-col gap-4">
          <SectionEyebrow color="#f8ec1d">后续课程预告</SectionEyebrow>
          <h2 className="font-serif-zh text-[22px] font-semibold leading-[1.5] tracking-[0.005em] sm:text-[26px] sm:leading-[1.45] lg:text-[34px] lg:leading-[1.3]">
            <span className="mt-1 block sm:mt-1.5">
              <GradientText className="font-semibold">三套企业级实战系统，正在路上</GradientText>
            </span>
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-[1.85] text-ink-soft sm:text-[14.5px]">
            完成训练营之后的进阶方向，每一套都对标一线大厂真实生产场景。敬请期待。
          </p>
        </div>
      </Reveal>

      {/* 一条贯穿主线（按四色渐变） + 4 个辉光节点 */}
      <div className="relative mt-10 sm:mt-14">
        <span
          aria-hidden
          className="absolute left-[19px] top-2 bottom-2 w-px sm:left-[23px]"
          style={{
            background: `linear-gradient(to bottom, ${UPCOMING_COURSES.map((c) => c.theme.hex).join(', ')})`,
            opacity: 0.45,
          }}
        />
        <ol className="flex flex-col gap-9 sm:gap-11">
          {UPCOMING_COURSES.map((course, i) => (
            <Reveal key={course.key} delay={Math.min(i, 4) * 0.06}>
              <li className="relative pl-11 sm:pl-14">
                {/* 辉光节点 */}
                <span
                  aria-hidden
                  className="absolute left-[11px] top-1 h-[18px] w-[18px] rounded-full sm:left-[15px]"
                  style={{
                    background: `radial-gradient(circle, ${course.theme.gradientFrom} 0%, ${course.theme.gradientTo} 80%)`,
                    boxShadow: `0 0 18px ${course.theme.hex}66`,
                  }}
                />
                {/* 标题 + 敬请期待标签 */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <h3 className="font-serif-zh text-[16px] font-semibold leading-[1.35] text-ink sm:text-[19px]">
                    {course.title}
                  </h3>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
                    style={{
                      color: course.theme.hex,
                      border: `1px solid ${course.theme.hex}44`,
                      background: `${course.theme.hex}12`,
                    }}
                  >
                    <span
                      className="h-1.5 w-1.5 animate-pulse rounded-full"
                      style={{ background: course.theme.hex }}
                    />
                    敬请期待
                  </span>
                </div>
                {/* 一句话定位 */}
                <p className="mt-2 max-w-2xl text-[12.5px] leading-[1.75] text-ink-soft sm:text-[13.5px]">
                  {course.positioning}
                </p>
                {/* 看点内联标签 */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {course.highlights.map((h) => (
                    <span
                      key={h}
                      className="inline-flex items-center rounded-md px-2.5 py-1 text-[11px] leading-none text-muted"
                      style={{
                        border: `1px solid ${course.theme.hex}22`,
                        background: `${course.theme.hex}0a`,
                      }}
                    >
                      {h}
                    </span>
                  ))}
                </div>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  )
}
