import { createElement } from 'react'
import type { SiteTemplate, SiteTemplatePageProps, TemplateScreenshot } from '../../types'
import { projects } from './data'

const shots: TemplateScreenshot[] = (['desktop', 'tablet', 'mobile'] as const).flatMap(device => {
  const [width, height] = device === 'desktop' ? [1440, 1000] : device === 'tablet' ? [834, 1180] : [390, 844]
  const prefix = device === 'desktop' ? '' : `${device}-`
  return [['home', '首页'], ['projects', '作品'], ['world', '创意世界'], ['contact', '联系']].map(([name, label]) => ({ src: `/templates/unseen/screenshots/${prefix}${name}.webp`, alt: `${device} ${label}页面真实截图`, device, width, height }))
})
export const unseenTemplate: SiteTemplate = {
  id: 'unseen',
  name: '微域生光 · 超现实创意工作室',
  localizedNames: { en: 'Weelume · Surreal creative studio' },
  sceneId: 'brand-portfolio',
  listed: false,
  tags: ['超现实空间', '粉色水面', '品牌与创意', '沉浸画廊', '中英文', 'PC / iPad / H5'],
  summary: '参考 Unseen Studio 的粉色建筑空间、水面折射与创意画廊，统一微域生光品牌。覆盖首页、作品、联系、World、36 个项目解读与两篇模板政策说明。默认中文、支持英文；本地场景影像结合原生 WebGL 折射水面，提供作品筛选、可拖拽缩放画廊、媒体预览、环境音与本地演示表单。参考素材仅供内部预览，正式交付前需确认许可或替换。',
  accentColor: '#c6a4bd',
  cover: '/templates/unseen/screenshots/home.webp',
  screenshots: shots as [TemplateScreenshot, ...TemplateScreenshot[]],
  surfaces: [{ id: 'site', name: '创意工作室官网', platform: 'pc', locales: ['zh', 'en'], pages: [
    { slug: '', title: '首页', localizedTitles: { en: 'Home' }, load: () => import('./pages/HomePage') },
    { slug: 'projects', title: '作品', localizedTitles: { en: 'Projects' }, load: () => import('./pages/ProjectsPage') },
    { slug: 'world', title: '创意世界', localizedTitles: { en: 'World' }, load: () => import('./pages/WorldPage') },
    { slug: 'contact', title: '联系我们', localizedTitles: { en: 'Contact' }, load: () => import('./pages/ContactPage') },
    ...projects.map(project => ({
      slug: `projects/${project.id}`, title: `${project.name} 项目`, localizedTitles: { en: project.name },
      load: async () => {
        const { default: ProjectPage } = await import('./pages/ProjectPage')
        // 动态案例复用一个服务端页面壳，保持注册表接口，不扩展全局路由或页面参数。
        return { default: (props: SiteTemplatePageProps) => createElement(ProjectPage, { ...props, projectId: project.id }) }
      },
    })),
    { slug: 'privacy', title: '隐私说明', localizedTitles: { en: 'Privacy' }, load: () => import('./pages/PrivacyPage') },
    { slug: 'terms', title: '使用条款', localizedTitles: { en: 'Terms' }, load: () => import('./pages/TermsPage') },
  ] }],
}
