// 定制 pandoc 参考文档：中文字体、标题层级、表格样式、页面与页码。
// 只做字符串级替换，不引入任何依赖。
const fs = require('fs')
const path = require('path')

const REF = path.join(__dirname, 'ref')
const rd = (p) => fs.readFileSync(path.join(REF, p), 'utf8')
const wr = (p, s) => fs.writeFileSync(path.join(REF, p), s)

/** 品牌色板，取自官网令牌 */
const BLUE = '0F5FD8'
const GRAPHITE = '0E0E0E'
const SOFT = '44443F'
const DIM = '64645B'
const RULE = 'DCDCD8'
const RULE_SOFT = 'EDEDEA'
const HEAD_FILL = 'F4F4F1'

const ZH = '微软雅黑'
const LAT = 'Segoe UI'
const fonts = `<w:rFonts w:ascii="${LAT}" w:eastAsia="${ZH}" w:hAnsi="${LAT}" w:cs="${LAT}" />`

let s = rd('word/styles.xml')

/** 用新定义整体替换某个 styleId 的样式块 */
function replaceStyle(id, xml) {
  const re = new RegExp(`<w:style [^>]*w:styleId="${id}">[\\s\\S]*?<\\/w:style>`)
  if (!re.test(s)) throw new Error(`样式未找到：${id}`)
  s = s.replace(re, xml)
}

// ---- 全局默认：正文 10.5pt / 行距 1.5 / 段后 6pt ----
s = s.replace(
  /<w:rPrDefault>[\s\S]*?<\/w:rPrDefault>/,
  `<w:rPrDefault><w:rPr>${fonts}<w:color w:val="${GRAPHITE}" /><w:sz w:val="21" /><w:szCs w:val="21" /><w:lang w:val="en-US" w:eastAsia="zh-CN" w:bidi="ar-SA" /></w:rPr></w:rPrDefault>`,
)
s = s.replace(
  /<w:pPrDefault>[\s\S]*?<\/w:pPrDefault>/,
  `<w:pPrDefault><w:pPr><w:spacing w:before="0" w:after="100" w:line="312" w:lineRule="auto" /><w:jc w:val="both" /></w:pPr></w:pPrDefault>`,
)

// ---- 标题层级 ----
// H1 = 部分（独占一页，蓝色）
replaceStyle(
  'Heading1',
  `<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1" /><w:basedOn w:val="Normal" /><w:next w:val="BodyText" /><w:link w:val="Heading1Char" /><w:uiPriority w:val="9" /><w:qFormat />
  <w:pPr><w:pageBreakBefore /><w:keepNext /><w:keepLines /><w:spacing w:before="1600" w:after="240" w:line="288" w:lineRule="auto" /><w:jc w:val="left" /><w:outlineLvl w:val="0" /></w:pPr>
  <w:rPr>${fonts}<w:b /><w:color w:val="${BLUE}" /><w:sz w:val="40" /><w:szCs w:val="40" /></w:rPr></w:style>`,
)

// H2 = 章（另起一页，墨黑，下加细线）
replaceStyle(
  'Heading2',
  `<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2" /><w:basedOn w:val="Normal" /><w:next w:val="BodyText" /><w:link w:val="Heading2Char" /><w:uiPriority w:val="9" /><w:qFormat />
  <w:pPr><w:pageBreakBefore /><w:keepNext /><w:keepLines /><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="6" w:color="${GRAPHITE}" /></w:pBdr><w:spacing w:before="0" w:after="320" w:line="288" w:lineRule="auto" /><w:jc w:val="left" /><w:outlineLvl w:val="1" /></w:pPr>
  <w:rPr>${fonts}<w:b /><w:color w:val="${GRAPHITE}" /><w:sz w:val="32" /><w:szCs w:val="32" /></w:rPr></w:style>`,
)

// H3 = 节
replaceStyle(
  'Heading3',
  `<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="heading 3" /><w:basedOn w:val="Normal" /><w:next w:val="BodyText" /><w:link w:val="Heading3Char" /><w:uiPriority w:val="9" /><w:qFormat />
  <w:pPr><w:keepNext /><w:keepLines /><w:spacing w:before="400" w:after="160" w:line="300" w:lineRule="auto" /><w:jc w:val="left" /><w:outlineLvl w:val="2" /></w:pPr>
  <w:rPr>${fonts}<w:b /><w:color w:val="${GRAPHITE}" /><w:sz w:val="25" /><w:szCs w:val="25" /></w:rPr></w:style>`,
)

// H4 = 小节
replaceStyle(
  'Heading4',
  `<w:style w:type="paragraph" w:styleId="Heading4"><w:name w:val="heading 4" /><w:basedOn w:val="Normal" /><w:next w:val="BodyText" /><w:link w:val="Heading4Char" /><w:uiPriority w:val="9" /><w:qFormat />
  <w:pPr><w:keepNext /><w:keepLines /><w:spacing w:before="300" w:after="120" w:line="300" w:lineRule="auto" /><w:jc w:val="left" /><w:outlineLvl w:val="3" /></w:pPr>
  <w:rPr>${fonts}<w:b /><w:color w:val="${BLUE}" /><w:sz w:val="22" /><w:szCs w:val="22" /></w:rPr></w:style>`,
)

