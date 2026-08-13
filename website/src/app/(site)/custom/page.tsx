import { redirect } from 'next/navigation'

// 软件定制已迁至首页 /，旧路由 /custom 永久重定向到首页，避免重复内容与失效外链。
export default function CustomSoftwarePage() {
  redirect('/')
}
