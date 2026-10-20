// 运行：NODE_PATH="C:/Users/xmin/node_modules" node deck.js ../软件定制服务宣讲.pptx
// 依赖 pptxgenjs。
//
// 基于《软件定制服务白皮书》生成宣讲 PPT。
//
// 统一规则（全场只有三种版式，不再出现深色页）：
//   T1 封面   —— 三色记号 + 大标题 + 副标题 + 能力条
//   T2 分隔页 —— PART 标签 + 大标题 + 本部分包含的章节
//   T3 内容页 —— eyebrow(拉丁大写) + 标题 + 可选导语 + 内容 + 可选收口句 + 页码
//
// 颜色纪律：
//   文字只用 INK / SOFT / DIM / BLUE / RED；
//   YELLOW 只做色块填充，绝不写字——它在纸底上的对比度只有 1.9:1。
const pptxgen = require('pptxgenjs')

const INK = '0E0E0E'
const PAPER = 'F7F7F5'
const SOFT = '44443F'
const DIM = '64645B'
const RULE = 'DCDCD8'
const RULE_SOFT = 'E8E8E4'
const BLUE = '0F5FD8'
const RED = 'C8202C'
const YELLOW = 'E8B21C'

const FONT = 'Microsoft YaHei'
const M = 0.55
const W = 10 - M * 2

const pres = new pptxgen()
pres.layout = 'LAYOUT_16x9'
pres.title = '软件定制服务白皮书'

let pageNo = 0

function newSlide() {
  const s = pres.addSlide()
  s.background = { color: PAPER }
  pageNo += 1
  return s
}

/** 三色小方块，全场重复出现的记号 */
function marks(s, x, y, size = 0.11, gap = 0.07) {
  ;[BLUE, RED, YELLOW].forEach((c, i) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: x + i * (size + gap), y, w: size, h: size, fill: { color: c }, line: { type: 'none' },
    })
  })
}

function hairline(s, y, color = RULE, x = M, w = W) {
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h: 0.008, fill: { color }, line: { type: 'none' } })
}

function pageNumber(s) {
  s.addText(String(pageNo).padStart(2, '0'), {
    x: 10 - M - 0.6, y: 5.18, w: 0.6, h: 0.24, margin: 0,
    fontFace: FONT, fontSize: 9, color: DIM, align: 'right',
  })
}

/** T3 内容页骨架 */
function page(eyebrow, titleText, lead) {
  const s = newSlide()
  s.addText(eyebrow, {
    x: M, y: 0.34, w: W, h: 0.24, margin: 0,
    fontFace: FONT, fontSize: 10, color: BLUE, bold: true, charSpacing: 2,
  })
  s.addText(titleText, {
    x: M, y: 0.6, w: W, h: 0.55, margin: 0,
    fontFace: FONT, fontSize: 27, bold: true, color: INK,
  })
  if (lead) {
    s.addText(lead, {
      x: M, y: 1.28, w: W, h: 0.3, margin: 0, fontFace: FONT, fontSize: 13, color: SOFT,
    })
  }
  pageNumber(s)
  return s
}

/** T3 收口句：底部一条细线加一句结论 */
function closing(s, y, text, color = INK, bold = true) {
  hairline(s, y)
  s.addText(text, {
    x: M, y: y + 0.18, w: W, h: 0.42, margin: 0,
    fontFace: FONT, fontSize: 12.5, bold, color, lineSpacing: 19,
  })
}

/** T2 分隔页 */
function divider(part, titleText, chapters) {
  const s = newSlide()
  marks(s, M, 1.5)
  s.addText(part, {
    x: M, y: 1.95, w: W, h: 0.28, margin: 0,
    fontFace: FONT, fontSize: 11, color: BLUE, bold: true, charSpacing: 3,
  })
  s.addText(titleText, {
    x: M, y: 2.3, w: W, h: 1.2, margin: 0,
    fontFace: FONT, fontSize: 32, bold: true, color: INK, lineSpacing: 46,
  })
  hairline(s, 3.72)
  s.addText(chapters.join('　　·　　'), {
    x: M, y: 3.92, w: W, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12.5, color: SOFT,
  })
  pageNumber(s)
  return s
}

