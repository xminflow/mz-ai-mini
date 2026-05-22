/* eslint-disable no-irregular-whitespace */
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireMembership } from '@/features/membership/server/require-membership'

export const metadata: Metadata = {
  title: '第三篇 · 选题与素材库 · 自媒体运营实战手册',
  description:
    '解决"今天发什么"的焦虑。建立选题流水线，配合 AI 素材采集工具把"等灵感"变成"打开素材库就能拍"。读完，你应当能独立产出 30 条以上可用选题。',
  openGraph: {
    title: '第三篇 · 选题与素材库 · 自媒体运营实战手册',
    description: '五方向 · 八元素 · 一座永远填得满的素材库。',
  },
}

const CHAPTERS = [
  { id: 'ch-3-0', no: '3.0', label: '导读 · 离爆款只差一个选题' },
  { id: 'ch-3-1', no: '3.1', label: '选题的本质 + 情绪波点' },
  { id: 'ch-3-2', no: '3.2', label: '五方向 × 情感 × 情绪矩阵' },
  { id: 'ch-3-3', no: '3.3', label: '蹭热点的四套路' },
  { id: 'ch-3-4', no: '3.4', label: '八大爆款元素逐一拆解' },
  { id: 'ch-3-5', no: '3.5', label: '选题系列化 · 定量加变量' },
  { id: 'ch-3-6', no: '3.6', label: '素材库四类三工具' },
  { id: 'ch-3-7', no: '3.7', label: '跨领域借鉴而非盯同行' },
  { id: 'ch-3-8', no: '3.8', label: '搭建你的 30 条选题库' },
]

export default async function PlaybookTopicsPage() {
  await requireMembership('/playbook/topics')
  return (
    <main className="min-h-screen overflow-x-clip bg-[#050507] text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 0%, rgba(139,46,46,0.22), transparent 38%), radial-gradient(circle at 82% 8%, rgba(184,105,58,0.14), transparent 34%), linear-gradient(180deg, rgba(255,253,247,0.04), transparent 28%)',
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-10 sm:px-6 sm:pt-14 lg:grid lg:grid-cols-[200px_1fr] lg:gap-10 lg:pt-16">
        <SideRail />
        <article className="min-w-0">
          <Manuscript />
          <ChapterEndNav />
        </article>
      </div>
    </main>
  )
}

const SideRail = () => (
  <aside className="hidden lg:block">
    <div className="sticky top-24">
      <div className="mb-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[#b8aa96]">
        <span className="h-px w-6 bg-[#8b2e2e]" />
        Part Ⅲ
      </div>
      <div className="font-serif-zh mb-6 text-[20px] font-semibold tracking-[0.06em] text-[#fffdf7]">
        选题与素材库
      </div>
      <ol className="space-y-2 border-l border-white/10 pl-4">
        {CHAPTERS.map((chap) => (
          <li key={chap.id}>
            <a
              href={`#${chap.id}`}
              className="group block py-1 text-[12.5px] leading-[1.5] text-[#b8aa96] transition-colors hover:text-[#fffdf7]"
            >
              <span className="mr-2 font-mono text-[11px] text-[#b8693a]">{chap.no}</span>
              <span className="group-hover:underline group-hover:decoration-[#b8693a]/60 group-hover:underline-offset-4">
                {chap.label}
              </span>
            </a>
          </li>
        ))}
      </ol>
      <div className="mt-7 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.22em] text-[#8a7e6f]">
        预计阅读 · 40 分钟
      </div>
    </div>
  </aside>
)

