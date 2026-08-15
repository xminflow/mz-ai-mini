import { SceneContact } from '../../gallery/SceneContact'

export default function OtherSection() {
  return (
    <div className="mt-8 border-l-2 border-blue/40 pl-5">
      <p className="max-w-[34em] text-[15px] leading-[1.9] text-graphite-soft">
        上面列的是我们做得最多的几类项目，但软件定制没法被十几个名字穷尽——
        监控运维平台、内部数据工具、行业专用系统这类需求同样常见，只是不好归到某一类里。
        你要做的东西如果不在上面，说说你想解决的问题，我们判断能不能做、怎么做最省。
      </p>
      <SceneContact />
    </div>
  )
}
