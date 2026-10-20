import type { SiteTemplate } from '../../types'

export const luneraTemplate: SiteTemplate = {
  id: 'lunera', name: '微域生光 · 智能财务', localizedNames: { en: 'Weelume · Financial clarity' }, sceneId: 'landing-page', listed: false,
  tags: ['浅色', '金融科技', 'SaaS', 'PC / iPad / H5', 'Framer Motion', '中英文官网'],
  summary: '面向个人、创业者和小团队的中英文财务管理产品官网：收支追踪、智能预算、财务报表与账户同步，包含功能介绍、价格方案、评价、常见问题、博客和联系页。适配 PC、iPad 与 H5，提供分端截图和独立交互预览。使用本地素材，动效采用 Framer Motion。',
  accentColor: '#4686fe', cover: '/templates/lunera/screenshots/home.webp',
  screenshots: [
    { src: '/templates/lunera/screenshots/home.webp', alt: 'PC 首页：蓝天首屏与财务应用展示', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/lunera/screenshots/features.webp', alt: 'PC 功能模块：数据分析、预算与工具集成', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/lunera/screenshots/blog.webp', alt: 'PC 博客列表：产品与财务主题文章', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/lunera/screenshots/contact.webp', alt: 'PC 联系页面：表单与常见问题', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/lunera/screenshots/tablet-home.webp', alt: 'iPad 首页：平板视口与折叠导航', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/lunera/screenshots/tablet-features.webp', alt: 'iPad 功能模块：双列玻璃卡片', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/lunera/screenshots/tablet-blog.webp', alt: 'iPad 博客列表：双列文章卡片', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/lunera/screenshots/tablet-contact.webp', alt: 'iPad 联系页面：平板表单布局', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/lunera/screenshots/mobile-home.webp', alt: 'H5 首页：紧凑首屏与触控导航', device: 'mobile', width: 390, height: 844 },
    { src: '/templates/lunera/screenshots/mobile-features.webp', alt: 'H5 功能模块：单列玻璃卡片', device: 'mobile', width: 390, height: 844 },
    { src: '/templates/lunera/screenshots/mobile-blog.webp', alt: 'H5 博客列表：手机文章卡片', device: 'mobile', width: 390, height: 844 },
    { src: '/templates/lunera/screenshots/mobile-contact.webp', alt: 'H5 联系页面：手机表单布局', device: 'mobile', width: 390, height: 844 },
  ],
  surfaces: [{ id: 'site', name: '产品官网', platform: 'pc', locales: ['zh', 'en'], pages: [
    { slug: '', title: '首页', localizedTitles: { en: 'Home' }, load: () => import('./pages/HomePage') },
    { slug: 'blog', title: '博客', localizedTitles: { en: 'Journal' }, load: () => import('./pages/BlogPage') },
    { slug: 'contact', title: '联系我们', localizedTitles: { en: 'Contact' }, load: () => import('./pages/ContactPage') },
    { slug: 'blog/5-metrics', title: 'SaaS 创始人的关键指标', localizedTitles: { en: 'Five metrics for SaaS founders' }, load: () => import('./pages/MetricsPage') },
    { slug: 'blog/simpler-dashboard-experience', title: '简洁仪表盘设计', localizedTitles: { en: 'A simpler dashboard' }, load: () => import('./pages/DashboardArticlePage') },
    { slug: 'blog/styling-elements', title: '安全的数据同步', localizedTitles: { en: 'Secure data sync' }, load: () => import('./pages/SecurityArticlePage') },
    { slug: 'blog/importing-content', title: '初创企业财务管理', localizedTitles: { en: 'Startup finances' }, load: () => import('./pages/ScalingArticlePage') },
    { slug: 'blog/what-we-learned-from-10k-users', title: '用户洞察', localizedTitles: { en: 'Lessons from our users' }, load: () => import('./pages/UsersArticlePage') },
    { slug: 'legal-terms/privacy-policy', title: '隐私政策', localizedTitles: { en: 'Privacy policy' }, load: () => import('./pages/PrivacyPage') },
    { slug: 'legal-terms/terms-and-conditions', title: '服务条款', localizedTitles: { en: 'Terms of service' }, load: () => import('./pages/TermsPage') },
  ] }],
}
