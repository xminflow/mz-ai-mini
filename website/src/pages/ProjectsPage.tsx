import { StoryFeedPage } from '../components/feed'
import { STORY_TYPES } from '../types'

export const ProjectsPage = () => (
  <StoryFeedPage
    type={STORY_TYPES.PROJECT}
    pageTitle="项目"
    pageDescription="我们正在陪跑的创业项目与共赢生态成员，覆盖从方向校准、AI 落地到资源对接的完整链路。"
    searchPlaceholder="搜索项目关键词"
    emptyText="暂无符合条件的项目，试试调整筛选条件。"
  />
)