// ============================================================ 01 封面
{
  const s = newSlide()
  marks(s, M, 0.78, 0.14, 0.09)
  s.addText('软件定制服务', {
    x: M, y: 1.85, w: W, h: 0.95, margin: 0,
    fontFace: FONT, fontSize: 46, bold: true, color: INK,
  })
  s.addText('把大型企业的软件交付标准，带到中小企业的定制项目上', {
    x: M, y: 2.88, w: W, h: 0.45, margin: 0,
    fontFace: FONT, fontSize: 17, color: SOFT,
  })
  hairline(s, 3.72)
  s.addText('1V1 高端服务　·　全天候响应　·　全透明流程　·　100% 主动推进　·　高质量维保', {
    x: M, y: 3.92, w: W, h: 0.32, margin: 0,
    fontFace: FONT, fontSize: 11.5, color: DIM,
  })
}

// ============================================================ 02 核心主张
{
  const s = page('PROPOSITION', '核心主张')
  s.addText([
    { text: '企业级的软件交付标准', options: { color: INK, breakLine: true } },
    { text: '不是中小企业不需要，', options: { color: INK } },
    { text: '是过去买不起', options: { color: BLUE } },
  ], {
    x: M, y: 1.72, w: W, h: 1.5, margin: 0,
    fontFace: FONT, fontSize: 33, bold: true, lineSpacing: 50,
  })
  closing(s, 3.62, '本次要回答的，就是这句话的后半段——为什么过去买不起，以及现在为什么买得起。', SOFT, false)
}

// ============================================================ 03 三个问题
{
  const s = page('AGENDA', '今天回答三个问题')
  const items = [
    ['01', '钱亏在哪', '定制软件的真实成本有三层，报价单只覆盖最上面一层。\n十五类常见问题，各自把钱亏在哪一层。'],
    ['02', '我们凭什么', '大型企业的项目里为什么不出这些问题——因为有一套交付标准。\n我们把它带出来，靠三根支柱撑住。'],
    ['03', '怎么验证', '每一条承诺都对应一个您在签约前就能核对的动作，\n而不是一句话。'],
  ]
  let y = 1.6
  items.forEach(([n, t, d]) => {
    hairline(s, y - 0.16)
    s.addText(n, { x: M, y: y - 0.02, w: 0.7, h: 0.36, margin: 0, fontFace: FONT, fontSize: 15, bold: true, color: BLUE })
    s.addText(t, { x: M + 0.75, y: y - 0.04, w: 1.9, h: 0.38, margin: 0, fontFace: FONT, fontSize: 16, bold: true, color: INK })
    s.addText(d, { x: M + 2.75, y: y - 0.04, w: W - 2.75, h: 0.7, margin: 0, fontFace: FONT, fontSize: 11.5, color: SOFT, lineSpacing: 17 })
    y += 1.08
  })
  closing(s, y - 0.16, '每一页都可以打断我们——这份材料的目的不是讲完，是让您问得出问题。', DIM, false)
}

// ============================================================ 04 分隔：第一部分
divider('PART 01', '中小企业的定制软件，\n钱通常亏在哪', ['三层成本', '十五类失效模式', '三个结构性原因'])

// ============================================================ 05 三层成本
{
  const s = page('COST STRUCTURE', '一套系统的钱，分三层花出去')
  const cols = [
    [BLUE, '建设成本', '需求、设计、开发、\n测试、部署、培训', '看得见，就是报价单', INK],
    [RED, '持有成本', '运维、故障处置、\n性能治理、功能演进', '基本看不见\n最多一笔维保费', RED],
    [YELLOW, '退出成本', '知识重建、代码交接、\n数据迁移、新旧并行', '几乎从不进入比较', INK],
  ]
  const cw = (W - 0.7) / 3
  cols.forEach(([bar, t, d, v, vc], i) => {
    const x = M + i * (cw + 0.35)
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.55, w: cw, h: 0.05, fill: { color: bar }, line: { type: 'none' } })
    s.addText(t, { x, y: 1.76, w: cw, h: 0.36, margin: 0, fontFace: FONT, fontSize: 18, bold: true, color: INK })
    s.addText(d, { x, y: 2.22, w: cw, h: 0.7, margin: 0, fontFace: FONT, fontSize: 11.5, color: SOFT, lineSpacing: 17 })
    s.addText(v, { x, y: 3.02, w: cw, h: 0.6, margin: 0, fontFace: FONT, fontSize: 11.5, color: vc, bold: true, lineSpacing: 17 })
  })
  closing(s, 3.98, '报价单只覆盖第一层。而砍掉备份、测试、文档可以立刻降低报价——代价由您在两年后承担。')
}

