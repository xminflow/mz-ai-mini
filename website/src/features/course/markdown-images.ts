// 把内容 Markdown 里的图片引用解析成站点可访问的绝对路径 /<contentDir>/<chapterId>/...
//
// 支持两种写法，覆盖 Typora / Obsidian 的常见粘贴习惯：
//  1) 维基嵌入 ![[文件名]]（可带 |别名/尺寸）——图片默认存在该章节的 Attachments/ 子目录
//  2) 标准 Markdown 图片 ![alt](相对路径)——把相对路径补成站点绝对路径
//
// 之所以在渲染前做字符串改写：react-markdown 不认 ![[...]] 语法，相对路径也无法直接映射到
// public/ 下的实际文件；统一改写成 /<contentDir>/<chapterId>/... 后，浏览器即可正常请求到图片。
export function resolveCourseImages(
  content: string,
  chapterId: string,
  contentDir: string,
): string {
  const base = `/${contentDir}/${chapterId}`

  // 1) ![[file]] / ![[file|alias]] -> ![file](/courses/<chapterId>/Attachments/<file>)
  let out = content.replace(/!\[\[([^\]|]+?)(?:\|[^\]]*)?\]\]/g, (_match, raw: string) => {
    const file = raw.trim()
    return `![${file}](${base}/Attachments/${encodeURI(file)})`
  })

  // 2) 标准图片的相对路径补全；跳过已是绝对路径 / 外链 / data: / 锚点的情况
  out = out.replace(/(!\[[^\]]*\]\()([^)]+)(\))/g, (match, pre: string, url: string, post: string) => {
    const u = url.trim()
    if (/^(https?:)?\/\//i.test(u) || u.startsWith('/') || u.startsWith('data:') || u.startsWith('#')) {
      return match
    }
    const cleaned = u.replace(/^\.\//, '')
    return `${pre}${base}/${encodeURI(cleaned)}${post}`
  })

  return out
}
