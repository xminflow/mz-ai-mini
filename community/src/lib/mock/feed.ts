export interface FeedItem {
  id: string
  title: string
  author: string
}

export function getMockFeed(): FeedItem[] {
  return [
    { id: '1', title: '示例提问：如何系统学习一个新领域？', author: '小汇' },
    { id: '2', title: '示例分享：我的知识管理工作流', author: '阿星' },
  ]
}
