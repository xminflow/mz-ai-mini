// CSS 文件作为副作用导入的类型声明（Next.js App Router 根布局 globals.css 所需）
declare module '*.css' {
  const content: Record<string, string>
  export default content
}
