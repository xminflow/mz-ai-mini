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
 * 课件 1.3 设计自己的 AI 编程工作流
 * 核心：提需求 → 看产出 → 读报错 → 再交流 的可复用闭环。
 * 面向零技术背景：只学"指挥 + 把关"，不写代码。
 * 约定：正文列表柔白（text-ink-soft，圆点随之转灰）、命令/对话框不带 $ / > 前缀、
 *   配图为手写内联 SVG（线 + 圆点，深色 + 品牌色）。承接 1.1（你是指挥）/1.2（已装好工具）不从零重复。
 */
export default function Lesson(): React.JSX.Element {
  return (
    <>
      {/* ===== 头部 ===== */}
      <header>
        <Eyebrow chapter="AI 基础工具学习" index="第三节" />
        <LessonTitle>设计自己的 AI 编程工作流</LessonTitle>
        <Lead>
          工具装好了，但<strong>"怎么跟它配合把事做成"</strong>才是真本事。
          这一节给你一套<strong>能反复套用的节奏</strong>——
          <strong>提需求 → 看产出 → 读报错 → 再交流</strong>。
          把这个闭环跑顺，你就能让 AI 真正替你干活，全程<strong>不用写一行代码</strong>。
        </Lead>
      </header>

      {/* ===== 本节你会搞懂 ===== */}
      <section>
        <KeyPoints
          title="本节你会搞懂"
          items={[
            <>跟 AI 干活的核心，不是写代码，是<strong>会"指挥"和"把关"</strong></>,
            <>一个能反复套用的<strong>四步闭环</strong>：提需求 / 看产出 / 读报错 / 再交流</>,
            <>需求<strong>怎么提</strong>，它才听得懂、少跑偏</>,
            <>它干完后，你<strong>怎么"看"、怎么验收</strong>（看不懂代码也没关系）</>,
            <>看到一堆<strong>红字报错别慌</strong>——它其实是"给 AI 的线索"</>,
            <>怎么靠<strong>"再交流"</strong>一步步把结果磨到满意</>,
            <>一个<strong>完整例子</strong>：从一句话到一个能用的公司官网落地页</>,
          ]}
        />
      </section>

      <Rule />

      {/* ===== 核心闭环总览 ===== */}
      <Section
        id="loop"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 11 a8 8 0 1 0 -1.5 5" />
            <path d="M20 5 v4 h-4" />
          </svg>
        }
        title={<span style={{ color: '#a78bfa' }}>跟 AI 干活，就是转这个圈</span>}
      >
        <p className="mt-[1.05rem]">
          先纠正一个最常见的误会：跟 AI 干活，<strong className="text-ink">不是"下一道命令、它一次就给你做完美"</strong>。
          真实的过程更像<strong className="text-ink">转圈圈</strong>——你说要什么，它做一版，你看看、指出问题，它再改……
          一圈圈下来，越来越接近你心里想要的样子。
        </p>
        <p className="mt-[1.05rem]">
          这个圈就四步，记住它，几乎所有事都能套：
        </p>

        <Figure caption='核心闭环：提需求 → 看产出 → 读报错 → 再交流，一圈圈逼近你要的；第一版不完美，太正常了。'>
          <svg viewBox="0 0 700 380" role="img" aria-label="AI 工作流核心闭环：提需求、看产出、读报错、再交流四步循环" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="ar-loop" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#8a8a94" />
              </marker>
            </defs>

            {/* 顺时针四条弧线箭头 */}
            <path d="M432 66 C 520 78, 556 120, 562 158" fill="none" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-loop)" />
            <path d="M560 224 C 552 286, 500 312, 432 318" fill="none" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-loop)" />
            <path d="M268 320 C 196 314, 150 286, 140 224" fill="none" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-loop)" />
            <path d="M138 158 C 146 118, 182 78, 268 66" fill="none" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-loop)" />

            {/* 中心说明 */}
            <text fill="#8a8a94" fontSize="12" x="350" y="186" textAnchor="middle">一圈圈</text>
            <text fill="#8a8a94" fontSize="12" x="350" y="206" textAnchor="middle">逼近你要的</text>

            {/* 提需求（上 · 紫） */}
            <rect x="276" y="34" width="148" height="56" rx="10" fill="none" stroke="#a78bfa" strokeWidth="1.6" />
            <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="350" y="58" textAnchor="middle">① 提需求</text>
            <text fill="#8a8a94" fontSize="11" x="350" y="76" textAnchor="middle">说清要什么</text>

            {/* 看产出（右 · 青） */}
            <rect x="492" y="162" width="148" height="56" rx="10" fill="none" stroke="#22d3ee" strokeWidth="1.6" />
            <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="566" y="186" textAnchor="middle">② 看产出</text>
            <text fill="#8a8a94" fontSize="11" x="566" y="204" textAnchor="middle">验收对不对</text>

            {/* 读报错（下 · 琥珀） */}
            <rect x="276" y="290" width="148" height="56" rx="10" fill="none" stroke="#fbbf24" strokeWidth="1.6" />
            <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="350" y="314" textAnchor="middle">③ 读报错</text>
            <text fill="#8a8a94" fontSize="11" x="350" y="332" textAnchor="middle">把线索贴给它</text>

            {/* 再交流（左 · 绿） */}
            <rect x="60" y="162" width="148" height="56" rx="10" fill="none" stroke="#34d399" strokeWidth="1.6" />
            <text fill="#f5f5f7" fontSize="14" fontWeight="600" x="134" y="186" textAnchor="middle">④ 再交流</text>
            <text fill="#8a8a94" fontSize="11" x="134" y="204" textAnchor="middle">一步步磨对</text>
          </svg>
        </Figure>

        <p className="mt-[1.05rem]">
          关键心态就一句：<strong className="text-ink">第一版不完美，太正常了</strong>。
          就像 1.1 说的，你是<strong className="text-ink">"指挥"和"把关人"</strong>——
          负责说清楚要什么、判断好不好；<strong className="text-ink">动手的脏活累活交给它</strong>。
          下面把这四步一步步拆开讲。
        </p>
        <Callout tone="bridge">↓ 先从第一步——也是最影响结果的一步：怎么"提需求"。</Callout>
      </Section>

      <Rule />

      {/* ===== ① 提需求 ===== */}
      <Section
        id="ask"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 5 h16 a1 1 0 0 1 1 1 v9 a1 1 0 0 1 -1 1 h-9 l-4 3 v-3 h-3 a1 1 0 0 1 -1 -1 v-9 a1 1 0 0 1 1 -1 z" />
            <path d="M8 9 h8 M8 12 h5" />
          </svg>
        }
        title={<span style={{ color: '#a78bfa' }}>① 提需求：把"要什么"说清楚</span>}
      >
        <p className="mt-[1.05rem]">
          这一步最影响结果。道理很简单：<strong className="text-ink">你说得越清楚，它越不会跑偏</strong>。
          你不用懂任何术语，<strong className="text-ink">用大白话</strong>讲清楚"要做成什么样"就行。
        </p>
        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">说清"做成什么样"：</b>要什么、给谁用、大概长什么样。把脑子里的画面描出来。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">给点背景和例子：</b>"参考某某网站的感觉""风格要简洁专业"——有参照物，它更容易对上你的口味。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">能给的资料直接喂给它：</b>手上有现成的文件、图片、<strong className="text-ink">logo</strong>，甚至一张草图截图，<strong className="text-ink">直接发给它参考</strong>——比你用嘴描述准得多，它会照着来。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">一次别贪多，拆小步：</b>先做出个能看的版本，再慢慢加。一上来就把一百个要求全堆给它，反而容易乱。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">拿不准就让它先"复述计划"：</b>说一句"先别动手，把你打算怎么做列出来给我看"。方向对了再让它干，省得白忙。
          </li>
        </ul>

        <p className="mt-[1.8rem]">同一件事，<strong className="text-ink">含糊地说</strong>和<strong className="text-ink">具体地说</strong>，效果天差地别：</p>
        <Terms
          items={[
            {
              term: '✗ 含糊地说',
              gloss: <>"帮我做个网站。"——它只能瞎猜：什么行业？几个页面？什么风格？多半做出来不是你要的。</>,
            },
            {
              term: '✓ 具体地说',
              gloss: <>"帮我做一个公司官网的首页：顶部一句大标题、一句副标题，中间三块介绍我们做什么，最下面一个'联系我们'按钮，整体简洁专业、配色淡雅。"——它立刻知道该做什么。</>,
            },
          ]}
        />
        <Callout tone="analogy">
          <p>
            把它想成一个<strong className="text-ink">很能干、但第一天上班、对你一无所知的助手</strong>：
            你交代得越具体，它越能一次做对；你越是"你看着办"，它越容易理解偏。
          </p>
        </Callout>
        <Callout tone="bridge">↓ 需求提完、它开始干活了。它干完，你得会"看"。</Callout>
      </Section>

      <Rule />

      {/* ===== ② 看产出 ===== */}
      <Section
        id="review"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12 s4 -7 10 -7 s10 7 10 7 s-4 7 -10 7 s-10 -7 -10 -7 z" />
            <circle cx="12" cy="12" r="2.5" />
          </svg>
        }
        title={<span style={{ color: '#22d3ee' }}>② 看产出：验收它做了什么</span>}
      >
        <p className="mt-[1.05rem]">
          它干完会<strong className="text-ink">给你一段总结</strong>（"我建了哪几个文件、改了什么"），
          可能还会让你<strong className="text-ink">预览一下效果</strong>。这时候轮到你<strong className="text-ink">验收</strong>——
          放心，<strong className="text-ink">看不懂代码完全没关系</strong>，你要看的是"结果对不对"。
        </p>
        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">先看它的"交付说明"：</b>它通常会说自己做了什么。扫一眼，跟你要的对不对得上。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">实际看一眼效果：</b>该打开网页就打开看看、该看表格就看表格。<strong className="text-ink">眼见为实</strong>，别光听它说"做好了"。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">不懂就让它"讲人话"：</b>哪一步看不明白，直接问"这个是干嘛的，用大白话讲"。它会解释，你顺带也学会了。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">你是把关人，别照单全收：</b>1.1 提醒过——AI 也会出错、甚至"一本正经地瞎编"。觉得不对，就在下一步告诉它。
          </li>
        </ul>
        <Callout tone="note" label="一个小心态">
          <p>
            验收看的是<strong className="text-ink">"它做的东西对不对"</strong>，不是"它的代码写得好不好"。
            就像你点了外卖，<strong className="text-ink">尝味道、看分量</strong>就行，不必会炒这道菜。
          </p>
        </Callout>
        <Callout tone="bridge">↓ 看的过程中，十有八九会撞上"红字报错"。别慌——下一步专门说它。</Callout>
      </Section>

      <Rule />

      {/* ===== ③ 读报错 ===== */}
      <Section
        id="error"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3 L22 20 H2 Z" />
            <path d="M12 10 v4 M12 17 h0.01" />
          </svg>
        }
        title={<span style={{ color: '#fbbf24' }}>③ 读报错：红字不是判决，是线索</span>}
      >
        <p className="mt-[1.05rem]">
          很多新手一看到满屏<strong className="text-ink">红色英文报错</strong>就慌、就觉得"完了，我搞砸了"。
          先把这个心结解开：<strong className="text-ink">报错是家常便饭，连最资深的程序员每天都在和它打交道</strong>。
          那段红字<strong className="text-ink">不是给你的判决书，而是一条"哪里卡住了"的线索</strong>——
          而"顺着线索找错、改错"，恰恰是 1.1 说过的、AI <strong className="text-ink">最擅长的事之一</strong>。
        </p>
        <p className="mt-[1.05rem]">所以你要做的，简单到出乎意料：</p>
        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">把完整报错原样贴回去：</b>别只说"它报错了"。把<strong className="text-ink">整段红字复制下来、原样发给它</strong>——信息越全，它越能一击中的。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">顺手交代"刚才发生了什么"：</b>"我点了预览，页面一片空白""我刚加了联系按钮就这样了"。它结合上下文，定位更快。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">让它边修边说原因：</b>加一句"修好后用大白话告诉我哪儿错了"。这样下次再遇到，你心里有数。
          </li>
        </ul>

        <Figure caption="一段红字 → 原样贴给 AI → 它定位并改好。报错不是终点，是它最拿手的一类活。">
          <svg viewBox="0 0 680 200" role="img" aria-label="把报错复制给 AI、由它定位并修复的流程" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="ar-err" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="#8a8a94" />
              </marker>
            </defs>

            {/* 报错（红） */}
            <rect x="24" y="58" width="210" height="84" rx="10" fill="none" stroke="#f87171" strokeWidth="1.5" />
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="40" y="88" fill="#f87171" fontSize="12">Error: 红色一大段</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="40" y="108" fill="#8a8a94" fontSize="12">at line 12 …</text>
            <text fill="#8a8a94" fontSize="11" x="129" y="160" textAnchor="middle">一段报错（别怕）</text>

            {/* 箭头：复制贴给 */}
            <path d="M240 100 H316" fill="none" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-err)" />
            <text fill="#8a8a94" fontSize="11" x="278" y="90" textAnchor="middle">原样贴给它</text>

            {/* AI（紫） */}
            <rect x="324" y="64" width="120" height="72" rx="12" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
            <circle cx="370" cy="96" r="2.6" fill="#22d3ee" />
            <circle cx="398" cy="96" r="2.6" fill="#22d3ee" />
            <path d="M370 114 h28" stroke="#a78bfa" strokeWidth="1.4" />
            <text fill="#8a8a94" fontSize="11" x="384" y="160" textAnchor="middle">AI 读线索 · 定位</text>

            {/* 箭头：改好 */}
            <path d="M450 100 H526" fill="none" stroke="#8a8a94" strokeWidth="1.3" markerEnd="url(#ar-err)" />
            <text fill="#8a8a94" fontSize="11" x="488" y="90" textAnchor="middle">修复</text>

            {/* 修好（绿勾） */}
            <rect x="534" y="64" width="122" height="72" rx="10" fill="none" stroke="#34d399" strokeWidth="1.5" />
            <path d="M572 100 l10 10 l20 -22" fill="none" stroke="#34d399" strokeWidth="1.8" />
            <text fill="#8a8a94" fontSize="11" x="595" y="160" textAnchor="middle">改好了</text>
          </svg>
        </Figure>
        <Callout tone="bridge">↓ 报错修了，但结果往往还差点意思。最后一步，靠"再交流"把它磨到位。</Callout>
      </Section>

      <Rule />

      {/* ===== ④ 再交流 ===== */}
      <Section
        id="refine"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6 h13 a2 2 0 0 1 2 2 v3 a2 2 0 0 1 -2 2 H9 l-4 3 v-3 H3 a0 0 0 0 1 0 0 z" />
            <path d="M21 9 v6 a2 2 0 0 1 -2 2" strokeDasharray="2 2" />
          </svg>
        }
        title={<span style={{ color: '#34d399' }}>④ 再交流：一步步磨到满意</span>}
      >
        <p className="mt-[1.05rem]">
          第一版很少一步到位，这<strong className="text-ink">不是 AI 不行，是正常节奏</strong>。
          接下来就靠<strong className="text-ink">不断追加说明</strong>，把结果一点点逼到你想要的样子。
          它<strong className="text-ink">记得你们之前聊过的一切</strong>，所以你不用每次从头解释。
        </p>
        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">具体说"哪里不对、想要啥样"：</b>"标题再大一点""这个蓝色太刺眼，换淡一点""三块介绍我想配上小图标"。越具体，改得越准。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">一次改一点、边改边看：</b>改一处、看一眼效果，再改下一处。比一口气提十个改动更稳、更不容易乱。
          </li>
          <li className="relative mt-[0.5rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.78em] before:h-[5px] before:w-[5px] before:rounded-full before:bg-current before:opacity-55">
            <b className="text-ink">跑偏了就喊停、回退：</b>觉得越改越歪，直接说"这版不行，回到上一版重来"。<strong className="text-ink">你随时可以踩刹车</strong>。
          </li>
        </ul>
        <p className="mt-[1.05rem]">
          改到你觉得"就是它了"，这一圈就闭合了。要加新功能？那就是<strong className="text-ink">开启下一圈</strong>——
          回到第一步，提下一个需求。<strong className="text-ink">所有复杂的东西，都是这样一圈圈转出来的。</strong>
        </p>
        <Callout tone="note" label="要是它反复改不对">
          <p>
            偶尔会撞上它<strong className="text-ink">来回改都不对</strong>的时候，别跟它死磕、也别怀疑自己。三招通常能解围：
            ①<strong className="text-ink">换个说法</strong>重新描述一遍（多半是它把你的意思理解偏了）；
            ②把问题<strong className="text-ink">拆得更小</strong>，一次只让它解决一个点；
            ③实在绕不出来，<strong className="text-ink">开个新对话从头说</strong>——有时候"重启"比"硬掰"快得多。
          </p>
        </Callout>
        <Callout tone="bridge">↓ 光说有点抽象。下面用一个完整例子，把这四步从头到尾走一遍。</Callout>
      </Section>

      <Rule />

      {/* ===== 完整走一遍 ===== */}
      <Section
        id="example"
        icon={
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="5" cy="6" r="2" />
            <circle cx="5" cy="18" r="2" />
            <circle cx="19" cy="12" r="2" />
            <path d="M7 6 h6 a2 2 0 0 1 2 2 v2 M7 18 h6 a2 2 0 0 0 2 -2 v-2" />
          </svg>
        }
        title="完整走一遍：做一个公司官网落地页"
      >
        <p className="mt-[1.05rem]">
          假设你想给公司做一个<strong className="text-ink">官网首页（落地页）</strong>——
          就是别人搜到你公司、点进来看到的第一个页面。完全不会写代码，照样能做出来。看这四步怎么转：
        </p>

        <ul className="mt-[0.9rem] list-none p-0">
          <li className="relative mt-[0.6rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.82em] before:h-[6px] before:w-[6px] before:rounded-full before:bg-[#a78bfa]">
            <b className="text-ink"><span style={{ color: '#a78bfa' }}>① 提需求：</span></b>
            "帮我做一个公司官网首页：顶部一句大标题写<strong className="text-ink">'让品牌被看见'</strong>，下面一句副标题；中间放<strong className="text-ink">三块介绍</strong>我们做什么；最下面一个<strong className="text-ink">'联系我们'</strong>按钮。整体简洁专业、配色淡雅。"
          </li>
          <li className="relative mt-[0.6rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.82em] before:h-[6px] before:w-[6px] before:rounded-full before:bg-[#22d3ee]">
            <b className="text-ink"><span style={{ color: '#22d3ee' }}>② 看产出：</span></b>
            它建好文件、说"做好了，可以预览"。你<strong className="text-ink">在浏览器里打开看</strong>——标题、三块介绍、按钮都在，但配色有点深、按钮也偏小。
          </li>
          <li className="relative mt-[0.6rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.82em] before:h-[6px] before:w-[6px] before:rounded-full before:bg-[#fbbf24]">
            <b className="text-ink"><span style={{ color: '#fbbf24' }}>③ 读报错：</span></b>
            你又加了句"放张 logo"，结果一刷新<strong className="text-ink">页面顶部空白、还冒出一段红字</strong>。你把<strong className="text-ink">整段红字复制给它</strong>，并说"我刚让你加 logo 就这样了"。它一看就懂：图片路径没填对，顺手改好。
          </li>
          <li className="relative mt-[0.6rem] pl-[1.3rem] before:absolute before:left-[0.1rem] before:top-[0.82em] before:h-[6px] before:w-[6px] before:rounded-full before:bg-[#34d399]">
            <b className="text-ink"><span style={{ color: '#34d399' }}>④ 再交流：</span></b>
            "配色再淡雅一点，主色换成淡蓝""按钮放大、改成蓝色""三块介绍各配一个小图标"。一次改一点、边改边看，几个来回，一个像样的落地页就成了。
          </li>
        </ul>

        <Figure caption="跟它的一次真实对话大概就长这样：你说、它做、你指、它改——来回几趟就成。">
          <svg viewBox="0 0 560 320" role="img" aria-label="与 AI 做落地页的对话示意：提需求、产出、再交流" xmlns="http://www.w3.org/2000/svg" style={{ maxWidth: '560px', margin: '0 auto' }}>
            <rect x="1" y="1" width="558" height="318" rx="12" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.16)" strokeWidth="1" />
            <line x1="1" y1="40" x2="559" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
            <circle cx="26" cy="20" r="5" fill="#34d399" />
            <circle cx="44" cy="20" r="5" fill="rgba(255,255,255,0.25)" />
            <circle cx="62" cy="20" r="5" fill="rgba(255,255,255,0.18)" />
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="280" y="25" textAnchor="middle" fill="#8a8a94" fontSize="12">和 AI 做落地页</text>

            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="74" fontSize="12.5">
              <tspan fill="#a78bfa">你 ›</tspan><tspan fill="#d4d4d8"> 做个公司官网首页：大标题+三块介绍+联系按钮</tspan>
            </text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="100" fontSize="12" fill="#8a8a94">   已创建 index.html、style.css …</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="122" fontSize="12" fill="#22d3ee">   ✓ 做好了，可以打开预览</text>

            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="158" fontSize="12.5">
              <tspan fill="#a78bfa">你 ›</tspan><tspan fill="#d4d4d8"> 加 logo 后报错了：</tspan><tspan fill="#f87171">Error 红字一段</tspan>
            </text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="184" fontSize="12" fill="#8a8a94">   图片路径没填对，已修复 …</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="206" fontSize="12" fill="#22d3ee">   ✓ 改好了</text>

            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="242" fontSize="12.5">
              <tspan fill="#a78bfa">你 ›</tspan><tspan fill="#d4d4d8"> 按钮放大改蓝色，配色再淡雅点</tspan>
            </text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="268" fontSize="12" fill="#8a8a94">   已调整按钮与配色 …</text>
            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="290" fontSize="12" fill="#34d399">   ✓ 这版就很好</text>

            <text fontFamily="'SFMono-Regular','Consolas',monospace" x="24" y="310" fontSize="12.5">
              <tspan fill="#a78bfa">你 ›</tspan><tspan fill="#d4d4d8"> </tspan><tspan fill="#f5f5f7">▋</tspan>
            </text>
          </svg>
        </Figure>

        <p className="mt-[1.05rem]">
          看明白没？<strong className="text-ink">你全程只做了两件事：把要的说清楚、把不对的指出来。</strong>
          剩下的写、改、修，全是它干的——这就是"指挥 + 把关"的真实样子。
        </p>
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
          总结
        </h2>
        <p className="text-[1.02rem] text-ink leading-[2.1]">
          跟 AI 干活，就是转一个<strong className="text-ink">闭环</strong>：
          <span style={{ color: '#a78bfa' }}>提需求</span>（说清要什么）→
          <span style={{ color: '#22d3ee' }}>看产出</span>（验收对不对）→
          <span style={{ color: '#fbbf24' }}>读报错</span>（把红字当线索贴给它）→
          <span style={{ color: '#34d399' }}>再交流</span>（一步步磨对），
          一圈圈逼近你要的。<strong className="text-ink">你是指挥和把关人，不需要会写代码。</strong>
        </p>
        <p className="mt-[1.05rem] text-ink-soft">
          到这里，第一课时就走完了：你认全了开发世界、装好了主力工具、也握住了这套"指挥"的节奏。
          接下来的课时，我们就拿着它，<strong className="text-ink">真正动手做出能用的东西</strong>。
        </p>
      </Callout>
    </>
  )
}
