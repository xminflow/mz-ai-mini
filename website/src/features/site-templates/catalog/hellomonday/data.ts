import source from './source-data.json'
import animationSources from './animated-images.json'
import type { TemplateLocale } from '../../types'

export type Copy = readonly [string, string]
export const text = (copy: Copy, locale: TemplateLocale) => copy[locale === 'en' ? 1 : 0]
export const navigation = [
  { path: '/work', label: ['作品', 'Work'] }, { path: '/services', label: ['服务', 'Services'] },
  { path: '/about', label: ['关于', 'About'] }, { path: '/stories', label: ['故事', 'Stories'] },
  { path: '/product', label: ['产品', 'Product'] }, { path: '/contact', label: ['联系', 'Contact'] },
] satisfies { path: string; label: Copy }[]
export const categories = [
  ['all', ['全部作品', 'All work']], ['Products', ['数字产品', 'Products']],
  ['Experiences', ['数字体验', 'Experiences']], ['Branding', ['品牌设计', 'Branding']],
  ['Platform', ['数字平台', 'Platforms']], ['E-commerce', ['电子商务', 'E-commerce']],
] as const

// 案例标题完整中文化；品牌专名保留，避免把原站英文标题直接当作中文内容。
const projectNames: Record<string, string> = {
  signs: 'Signs · 让手语学习触手可及', gemini: 'Gemini · 面向每位开发者的 AI',
  'the-web-can-do-what': 'Google · 网页还能这样玩', 'universal-music-for-creators': '环球音乐 · 让创作者站上舞台',
  'gemini-apps': 'Google Gemini · 生成式 AI 应用', 'strava-2022': 'Strava · 2022 年度运动回顾',
  'dig-cloud-castles': 'DIG · 云端城堡', 'how-to-talk-to-white-kids-about-racism': '和孩子谈谈种族平等',
  'google-most-searched': 'Google · 回望历史热门搜索', 'soestrene-grene': 'Søstrene Grene · 零售的数字新篇',
  nomo: 'T-Mobile · 放下手机的小小装置', 'google-search-on': 'Google Search On · 搜索背后的故事',
  'youtube-cfc': 'YouTube · 新一代创作表达', 'google-cloud-platform-website': 'Google Cloud · 探索三维云世界',
  resilio: 'Resilio · 用游戏缓解压力', essential: 'Essential · 一个新品牌的诞生',
  'witness-change': 'Witness Change · 看见心理健康', 'residente-website': 'Residente · 记录全球音乐旅程',
  'collective-health': 'Collective Health · 重新想象医疗体验', jviews: 'J.Views · 走进一张专辑的诞生',
  tnc: '自然保护协会 · 人与自然共同繁荣', greenpeace: '绿色和平 · 深入北极',
  'gemini-developer-competition': 'Google Gemini · 开发者创意竞赛', 'ramasjang-krea-app': 'Ramasjang · 孩子的创意工坊',
  'bang-and-olufsen': 'Bang & Olufsen · 在声音中看见自己', simplethings: 'Simple Things · 发现简单之美',
  'undo-the-firewall': 'Undo the Firewall · 让新闻跨越边界', staratlas: 'Star Atlas · 走进星际游戏世界',
  'google-kids-space-illustrations': 'Google Kids Space · 童趣插画宇宙', 'alan-menken': 'Alan Menken · 音乐里的全新世界',
  'erika-senft-miller': 'Erika Senft Miller · 艺术与人的连接', wongle: 'Wongle · 字母奇遇记',
  bearaby: 'Bearaby · 重新定义重力寝具', 'residente-branding': 'Residente · 重塑音乐人的视觉身份',
  driver: 'Driver · 为癌症医疗建立新形象', 'espn-wethefans': 'ESPN · 致敬芝加哥熊队球迷',
  'jviews-almost-forgot': 'J.Views · 一支不一样的音乐视频', 'nat-geo': '国家地理 · 用熊的视角探索黄石',
  'youtube-kids-01': 'YouTube Kids · 为孩子打造的视频世界', 'the-fwa': 'FWA · 创意奖项的数字新面貌',
  youtubego: 'YouTube Go · 轻快自在的品牌表达', hollow: 'Katie Paterson · 一万棵树的数字森林',
  'google-spell-up': 'Google Spell Up · 让拼写变好玩', 'nasa-genelab': 'NASA GeneLab · 看见微重力生物学',
  'google-cloud-platform': 'Google Cloud · 云端技术的可视化', issuu: 'Issuu · 阅读与出版的新方式',
  zipline: 'Zipline · 让配送飞起来', 'strava-year-in-sport-2023': 'Strava · 2023 年度运动回顾',
  fingerspelling: 'Fingerspelling · 用机器学习练习手语', 'netflix-kids-and-family': 'Netflix · 给家庭的冒险邀请',
  aurorasolar: 'Aurora Solar · 加速太阳能的未来', 'the-bartlett-school-of-architecture-summer-show-2020': 'Bartlett · 云端建筑毕业展',
  metamansions: 'Meta Mansions · 虚拟居住的想象', 'google-kids-space-branding': 'Google Kids Space · 儿童空间的品牌宇宙',
  oppo: 'OPPO · 面向世界的统一设计语言', lyft: 'Lyft · 让出行连接更多可能',
  'jeans-for-refugees': 'Jeans for Refugees · 用设计传递改变', 'sideways-dictionary': 'Google Jigsaw · 换个角度解释科技',
  'epos-branding-meets-ecommerce': 'EPOS · 品牌与电商的交汇', moog: 'Moog · 合成器传奇的数字舞台',
  'youtube-kids-02': 'YouTube Kids · 有个性的童趣角色', virunga: '维龙加国家公园 · 守护刚果大猩猩',
  headbanger: 'Head Banger · 一场 AI 音乐实验', 'future-library': '未来图书馆 · 跨越百年的艺术',
  deshaw: 'D. E. Shaw · 金融也可以充满想象', 'youtube-gaming': 'YouTube Gaming · 游戏品牌新形象',
  garderobe: 'Garderobe · 当时尚遇见社交', bendy: 'Bendy 10 · 独一无二的个性海报',
  wove: 'Wove · 可弯曲的未来', 'moma-magritte': 'MoMA · 走进超现实主义数字展',
}
export const projects = source.projects.map(p => ({ ...p, name: [projectNames[p.id], p.title] as Copy, categories: p.tags.split(',').map(t=>t.trim()).filter(Boolean) }))
export type Project = (typeof projects)[number]
export const extras = source.extras
export const team = source.team
export const animatedImages: readonly string[] = animationSources

