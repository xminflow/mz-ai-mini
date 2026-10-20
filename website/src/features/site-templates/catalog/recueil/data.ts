import type { TemplateLocale } from '../../types'

export type Copy = readonly [string, string]
export const t = (locale: TemplateLocale, zh: string, en: string) => locale === 'en' ? en : zh
export const pick = (locale: TemplateLocale, copy: Copy) => copy[locale === 'en' ? 1 : 0]
export const asset = (name: string) => `/templates/recueil/assets/${name}`
export const images = {
  hero: 'hWpcjUdKuCpHkjZED9Hdf7pk14.webp', heroVideo: 'hero-loop.mp4',
  halo: 'vqDUiti0AUogX1iFZPQaVeuiks.webp', ember: 'aA1k6uTWzUAS7PdwhmauSyS2wk.webp', tide: 'SW1wU0ewx6JC9s22PitT0EQzb18.webp',
  perfumer: 'TU7BpZTzNA2q3ayegKLZ1F985g4.webp', iris: '2bPxLwXX1pc7q4VPYs8CIC0cYE.webp',
  cedar: 'edhP9KDcxSx57ZN1bDKM2J0UMo.webp', water: 'nxXyFXGiz2DuJNL4uOrcUj9o7Q.webp',
  tea: 'GyKLDjVIfRy7qES55PfwBUrU.webp', bergamot: '8C08Iq04kEBJOG27tFVaxE0K9Bg.webp', saffron: 'ruDokhljnPDImAAxKqKBfl4bZI.webp',
  naoko: 'kM33NON21DUDnJfRtOykw68ljc.webp', adrien: '64OB4OpkmqR054Hja2tYVy6YwWU.webp',
  detail: 'ZTT1M78pbQgUaT7x7QVNenzk2m4.webp',
} as const

export const navigation = [
  ['library', '香氛库', 'Library'], ['benefits', '细节', 'Benefits'], ['ingridients', '原料', 'Palette'],
  ['stories', '故事', 'Stories'], ['howitworks', '如何订阅', 'How it works'], ['pricing', '订阅方案', 'Pricing'],
] as const

export const fragrances: {name: Copy; image: string; description: Copy; notes: Copy}[] = [
  {name:['光晕','Halo'],image:images.halo,description:['像雨停后推开窗的第一口空气。鸢尾的柔软与白雪松的清透，让日常慢慢亮起来。','A gentle iris opening settles into pale cedar: a soft, clear companion for a fresh morning.'],notes:['鸢尾 · 云水 · 白雪松','Iris · Cloud water · White cedar']},
  {name:['余烬','Ember'],image:images.ember,description:['把傍晚的暖意留在衣领。琥珀与香草缓慢铺开，一缕藏红花带来恰好的深度。','Amber meets a quiet trace of vanilla and saffron, carrying the warmth of a long evening.'],notes:['琥珀 · 香草 · 藏红花','Amber · Vanilla · Saffron']},
  {name:['潮汐','Tide'],image:images.tide,description:['沿着安静的海岸散步。佛手柑的明亮落入柏木与海盐，留下轻盈而干净的尾调。','Bright bergamot, blue cypress and a salt-air finish recall an unhurried walk beside the sea.'],notes:['海盐 · 蓝柏 · 佛手柑','Sea salt · Blue cypress · Bergamot']},
]

