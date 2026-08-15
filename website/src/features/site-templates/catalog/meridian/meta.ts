import type { SiteTemplate } from '../../types'

export const meridianTemplate: SiteTemplate = {
  id: 'meridian',
  name: 'Meridian 律师事务所',
  sceneId: 'corporate-site',
  listed: false,
  tags: ['深色', '衬线', '克制', '专业服务'],
  summary: '深色底配衬线标题的律所官网，强调资历与专业领域，适合律所、会计事务所与咨询机构。',
  accentColor: '#c8a45c',
  cover: '/templates/meridian/cover.svg',
  pages: [
    { slug: '', title: '首页', load: () => import('./pages/HomePage') },
    { slug: 'team', title: '团队', load: () => import('./pages/TeamPage') },
  ],
}
