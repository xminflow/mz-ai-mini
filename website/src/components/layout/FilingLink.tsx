const ICP_NUMBER = '鄂ICP备2026022946号'
const ICP_URL = 'https://beian.miit.gov.cn/'

export function FilingLink({ className }: { className?: string }) {
  return <a href={ICP_URL} target="_blank" rel="noopener noreferrer" className={className} lang="zh-CN">
    {ICP_NUMBER}
  </a>
}
