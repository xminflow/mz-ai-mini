import { redirect } from 'next/navigation'

// 兼容已有个人信息链接，统一回到主站打开弹窗，不再维护独立设置页面。
export default function AccountPage() {
  redirect('/?settings=profile')
}
