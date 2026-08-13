'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type LightContactModalProps = {
  open: boolean
  onClose: () => void
}

// 浅色版咨询弹窗。深色版 ContactQrCodeModal.tsx 原样保留供旧页面恢复时使用，
// 这里不复用它是因为它整体按深色 token 着色，在浅色页面上会弹出一个黑色面板。
export const LightContactModal = ({ open, onClose }: LightContactModalProps) => {
  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="contact-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-graphite/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="contact-panel"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            // 容器不接收指针事件、面板本体接收：点击面板外的空白可穿透到下层遮罩触发关闭
            className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            {/* 用最厚的一档：这块面板压着整页内容，薄玻璃会让下面的文字透上来干扰阅读。
                注意二维码容器仍是实心白（下方 bg-white），不要跟着改半透——
                半透背景会降低扫码识别率 */}
            <div className="glass-thick pointer-events-auto relative w-full max-w-sm rounded-card p-6">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-btn border border-rule text-graphite-dim transition-colors hover:text-graphite"
                aria-label="关闭"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                </svg>
              </button>

              <h2 className="text-center text-[17px] font-semibold text-graphite">联系我们</h2>

              <div className="mx-auto mt-5 flex h-72 w-72 items-center justify-center overflow-hidden rounded-btn border border-rule bg-white p-2">
                <img
                  src="/contact.jpg"
                  alt="微信联系人二维码"
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>

              <p className="mt-4 text-center text-[12px] text-graphite-dim">
                打开微信扫一扫，添加联系人
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