export const services: { id: string; title: Copy; intro: Copy; items: Copy[] }[] = [
  { id: 'products', title: ['数字产品', 'Digital products'], intro: ['从一个大胆的想法，到让人愿意使用的产品。用原型与真实反馈，让每一步都有方向。', 'From an ambitious idea to a product people want to use. Prototypes and real feedback guide every step.'], items: [['产品策略', 'Product strategy'], ['用户研究', 'User research'], ['体验与界面设计', 'UX & UI design'], ['AI 产品原型', 'AI prototyping']] },
  { id: 'experiences', title: ['数字体验', 'Digital experiences'], intro: ['让屏幕成为故事的入口。用互动、影像和技术，让品牌与人产生值得记住的连接。', 'Make the screen a doorway into a story. Interaction, film and technology create memorable connections.'], items: [['互动网站', 'Interactive websites'], ['三维与沉浸体验', '3D & immersive experiences'], ['创意开发', 'Creative development'], ['动态影像', 'Motion & film']] },
  { id: 'branding', title: ['品牌设计', 'Branding'], intro: ['好的品牌会生长。从策略到视觉与声音，创造既有个性、也能持续演化的表达系统。', 'Good brands grow. Connect strategy, visuals and sound in an expressive system with room to evolve.'], items: [['品牌定位', 'Brand positioning'], ['视觉识别', 'Visual identity'], ['插画与角色', 'Illustration & characters'], ['设计系统', 'Design systems']] },
]

