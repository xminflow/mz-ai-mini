type AuroraVariant = 'home' | 'simple'

type AuroraFieldProps = {
  /** home 铺三条帘幕；simple 只铺一条，给案例页这类短页面用 */
  variant?: AuroraVariant
}

/**
 * 光域层：浅色站点唯一的背景光来源。
 *
 * 它存在的理由不是装饰，是给毛玻璃提供采样对象。实测过：底色是一整块平米白时，
 * 给卡片加 backdrop-filter 是零效果——玻璃只搬运背后的信息，背后没信息就什么都
 * 不发生。所以这一层一旦被移除或调淡到看不见，全站的玻璃质感会同时消失，
 * 两者是一套东西的两半。
 *
 * ===== 形态：极光帘幕 =====
 *
 * 走到这一版之前推翻过三次，教训都记在这里免得再来一遍：
 *
 * 一、几团独立的圆斑。孤立的模糊圆斑读起来是水彩晕染，气质偏软，与科技产品要的
 *     利落感相反。
 *
 * 二、超大渐变铺满整页。形态问题解决了，却带来更糟的结果：覆盖连续与大面积着色是
 *     同一件事的两面，中段一整片粉、下段一整片米黄，比第一版更脏。
 *
 * 三、单层柔光带。位置和留白都对了，但整条带被 blur 糊成均匀的一坨，
 *     丢掉了极光最要命的两个特征——**纵向光柱**和**下缘锐利、上缘渐隐的不对称**。
 *     没有这两样，它只是一条模糊的色条，不是极光。
 *
 * 所以现在每条帘幕由两层构成：
 *
 *   带体（Sheet）——柔和的纵向渐变，负责整体色彩，也是玻璃真正采样的那一层。
 *                   色标刻意不对称：下缘收得紧、上缘拖得长，模拟极光底边亮、顶部散开。
 *   光柱（Rays）——细密的垂直纹理，用 mask 裁进带体的形状里，blur 给得很小以保住边界。
 *                   它单独以更快的速度横向流动，光才像在幕内淌而不是印在幕上。
 *
 * 硬约束：
 *
 * 1. **元素要矮而宽，带体渐变沿纵向走。** 这条最容易搞反，搞反了整个效果就废：
 *    曾经写成 104deg 的斜向渐变套在一个高 900px 的矩形上，渐变沿水平变化、纵向均匀，
 *    整块被染成一片大色面。倾角交给 transform 的 rotate，不要交给渐变角度。
 *
 * 2. 带必须显著宽于视口（这里 200vw）。宽度不够时旋转后两端会露进屏幕，
 *    光带变回一条有头有尾的色块。
 *
 * 3. 带与带之间要留出没有光的间隙。首屏、板块留白、页脚保持米白纸面的干净，
 *    光只出现在玻璃卡真正需要它的区段——「铺满整页」是第二版失败的原因。
 *
 * 4. 带的位置要对准玻璃卡。玻璃卡滚到没有光的位置时 backdrop-filter 会失效，
 *    卡片突然变成平板一块——曾在页面 25% 处留下一段色度为 0 的空档。
 *
 * 5. 光柱必须比带体清晰。带体可以糊（它只提供色彩），光柱不能——它是「有质感、
 *    有边界」的唯一来源，blur 超过 12px 就重新糊成一片，这一版也就白改了。
 *
 * 定位用 absolute 而不是 fixed：光要跟着页面一起滚。fixed 会让光停在视口上，
 * 滚动时透出什么色相由滚动位置决定，玻璃卡的采样对象也就不可预期了。
 */

/** 三条帘幕各自的周期。互质，避免整体构图周期性归位 */
const DURATION = { a: '34s', b: '41s', c: '47s' } as const

/**
 * 带体底色：纵向三段渐变，下缘收得紧、上缘拖得长。
 *
 * 固定 180deg（自上而下）。带的倾角由 transform 的 rotate 负责，不要写进这里——
 * 用渐变角度做倾斜会同时改变渐变的变化方向，带就散成一整块色面了。
 */
const sheet = (color: string) =>
  `linear-gradient(180deg, transparent 0%, ${color} 62%, ${color} 82%, transparent 100%)`

