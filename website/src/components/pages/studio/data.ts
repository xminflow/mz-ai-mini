// src/components/pages/studio/data.ts
// 研发团队页的纯数据层：CTO 资料 + 部门清单。不含 JSX 与客户端逻辑。

import type { ThemeKey } from '../ai-coding-camp/data'

export type Department = {
  code: string
  name: string
  project: string
  difficulty: 1 | 2 | 3 | 4 | 5
  theme: ThemeKey
}

// 部门清单按难度升序排列，后续新增部门直接往数组追加一项即可，不影响布局
export const DEPARTMENTS: Department[] = [
  {
    code: 'D1',
    name: 'OA 审批系统组',
    project: '企业审批流程线上化，最适合入门练手',
    difficulty: 1,
    theme: 'mindset',
  },
  {
    code: 'D2',
    name: 'CRM 客户关系管理组',
    project: '客户全生命周期管理系统，基础业务建模',
    difficulty: 2,
    theme: 'frontend',
  },
  {
    code: 'D3',
    name: 'AI 智能客服项目组',
    project: '7×24 自动应答的智能客服，接入真实对话场景',
    difficulty: 3,
    theme: 'agent',
  },
  {
    code: 'D4',
    name: 'AI 数据分析项目组',
    project: '经营数据看板与智能洞察，考验数据建模能力',
    difficulty: 4,
    theme: 'backend',
  },
  {
    code: 'D5',
    name: 'OpenClaw 项目组',
    project: 'Agent 自动化方向，团队里技术难度最高的项目',
    difficulty: 5,
    theme: 'launch',
  },
]

export const CTO_PROFILE = {
  name: '十一',
  nameEn: 'SHI YI',
  title: '创业公司 CTO',
  avatarUrl:
    'https://weelume-pro-1420922170.cos.ap-shanghai.myqcloud.com/website/instructor/shiyi.jpg',
  avatarPosition: '50% 22%',
  quote: '这里的每个部门，我都会亲自参与关键决策。',
}
