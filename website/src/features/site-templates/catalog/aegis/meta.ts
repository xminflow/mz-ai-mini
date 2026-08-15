import type { SiteTemplate } from '../../types'

export const aegisTemplate: SiteTemplate = {
  id: 'aegis',
  name: '微域智能运维平台',
  sceneId: 'other',
  listed: false,
  tags: ['深色', '科技感', '玻璃质感', '图表', '数据密集', '云原生 / 可观测性'],
  summary:
    '以项目为维度的通用实时监控运维控制台，Web 应用、API 服务、AI Agent、数据管道、定时任务与数据库统一纳管，覆盖服务存活、日志异常、资源水位与告警规则配置。',
  accentColor: '#38bdf8',
  cover: '/templates/aegis/cover.svg',
  surfaces: [
    {
      id: 'console',
      name: '控制台',
      platform: 'pc',
      pages: [
        { slug: '', title: '项目总览', load: () => import('./pages/OverviewPage') },
        { slug: 'project', title: '项目监控', load: () => import('./pages/ProjectPage') },
        { slug: 'inspect', title: '智能体巡检', load: () => import('./pages/InspectionPage') },
        { slug: 'logs', title: '日志与异常', load: () => import('./pages/LogsPage') },
        { slug: 'alerts', title: '告警中心', load: () => import('./pages/AlertsPage') },
        { slug: 'rules', title: '规则配置', load: () => import('./pages/RulesPage') },
      ],
    },
  ],
}