// ============================================================ 06 十五类失效模式
{
  const s = page('FAILURE MODES', '十五类失效模式，按您被伤害的顺序')
  const groups = [
    ['A', '选型与签约前', ['需求说不清', '报价黑箱', 'AI 概念包装', '转包', '跑路风险']],
    ['B', '建设过程中', ['黑盒开发', '工期失控']],
    ['C', '交付与验收', ['验收没依据', '套模板', '底层没标准', 'AI 盲盒交付']],
    ['D', '上线之后', ['交付即失联', '上线后不敢动', '人走了没人懂']],
    ['E', '资产与退出', ['源码拿不回来']],
  ]
  const cw = (W - 0.6) / 5
  groups.forEach(([g, name, items], i) => {
    const x = M + i * (cw + 0.15)
    s.addText(g, { x, y: 1.5, w: 0.35, h: 0.3, margin: 0, fontFace: FONT, fontSize: 15, bold: true, color: BLUE })
    s.addText(name, { x: x + 0.32, y: 1.53, w: cw - 0.32, h: 0.28, margin: 0, fontFace: FONT, fontSize: 11.5, bold: true, color: INK })
    hairline(s, 1.9, RULE, x, cw)
    items.forEach((it, j) => {
      s.addShape(pres.shapes.OVAL, { x, y: 2.11 + j * 0.42, w: 0.075, h: 0.075, fill: { color: DIM }, line: { type: 'none' } })
      s.addText(it, { x: x + 0.17, y: 2.03 + j * 0.42, w: cw - 0.17, h: 0.3, margin: 0, fontFace: FONT, fontSize: 11.5, color: SOFT })
    })
  })
  closing(s, 4.34, '其中六类影响最大：需求说不清 · 报价黑箱 · 工期失控 · AI 盲盒交付 · 交付即失联 · 源码拿不回来', SOFT, false)
}

// ============================================================ 07 大企业为什么不出这些问题
{
  const s = page('WHY NOT THERE', '同样的问题，大型企业的项目里很少发生', '不是运气好，是从立项那天起就被一套标准约束着')
  const rows = [
    ['立项', '架构师必须介入需求与方案评审', '需求说不清'],
    ['预算', '工作量按模块拆解、可核对', '报价黑箱'],
    ['过程', '里程碑评审、周报、进度可追溯', '黑盒开发 · 工期失控'],
    ['代码', '强制代码审查、质量门禁', 'AI 盲盒 · 没人懂'],
    ['上线', '安全、性能、容灾、回滚方案缺一不可', '底层没标准'],
    ['运行', '监控告警、值班制度、故障复盘', '交付即失联'],
    ['资产', '代码、数据、权限均在甲方', '源码拿不回来'],
  ]
  s.addText('挡住了哪类问题', { x: M + 5.5, y: 1.72, w: W - 5.5, h: 0.24, margin: 0, fontFace: FONT, fontSize: 10, color: DIM })
  let y = 2.05
  hairline(s, y - 0.1, INK)
  rows.forEach(([a, b, c]) => {
    s.addText(a, { x: M, y, w: 0.85, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12, bold: true, color: INK })
    s.addText(b, { x: M + 0.9, y, w: 4.5, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12, color: SOFT })
    s.addText(c, { x: M + 5.5, y, w: W - 5.5, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12, color: RED })
    y += 0.42
    hairline(s, y - 0.1, RULE_SOFT)
  })
}

