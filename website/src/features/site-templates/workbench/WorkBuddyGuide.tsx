'use client'

import { useState, type MouseEvent } from 'react'
import { buttonClassName } from '@/components/ui'

interface WorkBuddyGuideProps {
  templateName: string
  gitUrl?: string
}

/** 所有模板详情共用教程；工作目录和启动命令由实际工程的规则决定。 */
export function WorkBuddyGuide({ templateName, gitUrl }: WorkBuddyGuideProps) {
  const [copyStatus, setCopyStatus] = useState('')
  const prompt = gitUrl ? `使用 ${gitUrl}，按照项目要求启动工程，并给我实际访问地址。` : ''

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt)
      setCopyStatus('已复制，可以粘贴到 WorkBuddy 中。')
    } catch {
      setCopyStatus('未能自动复制，请选中下方提示词并手动复制。')
    }
  }

  function toggleGuide(event: MouseEvent<HTMLElement>) {
    const details = event.currentTarget.closest<HTMLDetailsElement>('details')
    const content = details?.querySelector<HTMLElement>('.market-workbuddy-content')
    if (!details || !content) return
    event.preventDefault()
    content.getAnimations().forEach(animation => animation.cancel())
    details.open = !details.open
    if (details.open && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // 在点击的同一帧设置初始态，避免 toggle 事件延后触发时先显示内容再淡入。
      content.animate(
        [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
        { duration: 300, easing: 'cubic-bezier(.2, .7, .3, 1)', fill: 'backwards' },
      )
    }
  }

  return <details className="market-workbuddy-guide">
    <summary className="market-workbuddy-trigger" onClick={toggleGuide}>
      <span className="market-workbuddy-ai" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none"><path d="m8 1 1.8 4.9L15 8l-5.2 2.1L8 15l-1.8-4.9L1 8l5.2-2.1L8 1Z" fill="currentColor" /></svg></span>
      <span>如何在 WorkBuddy 中使用</span>
      <span className="market-workbuddy-trigger-mark" aria-hidden="true" />
    </summary>
    <div className="market-workbuddy-content">
      <section className="market-workbuddy-prompt" aria-label="提示词">
        <div className="market-workbuddy-prompt-header"><h2>提示词</h2><button type="button" onClick={copyPrompt} disabled={!gitUrl} aria-label={`复制${templateName}的提示词`} className={buttonClassName('secondary', 'market-secondary')}>复制提示词</button></div>
        <p className="market-workbuddy-hint">{gitUrl ? '复制后发给 WorkBuddy，按它返回的地址打开预览。' : '该模板尚未配置 Git 地址，补充后即可复制使用。'}</p>
        {gitUrl && <pre tabIndex={0} aria-label="WorkBuddy 启动提示词">{prompt}</pre>}
        <p role="status" aria-live="polite" className="market-workbuddy-copy-status">{copyStatus}</p>
      </section>
      <section className="market-workbuddy-edit" aria-label="如何修改">
        <h2>如何修改</h2>
        <p>在同一个对话里，直接说出你的想法，例如：</p>
        <ul><li>“品牌改成山间设计，主色改成森林绿。”</li><li>“去掉首页报价模块，换上我提供的作品图片。”</li></ul>
      </section>
    </div>
  </details>
}
