// Hero 背景装饰层：极淡的暖色径向渐变 + 大模糊，纯装饰不接收指针事件。
// 刻意不使用卡片或容器——首屏靠留白撑场，不靠方块结构。
//
// 两个约束：
// 1. 只用同色系的橙，不混琥珀/黄——两种暖色叠在一起会在交界处泛出偏绿的脏色。
// 2. 斑块尺寸必须随断点收窄。固定 px 宽度在窄屏上会让渐变的密集中心铺满整屏，
//    暖光变成一层粉色蒙版；移动端只保留顶部一小块，第二块直接隐藏。
export const WarmGlow = () => (
  <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
    <div className="absolute left-1/2 top-[-14%] h-[240px] w-[130vw] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(255_60_0/0.07),transparent_60%)] blur-[70px] sm:top-[-24%] sm:h-[520px] sm:w-[1100px] sm:bg-[radial-gradient(ellipse_at_center,rgb(255_60_0/0.08),transparent_62%)] sm:blur-[80px]" />
    <div className="absolute left-1/2 top-[34%] hidden h-[300px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgb(255_138_76/0.06),transparent_66%)] blur-[90px] sm:block" />
  </div>
)
