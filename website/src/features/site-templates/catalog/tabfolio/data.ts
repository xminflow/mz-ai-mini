export type Localized = [string, string]
export const copy = (value: Localized, locale: 'zh' | 'en') => value[locale === 'zh' ? 0 : 1]
export const projects = [
  { slug: 'case-studies/aviera-financial-dashboard', title: ['让金融数据更容易理解', 'Making financial data easier to understand'] as Localized, client: ['Aviera', 'Aviera'] as Localized, year: '2026', image: '/templates/tabfolio/assets/aviera.png' },
  { slug: 'case-studies/music-discovery-app', title: ['打造音乐发现应用', 'Creating a music discovery app'] as Localized, client: ['Lumix', 'Lumix'] as Localized, year: '2025', image: '/templates/tabfolio/assets/lumix.png' },
  { slug: 'case-studies/designing-a-portfolio-system', title: ['设计一个作品集系统', 'Designing a portfolio'] as Localized, client: ['个人项目', 'Personal project'] as Localized, year: '2025', image: '/templates/tabfolio/assets/values.png' },
  { slug: 'case-studies/expanding-aviera-for-finance-teams', title: ['为财务团队扩展 Aviera', 'Expanding Aviera for finance teams'] as Localized, client: ['Aviera', 'Aviera'] as Localized, year: '2024', image: '/templates/tabfolio/assets/workflow.png' },
]
export type Experiment = { zh: string; en: string; image: string; variant: string; video?: string }
export const experiments: Experiment[] = [
  { zh: '字体的运动', en: 'Movement through type', image: '', video: '/templates/tabfolio/assets/experiment-type.mp4', variant: 'type' },
  { zh: '探索 Procreate', en: 'Exploring Procreate', image: '/templates/tabfolio/assets/experiment-procreate.jpeg', variant: 'forest' },
  { zh: '色彩与数字笔触', en: 'Color and digital brushwork', image: '/templates/tabfolio/assets/experiment-color.jpeg', variant: 'paint' },
  { zh: '艺术工作坊', en: 'Art workshop', image: '/templates/tabfolio/assets/about-photo-source.jpeg', variant: 'dogs' },
  { zh: '花朵插画合集', en: 'Flower illustration collection', image: '/templates/tabfolio/assets/experiment-flowers.jpeg', variant: 'flowers' },
  { zh: '氛围与质感', en: 'Mood and texture', image: '/templates/tabfolio/assets/experiment-mood.jpeg', variant: 'mood' },
  { zh: '社会影响力活动概念', en: 'Concepts for a social impact campaign', image: '/templates/tabfolio/assets/experiment-color-source.png', video: '/templates/tabfolio/assets/experiment-social.mp4', variant: 'gradient' },
  { zh: '抽象形态', en: 'Abstract forms', image: '/templates/tabfolio/assets/experiment-abstract.jpeg', variant: 'abstract' },
  { zh: '形状与色彩系统', en: 'Shapes and color systems', image: '/templates/tabfolio/assets/experiment-shapes.jpeg', variant: 'shapes' },
  { zh: '数字绘画', en: 'Digital Painting', image: '/templates/tabfolio/assets/experiment-painting.jpeg', variant: 'painting' },
]
export const values = [['勇气', 'Courage', '我会主动探索新想法，即使方向还不清晰也会做出决定。', 'I take initiative, explore new ideas, and make decisions even when the path is not clear.'], ['诚实', 'Honesty', '我坦诚沟通，给出反馈，并专注真正影响结果的事情。', 'I communicate openly, give feedback, and focus on what truly matters.'], ['适应力', 'Adaptability', '保持灵活、快速学习，在挑战中持续调整方向。', 'I stay flexible, learn quickly, and adjust to challenges without losing focus.'], ['团队协作', 'Teamwork', '我喜欢共同创作，相信最好的结果来自团队。', 'I love collaborating and believe the best results come from teamwork.']] as const

