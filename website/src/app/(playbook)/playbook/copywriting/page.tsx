/* eslint-disable no-irregular-whitespace */
import type { Metadata } from 'next'
import Link from 'next/link'
import type { ReactNode } from 'react'
import { requireMembership } from '@/features/membership/server/require-membership'

export const metadata: Metadata = {
  title: '第四篇 · 上 — 文案与通用结构 · 微域生光自媒体运营实战',
  description:
    '怎么把人留下来。文案的本质是拖时间，结构服务于信息密度，每 5 秒都要给一个新刺激。',
  openGraph: {
    title: '第四篇 · 上 — 文案与通用结构 · 微域生光自媒体运营实战',
    description: '一个公式 · 八节展开 · 一份文案训练手册。',
  },
}

const CHAPTERS = [
  { id: 'ch-4u-0', no: '4U.0', label: '导读 · 信息密度' },
  { id: 'ch-4u-1', no: '4U.1', label: '文案的本质是拖时间' },
  { id: 'ch-4u-2', no: '4U.2', label: '起承转合 · 四段四技' },
  { id: 'ch-4u-3', no: '4U.3', label: '五大开头模板' },
  { id: 'ch-4u-4', no: '4U.4', label: '五大结构 + 小火车' },
  { id: 'ch-4u-5', no: '4U.5', label: '五大结尾 × 心理动作' },
  { id: 'ch-4u-6', no: '4U.6', label: '单向阀 · 前置五问' },
  { id: 'ch-4u-7', no: '4U.7', label: '画面感 + 力量感 + 标题封面' },
]

