import source from './source-data.json'
import type { TemplateLocale } from '../../types'

export type Copy = readonly [string, string]
export type Category = 'all' | 'branding' | 'digital' | 'motion' | 'experiment'
export const categories: { id: Category; label: Copy }[] = [
  { id: 'all', label: ['全部', 'All'] },
  { id: 'branding', label: ['品牌', 'Branding'] },
  { id: 'digital', label: ['数字体验', 'Digital'] },
  { id: 'motion', label: ['动态影像', 'Motion'] },
  { id: 'experiment', label: ['创意实验', 'Experiment'] },
]
export const navigation: { path: string; label: Copy }[] = [
  { path: '', label: ['首页', 'Index'] },
  { path: '/projects', label: ['作品', 'Projects'] },
  { path: '/contact', label: ['联系', 'Contact'] },
  { path: '/world', label: ['创意世界', 'World'] },
]
export const text = (copy: Copy, locale: TemplateLocale) => copy[locale === 'en' ? 1 : 0]

// 中文是模板编辑说明；参考案例归原工作室所有，不作为微域生光的客户背书。
const descriptions: Record<string, Copy> = {
  hubtown: ['以城市为舞台，让建筑与生活的想象在数字空间中展开。', 'An architectural portfolio that turns urban ambition into an immersive digital journey.'],
  poly: ['用清晰的视觉语言，呈现为创作者打造的数字工具。', 'A precise digital identity for a tool built around creative thinking.'],
  oceanx: ['潜入深海，让海洋探索成为触手可及的故事。', 'An invitation to discover the ocean through an exploratory digital experience.'],
  'the-symphony-of-vines': ['让葡萄园、声音与时间相遇，谱写可以被探索的风土叙事。', 'A sensory digital narrative connecting a vineyard, its landscape and the passage of time.'],
  klook: ['从一次点击开始，遇见旅途中的另一种自己。', 'A playful travel experience inviting people to discover a different side of themselves.'],
  'rspca-animal-futures': ['以互动叙事打开关于动物未来的对话。', 'An interactive look at possible futures for animal welfare.'],
  'blueyard-digital': ['让大胆的投资视野，拥有同样大胆的数字表达。', 'A distinctive digital presence for a venture firm with a forward-looking perspective.'],
  cosmos: ['为灵感留下一片空间，让收藏变成新的发现。', 'A considered space for collecting, connecting and rediscovering inspiration.'],
  '25-residences': ['用光线、材质与空间叙事，表达居住的另一种可能。', 'An architectural story told through light, material and the possibility of home.'],
  organimo: ['在超现实的数字世界里，重新认识日常营养。', 'A surreal shopping journey that brings a new approach to daily supplements to life.'],
  'hiring-calculator': ['把复杂的招聘成本，变成直观而有趣的互动体验。', 'A useful, approachable interaction that makes the cost of hiring easier to understand.'],
  'robco-3d-motion': ['以精准的三维影像，让机器人技术的力量清晰可见。', 'A motion-led exploration of the precision and potential of robotics.'],
  'kikk-2024-brand-identity': ['为跨越艺术、科学与技术的创意节，构建充满张力的视觉世界。', 'An expressive identity for a festival where art, science and technology meet.'],
  'nikolas-type': ['让字体走出样张，在动态的数字舞台上表达个性。', 'An expressive digital stage that lets a type foundry’s work speak for itself.'],
  'seascape-survey': ['通过深海物种与影像叙事，探索海底尚未被看见的世界。', 'A visual exploration of the extraordinary life and landscapes beneath the sea.'],
  'cult-of-the-north': ['从北方的神话与符号出发，构建鲜明的数字身份。', 'A digital identity shaped by northern stories, symbols and atmosphere.'],
  crosswire: ['用品牌系统与数字体验，重新组织复杂的安全信息。', 'A connected identity and digital experience that makes a complex security product approachable.'],
  'blue-marine-foundation': ['让海洋保护从抽象议题，成为可以亲身感受的旅程。', 'A compelling digital story about the importance of protecting our oceans.'],
  'quai-network': ['以建筑般的秩序，呈现去中心化网络的连接与尺度。', 'A visual language of structure, connection and scale for a decentralized network.'],
  clou: ['以开放的数字画廊，承载跨越城市的建筑实践。', 'An open digital gallery for an architectural practice working across cities and cultures.'],
  true: ['让舞台幕后看得见，以有力的品牌表达呈现制作能力。', 'An identity that brings the craft and ambition behind live productions into view.'],
  'walk-with-whales': ['借助沉浸式叙事，靠近鲸群与它们栖息的蓝色世界。', 'An immersive encounter with whales and the blue world they call home.'],
  'allies-of-skin': ['以克制的材质、光线与排版，表达护肤产品的科学精神。', 'A material-led visual study connecting skincare with a precise scientific perspective.'],
  'lewa-house': ['从肯尼亚的自然肌理中，寻找一处居所的独特气质。', 'A digital introduction to a house rooted in the landscape and character of Kenya.'],
  superlist: ['用轻盈的互动，把日常待办变成更有节奏的协作。', 'A lively product story about making everyday planning and collaboration feel effortless.'],
  dreamscapes: ['在不可能的建筑与自然之间，构建一个可以停留的梦境。', 'A visual experiment at the intersection of impossible architecture and the natural world.'],
  'blue-yard': ['以不断生长的视觉结构，探索面向未来的投资叙事。', 'An evolving visual language for a venture platform looking toward the future.'],
  contra: ['为独立创作者搭建一个自由连接与合作的数字空间。', 'A digital experience celebrating the possibilities of independent creative work.'],
  letter: ['以产品渲染与空间构图，探索金融工具的亲和表达。', 'A product-led visual study that gives a financial tool a more approachable character.'],
  dala: ['用清晰的结构与灵动的影像，让团队知识自然连接。', 'A playful, structured product narrative about connecting a team’s collective knowledge.'],
  blossom: ['让花瓣回应时间与光，观察一场数字生命的生长。', 'An interactive experiment observing digital growth through petals, light and time.'],
  cellular: ['从微小单元开始，探索不断生长的有机图案。', 'A generative exploration of organic patterns built from small repeating cells.'],
  'webgl-rain': ['穿过霓虹与雨幕，感受一个数字城市的呼吸。', 'A moody visual experiment in rain, neon and the atmosphere of a digital city.'],
  'particle-play': ['让粒子追随手势，在运动中留下短暂而鲜明的轨迹。', 'A playful study of particles, gestures and the traces left behind by motion.'],
  'pool-life': ['让光线与水面互相回应，捕捉折射之间的微小变化。', 'A quiet exploration of water, light and the changing patterns between them.'],
  'optical-flow': ['让颜色跟随方向，在流动中发现新的形态。', 'An experiment in colour and direction, finding new forms through fluid movement.'],
}
export interface Project {
  id: string
  name: string
  categories: Category[]
  description: Copy
  source: string
  images: string[]
}
export const projects: Project[] = source.projects.map(project => {
  const id = project.id === 'oceanx-' ? 'oceanx' : project.id
  if (!descriptions[id]) throw new Error(`[unseen] 项目缺少双语内容：${id}`)
  return { ...project, id, description: descriptions[id], categories: project.categories.length ? project.categories as Category[] : ['digital'] }
})
const worldTitles: Record<string, string> = {
  'IN THE CLOUDS': '云端之上', 'OVERGROWN INDOORS': '在室内生长', CODEABLE: 'Codeable 品牌探索',
  'HONEY RUM': '蜂蜜朗姆酒', 'CAUSTICS EXPERIMENT': '焦散光线实验', KOVE: 'Kove 动态研究',
  'LOVIE AWARDS': 'Lovie 奖杯', THING: '物体研究', 'OUR WEBBY AWARD': 'Webby 奖杯',
  'REALITY LOADING': '现实加载中', 'UNSEEN HOODIE': '工作室卫衣', 'ROAD TO NOWHERE': '通向未知的路',
  'GREEN SCENES': '绿色场景', 'CHOCOLATE EXPLOSION': '巧克力爆炸', MUSHROOMS: '蘑菇世界',
  'WARMING TONES': '温暖色调', 'SOFT STUDIES': '柔软材质研究', 'SMOOTH SKATING': '流畅滑行',
}
const worldCaptions: Record<string, string> = {
  'Product renders for Letter.': 'Letter 产品渲染',
  'Unused concept for Codeable brand direction.': 'Codeable 品牌方向概念',
  'Product renders for Burning Barn Honey Rum.': 'Burning Barn 蜂蜜朗姆酒产品渲染',
  "Minimalist product renders for 6 O'clock Gin.": '6 O’clock 杜松子酒极简产品渲染',
  'We picked up 2x Gold Lovie Awards!': '原工作室获得两项 Lovie 金奖',
  'Unused brand direction for Interface.': 'Interface 品牌方向概念',
  "We've won our first Webby!! 🥳": '原工作室的第一座 Webby 奖杯',
  'Concept artwork.': '概念视觉创作',
  'Summing out some of our values.': '工作室价值观的视觉表达',
  "We've won Studio Of The Year!": '原工作室获得年度工作室奖项',
  "Unseen team trip. Namur '22.": '原工作室团队之旅：那慕尔 2022',
  'Lighting and material R&D.': '光照与材质研究',
  'The team at Kikk Festival.': '原工作室团队在 Kikk 创意节',
  'Identity and website for Kikk Festival.': 'Kikk 创意节品牌识别与网站',
  'Kikk Festival rock asset.': 'Kikk 创意节岩石视觉素材',
}
export const worldItems = source.world.map(item => {
  const caption = item.caption.trim()
  if (item.title && !worldTitles[item.title]) throw new Error(`[unseen] World 标题缺少中文：${item.title}`)
  if (caption && !worldCaptions[caption]) throw new Error(`[unseen] World 说明缺少中文：${caption}`)
  const description: Copy = item.title ? [worldTitles[item.title], item.title] : caption ? [worldCaptions[caption], caption] : [`创意研究 ${Number(item.id) + 1}`, `Creative study ${Number(item.id) + 1}`]
  const localizedCaption: Copy | null = caption ? [worldCaptions[caption], caption] : null
  return { ...item, description, localizedCaption }
})
export const services: { title: Copy; body: Copy }[] = [
  { title: ['品牌策略与识别', 'Brand & identity'], body: ['从核心想法到视觉语言，构建鲜明、连贯的品牌表达。', 'From a central idea to a complete visual language, we build identities with clarity and character.'] },
  { title: ['数字设计与开发', 'Digital experiences'], body: ['将设计与技术相连，创造值得停留与探索的数字体验。', 'We connect design and technology to create digital spaces that reward curiosity.'] },
  { title: ['三维与动态影像', 'Motion & 3D'], body: ['通过光线、材质和运动，让平面的想法拥有新的维度。', 'We give ideas another dimension through light, material, rhythm and motion.'] },
]