// ============================================================ 08 三个结构性原因
{
  const s = page('ROOT CAUSE', '为什么中小项目躲不掉')
  const items = [
    ['01', '您没法验货', '验收时能查功能好不好用，查不了代码好不好维护、架构撑不撑得住。\n结果是价格成了唯一的比较维度。', false],
    ['02', '合同签的时候，东西还不存在', '细节要在做的过程中才浮现，而合同必须在做之前签。\n这不是谁的疏忽，是这类交易的固有特点。', false],
    ['03', '他的责任在收款时结束，您的责任在上线时开始', '两条时间轴几乎不重叠。建设期为省成本做的任何取舍，\n代价都不由他自己承担。', true],
  ]
  let y = 1.5
  items.forEach(([n, t, d, isKey]) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: M, y: y + 0.02, w: 0.04, h: 0.92, fill: { color: isKey ? BLUE : RULE }, line: { type: 'none' },
    })
    s.addText(n, { x: M + 0.2, y, w: 0.6, h: 0.3, margin: 0, fontFace: FONT, fontSize: 13, bold: true, color: isKey ? BLUE : DIM })
    s.addText(t, { x: M + 0.78, y: y - 0.04, w: W - 0.78, h: 0.34, margin: 0, fontFace: FONT, fontSize: 16, bold: true, color: isKey ? BLUE : INK })
    s.addText(d, { x: M + 0.78, y: y + 0.36, w: W - 0.78, h: 0.62, margin: 0, fontFace: FONT, fontSize: 11.5, color: SOFT, lineSpacing: 17 })
    y += 1.18
  })
  closing(s, 4.9, '前两条只能缓解，第三条可以通过合同设计基本消除。', BLUE)
}

// ============================================================ 09 转折
{
  const s = page('TURNING POINT', '中小项目不是不需要这套标准，是过去养不起')
  const costs = [
    '让 10 年经验的架构师全程参与一个几十万的项目，人力成本算不过来',
    '建一套监控告警系统、配值班人员，对单个中小项目是纯亏损',
    '强制代码审查、写完整文档、做压力测试，工期和报价都要上一个台阶',
  ]
  let y = 1.62
  costs.forEach((c) => {
    s.addShape(pres.shapes.RECTANGLE, { x: M, y: y + 0.12, w: 0.16, h: 0.022, fill: { color: RED }, line: { type: 'none' } })
    s.addText(c, { x: M + 0.34, y, w: W - 0.34, h: 0.32, margin: 0, fontFace: FONT, fontSize: 13.5, color: SOFT })
    y += 0.52
  })
  hairline(s, y + 0.12)
  s.addText('所以行业形成了默认做法：中小项目就用中小项目的干法。\n架构师不参与、监控不做、文档不写、审查不做——不是不知道该做，是做了就没利润。', {
    x: M, y: y + 0.32, w: W, h: 0.7, margin: 0, fontFace: FONT, fontSize: 13, color: INK, lineSpacing: 22,
  })
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 4.28, w: 0.04, h: 0.5, fill: { color: BLUE }, line: { type: 'none' } })
  s.addText('本白皮书要回答的就是：有没有办法让这套标准在中小项目上算得过账。', {
    x: M + 0.2, y: 4.34, w: W - 0.2, h: 0.38, margin: 0, fontFace: FONT, fontSize: 13.5, bold: true, color: BLUE,
  })
}

// ============================================================ 10 分隔：第二部分
divider('PART 02', '我们凭什么：\n企业级交付标准的三根支柱', ['人 · 标准从哪来', '建 · AI 产研平台', '维 · AI 维保平台'])

// ============================================================ 11 三根支柱
{
  const s = page('THREE PILLARS', '把标准带出来，并让它算得过账')
  const cols = [
    [BLUE, '人', '标准从哪来', '核心成员做了多年大型企业信息化项目\n与高科技企业产品研发，交付标准是从\n那里带出来的', '决定标准的高度'],
    [RED, '建', '自研 AI 产研平台', '架构师、研发工程师与 AI 三方互检，\n高质量门禁，规避 AI 盲盒式交付', '压低建设成本'],
    [YELLOW, '维', '自研 AI 维保平台', '主动发现问题并处理，\n而不是等客户提交工单', '压低持有成本'],
  ]
  const cw = (W - 0.7) / 3
  cols.forEach(([c, big, t, d, v], i) => {
    const x = M + i * (cw + 0.35)
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.5, w: 0.5, h: 0.5, fill: { color: c }, line: { type: 'none' } })
    s.addText(big, {
      x, y: 1.5, w: 0.5, h: 0.5, margin: 0,
      fontFace: FONT, fontSize: 22, bold: true, color: 'FFFFFF', align: 'center', valign: 'middle',
    })
    s.addText(t, { x, y: 2.16, w: cw, h: 0.32, margin: 0, fontFace: FONT, fontSize: 15, bold: true, color: INK })
    hairline(s, 2.58, RULE, x, cw)
    s.addText(d, { x, y: 2.74, w: cw, h: 0.95, margin: 0, fontFace: FONT, fontSize: 11, color: SOFT, lineSpacing: 16 })
    s.addText(v, { x, y: 3.8, w: cw, h: 0.3, margin: 0, fontFace: FONT, fontSize: 11.5, bold: true, color: INK })
  })
  closing(s, 4.34, 'AI 产研平台让这套标准买得起，AI 维保平台让它在交付之后继续成立。')
}