export const values: Copy[] = [['先对人友善', 'Start with kindness'], ['让创意产生善意', 'Create positive change'], ['坦诚地沟通', 'Be honest'], ['享受探索的过程', 'Enjoy the journey'], ['说出来也听进去', 'Speak and listen'], ['一起解决问题', 'Solve problems together'], ['主动伸出援手', 'Help one another'], ['让团队成为答案', 'Work as a team']]
export const storyCopy: { id: string; title: Copy; category: Copy; minutes: number; paragraphs: Copy[] }[] = [
  {id:'generative-ai-ideas-for-e-commerce',title:['AI 如何重新想象电商体验', 'Rethinking commerce with generative AI'],category:['人工智能','Artificial intelligence'],minutes:15,paragraphs:[['从商品发现、空间搭配到购买决策，AI 的价值不只在于更快地产生内容，更在于帮助用户表达尚未说清楚的需求。家具购物尤其适合从真实生活情境出发。','From product discovery and room styling to purchase decisions, AI can help people articulate needs they have not yet put into words. Furniture shopping offers a useful setting for exploring these possibilities.'],['把创意变成可讨论的原型：尝试自然语言搜索、个性化搭配与情境可视化，再观察用户是否更容易做出选择。每一个实验都需要清楚的输入、可理解的结果与纠错方式。','Turn ideas into prototypes for natural language search, personalized combinations and contextual visualization. Each experiment needs clear inputs, understandable results and ways to correct mistakes.'],['设计应让人保持决定权。提供可比较的方案，解释建议来自哪里，并让用户随时调整或退出，才能让新技术成为有用的购物伙伴。','Keep people in control. Comparable options, transparent recommendations and easy adjustments help technology become a useful shopping companion.']]},
  {id:'the-web-can-do-what',title:['和 Google 一起探索网页的可能', 'Exploring what the web can become'],category:['网页技术','Web technology'],minutes:5,paragraphs:[['浏览器不只是展示文字与图片的容器。声音、摄像头、实时图形与手势可以共同组成新的表达方式，让网页成为可参与的体验。','A browser can combine sound, cameras, real-time graphics and gestures into experiences that invite participation.'],['有趣的技术演示需要一个简单易懂的入口。先让用户知道可以做什么，再通过即时反馈鼓励探索，让复杂能力藏在轻松的互动之后。','A strong technical demo starts with an understandable invitation. Immediate feedback encourages exploration while the interface keeps complexity manageable.'],['移动设备、输入方式与性能差异都属于设计的一部分。体验需要在不同条件下保持可读、可操作，并为减少动态效果提供选择。','Device performance and input methods are part of design. Experiences should stay readable and usable across conditions and respect motion preferences.']]},
  {id:'eating-together',title:['为什么我们喜欢一起吃饭', 'A place at the shared table'],category:['团队文化','Culture'],minutes:3,paragraphs:[['一起吃饭让不同项目、不同专业的人有机会离开各自的屏幕，分享生活里的小事。那些没有议程的谈话，常常是信任的起点。','A shared meal brings people away from their screens. Conversations without an agenda can become the beginning of trust.'],['设计团队的协作不仅发生在会议室。一个愿意倾听的环境，会让问题更早被看见，也让新的想法更容易被说出来。','Collaboration extends beyond meeting rooms. An environment built on listening helps people raise concerns early and share new ideas.'],['留出真正相处的时间，把照顾彼此变成日常。共同的餐桌也可以成为共同创作的基础。','Make time to be together and let mutual care become a daily habit. A shared table can support shared creative work.']]},
  {id:'sesame-workshop',title:['芝麻街背后的数字创意', 'Designing a digital home for Sesame Workshop'],category:['网站设计','Website'],minutes:4,paragraphs:[['面向儿童与家庭的组织，需要同时传达想象力、可信度与真实影响。网站应让不同受众迅速找到与自己相关的内容。','An organization serving children and families needs to express imagination, trust and real-world impact. Its website should help different audiences find relevant information.'],['以清晰的信息层级承载丰富的故事，让角色、色彩与图像为阅读服务。设计的亲和力与内容的严谨性可以同时成立。','Clear information hierarchy can support rich stories. Characters, color and imagery should aid reading while preserving accuracy.'],['从桌面到手机，确保导航、正文与关键入口始终可用。好奇心是入口，易用性则让访问者愿意留下。','Navigation, body text and key actions should remain accessible across devices. Curiosity opens the door; usability encourages people to stay.']]},
  {id:'designing-for-kids',title:['为孩子设计先从一起玩开始', 'Designing with children through play'],category:['创意方法','Creativity'],minutes:8,paragraphs:[['成人对好玩的想象，未必等于孩子真实的体验。观察孩子如何理解界面、如何试错，比预先替他们决定答案更有价值。','Adult assumptions about fun may differ from children’s experiences. Watching how children interpret interfaces and experiment is more useful than deciding every answer in advance.'],['把测试变成轻松的活动，通过纸面模型、角色和可触摸的材料，让孩子能够表达自己的偏好。关注行为，也认真听取语言里的线索。','Use paper prototypes, characters and tangible materials to make testing approachable. Observe behavior and listen to how children describe their choices.'],['明确反馈、适当节奏与安全边界共同构成好的体验。设计应鼓励探索，而不是用复杂操作限制想象。','Clear feedback, thoughtful pacing and safe boundaries support exploration without letting complex controls get in the way.']]},
  {id:'secret-ingredients',title:['一个好项目需要哪些秘密配方', 'What makes a project work well'],category:['团队文化','Culture'],minutes:4,paragraphs:[['清晰的问题、彼此信任的团队和愿意共同探索的合作伙伴，是创意项目的基础。开始之前，先对目标与成功标准达成理解。','A clear problem, a trusting team and collaborative partners provide the foundation. Agree on goals and a definition of success before starting.'],['让设计与技术尽早一起工作，通过小规模实验发现限制。及时展示尚未完成的想法，能让讨论聚焦在方向，而非最后一刻的修补。','Bring design and technology together early. Small experiments reveal constraints, and showing unfinished ideas helps the team discuss direction before late changes become costly.'],['好的交付也包含复盘。记录做对了什么、哪些假设需要调整，让这次合作的经验成为下一次的起点。','A good delivery includes reflection. Record what worked and which assumptions changed so the next collaboration starts with better knowledge.']]},
  {id:'google-cloud',title:['把云基础设施变成可以探索的世界', 'Making cloud infrastructure explorable'],category:['创意开发','Creative development'],minutes:13,paragraphs:[['抽象的云计算可以通过空间、路径和层次变得容易理解。三维体验的目的不是装饰，而是让用户看见服务之间的关系。','Space, paths and layers can make abstract cloud concepts easier to understand. The purpose of a 3D experience is to reveal relationships between services.'],['将复杂信息拆分为可逐步探索的区域，并通过镜头运动、交互反馈和适量文字提供引导。每一个视觉决定都需要服务于理解。','Divide complex information into areas that people can explore gradually. Camera motion, interaction feedback and concise explanations provide orientation.'],['图形性能、素材体积与设备能力共同影响体验。把资源加载和渐进呈现纳入设计过程，让更多设备都能顺畅参与。','Graphics performance, asset size and device capability all shape usability. Plan resource loading and progressive presentation as part of the experience.']]},
]
export const articles = storyCopy.map(copy => ({ ...copy, gallery: source.articles.find(a=>a.id===copy.id)?.gallery ?? [] }))
