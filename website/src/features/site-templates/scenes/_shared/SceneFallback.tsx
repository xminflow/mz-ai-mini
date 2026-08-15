import { SceneContact } from '../../gallery/SceneContact'

/**
 * 还没有写自定义区的场景用的通用内容。
 *
 * 这不是静默兜底，而是场景页的一个明确状态：15 个场景个个成页，
 * 而介绍文案是逐个场景确认后才填的，没填的那些需要一个说得过去的样子——
 * 只挂一个孤零零的标题会让人以为页面坏了。填了自己的 Section.tsx 之后，
 * 这个组件对该场景就不再出现。
 */
export const SceneFallback = ({ sceneName }: { sceneName: string }) => (
  <div className="mt-8 border-l-2 border-blue/40 pl-5">
    <p className="max-w-[34em] text-[15px] leading-[1.9] text-graphite-soft">
      {sceneName}这类项目我们做过，只是可以公开展示的样板还在整理。
      与其等我们补齐，不如直接说说你的业务——我们会挑最接近的项目跟你讲具体做法、周期和分工。
    </p>
    <SceneContact />
  </div>
)
