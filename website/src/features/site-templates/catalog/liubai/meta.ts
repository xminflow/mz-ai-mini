import type { SiteTemplate } from '../../types'

export const liubaiTemplate: SiteTemplate = {
  id: 'liubai',
  name: '留白设计工作室',
  localizedNames: { en: 'Liubai Design Studio' },
  sceneId: 'brand-portfolio',
  listed: false,
  tags: ['浅色', '无彩色', '编辑排版', '统一字阶', 'PC / iPad / H5', '中英文官网'],
  summary:
    '设计工作室的对外官网加一套内容后台：官网以作品陈列为主线，覆盖主张、精选作品、能力清单、服务、流程、客户评价、报价套餐、常见问题与文章；后台管理作品发布、客户咨询线索与站点配置。整体是冷中性灰的无彩色体系，照片是页面里唯一的颜色来源。',
  accentColor: '#121218',
  cover: '/templates/liubai/screenshots/home.webp',
  screenshots: [
    { src: '/templates/liubai/screenshots/home.webp', alt: 'PC 首页：品牌主张、工作室介绍与精选作品', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/liubai/screenshots/works.webp', alt: 'PC 作品页：以实拍照片呈现设计案例', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/liubai/screenshots/about.webp', alt: 'PC 关于页：团队、历程与工作室介绍', device: 'desktop', width: 1440, height: 1000 },
    { src: '/templates/liubai/screenshots/tablet-home.webp', alt: 'iPad 首页：响应式首屏与折叠导航', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/liubai/screenshots/tablet-works.webp', alt: 'iPad 作品页：双列案例布局', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/liubai/screenshots/tablet-about.webp', alt: 'iPad 关于页：平板团队与时间轴布局', device: 'tablet', width: 834, height: 1180 },
    { src: '/templates/liubai/screenshots/mobile-home.webp', alt: 'H5 首页：单列首屏与触控导航', device: 'mobile', width: 390, height: 844 },
    { src: '/templates/liubai/screenshots/mobile-works.webp', alt: 'H5 作品页：手机单列案例卡片', device: 'mobile', width: 390, height: 844 },
    { src: '/templates/liubai/screenshots/mobile-about.webp', alt: 'H5 关于页：手机团队与时间轴布局', device: 'mobile', width: 390, height: 844 },
  ],
  surfaces: [
    {
      id: 'site',
      name: '官网',
      platform: 'pc',
      locales: ['zh', 'en'],
      pages: [
        { slug: '', title: '首页', localizedTitles: { en: 'Home' }, load: () => import('./pages/HomePage') },
        { slug: 'about', title: '关于', localizedTitles: { en: 'About' }, load: () => import('./pages/AboutPage') },
        { slug: 'works', title: '作品', localizedTitles: { en: 'Work' }, load: () => import('./pages/WorksPage') },
        { slug: 'articles', title: '文章', localizedTitles: { en: 'Journal' }, load: () => import('./pages/ArticlesPage') },
        { slug: 'contact', title: '联系', localizedTitles: { en: 'Contact' }, load: () => import('./pages/ContactPage') },
      ],
    },
    {
      id: 'admin',
      name: '管理后台',
      platform: 'pc',
      pages: [
        { slug: '', title: '工作台', load: () => import('./pages/AdminOverviewPage') },
        { slug: 'works', title: '作品管理', load: () => import('./pages/AdminWorksPage') },
        { slug: 'leads', title: '客户咨询', load: () => import('./pages/AdminLeadsPage') },
        { slug: 'settings', title: '站点设置', load: () => import('./pages/AdminSettingsPage') },
      ],
    },
  ],
}
