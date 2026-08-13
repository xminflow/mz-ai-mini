// 12 类软件各自的「界面缩影」线稿。
//
// 为什么手写 SVG 而不是配图：这 12 类没有可用的实拍素材，占位图会比不放图更弱；
// 线稿能直接画出「这类软件长什么样」，而且用的是站点已有的线 + 点语言，不引入图表框架。
//
// 画法约定（12 张一致，改动请一起改）：
// - viewBox 统一 260×160，容器/边框走 stroke，内容占位块走 fill，两者形成层次
// - stroke="currentColor" 由卡片决定灰度；accent 是该类在 THEMES 里的品牌色，每张只点 1-2 处
// - 不用 rotate/滤镜：缩放到任意尺寸都要保持线宽均匀

type ArtProps = {
  accent: string
}

/** 四角星：AIGC「生成」与 AI 化改造「已接入 AI 的环节」共用的标记 */
const star = (cx: number, cy: number, r: number) => {
  const s = r * 0.36
  return `M${cx} ${cy - r} L${cx + s} ${cy - s} L${cx + r} ${cy} L${cx + s} ${cy + s} L${cx} ${cy + r} L${cx - s} ${cy + s} L${cx - r} ${cy} L${cx - s} ${cy - s} Z`
}

const Art = ({ children }: { children: React.ReactNode }) => (
  <svg
    aria-hidden
    viewBox="0 0 260 160"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    preserveAspectRatio="xMidYMid meet"
    className="h-full w-full"
  >
    {children}
  </svg>
)

/** 内容占位块：填充而非描边，和外框拉开层次 */
const Bar = ({
  x,
  y,
  w,
  h = 6,
  o = 0.18,
  fill = 'currentColor',
}: {
  x: number
  y: number
  w: number
  h?: number
  o?: number
  fill?: string
}) => <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={fill} fillOpacity={o} stroke="none" />

// 01 企业官网 & 品牌落地页：浏览器窗口 + 首屏标题、行动按钮、配图位
const SiteArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="16" y="20" width="228" height="120" rx="7" />
    <path d="M16 42 H244" />
    <circle cx="29" cy="31" r="2.6" fill={accent} stroke="none" />
    <circle cx="39" cy="31" r="2.6" fill="currentColor" fillOpacity="0.3" stroke="none" />
    <circle cx="49" cy="31" r="2.6" fill="currentColor" fillOpacity="0.3" stroke="none" />
    <rect x="64" y="26.5" width="96" height="9" rx="4.5" strokeOpacity="0.5" />
    <Bar x={32} y={58} w={104} h={10} o={0.24} />
    <Bar x={32} y={76} w={72} h={10} o={0.24} />
    <rect x="32" y="100" width="58" height="18" rx="9" fill={accent} fillOpacity="0.14" stroke={accent} />
    <rect x="152" y="58" width="76" height="60" rx="5" />
    <path d="M152 104 l20 -17 15 12 13 -10 28 23" strokeOpacity="0.6" />
    <circle cx="212" cy="74" r="5" strokeOpacity="0.6" />
  </Art>
)