// ============================================================ 12 支柱一 · 人
{
  const s = page('PILLAR 01  PEOPLE', '标准从哪里来', '核心成员均具备 10 年以上软件研发经历，包含两类经验')
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 1.86, w: 0.04, h: 0.86, fill: { color: BLUE }, line: { type: 'none' } })
  s.addText('大型企业信息化项目建设经验', {
    x: M + 0.2, y: 1.82, w: 4.1, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12.5, bold: true, color: BLUE,
  })
  s.addText('中国电信集团　·　中国邮政储蓄银行\n中国太平洋保险　·　中国金融期货交易所', {
    x: M + 0.2, y: 2.18, w: 4.1, h: 0.62, margin: 0, fontFace: FONT, fontSize: 12.5, color: INK, lineSpacing: 21,
  })
  const x2 = M + 4.6
  s.addShape(pres.shapes.RECTANGLE, { x: x2, y: 1.86, w: 0.04, h: 0.86, fill: { color: RED }, line: { type: 'none' } })
  s.addText('高科技与独角兽企业产品研发经验', {
    x: x2 + 0.2, y: 1.82, w: 4.1, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12.5, bold: true, color: RED,
  })
  s.addText('东方国信　·　惠普\n中国电子信息产业集团　·　数澜科技', {
    x: x2 + 0.2, y: 2.18, w: 4.1, h: 0.62, margin: 0, fontFace: FONT, fontSize: 12.5, color: INK, lineSpacing: 21,
  })
  s.addText('以上为团队成员的个人从业经历，非本公司的客户案例。', {
    x: M, y: 2.94, w: W, h: 0.26, margin: 0, fontFace: FONT, fontSize: 10, color: DIM,
  })
  hairline(s, 3.34)
  const rules = [
    ['架构师本人对接需求', '不经由销售、客服或初级开发转达。需求翻译的质量，取决于能否听出您没说出口的业务约束。'],
    ['一个项目，一位架构师，全程到底', '不中途抽调、不并行拆分。因此我们能同时接的项目数是有硬上限的——排不开就说排不开。'],
  ]
  let y = 3.56
  rules.forEach(([t, d]) => {
    s.addShape(pres.shapes.OVAL, { x: M, y: y + 0.09, w: 0.1, h: 0.1, fill: { color: BLUE }, line: { type: 'none' } })
    s.addText(t, { x: M + 0.24, y, w: 3.0, h: 0.28, margin: 0, fontFace: FONT, fontSize: 13, bold: true, color: INK })
    s.addText(d, { x: M + 3.35, y: y - 0.02, w: W - 3.35, h: 0.6, margin: 0, fontFace: FONT, fontSize: 11, color: SOFT, lineSpacing: 16 })
    y += 0.78
  })
}

// ============================================================ 13 支柱二 · 建
{
  const s = page('PILLAR 02  BUILD', 'AI 写得快，不等于软件做得好')
  s.addText('行业现状：AI 大幅降低了写代码的门槛，价格确实在降。但 AI 生成的代码通常能通过功能演示，\n结构是否合理、半年后还能不能改，往往没有人真正核对过——您拿到的是一个盲盒。', {
    x: M, y: 1.26, w: W, h: 0.62, margin: 0, fontFace: FONT, fontSize: 12.5, color: SOFT, lineSpacing: 19,
  })
  s.addShape(pres.shapes.RECTANGLE, { x: M, y: 1.98, w: 0.04, h: 0.34, fill: { color: RED }, line: { type: 'none' } })
  s.addText('它比过去的低质交付更危险——因为表面质量更高，验收时看起来完全正常。', {
    x: M + 0.2, y: 1.98, w: W - 0.2, h: 0.34, margin: 0, fontFace: FONT, fontSize: 13, bold: true, color: RED,
  })
  hairline(s, 2.58, INK)
  s.addText('我们的做法：AI 不是执行者，而是三方互检中的一方', {
    x: M, y: 2.76, w: W, h: 0.32, margin: 0, fontFace: FONT, fontSize: 15, bold: true, color: INK,
  })
  const three = [
    [BLUE, '架构师', '架构设计与规格定义\n方向由人定，不由 AI 定'],
    [YELLOW, 'AI', '承担部分实现与初审，\n并反过来审查人写的代码'],
    [RED, '研发工程师', '复核 AI 的产出\n责任始终在人身上'],
  ]
  const cw = (W - 0.7) / 3
  three.forEach(([c, t, d], i) => {
    const x = M + i * (cw + 0.35)
    s.addShape(pres.shapes.RECTANGLE, { x, y: 3.28, w: cw, h: 0.05, fill: { color: c }, line: { type: 'none' } })
    s.addText(t, { x, y: 3.42, w: cw, h: 0.3, margin: 0, fontFace: FONT, fontSize: 14, bold: true, color: INK })
    s.addText(d, { x, y: 3.78, w: cw, h: 0.62, margin: 0, fontFace: FONT, fontSize: 11, color: SOFT, lineSpacing: 16 })
  })
  closing(s, 4.5, '三方的产出互为审核对象，之上还有不因赶工期而放宽的质量门禁。我们并不依赖 AI 生成代码。', INK, false)
}

