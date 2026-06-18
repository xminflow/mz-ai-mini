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
  Prompt,
} from '@/components/content'

/**
 * 课件 1.4 用 AI 做出第一版能本地打开的网页
 * 以企业官网首页为例，结合 Vite + TypeScript 工程，完整跑一遍「描述 → 生成 → 调整」闭环。
 * 关键约束：全程不让读者敲任何命令——连"创建项目/装依赖/启动预览"都由 AI 执行；
 *   读者只做三件事：描述、在浏览器打开看、提调整。承接 1.2（已装好 claude）/1.3（闭环）。
 * 约定：正文列表柔白（text-ink-soft）、配图为手写内联 SVG（线 + 圆点，深色 + 品牌色）。
 */
export default function Lesson(): React.JSX.Element {
  return (
    <>
      {/* ===== 头部 ===== */}
      <header>
        <Eyebrow chapter="AI 基础工具学习" index="第四节" />
        <LessonTitle>用 AI 做出第一版能本地打开的网页</LessonTitle>
        <Lead>
          前三节是热身，这一节<strong>真动手</strong>：以一个<strong>公司官网首页</strong>为例，
          用 AI 从零做出<strong>第一版能在你电脑上打开的网页</strong>，
          完整跑一遍 1.3 的<strong>「描述 → 生成 → 调整」</strong>。
          全程<strong>你一行命令都不用敲</strong>——连"搭项目"都交给它。
        </Lead>
      </header>

      {/* ===== 本节你会搞懂 ===== */}
      <section>
        <KeyPoints
          title="本节你会搞懂"
          items={[
            <>亲手做出<strong>第一个能本地打开的网页</strong>（一个公司官网首页）</>,
            <>完整走一遍<strong>描述 → 生成 → 调整</strong>闭环</>,
            <>"能本地打开"到底什么意思、网址 <strong>localhost</strong> 是啥</>,
            <>Vite、TypeScript 是<strong>搭架子的工具</strong>——AI 来用，你不用懂</>,
            <>连<strong>创建项目</strong>都让 AI 干，你只说一句话</>,
            <>改完<strong>浏览器自动刷新</strong>（热更新）是怎么回事</>,
            <>装依赖慢、端口被占、冒报错——<strong>常见小状况怎么破</strong></>,
          ]}
        />
      </section>

      <Rule />

      {/* ===== 目标 + 本地打开是什么 ===== */}
      <Section
        id="goal"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3.4" />
            <path d="M12 2 v3 M12 19 v3 M2 12 h3 M19 12 h3" />
          </svg>
        }
        title={<span style={{ color: '#22d3ee' }}>这一节要做出什么</span>}
      >
        <p className="mt-[1.05rem]">
          目标很具体：做出一个<strong className="text-ink">公司官网首页（落地页）</strong>——
          别人搜到你公司、点进来看到的<strong className="text-ink">第一屏</strong>：
          一句大标题、一句副标题、<strong className="text-ink">三块介绍</strong>你们是做什么的、最下面一个<strong className="text-ink">"联系我们"</strong>按钮。
        </p>
        <p className="mt-[1.05rem]">
          标题里的<strong className="text-ink">"能本地打开"</strong>是关键，先说清楚它什么意思：
        </p>
        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">不是先发到网上，</b>而是<strong className="text-ink">先在你自己这台电脑上跑起来</strong>，用浏览器打开一个像 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>http://localhost:5173</code> 的网址就能看到。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink"><code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>localhost</code> 就是"你这台电脑自己"。</b>这个网址<strong className="text-ink">只有你能打开</strong>，别人看不到——正适合一边做、一边改、一边看效果。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">先在本地做好，</b>等你满意了，<strong className="text-ink">以后再考虑发到公网</strong>让所有人能访问（那是后面的事，这节不碰）。
          </li>
        </ul>
        <Callout tone="bridge">↓ 做正经网页，得先有个"架子"。下面认识两个搭架子的工具——别紧张，AI 来用。</Callout>
      </Section>

      <Rule />

      {/* ===== Vite + TS 工具（AI 来用） ===== */}
      <Section
        id="scaffold"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <path d="M14 17 h7 M17.5 14 v7" />
          </svg>
        }
        title={<span style={{ color: '#a78bfa' }}>两个"搭架子"的工具（AI 来用，你不用懂）</span>}
      >
        <p className="mt-[1.05rem]">
          做正经网页，一般<strong className="text-ink">不会写一个孤零零的网页文件</strong>，
          而是搭一个<strong className="text-ink">"前端工程"</strong>：有标准结构、能实时预览、以后好扩展。
          搭这个架子，会用到下面两样东西——名字你听个脸熟就好：
        </p>
        <Terms
          items={[
            {
              term: 'Vite',
              gloss: <>一个<strong className="text-ink">前端脚手架 + 本地预览服务器</strong>。它帮你把项目架子搭好，还提供那个能实时预览的<strong className="text-ink">本地网址</strong>；你改完代码，浏览器会<strong className="text-ink">自动刷新</strong>（这叫"热更新"）。</>,
            },
            {
              term: 'TypeScript（TS）',
              gloss: <>JavaScript 的"加强版"，做大一点的项目时更稳、更少出错。<strong className="text-ink">你不用懂它</strong>，AI 用它来写就行。</>,
            },
          ]}
        />
        <Callout tone="analogy">
          <p>
            重点就一句：<strong className="text-ink">这两样你都不用懂、不用自己装</strong>——
            连"用它们搭项目"这一步，<strong className="text-ink">都是 AI 替你做</strong>。
            你要做的还是 1.3 那三件事：<strong className="text-ink">描述、看、调整</strong>。
          </p>
        </Callout>
        <Callout tone="bridge">↓ 准备工作就这些。正式开始——第一步：描述。</Callout>
      </Section>

      <Rule />

      {/* ===== ① 描述 ===== */}
      <Section
        id="describe"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5 h16 a1 1 0 0 1 1 1 v9 a1 1 0 0 1 -1 1 h-9 l-4 3 v-3 h-3 a1 1 0 0 1 -1 -1 v-9 a1 1 0 0 1 1 -1 z" />
            <path d="M8 9 h8 M8 12 h5" />
          </svg>
        }
        title={<span style={{ color: '#a78bfa' }}>① 描述：说清第一句话</span>}
      >
        <p className="mt-[1.05rem]">
          <b className="text-ink">先做准备（接 1.2 / 1.3）：</b>
          在桌面<strong className="text-ink">新建一个空文件夹</strong>（比如叫"我的官网"），
          然后<strong className="text-ink">在这个文件夹里打开你装好的 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>claude</code></strong>——
          Windows 在文件夹里 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>Shift+右键</code> 打开终端、敲 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>claude</code>；
          Mac 在文件夹上右键用"服务"打开终端、敲 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>claude</code>。
        </p>
        <p className="mt-[1.05rem]">
          进去后，把<strong className="text-ink">"用什么搭"和"做成什么样"一起讲清楚</strong>，发给它。
          你可以照着下面这句说（按你公司的实际情况改文字）：
        </p>
        <Prompt>
          用 <strong className="text-ink">Vite + TypeScript</strong> 帮我搭一个前端项目，做一个<strong className="text-ink">公司官网首页</strong>：
          顶部一句大标题写<strong className="text-ink">"让品牌被看见"</strong>，下面一句副标题；
          中间放<strong className="text-ink">三块介绍</strong>我们是做什么的；最下面一个<strong className="text-ink">"联系我们"</strong>按钮。
          整体简洁、专业、配色淡雅。<strong className="text-ink">搭好后帮我启动本地预览。</strong>
        </Prompt>
        <p className="mt-[1.05rem]">
          最后那句<strong className="text-ink">"帮我启动本地预览"</strong>很关键——它会顺手把网页<strong className="text-ink">跑起来</strong>给你，省得你操心。
        </p>
        <Callout tone="bridge">↓ 回车。接下来轮到它表演——这一步你基本只用看着。</Callout>
      </Section>

      <Rule />

      {/* ===== ② 生成 ===== */}
      <Section
        id="generate"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 l1.6 4 L18 8.5 l-4.4 1.5 L12 14 l-1.6-4 L6 8.5 l4.4-1.5 z" />
            <path d="M18 14 l.8 2 l2 .8 l-2 .8 l-.8 2 l-.8-2 l-2-.8 l2-.8 z" />
          </svg>
        }
        title={<span style={{ color: '#22d3ee' }}>② 生成：它把项目搭起来、跑起来</span>}
      >
        <p className="mt-[1.05rem]">
          你回车后，AI 就开始<strong className="text-ink">替你干一连串活</strong>。
          <strong className="text-ink">你不用敲任何命令</strong>，只需要在它问你的时候点个头：
        </p>
        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">建项目：</b>用 Vite + TypeScript 把项目骨架搭好（这一步它自己跑命令完成，你不用管）。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">装依赖：</b>它会跑类似 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>npm install</code> 的步骤，把网页需要的"零件"下载齐。<strong className="text-ink">中途它可能弹一句"要执行这个命令吗？"——看一眼、同意（回车）就行。</strong>
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">写页面：</b>把你要的大标题、三块介绍、联系按钮都写出来。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">启动预览：</b>跑起本地预览服务器，给你一个网址，像 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>http://localhost:5173</code>。
          </li>
        </ul>
        <Cmd tone="muted" label="AI 在背后跑这些（你不用敲）">
          {'npm create vite@latest   # 搭项目骨架\nnpm install              # 装依赖（下载零件）\nnpm run dev              # 启动本地预览，给你 localhost 网址'}
        </Cmd>
        <p className="mt-[1.05rem]">
          <strong className="text-ink">把这个网址复制到浏览器打开</strong>——
          <strong className="text-ink">这就是你做出的第一版网页！</strong>
          可能还不够好看，但它是你的，而且<strong className="text-ink">"描述 → 生成"已经跑通了</strong>。
        </p>

        <Figure caption="浏览器打开 localhost:5173，你的第一版官网首页就出来了——这一刻，描述 → 生成 跑通了。">
          <svg viewBox="0 0 620 380" role="img" aria-label="浏览器在 localhost 打开的第一版公司官网首页示意" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '620px', margin: '0 auto' }}>
            {/* 浏览器窗口 */}
            <rect x="1" y="1" width="618" height="378" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
            <line x1="1" y1="46" x2="619" y2="46" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="24" cy="23" r="5" fill="#34d399" />
            <circle cx="42" cy="23" r="5" fill="rgba(255,255,255,0.25)" />
            <circle cx="60" cy="23" r="5" fill="rgba(255,255,255,0.18)" />
            {/* 地址栏 */}
            <rect x="86" y="12" width="430" height="22" rx="11" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="100" y="27" fill="#8a8a94" fontSize="11.5">localhost:5173</text>

            {/* 页面：大标题 + 副标题 */}
            <text x="310" y="116" textAnchor="middle" fill="#f5f5f7" fontSize="27" fontWeight="700">让品牌被看见</text>
            <text x="310" y="146" textAnchor="middle" fill="#8a8a94" fontSize="13">用内容，让对的人看见你</text>

            {/* 三块介绍 */}
            <g>
              <rect x="44" y="186" width="150" height="92" rx="10" fill="none" stroke="#a78bfa" strokeWidth="1.3" />
              <circle cx="69" cy="212" r="6" fill="none" stroke="#a78bfa" strokeWidth="1.3" />
              <text x="119" y="240" textAnchor="middle" fill="#d4d4d8" fontSize="13">我们是谁</text>
              <line x1="64" y1="258" x2="174" y2="258" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
            </g>
            <g>
              <rect x="235" y="186" width="150" height="92" rx="10" fill="none" stroke="#22d3ee" strokeWidth="1.3" />
              <circle cx="260" cy="212" r="6" fill="none" stroke="#22d3ee" strokeWidth="1.3" />
              <text x="310" y="240" textAnchor="middle" fill="#d4d4d8" fontSize="13">做什么</text>
              <line x1="255" y1="258" x2="365" y2="258" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
            </g>
            <g>
              <rect x="426" y="186" width="150" height="92" rx="10" fill="none" stroke="#fbbf24" strokeWidth="1.3" />
              <circle cx="451" cy="212" r="6" fill="none" stroke="#fbbf24" strokeWidth="1.3" />
              <text x="501" y="240" textAnchor="middle" fill="#d4d4d8" fontSize="13">怎么找我们</text>
              <line x1="446" y1="258" x2="556" y2="258" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
            </g>

            {/* 联系我们按钮 */}
            <rect x="248" y="316" width="124" height="38" rx="19" fill="none" stroke="#34d399" strokeWidth="1.5" />
            <text x="310" y="340" textAnchor="middle" fill="#34d399" fontSize="13.5" fontWeight="600">联系我们</text>
          </svg>
        </Figure>
        <Callout tone="bridge">↓ 第一版有了，但十有八九还差点意思。最后一步——边看边改。</Callout>
      </Section>

      <Rule />

      {/* ===== ③ 调整 ===== */}
      <Section
        id="adjust"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 11 a8 8 0 1 0 -1.5 5" />
            <path d="M20 5 v4 h-4" />
          </svg>
        }
        title={<span style={{ color: '#fbbf24' }}>③ 调整：边看边改，自动刷新</span>}
      >
        <p className="mt-[1.05rem]">
          第一版十有八九不完美，<strong className="text-ink">正常</strong>。接下来就是 1.3 的"再交流"：
          <strong className="text-ink">具体说哪里不对、想要啥样</strong>，它改。
          而且<strong className="text-ink">你不用刷新、不用重启</strong>——它改完、文件一存，
          浏览器里的页面<strong className="text-ink">自己就更新了</strong>（这就是前面说的<strong className="text-ink">热更新</strong>）。
        </p>
        <p className="mt-[1.05rem]">比如你可以一条条这样说（说一条、看一眼，再说下一条）：</p>
        <Prompt>标题再大一点、再加粗。</Prompt>
        <Prompt>配色太深，主色换成淡蓝、背景米白。</Prompt>
        <Prompt>三块介绍各配一个小图标。</Prompt>
        <Prompt>按钮放大、改成蓝色，鼠标放上去有点反应。</Prompt>
        <p className="mt-[1.05rem]">
          <strong className="text-ink">一次改一点、边改边看</strong>（接 1.3）。改到你觉得"<strong className="text-ink">就是它了</strong>"，
          <strong className="text-ink">你的第一版能本地打开的网页就成了</strong>——第一次完整闭环，也就跑完了。
        </p>

        <Figure caption="一次真实的调整大概就长这样：你指、它改、浏览器自动刷新——几个来回就成。">
          <svg viewBox="0 0 560 250" role="img" aria-label="与 AI 调整网页的对话示意，含热更新自动刷新" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '560px', margin: '0 auto' }}>
            <rect x="1" y="1" width="558" height="248" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
            <line x1="1" y1="40" x2="559" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="26" cy="20" r="5" fill="#fbbf24" />
            <circle cx="44" cy="20" r="5" fill="rgba(255,255,255,0.25)" />
            <circle cx="62" cy="20" r="5" fill="rgba(255,255,255,0.18)" />
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="280" y="25" textAnchor="middle" fill="#8a8a94" fontSize="12">边看边改</text>

            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="74" fontSize="12.5">
              <tspan fill="#a78bfa">你 ›</tspan><tspan fill="#d4d4d8"> 标题大一点，主色换淡蓝，按钮放大改蓝色</tspan>
            </text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="100" fontSize="12" fill="#8a8a94">   已更新标题、配色、按钮 …</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="122" fontSize="12" fill="#34d399">   ✓ 浏览器已自动刷新，看一眼</text>

            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="158" fontSize="12.5">
              <tspan fill="#a78bfa">你 ›</tspan><tspan fill="#d4d4d8"> 三块介绍各加个小图标</tspan>
            </text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="184" fontSize="12" fill="#8a8a94">   已加上图标 …</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="206" fontSize="12" fill="#34d399">   ✓ 自动刷新好了，这版就很不错</text>

            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="234" fontSize="12.5">
              <tspan fill="#a78bfa">你 ›</tspan><tspan fill="#d4d4d8"> </tspan><tspan fill="#f5f5f7">▋</tspan>
            </text>
          </svg>
        </Figure>
        <Callout tone="bridge">↓ 过程里可能撞上几个小状况，别慌——下面给你兜底。</Callout>
      </Section>

      <Rule />

      {/* ===== 小状况 ===== */}
      <Section
        id="trouble"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8a8a94" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M9.5 9.5 a2.5 2.5 0 1 1 3.2 3.4 c-.7.4-1.2.9-1.2 1.6 M12 17.5 h0.01" />
          </svg>
        }
        title="可能遇到的小状况（不慌，都有解）"
      >
        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">装依赖很慢 / 卡住：</b>多半是国内网络的事（1.2 讲过）。跟它说"<strong className="text-ink">把 npm 源换成国内镜像再装</strong>"，或你自己照 1.2 的命令换，会快很多。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">提示"端口被占用"：</b>说明 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>5173</code> 被别的程序占了。跟它说"<strong className="text-ink">换个端口启动</strong>"即可，它会给你一个新网址。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">冒出红字报错：</b>照 1.3 的办法——<strong className="text-ink">把整段红字复制给它</strong>，说清你刚做了什么，它定位修好。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">网页打不开 / 一片空白：</b>先确认那个 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>localhost</code> 网址<strong className="text-ink">没复制错</strong>、预览还在运行；还不行就把现象告诉它。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          一句话：<strong className="text-ink">遇到状况，不是你搞砸了</strong>——
          把现象（最好连报错）告诉它，它基本都能帮你解决。
        </p>
      </Section>

      <Rule />

      {/* ===== 总结 ===== */}
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
          你刚刚<strong className="text-ink">亲手做出了第一个能本地打开的网页</strong>，
          还完整跑了一遍<strong className="text-ink">描述 → 生成 → 调整</strong>：
          你说需求、<span style={{ color: '#22d3ee' }}>AI 用 Vite + TypeScript 搭项目、写页面、跑起来</span>、
          你在浏览器 <code className="rounded px-[0.4em] py-[0.1em] font-mono text-[0.86em] text-[#e7e7ea]" style={{ background: 'rgba(255,255,255,0.06)' }}>localhost</code> 看着改。
          <strong className="text-ink">全程没敲一行命令、没写一行代码。</strong>
        </p>
        <p className="mt-[1.05rem] text-ink-soft">
          到这里，<strong className="text-ink">第一课时</strong>就齐了：认识开发世界、装好工具、学会"指挥"、做出第一版。
          下一课时，我们就把它<strong className="text-ink">做得更像样、更能打</strong>——真正变成一个拿得出手的东西。
        </p>
      </Callout>
    </>
  )
}