// 02 企业级管理系统：左侧导航 + 数据表格 + 审批勾选
const AdminArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="16" y="20" width="228" height="120" rx="7" />
    <path d="M74 20 V140" />
    <rect x="26" y="34" width="36" height="9" rx="4.5" fill={accent} fillOpacity="0.16" stroke={accent} />
    <Bar x={26} y={52} w={36} h={9} o={0.16} />
    <Bar x={26} y={68} w={36} h={9} o={0.16} />
    <Bar x={26} y={84} w={36} h={9} o={0.16} />
    <path d="M74 46 H244" />
    <Bar x={86} y={30} w={52} h={8} o={0.24} />
    <path d="M86 66 H232" strokeOpacity="0.45" />
    <path d="M86 88 H232" strokeOpacity="0.45" />
    <path d="M86 110 H232" strokeOpacity="0.45" />
    <rect x="86" y="54" width="9" height="9" rx="2" strokeOpacity="0.6" />
    <rect x="86" y="76" width="9" height="9" rx="2" stroke={accent} />
    <path d="M88.4 80.6 l2.2 2.2 4.2 -4.8" stroke={accent} />
    <rect x="86" y="98" width="9" height="9" rx="2" strokeOpacity="0.6" />
    <Bar x={104} y={56} w={62} />
    <Bar x={104} y={78} w={78} />
    <Bar x={104} y={100} w={48} />
    <Bar x={198} y={56} w={28} o={0.12} />
    <Bar x={198} y={78} w={28} fill={accent} o={0.4} />
    <Bar x={198} y={100} w={28} o={0.12} />
    <Bar x={86} y={122} w={64} h={8} o={0.12} />
  </Art>
)

// 03 小程序 & 移动应用：主副两台设备 + 小程序码
const MobileArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="28" y="38" width="60" height="98" rx="10" strokeOpacity="0.4" />
    <rect x="74" y="22" width="84" height="118" rx="12" />
    <rect x="103" y="30" width="26" height="4" rx="2" fill="currentColor" fillOpacity="0.25" stroke="none" />
    <Bar x={85} y={46} w={62} h={12} o={0.16} />
    <Bar x={85} y={64} w={62} h={12} o={0.16} />
    <Bar x={85} y={82} w={44} h={12} o={0.16} />
    <path d="M74 110 H158" strokeOpacity="0.5" />
    <circle cx="96" cy="125" r="4" fill="currentColor" fillOpacity="0.25" stroke="none" />
    <circle cx="116" cy="125" r="4" fill={accent} stroke="none" />
    <circle cx="136" cy="125" r="4" fill="currentColor" fillOpacity="0.25" stroke="none" />
    <rect x="176" y="46" width="60" height="60" rx="7" stroke={accent} />
    <rect x="186" y="56" width="15" height="15" rx="3" stroke={accent} strokeOpacity="0.7" />
    <rect x="211" y="56" width="15" height="15" rx="3" strokeOpacity="0.5" />
    <rect x="186" y="81" width="15" height="15" rx="3" strokeOpacity="0.5" />
    <rect x="213" y="83" width="11" height="11" rx="2" fill={accent} fillOpacity="0.6" stroke="none" />
  </Art>
)

// 04 AI 智能体：一问一答 + 底下真实调用的工具链
const AgentArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="22" y="26" width="104" height="40" rx="12" />
    <path d="M38 66 v11 l14 -11" />
    <Bar x={36} y={38} w={62} h={5} />
    <Bar x={36} y={50} w={44} h={5} />
    <rect x="134" y="50" width="102" height="40" rx="12" stroke={accent} />
    <path d="M220 90 v11 l-14 -11" stroke={accent} />
    <Bar x={148} y={62} w={68} h={5} fill={accent} o={0.4} />
    <Bar x={148} y={74} w={46} h={5} fill={accent} o={0.28} />
    <circle cx="34" cy="126" r="9" strokeOpacity="0.6" />
    <circle cx="112" cy="126" r="9" fill={accent} fillOpacity="0.14" stroke={accent} />
    <circle cx="190" cy="126" r="9" strokeOpacity="0.6" />
    <path d="M43 126 H103" strokeDasharray="3 4" strokeOpacity="0.6" />
    <path d="M121 126 H181" strokeDasharray="3 4" strokeOpacity="0.6" />
    <path d="M199 126 H226" strokeDasharray="3 4" strokeOpacity="0.6" />
    <path d="M222 122 l5 4 -5 4" strokeOpacity="0.6" />
  </Art>
)

