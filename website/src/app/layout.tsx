import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://weelume.com'
const OG_IMAGE_PATH = '/og/cover.png'
const OG_IMAGE_ABSOLUTE = `${SITE_URL.replace(/\/+$/, '')}${OG_IMAGE_PATH}`

const SITE_TITLE_DEFAULT = '软件定制开发 —— 官网、企业系统、小程序、AI 智能体 · 微域生光'
const SITE_DESCRIPTION =
  '微域生光提供软件定制开发服务：企业官网、企业级管理系统、小程序与移动应用、AI 智能体与知识库、数据分析看板、SaaS 平台、电商系统、桌面客户端、系统集成。从需求梳理到上线运营，由同一支团队全流程闭环交付。'

// 社交分享卡片用的短文案。微信/微博/Twitter 的卡片标题与摘要都会截断，
// 因此不复用为 SEO 铺了完整服务清单的 SITE_TITLE_DEFAULT / SITE_DESCRIPTION。
const SHARE_TITLE = '软件定制开发 · 微域生光'
const SHARE_DESCRIPTION =
  '从需求梳理到上线运营，全流程闭环交付。官网、企业系统、小程序、AI 智能体等 11 类软件定制。'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE_DEFAULT,
    template: '%s · 微域生光',
  },
  description: SITE_DESCRIPTION,
  applicationName: '微域生光',
  keywords: [
    '软件定制',
    '软件定制开发',
    '企业官网开发',
    '企业管理系统',
    '小程序开发',
    'AI 智能体',
    'AI 知识库',
    'RAG 智能问答',
    '数据分析看板',
    'SaaS 开发',
    '电商系统开发',
    '桌面客户端开发',
    '系统集成',
    '流程自动化',
    '微域生光',
  ],
  authors: [{ name: '微域生光', url: SITE_URL }],
  creator: '微域生光',
  publisher: '微域生光',
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/logo/weiyu-logo-inverted-favicon.svg', type: 'image/svg+xml', sizes: 'any' },
      { url: '/logo/weiyu-logo-inverted.png', type: 'image/png', sizes: '512x512' },
    ],
    shortcut: '/logo/weiyu-logo-inverted.png',
    apple: { url: '/logo/weiyu-logo-inverted.png', sizes: '180x180' },
  },
  openGraph: {
    siteName: '微域生光',
    locale: 'zh_CN',
    type: 'website',
    url: SITE_URL,
    // 分享卡片标题另写一份短版：SITE_TITLE_DEFAULT 为 SEO 铺了服务清单，太长会在卡片里被截断
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: '软件定制开发 · 微域生光',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SHARE_TITLE,
    description: SHARE_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  verification: {
    other: {
      'baidu-site-verification': 'codeva-qdMVN4OfnO',
    },
  },
}

const ORGANIZATION_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: '微域生光',
  alternateName: 'Weelume',
  url: SITE_URL,
  logo: `${SITE_URL.replace(/\/+$/, '')}/logo/weiyu-logo-inverted.png`,
  image: OG_IMAGE_ABSOLUTE,
  description: SITE_DESCRIPTION,
  slogan: '把你的生意，做成一套自己的系统',
}

const WEBSITE_JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: '微域生光',
  alternateName: 'Weelume',
  url: SITE_URL,
  inLanguage: 'zh-CN',
  description: SITE_DESCRIPTION,
  publisher: {
    '@type': 'Organization',
    name: '微域生光',
    url: SITE_URL,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const isProd = process.env.NODE_ENV === 'production'
  return (
    <html lang="zh-CN" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_JSON_LD) }}
        />
      </head>
      {isProd && (
        <Script id="baidu-tongji" strategy="afterInteractive">
          {`var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?f5db16f67443ef68f7f374b9064d768a";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();`}
        </Script>
      )}
      <body className="relative min-h-screen bg-paper font-sans text-graphite">{children}</body>
    </html>
  )
}
