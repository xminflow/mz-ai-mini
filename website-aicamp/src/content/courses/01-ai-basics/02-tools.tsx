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
  Cmd,
} from '@/components/content'

/**
 * 课件 1.2 认识并安装主力工具
 * 源文件：public/courses/01-ai-basics/02-tools.html
 * 迁移规则：HTML → JSX，class→className，连字符属性→camelCase，
 *   内联 style 字符串→对象，SVG 类（.svg-title/.svg-label/.svg-sub/.svg-mono）
 *   替换为等价 fill/fontSize/fontWeight/fontFamily 属性。
 */
export default function Lesson(): React.JSX.Element {
  return (
    <>
      {/* ===== 头部 ===== */}
      <header>
        <Eyebrow chapter="AI 基础工具学习" index="第二节" />
        <LessonTitle>认识并安装主力工具</LessonTitle>
        <Lead>
          市面上的 AI 编程工具看着一堆，其实<strong>大多是同一类东西</strong>：装进电脑、在终端里跟你对话、帮你干活。
          这一节带你认全主流的几款、并<strong>挑一个真正装好</strong>——装好一个就能开干。
          本课程后面会<strong>统一以 Claude Code 作为核心主力</strong>，其余作为备选和了解。
        </Lead>
      </header>

      {/* ===== 本节你会搞懂 ===== */}
      <section>
        <KeyPoints
          title="本节你会搞懂"
          items={[
            <>市面上的"AI 编程助手"其实是<strong>同一类东西</strong>，不用都装</>,
            <>它们<strong>不只是写代码</strong>，更是能替你干很多事的"全能智能体"</>,
            <>面对这么多工具<strong>该怎么选</strong>，怎么降低学习负担</>,
            <>没碰过"终端黑框"也不怕——<strong>打开、粘贴、回车</strong>三步就会用</>,
            <>四种主流方案的<strong>完整安装步骤</strong>，照着敲就行</>,
            <>就算<strong>没有 Claude 账号</strong>，也能用国产模型把 Claude Code 跑起来</>,
            <>国产大模型生态里还有哪些"知道有就行"的工具</>,
            <>国内网络<strong>装不上 / 连不上</strong>时，有哪些应对办法</>,
            <>装完之后<strong>怎么验证</strong>它真的能用了</>,
          ]}
        />
      </section>

      <Rule />

      {/* ===== 选择策略 ===== */}
      <Section
        id="why"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 v6" />
            <path d="M12 9 l-6 5 M12 9 l6 5" />
            <circle cx="6" cy="16" r="2.5" />
            <circle cx="18" cy="16" r="2.5" />
          </svg>
        }
        title={<span style={{ color: '#a78bfa' }}>工具太多，先想清楚选哪个</span>}
      >
        <p className="mt-[1.05rem]">
          刚入门最容易犯的毛病，就是<strong className="text-ink">把时间花在"该装哪个"上反复纠结</strong>——这个看着火、那个听说更强，
          结果一个都没真正用起来。其实大可不必内耗：这些工具<strong className="text-ink">八九不离十是同一类东西</strong>。
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">它们长得像：</b>大多是<strong className="text-ink">"终端里的 AI 编程助手"</strong>——你在那个黑框里用大白话提需求，它读你的文件、帮你写代码改代码。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">用法相通：</b>装法都是"敲一行安装命令"，用法都是"启动后跟它对话"。<strong className="text-ink">学会一个，其余基本都会用</strong>。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">选一个贯穿全程：</b>挑定一个用到底，把它用熟，比浅尝五个都强。其余的<strong className="text-ink">了解即可</strong>，知道有这么回事、需要时再说。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          所以这门课替你拿了主意：<strong className="text-ink">后续统一用 Claude Code</strong> 作为主力工具贯穿全程。
          但为了让你按手头条件灵活选择，下面会把 <strong className="text-ink">4 种主流方案都讲全</strong>——
          有 Claude 账号的直接用官方，国内或没账号的也有兜底方案。
        </p>
        <Callout tone="bridge">↓ 不过在挑工具之前，先纠正一个常见误解——它远不止是个"编程工具"。</Callout>
      </Section>

      <Rule />

      {/* ===== 不只是写代码：通用智能体 ===== */}
      <Section
        id="agent"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 l1.8 4.4 L18 9 l-4.2 1.6 L12 15 l-1.8-4.4 L6 9 l4.2-1.6 z" />
            <path d="M18.5 14 l.8 2 l2 .8 l-2 .8 l-.8 2 l-.8-2 l-2-.8 l2-.8 z" />
          </svg>
        }
        title={<span style={{ color: '#a78bfa' }}>不只是写代码：它是个"全能智能体"</span>}
      >
        <p className="mt-[1.05rem]">
          别被"编程工具"四个字框住了。<strong className="text-ink">Claude Code 这一类工具，本质是"会用工具、能自己动手干活的通用智能体（AI agent）"</strong>——
          写代码只是它最拿手的一个场景。它也是目前你能用到的<strong className="text-ink">最能干的 AI 助手之一</strong>。
        </p>
        <p className="mt-[1.05rem]">
          和普通聊天 AI 最大的区别是：<strong className="text-ink">聊天 AI 只会"说"，你还得照着自己动手；而它能"真的动手"</strong>——
          读你电脑里的文件、改文件、上网查、运行命令、看到结果再调整，一条龙把事办完。
        </p>

        <Figure caption="同一个智能体，能胜任的远不止写代码——下面挨个举例。">
          <svg viewBox="0 0 700 352" role="img" aria-label="一个 AI 智能体可以胜任的多种本领" xmlns="http://www.w3.org/2000/svg">
            {/* 连线 */}
            <line x1="275" y1="196" x2="182" y2="84" stroke="#8a8a94" strokeWidth="1.2" />
            <line x1="275" y1="196" x2="182" y2="196" stroke="#8a8a94" strokeWidth="1.2" />
            <line x1="275" y1="196" x2="182" y2="310" stroke="#8a8a94" strokeWidth="1.2" />
            <line x1="425" y1="196" x2="518" y2="84" stroke="#8a8a94" strokeWidth="1.2" />
            <line x1="425" y1="196" x2="518" y2="196" stroke="#8a8a94" strokeWidth="1.2" />
            <line x1="425" y1="196" x2="518" y2="310" stroke="#8a8a94" strokeWidth="1.2" />
            <circle cx="180" cy="82" r="2.5" fill="#22d3ee" />
            <circle cx="180" cy="196" r="2.5" fill="#f472b6" />
            <circle cx="180" cy="310" r="2.5" fill="#fbbf24" />
            <circle cx="520" cy="82" r="2.5" fill="#a78bfa" />
            <circle cx="520" cy="196" r="2.5" fill="#34d399" />
            <circle cx="520" cy="310" r="2.5" fill="#22d3ee" />

            {/* 中心：智能体 */}
            <rect x="275" y="168" width="150" height="56" rx="10" fill="none" stroke="#a78bfa" strokeWidth="1.6" />
            <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="350" y="190" textAnchor="middle">AI 智能体</text>
            <text fill="#8a8a94" fontSize="11" x="350" y="210" textAnchor="middle">Claude Code 这类工具</text>

            {/* 六个本领节点 */}
            <rect x="30" y="60" width="150" height="44" rx="8" fill="none" stroke="rgba(255,255,255,0.16)" />
            <text fontSize="13" x="105" y="82" textAnchor="middle" dominantBaseline="central" fill="#22d3ee">整理文件</text>
            <rect x="30" y="174" width="150" height="44" rx="8" fill="none" stroke="rgba(255,255,255,0.16)" />
            <text fontSize="13" x="105" y="196" textAnchor="middle" dominantBaseline="central" fill="#f472b6">处理表格 / 数据</text>
            <rect x="30" y="288" width="150" height="44" rx="8" fill="none" stroke="rgba(255,255,255,0.16)" />
            <text fontSize="13" x="105" y="310" textAnchor="middle" dominantBaseline="central" fill="#fbbf24">自动化杂活</text>
            <rect x="520" y="60" width="150" height="44" rx="8" fill="none" stroke="rgba(255,255,255,0.16)" />
            <text fontSize="13" x="595" y="82" textAnchor="middle" dominantBaseline="central" fill="#a78bfa">查资料 / 写作</text>
            <rect x="520" y="174" width="150" height="44" rx="8" fill="none" stroke="rgba(255,255,255,0.16)" />
            <text fontSize="13" x="595" y="196" textAnchor="middle" dominantBaseline="central" fill="#34d399">私人助理 / 老师</text>
            <rect x="520" y="288" width="150" height="44" rx="8" fill="none" stroke="rgba(255,255,255,0.16)" />
            <text fontSize="13" x="595" y="310" textAnchor="middle" dominantBaseline="central" fill="#22d3ee">连接更多工具</text>
          </svg>
        </Figure>

        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#22d3ee] before:opacity-55">
            <b className="text-ink"><span style={{ color: '#22d3ee' }}>整理文件：</span></b>批量重命名、把上百张照片按日期归类、把一堆文件统一转格式——动动嘴它就办了。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#f472b6] before:opacity-55">
            <b className="text-ink"><span style={{ color: '#f472b6' }}>处理表格 / 数据：</span></b>读 Excel / CSV，帮你汇总、算账、挑出异常、生成报表，甚至画个图。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#fbbf24] before:opacity-55">
            <b className="text-ink"><span style={{ color: '#fbbf24' }}>自动化杂活：</span></b>每天机械重复的操作，让它写个小流程，以后一句话一键搞定。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#a78bfa] before:opacity-55">
            <b className="text-ink"><span style={{ color: '#a78bfa' }}>查资料 / 写作：</span></b>联网搜资料、读网页、整理成笔记；帮你写文案、邮件、周报、翻译。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#34d399] before:opacity-55">
            <b className="text-ink"><span style={{ color: '#34d399' }}>私人助理 / 老师：</span></b>不懂就问、要做啥跟它说，它边查边干，还顺手把原理讲给你听。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#22d3ee] before:opacity-55">
            <b className="text-ink"><span style={{ color: '#22d3ee' }}>连接更多工具：</span></b>它能接上浏览器、数据库、各种软件和服务（业界叫 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>MCP</code>），本事越扩越大。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          所以它更像一个<strong className="text-ink">什么都能搭把手的"数字员工"</strong>：你负责说清楚要什么、把关结果，它负责把活儿干完。
          正因为这样，<strong className="text-ink">就算你完全不写代码，也值得装一个</strong>——它能成为你工作和生活里最能干的那个助手。
        </p>
        <Callout tone="bridge">↓ 回到正题。先用一张图，把下面这四个安装方案的关系理清楚。</Callout>
      </Section>

      <Rule />

      {/* ===== 四方案速览（关系图） ===== */}
      <Section
        id="overview"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="9" width="6" height="6" rx="1.5" />
            <rect x="15" y="3" width="6" height="6" rx="1.5" />
            <rect x="15" y="15" width="6" height="6" rx="1.5" />
            <path d="M9 11 l6 -5 M9 13 l6 5" />
          </svg>
        }
        title="四个主流方案，一张图看懂"
      >
        <p className="mt-[1.05rem]">
          关键要先建立一个心智：<strong className="text-ink">Claude Code 是一个"壳 / 工具"</strong>——它本身负责跟你对话、读写文件、执行命令，
          但真正"动脑子"的那个大模型，是可以<strong className="text-ink">换后端</strong>的：可以接<strong className="text-ink">官方 Claude</strong>，也可以接<strong className="text-ink">国产模型（如 Kimi K2）</strong>。
          另外，<strong className="text-ink">Codex</strong> 和 <strong className="text-ink">Kimi CLI</strong> 是另外两个<strong className="text-ink">同类工具</strong>，自带自己的模型。
        </p>

        <Figure caption={'Claude Code 是"壳"，背后接的模型可换（官方 Claude / 国产 Kimi K2）；Codex、Kimi CLI 则是另外两个同类的独立工具。'}>
          <svg viewBox="0 0 760 320" role="img" aria-label="Claude Code 作为工具壳可接不同模型后端，Codex 与 Kimi CLI 为同类独立工具" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="ar-ov" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#8a8a94" />
              </marker>
            </defs>

            {/* 中间：Claude Code 壳（紫） */}
            <g>
              <rect x="60" y="92" width="170" height="64" rx="10" fill="none" stroke="#a78bfa" strokeWidth="1.6" />
              <text fontFamily="'SFMono-Regular','Consolas',monospace" x="78" y="118" fill="#a78bfa" fontSize="12">$ claude</text>
              <text fill="#a78bfa" fontSize="13" fontWeight="600" x="145" y="139" textAnchor="middle">Claude Code</text>
              <text fill="#8a8a94" fontSize="11" x="145" y="178" textAnchor="middle">工具壳 · 本课程主力</text>
            </g>

            {/* 后端 1：官方 Claude（紫） */}
            <g>
              <rect x="470" y="48" width="200" height="50" rx="10" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
              <circle cx="492" cy="73" r="6" fill="none" stroke="#a78bfa" strokeWidth="1.4" />
              <text fill="#f5f5f7" fontSize="13" x="512" y="69">Claude（官方）</text>
              <text fill="#8a8a94" fontSize="11" x="512" y="86">Anthropic 自家模型</text>
            </g>

            {/* 后端 2：Kimi K2 / 国产模型（青） */}
            <g>
              <rect x="470" y="150" width="200" height="50" rx="10" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
              <circle cx="492" cy="175" r="6" fill="none" stroke="#22d3ee" strokeWidth="1.4" />
              <text fill="#f5f5f7" fontSize="13" x="512" y="171">Kimi K2 / 国产模型</text>
              <text fill="#8a8a94" fontSize="11" x="512" y="188">换个后端也能跑</text>
            </g>

            {/* 壳 -> 两个后端的连线 */}
            <path d="M230 116 C 350 98, 380 73, 466 73" fill="none" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-ov)" />
            <path d="M230 138 C 350 158, 380 175, 466 175" fill="none" stroke="#8a8a94" strokeWidth="1.3" strokeDasharray="4 4" markerEnd="url(#ar-ov)" />
            <text fill="#8a8a94" fontSize="11" x="350" y="84" textAnchor="middle">接官方</text>
            <text fill="#8a8a94" fontSize="11" x="350" y="168" textAnchor="middle">或换后端</text>

            {/* 分隔虚线 */}
            <line x1="40" y1="240" x2="720" y2="240" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 4" />
            <text fill="#8a8a94" fontSize="11" x="40" y="232" textAnchor="start">—— 另外两个同类独立工具 ——</text>

            {/* 独立工具 1：Codex（青） */}
            <g>
              <rect x="60" y="258" width="300" height="48" rx="10" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
              <text fontFamily="'SFMono-Regular','Consolas',monospace" x="78" y="282" fill="#22d3ee" fontSize="12">$ codex</text>
              <text fill="#f5f5f7" fontSize="13" x="150" y="282">Codex</text>
              <text fill="#8a8a94" fontSize="11" x="78" y="298">OpenAI 的同类终端工具，用法相近</text>
            </g>

            {/* 独立工具 2：Kimi CLI（琥珀） */}
            <g>
              <rect x="400" y="258" width="300" height="48" rx="10" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
              <text fontFamily="'SFMono-Regular','Consolas',monospace" x="418" y="282" fill="#fbbf24" fontSize="12">$ kimi</text>
              <text fill="#f5f5f7" fontSize="13" x="478" y="282">Kimi CLI</text>
              <text fill="#8a8a94" fontSize="11" x="418" y="298">国产，直接用 Kimi 账号，门槛低</text>
            </g>
          </svg>
        </Figure>

        <p className="mt-[2.2rem]">四个方案各一句话定位：</p>
        <Terms
          items={[
            {
              term: 'Claude Code + 官方',
              gloss: <>本课程<strong className="text-ink">核心主力</strong>。有 Claude 订阅或 Anthropic API key 就能直接用，体验最完整。</>,
            },
            {
              term: 'Codex（OpenAI）',
              gloss: <>OpenAI 出的同类终端工具，用法跟 Claude Code 很像。有 ChatGPT 套餐可直接登录。</>,
            },
            {
              term: 'Kimi CLI（国产）',
              gloss: <>月之暗面（Moonshot）出的同类工具，<strong className="text-ink">直接用 Kimi 账号</strong>，国内上手门槛最低。</>,
            },
            {
              term: 'Kimi 驱动 Claude Code',
              gloss: <>仍把 Claude Code 当主力，但<strong className="text-ink">模型后端换成 Kimi K2</strong>——没有 Claude 账号时的兜底方案。</>,
            },
          ]}
        />
        <Callout tone="bridge">↓ 但在敲第一行命令之前，先花两分钟，把每个工具都要用到的"黑框"本身弄明白。</Callout>
      </Section>

      <Rule />

      {/* ===== 终端基础：先会用黑框 ===== */}
      <Section
        id="terminal"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 9 l3 3 l-3 3" />
            <circle cx="15" cy="16" r="0.6" fill="#fbbf24" stroke="none" />
            <path d="M14 16 h3" />
          </svg>
        }
        title={<span style={{ color: '#fbbf24' }}>先会用"黑框"——两分钟搞懂终端</span>}
      >
        <p className="mt-[1.05rem]">
          <strong className="text-ink">1.1 里我们说过</strong>：终端就是那个"敲一行命令、回车就执行"的黑框。概念你已经有了，这一节只补<strong className="text-ink">真正上手时会卡住的几个操作</strong>——怎么打开它、怎么把命令粘进去、以及一两个让新手懵掉的小细节。把这套弄顺，后面所有安装、登录都不慌。
        </p>

        <p className="mt-[1.8rem]"><strong className="text-ink">第一步：把它打开。</strong></p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">Windows：</b>点开始菜单，<strong className="text-ink">直接打字搜 "PowerShell"</strong>，点开第一个就是。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">Mac：</b>按 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>⌘ + 空格</code> 打开聚焦搜索，输入<strong className="text-ink">"终端"</strong>回车；也能在"应用程序 → 实用工具"里找到它。
          </li>
        </ul>

        <p className="mt-[1.8rem]"><strong className="text-ink">第二步：认清"提示符"，别把它也敲进去。</strong></p>
        <p className="mt-[1.05rem]">
          1.1 提过：行首那串是<strong className="text-ink">"提示符"</strong>，意思是"轮到你输入了"。在你电脑上它可能长成 Windows 的 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>{'PS C:\\Users\\你>'}</code>、
          或 Mac 的 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>你的名字@MacBook ~ %</code>——<strong className="text-ink">这串是系统自己打印的，不用你敲</strong>，你只敲它<strong className="text-ink">后面</strong>那段命令。所以<strong className="text-ink">本课命令框里只给"该敲的部分"</strong>，不带这些前缀，照着复制就行。
        </p>

        <Figure caption="终端窗口里，灰色提示符是系统自带的、不用动；你只负责后面那段命令，敲完按回车。">
          <svg viewBox="0 0 540 188" role="img" aria-label="终端窗口示意：区分系统提示符与你要敲的命令" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '540px', margin: '0 auto' }}>
            <rect x="1" y="1" width="538" height="186" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
            <line x1="1" y1="38" x2="539" y2="38" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="24" cy="19" r="5" fill="#fbbf24" />
            <circle cx="42" cy="19" r="5" fill="rgba(255,255,255,0.25)" />
            <circle cx="60" cy="19" r="5" fill="rgba(255,255,255,0.18)" />

            {/* 命令行 */}
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="26" y="86" fontSize="13">
              <tspan fill="#8a8a94">PS C:\Users\你{'>'} </tspan><tspan fill="#f5f5f7">claude --version</tspan>
            </text>

            {/* 标注：提示符 */}
            <line x1="82" y1="96" x2="82" y2="122" stroke="#8a8a94" strokeWidth="1" />
            <circle cx="82" cy="122" r="2" fill="#8a8a94" />
            <text fontSize="11.5" x="26" y="142" fill="#8a8a94">系统提示符 · 不用敲</text>

            {/* 标注：你敲的部分 */}
            <line x1="220" y1="96" x2="220" y2="122" stroke="#fbbf24" strokeWidth="1" />
            <circle cx="220" cy="122" r="2" fill="#fbbf24" />
            <text fontSize="11.5" x="182" y="142" fill="#fbbf24">这段才是你敲 / 粘贴的</text>
            <text fontSize="11.5" x="182" y="164" fill="#8a8a94">敲完按一下回车（Enter）执行</text>
          </svg>
        </Figure>

        <p className="mt-[1.8rem]"><strong className="text-ink">第三步：把命令粘进去、按回车。</strong></p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">粘贴：</b>本课命令都能复制，不用手敲。<strong className="text-ink">Windows（PowerShell）</strong>在窗口里<strong className="text-ink">点右键</strong>就粘上了（或 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>Ctrl + V</code>）；<strong className="text-ink">Mac（终端）</strong>用 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>⌘ + V</code>（注意 Mac 里右键、<code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>Ctrl + V</code> 通常粘不进去）。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">执行：</b>粘好后按<strong className="text-ink">一下回车（Enter）</strong>，然后<strong className="text-ink">等它自己跑完</strong>——别狂敲键盘、别关窗口。看到光标重新闪、又出现提示符，就是这条跑完了。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">可能让你输密码：</b>装东西有时会要<strong className="text-ink">开机密码</strong>（管理员权限）。Mac 上输密码时<strong className="text-ink">屏幕一个字符都不显示（连圆点也没有）是正常的</strong>，盲打完直接回车即可。
          </li>
        </ul>

        <Callout tone="note" label="进阶但常用">
          <p>
            后面有些工具要求"<strong className="text-ink">在某个项目文件夹里</strong>"启动。最省事的办法不是去记命令，而是<strong className="text-ink">直接从那个文件夹打开终端</strong>：
          </p>
          <p>
            <strong className="text-ink">Windows：</strong>打开目标文件夹，在空白处<strong className="text-ink">按住 Shift 点右键</strong> →「在此处打开 PowerShell 窗口 / 终端」。
          </p>
          <p>
            <strong className="text-ink">Mac：</strong>在文件夹上<strong className="text-ink">点右键 → 服务 →「新建位于文件夹位置的终端窗口」</strong>（或把文件夹图标直接<strong className="text-ink">拖进</strong>终端窗口）。
          </p>
          <p>
            这样打开的终端，"当前位置"就是那个文件夹，直接启动工具就行，省去记路径的麻烦。
          </p>
        </Callout>
        <Callout tone="bridge">↓ 黑框会用了。下面正式装核心主力——Claude Code。</Callout>
      </Section>

      <Rule />

      {/* ===== 安装 Claude Code ===== */}
      <Section
        id="install-claude"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M7 9 l3 3 l-3 3 M13 15 h4" />
          </svg>
        }
        title={<span style={{ color: '#a78bfa' }}>安装 Claude Code（核心主力）</span>}
      >
        <p className="mt-[1.05rem]">
          别紧张，全程就是<strong className="text-ink">"打开终端、粘一行命令、回车"</strong>——终端怎么打开、怎么粘贴，上一节刚讲过。
          Windows 这边还<strong className="text-ink">建议先装一个 Git for Windows</strong>：这几个工具都拿它当底层 shell，到 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>git-scm.com</code> 下载、一路下一步装好即可（Mac 可跳过）。
        </p>
        <p className="mt-[1.05rem]">打开终端后，按你的系统把下面对应的<strong className="text-ink">那行安装命令</strong>复制进去、回车：</p>
        <Cmd>
          {'Windows（PowerShell）\nirm https://claude.ai/install.ps1 | iex\n\nmacOS / Linux\ncurl -fsSL https://claude.ai/install.sh | bash\n\n可选：已装好 Node 18+ 的话，也能用 npm 装\nnpm install -g @anthropic-ai/claude-code'}
        </Cmd>
        <p className="mt-[1.05rem]">
          <b className="text-ink">启动并登录：</b>用上一节"从文件夹打开终端"的办法，进到<strong className="text-ink">任意一个文件夹</strong>，敲 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>claude</code> 回车。
        </p>
        <Cmd>{'claude'}</Cmd>
        <p className="mt-[1.05rem]"><strong className="text-ink">第一次启动</strong>会有几句英文引导，照着选就行，别被吓到：</p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            先让你挑一个<strong className="text-ink">配色主题</strong>——随便选，回车。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            再问<strong className="text-ink">是否信任当前文件夹</strong>（"Do you trust the files in this folder?"）——选 <strong className="text-ink">Yes</strong> 回车。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            然后它会<strong className="text-ink">自动打开浏览器让你登录</strong>：用 Claude 账号登录、点同意授权；浏览器会显示<strong className="text-ink">一段授权码</strong>，把它<strong className="text-ink">复制、粘回终端、回车</strong>，就登录好了。（也可以改用 Anthropic 控制台里的 API key。）
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          <b className="text-ink">验证：</b>运行下面这行，<strong className="text-ink">能打印出版本号就说明装好了</strong>。
          如果提示"找不到命令 / command not found"，多半是<strong className="text-ink">把终端关掉重开一次</strong>就好（让系统重新认到它）。
        </p>
        <Cmd>{'claude --version'}</Cmd>
        <Callout tone="bridge">↓ 这就是核心主力。下面三个方案，有兴趣或有需要再看；没需要直接跳到"验证"也行。</Callout>
      </Section>

      <Rule />

      {/* ===== 安装 Codex ===== */}
      <Section
        id="install-codex"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M8 9 l-3 3 l3 3 M16 9 l3 3 l-3 3" />
          </svg>
        }
        title={<span style={{ color: '#22d3ee' }}>安装 Codex（OpenAI）</span>}
      >
        <p className="mt-[1.05rem]">
          Codex 是 OpenAI 的同类终端工具，<strong className="text-ink">用法和 Claude Code 几乎一样</strong>。它通过 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>npm</code> 安装，而 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>npm</code> 是 <strong className="text-ink">Node</strong> 自带的工具，所以得<strong className="text-ink">先有 Node（要 22 以上版本）</strong>。
        </p>
        <p className="mt-[1.05rem]">
          <b className="text-ink">先查有没有 Node：</b>在终端敲下面这行。<strong className="text-ink">能打印出 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>v22</code> 或更高就行</strong>；
          如果提示找不到命令、或版本低于 22，就到 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>nodejs.org</code> 下载 <strong className="text-ink">LTS 版</strong>、一路下一步装好，<strong className="text-ink">重开终端</strong>再继续。
        </p>
        <Cmd>{'node --version'}</Cmd>
        <p className="mt-[1.05rem]">Node 就绪后，安装 Codex：</p>
        <Cmd>{'npm install -g @openai/codex'}</Cmd>
        <p className="mt-[1.05rem]">
          <b className="text-ink">登录：</b>运行 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>codex</code>，首次会按提示登录——
          有 <strong className="text-ink">ChatGPT 套餐（Plus / Pro 等）可直接登录</strong>、额度已包含在套餐里；或者用环境变量里的 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>OPENAI_API_KEY</code>。
        </p>
        <Cmd>{'codex\n\n验证\ncodex --version'}</Cmd>
        <Callout tone="bridge">↓ 再看一个国产、上手门槛最低的：Kimi CLI。</Callout>
      </Section>

      <Rule />

      {/* ===== 安装 Kimi CLI ===== */}
      <Section
        id="install-kimi"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9 8 v8 M9 12 l5 -4 M9 12 l5 4" />
          </svg>
        }
        title={<span style={{ color: '#fbbf24' }}>安装 Kimi CLI（Moonshot，国产）</span>}
      >
        <p className="mt-[1.05rem]">
          Kimi CLI 是月之暗面（Moonshot）的同类工具，最大的好处是<strong className="text-ink">能直接用 Kimi 账号登录</strong>，国内上手最省事。
          Windows 同样建议<strong className="text-ink">先装好 Git for Windows</strong>。安装命令任选其一：
        </p>
        <Cmd>
          {'Windows（PowerShell）\nirm https://code.kimi.com/kimi-code/install.ps1 | iex\n\nmacOS / Linux\ncurl -fsSL https://code.kimi.com/kimi-code/install.sh | bash\n\n或用 npm（需 Node 22.19+）\nnpm install -g @moonshot-ai/kimi-code'}
        </Cmd>
        <p className="mt-[1.05rem]">
          <b className="text-ink">登录：</b>运行 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>kimi</code> 进去后，在对话框里输入斜杠命令 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>/login</code> 回车，会给你两种方式选：
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">扫码 / 设备码登录（推荐，最省事）：</b>终端会显示<strong className="text-ink">一个网址和一串验证码</strong>，用<strong className="text-ink">手机或电脑浏览器打开那个网址</strong>、登录你的 Kimi 账号、填入验证码确认——和"扫码登录网页"是一个意思，确认完终端就自动登录上了。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">填 API key：</b>到 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>platform.moonshot.cn</code> 控制台生成一个 key，粘进去也行。
          </li>
        </ul>
        <Cmd>{'kimi\n\n进去后在对话框里输入\n/login'}</Cmd>
        <Callout tone="bridge">↓ 如果你既想用 Claude Code 这套工作流、又没有 Claude 账号——下面这个组合方案就是为你准备的。</Callout>
      </Section>

      <Rule />

      {/* ===== Kimi 驱动 Claude Code ===== */}
      <Section
        id="claude-kimi"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="8" width="9" height="8" rx="2" />
            <rect x="15" y="6" width="7" height="12" rx="2" />
            <path d="M11 12 h4" strokeDasharray="2 2" />
          </svg>
        }
        title={<span style={{ color: '#22d3ee' }}>用 Kimi 驱动 Claude Code（国内 / 无 Claude 账号的兜底）</span>}
      >
        <p className="mt-[1.05rem]">
          这个方案的思路是：<strong className="text-ink">仍然把 Claude Code 当主力</strong>，工作流一模一样，
          只是把背后那个"动脑子的模型"<strong className="text-ink">从官方 Claude 换成 Kimi K2</strong>。适合没有 Claude 账号、或想用国产模型的人。
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">① 先装好 Claude Code：</b>就是前面那一步，确保 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>claude --version</code> 能正常打印版本。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">② 拿一个 Moonshot API key：</b>到 Moonshot 开放平台 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>platform.moonshot.cn</code> 注册登录，在控制台「API Key」处<strong className="text-ink">新建一个</strong>（一串密钥）。<strong className="text-ink">它一般只完整显示这一次，当场复制保存好</strong>，关掉就看不到了。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">③ 把这 3 项配置告诉 Claude Code：</b>等于跟它说"别连官方、改去连 Kimi"。下面给两种写法，<strong className="text-ink">推荐第一种（配一次、长期有效）</strong>。
          </li>
        </ul>
        <p className="mt-[1.05rem]">三个要设的变量，含义是这样：</p>
        <Terms
          items={[
            {
              term: 'ANTHROPIC_BASE_URL',
              gloss: <>请求改发到哪个地址。国内用 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>https://api.moonshot.cn/anthropic</code>；海外用 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>https://api.moonshot.ai/anthropic</code>。</>,
            },
            {
              term: 'ANTHROPIC_AUTH_TOKEN',
              gloss: <>填你第 ② 步拿到的 Moonshot API key。</>,
            },
            {
              term: 'ANTHROPIC_MODEL',
              gloss: <>用哪个型号，形如 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>kimi-k2…</code>（<strong className="text-ink">具体型号名会更新</strong>，以官方文档为准）。</>,
            },
          ]}
        />
        <p className="mt-[1.8rem]"><strong className="text-ink">写法一（推荐）：写进 Claude Code 的配置文件，配一次、以后一直生效。</strong></p>
        <p className="mt-[1.05rem]">
          在你的<strong className="text-ink">用户主目录</strong>下，找到（没有就<strong className="text-ink">新建</strong>）文件 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>.claude/settings.json</code>，填入下面这段。
          "用户主目录"在 Windows 是 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>C:\Users\你的用户名</code>、Mac 是 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>/Users/你的用户名</code>。
          Claude Code <strong className="text-ink">每次启动都会自动读它</strong>——以后<strong className="text-ink">照常敲 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>claude</code> 启动就会走 Kimi</strong>，不用再设变量、也不用重启电脑。
        </p>
        <Cmd>
          {'文件：~/.claude/settings.json（没有就新建）\n{\n  "env": {\n    "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",\n    "ANTHROPIC_AUTH_TOKEN": "你的 Moonshot API key",\n    "ANTHROPIC_MODEL": "kimi-k2…"\n  }\n}'}
        </Cmd>
        <Callout tone="note" label="两个小提示">
          <p>
            <strong className="text-ink">不想手动建文件？</strong>把 Claude Code 先装好、随便跑起来，直接对它说"<strong className="text-ink">帮我在 ~/.claude/settings.json 里写入这段配置</strong>"，让它替你建——这正是它最擅长的事。
          </p>
          <p>
            这个文件里有你的密钥，是<strong className="text-ink">你电脑上的私人文件</strong>：别外传、别截图发群、别传到网上或提交到代码仓库。
          </p>
        </Callout>

        <p className="mt-[1.8rem]"><strong className="text-ink">写法二（临时试一眼）：在终端里临时设，关窗口就失效。</strong></p>
        <p className="mt-[1.05rem]">
          只想先<strong className="text-ink">快速验证能不能跑通</strong>，可以临时设、当场启动。<strong className="text-ink">注意这种只在当前终端窗口有效，关掉就没了</strong>，下次还得重设——长期用请走写法一。
        </p>
        <Cmd>
          {'Windows（PowerShell）\n$env:ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"\n$env:ANTHROPIC_AUTH_TOKEN="你的 Moonshot API key"\n$env:ANTHROPIC_MODEL="kimi-k2…"\nclaude'}
        </Cmd>
        <Cmd>
          {'macOS / Linux\nexport ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"\nexport ANTHROPIC_AUTH_TOKEN="你的 Moonshot API key"\nexport ANTHROPIC_MODEL="kimi-k2…"\nclaude'}
        </Cmd>
        <Callout tone="analogy">
          <p>
            <strong className="text-ink">重点提示：</strong>上面的<strong className="text-ink">型号名（<code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>kimi-k2…</code>）和确切端点地址都会随官方更新而变动</strong>，
            这里只是示意。真正要配的时候，<strong className="text-ink">一律以 Moonshot / Kimi 官方"在 Claude Code 中使用"的文档为准</strong>，照着它给的最新值填。
          </p>
          <p>
            好处一句话：<strong className="text-ink">没有 Claude 账号、或想用国产模型，也能用上同一套 Claude Code 工作流</strong>——学的还是同一个工具，后面课程照样跟得上。
          </p>
        </Callout>
        <Callout tone="bridge">↓ 装的过程中，国内网络可能会拖后腿。下面专门说说怎么应对。</Callout>
      </Section>

      <Rule />

      {/* ===== 国内网络 ===== */}
      <Section
        id="network-cn"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12 h18 M12 3 a14 14 0 0 1 0 18 M12 3 a14 14 0 0 0 0 18" />
          </svg>
        }
        title={<span style={{ color: '#22d3ee' }}>国内网络：装不上 / 连不上怎么办</span>}
      >
        <p className="mt-[1.05rem]">
          实话实说：上面有些步骤在国内网络下可能会卡——安装脚本下载、<code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>npm</code> 下包、
          以及登录 / 调用<strong className="text-ink">官方 Claude（海外服务）</strong>时，可能很慢甚至连不上。
          <strong className="text-ink">这不是你装错了，是网络的事</strong>。下面三招按顺序试。
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">首选：用国产方案，从根上绕开。</b>
            直接用 <strong className="text-ink">Kimi CLI</strong>（国产、用 Kimi 账号），或用前面的 <strong className="text-ink">「Claude Code + Kimi」配置</strong>——
            它连的是国内端点 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>api.moonshot.cn</code>，走国内网络、稳定。GLM、MiniMax 同理。这样安装和使用都不依赖海外网络。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink"><code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>npm</code> 慢 / 失败：换国内镜像。</b>
            如果用 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>npm</code> 安装卡住，把下载源换成国内镜像再装，会快很多：
          </li>
        </ul>
        <Cmd>
          {'把 npm 源换成国内镜像\nnpm config set registry https://registry.npmmirror.com\n\n想换回官方源\nnpm config set registry https://registry.npmjs.org'}
        </Cmd>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">要用官方 Claude / Codex：需要稳定的国际网络。</b>
            它们是海外服务，国内直连常不稳。如果你有<strong className="text-ink">合规的网络代理 / 加速</strong>，让终端走代理后再安装、登录即可；
            没有的话，就走第 1 招用国产方案——课程后续以 Claude Code 为主力，<strong className="text-ink">用 Kimi 后端照样跟得上</strong>。
          </li>
        </ul>
        <Callout tone="note" label="关于「中转站」的一点忠告">
          <p>
            你大概率会刷到一些<strong className="text-ink">"中转站 / 镜像站"</strong>——号称低价就能用上 Claude、Codex。这里给点<strong className="text-ink">个人建议，帮你少踩坑</strong>：
          </p>
          <p>
            <strong className="text-ink">Claude Code：非常不建议买中转。</strong>官方封禁策略很严，市面上的第三方中转<strong className="text-ink">基本都不是"官方满血版"</strong>，多是从 Kiro、Cursor 这类渠道倒腾出来的，<strong className="text-ink">而且很不稳定</strong>，今天能用、明天可能就挂。要用 Claude Code，<strong className="text-ink">要么用官方账号，要么走前面的「Kimi 驱动」国产兜底</strong>，别在中转上花冤枉钱。
          </p>
          <p>
            <strong className="text-ink">Codex：可以考虑中转，但要会挑。</strong>它相对宽松些，不过同样存在<strong className="text-ink">"掺水 / 降配"</strong>的版本（偷偷换成小模型、限速等），<strong className="text-ink">认真挑、看口碑</strong>再买。
          </p>
          <p>
            一句话：<strong className="text-ink">能用官方就用官方</strong>；预算或渠道受限时，<strong className="text-ink">正规的国产方案（如 Kimi）也比来路不明的中转靠谱</strong>。
          </p>
        </Callout>
        <Callout tone="analogy">
          <p>
            一句话原则：<strong className="text-ink">能用国产端点就优先用国产端点</strong>——安装走 npm 镜像、模型走国内端点，
            把"必须连海外"的环节降到最低；实在要用官方服务，再考虑合规代理。
          </p>
        </Callout>
        <Callout tone="bridge">↓ 除了 Kimi，国产生态里还有不少同路数的模型，了解一下就好，不用现在装。</Callout>
      </Section>

      <Rule />

      {/* ===== 其他生态 ===== */}
      <Section
        id="ecosystem"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a8a94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2.5" />
            <circle cx="5" cy="6" r="2" />
            <circle cx="19" cy="6" r="2" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="19" cy="18" r="2" />
            <path d="M6.5 7.2 l4 3.4 M17.5 7.2 l-4 3.4 M6.5 16.8 l4 -3.4 M17.5 16.8 l-4 -3.4" />
          </svg>
        }
        title="其他生态（了解即可，不用装）"
      >
        <p className="mt-[1.05rem]">
          好消息是：<strong className="text-ink">很多国产大模型都提供了"Anthropic 兼容接口"</strong>。
          这意味着它们都能像上面的 Kimi 一样配进 Claude Code——
          把第 9 步里的 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>ANTHROPIC_BASE_URL</code> 和型号名<strong className="text-ink">换成对应厂商的值</strong>就行（<strong className="text-ink">具体以各家官方文档为准</strong>）。
          所以你现在<strong className="text-ink">不用挨个折腾</strong>，知道有这么回事即可。
        </p>
        <p className="mt-[1.8rem]"><strong className="text-ink">能配进 Claude Code 的国产模型（同 Kimi 路数）：</strong></p>
        <Terms
          items={[
            {
              term: 'GLM（智谱）',
              gloss: <>GLM 系列模型，有面向编程的套餐，可像 Kimi 一样配进 Claude Code。</>,
            },
            {
              term: 'MiniMax（海螺）',
              gloss: <>MiniMax 系列模型，同样提供 Anthropic 兼容接入。</>,
            },
            {
              term: '通义千问 Qwen（阿里）',
              gloss: <>阿里的 Qwen 系列，也有 Anthropic 兼容接入方式。</>,
            },
          ]}
        />
        <p className="mt-[1.8rem]"><strong className="text-ink">另外几种形态不同的工具（各一句话，知道即可）：</strong></p>
        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#8a8a94] before:opacity-55">
            <b className="text-ink">Cursor：</b>一款<strong className="text-ink">AI 代码编辑器</strong>——不是终端黑框，而是带界面的编辑器，AI 直接嵌在里面。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#8a8a94] before:opacity-55">
            <b className="text-ink">GitHub Copilot：</b><strong className="text-ink">编辑器里的 AI 补全</strong>——你敲代码它在旁边猜你下一行、自动补上。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-[#8a8a94] before:opacity-55">
            <b className="text-ink">Gemini CLI：</b>Google 出的<strong className="text-ink">终端工具</strong>，路数和 Claude Code、Codex 类似。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          再强调一遍：这些<strong className="text-ink">都只是"知道有这么回事"</strong>，不必现在折腾。把核心主力用熟，比收集一堆工具有用得多。
        </p>
        <Callout tone="bridge">↓ 不管你装了哪一个，最后都用同一招确认它真的能用了。</Callout>
      </Section>

      <Rule />

      {/* ===== 验证 ===== */}
      <Section
        id="verify"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M8.5 12 l2.3 2.3 l4.7 -4.9" />
          </svg>
        }
        title={<span style={{ color: '#22d3ee' }}>验证你装好了</span>}
      >
        <p className="mt-[1.05rem]">
          装完<strong className="text-ink">任意一个</strong>之后，做个小测试就知道成没成：
          进到<strong className="text-ink">任意一个文件夹</strong>，启动它（<code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>claude</code> / <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>codex</code> / <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>kimi</code>），
          然后<strong className="text-ink">给它派件小事</strong>，看它能不能正常回应、动手。比如：
        </p>
        <ul className="mt-[0.9rem] list-none p-0 text-ink-soft">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            让它："<strong className="text-ink">用一句话介绍这个文件夹里有什么</strong>"——看它能不能读懂、答上来。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            或者让它："<strong className="text-ink">新建一个 hello.txt，里面写一行字</strong>"——看它能不能真的动手建文件。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          只要它<strong className="text-ink">正常回应、或真的把活儿干了</strong>，就说明你已经装好、能用了。
        </p>

        <Figure caption="能听懂你的话、把小事办成——那就说明工具装好、可以开干了。">
          <svg viewBox="0 0 540 200" role="img" aria-label="终端里给工具派一件小事并得到回应的示意" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '540px', margin: '0 auto' }}>
            <rect x="1" y="1" width="538" height="198" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
            <line x1="1" y1="40" x2="539" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="26" cy="20" r="5" fill="#fbbf24" />
            <circle cx="44" cy="20" r="5" fill="rgba(255,255,255,0.25)" />
            <circle cx="62" cy="20" r="5" fill="rgba(255,255,255,0.18)" />
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="270" y="25" textAnchor="middle" fill="#8a8a94" fontSize="12">在文件夹里给它派个小活</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="26" y="74" fontSize="13">
              <tspan fill="#fbbf24">{'>'}</tspan><tspan fill="#d4d4d8"> 新建一个 hello.txt，写一行字</tspan>
            </text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="26" y="100" fontSize="12" fill="#8a8a94">  已创建 hello.txt …</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="26" y="124" fontSize="12" fill="#22d3ee">  ✓ 完成</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="26" y="160" fontSize="13">
              <tspan fill="#fbbf24">{'>'}</tspan><tspan fill="#d4d4d8"> </tspan><tspan fill="#f5f5f7">▋</tspan>
            </text>
          </svg>
        </Figure>
      </Section>

      <Rule />

      {/* ===== 小结 ===== */}
      <Callout tone="closing">
        <h2 className="mb-[0.4rem] flex items-center gap-[0.62rem] text-[1.45rem] font-[650] leading-snug tracking-[-0.01em] text-ink">
          <span className="inline-flex flex-none" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M8.5 12 l2.3 2.3 l4.7 -4.9" />
            </svg>
          </span>
          一句话记住
        </h2>
        <p className="text-[1.02rem] text-ink leading-[2.1]">
          这些工具<strong className="text-ink">本是同一类</strong>、装法都像、用法相通——<strong className="text-ink">挑一个装好就能开干</strong>，不必都装、不必内耗；
          <span style={{ color: '#a78bfa' }}>本课程后续以 <strong className="text-ink">Claude Code</strong> 为主力</span>，
          国内或没账号就用 <span style={{ color: '#fbbf24' }}>Kimi 配置方案</span>兜底，其余<strong className="text-ink">了解即可</strong>。
        </p>
        <p className="mt-[1.05rem] text-ink-soft">
          装好了、也验证能跑了，你就已经握住了进入开发世界的"那把钥匙"。
          下一节，我们就动手<strong className="text-ink">设计属于你自己的 AI 编程工作流</strong>——把"提需求 → 看产出 → 读报错 → 再交流"这套节奏跑顺，让它真正替你干活。
        </p>
      </Callout>
    </>
  )
}
