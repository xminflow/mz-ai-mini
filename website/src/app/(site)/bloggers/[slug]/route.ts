import { NextResponse } from 'next/server'

import { readAuthCookies } from '@/features/auth/server/cookies'
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

// 博主洞察详情页：拿到后端返回的完整 HTML 报告，把顶部导航 sticky 注入到 body
// 头部后返回。不再走 iframe + COS——HTML 直接由 weelume 主域服务，移动端和
// 微信 WebView 均可 inline 渲染。
export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug } = await context.params
  const pathname = `/bloggers/${slug}`

  // 先获取 auth 状态和 access token，确保 cookie 已刷新后再读取 token。
  const authState = await getWebsiteAuthState()
  const cookies = await readAuthCookies()
  const accessToken = authState.authenticated ? (cookies.accessToken ?? undefined) : undefined

  let detail: BloggerInsightDetail
  try {
    detail = await fetchBloggerInsightDetail(slug, accessToken)
  } catch (error) {
    if (error instanceof BloggerInsightFetchError) {
      if (error.status === 404) {
        return new NextResponse(renderNotFound(slug), {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        })
      }
      if (error.status === 401) {
        // 未登录用户访问付费内容，跳转到登录页
        return NextResponse.redirect(
          new URL(`/login?next=${encodeURIComponent(pathname)}`, _request.url),
        )
      }
      if (error.status === 403) {
        // 已登录但无有效会员，展示付费墙
        const html = renderBloggerPaywall({
          slug,
          details: error.details,
          authState,
          loginNext: pathname,
        })
        return new NextResponse(html, {
          status: 200,
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
            'Cache-Control': 'private, no-store',
          },
        })
      }
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

  const html = injectTopBar(detail.report_html, {
    authState,
    loginNext: pathname,
    detail,
  })

  return new NextResponse(html, {
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

// 把顶部导航 style 注入到 </head> 之前，nav HTML 注入到 <body> 开标签之后。
// nav 用 position:sticky 占流，自然把报告内容推下 56-64px，无需手动 padding。
function injectTopBar(reportHtml: string, ctx: InjectContext): string {
  const style = buildTopBarStyle()
  const nav = buildTopBarHtml(ctx)
  let result = reportHtml
  if (/<\/head>/i.test(result)) {
    result = result.replace(/<\/head>/i, `${style}\n</head>`)
  } else {
    // 极少数报告 HTML 没有 </head>，兜底直接前置 style + nav。
    return `${style}\n${nav}\n${reportHtml}`
  }
  if (/<body(\s[^>]*)?>/i.test(result)) {
    result = result.replace(/<body(\s[^>]*)?>/i, (match) => `${match}\n${nav}`)
  } else {
    result = `${result}\n${nav}`
  }
  return result
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

interface BoggerPaywallContext {
  slug: string
  details: Record<string, unknown> | null
  authState: AuthState
  loginNext: string
}

function renderBloggerPaywall(ctx: BoggerPaywallContext): string {
  const { slug, details, authState, loginNext } = ctx
  const displayName =
    typeof details?.display_name === 'string' ? details.display_name : slug
  const avatarUrl =
    typeof details?.avatar_url === 'string' ? details.avatar_url : null
  const platform =
    typeof details?.platform === 'string' ? bloggerPlatformLabel(details.platform) : null
  const industry =
    typeof details?.industry === 'string' ? details.industry : null
  const positioning =
    typeof details?.positioning === 'string' ? details.positioning : null

  const accountLabel = authState.authenticated
    ? authState.account.email || authState.account.username || '已登录'
    : null

  const metaLine = [platform, industry].filter(Boolean).join(' · ')

  const avatarHtml = avatarUrl
    ? `<img src="${escapeAttr(avatarUrl)}" alt="${escapeHtml(displayName)} 头像" referrerpolicy="no-referrer" style="width:72px;height:72px;border-radius:50%;border:1px solid rgba(255,255,255,0.12);object-fit:cover;flex-shrink:0;" />`
    : `<div style="width:72px;height:72px;border-radius:50%;border:1px solid rgba(255,255,255,0.12);background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:700;color:#fffdf7;flex-shrink:0;">${escapeHtml(displayName.charAt(0) || '·')}</div>`

  const loginHref = `/login?next=${encodeURIComponent(loginNext)}`
  const rightSide = accountLabel
    ? `<span style="font-size:12px;color:#b8aa96;">${escapeHtml(accountLabel)}</span>`
    : `<a href="${escapeAttr(loginHref)}" style="display:inline-flex;align-items:center;gap:6px;border-radius:9999px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.04);padding:6px 12px;font-size:12px;font-weight:500;color:#d6cfc4;text-decoration:none;">登录</a>`

  return `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(displayName)} · 博主洞察</title>
<style>
:root{color-scheme:dark;}
*,*::before,*::after{box-sizing:border-box;}
html,body{margin:0;background:#050507;color:#e8e1d9;font-family:"PingFang SC","Microsoft YaHei",system-ui,sans-serif;}
.topbar{position:sticky;top:0;z-index:50;width:100%;border-bottom:1px solid rgba(255,255,255,0.10);background:rgba(5,5,7,0.82);backdrop-filter:saturate(140%) blur(18px);}
.topbar__inner{max-width:1152px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:0 16px;height:56px;}
@media(min-width:640px){.topbar__inner{padding:0 24px;height:64px;}}
.topbar__back{display:inline-flex;align-items:center;gap:6px;border-radius:9999px;border:1px solid rgba(255,255,255,0.15);background:rgba(255,255,255,0.04);padding:6px 12px;font-size:12px;font-weight:500;color:#d6cfc4;text-decoration:none;}
.paywall{max-width:640px;margin:80px auto 40px;padding:0 20px;}
@media(min-width:640px){.paywall{padding:0 32px;margin-top:100px;}}
.paywall__header{display:flex;align-items:center;gap:20px;margin-bottom:28px;}
.paywall__name{font-size:22px;font-weight:700;color:#fffdf7;margin:0 0 4px;}
.paywall__meta{font-size:13px;color:#b8aa96;}
.paywall__positioning{font-size:14px;line-height:1.85;color:#b8aa96;margin-bottom:28px;padding:16px 20px;border-radius:12px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.03);}
.paywall__preview{position:relative;border-radius:16px;border:1px solid rgba(255,255,255,0.08);background:rgba(255,255,255,0.02);padding:28px;margin-bottom:28px;overflow:hidden;}
.paywall__preview-content{filter:blur(6px);opacity:0.4;user-select:none;pointer-events:none;font-size:14px;line-height:2;color:#e8e1d9;}
.paywall__preview-content p{margin:0 0 12px;}
.paywall__lock{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:linear-gradient(to bottom,transparent,rgba(5,5,7,0.7) 60%);}
.paywall__lock-text{font-size:14px;color:#b8aa96;text-align:center;}
.paywall__cta{display:block;width:100%;padding:15px 0;border-radius:12px;background:linear-gradient(135deg,rgba(184,105,58,0.9),rgba(139,46,46,0.85));border:1px solid rgba(184,105,58,0.35);font-size:16px;font-weight:700;color:#fffdf7;text-align:center;text-decoration:none;letter-spacing:0.04em;transition:filter .2s;}
.paywall__cta:hover{filter:brightness(1.1);}
.paywall__note{margin-top:16px;text-align:center;font-size:12px;color:#6b6460;}
a{color:#b8693a;text-decoration:none;}
</style>
</head>
<body>
<nav class="topbar">
  <div class="topbar__inner">
    <a class="topbar__back" href="/bloggers">← 返回博主洞察</a>
    <div>${rightSide}</div>
  </div>
</nav>
<div class="paywall">
  <div class="paywall__header">
    ${avatarHtml}
    <div>
      <div class="paywall__name">${escapeHtml(displayName)}</div>
      ${metaLine ? `<div class="paywall__meta">${escapeHtml(metaLine)}</div>` : ''}
    </div>
  </div>
  ${positioning ? `<div class="paywall__positioning">${escapeHtml(positioning)}</div>` : ''}
  <div class="paywall__preview">
    <div class="paywall__preview-content">
      <p>本报告深度拆解该博主的内容策略、选题逻辑与流量密码，包含完整的账号定位分析、爆款内容复盘、变现路径梳理，以及可直接复用的操盘手册……</p>
      <p>数据维度涵盖粉丝画像、互动分布、发布节奏、合作品牌偏好及竞品对比，帮助你在进入赛道前做出有依据的决策……</p>
      <p>会员专属报告持续更新，覆盖抖音、小红书、B 站等主流平台的头部博主洞察……</p>
    </div>
    <div class="paywall__lock">
      <div class="paywall__lock-text">🔒 此博主洞察报告为会员专属</div>
    </div>
  </div>
  <a class="paywall__cta" href="/membership">开通会员 · 解锁全部报告</a>
  <p class="paywall__note">年费 ¥499，解锁全部博主洞察 + 赛道分析报告</p>
</div>
</body>
</html>`
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