// 05 AI 知识库 & 智能问答：文档堆 → 检索命中 → 成句回答
const KnowledgeArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="38" y="30" width="68" height="88" rx="5" strokeOpacity="0.28" />
    <rect x="32" y="36" width="68" height="88" rx="5" strokeOpacity="0.5" />
    <rect x="26" y="42" width="68" height="88" rx="5" />
    <Bar x={38} y={58} w={46} h={5} />
    <Bar x={38} y={72} w={38} h={5} />
    <Bar x={38} y={86} w={44} h={5} />
    <Bar x={38} y={100} w={30} h={5} />
    <circle cx="166" cy="56" r="24" stroke={accent} />
    <path d="M183 73 L204 94" stroke={accent} />
    <circle cx="158" cy="50" r="3" fill={accent} stroke="none" />
    <circle cx="172" cy="60" r="3" fill={accent} stroke="none" />
    <circle cx="161" cy="65" r="3" fill={accent} fillOpacity="0.45" stroke="none" />
    <rect x="128" y="100" width="106" height="34" rx="10" />
    <Bar x={140} y={110} w={68} h={5} />
    <Bar x={140} y={121} w={46} h={5} o={0.12} />
  </Art>
)

// 06 数据分析 & BI 看板：两块指标 + 柱状 + 趋势线
const BiArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="18" y="20" width="104" height="42" rx="6" />
    <Bar x={30} y={30} w={34} h={6} o={0.12} />
    <Bar x={30} y={43} w={54} h={10} o={0.28} />
    <rect x="138" y="20" width="104" height="42" rx="6" />
    <Bar x={150} y={30} w={34} h={6} o={0.12} />
    <Bar x={150} y={43} w={46} h={10} fill={accent} o={0.45} />
    <path d="M20 138 H122" strokeOpacity="0.5" />
    <rect x="28" y="106" width="16" height="32" rx="2" fill="currentColor" fillOpacity="0.14" stroke="none" />
    <rect x="52" y="92" width="16" height="46" rx="2" fill="currentColor" fillOpacity="0.14" stroke="none" />
    <rect x="76" y="112" width="16" height="26" rx="2" fill="currentColor" fillOpacity="0.14" stroke="none" />
    <rect x="100" y="84" width="16" height="54" rx="2" fill={accent} fillOpacity="0.35" stroke="none" />
    <path d="M138 138 H242" strokeOpacity="0.5" />
    <polyline points="144,126 168,106 190,116 212,86 238,96" stroke={accent} />
    <circle cx="212" cy="86" r="3.6" fill={accent} stroke="none" />
  </Art>
)

// 07 SaaS 产品 / 平台：多租户接入同一平台 + 按期计费
const SaasArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="20" y="24" width="46" height="30" rx="5" strokeOpacity="0.65" />
    <rect x="20" y="102" width="46" height="30" rx="5" strokeOpacity="0.65" />
    <rect x="194" y="24" width="46" height="30" rx="5" strokeOpacity="0.65" />
    <rect x="194" y="102" width="46" height="30" rx="5" strokeOpacity="0.65" />
    <path d="M66 40 C 86 40, 88 62, 98 68" strokeDasharray="3 4" strokeOpacity="0.55" />
    <path d="M66 116 C 86 116, 88 94, 98 88" strokeDasharray="3 4" strokeOpacity="0.55" />
    <path d="M194 40 C 174 40, 172 62, 162 68" strokeDasharray="3 4" strokeOpacity="0.55" />
    <path d="M194 116 C 174 116, 172 94, 162 88" strokeDasharray="3 4" strokeOpacity="0.55" />
    <rect x="98" y="56" width="64" height="44" rx="8" stroke={accent} />
    <Bar x={110} y={68} w={40} h={5} fill={accent} o={0.4} />
    <Bar x={110} y={80} w={26} h={5} fill={accent} o={0.24} />
    <rect x="104" y="116" width="16" height="20" rx="2" stroke={accent} />
    <rect x="122" y="116" width="16" height="20" rx="2" stroke={accent} strokeOpacity="0.6" />
    <rect x="140" y="116" width="16" height="20" rx="2" stroke={accent} strokeOpacity="0.32" />
  </Art>
)

