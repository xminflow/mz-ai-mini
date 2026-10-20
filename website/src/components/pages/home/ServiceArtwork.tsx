// Overflow Notion Icons 免费 Duotone 系列，授权和品牌配色调整见素材目录 README。
const ARTWORK: Record<string, string> = {
  '01': 'browser',
  '02': 'kanban',
  '03': 'laptop-mobile',
  '04': 'comment-text',
  '05': 'reference',
  '06': 'doughnut-chart',
  '07': 'server',
  '08': 'shopping-cart',
  '09': 'laptop-fill',
  '10': 'api-brackets',
  '11': 'pen-line',
  '12': 'diagram-project',
}

export const ServiceArtwork = ({ code }: { code: string }) => {
  const icon = ARTWORK[code]
  if (!icon) {
    throw new Error(`ServiceArtwork: 缺少 code ${code} 对应的图标`)
  }

  return (
    // 卡片标题已经说明类别，图标仅作装饰，避免读屏重复朗读。
    <img
      src={`/home/icons/overflow/${icon}.svg`}
      alt=""
      aria-hidden="true"
      width={112}
      height={112}
      className="h-28 w-28 max-w-full shrink-0 object-contain"
      draggable={false}
    />
  )
}
