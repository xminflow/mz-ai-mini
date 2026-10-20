import { createElement } from 'react'
import type { SiteTemplate, SiteTemplatePageProps, TemplateScreenshot } from '../../types'
import { articles, experiences, offers, rooms } from './data'

const screenshots: TemplateScreenshot[] = (['desktop', 'tablet', 'mobile'] as const).flatMap(device => {
  const [width, height] = device === 'desktop' ? [1440, 1000] : device === 'tablet' ? [834, 1180] : [390, 844]
  return [['home', '首页'], ['rooms', '客房'], ['journal', '日志'], ['contact', '联系']].map(([page, label]) => ({ src: `/templates/noirei/screenshots/${device}-${page}.webp`, alt: `${device} ${label}真实页面截图`, device, width, height }))
})

export const noireiTemplate: SiteTemplate = {
  id: 'noirei', name: '微域生光 · 湖畔酒店', localizedNames: { en: 'Weelume · Lakeside retreat' }, sceneId: 'corporate-site', listed: false,
  tags: ['湖畔酒店', '暗色奢雅', '住宿与体验', '双语整站', 'PC / iPad / H5'],
  summary: '参考 Noirei 湖畔酒店的摄影叙事、暗色与暖白分区，完整呈现 28 个中英文页面。包含六种房型、六项体验、三份入住礼遇、六篇日志，以及筛选、照片灯箱、FAQ 和本地咨询演示。采用统一的微域生光品牌与 MiSans / Poppins 字体。原站照片仅供内部预览，商用前需取得授权或替换。',
  accentColor: '#c2a27a', cover: '/templates/noirei/screenshots/desktop-home.webp', screenshots: screenshots as [TemplateScreenshot, ...TemplateScreenshot[]],
  surfaces: [{ id: 'site', name: '湖畔酒店官网', platform: 'pc', locales: ['zh', 'en'], pages: [
    { slug: '', title: '首页', localizedTitles: { en: 'Home' }, load: () => import('./pages/HomePage') },
    { slug: 'about', title: '关于老宅', localizedTitles: { en: 'The house' }, load: () => import('./pages/AboutPage') },
    { slug: 'room', title: '客房', localizedTitles: { en: 'Stay' }, load: () => import('./pages/RoomsPage') },
    { slug: 'experiences', title: '体验', localizedTitles: { en: 'Experiences' }, load: () => import('./pages/ExperiencesPage') },
    { slug: 'journal', title: '湖畔日志', localizedTitles: { en: 'Journal' }, load: () => import('./pages/JournalPage') },
    { slug: 'contact', title: '联系', localizedTitles: { en: 'Contact' }, load: () => import('./pages/ContactPage') },
    { slug: 'legal', title: '隐私与条款', localizedTitles: { en: 'Privacy & terms' }, load: () => import('./pages/LegalPage') },
    ...rooms.map(item => ({ slug: `room/${item.slug}`, title: item.name[0], localizedTitles: { en: item.name[1] }, load: async () => {
      const { default: Page } = await import('./pages/RoomPage')
      return { default: (props: SiteTemplatePageProps) => createElement(Page, { ...props, slug: item.slug }) }
    } })),
    ...experiences.map(item => ({ slug: `experiences/${item.slug}`, title: item.name[0], localizedTitles: { en: item.name[1] }, load: async () => {
      const { default: Page } = await import('./pages/ExperiencePage')
      return { default: (props: SiteTemplatePageProps) => createElement(Page, { ...props, slug: item.slug }) }
    } })),
    ...offers.map(item => ({ slug: `offers/${item.slug}`, title: item.name[0], localizedTitles: { en: item.name[1] }, load: async () => {
      const { default: Page } = await import('./pages/OfferPage')
      return { default: (props: SiteTemplatePageProps) => createElement(Page, { ...props, slug: item.slug }) }
    } })),
    ...articles.map(item => ({ slug: `journal/${item.slug}`, title: item.name[0], localizedTitles: { en: item.name[1] }, load: async () => {
      const { default: Page } = await import('./pages/ArticlePage')
      return { default: (props: SiteTemplatePageProps) => createElement(Page, { ...props, slug: item.slug }) }
    } })),
  ] }],
}