// ============================================================ 14 支柱三 · 维
{
  const s = page('PILLAR 03  MAINTAIN', '交付之后，谁在看着这套系统')
  const cw = (W - 0.5) / 2
  const flows = [
    [M, RED, 'F0D2D5', '行业通行做法', ['您发现问题', '提交工单', '客服转达', '排入迭代计划', '开发与运维之间往返', '若干天后处理']],
    [M + cw + 0.5, BLUE, 'CDDCF7', '我们的做法', ['平台发现问题', '巡检智能体定位根因', '处理', '您可能从未察觉']],
  ]
  flows.forEach(([x, c, lineC, title, items]) => {
    s.addText(title, { x, y: 1.3, w: cw, h: 0.3, margin: 0, fontFace: FONT, fontSize: 13, bold: true, color: c })
    hairline(s, 1.67, RULE, x, cw)
    items.forEach((t, i) => {
      if (i < items.length - 1) {
        s.addShape(pres.shapes.RECTANGLE, { x: x + 0.062, y: 1.98 + i * 0.4, w: 0.016, h: 0.31, fill: { color: lineC }, line: { type: 'none' } })
      }
      s.addShape(pres.shapes.OVAL, { x: x + 0.025, y: 1.89 + i * 0.4, w: 0.09, h: 0.09, fill: { color: c }, line: { type: 'none' } })
      s.addText(t, { x: x + 0.28, y: 1.81 + i * 0.4, w: cw - 0.28, h: 0.28, margin: 0, fontFace: FONT, fontSize: 12, color: SOFT })
    })
  })
  s.addText('四类巡检智能体分工扫描：日志分析 · 性能诊断 · 依赖巡检 · 配置核查\n并在多个信号之间做关联判断，直接指向根因。', {
    x: M + cw + 0.5, y: 3.56, w: cw, h: 0.62, margin: 0, fontFace: FONT, fontSize: 11, color: SOFT, lineSpacing: 16,
  })
  closing(s, 4.5, '7×24 小时监控，不分工作日与节假日；维保期内异常 24 小时内处理。', INK, false)
}

// ============================================================ 15 算得过账
{
  const s = page('PRICING LOGIC', '为什么价格更低，质量反而更有保障', '市场上的「便宜」有两种，长期结果完全相反')
  const rows = [
    ['', '削减式降价', '效能式降价'],
    ['省在哪', '砍文档、砍测试、砍看不见的地方', '提升单位工时的产出'],
    ['建设成本', '降低', '降低'],
    ['持有成本', '大幅上升', '不变或下降'],
    ['退出成本', '大幅上升', '不变'],
    ['总账', '更贵', '更便宜'],
  ]
  let y = 1.9
  hairline(s, y - 0.12, INK)
  rows.forEach((r, i) => {
    const head = i === 0
    s.addText(r[0], { x: M, y, w: 1.5, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12, bold: true, color: head ? DIM : INK })
    s.addText(r[1], { x: M + 1.6, y, w: 3.5, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12.5, bold: head, color: head ? RED : SOFT })
    s.addText(r[2], { x: M + 5.3, y, w: 3.6, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12.5, bold: head, color: head ? BLUE : SOFT })
    y += 0.44
    hairline(s, y - 0.12, head ? INK : RULE_SOFT)
  })
  s.addText('我们降的是生产成本，不是交付标准。最直接的证明是——如果靠砍质量降价，「交付的代码问题终生免费修复」这条承诺会直接把我们拖垮。', {
    x: M, y: y + 0.14, w: W, h: 0.5, margin: 0, fontFace: FONT, fontSize: 12, color: INK, lineSpacing: 19,
  })
}