const Manuscript = () => (
  <div className="relative isolate">
    <div className="flex items-baseline justify-between border-b border-white/10 pb-5 font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a7e6f] sm:text-[11px]">
      <Link
        href="/playbook#toc"
        className="border-b border-dotted border-white/15 text-[#b8aa96] transition-colors hover:border-[#b8693a] hover:text-[#fffdf7]"
      >
        ← 返回目录
      </Link>
      <span className="hidden sm:inline">《微域生光自媒体运营实战》</span>
      <span>第三篇 · 共九篇</span>
    </div>

    <div className="mx-auto max-w-[720px] pb-20 pt-10 sm:pb-24 sm:pt-14">
      <PartCover />

      <Chapter
        id="ch-3-0"
        no="3.0 · 导读"
        tag="Topics"
        title="你和爆款之间，只差一个选题"
        lead="拍什么，比怎么拍重要十倍。"
      >
        <p>
          一个普遍被低估的事实：决定一条短视频能不能爆的，从来不是剪辑技巧、运镜手法或者表现力——而是站在最前面的那个"选题"。同样一套口播工具，套在不同的选题上，结果可以差出一百倍。一个能让人停下来看完的选题，哪怕拍得粗糙，也会被算法捧出去；一个用户压根不关心的选题，请来冯小刚也救不回来。
        </p>
        <p>
          但奇怪的是，几乎所有新手都把 80% 的精力花在了"怎么拍"，只把 20% 的精力花在"拍什么"。结果是，他们一边焦虑播放量上不去，一边不停地买新设备、学新剪辑——而真正卡住他们的，是每次打开手机时都要重新问自己一遍的："今天拍什么？"
        </p>

        <Insight label="本章主张">
          做内容这件事，最高杠杆的环节是选题。把一条选题"选对"的回报，比把一条视频"剪好"的回报高一个数量级。本篇不教剪辑、不教表现力，只解决一件事：让你打开手机，永远知道下一条该拍什么。
        </Insight>

        <SubHead>选题之困，本质是工业化之困</SubHead>
        <p>
          很多创作者把"想不出选题"归咎于自己没创意、没天赋、没灵感。这是一种误判。能日更三年、年涨百万粉的博主，不是因为他们灵感比别人多，而是因为他们把"找选题"这件事工业化了——他们有一整套从素材库到爆款公式的流水线，灵感只是其中很小的一个变量。
        </p>
        <p>
          换句话说，<Strong>选题不是"灵感问题"，是"工序问题"</Strong>。等灵感是非专业玩法，搭流水线才是。这一篇里你会看到，所有看上去无穷无尽产内容的博主，背后都做了同一件事：把"今天发什么"这个问题，从每天都要回答一次，变成"我素材库里今天有什么"。
        </p>

        <SubHead>本篇要给你的</SubHead>
        <p>
          九个小节，从三个层面把选题这件事彻底拆开：第一层是"内在通道"——情绪波点告诉你灵感从自己身上来；第二层是"外在抓手"——五方向、热点四套路、八大爆款元素告诉你怎么从全网捞内容；第三层是"工业流水线"——选题系列化、素材库、跨领域借鉴告诉你怎么让选题永不枯竭。
        </p>
        <p>
          读完，你不需要再焦虑"今天拍什么"，你只需要打开素材库挑一条。每一节都会有一个可填的工具——可以打印、可以贴在工作台上、可以直接复制到 AI 提示词里。
        </p>
      </Chapter>

      <Chapter
        id="ch-3-1"
        no="3.1"
        tag="选题本质"
        title="选题的本质 · 五个方向加一个情绪波点"
        lead="灵感不在外面，灵感在你愣神的那一刻。"
      >
        <p>
          我们先把"选题"这两个字拆开。所谓选题，不是"给视频起个名字"，而是"找到用户愿意停下来看的那个切口"。同样讲炒股，"炒股需要注意什么"是个标题，但不是一个选题；"夫妻五年存款一夜套牢、抱头痛哭"才是一个选题。前者讲的是知识，后者讲的是触动。
        </p>

        <PullQuote>选题不是讲你想讲的，是说中他正在想的。</PullQuote>

        <SubHead>五个外部方向：痛点、疑问、坑、盲区、泛话题</SubHead>
        <p>
          打开任何一个垂直行业，可被持续生产的选题，逃不出这五个方向。我们以"装修"为例，给你拆开看。
        </p>

        <NumberedFalseList
          items={[
            {
              title: '找痛点。',
              verdict: '用户已经在抱怨的事。',
              body: '比如"新装修的房子甲醛味怎么去"——这是用户已经在搜、已经在烦、已经在掏钱解决的事。你只要给一个比他自己想得到的更好的答案，他就会停下来。',
            },
            {
              title: '找疑问。',
              verdict: '用户拿不准的事。',
              body: '比如"乳胶漆和涂料到底有啥区别"——这是用户在选购时会卡壳的事。卡壳意味着他在花钱前犹豫，你解开了他的疑问，他就把信任前置给了你。',
            },
            {
              title: '找坑。',
              verdict: '用户不知道但会踩的事。',
              body: '比如"装修效果图里隐藏的五个坑"——这是用户根本不知道自己会踩、但踩了会损失几万块的事。这种"避损"内容，用户对你的感激是双倍的。',
            },
            {
              title: '找盲区。',
              verdict: '用户根本想不到的事。',
              body: '比如"这几个地方千万不能省钱"——用户连"该不该想这件事"都不知道。你给他点出来，他会觉得"这个人真懂"。',
            },
            {
              title: '找泛话题。',
              verdict: '把行业拉进生活的事。',
              body: '比如"明星家里装修能打几分"——它不直接卖装修，但把装修这件事拉进了用户已有的兴趣里。泛话题不是为了卖货，是为了破圈、为了把你这个账号从"装修垂类"挪到"全网都愿意看"。',
            },
          ]}
        />

        <p>
          这五个方向适用于任何行业。把"装修"换成"英语口语""二手车""口腔诊所""家政服务"，每一类都能立刻生出 20 个选题——你不需要灵感，只需要按这五个钩子，对着自己的行业各挂一遍。
        </p>

        <SubHead>一个内部入口：情绪波点</SubHead>
        <p>
          但光靠外部方向，会出现一个问题——大量同行也在按这五个方向找选题，你做出来的东西很容易和别人撞车。真正区分头部博主和普通博主的，是另一个更内在的入口：<Strong>情绪波点。</Strong>
        </p>
        <p>
          所谓情绪波点，就是你在生活中有过一瞬间被打动、被气到、被逗笑、被愣住的那个时刻。它可能是：早上化好妆等男朋友放鸽子的瞬间；中午吃撑了又生气又吃的瞬间；晚上看到老公买了你想要的包又激动又怀疑的瞬间。这些瞬间，是属于你独有的素材——没有任何同行能"抄"走，因为它发生在你的生活里。
        </p>

        <CaseBlock title="案例 · 一位 57 岁妈妈的 140 万播放">
          <p>
            一位短视频老师过年回到三四线小县城的老家，他都 32 岁了，七大姑八大姨轮番催婚。但他发现：所有亲戚都在催，唯独自己妈妈云淡风轻。他随手拿起相机问了一句："妈，你为什么不像别人的妈妈一样催我结婚？"妈妈一边干活一边随口回："嫁了我又不是公主，嫁了每天就是干活……"
          </p>
          <p>
            没有相机准备、没有写稿、没有打光，画面有一段是糊的——因为拍的时候相机镜头都没插好。这条视频发出去之后，<Strong>140 万播放</Strong>。
          </p>
          <p>
            这条视频火不是因为剪辑、不是因为表现力，是因为它叠了两个情绪波点：他自己的"好奇妈妈为何不催"，妈妈的"嫁人就是给别人当丫鬟去了"。一个真实情绪 + 一个反差金句，就是这条视频的力量。
          </p>
        </CaseBlock>

        <SubHead>情绪波点的四种创作出口</SubHead>
        <p>
          同一个情绪波点，可以走四个不同的创作出口，对应不同的脚本类型。我们把它做成一张四象限的表，你下次有情绪冒上来时，对照它就知道该怎么拍。
        </p>

        <QuadGrid
          cols={[
            {
              title: '回忆 → 讲故事',
              body:
                '当情绪源于"想起当年某件事"时，把它讲成一个故事。开头交代背景，中间制造起伏，结尾给出感悟。适合做信任、立人设、卖高客单。',
            },
            {
              title: '行动 → 晒过程',
              body:
                '当情绪源于"我现在就想做点什么"时，把"做"这个动作拍下来。背老婆走、收拾屋子、给孩子做饭——动作本身就是内容。适合实体老板和产品方。',
            },
            {
              title: '分析 → 教知识 / 聊观点',
              body:
                '当情绪源于"我想理性说点什么"时，把它讲清楚。讲知识——把"为什么会这样"讲透；讲观点——给同样情绪的人一个理由。适合专业人士和起号阶段。',
            },
            {
              title: '愣神 → 聊观点 / 讲故事',
              body:
                '当情绪源于"我突然在想一件事"时，把愣神那一刻顺势拍下。它可能没头没尾，但只要把"此刻我在想什么"如实说出来，就自带共鸣感。适合所有阶段。',
            },
          ]}
        />

        <Insight label="反共识结论">
          灵感不是稀缺资源，<Strong>注意自己情绪的能力才是。</Strong>大部分人的"没灵感"，本质是被生活磨平了棱角——有情绪不敢发、有想法怕被笑话、有触动顾忌太多。要做内容，先要允许自己有情绪。
        </Insight>

        <ToolCard
          tag="工具 3.1"
          title="选题五方向 + 情绪波点双入口工作表"
          desc='左边五行是"对外捞"——每天对照行业问自己一遍；右边四行是"对内挖"——遇到任何情绪都先停一下，问自己能走哪个出口。'
        >
          <Table
            head={['入口', '此刻可拍的选题', '对应脚本类型']}
            rows={[
              ['痛点（用户在抱怨什么）', '/', '教知识 / 晒过程'],
              ['疑问（用户在犹豫什么）', '/', '教知识'],
              ['坑（用户会踩什么亏）', '/', '教知识 / 聊观点'],
              ['盲区（用户根本不知道什么）', '/', '教知识'],
              ['泛话题（用户感兴趣的延伸）', '/', '聊观点 / 讲故事'],
              ['情绪 · 回忆 → 想到过去某件事', '/', '讲故事'],
              ['情绪 · 行动 → 我想做点什么', '/', '晒过程'],
              ['情绪 · 分析 → 我想说清楚一件事', '/', '聊观点 / 教知识'],
              ['情绪 · 愣神 → 我突然在想……', '/', '聊观点 / 讲故事'],
            ]}
            emptyCols={[1]}
          />
        </ToolCard>

        <p>
          这张表的用法：贴在工作台或者电脑屏幕边上，每天打开它一次。前五行是"主动出击"，后四行是"被动捕捉"。两者加起来，你每天至少能产 3-5 条可用的选题。一周下来，就是 30 条以上——已经够你拍一个月。
        </p>
      </Chapter>

      <Chapter
        id="ch-3-2"
        no="3.2"
        tag="选题矩阵"
        title="五方向 × 五情感 × 五情绪 = 125 种选题角度"
        lead="同一个事件，换一组要素，就是一条全新的选题。"
      >
        <p>
          上一节我们用五方向解决了"从哪里挖选题"的问题。但还有一个更深的问题——为什么有的选题点赞 56 万，有的同类选题只有 2 个赞？答案藏在另一个维度里：<Strong>所有爆款，本质都是引爆情绪。</Strong>
        </p>
        <p>
          一条视频获得点赞、评论、转发，从来不是因为它"信息量大"，而是因为它在用户心里激起了某种具体的情感和情绪。算法识别不出"价值"，但它能识别出"完播率""互动率"——而这两个数据，几乎完全由情绪驱动。
        </p>

        <SubHead>五个内容方向：美 · 笑 · 泪 · 奇 · 学</SubHead>
        <p>抖音上能持续涨粉的内容，可以收敛为五个大方向。每一个方向对应一种用户的根本欲望。</p>

        <NumberedFalseList
          items={[
            {
              title: '美。',
              verdict: '对美好的追求。',
              body: '震撼的风景、倾国的颜值、曼妙的身材、成功的人生。颜值即正义——同样的内容，主角颜值高的获得青睐的概率是数倍。一个减肥账号，从 12 万粉做到百万粉的关键，不是减肥方法变了，是换了一个"减下来一定倾国倾城"的女主。',
            },
            {
              title: '笑。',
              verdict: '幽默、会心一笑、苦中作乐。',
              body: '相声段子、糗事、撒娇、影视娱乐都属于这一类。疫情期间搞笑视频获得巨大流量，本质是大家"憋坏了"。注意一点：笑要"用户在笑"，而不是"博主自己在笑"。',
            },
            {
              title: '泪。',
              verdict: '感人肺腑、引发共鸣。',
              body: '让用户产生代入感，说出他内心想说而没说的话。卖惨视频之所以高频出爆款，是因为它精准触达了某一类人的真实处境。但泪点必须真实——刻意煽情会被瞬间识破。',
            },
            {
              title: '奇。',
              verdict: '悬疑、好奇、脑洞、违反常识。',
              body: '奇特的科学实验、奇特的癖好、奇怪的挑战、悬疑科普、所有挑战常识的脑洞内容——都属于奇。引发好奇，是争夺用户那点稀缺注意力的主要手段。',
            },
            {
              title: '学。',
              verdict: '价值、新认知、操作步骤。',
              body: '"我看完学到了什么"是用户最实际的获得感。美食视频在结尾给食谱、教学视频给操作步骤、知识分享给思维导图——这些都是"学"的兑现。但只有"学"会让账号显得高冷，需要前四种来调节。',
            },
          ]}
        />

        <SubHead>五种情感 · 五种情绪</SubHead>
        <p>
          五大方向解决了"内容长成什么样"，但还需要两个维度来精准引爆——情感和情绪。情感是"对特定对象的感受"，情绪是"人的原始反应"。
        </p>

        <ToolCard
          tag="工具 3.2"
          title="选题三维矩阵卡"
          desc="任何一个初步选题，套进这三个维度里，都能延展出多种全然不同的角度。你不需要换主题，只需要换情感/情绪的组合。"
        >
          <Table
            head={['维度', '可选项', '示例延展']}
            rows={[
              ['内容方向（五选一）', '美 / 笑 / 泪 / 奇 / 学', '决定视频整体气质'],
              ['情感（五选一）', '爱情 / 友情 / 亲情 / 爱国 / 激励', '决定面向哪一类人群'],
              ['情绪（五选一）', '喜 / 怒 / 哀 / 惧 / 惊', '决定用户的具体反应'],
            ]}
          />
        </ToolCard>

        <CaseBlock title="案例 · 同一个热点的三种延展">
          <p>
            原始素材：股市大跌、很多人亏钱。这只是一个"事件"，不是一个"选题"。
          </p>
          <p>
            <Strong>组合 A · 泪 + 爱情 + 哀。</Strong>"夫妻辛苦攒了五年的存款，在股市套牢，两人抱头痛哭。"——这是一条引共鸣的选题。
          </p>
          <p>
            <Strong>组合 B · 奇 + 爱情 + 怒 + 惧。</Strong>"男生幻想一夜暴富，偷女朋友银行卡炒股被套，女朋友暴怒分手，男生怕被抓。"——同样的事件，变成一个抓眼球的故事。
          </p>
          <p>
            <Strong>组合 C · 笑 + 友情 + 喜 + 惊。</Strong>"朋友说炒股炒成百万富翁，我惊得跑去取经，结果他本来就是亿万富翁。"——同样的素材，变成一条搞笑短片。
          </p>
          <p>
            同一个原始素材，靠三组不同的"方向 × 情感 × 情绪"组合，可以拆成三种完全不同走向的选题。这就是矩阵的力量——它不是给你新素材，是把每个素材的产能放大五倍十倍。
          </p>
        </CaseBlock>

        <Insight label="使用方法">
          每周固定时间（建议周日晚），拿出一张 A4 纸，列上你这周看到的 5-10 个事件/热点/素材。然后对每一个事件做一次"三维拆解"——给它套上不同的方向、情感、情绪组合，看哪一种组合"读起来你自己都想看"。这一周的选题就出来了。
        </Insight>
      </Chapter>

      <Chapter
        id="ch-3-3"
        no="3.3"
        tag="蹭热点"
        title="蹭热点的四套路"
        lead="爆款最短的路径，不是创造，是接力。"
      >
        <p>
          打开任何一天的爆款榜，你都会发现一半以上是热点视频。原因很简单——热点本身已经把"用户注意力"这道最贵的关给打掉了。你不需要从零教育用户"这件事值得关注"，你只需要在他正在关注时，提供一个独特的切入。
        </p>
        <p>
          甚至抖音平台的 slogan 都已经变成了"关注热点事件"。平台明明白白告诉你：热点是它愿意分发的。但大多数人蹭热点是"原样复述"——这个事是什么，他讲一遍，结束。这种蹭法没有附加价值，平台也不会推。真正能爆的蹭热点，藏在四个套路里。
        </p>

        <SubHead>套路一：做梳理</SubHead>
        <p>
          热点出现的第一时间，大部分用户对来龙去脉是模糊的。他们刷到一个标题，知道"出了点事"，但没空跟完。你的价值，就是用最快的速度把这个事件从头到尾梳理一遍——时间线、人物关系、关键节点、最新进展。
        </p>

        <CaseBlock title="案例 · 海清微博 56 万赞">
          <p>
            演员海清在微博发了一条庆祝电视剧里"孩子们"高考好成绩的话，引发大量评论转发，成为当天热点。一位抖音号做了三件事：把海清的微博截了图、把"孩子们"的照片截了图、把电视剧片段截了图。三张图一拼，配上"妈妈想想都开心"的标题，做出一条短视频，<Strong>点赞 56 万</Strong>。
          </p>
          <p>
            这条视频不需要文采、不需要剪辑、不需要表演，只需要一件事：在热点发生的几小时内，把它整理得清清楚楚。这就是"做梳理"的全部价值。
          </p>
        </CaseBlock>

        <SubHead>套路二：神评论</SubHead>
        <p>
          所有的爆款视频底下，都有一条爆款评论——那是用户用自己的方式说出了所有人想说而没说的话。这条评论本身就是被验证过的、被点赞过万的内容。把这条评论拿出来，单独做成一个视频，就是套路二。
        </p>

        <CaseBlock title="案例 · 西士美保姆间 20 万赞">
          <p>
            西士美有一条 5000 万播放的爆款视频，拍的是自己 300 平米的豪宅。评论区有一条神评论："为什么不把保姆间拍得清楚一点呢？"这条评论获得 8.8 万赞。
          </p>
          <p>
            他立刻拍了第二条视频——"5000 万网友看完我上个视频后提问：为什么不把保姆间拍清楚？安排！"专门展示保姆间，并和阿姨互动。这条接力视频获得 <Strong>20 多万赞</Strong>。
          </p>
          <p>
            一条神评论 = 一条爆款的接力起点。这是创作成本最低的爆款工具。
          </p>
        </CaseBlock>

        <SubHead>套路三：找争议</SubHead>
        <p>
          热点之所以是热点，往往是因为它本身就有争议。把这个争议点提炼出来、放大、给一个反向视角，就能在原本的热点之上再吃一波流量。
        </p>
        <p>
          例如"高考送花女孩"热点，画面很美好——但你站在男生视角想一下："为什么这个女孩不是送花给我？"这就是一个争议点。一个小账号围绕这个争议点改了一条视频，把日常几十赞的账号一下推到一万赞。
        </p>

        <SubHead>套路四：做改编</SubHead>
        <p>
          改编是把热点视频的"呈现方式"换掉，重新讲一遍。比如把欢聚的画面改成倒叙加上离别的音乐，把相聚的故事讲成离别——同一个热点素材，给用户一个完全不同的感受。
        </p>
        <p>
          同样是"高考送花"事件，一个原本只有几十赞的小号用"倒叙 + 离别音乐"的方式改编，获得了 <Strong>两万多赞</Strong>。改编的核心，是问自己一个问题：这个热点，如果换一个时空、换一个角色、换一段音乐、换一种叙述顺序，会变成什么样？
        </p>

        <Insight label="蹭热点的前提">
          蹭热点不是"什么火追什么"。前提是这个热点和你账号的目的有承接关系——能落到你的内容定位上，能往你的变现链路上走。一个口腔诊所追"明星离婚"的热点，流量来得快走得也快，留不下任何用户。
        </Insight>

        <ToolCard
          tag="工具 3.3"
          title="热点四套路判断流程图"
          desc="每天看到一个热点，依次回答四个问题，看能不能落到具体套路。"
        >
          <Table
            head={['套路', '触发问题', '产出形态']}
            rows={[
              ['做梳理', '这个事的时间线和因果，普通用户搞清楚了吗？', '一条 60 秒的梳理视频'],
              ['神评论', '原热点视频评论区，最高赞评论说的是什么？', '一条延展评论的视频'],
              ['找争议', '这件事有没有一个让一部分人不爽的点？', '一条反向视角视频'],
              ['做改编', '这个热点的呈现方式，能不能换一个完全不同的演法？', '一条改编视频'],
            ]}
            fillRows={[
              ['（今天的热点 1）', '/', '/'],
              ['（今天的热点 2）', '/', '/'],
            ]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-3-4"
        no="3.4"
        tag="八大爆款元素"
        title="八大爆款元素 · 跨行业通用的火种"
        lead="火和行业无关，火和人性有关。"
      >
        <p>
          这一节，我们要给你一份适用于所有行业的"爆款火种清单"。它的来源是大量爆款样本的归纳：把过去三年抖音上跨行业的爆款拆开，你会发现它们的内容主题千差万别，但底层共用八个元素。
        </p>

        <PullQuote>
          人类不爱看装修、不爱看汽车、不爱看留学。
          <br />
          但人类爱看一个人丢脸。
        </PullQuote>

        <p>
          把你已经"定位正确"的选题（比如"装修小知识""汽车养护"），加上这八个元素中的任意一个或两个，它就立刻具备了流量爆破的基因。我们一个一个拆。
        </p>

        <SubHead>① 成本 · 花小钱办大事</SubHead>
        <p>
          所有"省钱、省时间、省力气"的选题，都自带流量。"穷哥们穷姐们怎么花小钱办大事""不买工具怎么做蛋糕（1500 万播放）""150 万买什么车最适合撩"——本质都是把"成本"作为爆款词根。
        </p>

        <SubHead>② 人群 · 弱势群体的代言</SubHead>
        <p>
          替某一群弱势的、被忽视的、正在被为难的人发声。"现在做短视频的人，真的好难，比我们当年难太多了""射手座是我看做短视频最难的星座"——只要你把一群人圈出来、说他们的难处，他们就会给你点赞。
        </p>

        <CaseBlock title="案例 · 沈阳网点赞的'沈阳叫年轻人'">
          <p>
            一位老师在沈阳到北京的高铁上随口拍的一条视频："沈阳比北京更适合年轻人。"内容讲北京的年轻人为了 350 万一套房算账八年、连拼好饭都要拼着省两块钱、根本谈不上享受青春。这条视频不仅自然流量很好，<Strong>沈阳官媒"沈阳网"还主动转发</Strong>——因为它在替"在北京被生活折磨的年轻人"代言。
          </p>
        </CaseBlock>

        <SubHead>③ 猎奇 · 让人惊掉下巴的稀有信息</SubHead>
        <p>
          "你知道全抖音制作成本最高的视频是多少钱吗？""一条视频要花几千万""三个月才更新一条"——这种用"少有人知"的稀缺信息撬动注意力的内容，是猎奇元素的核心。任何行业都有"内行才知道的"信息，把它讲出来，就能跨圈。
        </p>

        <SubHead>④ 反差 · 不该的人做了不该的事</SubHead>
        <p>
          带奶奶去做美甲、带大爷去玩 hip-hop、让短视频教学者借训狗博主的话术去"训"自己的同事——所有"角色错位"的内容，自带反差。反差是大网红的常用武器，因为它需要"安排"——但只要做出来，几乎不会差。
        </p>

        <SubHead>⑤ 最差 · 看一人丢脸</SubHead>
        <p>
          "用了必后悔的 8 个东西""贬值最快的车型""最没面子的装修风格"——这是八大元素里转化率最高的一个。原因很扎心：人对"避免损失"的关注度，远高于对"获得收益"的关注度。所有"什么不能买""什么千万别用"的内容，都自带流量。
        </p>

        <CaseBlock title="案例 · 养猫必后悔的 8 件事 · 96 万粉">
          <p>
            一位宠物博主用"养猫必后悔的 8 件事"系列，<Strong>从 0 做到 96 万粉</Strong>。每一件都是一个具体的产品（化毛膏、猫专用维生素、猫草零食），每一件都点出"为什么会后悔"。粉丝看完不仅记住了博主，还在评论区主动问"还有什么不能买"——这个系列因此可以一直拍下去。
          </p>
        </CaseBlock>

        <SubHead>⑥ 怀旧 · 用过去骗自己</SubHead>
        <p>
          "20 年前的老手机""当年经典的方便面""小学课本里的那些课文"——怀旧是一个永远好使的元素。人类基因里有一个机制：会自动美化自己的过去，屏蔽掉那时候的不快。所以"怀旧"几乎没有失败案例，只要选对了你目标人群的"那个年代"。
        </p>

        <SubHead>⑦ 荷尔蒙 · 异性吸引的本能</SubHead>
        <p>
          荷尔蒙不需要解释——任何视频里加上恰当的异性元素，都会拉一波自然流量。但荷尔蒙有边界：低俗化的荷尔蒙会快速消耗信任，对长期账号有害。最佳用法是"轻荷尔蒙"——让画面里出现一个有吸引力的元素，但内容本身另有承载。
        </p>

        <SubHead>⑧ 头牌 · 名校 / 名企 / 名人</SubHead>
        <p>
          "北大""哈佛""刘文家的装修（244 万播放）""董宇辉同款""杨幂同款减脂餐"——任何带头牌的元素都会带流量。头牌词根是免费的认知红利，谁先用上谁就吃。
        </p>

        <Insight label="使用原则">
          一条选题里加一个爆款元素就够，最多两个。叠太多元素会变成"标题党"——平台会识别、用户会反感。元素是"火种"，不是"全部"。火种必须落在"定位正确"的选题上，才会燃成爆款。
        </Insight>

        <ToolCard
          tag="工具 3.4"
          title="八大爆款元素打分表"
          desc="把你最近想拍的 5 个选题填进左边，逐项打分（0 或 1）。横向加总 ≥ 2 才算可拍——至少有两个元素的选题，才会有流量。"
        >
          <Table
            head={['选题', '成本', '人群', '猎奇', '反差', '最差', '怀旧', '荷尔蒙', '头牌', '总分']}
            rows={[
              ['不买工具怎么做蛋糕（参考）', '1', '0', '1', '0', '0', '0', '0', '0', '2'],
              ['150 万买什么车最适合撩闷（参考）', '0', '0', '0', '0', '0', '0', '1', '1', '2'],
              ['养猫必后悔的 8 件事（参考）', '1', '0', '0', '0', '1', '0', '0', '0', '2'],
            ]}
            scoreCols={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
            fillRows={[
              ['/', '/', '/', '/', '/', '/', '/', '/', '/', '/'],
              ['/', '/', '/', '/', '/', '/', '/', '/', '/', '/'],
              ['/', '/', '/', '/', '/', '/', '/', '/', '/', '/'],
              ['/', '/', '/', '/', '/', '/', '/', '/', '/', '/'],
              ['/', '/', '/', '/', '/', '/', '/', '/', '/', '/'],
            ]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            打分提示：把这张表喂给 AI 也可以。提示词模板："以下是我的选题，请按八大爆款元素（成本/人群/猎奇/反差/最差/怀旧/荷尔蒙/头牌）打分（每项 0 或 1），并给出加上元素之后的改写版本。"
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-3-5"
        no="3.5"
        tag="系列化"
        title="选题系列化 · 定量加变量"
        lead="一个公式，撬出 50 条内容。"
      >
        <p>
          一个常见的痛点是：好不容易爆了一条，下一条又没了选题。这是把内容当成"单条"在做的结果。真正职业的博主，都不做单条选题——他们做"选题系列"。一个系列，可以撑起一个账号半年的内容供给。
        </p>
        <p>
          选题系列化的核心公式是：<Strong>定量 + 变量</Strong>。定量是不变的那个结构、节奏、句式、动作；变量是每次替换的那个对象。固定一个定量，把变量换一百遍，就有一百条选题。
        </p>

        <SubHead>三个跑通的系列例子</SubHead>

        <CaseBlock title="例 · 农村包饺子大哥 · 一天 1300 斤肉馅">
          <p>
            一位农村大哥，定量是"今天包什么饺子并把过程录下来"，变量是具体的馅料和当天的情境。猪肉大葱、白菜、韭菜、酸菜……同样的拍摄手法、同样的剪辑节奏、同样的口播套路，日复一日。
          </p>
          <p>
            做下来，他的店每天买 <Strong>1300 斤肉馅</Strong> 都不够用——一个农村大哥，靠一个跑通的定量加变量公式，把生意做到了远超城市里那些"200 万投资 + 3 个运营 + 2 个主播"的专业团队。
          </p>
        </CaseBlock>

        <CaseBlock title="例 · 测评 50 个明星同款减脂餐">
          <p>
            一位减肥博主的定量是"亲自吃一遍明星推荐的减脂餐"，变量是明星的名字。同样的开场、同样的试吃流程、同样的吐槽收口——每条只换一个明星名字（哪位明星的减脂餐）。
          </p>
          <p>
            一条视频跑爆之后，相同的结构可以做 50 条。每一条都自带头牌元素（明星）、最差元素（看明星减脂餐有多难吃）、猎奇元素（明星的真实生活）——三重元素叠加，又是一个跑得通的系列。
          </p>
        </CaseBlock>

        <CaseBlock title="例 · 100 个老破小改造">
          <p>
            一位装修博主的定量是"把老破小改造成奶油风"，变量是户型和面积——40 米的、50 米的、回前房的、筒子楼的，每条换一种房型。
          </p>
          <p>
            这种系列的好处是：每一条独立看都完整，但 100 条放在一起就是一个完整的"老破小改造方法库"。粉丝会觉得"这个号值得长期关注"，而不是"看一条就走"。
          </p>
        </CaseBlock>

        <SubHead>系列化的三个判定标准</SubHead>
        <p>不是所有选题都适合系列化。一个好系列要满足三个条件：</p>

        <NumberedList
          items={[
            <>
              <Strong>变量足够多。</Strong>明星可以列 100 个、城市可以列 300 个、菜品可以列上千。如果你想做的变量只有 5 个，那不叫系列。
            </>,
            <>
              <Strong>定量足够稳。</Strong>同样的开场句、同样的镜头节奏、同样的结尾收口——只有定量稳定，用户才会形成"看了一条就期待下一条"的预期。
            </>,
            <>
              <Strong>每一条都能独立成立。</Strong>系列里每一条视频必须自身完整。新用户从第 78 条进来，也要看得懂、看得爽，不需要回头补前面的内容。
            </>,
          ]}
        />

        <ToolCard
          tag="工具 3.5"
          title="选题系列化模板"
          desc="先定义系列名字、定量、变量、爆款元素。一个系列填一张表。"
        >
          <Table
            head={['维度', '内容', '示例（养猫必后悔系列）']}
            rows={[
              ['系列名字', '/', '养猫必后悔的 N 件事'],
              ['定量（不变的）', '/', '"必后悔"开头 + 8 件事并列结构 + 每件配反例'],
              ['变量（每次变的）', '/', '具体的产品 / 行为 / 价位'],
              ['主打爆款元素', '/', '最差 + 人群（养猫人）'],
              ['预计可拍条数', '/', '60 条以上'],
              ['首发选题', '/', '养猫必后悔买的 8 件东西'],
            ]}
            emptyCols={[1]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-3-6"
        no="3.6"
        tag="素材库"
        title="素材库四类三工具 · 永不断更的秘密"
        lead="你不勤奋搭素材库，就要终生在直播间问'老师我没灵感怎么办'。"
      >
        <p>
          所有看起来"灵感无穷"的博主，背后都做了同一件事——他们建了一个属于自己的素材库。素材库是博主的弹药库：当你没灵感的时候，打开它，永远有可以拍的东西。
        </p>
        <p>
          我们认识的一位编导，在某个团队工作半年期间搭了一个 36G 的素材库。离职后，他把这个素材库整体打包卖给了同行，<Strong>第一桶金五六百块</Strong>——这个数字不大，但说明一件事：素材库本身就是资产，是可以被独立估值的。
        </p>

        <SubHead>素材库要建哪四类</SubHead>

        <NumberedFalseList
          items={[
            {
              title: '选题素材库。',
              verdict: '装"别人讲过的好选题"。',
              body: '不分行业，只要这个选题的角度好——"前途和爱情哪个重要""为什么没说过我爱你"——都收进来。未来你想拍同类话题，可以借鉴角度，但不抄表达。',
            },
            {
              title: '开篇素材库。',
              verdict: '装"前三秒抓眼球的句式"。',
              body: '"信不信我用 15 秒让你放弃……""一个人一台电脑，一天就能……"——这些都是跨行业可复用的开篇句式。哪行用得火，你换成自己的行业就能用。',
            },
            {
              title: '结构 / 完结素材库。',
              verdict: '装"完整结构跑通的视频"。',
              body: '比如"小有成就型故事结构"——困境 1 → 转机 1 → 困境 2 → 转机 2 → 感悟金句。把这种已经被验证的结构拆出来，做成模板，自己往里填行业内容。',
            },
            {
              title: '呈现形式素材库。',
              verdict: '装"拍摄/剪辑/出镜方式的范本"。',
              body: '比如"导游身份"出场、"在外景给客户讲解"的口播形态、"画面 + 配音 + 贴图"的混合呈现。换一个呈现形式，同一个选题就能感觉是新的。',
            },
          ]}
        />

        <SubHead>素材库要用哪三个工具</SubHead>
        <p>素材库的工具选择，要看你的使用场景。我们给的组合是三个：</p>

        <TripleGrid
          cols={[
            {
              variant: 'flow',
              title: '电脑文件夹',
              body:
                '主力。建一个"素材库"根目录，下面分四个子文件夹（选题/开篇/结构/呈现形式），每个子文件夹下再按脚本类型或行业细分。适合系统性整理。',
            },
            {
              variant: 'fan',
              title: '抖音收藏夹',
              body:
                '随手存。刷视频时按一下星号，分到不同的收藏夹里。建议先把"公开"关掉。手机随时刷、随时存，是最高频的入口。',
            },
            {
              variant: 'brand',
              title: '幕布（或同类笔记 App）',
              body:
                '记金句、记片段、记思考。任何你听到觉得"这句话写得真好"的，单独存进笔记软件。手机电脑同步，搜索方便。换成印象笔记、Notion、Apple 备忘录都行，看习惯。',
            },
          ]}
        />

        <Insight label="素材库的三个判定标准">
          收进素材库的内容，要过三关：<Strong>客观性</Strong>——别看百万千万大号，要看几千粉就出爆款的小号，那才说明选题本身硬；<Strong>有效性</Strong>——一年以内的内容，更老的话题已过时；<Strong>可用性</Strong>——超预算、超时间、自己根本执行不了的，不收。
        </Insight>

        <SubHead>怎么从抖音收藏夹搭起</SubHead>
        <p>
          如果你完全没建过素材库，从最低门槛的"抖音收藏夹"开始。具体做法：进入抖音"收藏"页，点击"创建文件夹"，依次创建：选题、开篇、结构、呈现形式、金句、教知识、晒过程、聊观点、讲故事——这九个。然后把"公开"关闭。
        </p>
        <p>
          以后每次刷到一条让你"哇"的视频，点星号，分到对应文件夹。一周下来，你的库就开始有库存了。<Strong>一个月之后，你再也不会问"今天拍什么"——你只会问"今天从哪个文件夹挑一条"。</Strong>
        </p>

        <ToolCard
          tag="工具 3.6"
          title="素材库目录树（可直接复制建目录）"
          desc="把这棵目录树原样复制到电脑文件夹里。每天晚上 10 分钟整理一下，三个月后你就有了一个能卖钱的库。"
        >
          <Table
            head={['一级目录', '二级目录', '存什么']}
            rows={[
              ['素材库 / 选题', '教知识 / 晒过程 / 聊观点 / 讲故事', '同结构的视频选题'],
              ['素材库 / 开篇', '提问 / 互动 / 对话 / 热点 / 投稿', '前 3 秒抓眼球句式'],
              ['素材库 / 结构', '冲突 / 平行 / 破解 / 解读 / 故事', '完整跑通的视频模板'],
              ['素材库 / 呈现形式', '口播 / Vlog / 情景剧 / 探店 / 测评', '可借鉴的呈现范本'],
              ['素材库 / 金句', '爱情 / 友情 / 工作 / 励志', '触动人心的句子'],
              ['素材库 / 反例', '/', '反例：用过/拍过但失败的'],
            ]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            一级目录的"四类"对齐原始方法论。二级目录是本书在四类基础上的实操扩展，可按行业灵活增删；新建账号建议先把一级目录建齐，二级目录边建边补。
          </p>
        </ToolCard>

        <CaseBlock title='反例 · 把素材库建成"垃圾堆"'>
          <p>
            一位创作者建了素材库，但只做了一件事——遇到爆款就收。半年后他的库里有 2000 多条视频，但从来没用过一条。原因是：没有分类、没有标签、没有判定标准——库变成了垃圾堆。
          </p>
          <p>
            正确做法是：每收一条，强迫自己 5 秒钟内贴一个标签（选题 / 开篇 / 结构 / 呈现）；每周日花 30 分钟回看一遍这周收的，删掉"过两眼觉得没那么好"的。"建库"和"清库"的工作量大致 1:1，否则库就会失效。
          </p>
        </CaseBlock>
      </Chapter>

      <Chapter
        id="ch-3-7"
        no="3.7"
        tag="跨领域借鉴"
        title="跨领域借鉴 · 而非盯同行"
        lead="你盯着同行，背后十万个同行也在盯着同一个同行。"
      >
        <p>
          这是一个反共识的方法论：<Strong>做内容不能盯同行。</Strong>大多数博主默认的做法是——打开抖音搜自己行业关键词，刷同行的爆款，照着做。但这个动作的问题在于，背后所有同行都在做同一件事。你抄过来的角度，再抄给十万个对手，没有任何稀缺性。
        </p>
        <p>
          一个简单的判断：当你打开抖音发现"同行又出了一条新爆款，赶紧学一下"，这个念头本身就该被警惕——这条爆款已经过了它的红利期。你能看到，意味着算法已经推到饱和了；你照着做，意味着进入了红海复制。
        </p>

        <PullQuote>同样的开篇，在他行业里是爆款；在你行业里，没人用过——你就是原创。</PullQuote>

        <SubHead>跨领域借鉴的标准动作</SubHead>
        <p>
          正确的做法是：放下"同行参考"的本能，每天花一半的刷视频时间，去看跟你完全无关的行业。你要找的不是"内容"，而是"结构"——开篇句式、呈现形态、剪辑节奏、情绪曲线。把这些抽象出来，搬到你自己的行业里。
        </p>

        <CaseBlock title="案例 · 开车四大装 X · 殡葬四大装 X · 万表四大装 X">
          <p>
            一位汽车博主拍了"开车四大装 X 行为"——爆了。
          </p>
          <p>
            一位殡葬行业博主借鉴了这个开篇结构，拍了"办丧事的四大装 X 行为"——<Strong>500 多万播放</Strong>。
          </p>
          <p>
            一位卖万表（劳力士等）的博主也借鉴了这个结构，拍了"戴万表的四大装 X 行为"——<Strong>100 多万播放</Strong>。
          </p>
          <p>
            三个完全不相干的行业（汽车 / 殡葬 / 高奢手表），借同一个开篇结构，分别在各自行业里成为爆款。这就是跨领域借鉴的全部威力——同样的句式，在他人行业里是抄，在你行业里是原创。
          </p>
        </CaseBlock>

        <SubHead>盯同行的代价</SubHead>
        <p>
          盯同行最大的代价不是"抄到的内容差"，而是"账号长得越来越像同行"。一段时间之后，你的账号在你这个圈子里没有任何辨识度——观众分不清你和别人有什么区别，也就没有理由长期跟着你。
        </p>
        <p>
          反过来，跨领域借鉴的账号会显得"有个性"。因为你说话的方式、你呈现的节奏，是从别的圈子搬来的——同行没见过，观众也没见过。这种"不同"本身就是稀缺。
        </p>

        <Insight label="同行只看一类东西">
          但同行不是完全不看。在三件事上，同行的爆款还是要看——<Strong>选题（你的目标人群最近在想什么）、热点（你这个圈子里今天发生了什么）、新出现的产品/竞争方</Strong>。这是"必要的情报"，但不是"借鉴的对象"。
        </Insight>

        <ToolCard
          tag="工具 3.7"
          title="跨领域选题平移矩阵"
          desc='每周选 3 条跨行业爆款，把它们的"结构"抽出来，套到你的行业里。'
        >
          <Table
            head={['跨领域爆款（原始）', '抽出来的结构', '平移到我的行业']}
            rows={[
              ['开车四大装 X 行为', '"X 行业的四大装 X 行为"', '/'],
              ['养猫必后悔的 8 件事', '"X 必后悔的 N 件事"', '/'],
              ['内行人买什么 vs 外行人买什么', '"内行 vs 外行 在 X 上的差异"', '/'],
            ]}
            fillRows={[
              ['（你刷到的爆款）', '/', '/'],
              ['（继续）', '/', '/'],
              ['（继续）', '/', '/'],
            ]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            可以把这张表喂给 AI：让它根据"抽出来的结构"，给你的行业生成 5 个候选选题。AI 在结构平移上比人快。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-3-8"
        no="3.8"
        tag="本篇练习"
        title="搭建你的 30 条选题库"
        lead="这一章不教方法，只教交付。把前七节的工具，转成你抽屉里的库存。"
      >
        <p>
          第三篇的最后一节，不增加新方法，只把前七节的工具收口为一份具体的产出——一份能撑你拍一个月的选题库。三十条选题，是一个新手能跑通流水线的最小规模；也是一个老手用来"验证选题工厂"是否成型的最小测试。
        </p>

        <SubHead>30 条选题的组成结构</SubHead>
        <p>不能 30 条全是同一类。一份健康的选题库，由四种角色组成：</p>

        <TripleGrid
          cols={[
            {
              variant: 'flow',
              title: '10 条常青选题',
              body:
                '永远适用、永远有人搜的选题。比如"装修最大的 5 个坑""家政服务最该问的 3 个问题"。它们不会爆，但永远不会死——是你的稳定流量底座。',
            },
            {
              variant: 'fan',
              title: '10 条热点改编',
              body:
                '从最近一周的热点里，按四套路（梳理 / 神评论 / 找争议 / 改编）改出来的选题。它们时效性强、爆款概率高、但生命周期短——是你的尖峰武器。',
            },
            {
              variant: 'brand',
              title: '5 条故事 + 5 条转化',
              body:
                '5 条用情绪波点写的故事——立人设、建信任；5 条直接服务变现——晒过程、讲案例、推产品。这两类一起，决定你的账号能不能"挣到钱"。',
            },
          ]}
        />

        <SubHead>填写流程</SubHead>
        <p>按下面六步，今天就能交付完成：</p>

        <NumberedList
          items={[
            <>
              <Strong>定下"我的爆款元素组合"。</Strong>从八大元素里挑两个你最容易做的（比如"最差 + 人群"，比如"成本 + 头牌"）。这两个是接下来一个月你的主打元素，所有选题都要往这两个上靠。
            </>,
            <>
              <Strong>用工具 3.1，写出 10 条常青。</Strong>对照五方向（痛点 / 疑问 / 坑 / 盲区 / 泛话题），每个方向挑 2 条最具体的，写出来。
            </>,
            <>
              <Strong>打开抖音热点榜，写出 10 条热点改编。</Strong>用工具 3.3 的四套路，对今天的 5 个热点各做一次"梳理 / 神评论 / 改编 / 找争议"判定，挑出 10 条最适合你的。
            </>,
            <>
              <Strong>用工具 3.5，定一个选题系列。</Strong>定一个"定量 + 变量"的系列。30 条里至少有 8 条来自这个系列——这是你账号能"被持续认得"的关键。
            </>,
            <>
              <Strong>列出 5 条故事。</Strong>翻一翻你过去一个月的情绪波点（生气 / 委屈 / 激动 / 愣神），每一个挑一个出来，写成一段 100 字的故事素描。
            </>,
            <>
              <Strong>列出 5 条转化选题。</Strong>每一条都要直接服务变现——"这个产品怎么用""客户为什么选我""我家和别家的具体差异"。这五条决定你能不能把粉丝变成订单。
            </>,
          ]}
        />

        <ToolCard
          tag="工具 3.8"
          title="30 条选题表（交付物）"
          desc="把这张表填完。不要追求完美，先填满 30 行。然后明天就开始拍。"
        >
          <Table
            head={['No.', '选题', '类型', '爆款元素', '脚本类型']}
            rows={[
              ['01-10', '（10 条常青选题）', '常青', '/', '教知识 / 晒过程'],
              ['11-20', '（10 条热点改编）', '热点', '热点四套路其一', '聊观点 / 讲故事'],
              ['21-25', '（5 条故事）', '故事', '人群 / 反差', '讲故事'],
              ['26-30', '（5 条转化）', '转化', '最差 / 头牌 / 成本', '晒过程 / 教知识'],
            ]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            交付标准：填完后，每条选题用一句话讲清楚"这条视频讲什么"，可以在 5 秒内向同事说明白。说不明白的，先放着——本质上你自己还没想清楚。
          </p>
        </ToolCard>

        <Insight label="本篇收口">
          这 30 条选题，决定了你接下来一个月不再焦虑"今天发什么"。但更重要的是：拍完这 30 条之后，你会发现哪些是"想象中的好选题但拍出来没人看"、哪些是"自己觉得普通但其实跑出来了"。这些数据，会成为下一轮 30 条的基础。
        </Insight>

        <CaseBlock title="收尾 · 选题工厂的复利">
          <p>
            一个跑通的选题工厂，第一个月可能跟"灵感型创作"看起来差不多。但到了第三个月，差距就开始拉开——你的选题成功率会稳定上升，你的素材库会越用越厚，你的爆款元素会越用越熟。
          </p>
          <p>
            最关键的是：到第六个月，你不再"被一条爆款绑架"。当一条视频火了，你不会因为"下一条不知道拍什么"而陷入焦虑——你只是从库里挑下一条。这就是工业化的全部价值。
          </p>
        </CaseBlock>
      </Chapter>

      <PartEnd />
    </div>
  </div>
)

const PartCover = () => (
  <div className="mb-20 mt-4 border-b border-white/10 pb-16 text-center sm:mb-24 sm:pb-20">
    <div className="mb-7 text-[12px] tracking-[0.7em] text-[#b8aa96]" style={{ paddingLeft: '0.7em' }}>
      第　三　篇
    </div>
    <h1 className="font-serif-zh text-[44px] font-semibold leading-[1.2] tracking-[0.14em] text-[#fffdf7] sm:text-[60px]">
      选题与素材库
    </h1>
    <div className="mt-6 font-mono text-[12px] tracking-[0.4em] text-[#b8693a] sm:text-[13px]">
      PART　Ⅲ　·　TOPICS　&amp;　LIBRARY
    </div>
    <Ornament className="mx-auto mt-9" />
    <p className="mx-auto mt-12 max-w-[460px] text-[14.5px] leading-[2.05] tracking-[0.03em] text-[#cfc6b8] sm:text-[15px]">
      拍什么，比怎么拍重要十倍。
      <br />
      把"等灵感"变成"打开素材库就能拍"。
      <br />
      读完后，你应当能独立产出 30 条以上可用选题——
      <br />
      不再焦虑"今天发什么"，而是从抽屉里直接挑。
    </p>
  </div>
)

const Ornament = ({ className = '' }: { className?: string }) => (
  <div className={`relative h-px w-20 bg-[#8b2e2e] ${className}`}>
    <span className="absolute -left-3.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#8b2e2e]" />
    <span className="absolute -right-3.5 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-[#8b2e2e]" />
  </div>
)

type ChapterProps = {
  id: string
  no: string
  tag: string
  title: string
  lead: string
  children: ReactNode
}

const Chapter = ({ id, no, tag, title, lead, children }: ChapterProps) => (
  <section
    id={id}
    className="mt-24 scroll-mt-24 border-t border-white/10 pt-16 first-of-type:mt-10 first-of-type:border-t-0 first-of-type:pt-0"
  >
    <div className="mb-5 flex items-baseline justify-between font-mono text-[10.5px] uppercase tracking-[0.35em] text-[#8a7e6f] sm:text-[11.5px]">
      <span className="font-semibold text-[#b8693a]">{no}</span>
      <span>{tag}</span>
    </div>
    <h2 className="font-serif-zh text-[26px] font-semibold leading-[1.35] tracking-[0.06em] text-[#fffdf7] sm:text-[32px]">
      {title}
    </h2>
    <p className="mb-9 mt-3 text-[14.5px] italic tracking-[0.04em] text-[#8a7e6f] sm:text-[15px]">
      {lead}
    </p>

    <div
      className="text-[15px] leading-[2.05] text-[#d6cfc4] sm:text-[15.5px] [&>p]:mb-[18px] [&>p]:text-justify"
      style={{ textJustify: 'inter-ideograph' } as unknown as React.CSSProperties}
    >
      {children}
    </div>

    <div className="mt-14 text-center text-[16px] tracking-[1em] text-white/15">·　·　·</div>
  </section>
)

const SubHead = ({ children }: { children: ReactNode }) => (
  <h3 className="font-serif-zh mb-3.5 mt-11 border-l-[3px] border-[#8b2e2e] pl-3 text-[18px] font-semibold leading-[1.4] tracking-[0.04em] text-[#fffdf7] sm:text-[19px]">
    {children}
  </h3>
)

const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-[#fffdf7]">{children}</strong>
)

const Insight = ({ label, children }: { label: string; children: ReactNode }) => (
  <aside className="my-7 border-l-[3px] border-[#b8693a] bg-white/[0.04] px-6 py-5 backdrop-blur-sm sm:my-8 sm:px-7">
    <div className="mb-2 font-mono text-[11px] font-semibold uppercase tracking-[0.4em] text-[#b8693a]">
      {label}
    </div>
    <div className="text-[14.5px] leading-[1.95] text-[#e7dfd4] sm:text-[15.5px]">{children}</div>
  </aside>
)

const PullQuote = ({ children }: { children: ReactNode }) => (
  <div className="font-serif-zh relative my-10 px-2 py-8 text-center text-[20px] font-semibold leading-[1.75] tracking-[0.06em] text-[#fffdf7] sm:my-12 sm:text-[24px]">
    <span className="mx-auto mb-6 block h-px w-12 bg-[#8b2e2e]" />
    {children}
    <span className="mx-auto mt-6 block h-px w-12 bg-[#8b2e2e]" />
  </div>
)

const CaseBlock = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="my-8 rounded-sm border border-white/10 bg-white/[0.035] px-6 py-6 backdrop-blur-sm sm:px-7 sm:py-7">
    <h4 className="mb-3 font-mono text-[11.5px] font-semibold uppercase tracking-[0.35em] text-[#b8693a]">
      {title}
    </h4>
    <div className="text-[14px] leading-[1.95] text-[#d6cfc4] sm:text-[15px] [&>p]:mb-[14px] [&>p:last-child]:mb-0">
      {children}
    </div>
  </div>
)

const ToolCard = ({
  tag,
  title,
  desc,
  children,
}: {
  tag: string
  title: string
  desc: string
  children: ReactNode
}) => (
  <div className="my-10 border-t border-[#8b2e2e]/70 pt-7">
    <div className="mb-3 flex flex-wrap items-baseline gap-3">
      <span className="bg-[#8b2e2e] px-2.5 py-1 font-mono text-[10.5px] font-semibold tracking-[0.35em] text-[#fffdf7]">
        {tag}
      </span>
      <h4 className="font-serif-zh text-[17px] font-semibold tracking-[0.04em] text-[#fffdf7]">
        {title}
      </h4>
    </div>
    <p className="mb-4 text-[13.5px] leading-[1.8] text-[#8a7e6f]">{desc}</p>
    {children}
  </div>
)

type TableProps = {
  head: string[]
  rows: string[][]
  fillRows?: string[][]
  emptyCols?: number[]
  scoreCols?: number[]
}

const Table = ({ head, rows, fillRows = [], emptyCols = [], scoreCols = [] }: TableProps) => (
  <div className="-mx-1 overflow-x-auto">
    <table className="w-full border-collapse text-left text-[13.5px] leading-[1.7]">
      <thead>
        <tr>
          {head.map((h) => (
            <th
              key={h}
              className="border-b border-white/10 bg-white/[0.04] px-3 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b8aa96]"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={`r-${i}`}>
            {row.map((cell, j) => {
              const isScore = scoreCols.includes(j)
              const isEmpty = emptyCols.includes(j)
              return (
                <td
                  key={`c-${i}-${j}`}
                  className={[
                    'border-b border-white/10 px-3 py-3 align-top text-[#d6cfc4]',
                    isScore
                      ? 'text-center font-semibold text-[#b8693a] [font-variant-numeric:tabular-nums]'
                      : '',
                    isEmpty ? 'italic text-[#8a7e6f]' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {cell}
                </td>
              )
            })}
          </tr>
        ))}
        {fillRows.map((row, i) => (
          <tr key={`f-${i}`} className="bg-[rgba(184,105,58,0.05)]">
            {row.map((cell, j) => (
              <td
                key={`fc-${i}-${j}`}
                className="border-b border-white/10 px-3 py-3 align-top italic text-[#8a7e6f] last:border-b-0"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

type TripleCol = {
  variant: 'flow' | 'fan' | 'brand'
  title: string
  body: string
}

const tripleAccent: Record<TripleCol['variant'], string> = {
  flow: 'border-t-white/20',
  fan: 'border-t-[#8b2e2e]',
  brand: 'border-t-[#b8693a]',
}

const TripleGrid = ({ cols }: { cols: TripleCol[] }) => (
  <div className="my-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
    {cols.map((c) => (
      <div
        key={c.title}
        className={`border border-white/10 border-t-[3px] bg-white/[0.035] px-5 py-6 backdrop-blur-sm ${tripleAccent[c.variant]}`}
      >
        <h5 className="font-serif-zh mb-3 text-[15.5px] font-semibold tracking-[0.08em] text-[#fffdf7]">
          {c.title}
        </h5>
        <p className="m-0 text-[13px] leading-[1.9] text-[#cfc6b8]">{c.body}</p>
      </div>
    ))}
  </div>
)

type QuadCol = { title: string; body: string }

const quadAccent = ['border-t-white/20', 'border-t-[#8b2e2e]', 'border-t-[#b8693a]', 'border-t-[#d9c8ad]'] as const

const QuadGrid = ({ cols }: { cols: QuadCol[] }) => (
  <div className="my-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
    {cols.map((c, i) => (
      <div
        key={c.title}
        className={`border border-white/10 border-t-[3px] bg-white/[0.035] px-5 py-6 backdrop-blur-sm ${quadAccent[i % quadAccent.length]}`}
      >
        <h5 className="font-serif-zh mb-3 text-[15.5px] font-semibold tracking-[0.08em] text-[#fffdf7]">
          {c.title}
        </h5>
        <p className="m-0 text-[13px] leading-[1.9] text-[#cfc6b8]">{c.body}</p>
      </div>
    ))}
  </div>
)

const NumberedList = ({ items }: { items: ReactNode[] }) => (
  <ol className="my-6 list-none p-0">
    {items.map((item, i) => (
      <li
        key={i}
        className="relative border-b border-dotted border-white/10 py-2.5 pl-14 text-[14px] leading-[1.85] text-[#d6cfc4] sm:text-[14.5px]"
      >
        <span className="absolute left-0 top-3 font-mono text-[15px] font-semibold text-[#b8693a] [font-variant-numeric:tabular-nums]">
          {String(i + 1).padStart(2, '0')}
        </span>
        {item}
      </li>
    ))}
  </ol>
)

type FalseItem = { title: string; verdict: string; body: string }

const NumberedFalseList = ({ items }: { items: FalseItem[] }) => (
  <div className="my-6 space-y-4">
    {items.map((it, i) => (
      <div
        key={it.title}
        className="grid grid-cols-[36px_1fr] gap-3 border-b border-dotted border-white/10 pb-4"
      >
        <span className="pt-1 font-mono text-[13px] font-semibold text-[#b8693a] [font-variant-numeric:tabular-nums]">
          {String(i + 1).padStart(2, '0')}
        </span>
        <div className="text-[14.5px] leading-[1.95] text-[#d6cfc4] sm:text-[15px]">
          <span className="font-semibold text-[#fffdf7]">{it.title}</span>
          <span className="ml-1 text-[#b8693a]">——{it.verdict}</span>
          <span>{it.body}</span>
        </div>
      </div>
    ))}
  </div>
)

const PartEnd = () => (
  <div className="mt-24 border-t border-white/10 pt-8 text-center font-mono text-[12px] uppercase tracking-[0.3em] text-[#8a7e6f] sm:text-[12.5px]">
    <div>—— 第三篇 完 ——</div>
    <div className="font-serif-zh mt-3 text-[13px] tracking-[0.18em] text-[#b8693a]">
      下一篇 · 文案与通用结构：怎么把人留下来
    </div>
  </div>
)

const ChapterEndNav = () => (
  <nav className="mt-12 grid gap-3 sm:grid-cols-2">
    <Link
      href="/playbook/positioning"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a7e6f]">
          上一篇
        </span>
        <span className="font-serif-zh mt-1 block text-[15px] font-semibold tracking-[0.06em] text-[#fffdf7]">
          ← 第二篇 · 定位
        </span>
      </span>
    </Link>
    <Link
      href="/playbook/copywriting"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a7e6f]">
          下一篇
        </span>
        <span className="font-serif-zh mt-1 block text-[15px] font-semibold tracking-[0.06em] text-[#fffdf7]">
          第四篇 上 · 文案与通用结构 →
        </span>
      </span>
    </Link>
  </nav>
)
