type SceneIntroProps = {
  /** 这个场景解决的是什么问题，讲客户的处境而不是我们的能力 */
  description: string
  /** 「这类项目我们通常怎么做」，讲具体做法、周期、分工 */
  approach: string
}

/**
 * 场景自定义区的默认版式：只想写两段话的场景直接套它。
 *
 * 它是一个可选的便利组件，不是场景内容的统一渲染器——场景要放对比表、
 * 报价区间、流程图或客户问答时，直接在自己的 Section.tsx 里写，不必迁就这个版式。
 */
export const SceneIntro = ({ description, approach }: SceneIntroProps) => (
  <div className="mt-8 border-l-2 border-blue/40 pl-5">
    <p className="max-w-[34em] text-[15px] leading-[1.9] text-graphite-soft">{description}</p>
    <p className="mt-3 max-w-[34em] text-[14px] leading-[1.85] text-graphite-dim">
      <span className="text-graphite">通常怎么做：</span>
      {approach}
    </p>
  </div>
)
