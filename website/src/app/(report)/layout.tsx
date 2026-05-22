// (report) 路由组：用于「全屏报告型」详情页（如 /library/tracks/[slug]），
// 故意不引入 (site) 的全局 TopNav / SiteFooter——详情页内部自带顶部栏与导航，
// 渲染 HTML 报告时也需要把整屏让给内容，避免双顶栏。
// 与 (site)/bloggers/[slug]/route.ts 的「绕过布局」效果一致，
// 但这里是 React 页面，所以通过 route group 切层。
//
// 额外覆盖：globals.css 在 <body> 上挂了三层 radial-gradient + background-attachment: fixed，
// 滚动时会随视口浮动；报告型详情页本身就是深色画布，再叠极光会让正文背景出现"滚动渐变"的错觉。
// 这里给 <body> 单独清掉 background-image，保留纯净的 canvas 色，确保报告 HTML 视觉接管整页。

const RESET_BODY_BG = `
body { background-image: none !important; }
`

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: RESET_BODY_BG }} />
      {children}
    </>
  )
}