// ---- 封面标题与副标题 ----
replaceStyle(
  'Title',
  `<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title" /><w:basedOn w:val="Normal" /><w:next w:val="BodyText" /><w:link w:val="TitleChar" /><w:uiPriority w:val="10" /><w:qFormat />
  <w:pPr><w:spacing w:before="3600" w:after="200" w:line="264" w:lineRule="auto" /><w:contextualSpacing /><w:jc w:val="center" /></w:pPr>
  <w:rPr>${fonts}<w:b /><w:color w:val="${GRAPHITE}" /><w:sz w:val="56" /><w:szCs w:val="56" /></w:rPr></w:style>`,
)
replaceStyle(
  'Subtitle',
  `<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle" /><w:basedOn w:val="Normal" /><w:next w:val="BodyText" /><w:link w:val="SubtitleChar" /><w:uiPriority w:val="11" /><w:qFormat />
  <w:pPr><w:spacing w:before="120" w:after="0" w:line="312" w:lineRule="auto" /><w:jc w:val="center" /></w:pPr>
  <w:rPr>${fonts}<w:color w:val="${SOFT}" /><w:sz w:val="26" /><w:szCs w:val="26" /></w:rPr></w:style>`,
)

// ---- 正文与引用 ----
replaceStyle(
  'BodyText',
  `<w:style w:type="paragraph" w:styleId="BodyText"><w:name w:val="Body Text" /><w:basedOn w:val="Normal" /><w:link w:val="BodyTextChar" /><w:uiPriority w:val="9" /><w:qFormat />
  <w:pPr><w:spacing w:before="0" w:after="110" w:line="312" w:lineRule="auto" /><w:ind w:firstLine="0" /></w:pPr></w:style>`,
)
// 引用块：左侧蓝色竖线 + 浅底，用于全文的结论句
replaceStyle(
  'BlockText',
  `<w:style w:type="paragraph" w:styleId="BlockText"><w:name w:val="Block Text" /><w:basedOn w:val="BodyText" /><w:next w:val="BodyText" /><w:uiPriority w:val="9" /><w:qFormat />
  <w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="10" w:color="${BLUE}" /></w:pBdr><w:shd w:val="clear" w:color="auto" w:fill="F7F7F5" /><w:spacing w:before="200" w:after="200" w:line="336" w:lineRule="auto" /><w:ind w:firstLine="0" w:left="240" w:right="0" /></w:pPr>
  <w:rPr><w:color w:val="${GRAPHITE}" /></w:rPr></w:style>`,
)
// 列表项：收紧行距，与正文区分
replaceStyle(
  'Compact',
  `<w:style w:type="paragraph" w:customStyle="1" w:styleId="Compact"><w:name w:val="Compact" /><w:basedOn w:val="BodyText" /><w:qFormat />
  <w:pPr><w:spacing w:before="20" w:after="20" w:line="300" w:lineRule="auto" /></w:pPr></w:style>`,
)

// ---- 表格：只留横线，表头浅底加粗 ----
replaceStyle(
  'Table',
  `<w:style w:type="table" w:default="1" w:styleId="Table"><w:name w:val="Table" /><w:basedOn w:val="TableNormal" /><w:uiPriority w:val="59" /><w:qFormat />
  <w:pPr><w:spacing w:before="20" w:after="20" w:line="264" w:lineRule="auto" /><w:jc w:val="left" /></w:pPr>
  <w:rPr>${fonts}<w:sz w:val="19" /><w:szCs w:val="19" /></w:rPr>
  <w:tblPr><w:tblInd w:w="0" w:type="dxa" />
    <w:tblBorders>
      <w:top w:val="single" w:sz="8" w:space="0" w:color="${GRAPHITE}" />
      <w:left w:val="none" w:sz="0" w:space="0" w:color="auto" />
      <w:bottom w:val="single" w:sz="8" w:space="0" w:color="${RULE}" />
      <w:right w:val="none" w:sz="0" w:space="0" w:color="auto" />
      <w:insideH w:val="single" w:sz="4" w:space="0" w:color="${RULE_SOFT}" />
      <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto" />
    </w:tblBorders>
    <w:tblCellMar><w:top w:w="80" w:type="dxa" /><w:left w:w="120" w:type="dxa" /><w:bottom w:w="80" w:type="dxa" /><w:right w:w="120" w:type="dxa" /></w:tblCellMar>
  </w:tblPr>
  <w:tblStylePr w:type="firstRow">
    <w:rPr><w:b /><w:color w:val="${GRAPHITE}" /></w:rPr>
    <w:tcPr><w:shd w:val="clear" w:color="auto" w:fill="${HEAD_FILL}" /><w:tcBorders><w:bottom w:val="single" w:sz="8" w:space="0" w:color="${GRAPHITE}" /></w:tcBorders><w:vAlign w:val="center" /></w:tcPr>
  </w:tblStylePr></w:style>`,
)

