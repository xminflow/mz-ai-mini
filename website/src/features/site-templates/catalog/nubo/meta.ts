import type { SiteTemplate, TemplateScreenshot } from '../../types'

const screenshots: [TemplateScreenshot, ...TemplateScreenshot[]] = [
  { src: '/templates/nubo/screenshots/home.webp', alt: 'desktop 首页：全屏机器人影像与胶囊导航', device: 'desktop', width: 1440, height: 1000 },
  { src: '/templates/nubo/screenshots/features.webp', alt: 'desktop 功能：安静的居家能力', device: 'desktop', width: 1440, height: 1000 },
  { src: '/templates/nubo/screenshots/updates.webp', alt: 'desktop 更新：产品进展时间线', device: 'desktop', width: 1440, height: 1000 },
  { src: '/templates/nubo/screenshots/contact.webp', alt: 'desktop 联系：本地校验演示表单', device: 'desktop', width: 1440, height: 1000 },
  { src: '/templates/nubo/screenshots/tablet-home.webp', alt: 'tablet 首页：全屏机器人影像与胶囊导航', device: 'tablet', width: 834, height: 1180 },
  { src: '/templates/nubo/screenshots/tablet-features.webp', alt: 'tablet 功能：安静的居家能力', device: 'tablet', width: 834, height: 1180 },
  { src: '/templates/nubo/screenshots/tablet-updates.webp', alt: 'tablet 更新：产品进展时间线', device: 'tablet', width: 834, height: 1180 },
  { src: '/templates/nubo/screenshots/tablet-contact.webp', alt: 'tablet 联系：本地校验演示表单', device: 'tablet', width: 834, height: 1180 },
  { src: '/templates/nubo/screenshots/mobile-home.webp', alt: 'mobile 首页：全屏机器人影像与胶囊导航', device: 'mobile', width: 390, height: 844 },
  { src: '/templates/nubo/screenshots/mobile-features.webp', alt: 'mobile 功能：安静的居家能力', device: 'mobile', width: 390, height: 844 },
  { src: '/templates/nubo/screenshots/mobile-updates.webp', alt: 'mobile 更新：产品进展时间线', device: 'mobile', width: 390, height: 844 },
  { src: '/templates/nubo/screenshots/mobile-contact.webp', alt: 'mobile 联系：本地校验演示表单', device: 'mobile', width: 390, height: 844 },
]

export const nuboTemplate: SiteTemplate = {
  id: 'nubo', name: '微域生光 · 居家机器人', localizedNames: { en: 'Weelume · Home robotics' },
  sceneId: 'corporate-site', listed: false,
  tags: ['暖白淡黄', '居家机器人', '玻璃质感', 'PC / iPad / H5', '中英文官网', 'Framer Motion'],
  summary: '参考 Nubo 的居家机器人中英文整站模板。覆盖首页、关于、四篇场景详情、产品更新、联系、候补名单、两份政策与 404。全屏本地影像、胶囊菜单、材质切换、FAQ 与本地校验演示表单，适配 PC、iPad 和 H5。',
  accentColor: '#d3c980', cover: '/templates/nubo/screenshots/home.webp',
  screenshots,
  surfaces: [{ id: 'site', name: '居家机器人官网', platform: 'pc', locales: ['zh', 'en'], pages: [
    { slug: '', title: '首页', localizedTitles: { en: 'Home' }, load: () => import('./pages/HomePage') },
    { slug: 'about', title: '关于我们', localizedTitles: { en: 'About' }, load: () => import('./pages/AboutPage') },
    { slug: 'cases', title: '生活场景', localizedTitles: { en: 'Use cases' }, load: () => import('./pages/CasesPage') },
    { slug: 'updates', title: '产品更新', localizedTitles: { en: 'Updates' }, load: () => import('./pages/UpdatesPage') },
    { slug: 'contact', title: '联系我们', localizedTitles: { en: 'Contact' }, load: () => import('./pages/ContactPage') },
    { slug: 'waitlist', title: '候补名单', localizedTitles: { en: 'Waitlist' }, load: () => import('./pages/WaitlistPage') },
    { slug: 'legal/privacy-and-cookies', title: '隐私与 Cookie', localizedTitles: { en: 'Privacy & cookies' }, load: () => import('./pages/PrivacyPage') },
    { slug: 'legal/terms-of-service', title: '服务条款', localizedTitles: { en: 'Terms of service' }, load: () => import('./pages/TermsPage') },
    { slug: 'cases/kitchen', title: '厨房时光', localizedTitles: { en: 'Kitchen' }, load: () => import('./pages/KitchenPage') },
    { slug: 'cases/family', title: '家人与陪伴', localizedTitles: { en: 'Family' }, load: () => import('./pages/FamilyPage') },
    { slug: 'cases/daily-duties', title: '日常琐事', localizedTitles: { en: 'Daily duties' }, load: () => import('./pages/DailyDutiesPage') },
    { slug: 'cases/housekeeping', title: '居家养护', localizedTitles: { en: 'Housekeeping' }, load: () => import('./pages/HousekeepingPage') },
    { slug: '404', title: '404 页面', localizedTitles: { en: '404 page' }, load: () => import('./pages/NotFoundPage') },
  ] }],
}