export const materials: {name: Copy; latin: string; image: string; description: Copy; position: Copy; origin: Copy; method: Copy}[] = [
  {name:['鸢尾','Iris'],latin:'Iris pallida',image:images.iris,description:['细腻粉感里带着雨后泥土的安静。根茎经过时间沉淀，才显露出含蓄的紫罗兰气息。','Soft powder and earthy violet bring a calm, textured centre to the composition. The root develops its character through patient ageing.'],position:['中调','Heart'],origin:['意大利 · 托斯卡纳','Tuscany · Italy'],method:['鸢尾根脂萃取','Orris butter extraction']},
  {name:['阿特拉斯雪松','Atlas cedar'],latin:'Cedrus atlantica',image:images.cedar,description:['干燥木质与轻微树脂感交织，让花香拥有清晰轮廓，也为尾调留下温暖的支撑。','Dry wood and a resinous trace give the flowers a clear outline and a warm, lasting foundation.'],position:['后调','Base'],origin:['摩洛哥 · 阿特拉斯山','Atlas Mountains · Morocco'],method:['木材蒸汽蒸馏','Steam-distilled wood']},
  {name:['云水','Cloud water'],latin:'Atelier accord',image:images.water,description:['以轻盈水感构筑的调香意象，连接清晨薄雾与透明花瓣，让整支香气更有呼吸感。','An airy studio accord that links morning mist with translucent petals, adding room for every other note to breathe.'],position:['前调','Top'],origin:['工坊调香意象','Atelier composition'],method:['水感香调组合','Fresh-water accord']},
  {name:['白茶','White tea'],latin:'Camellia sinensis',image:images.tea,description:['像刚打开的茶叶盒，带着微甜、干净与轻柔绿意。它让花香放松下来，适合贴近日常。','Delicate green warmth, a little sweetness and the quiet familiarity of a freshly opened tea tin.'],position:['中调','Heart'],origin:['中国 · 福建','Fujian · China'],method:['茶叶香气重构','Tea-leaf accord']},
  {name:['佛手柑','Bergamot'],latin:'Citrus bergamia',image:images.bergamot,description:['清新柑橘里藏着一点柔和苦韵。明亮的开场不会喧闹，而是像阳光缓缓落在窗边。','A luminous citrus opening with a gentle bitter edge, brightening the fragrance without overwhelming it.'],position:['前调','Top'],origin:['意大利 · 卡拉布里亚','Calabria · Italy'],method:['果皮冷压','Cold-pressed peel']},
  {name:['藏红花','Saffron'],latin:'Crocus sativus',image:images.saffron,description:['一丝干燥辛香带来丰富层次，与琥珀和木质相遇时，呈现温暖、克制而耐人寻味的质感。','A dry, subtly spiced thread that lends depth to amber and wood, warm in character and restrained in intensity.'],position:['中调','Heart'],origin:['地中海产区','Mediterranean region'],method:['香料浸提','Spice extraction']},
]

export const plans: {id:string; name:Copy; cadence:Copy;price:number;features:Copy[]}[] = [
  {id:'bi-monthly',name:['双月探索','Bi-monthly'],cadence:['每两月 1 瓶 · 8ml','1 × 8ml every two months'],price:22,features:[['每两个月发现一支新香','One discovery every other month'],['从季节香氛库中人工挑选','Selected from the seasonal library'],['随盒附调香师手记','A note explaining the composition'],['可随时暂停或结束','Flexible pauses and cancellation']]},
  {id:'monthly',name:['每月灵感','Monthly'],cadence:['每月 1 瓶 · 8ml','1 × 8ml each month'],price:36,features:[['每月收到一支精选香氛','One new fragrance each month'],['正装升级享会员价格','Member pricing on full bottles'],['不合适时可反馈调整','Your feedback guides future picks'],['优先发现季节限定香气','Discover seasonal compositions']]},
  {id:'duo',name:['双人共享','Duo'],cadence:['每月 2 瓶 · 8ml','2 × 8ml each month'],price:62,features:[['每月两种气味，一起探索','Two scents to explore together'],['适合分享或丰富香氛衣橱','Share or grow your own wardrobe'],['享有正装会员升级价格','Member pricing on full bottles'],['优先体验小批次作品','Early access to small editions']]},
]

export const faqs: {question:Copy;answer:Copy}[] = [
  {question:['每个月的香气如何选择？','How is my monthly fragrance selected?'],answer:['演示方案以香气偏好、季节和过往反馈作为挑选线索。真实订阅上线后，调香团队会结合这些信息设计轮换；此处不会创建真实会员档案。','The concept combines preferences, season and feedback to guide a human-curated rotation. This demo does not create a real member profile.']},
  {question:['收到的香气不适合我怎么办？','What if the scent is not for me?'],answer:['可以记录不喜欢的香调，并在下一次选择时调整。页面展示换香的服务概念，尚未提供真实物流或售后服务。','You can describe the notes you would change for a future selection. Exchanges are a service concept here; no real shipping or returns are arranged.']},
  {question:['可以暂停或取消吗？','Can I pause or cancel?'],answer:['三种方案均展示灵活订阅的设计，不设置长期承诺。本模板没有支付或自动续费功能，也不会从你的账户扣款。','All three example plans are designed around flexibility. This template has no payment or automatic renewal functionality and cannot charge your account.']},
  {question:['8ml 香瓶可以重复使用吗？','Can the 8ml bottle be reused?'],answer:['产品概念采用可补充的小容量瓶，减少闲置与包装。具体材质、补充方式及回收安排，需要真实品牌上线时确认。','The product concept uses a small refillable bottle. Materials, refill instructions and recycling arrangements require confirmation by the operating brand.']},
  {question:['配送范围与包装是什么样的？','Where do you deliver and how is it packed?'],answer:['参考设计采用保护性纸质包装。当前是本地演示，不收集地址、不安排发货；实际配送地区、费用与时效应在接入业务后明确。','The concept uses protective paper packaging. This local demo does not collect addresses or ship parcels; service regions and delivery terms must be defined before launch.']},
]

