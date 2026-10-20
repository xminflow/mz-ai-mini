export type Copy = [string, string]

export const image = (name: string) => `/templates/studiothink/${name}`

export type Project = {
  slug: string
  title: string
  type: Copy
  description: Copy
  cover: string
}

export const projects: Project[] = [
  {
    slug: 'kaito-tea',
    title: 'Kaito Tea Co.',
    type: ['品牌识别', 'brand identity'],
    description: ['扎根茶文化的品牌识别，平静、真诚且有手作温度。', 'A calm identity rooted in tea culture, with a warm crafted feel.'],
    cover: image('kaito.jpg'),
  },
  {
    slug: 'paper-and-bloom',
    title: 'Paper & Bloom Issue No. 02',
    type: ['印刷设计', 'print design'],
    description: ['植物主题刊物，以鲜明编排和细节讲述故事。', 'A botanical publication shaped by expressive layouts and tactile details.'],
    cover: image('paper-bloom.jpg'),
  },
  {
    slug: 'sitelines',
    title: 'SiteLines — Annual Design Report',
    type: ['编辑设计', 'editorial design'],
    description: ['清晰的编辑系统，让复杂信息更易理解。', 'A clear editorial system that makes complex information easier to understand.'],
    cover: image('sitelines.jpg'),
  },
  {
    slug: 'crafted-objects',
    title: 'Crafted Objects Exhibition',
    type: ['定制项目', 'custom project'],
    description: ['大胆字体与松弛笔触结合的展览识别。', 'An exhibition identity pairing bold type with loose, gestural elements.'],
    cover: image('crafted-objects.jpg'),
  },
]

export const team: Array<[string, Copy, string]> = [
  ['Dung Nguyen', ['创意总监与创始人', 'Creative Director & Founder'], 'dung.jpg'],
  ['Linh Tran', ['资深品牌设计师', 'Senior Brand Designer'], 'linh.jpg'],
  ['Minh Pham', ['数字设计负责人', 'Digital Design Lead'], 'minh.jpg'],
  ['Hoa Le', ['动态设计师', 'Motion Designer'], 'hoa.jpg'],
]

export const services: Copy[] = [
  ['品牌识别与策略', 'Brand Identity & Strategy'],
  ['数字设计', 'Digital Design'],
  ['印刷与包装', 'Print & Packaging'],
  ['营销物料', 'Marketing & Collateral'],
  ['艺术指导', 'Art Direction'],
]

export const achievements: Copy[] = [
  ['Graphic Design Annual 2024 — 金奖，品牌识别', 'Graphic Design Annual 2024 — Gold Award, Brand Identity'],
  ['Communication Arts 2023 — 卓越奖，数字设计', 'Communication Arts 2023 — Award of Excellence, Digital Design'],
  ['The FWA 2023 — 当日网站', 'The FWA 2023 — Site of the Day'],
  ['Red Dot Design Award 2022 — 包装设计得主', 'Red Dot Design Award 2022 — Winner, Packaging Design'],
  ['AIGA 50 Books 2022 — 入选作品', 'AIGA 50 Books 2022 — Selected Work'],
  ['Awwwards 2021 — 荣誉提名', 'Awwwards 2021 — Honorable Mention'],
]

export const superpowers: Array<[Copy, Copy]> = [
  [['洞察', 'Insights'], ['向下看，答案通常就藏在这里', 'look deeper — the answer’s usually hiding here']],
  [['协作', 'Collaboration'], ['一起思考，才会出现更好的答案 →', 'best ideas happen when we think together →']],
  [['可持续', 'Sustainability'], ['从小选择开始，留下长期影响', 'small choices, long-term impact']],
  [['速度', 'Speed'], ['快速推进，但从不仓促', 'quick, but never rushed']],
  [['视觉叙事', 'Visual Storytelling'], ['让人真正感受到些什么 ✦', 'make people feel something ✦']],
  [['好奇心', 'Curiosity'], ['问为什么……然后再问一次为什么', 'ask why… and then ask why again']],
]
