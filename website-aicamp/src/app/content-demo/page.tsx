/**
 * 内容组件库视觉核对 demo
 * 访问 http://localhost:3100/_content-demo 截图验证每个组件的视觉表现。
 * 本路由保留供控制器截图核对，不删除。
 */
import {
  Eyebrow,
  LessonTitle,
  Lead,
  Section,
  KeyPoints,
  Summary,
  Rule,
  Highlight,
  Cmd,
  Terms,
  Callout,
  Figure,
} from '@/components/content'

export default function ContentDemoPage(): React.JSX.Element {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-8">
      {/* ── 头部 ── */}
      <header>
        <Eyebrow chapter="AI 基础工具学习" index="第一节" />
        <LessonTitle>开发世界速览</LessonTitle>
        <Lead>
          用大白话带你<strong>鸟瞰整个开发世界</strong>：前端、后端、数据库、终端是什么、怎么连，
          再到东西跑在哪、上网背后发生了什么——为后面所有内容打地基。
        </Lead>
      </header>

      {/* ── 本节速读（Summary） ── */}
      <Summary
        title="本节速览："
        items={[
          <a key="roles" href="#roles" className="text-ink-soft hover:text-accent">四个角色</a>,
          <a key="flow" href="#flow" className="text-ink-soft hover:text-accent">怎么协作</a>,
          <a key="where" href="#where" className="text-ink-soft hover:text-accent">跑在哪</a>,
          <a key="glossary" href="#glossary" className="text-ink-soft hover:text-accent">术语速查</a>,
        ]}
      />

      {/* ── 要点清单（KeyPoints） ── */}
      <KeyPoints
        title="本节你会搞懂"
        items={[
          <>前端 / 后端 / 数据库 / 终端各是什么，怎么配合</>,
          <>程序到底"跑在哪"：你的设备 vs 远端服务器</>,
          <>点开一个网页，背后 1 秒里发生了什么</>,
          <><Highlight>AI</Highlight> 把开发变成了什么样</>,
        ]}
      />

      <Rule />

      {/* ── Section 示例 ── */}
      <Section
        id="roles"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <line x1="3" y1="8" x2="21" y2="8" />
            <line x1="9" y1="21" x2="15" y2="21" />
          </svg>
        }
        title={<span style={{ color: 'var(--color-accent)' }}>前端</span>}
      >
        <p className="mt-[1.05rem]">
          <strong className="text-ink">一句话：前端就是你眼睛能看到、手能点的那一层。</strong>
          网页里的按钮、文字、图片、表单——全是前端。
          用 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-ink" style={{ background: 'rgba(255,255,255,0.06)' }}>Cmd</code> 组件可以展示命令块（见下方）。
        </p>
      </Section>

      {/* ── Cmd 组件示例 ── */}
      <Cmd>
        {'$ npm run dev\n  正在启动开发服务器 …\n  服务已运行：http://localhost:3000'}
      </Cmd>

      <Rule />

      {/* ── Terms 术语表 ── */}
      <section id="glossary" className="mt-[2.8rem]">
        <h2 className="m-0 text-[1.45rem] font-[650] tracking-[-0.01em] text-ink">
          术语速查
        </h2>
        <Terms
          items={[
            { term: 'Python', gloss: '简单好上手，是当下做 AI、数据分析最常用的语言。' },
            { term: 'JavaScript', gloss: '专管网页里的交互——点一下弹出来、滑动加载更多，这些动效多半靠它。' },
            { term: 'SQL', gloss: '专门用来跟数据库说话的语言——查数据、改数据就靠它。' },
            { term: 'API', gloss: '约定好的"对接窗口"，让前端和后端能互相喊话。' },
          ]}
        />
      </section>

      <Rule />

      {/* ── Callout: analogy（比喻区）── */}
      <Callout tone="analogy">
        <p>
          先给你一个能贯穿全节的比喻：<strong className="text-ink">把一个 App 想象成一家餐厅。</strong>
        </p>
        <p>
          <span style={{ color: 'var(--color-accent)' }}><strong>前端</strong></span>是<strong className="text-ink">店面和菜单</strong>；
          <span style={{ color: 'var(--color-accent-2)' }}><strong>后端</strong></span>是<strong className="text-ink">后厨</strong>；
          <span style={{ color: 'var(--color-accent-3)' }}><strong>数据库</strong></span>是<strong className="text-ink">仓库和冰箱</strong>。
        </p>
      </Callout>

      {/* ── Callout: bridge（过渡段）── */}
      <Callout tone="bridge">
        ↓ 既然靠网络一来一回，那这"一来一回"到底怎么跑？下面拿"点开一个网页"放慢看一遍。
      </Callout>

      {/* ── Callout: note ── */}
      <Callout tone="note" label="提示">
        <p>
          就算没有 Claude 账号，也可以用国产模型把 Claude Code 跑起来——后面章节会讲。
        </p>
      </Callout>

      {/* ── Callout: closing（收尾）── */}
      <Callout tone="closing" label="本节小结">
        <p className="mt-[0.6rem] text-ink-soft">
          这四个角色——前端、后端、数据库、终端——就是整个开发世界的地基。
          后面我们学的每一个工具、写的每一行代码，都会落在这张地图的某个位置上。
        </p>
      </Callout>

      <Rule />

      {/* ── Figure + 内联 SVG ── */}
      <Figure caption="全景图：用户的每次操作，沿着前端 → 后端 → 数据库一路传递再原路返回。">
        <svg viewBox="0 0 640 200" role="img" aria-label="前端、后端、数据库协作示意" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="demo-ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#8a8a94" />
            </marker>
          </defs>
          {/* 前端节点 */}
          <rect x="40" y="70" width="60" height="60" rx="10" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" />
          <line x1="52" y1="86" x2="88" y2="86" stroke="var(--color-accent)" strokeWidth="1.5" />
          <line x1="52" y1="100" x2="78" y2="100" stroke="var(--color-accent)" strokeWidth="1.5" />
          <text fill="#f5f5f7" fontSize="13" fontWeight="600" x="70" y="152" textAnchor="middle">前端</text>
          <text fill="#8a8a94" fontSize="11" x="70" y="168" textAnchor="middle">界面</text>
          {/* 后端节点 */}
          <circle cx="290" cy="100" r="30" fill="none" stroke="var(--color-accent-2)" strokeWidth="1.5" />
          <circle cx="290" cy="100" r="9" fill="none" stroke="var(--color-accent-2)" strokeWidth="1.5" />
          <text fill="#f5f5f7" fontSize="13" fontWeight="600" x="290" y="152" textAnchor="middle">后端</text>
          <text fill="#8a8a94" fontSize="11" x="290" y="168" textAnchor="middle">逻辑</text>
          {/* 数据库节点 */}
          <ellipse cx="520" cy="80" rx="30" ry="9" fill="none" stroke="var(--color-accent-3)" strokeWidth="1.5" />
          <path d="M490 80 v40 a30 9 0 0 0 60 0 v-40" fill="none" stroke="var(--color-accent-3)" strokeWidth="1.5" />
          <text fill="#f5f5f7" fontSize="13" fontWeight="600" x="520" y="152" textAnchor="middle">数据库</text>
          <text fill="#8a8a94" fontSize="11" x="520" y="168" textAnchor="middle">存储</text>
          {/* 连线 */}
          <line x1="104" y1="92" x2="256" y2="92" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#demo-ar)" />
          <line x1="256" y1="108" x2="104" y2="108" stroke="#8a8a94" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#demo-ar)" />
          <text fill="#8a8a94" fontSize="11" x="180" y="84" textAnchor="middle">API 请求</text>
          <text fill="#8a8a94" fontSize="11" x="180" y="124" textAnchor="middle">返回结果</text>
          <line x1="324" y1="92" x2="486" y2="92" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#demo-ar)" />
          <line x1="486" y1="108" x2="324" y2="108" stroke="#8a8a94" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#demo-ar)" />
          <text fill="#8a8a94" fontSize="11" x="405" y="84" textAnchor="middle">查询数据</text>
          <text fill="#8a8a94" fontSize="11" x="405" y="124" textAnchor="middle">返回数据</text>
        </svg>
      </Figure>

      <div className="mt-12 border-t border-hairline pt-6">
        <p className="text-sm text-muted">
          ⬆ 以上为 <code className="font-mono text-xs">src/components/content/</code> 所有组件的视觉核对页面。
        </p>
      </div>
    </article>
  )
}