/**
 * 光柱纹理：不等间距的垂直细纹。
 *
 * 间距刻意取 7 / 11 / 19 三种宽度交替而不是均匀重复——真实极光的光柱疏密不均，
 * 等距重复会立刻读成人造的条纹图案（像百叶窗），而不是自然光。
 *
 * 89deg 而非 90deg：让光柱本身也带一点点斜，与带体的 rotate 叠加后不会显得死板。
 */
const rays = (color: string) =>
  `repeating-linear-gradient(89deg, ${color} 0 1.5px, transparent 1.5px 7px, ${color} 7px 8px, transparent 8px 19px)`

/** 光柱只在带体的中段显现，上下两端淡出，避免出现横平的截断边 */
const RAYS_MASK = 'linear-gradient(180deg, transparent 4%, #000 46%, #000 76%, transparent 100%)'

type CurtainProps = {
  className: string
  duration: string
  /** 带体色，含 alpha */
  sheetColor: string
  /** 光柱色，比带体浓一档——面积小，同 alpha 下几乎看不见 */
  rayColor: string
  sheetBlur: number
  animation: string
}

const Curtain = ({
  className,
  duration,
  sheetColor,
  rayColor,
  sheetBlur,
  animation,
}: CurtainProps) => (
  // 动画只能写在内联 style 里：帧名是参数传进来的，写成 animate-[${animation}] 这种
  // 模板字符串 Tailwind 扫描不到、根本不会生成对应的类。
  // 代价是 motion-safe: 前缀也用不了，因此降级改由 globals.css 里针对 [data-aurora]
  // 的 prefers-reduced-motion 规则统一兜住——少了那条规则，减少动态偏好下背景照样在飘。
  <div
    data-aurora
    className={`absolute left-[-50%] w-[200vw] ${className}`}
    style={{
      animation: `${animation} ${duration} ease-in-out infinite`,
      willChange: 'transform',
    }}
  >
    {/* 带体：糊一点没关系，它负责色彩与玻璃采样 */}
    <div
      className="absolute inset-0"
      style={{ background: sheet(sheetColor), filter: `blur(${sheetBlur}px)` }}
    />
    {/* 光柱：blur 压到 8px 以内保住边界，单独更快地横向流动 */}
    <div
      data-aurora
      className="absolute inset-0"
      style={{
        background: rays(rayColor),
        WebkitMaskImage: RAYS_MASK,
        maskImage: RAYS_MASK,
        filter: 'blur(7px)',
        animation: 'auroraRays 19s ease-in-out infinite',
        willChange: 'transform',
      }}
    />
  </div>
)

export const AuroraField = ({ variant = 'simple' }: AuroraFieldProps) => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
  >
    {/* 主帘·蓝。压在服务轮播区——全页玻璃卡最密集、最需要有东西可透的地方。
        上缘越过板块顶边，顺带兜住紧贴上方的能力条：那个玻璃胶囊若背后全无光，
        会退化成一块半透明白。
        案例页没有轮播区，这条帘整体上移去托住正文卡片。 */}
    <Curtain
      className={variant === 'home' ? 'top-[29%] h-[210px]' : 'top-[21%] h-[240px]'}
      duration={DURATION.a}
      animation="auroraBandA"
      sheetColor="rgb(15 95 216 / 0.34)"
      rayColor="rgb(15 95 216 / 0.30)"
      sheetBlur={38}
    />

    {variant === 'home' && (
      <>
        {/* 副帘·黄。掠过服务区下缘，与蓝帘边缘交叠出暖调过渡，让这一段不是单一支蓝。
            alpha 相对最低：黄的感知亮度远高于蓝红，同样 alpha 下显色强得多，
            压不住就会把经过的玻璃卡染成旧纸黄（这一条实测踩过）。 */}
        <Curtain
          className="top-[44%] h-[170px]"
          duration={DURATION.c}
          animation="auroraBandC"
          sheetColor="rgb(232 178 28 / 0.20)"
          rayColor="rgb(232 178 28 / 0.20)"
          sheetBlur={42}
        />

        {/* 主帘·红。掠过流程区，那七张 Acrylic 卡靠它提供采样对象。
            alpha 压在 0.24：红透过浅玻璃会让卡片偏粉，比黄更容易脏。 */}
        <Curtain
          className="top-[67%] h-[200px]"
          duration={DURATION.b}
          animation="auroraBandB"
          sheetColor="rgb(200 32 44 / 0.24)"
          rayColor="rgb(200 32 44 / 0.22)"
          sheetBlur={40}
        />
      </>
    )}
  </div>
)
