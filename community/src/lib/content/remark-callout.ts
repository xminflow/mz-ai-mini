// 本地 remark 插件：把 GFM 告警块（> [!NOTE] 等）转成带 tone 类名的 blockquote。
// 设计取舍：手动遍历 mdast，避免引入 unist-util-visit / 第三方告警插件依赖。

// mdast 节点的最小结构描述（仅用到本插件需要的字段）
interface MdNode {
  type: string
  value?: string
  children?: MdNode[]
  data?: { hProperties?: Record<string, string> }
}

// 告警标记 → callout tone（与既有视觉一致：NOTE=info，WARNING=warn，TIP=tip）
const ALERT_TO_TONE: Record<string, 'info' | 'warn' | 'tip'> = {
  NOTE: 'info',
  WARNING: 'warn',
  TIP: 'tip',
}

const MARKER = /^\[!(NOTE|WARNING|TIP)\]\s*/

// 处理单个 blockquote：若首段以告警标记开头，则记录 tone 并剥离标记文本
function applyAlert(node: MdNode): void {
  const firstPara = node.children?.[0]
  if (!firstPara || firstPara.type !== 'paragraph') return
  const firstText = firstPara.children?.[0]
  if (!firstText || firstText.type !== 'text' || typeof firstText.value !== 'string') return

  const match = firstText.value.match(MARKER)
  if (!match) return

  const tone = ALERT_TO_TONE[match[1]]
  // 剥离标记文本；若标记后整行为空，则删掉这个空文本节点
  firstText.value = firstText.value.replace(MARKER, '')
  if (firstText.value === '') firstPara.children!.shift()
  // 若紧随的是软换行（break），一并删除，避免正文顶部空行
  if (firstPara.children![0]?.type === 'break') firstPara.children!.shift()

  node.data = node.data ?? {}
  node.data.hProperties = { ...(node.data.hProperties ?? {}), 'data-callout': tone }
}

function walk(node: MdNode): void {
  if (node.type === 'blockquote') applyAlert(node)
  node.children?.forEach(walk)
}

// remark 插件入口：返回作用于 mdast root 的 transformer
export default function remarkCallout() {
  return (tree: MdNode) => {
    walk(tree)
  }
}