// ---- 目录标题 ----
replaceStyle(
  'TOCHeading',
  `<w:style w:type="paragraph" w:styleId="TOCHeading"><w:name w:val="TOC Heading" /><w:basedOn w:val="Normal" /><w:next w:val="BodyText" /><w:uiPriority w:val="39" /><w:qFormat />
  <w:pPr><w:pageBreakBefore /><w:keepNext /><w:spacing w:before="0" w:after="320" w:line="288" w:lineRule="auto" /><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="6" w:color="${GRAPHITE}" /></w:pBdr><w:jc w:val="left" /></w:pPr>
  <w:rPr>${fonts}<w:b /><w:color w:val="${GRAPHITE}" /><w:sz w:val="32" /><w:szCs w:val="32" /></w:rPr></w:style>`,
)

// 图注/说明文字统一压暗
s = s.replace(/w:styleId="Caption">/g, 'w:styleId="Caption">')
wr('word/styles.xml', s)

// ---- 页面设置 + 页脚页码 ----
const footer = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:p><w:pPr><w:jc w:val="center" /><w:spacing w:before="0" w:after="0" /><w:rPr><w:rFonts w:ascii="${LAT}" w:eastAsia="${ZH}" w:hAnsi="${LAT}" /><w:color w:val="${DIM}" /><w:sz w:val="17" /></w:rPr></w:pPr>
    <w:r><w:rPr><w:rFonts w:ascii="${LAT}" w:eastAsia="${ZH}" w:hAnsi="${LAT}" /><w:color w:val="${DIM}" /><w:sz w:val="17" /></w:rPr><w:t xml:space="preserve">— </w:t></w:r>
    <w:r><w:rPr><w:color w:val="${DIM}" /><w:sz w:val="17" /></w:rPr><w:fldChar w:fldCharType="begin" /></w:r>
    <w:r><w:rPr><w:color w:val="${DIM}" /><w:sz w:val="17" /></w:rPr><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r>
    <w:r><w:rPr><w:color w:val="${DIM}" /><w:sz w:val="17" /></w:rPr><w:fldChar w:fldCharType="separate" /></w:r>
    <w:r><w:rPr><w:color w:val="${DIM}" /><w:sz w:val="17" /></w:rPr><w:t>1</w:t></w:r>
    <w:r><w:rPr><w:color w:val="${DIM}" /><w:sz w:val="17" /></w:rPr><w:fldChar w:fldCharType="end" /></w:r>
    <w:r><w:rPr><w:rFonts w:ascii="${LAT}" w:eastAsia="${ZH}" w:hAnsi="${LAT}" /><w:color w:val="${DIM}" /><w:sz w:val="17" /></w:rPr><w:t xml:space="preserve"> —</w:t></w:r>
  </w:p>
</w:ftr>`
wr('word/footer1.xml', footer)

let rels = rd('word/_rels/document.xml.rels')
rels = rels.replace(
  '</Relationships>',
  '<Relationship Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Id="rId50" Target="footer1.xml" /></Relationships>',
)
wr('word/_rels/document.xml.rels', rels)

let ct = rd('[Content_Types].xml')
ct = ct.replace(
  '</Types>',
  '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml" /></Types>',
)
wr('[Content_Types].xml', ct)

// A4 210×297mm = 11906×16838 twips；页边距上下 2.4cm 左右 2.6cm
let doc = rd('word/document.xml')
doc = doc.replace(
  /<w:sectPr>[\s\S]*?<\/w:sectPr>/,
  `<w:sectPr><w:footerReference w:type="default" r:id="rId50" /><w:pgSz w:w="11906" w:h="16838" /><w:pgMar w:top="1361" w:right="1474" w:bottom="1361" w:left="1474" w:header="851" w:footer="737" w:gutter="0" /><w:footnotePr><w:numRestart w:val="eachSect" /></w:footnotePr><w:titlePg /></w:sectPr>`,
)
wr('word/document.xml', doc)

console.log('参考文档样式已定制完成')

// ---- 封面副题行（自定义样式，供 pandoc 的 custom-style 使用）----
{
  let st = rd('word/styles.xml')
  st = st.replace(
    '</w:styles>',
    `<w:style w:type="paragraph" w:customStyle="1" w:styleId="CoverLine"><w:name w:val="CoverLine" /><w:basedOn w:val="Normal" /><w:qFormat />
    <w:pPr><w:spacing w:before="600" w:after="0" w:line="312" w:lineRule="auto" /><w:jc w:val="center" /></w:pPr>
    <w:rPr>${fonts}<w:color w:val="${DIM}" /><w:sz w:val="21" /><w:szCs w:val="21" /></w:rPr></w:style></w:styles>`,
  )
  wr('word/styles.xml', st)
}
