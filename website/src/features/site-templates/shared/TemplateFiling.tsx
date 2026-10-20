/** 模板演示统一使用占位备案号，与官网真实备案信息分离。 */
export function TemplateFiling({ className }: { className?: string }) {
  return <span className={className} lang="zh-CN" data-template-filing>示例ICP备00000000号</span>
}
