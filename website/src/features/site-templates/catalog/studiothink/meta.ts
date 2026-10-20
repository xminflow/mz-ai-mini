import type { SiteTemplate } from '../../types'

export const studiothinkTemplate: SiteTemplate = {
  id: 'studiothink',
  name: '微域生光 · 视觉设计工作室',
  localizedNames: { en: 'Weelume · Visual design studio' },
  sceneId: 'corporate-site',
  listed: false,
  tags: ['米白网格', '创意设计', '品牌字体', '作品集', 'PC / iPad / H5', 'Framer Motion'],
  summary: '参考 Studio Think 的视觉设计工作室官网，并统一为微域生光品牌。默认中文并提供 /en 英文路径，包含首页、关于、作品与联系，使用本地影像、手写批注、作品画廊和演示联系表单，适配 PC、iPad 与 H5。',
  accentColor: '#f5f66b',
  cover: '/templates/studiothink/screenshots/home.webp',
  screenshots: [
    { src: '/templates/studiothink/screenshots/home.webp', alt: 'PC 首页：微域生光创意设计工作室', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/studiothink/screenshots/about.webp', alt: 'PC 关于页：工作室介绍与团队', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/studiothink/screenshots/works.webp', alt: 'PC 作品页：项目列表与案例图片', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/studiothink/screenshots/contact.webp', alt: 'PC 联系页：联系信息与演示表单', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/studiothink/screenshots/tablet-home.webp', alt: 'iPad 首页：折叠导航与创意首屏', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/studiothink/screenshots/tablet-about.webp', alt: 'iPad 关于页：工作室介绍与团队', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/studiothink/screenshots/tablet-works.webp', alt: 'iPad 作品页：项目列表与案例图片', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/studiothink/screenshots/tablet-contact.webp', alt: 'iPad 联系页：联系信息与演示表单', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/studiothink/screenshots/mobile-home.webp', alt: 'H5 首页：单列首屏与触控导航', device: 'mobile', width: 390, height: 844 },
    { src: '/templates/studiothink/screenshots/mobile-about.webp', alt: 'H5 关于页：单列工作室介绍', device: 'mobile', width: 390, height: 844 },
    { src: '/templates/studiothink/screenshots/mobile-works.webp', alt: 'H5 作品页：手机图文布局', device: 'mobile', width: 390, height: 844 },
    { src: '/templates/studiothink/screenshots/mobile-contact.webp', alt: 'H5 联系页：手机表单布局', device: 'mobile', width: 390, height: 844 },
  ],
  surfaces: [{ id: 'site', name: '设计工作室官网', platform: 'pc', locales: ['zh', 'en'], pages: [
    { slug: '', title: '首页', localizedTitles: { en: 'Home' }, load: () => import('./pages/HomePage') },
    { slug: 'about', title: '关于我们', localizedTitles: { en: 'About' }, load: () => import('./pages/AboutPage') },
    { slug: 'works', title: '作品', localizedTitles: { en: 'Works' }, load: () => import('./pages/WorksPage') },
    { slug: 'contact', title: '联系我们', localizedTitles: { en: 'Contact' }, load: () => import('./pages/ContactPage') },
  ] }],
}