export default async function PlaybookCopywritingPage() {
  await requireMembership('/playbook/copywriting')
  return (
    <main className="min-h-screen overflow-x-clip bg-[#050507] text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 18% 0%, rgba(139,46,46,0.24), transparent 38%), radial-gradient(circle at 82% 8%, rgba(34,211,238,0.10), transparent 34%), linear-gradient(180deg, rgba(255,253,247,0.04), transparent 28%)',
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
        Part Ⅳ · 上
      </div>
      <div className="font-serif-zh mb-6 text-[20px] font-semibold tracking-[0.06em] text-[#fffdf7]">
        文案与通用结构
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
        预计阅读 · 38 分钟
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
      <span>第四篇 · 上 · 共九篇</span>
    </div>

    <div className="mx-auto max-w-[720px] pb-20 pt-10 sm:pb-24 sm:pt-14">
      <PartCover />

      <Chapter
        id="ch-4u-0"
        no="4U.0 · 导读"
        tag="Copywriting"
        title="信息密度，而不是干货"
        lead={'读这一篇之前，先把脑子里"短视频就是干货"那张地图烧掉。'}
        first
      >
        <p>
          你大概率听过这样的话：短视频要做干货、要利他、要给用户提供价值。这套说法听上去政治正确，但它在抖音是失效的。失效的方式很简单——你按照这个标准做了几个月，每条都掏心掏肺，结果播放量永远卡在三位数。你打开后台一看，平均观看时长两秒。你于是开始怀疑：是不是被限流了？是不是要换赛道？是不是不该出镜？
        </p>
        <p>
          不是。是你的地图错了。
        </p>
        <p>
          这一篇要立的第一根桩，是把"干货"和"信息密度"区分开。"干货"是创作者视角——我准备了多少有用的内容；"信息密度"是平台视角——这些内容在单位时间里让多少用户停留了多久。两者经常错位：一个三分钟的干货视频，结论一开始就讲完了，剩下两分五十秒是补充和案例——平均观看 7 秒。另一个三分钟的"什么都没讲"的视频，每 3 秒切一个新画面，从头看到尾——平均观看 2 分 20 秒。
        </p>

        <Insight label="本篇主张">
          短视频文案的第一指标不是"用户学到了什么"，而是"用户在你的视频上停留了多久"。"短"不是时间短，是密度高。同样精彩的内容，越长越好。
        </Insight>

        <SubHead>这一篇要交付的能力</SubHead>
        <p>
          这一篇不教你写"金句"，也不教你模仿哪个大 V 的口吻。它要回答的是更底层的问题——为什么大部分文案没人看？文案的第一性原理是什么？怎么把一条普通文案改造成爆款文案？
        </p>
        <p>
          八节的脉络是这样：先在 4U.1 把"拖时间"这个原点定下来；然后从 4U.2 起承转合四段四技进入文案的全身结构；4U.3 开头、4U.4 中段、4U.5 结尾，把全身拆成三段分别上工具；4U.6 单向阀（也常被称作"连环悬疑"）讲一个最容易被忽视、却能让播放翻倍的小技巧；最后 4U.7 把所有文案要落到画面感、力量感与标题封面上——因为再好的文字，过不了标题封面这一关，永远没人看到。
        </p>
        <p>
          读完这一篇，你应当能拿任何一条爆款拆出它的结构、技巧与密度，也能反过来按结构、技巧、密度把自己的脚本一寸寸抬高。
        </p>
      </Chapter>

      <Chapter
        id="ch-4u-1"
        no="4U.1"
        tag="第一性原理"
        title="文案的本质是拖时间"
        lead="不是提供价值，是让用户拍拍屁股走不掉。"
        first
      >
        <p>
          先回答一个最根本的问题：抖音/视频号/快手为什么把流量给某些视频、不给另一些？答案听上去反直觉，但有完整的逻辑链条可以推。
        </p>

        <SubHead>两条公理 · 一个推论</SubHead>
        <p>
          <Strong>公理一，所有 APP 的本质竞争都是时间的竞争。</Strong>用户每天可支配的注意力是固定的——刷你两小时，就刷不了微信两小时。抖音不是在和别的短视频 APP 抢，是在和睡眠、和饭局、和球赛、和游戏一起抢这一份固定的注意力池。所以平台必然把更多流量推给那些"让用户多停留"的视频，因为这样做对平台最有利。
        </p>
        <p>
          <Strong>公理二，越难作弊的参数，可信度越高。</Strong>点赞可以刷、关注可以买、评论可以批量写，但播放时长是按真实流逝的秒数累计的——一个用户一分钟就只能贡献一分钟。所有指标里，完播时长是平台用来反作弊后还能信赖的少数硬指标之一。
        </p>
        <p>
          <Strong>推论，停留即真爱，因为停留有代价。</Strong>用户嘴上说喜欢某个博主可以是客套，但他愿意把这三分钟花在你这里、放弃刷下一个视频——这就为完播时长加上了一层"排他性"的可信度。换句话说，公理二之所以成立，正是因为时间不能被复用。爱就是放弃，时间就是爱。
        </p>

        <Insight label="结论">
          三条公理同时指向同一个参数：完播时长。它是平台分发流量时的核心权重。其余指标都重要，但都没它重要——它和它们的关系，是乘号的左手边对所有右边的项。
        </Insight>

        <PullQuote>短视频文案的核心，不是提供价值，是拖时间。</PullQuote>

        <p>
          这句话第一次听到时会觉得功利、甚至冒犯。但你回想一下自己最近一周刷过的爆款视频，能想起几条具体内容？大多数人一条都想不起来。你刷了三个小时，脑子是空的，但你的眼睛和大拇指停不下来——这就是平台想要的状态，也是爆款视频在做的事。它不是在给你提供价值，它是在让你忘记关掉屏幕。
        </p>

        <SubHead>低密度 / 高密度 / 超高密度</SubHead>
        <p>
          把这一原点确定下来，剩下的事就只是问：怎样在同一时间内塞进更多让用户没法走开的刺激点？这就是信息密度。
        </p>

        <TripleGrid
          cols={[
            {
              variant: 'flow',
              title: '普通视频 · 低密度',
              body:
                '同样三分钟讲一件事。开头到结尾只有一个信息点。用户大概率在前 5 秒滑走——他不是不喜欢，他是发现"后面没新东西可拿"。这种视频对应播放量三位数。',
            },
            {
              variant: 'fan',
              title: '热门视频 · 高密度',
              body:
                '同样三分钟，把一件事切成十个片段——开头、衔接、举例、反转、对比、补充、结尾，每段两到三秒。用户每隔几秒都被一个新画面或新信息钩一下，没疲惫就被吊起来。对应播放量五位到六位。',
            },
            {
              variant: 'brand',
              title: '爆款视频 · 超高密度',
              body:
                '在时间轴上已经切到极致后，再往空间轴上加东西——背景里有动作、画面有并置、声音有 ASMR、镜头有反差。每一秒同时打三种感官。对应播放量七位到八位。',
            },
          ]}
        />

        <SubHead>"切片"——把一个视频拆成十个</SubHead>
        <p>
          时间轴上的密度怎么做？答案就是切片。把一个三分钟的视频，拆成十个 18 秒的小片段，每个小片段都自带一个微小的悬念或反转。用户看到的不是一个视频，是十个互相勾着的微视频，他每看完一个就被下一个钩着——直到结尾才发现自己已经看完了。
        </p>

        <CaseBlock title="案例 · 一个摄影师的 0~1500 度">
          <p>
            一个做眼镜的账号，文案极简：他不讲什么"近视的成因"或"配镜技巧"，他只做一件事——把"度数从 0 一直加到 1500"做成一组连续画面，每一档度数对应一个视觉效果切片。用户进来想看 100 度什么样，看到了又想看 200 度什么样，一直滑到 1500 度看完整条视频。这条没有任何"干货"输出的视频，能稳定跑到百万级播放、数万点赞。同样的口播如果换成"近视的五个常见误区"，大概率两位数赞。
          </p>
          <p>同样的逻辑可以无限套用：摄影师讲"春夏秋冬同一个颐和园"、装修号讲"不要 A 要 B 的二十组对比"、健身号讲"体脂率 30% / 25% / 20% / 15% / 10% / 5% 分别长什么样"——这些都是切片。一条都没有提供传统意义上的"知识"，但每一条都从头到尾把人焊死。</p>
        </CaseBlock>

        <SubHead>空间轴 · 再往里塞东西</SubHead>
        <p>
          切到极致之后还想要更多播放，就要在画面里加第二种、第三种感官刺激。一个人在镜头前讲减脂餐，最多是热门级别。同一个人讲减脂餐的同时背景里有一只猴子拉着摇晃的物件——这就是爆款级别。画面里多一个不相干却抢眼的视觉元素，用户被两件事同时勾住，停留时长直接翻倍。
        </p>
        <p>
          声音也是这条逻辑的应用：一个煎蛋画面配上"滋滋"的油声、一个开瓶画面配上"砰"的开盖声、一段说话配上一段背景里画外的笑——这些都不是"内容"，但它们都增加密度。这就是为什么很多美食号一旦关掉声音就完全没意思了：他们其实是靠 ASMR 把用户钉在画面里的。
        </p>

        <ToolCard
          tag="工具 4U.1"
          title="信息密度自评表"
          desc="把你最近的一条视频按每 5 秒一格切开，逐格回答这一格里向用户输出了几个信息点。3 个以下，是普通视频；5-8 个，是热门视频；10 个以上，才有爆款的概率。"
        >
          <Table
            head={['时间段', '画面信息点', '声音信息点', '文案信息点', '小计']}
            rows={[
              ['00:00 - 00:05（参考）', '主体特写 + 背景反差物', '人声 + 环境音', '钩子问句', '5'],
              ['00:05 - 00:10（参考）', '场景切换 + 道具动作', '人声 + 节奏音乐', '反转转折', '5'],
              ['00:10 - 00:15（参考）', '近景特写 + 数据卡', '人声 + 拟声', '具体数字', '5'],
            ]}
            scoreCols={[1, 2, 3, 4]}
            fillRows={[
              ['（填你视频的 0-5 秒）', '/', '/', '/', '/'],
              ['（填 5-10 秒）', '/', '/', '/', '/'],
              ['（填 10-15 秒）', '/', '/', '/', '/'],
              ['（填 15-20 秒）', '/', '/', '/', '/'],
            ]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            自评说明：信息点 = 用户没预期到、需要重新分配注意力的元素。一段不变的口播 + 不变的背景 = 1 个信息点，不是 5 个。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-4u-2"
        no="4U.2"
        tag="全身结构"
        title="起承转合 · 四段结构与四个技巧"
        lead="同一个意思，三种说法可以差出一万倍。"
        first
      >
        <p>
          很多创作者对文案有个误解——觉得"把意思表达清楚就行了"。但同一个意思，不同的表达可以差一万倍。看一个例子，三种说法都是"不要和杠精辩论"：
        </p>

        <Checklist
          items={[
            '1.0 版本：不要和杠精辩论，毫无意义。',
            '2.0 版本：不要试图和杠精辩论，他会把你拉低到同一水平，然后用熟练的方式打败你。',
            '3.0 版本（郭德纲）：我和火箭专家说，你的燃料不行，这火箭上不了天，烧柴最好，还得是水洗煤。这个专家只要正眼看我一下，他就输了。',
          ]}
        />

        <p>
          中心思想完全没变。但 1.0 版本两秒钟刷过去就忘了，2.0 让人停下来想了一下，3.0 让人想转发——同样的核心，三个量级的传播。这一节要解决的，就是把 1.0 改写到 2.0 再改写到 3.0 的方法。它不是修辞学的修辞学，而是工程级的"四段结构 + 四个技巧"。
        </p>

        <SubHead>四段结构 · 起 承 转 合</SubHead>

        <p>
          一个能让人看完的短视频文案，至少要有四段。每一段都有一个明确的功能，缺一段都不完整。
        </p>

        <NumberedList
          items={[
            <>
              <Strong>起 · 破题。</Strong>第一句话必须像磁铁一样把用户黏住。它不传达答案，只传达悬念——"为什么牛奶是方盒可乐是圆瓶"、"年少不知软饭香"、"千万不要买这个炒锅"。一句话之内必须挑起好奇，否则后面写得再好也是白写。
            </>,
            <>
              <Strong>承 · 衔接。</Strong>这一段很短，两到三句话，作用是"再把用户往里推一把"。它通常先给一个传统答案、一个普遍误解、一个看似有道理的解释——然后准备把它推翻。承的关键是"咬得紧"，不能给用户喘息的空间。
            </>,
            <>
              <Strong>转 · 高光。</Strong>这是整段文案的灵魂。前面所有铺垫都是为了在这一段做一次反转、一次升维、一次出乎意料的揭示。这一段必须够亮——亮到让用户产生一个"我去原来如此"的瞬间。没有"转"的文案是流水账。
            </>,
            <>
              <Strong>合 · 收尾。</Strong>最后一句要像撒糖一样轻轻一抖——可以是金句、可以是反问、可以是悬念——目的是让用户在视频结束的瞬间，仍带着一份"想点赞、想转发、想关注"的冲动。它就是迪士尼最后那场烟花。
            </>,
          ]}
        />

        <CaseBlock title="案例 · 经典爆款拆解 · 牛奶方盒 vs 可乐圆瓶（单条涨粉约 150 万）">
          <p>
            <Strong>起。</Strong>"为什么牛奶是方盒，可乐是圆瓶呢？"——一句话挑起好奇，没有给任何答案。
          </p>
          <p>
            <Strong>承。</Strong>"如果你看过《牛奶可乐经济学》，通常这么回答：第一，可乐即买即喝，圆瓶好拿；第二，牛奶要放进冰柜，冰柜空间宝贵，方盒省空间。"——给一个看似合理的传统答案，用户开始点头。
          </p>
          <p>
            <Strong>转。</Strong>"但这个答案是有问题的，至少三处严重漏洞：冰红茶也是即买即喝为什么是方的？冰柜的主要作用是展示而非存储；如果方盒真的便宜，为什么不会有商家做圆瓶牛奶来抢份额？答案是一定有某个因素极大地制约了所有人。这个因素是利乐包装——利乐包装用纸做成，纸做不出圆瓶，所以全行业齐刷刷采用方盒。"——一连串反问之后给出真正的答案，用户瞬间被点亮。
          </p>
          <p>
            <Strong>合。</Strong>"简单化、自动化、高效率、无浪费——方盒完美胜出。"——四个短句收束，回到主题，留给用户一份"原来是这样"的余味。
          </p>
          <p>整条视频的结构就这么四步。同样的素材，如果开头直接给答案，大概率几千播放；按这套四段写完，这条视频实际单条涨粉约 150 万。</p>
        </CaseBlock>

        <SubHead>四个技巧 · 短句 · 数据 · 比喻 · 金句</SubHead>

        <p>
          有了结构，下一层是工艺。同一句话用四个技巧打磨一遍，威力就翻几倍。
        </p>

        <NumberedFalseList
          items={[
            {
              title: '短句',
              verdict: '能用短句就别用长句。',
              body: '短句节奏紧、信息密度高、适合短视频的注意力节拍。"顶级的厨师懂得调料的取舍。一块豆腐两根小葱。能让你回味三天。"——三个短句，比"顶级的厨师在调料上有一种克制感，他们只用一块豆腐和两根小葱就能让你回味三天"清爽十倍。',
            },
            {
              title: '数据',
              verdict: '多用具体数据，少用抽象描述。',
              body: '"很多顾客都成了回头客"是一个模糊的判断；"91.3% 的顾客会第二次购买"是一个不容反驳的事实。数据越具体越好——"上期学员 317 人"比"上期学员几百人"可信十倍。数据是说服力的捷径。',
            },
            {
              title: '比喻',
              verdict: '多用比喻，少讲原理。',
              body: '"对于养老来说，医疗就像车里的灭火器，可以一辈子不用，但用的那一刻不能掉链子。"——一个比喻，把抽象的"医疗保障的重要性"一秒钟讲清楚。你面对的用户来自千万行业，他们没有义务听懂你的术语；比喻就是降低沟通成本的最有效武器。',
            },
            {
              title: '金句',
              verdict: '能用金句就别用平铺。',
              body: '一段平淡的总结，加上一句"证明自己努力，是这个世界上最简单的事情"，整条视频的分量立刻往上拔一档。金句不只是漂亮，更是给用户提供"可以转发的素材"——它就是别人在朋友圈里替你做二次传播的钩子。',
            },
          ]}
        />

        <ToolCard
          tag="工具 4U.2"
          title="四段结构填空模板"
          desc={'把任意一个选题套进这张表，逐段写出"起、承、转、合"。每一段写完反问自己：这一段在用什么技巧？短句、数据、比喻、金句，至少占两条。'}
        >
          <Table
            head={['段位', '功能', '示范填写', '空白填写']}
            rows={[
              ['起 · 破题', '一句话挑起好奇', '为什么牛奶是方盒，可乐是圆瓶？', '/'],
              ['承 · 衔接', '给一个看似对的传统答案', '《牛奶可乐经济学》通常这么解释……', '/'],
              ['转 · 高光', '推翻传统答案，揭示真正原因', '其实问题出在利乐包装……', '/'],
              ['合 · 收尾', '一句金句 / 一个反问 / 一个钩子', '简单化、自动化、高效率、无浪费。', '/'],
            ]}
            emptyCols={[3]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            自审一遍：四段写完，把"短句、数据、比喻、金句"四张牌过一遍，至少占用两张以上。占不上的那一段，就是后面要重写的位置。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-4u-3"
        no="4U.3"
        tag="开头"
        title="五大开头模板 · 黄金三秒"
        lead="酒香也怕巷子深——前三秒留不住，后面写再好都白搭。"
        first
      >
        <p>
          所有短视频里最贵的资源，是前三秒。这三秒是用户决定"看下去还是滑走"的拐点。开头不只是"一句话"，它包括了文案前三秒、画面前三秒、字幕前三秒、背景音乐前三秒——四样东西同时上阵。这一节集中讲文案的部分，给出五个被反复验证有效的开头模板。
        </p>

        <SubHead>模板一 · 提问式</SubHead>
        <p>
          最基本，也最好用。用一个反共识的问句开场，自动激起用户大脑里"我也想知道答案"的反应。
        </p>
        <p>
          示例："为什么男人比女人更容易脱发？""为什么牛奶是方盒可乐是圆瓶？""为什么 30 年前的冰棍只要 1 分钱，今天却要 5 块？"
        </p>
        <p>
          注意三点：第一，提问要够具体——"为什么脱发的总是你？"比"为什么有人会脱发？"高一个量级；第二，问题最好和你账号目的有承接——下面打算讲什么，问题就要钩在那个方向上；第三，不要连续两条都用同一个句式，平台会判定为低创意。
        </p>

        <SubHead>模板二 · 互动式</SubHead>
        <p>
          一开口就把用户拉进对话框，让他从"旁观者"变成"参与者"。最直接的方法是把"你"放在第一句话里。
        </p>
        <p>
          示例："你有没有过这样的瞬间——明明已经很累，却在床上刷手机刷到凌晨两点？""你相信吗，决定一个人五年后阶层的，不是工资，是某项习惯。""千万不要轻易答应这件事，特别是 35 岁之后的男人。"
        </p>
        <p>
          要点：用第二人称代入，但场景必须具体。"你有没有失眠过"太空泛；"你有没有在凌晨三点想换工作的瞬间"才是钩子。
        </p>

        <SubHead>模板三 · 对话式</SubHead>
        <p>
          直接用两个角色之间的对话开场，把视频中最爆点的一句对白提前到第一秒。这是剧情号和 Vlog 最常用的开场，因为对话天然带场景感。
        </p>
        <p>
          示例：房琪开场把"杨澜你好"这句对话放在第一秒，用户瞬间被勾住——这个素人是怎么跟杨澜在同一个画面里的？再如某情感号开场：A："你为什么不告诉我？" B："因为告诉了你你会更受伤。"——一秒钟内观众已经入戏。
        </p>
        <p>
          要点：对话要短、要有爆点、要勾起"接下来发生了什么"的疑问。普通日常对白放在中段可以，放在开头会浪费。
        </p>

        <SubHead>模板四 · 热点式</SubHead>
        <p>
          用一个仍在热度内的事件、人物或影视作品做开场。热点自带流量，你借势能省一大半"被认识"的成本。但前提是这个热点和你账号目的有承接关系。
        </p>
        <p>
          示例："昨晚那场决赛之后，所有人都在讨论一件事——其实赢的关键在第三回合换鞋的那一刻。""最近《狂飙》大火，但很少有人注意到——主角第一次出场穿的那件夹克，藏着导演的伏笔。"
        </p>
        <p>
          要点：选事件要快、要准、要切口小。盲蹭一个跟你账号完全无关的热点，只会让用户记住事件、忘掉你。
        </p>

        <SubHead>模板五 · 粉丝投稿式</SubHead>
        <p>
          借第三个人的口提出你想讨论的问题。这是非常省力的开场——既不用自己显摆为什么有资格讲，又让账号显得"有人问"。
        </p>
        <p>
          示例："有位读者私信我：'老师，我老公总是说他没钱给我买礼物，可朋友圈又一直在晒新表，我要不要离婚？'——这个问题我以前讲过类似的，但这次我想换个角度。"
        </p>
        <p>
          要点：粉丝投稿可以是真实的，也可以是虚构的（但虚构时不能涉及具体可指认的人）。这种开场顺带塑造了"我是被求教的对象"这个人设。
        </p>

        <Insight label="共同准则">
          五个模板没有"最好"的，只有"最匹配你账号目的"的。判断是否用对的标准也只有一个：前三秒之内用户有没有产生"接下来会发生什么"的疑问。如果有，开头成立；没有，重写。
        </Insight>

        <ToolCard
          tag="工具 4U.3"
          title="五大开头模板速查卡"
          desc="把你接下来要拍的 10 个选题列出来，每个选题逐一试这 5 种开头，挑出最有钩感的那一条作为脚本第一句。同一个选题，五种开头测下来，往往能换出一倍以上的完播。"
        >
          <Table
            head={['模板', '示范开头', '适用场景', '你的填空']}
            rows={[
              ['提问', '为什么 X 是 Y 而不是 Z？', '反共识 / 经济学解读 / 知识科普', '/'],
              ['互动', '你有没有在 X 的瞬间，发现 Y？', '情感 / 职场 / 育儿', '/'],
              ['对话', '"你为什么……？""因为……"', '剧情 / Vlog / 访谈', '/'],
              ['热点', '昨天 X 事件背后，其实 Y 才是关键', '蹭热点 / 行业评论', '/'],
              ['投稿', '有位粉丝私信我：……', '咨询答疑 / 价值观输出', '/'],
            ]}
            emptyCols={[3]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-4u-4"
        no="4U.4"
        tag="中段"
        title="五大结构模板 + 小火车"
        lead="开头把人拉进来，结构把人钉到结尾。"
        first
      >
        <p>
          开头解决"愿不愿意看"，结构解决"愿不愿意继续看"。同样的素材，用错结构会拍出流水账，用对结构能拍出爆款。下面这五种结构，是从大量爆款中反向归纳出来的——每一种都对应一类话题。
        </p>

        <SubHead>结构一 · 冲突模型</SubHead>
        <p>
          四步：提出热门问题 → 引出具体情境 → 点出实际冲突 → 给出有力的回答（或开放式收尾）。
        </p>
        <p>
          打假类、悬疑类、辟谣类最常用这套结构。打假博主孙八皮做"502 胶水沾手"——先提问题"被 502 沾手怎么办？"，然后展示"网上说白醋加盐"，然后点出冲突"我试了，无效"，最后给开放式结尾"那到底怎么办？我们下次告诉你"。播放量稳定百万级。
        </p>

        <SubHead>结构二 · 平行模型</SubHead>
        <p>
          一个主观点 + 多个并列小观点，每个小观点都用事例论证。
        </p>
        <p>
          适合"为什么 X 要 Y"这种总分话题。销售大玩家讲"讲话的顺序比内容更重要"，下面挂了三个并列子论点——报价从高到低、产品名放在价格前面、贵的产品放右手——三个事例都指向同一主张。用户每听完一个例子都更信一分，听完三个就完全接受了主张。
        </p>

        <SubHead>结构三 · 破解模型</SubHead>
        <p>
          三步：提出一个看似无解的问题 → 给出一个独到的解释 → 说出可操作的破解方法。
        </p>
        <p>
          专业人士最容易用这套结构建立权威感。销售大玩家讲"销售电话为什么难打"——独到解释是"因为你总在做自我介绍"，破解方法是"用四个问题代替自我介绍"。三步走完，用户得到了一个具体方案，对作者的判断力也确认了一次。
        </p>

        <SubHead>结构四 · 解读模型</SubHead>
        <p>
          四步：抛出观点 → 说明理由 → 举出例子 → 升华观点。
        </p>
        <p>
          表达类、评论类、人生感悟类最常用。樊小琪讲"寒门难出贵子"——观点是"教育从来不只是孩子的事"，理由是"优秀家长能给的资源差距是结构性的"，例子是马克思家境其实殷实，最后升华为"教育是拼爹妈，不只是拼孩子"。这是即兴演讲里最稳的万能结构。
        </p>

        <SubHead>结构五 · 故事模型</SubHead>
        <p>
          五步：背景 → 冲突 → 转折 → 结局 → 评价。
        </p>
        <p>
          所有 Vlog 都建立在这套结构上。房琪讲"高考落榜到央视主持"——背景是三本院校学编导，冲突是各种推销自己被频频拒绝，转折是参加主持比赛闯到全国舞台，结局是成为央视主持人，评价是"我命由我不由天"。完整的五段不能少任何一段，少了背景观众不入戏，少了评价观众不转发。
        </p>

        <SubHead>把五大结构落到"小火车"</SubHead>
        <p>
          这五种结构，在执行层面都可以套进同一个母模板——小火车结构：车头（撒网选题）+ 若干节车身（切片拖时间）+ 车尾（金句 + 引导动作）。这是一个被反复验证过的爆款工程框架：车头决定能网住多少人，车身负责把网住的人拖到最后。
        </p>

        <TripleGrid
          cols={[
            {
              variant: 'flow',
              title: '车头 · 撒网',
              body:
                '车头是选题，不是开头钩子。选题越大、痛点越准，能被这一条视频网住的人就越多。同一份制作能拿到 1 万还是 100 万播放，70% 由车头决定。前三秒的钩子（见 4U.3）是叠加在车头之上的二级保险，不要把两者混为一谈。',
            },
            {
              variant: 'fan',
              title: '车身 · 切片',
              body:
                '主体内容拆成 4 到 12 节切片，每节 3 到 8 秒。每节切片都要给一个新的视觉冲击或信息冲击，让用户每隔几秒都被"再吊一下"——这就是 4U.1 信息密度的工程化落地。切片越多、密度越高，完播率越高。',
            },
            {
              variant: 'brand',
              title: '车尾 · 收束',
              body:
                '最后 3-5 秒。承担"金句 + 引导动作"的任务。金句让用户记得、引导动作让用户做某件事（关注、点赞、评论、转发、跳转）。车尾要刺、要短、要让人想"再来一遍"。',
            },
          ]}
        />

        <CaseBlock title="案例 · 一条 30 秒爆款的车厢拆解">
          <p>
            一条讲"配镜流程"的视频，30 秒，几乎没有传统意义上的"知识输出"。但它把全程拆成 10 节小车身：① 0 度看世界是什么样；② 100 度；③ 200 度；④ 300 度；⑤ 500 度；⑥ 800 度；⑦ 1000 度；⑧ 1200 度；⑨ 1500 度；⑩ 配镜后世界恢复清晰。每一节都是 3 秒钟的视觉切片，用户被一档一档钩着滑到最后。车头是"如果你近视 1500 度，眼前的世界长这样"，车尾是字幕一句"——配镜不是奢侈，是一次重新看清世界的机会"。
          </p>
        </CaseBlock>

        <ToolCard
          tag="工具 4U.4"
          title="小火车结构填空模板"
          desc={'把你下一条视频拆成"车头 + N 节车身 + 车尾"，每节车身控制在 3-8 秒。如果车身少于 4 节，密度大概率不够；多于 12 节，节奏可能太碎。'}
        >
          <Table
            head={['车厢', '内容', '时长', '功能']}
            rows={[
              ['车头', '（写下你的钩子开头）', '3-5 秒', '挑起好奇'],
              ['车身 1', '（第一个切片）', '3-8 秒', '第一次新刺激'],
              ['车身 2', '（第二个切片）', '3-8 秒', '同方向递进'],
              ['车身 3', '（第三个切片）', '3-8 秒', '加入反差'],
              ['车身 4', '（第四个切片）', '3-8 秒', '揭示 / 高光'],
              ['车身 5（可选）', '（继续切片）', '3-8 秒', '补强 / 升维'],
              ['车尾', '（金句 + 引导动作）', '3-5 秒', '让人想做下一步'],
            ]}
            emptyCols={[1]}
          />
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-4u-5"
        no="4U.5"
        tag="结尾"
        title="五大结尾模板 × 心理动作"
        lead="迪士尼留给客人的，是最后一场烟花。"
        first
      >
        <p>
          很多视频开头打开率不错、完播率也尚可，但点赞、评论、转发三项数据全部塌方。问题几乎一定出在结尾。结尾不是文案的尾巴，它是用户"是否给你一个动作"的临门一脚。
        </p>
        <p>
          为什么结尾这么重要？因为人的大脑在评价一段体验时，并不会按时间均值打分，而会按"峰值 + 终值"打分——这是丹尼尔·卡尼曼（2002 年诺贝尔经济学奖得主、普林斯顿大学教授）提出的峰终定律。也就是说，用户对你这条视频的整体感受，几乎完全由"最高光的那一刻"和"最后一刻"决定。最高光的那一刻在车身高光段，最后一刻就是结尾。所以结尾必须设计。
        </p>

        <SubHead>五个结尾模板</SubHead>

        <NumberedFalseList
          items={[
            {
              title: '总结式',
              verdict: '回顾全文 + 重申主张。',
              body: '适合知识类、辟谣类、深度评论类。一个讲"网赌为什么不能碰"的经典结尾："社会险恶、暗流汹涌，网赌和毒品一样，第一口永远碰都不要碰。"——把全文最核心的一句话提炼成箴言，用户一边记一边转发。',
            },
            {
              title: '升华式',
              verdict: '把具体话题拔到更高维度。',
              body: '适合销售类、人生感悟类、情感类。销售大玩家讲薇娅五种带货套路，结尾一句："套路千万条，真诚第一条。"——主题从"销售技巧"升华到"销售伦理"，用户得到一句可以转发的金句，作者得到一份"真诚销售"的人设。',
            },
            {
              title: '开放式',
              verdict: '不给答案，留给观众想。',
              body: '适合连续剧式账号、引发讨论的话题。一个讲"价格锚点"的视频，最后一句"如果你以为价格锚点只能用在商业里，那你就大错特错了——下集告诉你它还能用在哪。"——评论区瞬间被"那能用在哪里"刷屏，下一条视频自带流量。',
            },
            {
              title: '价值式',
              verdict: '在最后一帧塞一张操作清单。',
              body: '适合教程类、清单类、攻略类。一条教煎蛋的视频，最后一秒画面定格在一张"完美煎蛋四步法"的图，用户截图保存。这种结尾会大幅提高收藏率——收藏会被算法识别为正向行为，进入加权推荐。',
            },
            {
              title: '关联式',
              verdict: '把视频拉回到"你"身上。',
              body: '适合情感类、价值观类、互动话题。讲"高情商怎么说话"的视频，最后一句反问："假如你的女朋友问你想不想吃冰淇淋，请作答。"——评论区瞬间被"想吃""不想吃""你怎么这么聪明"刷屏，评论数顶到天花板。',
            },
          ]}
        />

        <SubHead>结尾 × 心理动作 · 一个矩阵</SubHead>
        <p>
          每个结尾模板，对应不同的"用户最容易产生的心理动作"。你要的不只是用户看完，你要的是用户做出一个具体的动作——点赞、评论、收藏、转发。哪一种动作对你的账号目的最有价值，就选对应的结尾。
        </p>

        <ToolCard
          tag="工具 4U.5"
          title="结尾模板 × 心理动作矩阵"
          desc="先想清楚这条视频你最想要哪个动作——是点赞拉权重？是评论拉互动？是收藏拉留存？是转发拉传播？再回到这张表选对应的结尾模板。"
        >
          <Table
            head={['结尾模板', '点赞', '评论', '收藏', '转发']}
            rows={[
              ['总结式', '强', '中', '中', '强'],
              ['升华式', '强', '中', '弱', '强'],
              ['开放式', '中', '强', '弱', '中'],
              ['价值式', '中', '弱', '强', '中'],
              ['关联式', '中', '强', '弱', '中'],
            ]}
            scoreCols={[1, 2, 3, 4]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            读法：横向看一条视频的目标——比如这条要拉评论，就优先选开放式或关联式。纵向看一个账号长期目标——如果账号要靠转发破圈，就长期倾向总结式 + 升华式。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-4u-6"
        no="4U.6"
        tag="单向阀"
        title="单向阀 · 前置五问拉高重视度"
        lead="一个字不改，前置五问，播放多 100 倍。"
        first
      >
        <p>
          这一节会很短。但它是这整一篇里"性价比最高"的一个改写技巧。它在很多爆款视频里通常被称作"连环悬疑"——一连串环环相扣的问题构成一条单向通路，用户中途想退会发现前面白听了。绝大多数人没有意识到它的存在，意识到的人也少有真的执行下去——所以一旦你用了，对手大概率没用，差距立刻拉开。
        </p>

        <SubHead>什么是单向阀</SubHead>
        <p>
          单向阀是这样一种结构：在你正文开始之前，连续抛出 5 个用户大概率没法立刻回答的问题，并且每个问题都和你后面的主题相关。这 5 个问题就像 5 道水闸，每道闸门都让用户多停留几秒钟。等他真正进入主体内容时，他已经"投入"了——已经花了 15-25 秒——按照沉没成本，他会更愿意把剩下的看完。
        </p>

        <Insight label="反共识结论">
          同一个文案、同一份素材、同一个剪辑，单纯在开头堆 5 个反问句，往往能把播放量抬上一个量级。一个字不改、不动剪辑、不换镜头——纯粹靠重视度被前置拉高。
        </Insight>

        <SubHead>为什么这招有效</SubHead>
        <p>
          回到 4U.1 的第一性原理——文案的本质是拖时间。前置 5 问做的事情，就是在主体内容开始之前先制造一段密度极高的"反问墙"。每一个反问都是一个"你大概率答不上来"的钩子，每个钩子都让用户停留 2-4 秒。5 个钩子下来，至少给主体内容争取了 15 秒的额外停留。
        </p>
        <p>
          更重要的是，这 5 个反问会自动把用户的认知预期调高——"既然这视频敢一开始就问这么多问题，那它后面应该有真东西"。这是个心理标签，用户会带着这个标签看完后面。
        </p>

        <SubHead>5 问怎么写</SubHead>
        <p>
          5 个反问不是随便堆的。它们要遵循三条规则：
        </p>
        <Checklist
          items={[
            '每个反问都和正文主题相关——5 个问题应该围绕主题往里收紧，不是发散到天南海北。',
            '每个反问都是用户"想知道但还没思考过"的——已经知道答案的问题没钩子，完全无关的问题也没钩子。',
            '5 个反问之间要有节奏感——可以是从浅到深、从外到内、从大到小，让用户感觉"问题在递进"。',
          ]}
        />

        <CaseBlock title="案例 · 普通文案 vs 单向阀改写（示意写法，非原文）">
          <p>
            <Strong>原文（无单向阀）：</Strong>"今天我们来讲一下光刻机的原理，它本质上是一个冲洗照片的过程……"——平淡，用户两秒就划走。
          </p>
          <p>
            <Strong>改写（加了五问）：</Strong>"你知道为什么世界上只有一家公司能造光刻机吗？你知道光刻机为什么这么贵吗？你知道光刻机的原理其实很简单吗？你知道一颗芯片为什么离不开它吗？你知道我们国家为什么一定要造出自己的光刻机吗？——今天我们就一次性讲清楚。"——五个反问把"重视度"前置之后，完播率会被显著抬高。
          </p>
          <p className="text-[12.5px] leading-[1.85] text-[#8a7e6f]">
            注：光刻机选题的经典写法是"比喻 + 一问一展开"的连环悬疑结构（"光刻机是什么？→ 制造芯片的机器 → 原理是什么？→ 冲洗照片 …"）。本例是把同一选题改写成"前置五问"型，用于演示单向阀。
          </p>
        </CaseBlock>

        <ToolCard
          tag="工具 4U.6"
          title="单向阀五问模板"
          desc="把你下一条视频的主题写在最上面，然后强迫自己围绕这个主题写出 5 个反问。写不出 5 个，说明这个选题还不够立体——回去再挖。"
        >
          <Table
            head={['编号', '反问句', '与主题的承接关系']}
            rows={[
              ['主题', '（写下你视频的主题）', '/'],
              ['问 1', '（你知道 X 吗？）', '从大处切入'],
              ['问 2', '（你知道 X 为什么 Y 吗？）', '从原因递进'],
              ['问 3', '（你知道 X 其实和 Z 有关吗？）', '从关联递进'],
              ['问 4', '（你知道 X 会带来 W 后果吗？）', '从影响递进'],
              ['问 5', '（你知道我们应该怎么应对 X 吗？）', '收口到正文'],
            ]}
            emptyCols={[1]}
          />
          <p className="mt-3 text-[13px] leading-[1.85] text-[#8a7e6f]">
            五问写完，整段控制在 15-25 秒之内。再长用户会反而疲劳；再短就不构成一道道水闸。
          </p>
        </ToolCard>
      </Chapter>

      <Chapter
        id="ch-4u-7"
        no="4U.7"
        tag="质感 + 入口"
        title="画面感 + 力量感 + 标题封面"
        lead="文字若不能在大脑里形成画面，就不能在屏幕上形成停留。"
        first
      >
        <p>
          前面六节解决了"文案的结构"。这一节解决两件事——文案的质感，以及文案进入用户视线之前的"门"。前者决定看的人记不记得住，后者决定有没有人看到。
        </p>

        <SubHead>画面感 · 描述法</SubHead>
        <p>
          一个常见的误区：写文案时使劲堆形容词。但形容词在短视频里几乎没有作用——用户的大脑接收形容词需要解码，而短视频不给用户解码时间。能在大脑里立刻成像的，是"动作 + 细节"，不是"很 / 非常 / 极其"。
        </p>
        <p>
          "今天天气真好"——什么都没传递。"今天天空很蓝，一点云彩都没有，偶尔有几只小燕子飞过去"——一句话之内大脑自动放映了一段画面。形容词换成具体场景，文案立刻有了画面。
        </p>
        <p>
          "我家很大"——空话。"我家住着十一口人，还有五个保姆"——立体了。"我家大到能在客厅里踢一场足球赛"——夸张但有画面。两者都能用，前者偏纪实，后者偏比喻。
        </p>
        <p>
          "我狠狠地报复了女朋友"——情绪平的描述。"我转头从梳妆台抄起她的口红，开盖、拧出、大拇指用力一按，折断的口红直接掉在地上"——动作连续、细节具体、情绪到位。同样一件事，后者会让用户在脑海中放完整段画面。
        </p>

        <SubHead>画面感 · 类比法</SubHead>
        <p>
          把一个抽象的、不具象的事物，比成一个用户熟悉的、具象的事物。它的核心机制是"借用户大脑里已经存在的画面"——你不用重新建一个画面，只要在一个旧画面上挂一个新标签。
        </p>
        <p>
          "我家餐厅服务很好"——你听不出有多好。"我家餐厅的服务和海底捞一样"——你立刻知道有多好。海底捞是用户大脑里现成的画面，你借了。
        </p>
        <p>
          "光刻机制造的难度是纳米级的"——纳米是多大用户不知道。"如果反光镜的面积有整个德国那么大，那么最高的凸起不能超过一厘米"——一秒钟懂了。
        </p>

        <SubHead>力量感 · 动词替换</SubHead>
        <p>
          画面感解决"看得见"，力量感解决"感受得到"。最简单的方法是把无情绪的动词换成有情绪的动词。
        </p>

        <Checklist
          items={[
            '"我拍你" / "我抽你"——一个字之差，冲击感差三倍。',
            '"我推你" / "我怼你" / "我按你"——同样的动作，三种力量。',
            '"我踢你" / "我踹你"——一个偏中性，一个有情绪。',
            '"我打你" / "我捶你" / "我捏你"——三种不同的关系暗示。',
          ]}
        />

        <p>
          力量感动词不需要全文都用，但在关键节点用一两个，整段文案的情绪温度立刻升上去。
        </p>

        <SubHead>力量感 · 强弱对比</SubHead>
        <p>
          孤立的描述很难让用户感知大小、快慢、贵贱。一旦加进对比，所有判断都被瞬间锁定。
        </p>
        <p>
          "我赚了 10 万"——10 万是多是少？"我一天赚了 10 万"——很多。"我赚了 10 万，而我同事赔了 200 万"——一段戏剧。"我出生在一个山沟里，打拼 10 年才成了上市公司 CEO"——背景 + 现在的反差，把"努力"两个字立起来。
        </p>
        <p>
          所有"自我介绍"类、"成就展示"类、"打动情绪"类的脚本，都要主动加一个反差锚——前后对比、自己 vs 他人、过去 vs 现在、应该 vs 实际。
        </p>

        <SubHead>标题与封面 · 进入视线的那扇门</SubHead>
        <p>
          文案做得再好，如果标题封面没人点开，等于没做。在抖音的逻辑里，标题 + 封面 + 视频前 3 秒，构成"打开率"这个第一关卡——打开率不过关，视频根本进不去更大的推荐池。
        </p>
        <p>
          标题有 5 个被反复验证有效的模板：
        </p>

        <NumberedList
          items={[
            <>
              <Strong>数字法。</Strong>"90% 的人过不了这一关""一年省下 10 万块""三分钟教你识别渣男"。数字降低用户的理解成本——大脑对数字的反应比对文字快得多。要点：数字越具体越好（327 优于 300），数字越能震惊越好。
            </>,
            <>
              <Strong>好奇法。</Strong>"千万不要 X""为什么 X""你不知道的 X"。基本机制是制造信息差。要点：好奇点必须是用户"想知道但还没主动想过"的。
            </>,
            <>
              <Strong>情绪法。</Strong>用强情绪词——震惊、愤怒、痛心、孤独、暴跌、危险——直接调动用户的情感。要点：情绪要和内容真实匹配，否则点开后跳出反而拉低权重。
            </>,
            <>
              <Strong>相关法。</Strong>用"你"字直接把用户拉进来。"新的健身套餐减脂多 20%"是叙述；"让你减脂多 20% 的新健身套餐"是钩子。同样的卖点，加一个"你"字，相关度翻倍。
            </>,
            <>
              <Strong>对比法。</Strong>"我结婚了，有人送了 10 万块大红包""年收入 30 万，却只能租房""减肥前 vs 减肥后"。把正常和异常并置在标题里，反差就是钩子。
            </>,
          ]}
        />

        <p>
          封面则有三条铁律：① 主体特写要大、要清晰，最好占封面的 1/2 以上；② 文字不要超过 12 个字，否则用户来不及读；③ 颜色和同行账号要有差异——别人都用红，你就用蓝；别人都白底，你就深底。
        </p>

        <ToolCard
          tag="工具 4U.7"
          title="标题 × 封面检查清单"
          desc="发布前的最后一道闸。每一项过了再发，过不了就改——这一关绝对不能让步。"
        >
          <Table
            head={['项', '检查标准', '通过']}
            rows={[
              ['标题字数', '14 字以内（手机端单行不截断）', '/'],
              ['标题钩子', '5 模板（数字 / 好奇 / 情绪 / 相关 / 对比）至少占 1', '/'],
              ['标题关键词', '含 1-2 个能被算法识别的热度词', '/'],
              ['封面主体', '主体特写占封面 1/2 以上', '/'],
              ['封面文字', '12 字以内 / 字号足够大', '/'],
              ['封面色调', '与同行账号有显著差异', '/'],
              ['封面与开头', '封面承诺的内容，开头 3 秒必须兑现', '/'],
              ['整体一致性', '标题 + 封面 + 前 3 秒讲同一件事', '/'],
            ]}
            emptyCols={[2]}
          />
        </ToolCard>

        <CaseBlock title="案例 · 一个微商的标题修改如何带来 6 万销售">
          <p>
            一个做祛痘产品的微商，原标题是"我的烂脸通过这款产品变好了"——平铺直叙、无钩子、无相关、无对比。改写五次后定为"上百个烂脸学员里，只有这一种用法是有效的"——加了数字、加了相关、留了悬念。同一支视频，同一份产品，同一个人讲，仅仅换标题：当周售出 6 万元产品，新招代理 30 人。标题这件事，远比创作者直觉里以为的更值钱。
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
      第　四　篇　·　上
    </div>
    <h1 className="font-serif-zh text-[40px] font-semibold leading-[1.2] tracking-[0.14em] text-[#fffdf7] sm:text-[58px]">
      文案与通用结构
    </h1>
    <div className="mt-6 font-mono text-[12px] tracking-[0.4em] text-[#b8693a] sm:text-[13px]">
      PART　Ⅳ　·　COPYWRITING
    </div>
    <Ornament className="mx-auto mt-9" />
    <p className="mx-auto mt-12 max-w-[460px] text-[14.5px] leading-[2.05] tracking-[0.03em] text-[#cfc6b8] sm:text-[15px]">
      怎么把人留下来。
      <br />
      短视频的核心不是给用户提供价值，是拖住他的时间。
      <br />
      读完后，你应当能拿任何一条爆款拆出它的结构、技巧与密度——
      <br />
      也能反过来按结构、技巧、密度，把自己的脚本一寸寸抬高。
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
  first?: boolean
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

const Checklist = ({ items }: { items: ReactNode[] }) => (
  <ul className="my-6 list-none p-0">
    {items.map((item, i) => (
      <li
        key={i}
        className="relative py-2 pl-8 text-[14px] leading-[1.9] text-[#d6cfc4] sm:text-[14.5px]"
      >
        <span className="absolute left-0 top-[14px] block h-3.5 w-3.5 border-[1.5px] border-[#b8693a]" />
        {item}
      </li>
    ))}
  </ul>
)

const PartEnd = () => (
  <div className="mt-24 border-t border-white/10 pt-8 text-center font-mono text-[12px] uppercase tracking-[0.3em] text-[#8a7e6f] sm:text-[12.5px]">
    <div>—— 第四篇 · 上 完 ——</div>
    <div className="font-serif-zh mt-3 text-[13px] tracking-[0.18em] text-[#b8693a]">
      下一篇 · 第四篇 下：四型脚本
    </div>
  </div>
)

const ChapterEndNav = () => (
  <nav className="mt-12 grid gap-3 sm:grid-cols-2">
    <Link
      href="/playbook/topics"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a7e6f]">
          上一篇
        </span>
        <span className="font-serif-zh mt-1 block text-[15px] font-semibold tracking-[0.06em] text-[#fffdf7]">
          ← 第三篇 · 选题与素材库
        </span>
      </span>
    </Link>
    <Link
      href="/playbook/scripts"
      className="group flex items-center justify-between border border-white/10 bg-white/[0.04] px-5 py-4 transition-colors hover:border-[#b8693a]/60 hover:bg-white/[0.07]"
    >
      <span>
        <span className="block font-mono text-[10px] uppercase tracking-[0.28em] text-[#8a7e6f]">
          下一篇
        </span>
        <span className="font-serif-zh mt-1 block text-[15px] font-semibold tracking-[0.06em] text-[#fffdf7]">
          第四篇 · 下 · 四型脚本 →
        </span>
      </span>
    </Link>
  </nav>
)