// 08 电商 & 交易系统：选品 → 购物车 → 履约完成
const CommerceArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="20" y="26" width="44" height="38" rx="5" strokeOpacity="0.6" />
    <rect x="70" y="26" width="44" height="38" rx="5" strokeOpacity="0.6" />
    <rect x="20" y="72" width="44" height="38" rx="5" strokeOpacity="0.6" />
    <rect x="70" y="72" width="44" height="38" rx="5" stroke={accent} />
    <path d="M78 98 l10 -11 8 8 6 -5" stroke={accent} />
    <path d="M124 64 H150" strokeOpacity="0.6" />
    <path d="M146 60 l5 4 -5 4" strokeOpacity="0.6" />
    <path d="M162 50 h8 l11 38 h34 l8 -26 h-48" />
    <circle cx="186" cy="98" r="5" />
    <circle cx="212" cy="98" r="5" />
    <path d="M186 112 C 176 124, 170 126, 166 126" strokeDasharray="3 4" strokeOpacity="0.55" />
    <circle cx="146" cy="126" r="14" stroke={accent} />
    <path d="M139.5 126 l4.5 4.6 8.5 -10" stroke={accent} />
  </Art>
)

// 09 桌面客户端：一块窗口 + 自动更新
const DesktopArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="26" y="22" width="208" height="104" rx="7" />
    <path d="M118 126 l-5 14 h34 l-5 -14" />
    <path d="M100 140 H160" />
    <path d="M86 22 V126" strokeOpacity="0.6" />
    <Bar x={40} y={40} w={34} h={7} o={0.16} />
    <Bar x={40} y={54} w={34} h={7} o={0.16} />
    <Bar x={40} y={68} w={34} h={7} o={0.16} />
    <Bar x={100} y={40} w={92} h={9} o={0.24} />
    <Bar x={100} y={58} w={64} h={9} o={0.16} />
    <rect x="100" y="78" width="112" height="34" rx="4" strokeOpacity="0.5" />
    <Bar x={110} y={88} w={54} h={5} />
    <Bar x={110} y={99} w={38} h={5} o={0.12} />
    <circle cx="214" cy="42" r="10" fill={accent} fillOpacity="0.14" stroke={accent} />
    <path d="M214 37 v9 m-4 -4 l4 4 4 -4" stroke={accent} />
  </Art>
)

// 10 系统集成 & 流程自动化：四个系统串成闭环，中间是定时调度
const IntegrationArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="18" y="60" width="52" height="38" rx="6" />
    <rect x="104" y="20" width="52" height="38" rx="6" />
    <rect x="190" y="60" width="52" height="38" rx="6" />
    <rect x="104" y="100" width="52" height="38" rx="6" />
    <Bar x={28} y={74} w={32} h={5} />
    <Bar x={114} y={34} w={32} h={5} />
    <Bar x={200} y={74} w={32} h={5} />
    <Bar x={114} y={114} w={32} h={5} />
    <path d="M70 72 C 82 48, 92 40, 102 38" stroke={accent} strokeDasharray="4 4" />
    <path d="M158 38 C 172 40, 182 50, 190 70" stroke={accent} strokeDasharray="4 4" />
    <path d="M190 88 C 182 110, 172 118, 158 120" stroke={accent} strokeDasharray="4 4" />
    <path d="M102 120 C 88 118, 78 108, 70 88" stroke={accent} strokeDasharray="4 4" />
    <path d="M97 34 l6 4 -5 4" stroke={accent} />
    <path d="M75 84 l-5 5 -4 -6" stroke={accent} />
    <circle cx="130" cy="79" r="17" strokeOpacity="0.6" />
    <path d="M130 70 v9 l6 4" strokeOpacity="0.8" />
  </Art>
)