export const policies: {title:Copy;body:Copy}[] = [
  {title:['适用范围','Scope'],body:['本说明适用于微域生光香氛订阅模板的界面演示。品牌、价格、人物故事与服务流程均为示意，不构成实际商品交易或服务承诺。','This notice describes the Weelume fragrance template demo. Brand stories, prices and service flows are illustrative and do not constitute a live offer.']},
  {title:['填写的信息','Information you enter'],body:['电子信箱和方案表单仅在当前浏览器内执行校验。姓名、邮箱、香调偏好不会由这些演示表单发送到服务器，也不会写入本地存储。刷新或关闭页面后，未提交的表单状态会清除。','Email and plan forms validate within the current browser. These demo forms do not transmit names, emails or scent preferences to a server and do not persist them in local storage. Refreshing or closing the page clears form state.']},
  {title:['技术请求与日志','Technical requests and logs'],body:['浏览页面仍需向网站托管服务请求页面、脚本、图片与字体。托管服务可能按照其配置记录必要的技术访问日志；这与演示表单不发送填写信息是不同的数据流。','Visiting the site requests pages, scripts, images and fonts from its host. The host may retain technical access logs according to its configuration; this is separate from the demo forms, which do not submit entered data.']},
  {title:['使用目的','Purpose'],body:['本模板用于展示选香、方案选择、邮件订阅与响应式设计。尚未接入账户、订单、支付、配送、营销邮件或客户管理系统。','The template demonstrates scent selection, plan choices, email validation and responsive design. Accounts, orders, payments, delivery, mailing services and customer management are not connected.']},
  {title:['共享与第三方','Sharing and third parties'],body:['演示表单没有第三方收件方，不会把填写内容交给支付、物流或邮件服务。站内图像与字体采用本地资源；真实业务如增加供应商，应先更新说明并按需取得同意。','Demo form entries have no third-party recipient. Images and fonts are hosted locally. A live implementation should identify any payment, delivery or email provider before collecting relevant information.']},
  {title:['Cookie 与存储','Cookies and storage'],body:['该模板表单不设置营销 Cookie，也不持久化偏好或邮箱。网站外层服务的存储行为应以实际部署配置与网站统一说明为准。','The template forms set no marketing cookies and do not persist email addresses or preferences. Any host-level storage behaviour depends on the deployed site configuration.']},
  {title:['保留与清除','Retention and clearing'],body:['本地表单状态仅在当前页面会话中存在，可刷新页面清除。若后续接入真实服务，应定义保留期限、删除入口、备份处理及必要的业务记录要求。','In-page form state can be cleared by refreshing. A live service must define retention periods, deletion routes, backup handling and any required business records.']},
  {title:['你的选择','Your choices'],body:['你可以不填写任何表单而浏览全部内容。若不希望在页面中保留输入，清空表单或刷新即可。真实业务上线后，访问、更正、删除与撤回同意应提供可用入口。','All content is available without completing a form. Clear a field or refresh to remove in-page input. A live service should provide working access, correction, deletion and consent controls.']},
  {title:['安全与支付','Security and payments'],body:['请勿在演示中输入支付卡、证件号码或其他敏感信息。此处没有支付入口，不接收真实订单。正式服务需要结合部署环境进行安全评估。','Do not enter payment details, identity numbers or other sensitive data in the demo. No payment or real order is accepted. A production service requires a security review of its actual deployment.']},
  {title:['跨境与未成年人','Transfers and minors'],body:['演示表单不进行跨境传输。真实服务如面向不同地区或未成年人，应根据实际数据流补充适用说明和必要保护措施。','Demo forms do not transfer entries internationally. Any live service serving multiple regions or minors must describe its real data flows and appropriate safeguards.']},
  {title:['素材与变更','Materials and updates'],body:['参考站图片保留来源记录，公开可访问不代表取得商业再分发许可。商业使用前需授权或替换。此说明应在功能、供应商或数据流变更时同步更新。','Image sources are recorded; public access does not grant commercial redistribution rights. Obtain permission or replace assets before commercial use. Update this notice when functionality or data flows change.']},
  {title:['联系','Contact'],body:['该模板不展示虚构的客服邮箱或地址。请通过微域生光模板市场联系实际项目负责人，真实服务上线时补充有效的隐私联系渠道。','No fictional support address is presented. Contact the project owner through the Weelume template marketplace; a live service should publish a valid privacy contact.']},
]