// ============================================================ 16 七步流程
{
  const s = page('HOW WE WORK', '七步流程，所有项目都走这一条')
  const steps = [
    ['01', '初步交流', '免费'], ['02', '需求与报价', '免费'], ['03', '法律合同', ''],
    ['04', '持续反馈', ''], ['05', '逐项验收', ''], ['06', '上线交付', ''], ['07', '维修保障', ''],
  ]
  const sw = W / 7
  const lineY = 2.05
  s.addShape(pres.shapes.RECTANGLE, { x: M + sw / 2, y: lineY, w: W - sw, h: 0.014, fill: { color: RULE }, line: { type: 'none' } })
  steps.forEach(([n, t, tag], i) => {
    const cx = M + sw * i + sw / 2
    const filled = i < 2 || i === 6
    s.addShape(pres.shapes.OVAL, {
      x: cx - 0.075, y: lineY - 0.068, w: 0.15, h: 0.15,
      fill: { color: filled ? BLUE : PAPER }, line: { color: BLUE, width: 1.2 },
    })
    s.addText(n, { x: cx - sw / 2, y: 1.48, w: sw, h: 0.26, margin: 0, fontFace: FONT, fontSize: 11, color: DIM, align: 'center' })
    s.addText(t, { x: cx - sw / 2, y: 2.32, w: sw, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12.5, bold: true, color: INK, align: 'center' })
    if (tag) s.addText(tag, { x: cx - sw / 2, y: 2.64, w: sw, h: 0.26, margin: 0, fontFace: FONT, fontSize: 10.5, color: RED, align: 'center' })
  })
  hairline(s, 3.18)
  const notes = [
    ['前两步完全免费', '不花一分钱，先拿到一份完整的需求文档和一份明确的报价，再决定要不要合作'],
    ['每周按条目汇报', '汇报单位是需求文档的条目——「这周完成了第 12、13、17 条」，而不是「进度 60%」'],
    ['逐项验收', '验收依据是那份您逐条确认过的需求文档，让分歧变成事实核对，而不是立场之争'],
  ]
  let y = 3.4
  notes.forEach(([t, d]) => {
    s.addText(t, { x: M, y, w: 1.85, h: 0.28, margin: 0, fontFace: FONT, fontSize: 12, bold: true, color: BLUE })
    s.addText(d, { x: M + 1.95, y, w: W - 1.95, h: 0.28, margin: 0, fontFace: FONT, fontSize: 11.5, color: SOFT })
    y += 0.42
  })
  closing(s, y + 0.06, '偏差在第一周就会显形，而不是在第十周。一周的偏差可以补，十周的偏差只能延期。')
}

// ============================================================ 17 交付基准
{
  const s = page('DELIVERY BASELINE', '看不见的地方，我们有统一基准', '它是每个项目的默认配置，不是可选项，也不随报价调整')
  const items = [
    ['数据安全', '密码不以任何形式明文留存；凭据由您掌握；权限按角色最小化'],
    ['稳定性', '定期自动备份，且必须验证过可恢复——没验证过恢复的备份不算备份'],
    ['性能', '关键接口的响应目标写进需求文档并纳入验收；上线前完成压力验证'],
    ['容错灾备', '识别并处置单点故障；事务保障；对外部依赖设超时与重试'],
    ['可维护性', '检验标准只有一条：换一个团队来，能不能接手'],
    ['界面贴合', '组织方式跟随您的业务流程，高频操作路径最短化'],
  ]
  const cw = (W - 0.5) / 2
  items.forEach(([t, d], i) => {
    const x = M + (i % 2) * (cw + 0.5)
    const y = 1.82 + Math.floor(i / 2) * 1.0
    s.addShape(pres.shapes.RECTANGLE, { x, y: y + 0.06, w: 0.04, h: 0.6, fill: { color: [BLUE, RED, YELLOW][i % 3] }, line: { type: 'none' } })
    s.addText(t, { x: x + 0.2, y, w: cw - 0.2, h: 0.3, margin: 0, fontFace: FONT, fontSize: 14, bold: true, color: INK })
    s.addText(d, { x: x + 0.2, y: y + 0.32, w: cw - 0.2, h: 0.55, margin: 0, fontFace: FONT, fontSize: 11, color: SOFT, lineSpacing: 16 })
  })
  closing(s, 4.88, '做不到，将来免费返工的是我们自己——这条基准和我们自己的利益是一致的。', INK, false)
}