// 11 AIGC 内容工具：一句提示词批量出稿
const AigcArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="18" y="32" width="98" height="32" rx="9" />
    <Bar x={30} y={45} w={54} h={6} o={0.22} />
    <path d="M92 42 v12" stroke={accent} />
    <path d={star(140, 48, 15)} stroke={accent} fill={accent} fillOpacity="0.14" />
    <rect x="170" y="22" width="34" height="34" rx="4" strokeOpacity="0.6" />
    <rect x="208" y="22" width="34" height="34" rx="4" strokeOpacity="0.6" />
    <rect x="170" y="60" width="34" height="34" rx="4" stroke={accent} />
    <rect x="208" y="60" width="34" height="34" rx="4" strokeOpacity="0.6" />
    <path d="M178 44 l8 -8 6 6 5 -4" strokeOpacity="0.6" />
    <path d="M216 82 l8 -8 6 6 5 -4" strokeOpacity="0.6" />
    <Bar x={18} y={98} w={126} h={6} o={0.2} />
    <Bar x={18} y={112} w={98} h={6} o={0.14} />
    <Bar x={18} y={126} w={138} h={6} o={0.1} />
  </Art>
)

// 12 企业业务 AI 化改造：在已有流程上分批接入，不另起一套
const RetrofitArt = ({ accent }: ArtProps) => (
  <Art>
    <rect x="16" y="48" width="46" height="40" rx="6" strokeOpacity="0.6" />
    <rect x="74" y="48" width="46" height="40" rx="6" stroke={accent} />
    <rect x="132" y="48" width="46" height="40" rx="6" strokeOpacity="0.6" />
    <rect x="190" y="48" width="46" height="40" rx="6" stroke={accent} />
    <Bar x={26} y={64} w={26} h={5} />
    <Bar x={84} y={64} w={26} h={5} fill={accent} o={0.4} />
    <Bar x={142} y={64} w={26} h={5} />
    <Bar x={200} y={64} w={26} h={5} fill={accent} o={0.4} />
    <path d="M62 68 H74" strokeOpacity="0.6" />
    <path d="M70 64 l5 4 -5 4" strokeOpacity="0.6" />
    <path d="M120 68 H132" strokeOpacity="0.6" />
    <path d="M128 64 l5 4 -5 4" strokeOpacity="0.6" />
    <path d="M178 68 H190" strokeOpacity="0.6" />
    <path d="M186 64 l5 4 -5 4" strokeOpacity="0.6" />
    <path d={star(97, 30, 10)} stroke={accent} fill={accent} fillOpacity="0.14" />
    <path d={star(213, 30, 10)} stroke={accent} fill={accent} fillOpacity="0.14" />
    <path d="M16 120 H236" strokeDasharray="5 5" strokeOpacity="0.4" />
    <circle cx="39" cy="120" r="3.6" fill="currentColor" fillOpacity="0.3" stroke="none" />
    <circle cx="97" cy="120" r="3.6" fill={accent} stroke="none" />
    <circle cx="155" cy="120" r="3.6" fill="currentColor" fillOpacity="0.3" stroke="none" />
    <circle cx="213" cy="120" r="3.6" fill={accent} stroke="none" />
  </Art>
)

// 按 SERVICES 的 code 索引。少一张就该在构建期暴露，而不是渲染成空白卡片。
const ARTWORK: Record<string, (props: ArtProps) => React.ReactElement> = {
  '01': SiteArt,
  '02': AdminArt,
  '03': MobileArt,
  '04': AgentArt,
  '05': KnowledgeArt,
  '06': BiArt,
  '07': SaasArt,
  '08': CommerceArt,
  '09': DesktopArt,
  '10': IntegrationArt,
  '11': AigcArt,
  '12': RetrofitArt,
}

export const ServiceArtwork = ({ code, accent }: { code: string; accent: string }) => {
  const Component = ARTWORK[code]
  if (!Component) {
    throw new Error(`ServiceArtwork: 缺少 code ${code} 对应的线稿`)
  }
  return <Component accent={accent} />
}
