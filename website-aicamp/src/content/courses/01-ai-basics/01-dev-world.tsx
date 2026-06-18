import {
  Eyebrow,
  LessonTitle,
  Lead,
  Section,
  KeyPoints,
  Rule,
  Callout,
  Terms,
  Figure,
} from '@/components/content'

/**
 * 课件 1.1 开发世界速览
 * 源文件：public/courses/01-ai-basics/01-dev-world.html
 * 迁移规则：HTML → JSX，class→className，连字符属性→camelCase，内联 style 字符串→对象，
 *   SVG 类（.svg-label/.svg-title/.svg-sub/.svg-mono）替换为等价 fill/fontSize/fontWeight 属性。
 */
export default function Lesson(): React.JSX.Element {
  return (
    <>
      {/* ===== 头部 ===== */}
      <header>
        <Eyebrow chapter="AI 基础工具学习" index="第一节" />
        <LessonTitle>开发世界速览</LessonTitle>
        <Lead>
          用大白话带你<strong>鸟瞰整个开发世界</strong>：前端、后端、数据库、终端是什么、怎么连，
          再到东西跑在哪、上网背后发生了什么、用什么造、一个软件怎么从想法做到上线，以及 AI 让这一切变成了什么样——
          为后面所有内容打地基。
        </Lead>
      </header>

      {/* ===== 本节你会搞懂 ===== */}
      <section>
        <p className="mt-[1.05rem] text-ink-soft">
          欢迎进入开发世界。你可能听过"前端""后端""数据库""终端"这些词，
          它们听起来像几句互不相干的黑话，其实只是一套系统里分工不同的角色。
          这一节我们不写一行代码，先把这些角色的<strong className="text-ink">位置、职责、彼此怎么连</strong>讲明白，
          再顺着延伸到几个能一眼看清全貌的问题。理解了它们，后面学任何工具、看任何教程，你心里都有一张地图，不会再被术语绕晕。
        </p>

        <KeyPoints
          title="本节你会搞懂"
          items={[
            <>前端 / 后端 / 数据库 / 终端各是什么，怎么配合</>,
            <>程序到底"跑在哪"：你的设备 vs 远端服务器</>,
            <>点开一个网页，背后 1 秒里发生了什么</>,
            <>用什么"造"软件，造出来又有哪些"形态"</>,
            <>一个软件怎么从想法一步步做到上线</>,
            <>AI 把开发变成了什么样、对你意味着什么</>,
          ]}
        />

      </section>

      {/* ===== 贯穿全节的大比喻 ===== */}
      <Callout tone="analogy" id="roles">
        <p>
          先给你一个能贯穿全节的比喻：<strong className="text-ink">把一个 App 或网站想象成一家餐厅。</strong>
        </p>
        <p>
          <span style={{ color: '#a78bfa' }}><strong>前端</strong></span>是<strong className="text-ink">店面和菜单</strong>——顾客看得见、摸得着、点单的地方；
          <span style={{ color: '#22d3ee' }}><strong>后端</strong></span>是<strong className="text-ink">后厨</strong>——顾客看不见，但所有的活儿在这里干；
          <span style={{ color: '#f472b6' }}><strong>数据库</strong></span>是<strong className="text-ink">仓库和冰箱</strong>——食材、订单、会员信息都存在这儿；
          <span style={{ color: '#fbbf24' }}><strong>终端</strong></span>则是厨房里那台<strong className="text-ink">操作台兼对讲机</strong>——开发者（厨师长）用它直接下达指令、查看状态。
        </p>
        <p>
          记住这家餐厅，下面四个概念你就都能对号入座了。
        </p>
      </Callout>

      <Rule />

      {/* ===== 全景协作图 ===== */}
      <Figure caption="全景图：用户的每次操作，沿着前端 → 后端 → 数据库一路传递再原路返回；终端是开发者从侧面进入、操控整套系统的入口。">
        <svg viewBox="0 0 860 360" role="img" aria-label="用户、前端、后端、数据库的协作全景图，终端作为开发者入口" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="ar" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="#8a8a94" />
            </marker>
          </defs>

          {/* 节点 1: 用户/浏览器 */}
          <g>
            <circle cx="80" cy="140" r="30" fill="none" stroke="#8a8a94" strokeWidth="1.5" />
            {/* 简笔人 */}
            <circle cx="80" cy="131" r="6" fill="none" stroke="#d4d4d8" strokeWidth="1.5" />
            <path d="M68 153 q12 -16 24 0" fill="none" stroke="#d4d4d8" strokeWidth="1.5" />
            <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="80" y="195" textAnchor="middle">用户 / 浏览器</text>
            <text fill="#8a8a94" fontSize="11" x="80" y="213" textAnchor="middle">点按钮、看页面</text>
          </g>

          {/* 节点 2: 前端 (紫) */}
          <g>
            <rect x="240" y="110" width="60" height="60" rx="10" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            <line x1="252" y1="126" x2="288" y2="126" stroke="#a78bfa" strokeWidth="1.5" />
            <line x1="252" y1="140" x2="278" y2="140" stroke="#a78bfa" strokeWidth="1.5" />
            <line x1="252" y1="154" x2="282" y2="154" stroke="#a78bfa" strokeWidth="1.5" />
            <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="270" y="195" textAnchor="middle">前端</text>
            <text fill="#8a8a94" fontSize="11" x="270" y="213" textAnchor="middle">界面 · 店面菜单</text>
          </g>

          {/* 节点 3: 后端 (青) */}
          <g>
            <circle cx="490" cy="140" r="30" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
            <circle cx="490" cy="140" r="9" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="490" y1="110" x2="490" y2="122" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="490" y1="158" x2="490" y2="170" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="460" y1="140" x2="472" y2="140" stroke="#22d3ee" strokeWidth="1.5" />
            <line x1="508" y1="140" x2="520" y2="140" stroke="#22d3ee" strokeWidth="1.5" />
            <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="490" y="195" textAnchor="middle">后端</text>
            <text fill="#8a8a94" fontSize="11" x="490" y="213" textAnchor="middle">逻辑 · 后厨</text>
          </g>

          {/* 节点 4: 数据库 (粉) */}
          <g>
            <ellipse cx="710" cy="120" rx="30" ry="9" fill="none" stroke="#f472b6" strokeWidth="1.5" />
            <path d="M680 120 v40 a30 9 0 0 0 60 0 v-40" fill="none" stroke="#f472b6" strokeWidth="1.5" />
            <path d="M680 140 a30 9 0 0 0 60 0" fill="none" stroke="#f472b6" strokeWidth="1.5" opacity="0.6" />
            <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="710" y="195" textAnchor="middle">数据库</text>
            <text fill="#8a8a94" fontSize="11" x="710" y="213" textAnchor="middle">存储 · 仓库冰箱</text>
          </g>

          {/* 连线: 用户 <-> 前端 */}
          <line x1="112" y1="132" x2="236" y2="132" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#ar)" />
          <line x1="236" y1="150" x2="112" y2="150" stroke="#8a8a94" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#ar)" />
          <text fill="#8a8a94" fontSize="11" x="174" y="124" textAnchor="middle">操作</text>
          <text fill="#8a8a94" fontSize="11" x="174" y="167" textAnchor="middle">展示</text>

          {/* 连线: 前端 <-> 后端 */}
          <line x1="304" y1="132" x2="456" y2="132" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#ar)" />
          <line x1="456" y1="150" x2="304" y2="150" stroke="#8a8a94" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#ar)" />
          <text fill="#8a8a94" fontSize="11" x="380" y="124" textAnchor="middle">API 请求</text>
          <text fill="#8a8a94" fontSize="11" x="380" y="167" textAnchor="middle">返回结果</text>

          {/* 连线: 后端 <-> 数据库 */}
          <line x1="524" y1="132" x2="676" y2="132" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#ar)" />
          <line x1="676" y1="150" x2="524" y2="150" stroke="#8a8a94" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#ar)" />
          <text fill="#8a8a94" fontSize="11" x="600" y="124" textAnchor="middle">查询数据</text>
          <text fill="#8a8a94" fontSize="11" x="600" y="167" textAnchor="middle">返回数据</text>

          {/* 终端: 开发者入口，画在下方一侧 */}
          <g>
            <rect x="408" y="285" width="164" height="56" rx="8" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
            <circle cx="421" cy="297" r="2.5" fill="#fbbf24" />
            <circle cx="430" cy="297" r="2.5" fill="#fbbf24" opacity="0.6" />
            <circle cx="439" cy="297" r="2.5" fill="#fbbf24" opacity="0.4" />
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="421" y="322" fill="#fbbf24" fontSize="12">$ _</text>
            <text fill="#fbbf24" fontSize="13" fontWeight="600" x="490" y="322" textAnchor="middle">终端</text>
            <text fill="#8a8a94" fontSize="11" x="490" y="358" textAnchor="middle">开发者入口 · 操作台对讲机</text>
          </g>
          {/* 终端连到后端 */}
          <line x1="490" y1="285" x2="490" y2="172" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.7" markerEnd="url(#ar)" />
          <text fill="#bda05a" fontSize="11" x="540" y="240" textAnchor="middle">开发者操控</text>
        </svg>
      </Figure>

      <Rule />

      {/* ===== 概念 1：前端 ===== */}
      <Section
        id="roles"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="14" rx="2" />
            <line x1="3" y1="8" x2="21" y2="8" />
            <line x1="9" y1="21" x2="15" y2="21" />
          </svg>
        }
        title={<span style={{ color: '#a78bfa' }}>前端</span>}
      >
        <p className="mt-[1.05rem]">
          <strong className="text-ink">一句话：前端就是你眼睛能看到、手能点的那一层。</strong>
          网页里的按钮、文字、图片、表单、那个会动的菜单——全是前端。
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">负责什么：</b>把界面画出来，接收你的点击和输入，再把结果好看地展示给你。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">生活类比：</b>餐厅的<strong className="text-ink">店面和菜单</strong>。装修、座位、菜单的样子，决定你看到什么、怎么点单。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">怎么连：</b>它直接面对用户；当需要数据（比如"我的订单"）时，它向<span style={{ color: '#22d3ee' }}>后端</span>发请求，拿到结果后负责展示。前端自己不存数据。
          </li>
        </ul>
      </Section>

      {/* ===== 概念 2：后端 ===== */}
      <Section
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3 M5 5 l2 2 M17 17 l2 2 M19 5 l-2 2 M7 17 l-2 2" />
          </svg>
        }
        title={<span style={{ color: '#22d3ee' }}>后端</span>}
      >
        <p className="mt-[1.05rem]">
          <strong className="text-ink">一句话：后端是你看不见、却在背后干活的那一层。</strong>
          判断密码对不对、计算价格、决定能不能下单，这些逻辑都在后端。
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">负责什么：</b>处理业务规则、做运算和判断、跟数据库打交道，然后把结果交给前端。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">生活类比：</b>餐厅的<strong className="text-ink">后厨</strong>。你只管点菜，炒菜、配料、出餐的流程顾客看不到，但活儿都在这里。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">怎么连：</b>前端通过 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>API</code>（一种约定好的"对接窗口"，让两边能互相喊话）找后端要东西；
            后端需要数据时去问<span style={{ color: '#f472b6' }}>数据库</span>，处理完再原路返回给前端。
          </li>
        </ul>
      </Section>

      {/* ===== 概念 3：数据库 ===== */}
      <Section
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="8" ry="3" />
            <path d="M4 5 v14 a8 3 0 0 0 16 0 V5" />
            <path d="M4 12 a8 3 0 0 0 16 0" />
          </svg>
        }
        title={<span style={{ color: '#f472b6' }}>数据库</span>}
      >
        <p className="mt-[1.05rem]">
          <strong className="text-ink">一句话：数据库是专门用来长期存放数据的地方。</strong>
          用户信息、订单记录、商品列表，关机也不会丢，随时能查、能改。
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">负责什么：</b>把数据整整齐齐地存起来，并能高效地查找、新增、修改、删除。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">生活类比：</b>餐厅的<strong className="text-ink">仓库和冰箱</strong>。食材、库存、会员名单都码放在这里，要用时按需取。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">怎么连：</b>它只跟<span style={{ color: '#22d3ee' }}>后端</span>对话，不直接面对用户。
            后端用 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>SQL</code>（一种"跟数据库说话的标准语言"，专门用来查和改数据）去取数据，再把它交给前端展示。
          </li>
        </ul>
      </Section>

      {/* ===== 概念 4：终端 ===== */}
      <Section
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 9 l3 3 l-3 3 M13 15 h4" />
          </svg>
        }
        title={<span style={{ color: '#fbbf24' }}>终端</span>}
      >
        <p className="mt-[1.05rem]">
          <strong className="text-ink">一句话：终端是开发者敲命令、直接指挥电脑干活的地方。</strong>
          它没有花哨界面，就是一个黑框，你打一行字、回车，电脑就执行一条指令。
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">负责什么：</b>用文字命令来安装工具、启动服务、查看日志、操作文件——不用点鼠标，效率更高、更精确。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">生活类比：</b>厨房里的<strong className="text-ink">操作台兼对讲机</strong>。厨师长不靠菜单点单，而是直接下指令、随时看后厨状态。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">怎么连：</b>它是<strong className="text-ink">开发者的入口</strong>，不属于用户那条链路。前端、后端、数据库都可以从终端被启动、被检查、被操控。
          </li>
        </ul>

        <Figure caption={<>终端就是这样一个"敲命令的黑框"：行首的 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>$</code> 是提示符，后面跟你要执行的命令。</>}>
          <svg viewBox="0 0 540 200" role="img" aria-label="终端窗口示意：标题栏圆点与命令行" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '540px', margin: '0 auto' }}>
            <rect x="1" y="1" width="538" height="198" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
            {/* 标题栏 */}
            <line x1="1" y1="40" x2="539" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="26" cy="20" r="5" fill="#fbbf24" />
            <circle cx="44" cy="20" r="5" fill="rgba(255,255,255,0.25)" />
            <circle cx="62" cy="20" r="5" fill="rgba(255,255,255,0.18)" />
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="270" y="25" textAnchor="middle" fill="#8a8a94" fontSize="12">终端 — 开发者的操作台</text>
            {/* 命令行内容 */}
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="26" y="78" fontSize="14">
              <tspan fill="#fbbf24">$</tspan><tspan fill="#d4d4d8"> npm run dev</tspan>
            </text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="26" y="104" fontSize="13" fill="#8a8a94">  正在启动开发服务器 …</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="26" y="130" fontSize="13" fill="#8a8a94">  服务已运行：http://localhost:3000</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="26" y="162" fontSize="14">
              <tspan fill="#fbbf24">$</tspan><tspan fill="#d4d4d8"> </tspan><tspan fill="#f5f5f7">▋</tspan>
            </text>
          </svg>
        </Figure>
      </Section>

      {/* ===== 它们如何协作 ===== */}
      <Callout tone="closing" id="flow">
        <h2 className="mb-[0.4rem] flex items-center gap-[0.62rem] text-[1.45rem] font-[650] leading-snug tracking-[-0.01em] text-ink">
          <span className="inline-flex flex-none" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a8a94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="18" cy="6" r="2.5" />
              <circle cx="18" cy="18" r="2.5" />
              <path d="M8.2 11 L15.8 7 M8.2 13 L15.8 17" />
            </svg>
          </span>
          它们如何协作
        </h2>
        <p className="mt-[1.05rem] text-ink-soft">
          把四个角色串起来，一次完整的请求是这样跑的：
        </p>
        <p className="text-[1.02rem] text-ink leading-[2.1]">
          你点下"提交订单"按钮
          <span className="mx-[0.35rem] text-muted">→</span><span style={{ color: '#a78bfa' }}>前端</span>收到点击，向后端发请求
          <span className="mx-[0.35rem] text-muted">→</span><span style={{ color: '#22d3ee' }}>后端</span>处理逻辑、校验并向数据库要数据
          <span className="mx-[0.35rem] text-muted">→</span><span style={{ color: '#f472b6' }}>数据库</span>存好/查到记录后返回
          <span className="mx-[0.35rem] text-muted">→</span><span style={{ color: '#22d3ee' }}>后端</span>把结果回传
          <span className="mx-[0.35rem] text-muted">→</span><span style={{ color: '#a78bfa' }}>前端</span>把"下单成功"展示给你。
        </p>
        <p className="mt-[1.05rem] text-ink-soft">
          而<span style={{ color: '#fbbf24' }}><strong>终端</strong></span>始终在一旁：开发者用它启动这套系统、查看运行状态、排查问题。
          这四个角色，就是整个开发世界的地基——后面我们学的每一个工具、写的每一行代码，都会落在这张地图的某个位置上。
          不过光知道"有哪几块"还不够，接下来我们再补几个一眼看清全貌的问题：这些东西<strong className="text-ink">跑在哪</strong>、
          你上网时<strong className="text-ink">背后发生了什么</strong>、它们<strong className="text-ink">用什么造、造出来什么样</strong>、
          一个软件<strong className="text-ink">怎么从想法做到上线</strong>，以及 <strong className="text-ink">AI 让这一切变成了什么样</strong>。
        </p>
      </Callout>

      <Rule />

      {/* ===== ① 程序跑在哪 ===== */}
      <Section
        id="where"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="9" height="13" rx="1.5" />
            <line x1="6.5" y1="14.5" x2="6.5" y2="14.5" />
            <path d="M14 8 h6 a1 1 0 0 1 1 1 v6 a1 1 0 0 1 -1 1 h-6 a1 1 0 0 1 -1 -1 v-6 a1 1 0 0 1 1 -1 z" />
            <line x1="15" y1="11" x2="19" y2="11" />
            <line x1="15" y1="13.5" x2="19" y2="13.5" />
          </svg>
        }
        title={<span style={{ color: '#22d3ee' }}>程序到底跑在哪</span>}
      >
        <p className="mt-[1.05rem]">
          很多人以为"App 就在我手机里，所有事都在手机上干"。其实不然——
          你点开微信、刷抖音、下淘宝单，大量功能都得连上一台<strong className="text-ink">远在机房里的电脑</strong>才能用。
          东西分两头放：一头在<strong className="text-ink">你手里</strong>，一头在<strong className="text-ink">很远的地方</strong>。
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">你的设备：</b>手机、电脑、浏览器，负责<strong className="text-ink">展示</strong>给你看、接收你的<strong className="text-ink">点按和输入</strong>。这就是离你最近的那一头。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">远端服务器：</b>机房里那台 24 小时不关机的电脑，负责<strong className="text-ink">存数据</strong>（你的聊天记录、订单）和<strong className="text-ink">算逻辑</strong>（判断、计算）。这是远的那一头。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">为什么断网时有的能用、有的不能：</b><strong className="text-ink">计算器</strong>断网照样按、照样算——因为它全在你手机本地；可<strong className="text-ink">微信发消息</strong>一断网就发不出去——因为消息得先送到远端服务器，再由它转给对方。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          你常听到的<strong className="text-ink">"云 / 云端"</strong>，说白了就是这些远端服务器的统称。
          "存到云上""云相册"，意思就是东西放在了网那头的服务器里，不在你设备上。
        </p>

        <Figure caption="近的一头管展示和交互，远的一头管存和算；中间隔着一段网络，靠一来一回传消息。">
          <svg viewBox="0 0 760 230" role="img" aria-label="你的设备与远端服务器的分工与一来一回" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="ar-device" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#8a8a94" />
              </marker>
            </defs>

            {/* 左：你的设备（中性灰） */}
            <g>
              <rect x="40" y="60" width="150" height="100" rx="10" fill="none" stroke="#8a8a94" strokeWidth="1.5" />
              <rect x="92" y="78" width="46" height="34" rx="3" fill="none" stroke="#d4d4d8" strokeWidth="1.5" />
              <line x1="92" y1="124" x2="138" y2="124" stroke="#d4d4d8" strokeWidth="1.5" />
              <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="115" y="190" textAnchor="middle">你的设备</text>
              <text fill="#8a8a94" fontSize="11" x="115" y="208" textAnchor="middle">手机/电脑/浏览器 · 展示 · 交互</text>
            </g>

            {/* 中：网络小云 */}
            <g>
              <path d="M345 108 a18 18 0 0 1 35 -6 a14 14 0 0 1 22 10 a14 14 0 0 1 -3 26 h-52 a15 15 0 0 1 -2 -30 z"
                    fill="none" stroke="#8a8a94" strokeWidth="1.3" opacity="0.8" />
              <text fill="#8a8a94" fontSize="11" x="380" y="160" textAnchor="middle">网络</text>
            </g>

            {/* 右：远端服务器（青色） */}
            <g>
              <rect x="570" y="60" width="150" height="100" rx="10" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
              <line x1="588" y1="84" x2="702" y2="84" stroke="#22d3ee" strokeWidth="1.3" />
              <line x1="588" y1="104" x2="702" y2="104" stroke="#22d3ee" strokeWidth="1.3" />
              <line x1="588" y1="124" x2="702" y2="124" stroke="#22d3ee" strokeWidth="1.3" />
              <circle cx="598" cy="84" r="2.4" fill="#22d3ee" />
              <circle cx="598" cy="104" r="2.4" fill="#22d3ee" />
              <circle cx="598" cy="124" r="2.4" fill="#22d3ee" />
              <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="645" y="190" textAnchor="middle">远端服务器 / 云</text>
              <text fill="#8a8a94" fontSize="11" x="645" y="208" textAnchor="middle">存数据 · 算逻辑</text>
            </g>

            {/* 上行：请求（实线） */}
            <line x1="192" y1="92" x2="566" y2="92" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-device)" />
            <text fill="#8a8a94" fontSize="11" x="380" y="84" textAnchor="middle">请求（要数据）</text>
            {/* 下行：返回（虚线） */}
            <line x1="566" y1="128" x2="192" y2="128" stroke="#8a8a94" strokeWidth="1.3" strokeDasharray="3 3" markerEnd="url(#ar-device)" />
            <text fill="#8a8a94" fontSize="11" x="380" y="148" textAnchor="middle">返回（数据/页面）</text>
          </svg>
        </Figure>
        <Callout tone="bridge">↓ 既然靠网络一来一回，那这"一来一回"到底怎么跑？下面拿"点开一个网页"放慢看一遍。</Callout>
      </Section>

      <Rule />

      {/* ===== ② 点开一个网页，背后 1 秒发生了什么 ===== */}
      <Section
        id="network"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <path d="M12 3 a14 14 0 0 0 0 18 a14 14 0 0 0 0 -18" />
          </svg>
        }
        title="你点开一个网页，背后 1 秒发生了什么"
      >
        <p className="mt-[1.05rem]">
          你在地址栏敲个网址、回车，零点几秒后页面就出来了。这一眨眼里，其实跑了一个<strong className="text-ink">完整的来回</strong>：
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">① 你输入网址：</b>相当于报出对方的"门牌号"，告诉网络你要找哪家。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">② 通过网络找到那台服务器：</b>顺着门牌号，请求一路送到存着这个网页的远端服务器跟前。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">③ 服务器把页面/数据发回来：</b>它收到请求，把对应的页面内容打包，原路送回你这边。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">④ 你的设备显示出来：</b>浏览器把收到的内容画成你看到的图文页面。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          那个<strong className="text-ink">"加载转圈"</strong>，就是<strong className="text-ink">正在等服务器回话</strong>的意思；
          网慢、或者服务器正忙（比如抢票高峰），它就转得久一点。
        </p>
        <p className="mt-[1.05rem]">
          其实这就是把前面那张总图里<span style={{ color: '#a78bfa' }}><strong>用户 ↔ 前端</strong></span>那一小段，
          放大了看它<strong className="text-ink">在网络上怎么跑完一个来回</strong>——道理完全一样，只是这回我们盯着"网络"这一程看。
        </p>

        <Figure caption="请求一路送过去，页面一路传回来；转圈，就是这一来一回还没跑完。">
          <svg viewBox="0 0 760 200" role="img" aria-label="点开网页的四步旅程：网址、网络、服务器、浏览器显示" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="ar-trip" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#8a8a94" />
              </marker>
            </defs>

            {/* 节点 1：网址栏 */}
            <g>
              <rect x="20" y="70" width="130" height="34" rx="17" fill="none" stroke="#a78bfa" strokeWidth="1.4" />
              <circle cx="40" cy="87" r="5" fill="none" stroke="#a78bfa" strokeWidth="1.3" />
              <text fontFamily="'SFMono-Regular','Consolas',monospace" x="92" y="91" textAnchor="middle" fill="#d4d4d8" fontSize="11">输入网址</text>
              <text fill="#8a8a94" fontSize="11" x="85" y="128" textAnchor="middle">报门牌号</text>
            </g>

            {/* 节点 2：网络小云 */}
            <g>
              <path d="M255 96 a16 16 0 0 1 31 -5 a12 12 0 0 1 19 9 a12 12 0 0 1 -3 23 h-46 a13 13 0 0 1 -1 -27 z"
                    fill="none" stroke="#8a8a94" strokeWidth="1.3" />
              <text fill="#8a8a94" fontSize="11" x="285" y="128" textAnchor="middle">网络</text>
            </g>

            {/* 节点 3：服务器 */}
            <g>
              <rect x="430" y="68" width="60" height="40" rx="6" fill="none" stroke="#22d3ee" strokeWidth="1.4" />
              <line x1="442" y1="80" x2="478" y2="80" stroke="#22d3ee" strokeWidth="1.2" />
              <line x1="442" y1="90" x2="478" y2="90" stroke="#22d3ee" strokeWidth="1.2" />
              <line x1="442" y1="100" x2="478" y2="100" stroke="#22d3ee" strokeWidth="1.2" />
              <text fill="#8a8a94" fontSize="11" x="460" y="128" textAnchor="middle">服务器</text>
            </g>

            {/* 节点 4：浏览器显示 */}
            <g>
              <rect x="610" y="64" width="110" height="48" rx="6" fill="none" stroke="#a78bfa" strokeWidth="1.4" />
              <line x1="610" y1="76" x2="720" y2="76" stroke="#a78bfa" strokeWidth="1.2" />
              <circle cx="618" cy="70" r="2" fill="#a78bfa" />
              <rect x="622" y="84" width="42" height="20" rx="2" fill="none" stroke="#d4d4d8" strokeWidth="1.2" />
              <line x1="672" y1="86" x2="712" y2="86" stroke="#d4d4d8" strokeWidth="1.2" />
              <line x1="672" y1="94" x2="712" y2="94" stroke="#d4d4d8" strokeWidth="1.2" />
              <line x1="672" y1="102" x2="700" y2="102" stroke="#d4d4d8" strokeWidth="1.2" />
              <text fill="#8a8a94" fontSize="11" x="665" y="128" textAnchor="middle">浏览器显示</text>
            </g>

            {/* 去程：请求（实线，三段） */}
            <line x1="152" y1="80" x2="251" y2="80" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-trip)" />
            <line x1="320" y1="80" x2="426" y2="80" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-trip)" />
            <text fill="#8a8a94" fontSize="11" x="385" y="58" textAnchor="middle">请求 →</text>

            {/* 末段：服务器把页面发回，继续向右到浏览器显示 */}
            <line x1="494" y1="80" x2="606" y2="80" stroke="#8a8a94" strokeWidth="1.3" strokeDasharray="3 3" markerEnd="url(#ar-trip)" />
            <text fill="#8a8a94" fontSize="11" x="550" y="58" textAnchor="middle">发回页面 →</text>

            {/* 加载中注解 */}
            <text fill="#bda05a" fontSize="11" x="285" y="160" textAnchor="middle">⟳ 加载中 = 在等服务器回话</text>
          </svg>
        </Figure>
        <Callout tone="bridge">↓ 知道了东西在哪、怎么传，接着看：这些东西到底是用什么"造"出来的，又会以什么"形态"出现在你面前。</Callout>
      </Section>

      <Rule />

      {/* ===== ③ 用什么造、造出来什么样 ===== */}
      <Section
        id="built"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 6 l-5 6 l5 6" />
            <path d="M16 6 l5 6 l-5 6" />
          </svg>
        }
        title="用什么造、造出来什么样"
      >
        <p className="mt-[1.05rem]">
          <strong className="text-ink">(a) 编程语言：跟电脑沟通的"方言"</strong>
        </p>
        <p className="mt-[1.05rem]">
          你可能听过 Python、Java 一堆名字，觉得每个都得学。其实它们只是和电脑沟通的不同<strong className="text-ink">"方言"</strong>——
          都能让电脑干活，只是各有各擅长的场合。<strong className="text-ink">不用都学</strong>，按你要做的事，挑对路的那门就行。
          下面几个是你大概率会听到的：
        </p>
        <Terms
          items={[
            { term: 'Python', gloss: <>简单好上手，是当下做 <strong>AI、数据分析</strong>最常用的语言。我们这门课后面也常见到它。</> },
            { term: 'JavaScript', gloss: <>专管<strong>网页里的交互</strong>——点一下弹出来、滑动加载更多，这些动效多半靠它。</> },
            { term: 'Java', gloss: <>稳、抗得住大流量，常用来写<strong>大型后台</strong>和<strong>安卓 App</strong>。注意它和上面的 JavaScript 是两回事。</> },
            { term: 'Swift / Kotlin', gloss: <>分别用来写<strong>苹果（iPhone）</strong>和<strong>安卓</strong>上的手机 App。</> },
            { term: 'SQL', gloss: <>专门用来<strong>跟数据库说话</strong>的语言——前面讲数据库时见过，查数据、改数据就靠它。</> },
          ]}
        />
        <p className="mt-[1.05rem]">
          别被吓到：学语言<strong className="text-ink">不是背字典</strong>，常用的就那么些；而且现在还有 AI 帮你写、帮你把每一行解释成大白话。
        </p>

        <p className="mt-[2.4rem]">
          <strong className="text-ink">(b) 软件形态：同一个程序的不同"长相"</strong>
        </p>
        <p className="mt-[1.05rem]">
          同样是一段程序，能以<strong className="text-ink">不同形态</strong>出现在你面前。它们内核相通，只是"长相"和打开方式不一样：
        </p>
        {/* 软件形态：一排线性小图标 */}
        <ul className="mt-[1.8rem] flex flex-wrap gap-x-[2.2rem] gap-y-[1.6rem] list-none p-0">
          {/* 网站 */}
          <li className="flex w-[96px] flex-col items-center gap-[0.5rem] text-center static p-0 m-0 before:content-none">
            <span className="inline-flex" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="13" rx="2" />
                <line x1="9" y1="20" x2="15" y2="20" />
                <line x1="12" y1="17" x2="12" y2="20" />
              </svg>
            </span>
            <span className="text-[0.92rem] font-semibold text-ink">网站</span>
            <span className="text-[0.78rem] leading-[1.5] text-muted">浏览器打开<br />如某官网</span>
          </li>
          {/* 手机 App */}
          <li className="flex w-[96px] flex-col items-center gap-[0.5rem] text-center static p-0 m-0 before:content-none">
            <span className="inline-flex" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="7" y="2" width="10" height="20" rx="2.5" />
                <line x1="11" y1="18.5" x2="13" y2="18.5" />
              </svg>
            </span>
            <span className="text-[0.92rem] font-semibold text-ink">手机 App</span>
            <span className="text-[0.78rem] leading-[1.5] text-muted">要下载<br />如抖音</span>
          </li>
          {/* 小程序 */}
          <li className="flex w-[96px] flex-col items-center gap-[0.5rem] text-center static p-0 m-0 before:content-none">
            <span className="inline-flex" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#f472b6" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5 h16 a1 1 0 0 1 1 1 v9 a1 1 0 0 1 -1 1 h-9 l-4 3 v-3 h-3 a1 1 0 0 1 -1 -1 v-9 a1 1 0 0 1 1 -1 z" />
              </svg>
            </span>
            <span className="text-[0.92rem] font-semibold text-ink">小程序</span>
            <span className="text-[0.78rem] leading-[1.5] text-muted">微信里点开即用<br />如点餐</span>
          </li>
          {/* 桌面软件 */}
          <li className="flex w-[96px] flex-col items-center gap-[0.5rem] text-center static p-0 m-0 before:content-none">
            <span className="inline-flex" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <line x1="3" y1="8" x2="21" y2="8" />
                <circle cx="6" cy="6" r="0.6" />
              </svg>
            </span>
            <span className="text-[0.92rem] font-semibold text-ink">桌面软件</span>
            <span className="text-[0.78rem] leading-[1.5] text-muted">装在电脑<br />如 Word</span>
          </li>
          {/* 后台服务 */}
          <li className="flex w-[96px] flex-col items-center gap-[0.5rem] text-center static p-0 m-0 before:content-none">
            <span className="inline-flex" aria-hidden="true">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#8a8a94" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 4 v2 M12 18 v2 M4 12 h2 M18 12 h2 M6.5 6.5 l1.4 1.4 M16.1 16.1 l1.4 1.4 M17.5 6.5 l-1.4 1.4 M7.9 16.1 l-1.4 1.4" />
              </svg>
            </span>
            <span className="text-[0.92rem] font-semibold text-ink">后台服务</span>
            <span className="text-[0.78rem] leading-[1.5] text-muted">你看不见<br />在背后供数据</span>
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          这其实就呼应了前面术语里说的<strong className="text-ink">"客户端 / 网页版 / 小程序"</strong>——
          同一个服务，换个"长相"给你用而已；而最后那个"后台服务"，就是前面那个看不见的<span style={{ color: '#22d3ee' }}>后端</span>在干的活。
        </p>
        <Callout tone="bridge">↓ 材料和形态都清楚了，那把它们拼成一个能用的软件，整个过程是怎么走的？</Callout>
      </Section>

      <Rule />

      {/* ===== ④ 软件怎么做出来 ===== */}
      <Section
        id="process"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 a4 4 0 0 1 4 4 c0 2 -1.5 3 -2 4.5 M12 3 a4 4 0 0 0 -4 4 c0 2 1.5 3 2 4.5" />
            <line x1="9.5" y1="16" x2="14.5" y2="16" />
            <line x1="10.5" y1="19" x2="13.5" y2="19" />
          </svg>
        }
        title="软件是怎么'做出来'的"
      >
        <p className="mt-[1.05rem]">
          一个软件不是程序员一个人闷头写完的，而是一群人接力干出来的。
          我们拿一个具体例子走一遍：<strong className="text-ink">做一个能点奶茶的小程序</strong>。它大致分六步，每一步都有人专门负责：
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">① 需求（产品经理）：</b>先想清楚<strong className="text-ink">要做啥、先做哪个</strong>——能选规格、能下单、能付钱。产出：一份"要做成什么样"的说明。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">② 设计（设计师）：</b>把界面长啥样、按钮放哪、怎么一步步点画出来。产出：能照着做的<strong className="text-ink">效果图</strong>。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">③ 开发（程序员）：</b>照着效果图，把它<strong className="text-ink">真正用代码写出来</strong>。产出：一个能跑起来的程序。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">④ 测试（测试）：</b>各种点法都试一遍，专门<strong className="text-ink">挑 bug</strong>（毛病）。产出：一份问题清单，外加修好。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">⑤ 上线（运维 / 程序员）：</b>正式<strong className="text-ink">发布</strong>出去，让所有人都能用上。产出：线上能用的版本。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">⑥ 维护迭代：</b>上线后继续修 bug、加功能、再上线。产出：不断更新的新版本。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          关键是：这是个<strong className="text-ink">循环</strong>，不是一条走到头的直线。
          <strong className="text-ink">上线不是终点</strong>——软件会一直转着更新下去。
          这也对上了前面术语里听过的"上线 / 更新 / 版本 / 内测"，以及"产品经理、程序员、测试、运维"这几种人。
        </p>

        <Figure caption="从一个想法到上线，是一群人接力；而上线之后又绕回开头——软件就这么一轮轮转着长大。">
          <svg viewBox="0 0 760 236" role="img" aria-label="软件从需求到迭代的循环步骤流" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="ar-flow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#8a8a94" />
              </marker>
              <marker id="ar-loop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#a78bfa" />
              </marker>
            </defs>

            {/* 主线 y=70 */}
            <line x1="70" y1="70" x2="690" y2="70" stroke="#8a8a94" strokeWidth="1.2" opacity="0.5" />

            {/* 需求 */}
            <circle cx="70" cy="70" r="6" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            <circle cx="70" cy="70" r="2" fill="#a78bfa" />
            <text fill="#d4d4d8" fontSize="13" x="70" y="50" textAnchor="middle">需求</text>
            <text fill="#8a8a94" fontSize="11" x="70" y="98" textAnchor="middle">产品经理</text>
            {/* 设计 */}
            <circle cx="194" cy="70" r="6" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            <circle cx="194" cy="70" r="2" fill="#a78bfa" />
            <text fill="#d4d4d8" fontSize="13" x="194" y="50" textAnchor="middle">设计</text>
            <text fill="#8a8a94" fontSize="11" x="194" y="98" textAnchor="middle">设计师</text>
            {/* 开发 */}
            <circle cx="318" cy="70" r="6" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            <circle cx="318" cy="70" r="2" fill="#a78bfa" />
            <text fill="#d4d4d8" fontSize="13" x="318" y="50" textAnchor="middle">开发</text>
            <text fill="#8a8a94" fontSize="11" x="318" y="98" textAnchor="middle">程序员</text>
            {/* 测试 */}
            <circle cx="442" cy="70" r="6" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            <circle cx="442" cy="70" r="2" fill="#a78bfa" />
            <text fill="#d4d4d8" fontSize="13" x="442" y="50" textAnchor="middle">测试</text>
            <text fill="#8a8a94" fontSize="11" x="442" y="98" textAnchor="middle">测试</text>
            {/* 上线 */}
            <circle cx="566" cy="70" r="6" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            <circle cx="566" cy="70" r="2" fill="#a78bfa" />
            <text fill="#d4d4d8" fontSize="13" x="566" y="50" textAnchor="middle">上线</text>
            <text fill="#8a8a94" fontSize="11" x="566" y="98" textAnchor="middle">运维/程序员</text>
            {/* 迭代 */}
            <circle cx="690" cy="70" r="6" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            <circle cx="690" cy="70" r="2" fill="#a78bfa" />
            <text fill="#d4d4d8" fontSize="13" x="690" y="50" textAnchor="middle">迭代</text>
            <text fill="#8a8a94" fontSize="11" x="690" y="98" textAnchor="middle">修 bug·加功能</text>

            {/* 节点间箭头 */}
            <line x1="84" y1="70" x2="180" y2="70" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#ar-flow)" />
            <line x1="208" y1="70" x2="304" y2="70" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#ar-flow)" />
            <line x1="332" y1="70" x2="428" y2="70" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#ar-flow)" />
            <line x1="456" y1="70" x2="552" y2="70" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#ar-flow)" />
            <line x1="580" y1="70" x2="676" y2="70" stroke="#8a8a94" strokeWidth="1.2" markerEnd="url(#ar-flow)" />

            {/* 迭代 -> 需求 的循环弧线（虚线，紫色） */}
            <path d="M690 84 C 758 122, 748 188, 380 188 C 12 188, 62 122, 70 84" fill="none" stroke="#a78bfa" strokeWidth="1.3"
                  strokeDasharray="5 4" opacity="0.85" markerEnd="url(#ar-loop)" />
            <text fill="#a78bfa" fontSize="11" x="380" y="218" textAnchor="middle">上线不是终点，绕回来继续做下一轮</text>
          </svg>
        </Figure>
        <Callout tone="bridge">↓ 这一整套流程，今天有了 AI 正在被重新改写——最后看看它把开发变成了什么样。</Callout>
      </Section>

      <Rule />

      {/* ===== ⑤ AI 把开发变成了什么样 ===== */}
      <Section
        id="ai"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="7" width="14" height="11" rx="3" />
            <line x1="12" y1="4" x2="12" y2="7" />
            <circle cx="12" cy="3.5" r="1.2" fill="#a78bfa" stroke="none" />
            <circle cx="9.5" cy="12" r="1.2" fill="#22d3ee" stroke="none" />
            <circle cx="14.5" cy="12" r="1.2" fill="#22d3ee" stroke="none" />
            <line x1="9.5" y1="15.5" x2="14.5" y2="15.5" />
          </svg>
        }
        title={<><span style={{ color: '#a78bfa' }}>AI</span> 把开发变成了什么样</>}
      >
        <p className="mt-[1.05rem]">
          <strong className="text-ink">过去</strong>，想写代码门槛很高：得背一堆语法、动不动翻又厚又难懂的文档、程序一报错只能自己一行行啃，
          很多人卡在这一步就劝退了。<strong className="text-ink">现在 AI 把这堵墙拆掉了一大半。</strong>
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            把你的<strong className="text-ink">大白话需求</strong>直接变成代码——你说"做个能记账的小页面"，它就给你写出来。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <strong className="text-ink">读懂并解释</strong>一段代码——把看不懂的代码翻译成人话讲给你听。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <strong className="text-ink">自动找错改错</strong>——程序报错了，把错误丢给它，它帮你定位并改好。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            当你的<strong className="text-ink">随身老师</strong>——随时提问、帮你查资料，不懂就追问到懂。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            替你干<strong className="text-ink">重复的体力活</strong>——那些枯燥、机械、重复的部分，交给它批量搞定。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          核心变化在这儿：有了 AI，你更像一个<strong className="text-ink">"指挥"</strong>——
          把想法说清楚、会判断它给的结果对不对，剩下的落地交给 AI。
          也正因为你是指挥，<strong className="text-ink">前面这些地基（知道有哪几块、各自干啥）才更重要</strong>——
          指挥不懂全局，就没法判断、也没法把活儿派对。
        </p>
        <p className="mt-[1.05rem]">
          但<strong className="text-ink">别把 AI 吹过头</strong>：它也会出错，甚至会"一本正经地瞎编"（看着像模像样，其实是错的）。
          所以<strong className="text-ink">始终需要你来把关</strong>，而不是它说啥就是啥。
        </p>

        <Figure caption="你说需求、AI 落地、你验收把关——不对就再说一遍。你是那个拿主意、踩刹车的人。">
          <svg viewBox="0 0 760 180" role="img" aria-label="你用大白话说需求、AI 产出、你验收把关的来回回路" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="ar-ai" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#a78bfa" />
              </marker>
              <marker id="ar-ai2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#22d3ee" />
              </marker>
            </defs>

            {/* 节点 1：你说需求 */}
            <g>
              <circle cx="90" cy="70" r="30" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
              <circle cx="90" cy="61" r="6" fill="none" stroke="#d4d4d8" strokeWidth="1.4" />
              <path d="M78 83 q12 -16 24 0" fill="none" stroke="#d4d4d8" strokeWidth="1.4" />
              <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="90" y="125" textAnchor="middle">你</text>
              <text fill="#8a8a94" fontSize="11" x="90" y="143" textAnchor="middle">用大白话说需求</text>
            </g>

            {/* 节点 2：AI */}
            <g>
              <rect x="340" y="42" width="80" height="56" rx="12" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
              <line x1="380" y1="34" x2="380" y2="42" stroke="#a78bfa" strokeWidth="1.4" />
              <circle cx="380" cy="31" r="2.2" fill="#a78bfa" />
              <circle cx="366" cy="68" r="2.6" fill="#22d3ee" />
              <circle cx="394" cy="68" r="2.6" fill="#22d3ee" />
              <line x1="366" y1="84" x2="394" y2="84" stroke="#a78bfa" strokeWidth="1.4" />
              <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="380" y="125" textAnchor="middle">AI</text>
              <text fill="#8a8a94" fontSize="11" x="380" y="143" textAnchor="middle">帮你落地</text>
            </g>

            {/* 节点 3：产出 */}
            <g>
              <rect x="640" y="42" width="80" height="56" rx="8" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
              <line x1="654" y1="58" x2="706" y2="58" stroke="#22d3ee" strokeWidth="1.2" />
              <line x1="654" y1="70" x2="706" y2="70" stroke="#22d3ee" strokeWidth="1.2" />
              <line x1="654" y1="82" x2="690" y2="82" stroke="#22d3ee" strokeWidth="1.2" />
              <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="680" y="125" textAnchor="middle">代码 / 方案</text>
              <text fill="#8a8a94" fontSize="11" x="680" y="143" textAnchor="middle">你来验收·把关</text>
            </g>

            {/* 你 -> AI */}
            <line x1="122" y1="60" x2="336" y2="60" stroke="#a78bfa" strokeWidth="1.3" markerEnd="url(#ar-ai)" />
            <text fill="#8a8a94" fontSize="11" x="229" y="52" textAnchor="middle">说清楚要什么</text>
            {/* AI -> 产出 */}
            <line x1="422" y1="60" x2="636" y2="60" stroke="#a78bfa" strokeWidth="1.3" markerEnd="url(#ar-ai)" />
            <text fill="#8a8a94" fontSize="11" x="529" y="52" textAnchor="middle">产出</text>
            {/* 产出 -> 你（验收回到起点，青色虚线，走下方） */}
            <path d="M660 100 C 600 168, 180 168, 100 102" fill="none" stroke="#22d3ee" strokeWidth="1.3"
                  strokeDasharray="5 4" opacity="0.85" markerEnd="url(#ar-ai2)" />
            <text fill="#22d3ee" fontSize="11" x="380" y="170" textAnchor="middle">你验收·不对就再说一遍，来回打磨</text>
          </svg>
        </Figure>

        <p className="mt-[1.05rem]">
          说到底，这门课接下来要做的，就是带你<strong className="text-ink">把这些 AI 工具用顺手</strong>——
          让没有任何技术基础的你，也能把脑子里的想法，一步步变成真能用的东西。
        </p>
      </Section>

      <Rule />

      {/* ===== 本节小结 ===== */}
      <Callout tone="closing">
        <h2 className="mb-[0.4rem] flex items-center gap-[0.62rem] text-[1.45rem] font-[650] leading-snug tracking-[-0.01em] text-ink">
          <span className="inline-flex flex-none" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 12 l2.3 2.3 l4.7 -4.9" />
            </svg>
          </span>
          总结
        </h2>
        <p className="text-[1.02rem] text-ink leading-[2.1]">
          一套软件 ＝ <span style={{ color: '#a78bfa' }}>前端</span>看得见的界面 ＋ <span style={{ color: '#22d3ee' }}>后端</span>背后的逻辑 ＋ <span style={{ color: '#f472b6' }}>数据库</span>存的数据，
          <span style={{ color: '#fbbf24' }}>终端</span>是开发者的操控台；它们分布在<strong className="text-ink">你的设备</strong>和<strong className="text-ink">远端服务器</strong>上、靠网络一来一回；
          用各种<strong className="text-ink">语言</strong>造、以网站 / App / 小程序等<strong className="text-ink">形态</strong>示人；
          由一群人按<strong className="text-ink">「需求 → 设计 → 开发 → 测试 → 上线 → 迭代」</strong>做出来并持续更新——而这一切，<strong className="text-ink">AI</strong> 正帮你把门槛大幅降低。
        </p>
        <p className="mt-[1.05rem] text-ink-soft">
          记住这张地图，后面每学一个工具、写一行代码，你都知道它落在哪儿。
          下一节，我们就动手认识第一批 <strong className="text-ink">AI 编程工具</strong>。
        </p>
      </Callout>

      <Rule />

      {/* ===== 术语速查 ===== */}
      <section id="glossary" className="mt-[2.8rem]">
        <h2 className="m-0 text-[1.45rem] font-[650] tracking-[-0.01em] text-ink">你常听到的那些词</h2>
        <p className="mt-[1.05rem] text-ink-soft">
          这些词你多半在新闻、朋友聊天、产品公告里听过，但未必说得清。
          这里用大白话、带例子给你对一遍——不用背，混个脸熟，以后再听到不发懵就行。
        </p>

        {/* 常听到的"东西" */}
        <h3 className="mt-[2rem] mb-0 flex items-center gap-[0.55rem] text-[1.02rem] font-semibold tracking-[-0.005em] text-ink">
          <span className="inline-block h-[7px] w-[7px] flex-none rounded-full" style={{ background: '#a78bfa' }} aria-hidden="true" />
          常听到的"东西"
        </h3>
        <Terms
          items={[
            { term: '代码 / 写代码', gloss: '写给电脑的一条条"指令"，像菜谱一步步教厨师怎么做。"敲代码"就是把"点这个按钮 → 弹出付款页"用电脑听得懂的话写清楚。' },
            { term: '程序 / 软件 / 应用（App）', gloss: '一堆代码打包成的成品，专干某件事。微信、抖音、淘宝、计算器都是 App；电脑上的 Word、浏览器也是软件。' },
            { term: '服务器', gloss: '机房里一台 24 小时不关机、同时伺候千万人的"超级电脑"。刷视频、抢车票背后都是它；"服务器崩了 / 维护中"就是它忙不过来或坏了，大家一起打不开。' },
            { term: '云 / 云端', gloss: '把照片、文件存到"网上的服务器"而不是手机里，换新手机一登录东西还在。iCloud、百度网盘、"存到云上"就是它。' },
            { term: '数据 / 大数据', gloss: '被记录的各种信息：订单、点过的赞、看过的视频。"大数据"=海量信息攒一起找规律，比如发现"买尿布的人也爱买啤酒"。' },
            { term: '算法', gloss: '一套"怎么做决定"的规则。抖音按你看了啥、停多久，算出下一条推什么；"被算法推送""大数据杀熟"都是它。' },
            { term: '人工智能 / AI / 大模型', gloss: '让电脑像人一样听懂话、写文章、认图。"大模型"是特别会聊天写作的那类，像 ChatGPT、豆包，问一句能写一整篇。' },
            { term: '流量', gloss: '上网的"数据用量"，看高清视频特别费（"这月流量超了"）；也指访问量，"这条视频流量大"=看的人多。' },
          ]}
        />

        {/* 常听到的"形态 / 部位" */}
        <h3 className="mt-[2rem] mb-0 flex items-center gap-[0.55rem] text-[1.02rem] font-semibold tracking-[-0.005em] text-ink">
          <span className="inline-block h-[7px] w-[7px] flex-none rounded-full" style={{ background: '#22d3ee' }} aria-hidden="true" />
          常听到的"形态 / 部位"
        </h3>
        <Terms
          items={[
            { term: '客户端 / 网页版 / 小程序', gloss: '同一个服务的三种打开方式：客户端=要下载安装的 App，网页版=浏览器直接开，小程序=微信里点开即用、不用装。' },
            { term: '后台', gloss: '用户看不见、在背后干活或管理的部分。"切到后台还在下载""商家在后台改价格"——看不到但在运行。' },
            { term: '用户体验 / UI', gloss: 'UI=你看到的界面长啥样（按钮、配色、排版）；用户体验=用起来顺不顺手。"这 App 体验好"=找东西不费劲。' },
          ]}
        />

        {/* 常听到的"毛病 & 安全" */}
        <h3 className="mt-[2rem] mb-0 flex items-center gap-[0.55rem] text-[1.02rem] font-semibold tracking-[-0.005em] text-ink">
          <span className="inline-block h-[7px] w-[7px] flex-none rounded-full" style={{ background: '#f472b6' }} aria-hidden="true" />
          常听到的"毛病 &amp; 安全"
        </h3>
        <Terms
          items={[
            { term: 'Bug（"有个 bug"）', gloss: '程序里的毛病，不照你想的来。"这有个 bug"="这儿坏了 / 不对劲"。' },
            { term: '崩溃 / 闪退 / 卡死', gloss: '用着用着突然自己退出（闪退），或彻底卡住不动（卡死）。' },
            { term: '死机 / 宕机', gloss: '整台设备或服务器停住、毫无反应。服务器宕机，所有人一起用不了。' },
            { term: '缓存（"清一下缓存"）', gloss: '临时存的一份数据让下次更快；页面显示不对、加载不出来时，"清缓存"常一下就好。' },
            { term: '漏洞', gloss: '程序的安全"缺口"，相当于门没锁好，可能被人钻进来。' },
            { term: '病毒 / 木马', gloss: '偷偷装进设备、搞破坏或偷信息（账号、银行卡）的坏程序。' },
            { term: '黑客', gloss: '专门找漏洞钻进系统的人，可能偷数据、改东西、搞破坏。' },
          ]}
        />

        {/* 常听到的"动作 / 阶段" */}
        <h3 className="mt-[2rem] mb-0 flex items-center gap-[0.55rem] text-[1.02rem] font-semibold tracking-[-0.005em] text-ink">
          <span className="inline-block h-[7px] w-[7px] flex-none rounded-full" style={{ background: '#fbbf24' }} aria-hidden="true" />
          常听到的"动作 / 阶段"
        </h3>
        <Terms
          items={[
            { term: '上线', gloss: '把做好的东西正式发布、所有人都能用了。"新功能明天上线"。' },
            { term: '更新 / 升级', gloss: '发布改进后的新版本，修毛病、加功能。手机总提示"有可用更新"就是它。' },
            { term: '版本（"最新版""老版本"）', gloss: '软件的不同阶段，号越大通常越新。"升到最新版""我还是老版本"。' },
            { term: '内测 / 公测', gloss: '正式开放前先小范围试（内测），再放给更多人试（公测），边用边改。游戏常这么干。' },
            { term: '兼容 / 不兼容', gloss: '两个东西能不能一起正常用。老手机"不兼容"新系统=装不了或会出问题。' },
            { term: '开源', gloss: '把代码公开，谁都能看、能用、能帮着改。很多免费软件就是开源的。' },
            { term: '需求（"提 / 改需求"）', gloss: '想让软件做到的事。"客户又改需求了"=又想加 / 改功能了。' },
          ]}
        />

        {/* 常听到的"人" */}
        <h3 className="mt-[2rem] mb-0 flex items-center gap-[0.55rem] text-[1.02rem] font-semibold tracking-[-0.005em] text-ink">
          <span className="inline-block h-[7px] w-[7px] flex-none rounded-full" style={{ background: '#8a8a94' }} aria-hidden="true" />
          常听到的"人"
        </h3>
        <Terms
          items={[
            { term: '程序员（码农 / 程序猿）', gloss: '写代码、把东西真正做出来的人。' },
            { term: '产品经理', gloss: '想清楚"要做成什么样、先做哪个"，把需求理清交给程序员的人。' },
            { term: '测试', gloss: '发布前专门"挑刺"、各种点法都试一遍、把 bug 找出来的人。' },
            { term: '运维', gloss: '盯服务器、保证它 24 小时不出事的人；半夜宕机被叫起来的常是他们。' },
          ]}
        />
      </section>
    </>
  )
}
