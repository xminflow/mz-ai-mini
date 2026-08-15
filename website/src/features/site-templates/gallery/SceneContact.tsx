'use client'

import { useContact } from '@/components/layout/contact-context'
import { Button } from '@/components/ui'

/**
 * 单独拆成客户端组件，只为拿 useContact 这一个 hook。
 * 案例页与场景页本身保持服务端组件，不为一个按钮把整页降级成客户端渲染。
 */
export function SceneContact({ label = '说说你的业务' }: { label?: string }) {
  const { openContact } = useContact()

  return (
    <div className="mt-10">
      <Button onClick={openContact}>{label}</Button>
    </div>
  )
}
