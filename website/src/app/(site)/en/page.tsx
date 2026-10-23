import { redirect } from 'next/navigation'

// 原英文软件定制首页暂时隐藏；完整入口保存在 home/hidden-routes/en.tsx。
export default function EnglishHomePage() {
  redirect('/')
}
