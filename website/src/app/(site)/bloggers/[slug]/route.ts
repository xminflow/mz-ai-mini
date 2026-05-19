import { NextResponse } from 'next/server'

import { getWebsiteAuthState } from '@/features/auth/server/session'
import {
  BloggerInsightFetchError,
  fetchBloggerInsightDetail,
} from '@/services/blogger-insights'
import type { AuthState } from '@/features/auth/types'
import type { BloggerInsightDetail } from '@/types/blogger-insight'
import { bloggerPlatformLabel } from '@/types/blogger-insight'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ slug: string }>
}

// 博主洞察详情页直接返回 research-kit 生成的 HTML 报告，并把符合"运营实战"风格的顶部栏
// （返回主页 / 返回列表 / 登录状态）注入到原始 HTML 中，
// 让浏览器加载的就是带统一品牌导航的完整报告网页，不再被官网 layout 切成"嵌入式"视觉。
export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug } = await context.params
  let detail: BloggerInsightDetail
  try {
    detail = await fetchBloggerInsightDetail(slug)
  } catch (error) {
    if (error instanceof BloggerInsightFetchError && error.status === 404) {
      return new NextResponse(renderNotFound(slug), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }
    const message =
      error instanceof BloggerInsightFetchError
        ? error.message
        : '博主洞察服务暂时不可用'
    return new NextResponse(renderError(message), {
      status: 502,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const authState = await getWebsiteAuthState()
  const pathname = `/bloggers/${slug}`
  const enriched = injectTopBar(detail.report_html, {
    authState,
    loginNext: pathname,
    detail,
  })

  return new NextResponse(enriched, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
    },
  })
}

interface InjectContext {
  authState: AuthState
  loginNext: string
  detail: BloggerInsightDetail
}

function injectTopBar(html: string, ctx: InjectContext): string {
  const style = buildTopBarStyle()
  const nav = buildTopBarHtml(ctx)
  const withStyle = html.includes('</head>')
    ? html.replace('</head>', `${style}</head>`)
    : `${style}${html}`
  return injectAfterBodyOpen(withStyle, nav)
}

function injectAfterBodyOpen(html: string, fragment: string): string {
  const match = html.match(/<body\b[^>]*>/i)
  if (!match) return `${fragment}${html}`
  const insertAt = match.index! + match[0].length
  return `${html.slice(0, insertAt)}${fragment}${html.slice(insertAt)}`
}

function buildTopBarStyle(): string {
  return `<style id="wlx-topbar-style">
  .wlx-topbar{position:sticky;top:0;z-index:50;width:100%;border-bottom:1px solid rgba(255,255,255,0.10);background-color:rgba(5,5,7,0.82);backdrop-filter:saturate(140%) blur(18px);-webkit-backdrop-filter:saturate(140%) blur(18px);}
  .wlx-topbar__inner{max-width:1152px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 16px;height:56px;}
  @media (min-width:640px){.wlx-topbar__inner{padding:0 24px;height:64px;gap:20px;}}
  .wlx-topbar__left{display:flex;min-width:0;align-items:center;gap:12px;}
  @media (min-width:640px){.wlx-topbar__left{gap:18px;}}
  .wlx-topbar__right{display:flex;flex-shrink:0;align-items:center;gap:12px;}
  @media (min-width:640px){.wlx-topbar__right{gap:20px;}}
  .wlx-topbar__home{display:inline-flex;flex-shrink:0;align-items:center;gap:6px;border-radius:9999px;border:1px solid rgba(255,255,255,0.15);background-color:rgba(255,255,255,0.04);padding:6px 12px;font-size:12px;font-weight:500;color:#d6cfc4;text-decoration:none;transition:border-color .2s,background-color .2s,color .2s;font-family:'Alibaba PuHuiTi','PingFang SC','Microsoft YaHei',system-ui,sans-serif;}
  .wlx-topbar__home:hover{border-color:rgba(184,105,58,0.6);background-color:rgba(139,46,46,0.25);color:#fffdf7;}
  .wlx-topbar__home-arrow{display:inline-block;transition:transform .2s;}
  .wlx-topbar__home:hover .wlx-topbar__home-arrow{transform:translateX(-2px);}
  .wlx-topbar__title{font-family:'Alibaba PuHuiTi','PingFang SC','Microsoft YaHei',system-ui,sans-serif;font-weight:700;font-size:17px;color:#fffdf7;letter-spacing:0.08em;text-decoration:none;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:48vw;}
  .wlx-topbar__title:hover{color:#fffdf7;}
  .wlx-topbar__tag{display:none;flex-shrink:0;font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.24em;color:#b8aa96;}
  @media (min-width:640px){.wlx-topbar__tag{display:inline;}}
  .wlx-topbar__link{font-family:'JetBrains Mono',ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10px;text-transform:uppercase;letter-spacing:0.22em;color:#b8aa96;text-decoration:none;transition:color .2s;background:transparent;border:0;cursor:pointer;padding:0;}
  @media (min-width:640px){.wlx-topbar__link{font-size:11px;}}
  .wlx-topbar__link:hover{color:#fffdf7;}
  .wlx-topbar__account{display:flex;align-items:center;gap:10px;}
  .wlx-topbar__account-name{max-width:110px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .wlx-topbar__login{display:inline-flex;align-items:center;gap:6px;border-radius:9999px;border:1px solid rgba(255,255,255,0.15);background-color:rgba(255,255,255,0.04);padding:6px 12px;font-family:'Alibaba PuHuiTi','PingFang SC','Microsoft YaHei',system-ui,sans-serif;font-size:12px;font-weight:500;color:#d6cfc4;text-decoration:none;transition:border-color .2s,background-color .2s,color .2s;}
  .wlx-topbar__login:hover{border-color:rgba(184,105,58,0.6);background-color:rgba(139,46,46,0.25);color:#fffdf7;}
  .wlx-topbar__logout[disabled]{opacity:.5;cursor:default;}
</style>`
}

function buildTopBarHtml(ctx: InjectContext): string {
  const { authState, loginNext, detail } = ctx
  const loginHref = `/login?next=${encodeURIComponent(loginNext)}`
  const platformIndustry = [
    bloggerPlatformLabel(detail.platform),
    detail.industry,
  ]
    .filter(Boolean)
    .join(' · ')

  const accountLabel = authState.authenticated
    ? authState.account.email || authState.account.username || '已登录'
    : null

  const rightSide = accountLabel
    ? `<div class="wlx-topbar__account">
        <a class="wlx-topbar__link wlx-topbar__account-name" href="/account">${escapeHtml(accountLabel)}</a>
        <button type="button" class="wlx-topbar__link wlx-topbar__logout" data-wlx-logout>退出</button>
      </div>`
    : `<a class="wlx-topbar__login" href="${escapeAttr(loginHref)}">登录</a>`

  return `<nav class="wlx-topbar" role="navigation" aria-label="博主洞察导航">
    <div class="wlx-topbar__inner">
      <div class="wlx-topbar__left">
        <a class="wlx-topbar__home" href="/bloggers" aria-label="返回博主洞察列表">
          <span class="wlx-topbar__home-arrow" aria-hidden="true">←</span>返回博主洞察
        </a>
        <a class="wlx-topbar__title" href="/bloggers">微域生光博主洞察</a>
        ${platformIndustry ? `<span class="wlx-topbar__tag">${escapeHtml(platformIndustry)}</span>` : ''}
      </div>
      <div class="wlx-topbar__right">
        ${rightSide}
      </div>
    </div>
  </nav>
  <script>(function(){
    var btn=document.querySelector('[data-wlx-logout]');
    if(!btn)return;
    btn.addEventListener('click',function(){
      btn.disabled=true;btn.textContent='退出中';
      fetch('/api/auth/logout',{method:'POST',credentials:'same-origin'})
        .catch(function(){})
        .finally(function(){window.location.reload();});
    });
  })();</script>`
}

function renderNotFound(slug: string): string {
  const safeSlug = escapeHtml(slug)
  return wrapMinimalPage(
    '博主洞察未找到',
    `<h1>未找到博主洞察</h1>
     <p>没有找到 slug 为 <code>${safeSlug}</code> 的拆解报告。</p>
     <p><a href="/bloggers">← 返回博主洞察列表</a></p>`,
  )
}

function renderError(message: string): string {
  return wrapMinimalPage(
    '博主洞察加载失败',
    `<h1>博主洞察加载失败</h1>
     <p>${escapeHtml(message)}</p>
     <p><a href="/bloggers">← 返回博主洞察列表</a></p>`,
  )
}

function wrapMinimalPage(title: string, body: string): string {
  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<style>
:root { color-scheme: dark; }
html,body{margin:0;background:#050507;color:#F5F5F7;font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;}
main{max-width:560px;margin:18vh auto;padding:0 24px;line-height:1.85;}
h1{font-size:22px;font-weight:600;margin-bottom:18px;color:#fffdf7;letter-spacing:0.06em;}
a{color:#b8693a;text-decoration:none;border-bottom:1px dotted rgba(255,255,255,0.2);}
a:hover{color:#fffdf7;}
code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;background:rgba(255,255,255,0.06);padding:2px 6px;border-radius:4px;}
</style>
</head>
<body><main>${body}</main></body>
</html>`
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;'
      case '<':
        return '&lt;'
      case '>':
        return '&gt;'
      case '"':
        return '&quot;'
      case "'":
        return '&#39;'
      default:
        return char
    }
  })
}

function escapeAttr(value: string): string {
  return escapeHtml(value)
}
