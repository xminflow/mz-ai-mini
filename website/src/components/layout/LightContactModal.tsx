'use client'

import { useSiteLocale } from '@/features/site-i18n/SiteLocaleProvider'
import { useEffect, useId, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type LightContactModalProps = {
  open: boolean
  onClose: () => void
  content?: {
    title: string
    imageSrc: string
    imageAlt: string
    imageWidth: number
    imageHeight: number
    hint: string
    notice?: string
    portrait?: boolean
  }
}

// 浅色版咨询弹窗。深色版 ContactQrCodeModal.tsx 原样保留供旧页面恢复时使用，
// 这里不复用它是因为它整体按深色 token 着色，在浅色页面上会弹出一个黑色面板。
export const LightContactModal = ({ open, onClose, content }: LightContactModalProps) => {
  const { copy } = useSiteLocale()
  const headingId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const qr = content ?? {
    title: copy.contact,
    imageSrc: '/contact.jpg',
    imageAlt: copy.qrAlt,
    imageWidth: 288,
    imageHeight: 288,
    hint: copy.qrHint,
    portrait: false,
    notice: undefined,
  }

  useEffect(() => {
    if (!open) return
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
      // 对话框内循环键盘焦点；关闭后返回触发入口，避免焦点落到遮罩后方。
      if (event.key === 'Tab') {
        const controls = panelRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href]')
        if (!controls?.length) return
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first.focus()
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = previousOverflow
      trigger?.focus({ preventScroll: true })
    }
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
            <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={headingId} className="glass-thick pointer-events-auto relative max-h-[calc(100svh-2rem)] w-full max-w-sm overflow-y-auto rounded-card p-6">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-btn border border-rule text-graphite-dim transition-colors hover:text-graphite"
                aria-label={copy.close}
              >
                <svg viewBox="0 0 16 16" fill="currentColor" className="h-3.5 w-3.5">
                  <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
                </svg>
              </button>

              <h2 id={headingId} className="text-center text-[17px] font-semibold text-graphite">{qr.title}</h2>

              <a
                href={qr.imageSrc}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={copy.viewQrImage}
                className={`mx-auto mt-5 flex max-w-full items-center justify-center overflow-hidden border border-rule bg-white focus-visible:outline-2 focus-visible:outline-blue ${qr.portrait ? 'w-fit rounded-xl' : 'aspect-square w-72 rounded-btn p-2'}`}
              >
                <img
                  src={qr.imageSrc}
                  alt={qr.imageAlt}
                  width={qr.imageWidth}
                  height={qr.imageHeight}
                  className={qr.portrait ? 'max-h-[55svh] w-auto max-w-full object-contain' : 'h-full w-full object-contain'}
                />
              </a>

              <p className="mt-4 text-center text-[12px] text-graphite-dim">
                {qr.hint}
              </p>
              {qr.notice && <p className="mt-2 text-center text-[11px] text-graphite-dim">{qr.notice}</p>}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
