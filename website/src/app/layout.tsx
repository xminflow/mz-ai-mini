import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://weelume.com'
const OG_IMAGE_PATH = '/og/cover.png'
const OG_IMAGE_ABSOLUTE = `${SITE_URL.replace(/\/+$/, '')}${OG_IMAGE_PATH}`

const SITE_TITLE_DEFAULT = 'AI × 自媒体，让客户源源不断地找上门 · 微域生光'
const SITE_DESCRIPTION =
  '自媒体营销获客不要再做无效尝试。微域生光提供真实的赛道分析、一线博主拆解、可落地的百万级大V运营实战精炼方法论，加上能上手的 AI 信息工具，助你消除信息差、实现流量与客源的极速增长。'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE_DEFAULT,
    template: '%s · 微域生光',
  },
  description: SITE_DESCRIPTION,
  applicationName: '微域生光',
  keywords: [
    'AI 自媒体',
    '自媒体获客',
    '自媒体运营',
    '赛道分析',
    '博主拆解',
    '爆款拆解',
    '内容运营方法论',
    'AI 内容工具',
    '抖音运营',
    '小红书运营',
    '百万博主',
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
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: 'AI × 自媒体，让客户源源不断地找上门 · 微域生光',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE_DEFAULT,
    description: SITE_DESCRIPTION,
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
  slogan: 'AI × 自媒体，让客户源源不断地找上门',
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
