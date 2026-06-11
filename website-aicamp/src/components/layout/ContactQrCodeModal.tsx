'use client'

import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

interface ContactQrCodeModalProps {
  open: boolean
  onClose: () => void
}

export const ContactQrCodeModal = ({ open, onClose }: ContactQrCodeModalProps) => {
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
            className="fixed inset-0 z-40 bg-canvas/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="contact-panel"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative w-full max-w-sm rounded-2xl border border-hairline bg-surface p-6 shadow-xl">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-surface/80 text-muted transition-colors hover:text-ink"
                aria-label="关闭"
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                </svg>
              </button>

              <h2 className="text-center text-lg font-semibold text-ink">联系我们</h2>

              <div className="mx-auto mt-5 flex h-72 w-72 items-center justify-center overflow-hidden rounded-xl border border-hairline bg-white p-2">
                <img
                  src="/contact.jpg"
                  alt="微信联系人二维码"
                  className="h-full w-full object-contain"
                  loading="lazy"
                />
              </div>

              <p className="mt-4 text-center text-xs text-muted">
                打开微信扫一扫，添加联系人
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