// ============================================================ 18 三类服务
{
  const s = page('WHAT WE DO', '三类服务，六个维度的覆盖')
  const svc = [
    [BLUE, '软件定制服务', '把一件事做成一套系统', '还没有系统，或现有方式已经撑不住'],
    [RED, '企业 AI 升级定制服务', '在现有业务与系统上把 AI 接进去', '业务已在跑，希望用 AI 提效或降本'],
    [YELLOW, '企业数字化与 AI 咨询服务', '先把该不该做、先做什么想清楚', '还在决策阶段，或方向不明'],
  ]
  let y = 1.5
  svc.forEach(([c, t, d, w]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: M, y: y + 0.06, w: 0.04, h: 0.46, fill: { color: c }, line: { type: 'none' } })
    s.addText(t, { x: M + 0.2, y, w: 3.1, h: 0.3, margin: 0, fontFace: FONT, fontSize: 14, bold: true, color: INK })
    s.addText(d, { x: M + 0.2, y: y + 0.31, w: 3.1, h: 0.26, margin: 0, fontFace: FONT, fontSize: 10.5, color: DIM })
    s.addText(w, { x: M + 3.5, y: y + 0.08, w: W - 3.5, h: 0.3, margin: 0, fontFace: FONT, fontSize: 12, color: SOFT })
    y += 0.8
  })
  hairline(s, 3.94)
  const cover = [['20', '个行业'], ['56', '类业务场景'], ['20', '类软件形态'], ['10', '个端与载体'], ['40+', '项 AI 能力']]
  const cw2 = W / 5
  cover.forEach(([n, t], i) => {
    const x = M + i * cw2
    s.addText(n, { x, y: 4.14, w: cw2, h: 0.5, margin: 0, fontFace: FONT, fontSize: 30, bold: true, color: BLUE })
    s.addText(t, { x, y: 4.66, w: cw2, h: 0.26, margin: 0, fontFace: FONT, fontSize: 11, color: SOFT })
  })
}

// ============================================================ 19 五条承诺
{
  const s = page('COMMITMENTS', '写进合同的五条承诺')
  const items = [
    ['源码、数据与知识产权完整归您', '完整部署在您自己的服务器上，凭据由您持有。您可以在任何时候换掉我们，且不需要征得我们同意。', false],
    ['前两步完全免费', '初步交流与需求梳理报价全程免费，不满意可持续优化，直到满意为止。不合作，需求文档也归您。', false],
    ['不搞黑盒开发', '专属沟通渠道；每周按需求条目汇报；交付前逐项验收，任何一项不满意就调整。', false],
    ['一年免费维保', '自交付日起免费维保一年，7×24 小时监控，异常 24 小时内处理，不分工作日与节假日。', false],
    ['交付的代码问题，终生免费修复', '无论是否还在服务期。性能不达标、备份恢复不了、容灾没做到位，都算交付的代码问题。', true],
  ]
  let y = 1.42
  items.forEach(([t, d, isKey]) => {
    s.addShape(pres.shapes.RECTANGLE, {
      x: M, y: y + 0.04, w: 0.04, h: 0.54, fill: { color: isKey ? BLUE : RULE }, line: { type: 'none' },
    })
    s.addText(t, { x: M + 0.2, y, w: 3.35, h: 0.3, margin: 0, fontFace: FONT, fontSize: 13.5, bold: true, color: isKey ? BLUE : INK })
    s.addText(d, { x: M + 3.7, y: y - 0.02, w: W - 3.7, h: 0.62, margin: 0, fontFace: FONT, fontSize: 11, color: SOFT, lineSpacing: 16 })
    y += 0.68
  })
  closing(s, y + 0.02, '一次沟通，不需要您先准备方案，也不产生任何费用。')
}

pres.writeFile({ fileName: process.argv[2] || 'deck.pptx' }).then((f) => console.log('已生成', f, '共', pageNo, '页'))
