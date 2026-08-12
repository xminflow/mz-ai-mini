type AuroraVariant = 'home' | 'simple'

type AuroraFieldProps = {
  /** home 铺四团光对应首页四个板块；simple 只留首屏一团，给案例页这类短页面用 */
  variant?: AuroraVariant
}

/**
 * 光域层：浅色站点唯一的背景光来源，取代原先只覆盖首屏的那层暖光晕。
 *
 * 它存在的理由不是装饰，是给毛玻璃提供采样对象。实测过：底色是一整块平米白时，
 * 给卡片加 backdrop-filter 是零效果——玻璃只搬运背后的信息，背后没信息就什么都
 * 不发生。所以这一层一旦被移除或调淡到看不见，全站的玻璃质感会同时消失，
 * 两者是一套东西的两半。
 *
 * 三条硬约束：
 *
 * 1. 光团不压在大标题正下方。首屏那团的中心刻意推到容器上边缘之外，标题所在的
 *    横带上只剩余光，正文对比度不受影响。
 *
 * 2. 不同色相的光团之间必须退到接近 0。相邻色相在交界处叠加会泛出脏色——
 *    这条是之前踩过的：暖橙与琥珀两种暖色叠在一起，会在交界处泛出偏绿的脏色。
 *    这里橙、蓝、紫三团的纵向间距都在 22% 页高以上，配合 68% 的透明落点，交界处已经归零。
 *
 * 3. 尺寸随断点收窄。固定 px 宽度在窄屏上会让渐变的密集中心铺满整屏，柔光变成
 *    一层色蒙版。窄屏只保留首屏和服务区两团：首屏团尺寸减半；服务区团窄屏反而要
 *    略放大以盖住卡片，原因见该团内联注释。
 *
 * 定位用 absolute 而不是 fixed：光要跟着页面一起滚，光团与板块的对应关系才是
 * 固定可控的。fixed 会让光停在视口上，不同板块滚过去时透出什么色相由滚动位置
 * 决定，无法预期。
 *
 * 纵向位置按页高百分比给出，锚点取自首页实测：
 * 首屏 65–625、能力条 625–784、服务 784–1674、流程 1674–2526、页脚 2526–2690。
 * 这组锚点是桌面端（页高 2690）的实测值。窄屏只渲染首屏与服务区两团（点 3），
 * 流程、页脚两团整段隐藏，不需要窄屏锚点；首屏那团窄屏沿用同一份百分比即可，
 * 唯独服务区——窄屏各板块堆叠后页高涨到 3673，服务区中心落到页高的 28.1%，
 * 与桌面端 45.7% 差得远——是全部光团里唯一按两个断点分别给一次纵向锚点的一团。
 */
export const AuroraField = ({ variant = 'simple' }: AuroraFieldProps) => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    {/* 首屏：暖橙。中心推到 -6%，标题横带上只有余光。
        窄屏的纵向锚点用 px 而不是 %：这团贴着页顶，而 % 是相对整页高度的——窄屏页高涨到 3673
        之后，-6% 会把它推到 -220px，配上窄屏本就减半的高度，光就打不到标题区了。 */}
    <div
      className="absolute left-[18%] top-[-40px] h-[320px] w-[86vw] -translate-x-1/2 rounded-full blur-[60px] sm:top-[-6%] sm:h-[560px] sm:w-[900px] sm:blur-[80px]"
      style={{
        background:
          'radial-gradient(ellipse at center, rgb(255 88 36 / 0.26), transparent 68%)',
      }}
    />

    {variant === 'home' && (
      <>
        {/* 服务轮播区：冷蓝。玻璃卡的主要采样对象，是全页最需要有东西可透的地方。
            纵向锚点两个断点各给一次，不能只给一个值：光团位置按页高百分比定位，而两个断点下
            服务区占页高的比例差得很远——桌面端页高 2690、服务区中心在 45.7%；窄屏各板块堆叠后
            页高涨到 3673、服务区中心落到 28.1%。只写 top-[38%] 的话，窄屏上这团光会掉到
            服务区下缘之外，卡片上一点色都透不到（实测过）。
            窄屏的高度也要跟着放大：服务区在窄屏有 750px 高，360px 的光团盖不住卡片所在的下半段。
            纵向锚点的断点是 lg 而不是 sm：页高的突变点由 ServiceFlow 决定——它的桌面手风琴是
            hidden lg:flex、纵向列表是 lg:hidden，板块高度在 1024 处才剧变。实测 901px 宽时页高 3586、
            服务区 722–1591，仍然接近窄屏形态。切在 sm 会让 640–1023 这一整段的光掉到板块之外。 */}
        <div
          className="absolute left-[56%] top-[28%] h-[560px] w-[92vw] -translate-x-1/2 rounded-full blur-[60px] sm:w-[1000px] sm:blur-[90px] lg:top-[38%] lg:h-[620px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgb(30 120 240 / 0.34), transparent 68%)',
          }}
        />

        {/* 流程区：淡紫。强度压到最低，这一区主体是近黑面板，光只负责让四周不死板 */}
        <div
          className="absolute left-[22%] top-[68%] hidden h-[520px] w-[820px] -translate-x-1/2 rounded-full blur-[90px] sm:block"
          style={{
            background:
              'radial-gradient(ellipse at center, rgb(150 105 240 / 0.16), transparent 70%)',
          }}
        />

        {/* 页脚：暖橙回归，与首屏呼应收尾 */}
        <div
          className="absolute left-[74%] top-[92%] hidden h-[420px] w-[760px] -translate-x-1/2 rounded-full blur-[80px] sm:block"
          style={{
            background:
              'radial-gradient(ellipse at center, rgb(255 88 36 / 0.18), transparent 70%)',
          }}
        />
      </>
    )}
  </div>
)
