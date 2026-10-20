import media from './media.json'
import type { TemplateLocale } from '../../types'

export type Copy = readonly [string, string]
export const pick = (locale: TemplateLocale, value: Copy): string => value[locale === 'en' ? 1 : 0]
export const t = (locale: TemplateLocale, zh: string, en: string): string => locale === 'en' ? en : zh
export const asset = (file: string): string => `/templates/noirei/assets/${file}`

export function photos(path: string, count = 4): string[] {
  const files = (media as Record<string, string[]>)[path]
  if (!files) throw new Error(`[noirei] 未登记的素材路径：${path}`)
  return files.slice(0, count).map(asset)
}

export interface Room {
  slug: string
  name: Copy
  kind: 'rooms' | 'suites' | 'villas'
  size: number
  guests: number
  price: number
  bed: Copy
  view: Copy
  intro: Copy
  subhead: Copy
  body: Copy[]
  amenities: Copy[]
}

export const rooms: Room[] = [
  {
    slug: 'lake-classic-room', name: ['经典湖景客房', 'Lake Classic Room'], kind: 'rooms', size: 32, guests: 2, price: 640,
    bed: ['特大床', 'King bed'], view: ['湖景', 'Lake view'],
    intro: ['推开百叶窗，让湖面的微风住进房间', 'An intimate lakeside room, with high windows and a balcony made for morning coffee.'],
    subhead: ['把午后留给湖光', 'An afternoon in the light'],
    body: [
      ['位于 1911 年主楼的一层，高挑的天花板与原有水磨石地面共同保留了老宅的气质。石质阳台安放着两把椅子，刚好容得下一壶咖啡。', 'On the first floor of the historic villa, restored terrazzo and tall ceilings frame a small stone balcony. Two chairs and a pot of coffee are all it needs.'],
      ['房间朝向西面的湖水，下午的阳光缓缓铺满地板。亚麻遮光帘让深睡变得容易，也可以一直敞开，看光线慢慢变化。', 'West-facing windows catch the late sun. Keep the linen curtains open to watch the lake change colour, or close them for a long, quiet sleep.'],
      ['本地灰石淋浴间、临窗书桌和宽敞衣柜，让短暂的停留也能像在家一样从容。早餐可以送到阳台，供应至上午 11 点。', 'A local-stone shower, a writing desk and generous storage make longer visits comfortable. Have breakfast on the balcony whenever you wake, until eleven.'],
    ],
    amenities: [['面向湖水的石质阳台', 'Private stone balcony'], ['本地灰石步入式淋浴', 'Walk-in stone shower'], ['亚麻床品与多种枕头', 'Linen bedding and a choice of pillows'], ['咖啡机与散叶茶', 'Espresso and loose-leaf tea'], ['阳台早餐服务', 'Breakfast delivered to your balcony']],
  },
  {
    slug: 'garden-deluxe-room', name: ['花园豪华客房', 'Garden Deluxe Room'], kind: 'rooms', size: 38, guests: 2, price: 720,
    bed: ['大床或双床', 'King or twin beds'], view: ['花园景观', 'Garden view'],
    intro: ['从私人露台走入柏树小径，听见夜里的泉水', 'Step from your terrace into the cypress garden, with the fountain close enough to hear at night.'],
    subhead: ['在盛夏也保持清凉', 'Sheltered from the summer heat'],
    body: [
      ['花园客房安置在旧柠檬温室中。低矮的长屋沿着柏树步道展开，每间都有葡萄藤下的碎石露台。', 'The former lemon house now holds garden rooms, each opening onto a gravel terrace shaded by vines beside the cypress path.'],
      ['厚实的石墙让盛夏的午后依然凉爽。傍晚，园丁会点亮小径上的灯，把回房间的路照得温柔。', 'Deep stone walls temper the July heat. At dusk, small lamps along the path lead you back through the garden.'],
      ['床铺可以按需要布置为一张大床或两张单人床。铜质浴缸与独立淋浴间分开设置，部分客房提供无台阶入口。', 'Choose a king bed or two singles. Bathrooms combine a copper bath with a separate shower, and selected rooms offer step-free access.'],
    ],
    amenities: [['葡萄藤下的私人露台', 'A terrace beneath the vines'], ['铜质浴缸与独立淋浴', 'Copper bath and separate shower'], ['灵活的大床或双床', 'Flexible king or twin layout'], ['花园草本茶', 'Herbal tea from the garden'], ['可安排无台阶客房', 'Step-free rooms available']],
  },
  {
    slug: 'belvedere-junior-suite', name: ['观景小套房', 'Belvedere Junior Suite'], kind: 'suites', size: 52, guests: 3, price: 980,
    bed: ['特大床与休憩床', 'King bed and daybed'], view: ['湖光与山色', 'Lake and mountain views'],
    intro: ['住进老宅顶层转角，在塔楼的一把椅子里读完一本书', 'A corner of the upper villa, with views in two directions and a quiet turret for reading.'],
    subhead: ['为三个人预留的空间', 'A little more room to share'],
    body: [
      ['套房占据别墅顶层的转角，一侧面向湖水，一侧望向山脉。小塔楼里只摆放着阅读椅和一盏灯。', 'Windows on two sides bring the mountains and lake into the suite. The turret is kept simple: one comfortable chair, one reading lamp.'],
      ['起居区的休憩床可以为第三位旅客铺成正式床铺。浴室的独立浴缸位于天窗下，让沐浴也拥有自然光。', 'The daybed becomes a proper bed for a third guest. A freestanding bath sits below a skylight in the generous bathroom.'],
      ['渡轮在远处来回穿梭。窗台上准备了望远镜和湖区地图，留给那些不急着出门的早晨。', 'A pair of binoculars and a lake chart wait by the window for mornings spent following the ferries across the water.'],
    ],
    amenities: [['两面采光的转角空间', 'Dual-aspect corner windows'], ['塔楼阅读角', 'A private turret reading nook'], ['可供第三位旅客休息的床位', 'Daybed for a third guest'], ['天窗下的独立浴缸', 'Freestanding bath below a skylight'], ['望远镜与湖区地图', 'Binoculars and a lake chart']],
  },
  {
    slug: 'terrace-suite', name: ['湖畔露台套房', 'Terrace Suite'], kind: 'suites', size: 64, guests: 2, price: 1250,
    bed: ['特大床', 'King bed'], view: ['开阔湖景', 'Open lake views'],
    intro: ['一座悬在水面上的露台，一间适合慢下来的套房', 'A generous suite with a private lake terrace and a deep bath beside the window.'],
    subhead: ['把风景留给浴缸', 'The best seat faces the water'],
    body: [
      ['四间露台套房沿主楼湖岸一侧排开。每间约 30 平方米的露台，铺着修复时保留下来的老地砖。', 'Four suites line the waterfront side of the villa. Each opens onto a terrace of around thirty square metres, finished with tiles saved during the restoration.'],
      ['独立浴缸紧靠窗边。想要私密时合上百叶窗，想看湖时便把它打开，时间不必被安排。', 'Open the shutters beside the bath to the lake, or close them for complete privacy. There is no reason to hurry.'],
      ['露台可安排私人晚餐。提前告知礼宾团队，我们会在天色暗下来前准备好餐桌和灯笼。', 'Dinner can be brought from the kitchen to your terrace. Let the concierge know early, and the table will be ready as evening falls.'],
    ],
    amenities: [['约 30 平方米私人露台', 'Private terrace of approximately 30 m²'], ['临窗独立深浴缸', 'Deep bath beside the window'], ['露台私人用餐', 'Private terrace dining'], ['独立衣帽间', 'Separate dressing room'], ['夜间开床服务', 'Evening turndown']],
  },
  {
    slug: 'villa-cipresso', name: ['柏树花园别墅', 'Villa Cipresso'], kind: 'villas', size: 140, guests: 4, price: 2400,
    bed: ['两间大床卧室', 'Two king bedrooms'], view: ['花园与湖景', 'Garden and lake views'],
    intro: ['柏树小径尽头的两卧别墅，拥有自己的花园和泳池', 'An independent garden home with two bedrooms, a private pool and a path down to the lake.'],
    subhead: ['像拥有一座自己的家', 'A home with space around it'],
    body: [
      ['由昔日园丁住宅改造而成，别墅位于柏树步道尽头。围合花园中的十二米泳池，朝着湖面的方向延伸。', 'Once the gardener’s home, this villa stands apart from the main house. Its enclosed garden holds a twelve-metre pool above the lakeside slope.'],
      ['两间卧室各有独立卫浴，壁炉客厅和小厨房供家人相聚。花园的侧门可以直接通往湖边步道。', 'Two en-suite bedrooms share a kitchen and a sitting room with a fireplace. A garden gate opens directly onto the shore path.'],
      ['住店期间可联系专属管家。早餐会在您选定的时间送到花园，然后把安静留给您。', 'A dedicated host looks after arrangements during your stay, bringing breakfast at your chosen hour before leaving the garden to you.'],
    ],
    amenities: [['十二米私人恒温泳池', 'Private twelve-metre heated pool'], ['双卧室与独立卫浴', 'Two en-suite bedrooms'], ['带壁炉的起居室', 'Sitting room with fireplace'], ['围合花园与私人入口', 'Enclosed garden and private entrance'], ['专属管家服务', 'A dedicated villa host']],
  },
  {
    slug: 'the-noire-residence', name: ['湖上私邸', 'The Lake Residence'], kind: 'villas', size: 220, guests: 6, price: 3800,
    bed: ['三间卧室', 'Three bedrooms'], view: ['湖泊与群山', 'Lake and mountains'],
    intro: ['船屋之上的三卧私邸，拥有长客厅与独立泊位', 'The boathouse upper floor, with three bedrooms, a long living room and your own mooring.'],
    subhead: ['为家人，也为长住', 'For time spent together'],
    body: [
      ['私邸位于历史船屋的顶层。客厅贯穿建筑，两端的窗分别望向群山与湖水，阳台下方就是私人泊位。', 'The residence occupies the upper boathouse. A living room runs its length, with mountain-facing windows and a balcony above the private mooring.'],
      ['三间卧室、三间浴室、八人餐桌与完整厨房，让多代家庭或朋友能够自在相处。厨房可按入住前的清单准备食材。', 'Three bedrooms and bathrooms, a dining table for eight and a fully equipped kitchen give families room to settle in. Provisions can be arranged ahead of arrival.'],
      ['入住包含从科莫出发的抵达船程。熟悉湖区的管家协助安排旅程，船也可以在家门口接您出发。', 'An arrival transfer from Como is included. Your host can help with every outing, and the hotel boat can collect you at the door.'],
    ],
    amenities: [['三卧室与三间浴室', 'Three bedrooms and three bathrooms'], ['长客厅及八人餐桌', 'Full-length living space and dining for eight'], ['阳台下的私人泊位', 'Private mooring below the balcony'], ['抵达时的科莫船舶接送', 'Arrival boat transfer from Como'], ['可按需求备货的厨房', 'Kitchen provisions arranged for you']],
  },
]

export interface Experience {
  slug: string
  name: Copy
  category: 'dining' | 'spa' | 'lake'
  duration: Copy
  price: Copy
  intro: Copy
  subhead: Copy
  body: Copy[]
}

export const experiences: Experience[] = [
  {
    slug: 'lakeside-dinner-at-la-darsena', name: ['水岸餐厅晚餐', 'Dinner beside the lake'], category: 'dining', duration: ['每日 19:30 起', 'Evenings, from 19:30'], price: ['每位 €140', '€140 per person'],
    intro: ['湖里的鲜鱼、邻近山谷的米，以及夜色中一张灯火温柔的餐桌', 'A lantern-lit table by the water, with local fish, garden vegetables and rice from the neighbouring valley.'],
    subhead: ['厨房跟随湖水的节奏', 'The lake sets the menu'],
    body: [
      ['餐厅设在旧船屋露台，十四张餐桌沿水面展开。最近的一张桌子，离湖水只有一步的距离。', 'Fourteen tables occupy the old boat terrace. The closest tables sit just a step from the water.'],
      ['莱泽诺的渔民送来当日鲜鱼，花园提供蔬菜，稻米来自伦巴第平原。每天的菜单，会随着收获和渔船改变。', 'The catch comes from local fishermen, vegetables from the hillside beds and rice from Lombardy. The kitchen changes its plans with the day’s deliveries.'],
      ['想在日落时用餐，可以提前预留靠湖的位置。请在预约时告知饮食偏好，礼宾团队会协助确认。', 'Request a waterside table for sunset and share any dietary preferences when enquiring. The concierge will confirm what can be arranged.'],
    ],
  },
  {
    slug: 'the-stone-spa-ritual', name: ['温石水疗仪式', 'The Stone Spa Ritual'], category: 'spa', duration: ['90 分钟', '90 minutes'], price: ['€190', '€190'],
    intro: ['走入老宅下方的石拱空间，在温石、蒸汽与冷泉之间放松', 'A restorative sequence of steam, spring water and warm stones in the vaults beneath the villa.'],
    subhead: ['来自岸边的温暖', 'Stones from the shore'],
    body: [
      ['水疗空间由旧蓄水池改造，厚厚的石墙让声音轻下来。先在蒸汽房停留，再体验由山泉补充的冷水池。', 'The original cisterns now house the spa. Begin in the steam room before a short immersion in the spring-fed cold pool.'],
      ['每年春天，我们会从花园下方的湖岸收集圆石。护理师将石头温热，用它们缓慢舒展肩背。', 'Smooth stones are gathered below the garden and warmed in water. Your therapist uses them to ease the back and shoulders.'],
      ['结束后，到休憩室喝一杯花园洋甘菊茶。您可以小睡片刻，或者继续安静地看一本书。', 'Finish with garden chamomile in the relaxation room. Stay to read, or simply close your eyes for a while.'],
    ],
  },
  {
    slug: 'private-boat-to-bellagio', name: ['私船前往贝拉焦', 'Bellagio by private boat'], category: 'lake', duration: ['半日', 'Half a day'], price: ['每船 €420', '€420 per boat'],
    intro: ['乘坐修复后的木船，和熟悉湖水的船长一起慢慢横渡', 'Cross the lake in our restored wooden boat, guided by a captain who knows every inlet.'],
    subhead: ['把横渡也变成旅程', 'Take the scenic crossing'],
    body: [
      ['这艘木船诞生于 1962 年，可容纳六位客人。修复后的船身保留了木材的温度，也换上了更安静的动力。', 'Built in 1962 and restored for six guests, the boat keeps its timber character while travelling with a quieter modern motor.'],
      ['航线经过西岸别墅与内索瀑布。在贝拉焦停留两小时后，船长会在约定的码头等候返程。', 'Cruise past the western villas and the waterfall at Nesso. Spend time wandering Bellagio before meeting the captain for the return.'],
      ['即使在夏季，也建议带一件薄外套。湖面的风，总比露台上感受到的更凉一些。', 'Bring a light layer, even in summer. The breeze over open water can be cooler than the air on shore.'],
    ],
  },
  {
    slug: 'morning-hike-to-san-martino', name: ['圣马蒂诺晨间徒步', 'A morning at San Martino'], category: 'lake', duration: ['3 小时', '3 hours'], price: ['住店包含', 'Included for guests'],
    intro: ['穿过栗树林，去湖面上方的小教堂分享一壶咖啡', 'An early woodland walk to a hillside chapel, with a flask of coffee waiting at the top.'],
    subhead: ['在山顶看见三条湖湾', 'A view across three branches'],
    body: [
      ['七点出发，避开午后的热气。先乘船到对岸，再沿栗树与山毛榉林间的步道向上走。', 'Leave early by boat, then follow a shaded trail through chestnut and beech woodland before the day becomes warm.'],
      ['小教堂前的露台比湖面高约四百米。向导带着热咖啡与面包，在这里可以一次望见三条湖湾。', 'The chapel terrace stands around four hundred metres above the water. Your guide brings warm bread and coffee for a pause with a wide lake view.'],
      ['穿一双舒适防滑的鞋就可以出发，酒店可借用登山杖。行程会根据天气和客人的步速调整。', 'Comfortable walking shoes are enough; poles are available to borrow. The route and pace are adjusted to the weather and the group.'],
    ],
  },
  {
    slug: 'wine-cellar-tasting', name: ['古老酒窖品鉴', 'An evening in the cellar'], category: 'dining', duration: ['75 分钟', '75 minutes'], price: ['每位 €85', '€85 per person'],
    intro: ['在老酒窖的烛光下，品尝山谷与伦巴第丘陵的六款酒', 'Six small-producer wines, served with local flavours in the original stone cellar.'],
    subhead: ['山地风土的味道', 'Wines shaped by the mountains'],
    body: [
      ['酒窖开凿于别墅后方的山体，石壁让室温一年四季都保持在约十三度。', 'Cut into the hillside when the house was built, the cellar stays naturally close to thirteen degrees throughout the year.'],
      ['侍酒师挑选来自瓦尔泰利纳与贝加莫周边的小型酒庄，搭配风干牛肉、陈年奶酪、黑麦面包与蜂蜜。', 'The sommelier selects bottles from Valtellina and the hills around Bergamo, paired with cured meat, aged cheese, rye bread and honey.'],
      ['周四与周六晚间开放，每组最多八人。希望独享酒窖的客人，可以向礼宾团队咨询私人场次。', 'Small tastings run on Thursday and Saturday evenings for up to eight guests. Ask the concierge about a private session.'],
    ],
  },
  {
    slug: 'silk-workshop-in-como', name: ['科莫丝织工坊', 'Inside a Como silk workshop'], category: 'lake', duration: ['半日', 'Half a day'], price: ['每位 €160', '€160 per person'],
    intro: ['走进四代传承的织坊，亲手织下一小段科莫的历史', 'Meet a family of silk weavers and spend a morning at a traditional hand loom.'],
    subhead: ['把双手放到织机上', 'Learn by making'],
    body: [
      ['科莫的丝织传统延续了三个世纪。我们探访老城附近一家自 1931 年传承至今的家庭织坊。', 'Como has a long textile history. This visit opens the doors of a family workshop established near the old town in 1931.'],
      ['从整经、染色到木织机，织坊主人会逐一展示。随后您可以亲手织一小段丝绸，午餐时由工坊整理包装。', 'See the preparation frames, dyes and wooden looms before weaving a short piece yourself. The workshop finishes and wraps it while you take lunch.'],
      ['通常上午九点出发，下午两点返回。八月工坊休息，具体日期会在预约时确认。', 'The visit usually runs from nine until two. The workshop closes in August; available dates are confirmed when you enquire.'],
    ],
  },
]

export interface Offer {
  slug: string
  name: Copy
  label: Copy
  intro: Copy
  includes: Copy[]
  terms: Copy
  start: string
  end: string
  nights: number
}

export const offers: Offer[] = [
  { slug: 'stay-longer', name: ['把假期留长一点', 'Make time for a longer stay'], label: ['四晚或以上', 'Four nights or more'], nights: 4, start: '2026-10-01', end: '2027-03-31',
    intro: ['住满四晚，赠送其中一晚。每天的早餐，都可以留给湖边。', 'Settle in for four nights and enjoy one on us, with breakfast wherever you prefer.'],
    includes: [['客房、套房及别墅均可参与。每连续四晚包含一晚礼遇，让旅程不必匆忙结束。', 'The invitation applies to rooms, suites and villas, with one complimentary night in every four consecutive nights.'], ['每日早餐包含在内，可选择码头、私人阳台或客房内享用。', 'Daily breakfast is included, served in your room, on your balcony or down by the jetty.']],
    terms: ['适用于 2026 年 10 月 1 日至 2027 年 3 月 31 日的住宿。赠送当次房价最低的一晚，视房态安排，不可与其他优惠叠加。', 'For stays from October 2026 through March 2027. The least expensive night is complimentary. Availability and separate booking conditions apply; other offers cannot be combined.'],
  },
  { slug: 'spring-by-the-lake', name: ['湖畔春日', 'A spring escape by the lake'], label: ['三月至五月', 'March to May'], nights: 3, start: '2027-03-15', end: '2027-05-31',
    intro: ['花园苏醒时住上三晚，乘船去看山茶，在水边共进晚餐。', 'Three spring nights, a private garden crossing and dinner beside the water.'],
    includes: [['包含三晚客房或套房、每日早餐，以及前往西岸山茶花园的私人船程。', 'Enjoy three nights in a room or suite with daily breakfast and a private boat trip to the camellia gardens.'], ['花园负责人陪同散步，并在水岸餐厅为您准备五道式晚餐。', 'A walk with the head gardener and a five-course waterside dinner complete the stay.']],
    terms: ['适用于 2027 年 3 月 15 日至 5 月 31 日抵达的预订，至少三晚。船程取决于天气，所有安排须确认房态。', 'Available for arrivals between mid-March and the end of May 2027, with a three-night minimum. Boat outings depend on suitable weather and availability.'],
  },
  { slug: 'the-honeymoon-itinerary', name: ['两个人的蜜月时光', 'A honeymoon at your own pace'], label: ['五晚私享行程', 'A five-night escape'], nights: 5, start: '2026-10-01', end: '2027-10-31',
    intro: ['五晚露台套房，日落船程，与一场只属于两个人的晚餐。', 'Five nights in a terrace suite, a sunset on the lake and dinner in complete privacy.'],
    includes: [['包含五晚露台套房和每日早餐、私人木船日落巡游及双人温石水疗。', 'The stay includes breakfast, a private sunset cruise and a Stone Spa treatment for two.'], ['任选一晚在私人露台用餐。到访前确认偏好，之后把时间完整留给两个人。', 'Choose an evening for dinner on your terrace. Share your preferences ahead of time, then leave the arrangements with us.']],
    terms: ['适用于 2026 年 10 月 1 日至 2027 年 10 月 31 日，至少入住五晚露台套房。视房态安排，不可与其他优惠叠加。', 'For terrace-suite stays of at least five nights between October 2026 and October 2027. Subject to availability and not combinable with other invitations.'],
  },
]

export interface Article {
  slug: string
  name: Copy
  category: 'stories' | 'travel' | 'table' | 'wellness'
  date: string
  minutes: number
  author: string
  role: Copy
  intro: Copy
  sections: { title: Copy; paragraphs: Copy[] }[]
}

export const articles: Article[] = [
  { slug: 'the-silk-merchants-house', name: ['丝绸商人的夏日老宅', 'A summer house and its memories'], category: 'stories', date: '2026-07-15', minutes: 7, author: 'Elena Marchetti', role: ['驻店档案整理人', 'House archivist'],
    intro: ['1911 年，一位科莫丝绸商人在湖湾建起避暑的房子。百年之后，我们从他留下的小物件里，重新认识这座老宅。', 'A silk merchant chose this bend in the lake for his summer home in 1911. The objects he left behind still help us understand the house.'],
    sections: [
      { title: ['藏在酒窖里的日常', 'Ordinary things, carefully kept'], paragraphs: [['修复工程开始时，团队在酒窖发现了一箱账簿与旧菜单。冰块的价格、船工的报酬、花园送来的柠檬，都被一笔一笔地记着。', 'During the restoration, a box of ledgers and old menus emerged from the cellar. It recorded ice deliveries, boatmen and lemons brought over from nearby gardens.'], ['老主人希望在看见船之前，就能先听见它靠近。我们保留了这份愿望：让屋子足够安静，让湖水仍然是这里的主角。', 'The owner valued a house quiet enough for approaching boats to announce themselves. Preserving that sense of stillness became part of the restoration.']] },
      { title: ['脚下的水磨石', 'The floors that stayed'], paragraphs: [['一层的水磨石来自 1910 年的施工。修复时，每块地砖都被手工取出、清洗，再铺回原来的位置。', 'The first-floor terrazzo dates from the original building work. Each salvaged tile was lifted, cleaned and laid again by hand.'], ['酒窖门上还留着旧主人的姓名缩写。走去晚餐的路上，不妨停下来，看看石头如何记住一个人。', 'The original initials remain above the cellar door. On the way to dinner, pause to notice how a small detail can carry a century.']] },
    ],
  },
  { slug: 'the-first-boat-of-the-morning', name: ['清晨的第一班船', 'Before the lake wakes'], category: 'travel', date: '2026-09-12', minutes: 5, author: 'Luca Bianchi', role: ['礼宾负责人', 'Head concierge'],
    intro: ['清晨 6:40 的渡轮离开莱泽诺。九月的天还没有完全亮，短短二十分钟，湖面仿佛只属于这一艘船。', 'The 6:40 ferry leaves before the September day is fully awake. For a brief crossing, the open water feels almost empty.'],
    sections: [{ title: ['怎样拥有这个早晨', 'Plan a quiet start'], paragraphs: [['前一晚向前台预约一壶咖啡。沿着湖岸步行四分钟便到码头，船票可以上船购买。', 'Ask the desk for a flask of coffee the night before. The ferry stop is a short lakeside walk away, and tickets are available on board.'], ['船尾的露天甲板最适合看风景，左侧可以迎着群山后的第一道光。', 'Try the open deck at the stern. On the left, the first light begins to reach the mountains.'], ['到瓦伦纳走一段岸边小路，再回来吃一顿晚早餐。不必走远，也能遇见湖区一天中最安静的样子。', 'Continue to Varenna for an unhurried shore walk, then return for breakfast. A small outing can reveal a very different side of the lake.']] }],
  },
  { slug: 'tagliatelle-by-hand', name: ['把意面交给双手', 'Pasta, made slowly'], category: 'table', date: '2026-08-28', minutes: 6, author: 'Matteo Sala', role: ['水岸餐厅主厨', 'Lakeside kitchen chef'],
    intro: ['从科莫到科利科，新鲜鸡蛋意面是许多家庭厨房的日常。每位祖母，都有自己关于面团的坚持。', 'Fresh egg pasta belongs to everyday life around the lake. Recipes pass between generations, with each kitchen keeping its own small preferences.'],
    sections: [
      { title: ['一块面团的时间', 'Giving the dough time'], paragraphs: [['来自布里安扎磨坊的面粉，与莱泽诺山上农场的蛋黄揉成面团。盖上布，静置一小时，再开始擀制。', 'Local flour and farm egg yolks form a simple dough. Covered and rested, it becomes supple enough to roll into fine sheets.'], ['面皮要擀得很薄，切面则坚持用手完成。与其寻找秘密配方，不如认真留意手下的触感。', 'The sheets are rolled thin and cut by hand. Attention and practice matter more than a hidden ingredient.']] },
      { title: ['从渔船到餐盘', 'From the morning catch'], paragraphs: [['清晨送来的湖鲈鱼，配上手工宽面、焦化黄油与鼠尾草。上桌前的最后一刻再煎鱼，留下恰到好处的酥脆。', 'The morning perch is paired with ribbons of pasta, brown butter and sage. Cooking the fish at the last moment keeps the contrast of textures alive.']] },
    ],
  },
  { slug: 'cold-water-warm-stone', name: ['冷泉与温石之间', 'The pleasure of a changing temperature'], category: 'wellness', date: '2026-08-04', minutes: 4, author: 'Sofia Riva', role: ['水疗负责人', 'Spa director'],
    intro: ['高山融水让科莫湖在八月也保有清凉。有人喜欢直接走下码头，有人愿意坐在台阶上，看第一圈涟漪慢慢散开。', 'Mountain-fed water stays fresh even in August. Some guests head down the ladder at once; others are content to watch from the steps.'],
    sections: [{ title: ['先温热，再清凉', 'Move gently between temperatures'], paragraphs: [['水疗的节奏也来自湖边：蒸汽、短暂的冷泉、再到温石。护理师会根据个人感受调整每一步。', 'The spa takes inspiration from the shore, moving from steam to a brief cool immersion and then warmed stones. Every stage can be adjusted for comfort.'], ['不必与任何人比较。缓慢进入，留意呼吸，在适合自己的时候离开水面。', 'There is no challenge to complete. Enter slowly, pay attention to your breathing and leave the water when it feels right for you.'], ['码头泳梯从早晨开放到黄昏，台阶上备有干净浴巾。想尝试时，先和水疗团队聊聊自己的需要。', 'Towels are ready beside the jetty during swimming hours. Speak with the spa team about your needs before choosing a treatment or a dip.']] }],
  },
  { slug: 'three-villages-one-afternoon', name: ['一个午后，三个村庄', 'An afternoon around the middle lake'], category: 'travel', date: '2026-06-20', minutes: 5, author: 'Luca Bianchi', role: ['礼宾负责人', 'Head concierge'],
    intro: ['中湖区的一日船票，连接了明信片里最熟悉的三个村庄。没有紧凑行程，也能走过一段很完整的湖畔生活。', 'A ferry day ticket links three of the lake’s best-known villages. Leave room between stops and the journey becomes part of the afternoon.'],
    sections: [{ title: ['一条不必赶路的路线', 'A route with room to wander'], paragraphs: [['从瓦伦纳开始，趁游船尚未抵达，沿北面的湖岸散步。午餐留给梅纳焦，离开主街也许会发现更喜欢的小店。', 'Begin with a shoreline walk in Varenna, then cross to Menaggio for lunch. Step back from the busy waterfront to find a quieter table.'], ['傍晚再去贝拉焦，等小巷慢慢安静下来。请提前向礼宾团队确认当天最后一班返程船，不要只依赖旧时刻表。', 'Visit Bellagio later, as the lanes begin to empty. Check the day’s final sailing with the concierge before setting out.'], ['前台准备了标有面包店的小地图。带上它，把地图以外的转角也留一点时间。', 'Pick up a desk map marked with favourite bakeries, and allow time for a turn that was never part of the plan.']] }],
  },
  { slug: 'what-the-cellar-keeps', name: ['酒窖收藏的季节', 'What rests beneath the house'], category: 'table', date: '2026-05-30', minutes: 4, author: 'Paolo Neri', role: ['驻店侍酒师', 'House sommelier'],
    intro: ['1910 年开凿的石窖，在一月和七月都保持着近乎相同的温度。这里收藏的，不只是酒瓶。', 'The stone cellar has held a steady cool temperature since it was cut into the hillside. Its shelves keep a small record of the surrounding region.'],
    sections: [{ title: ['来自山谷的瓶中风土', 'Bottles from the high valleys'], paragraphs: [['酒单以瓦尔泰利纳为主。陡峭石梯田上生长的葡萄，让酒呈现出与南面产区不同的轻盈与清冷。', 'Many bottles come from Valtellina, where vines climb steep stone terraces. Their character reflects the valley’s mountain climate.'], ['有些酒并不印在固定酒单上。最后一晚若仍想多听一点故事，可以找侍酒师聊聊。', 'A few bottles are kept for a conversation rather than a printed list. Ask the sommelier what is interesting that evening.'], ['周四和周六的品鉴会在小小烛光中进行。石窖有电灯，但我们更喜欢把光线放低一些。', 'Small tastings take place on Thursday and Saturday. Candlelight softens the room and gives the old stone a little more warmth.']] }],
  },
]

export const roomFAQs: { question: Copy; answer: Copy }[] = [
  { question: ['几点入住和退房？', 'When can we check in and out?'], answer: ['入住时间为 15:00，退房时间为 12:00。提前抵达可寄存行李，延迟退房需视当日房态确认。', 'Check-in begins at 15:00 and check-out is at noon. Luggage storage is available for early arrivals; later departure depends on availability.'] },
  { question: ['可以带孩子入住吗？', 'Can children stay?'], answer: ['欢迎家庭入住。观景套房、柏树别墅与湖上私邸适合多人同行；婴儿床可提前咨询，水疗区供十六岁以上客人使用。', 'Families are welcome. The larger suites and villas offer more space, cots can be requested ahead, and spa access is for guests aged sixteen and over.'] },
  { question: ['可以带宠物吗？', 'Are dogs welcome?'], answer: ['十五公斤以下的犬只可入住指定花园客房与柏树别墅。请在咨询时告知，我们会说明可安排的房型。', 'Dogs under 15 kg can stay in selected garden rooms and Villa Cipresso. Tell us when enquiring so suitable accommodation can be confirmed.'] },
  { question: ['取消政策是怎样的？', 'What are the cancellation terms?'], answer: ['普通价格可在抵达十四天前免费取消。之后收取首晚费用；优惠及别墅预订以确认时列明的条款为准。', 'Standard stays can be cancelled without charge up to fourteen days before arrival. Later cancellation costs the first night; special offers and villas may have separate terms.'] },
  { question: ['如何从机场抵达？', 'How do we arrive from the airport?'], answer: ['可安排从米兰机场出发的私人接送，也可到科莫换乘船只。车程和船程均须根据具体抵达时间确认。', 'Private airport transfers can be arranged, including a car to Como followed by a lake crossing. Timing is confirmed around your arrival.'] },
  { question: ['是否提供无障碍客房？', 'Is step-free accommodation available?'], answer: ['两间花园客房提供无台阶入口与无门槛淋浴，主楼配有电梯。请告知具体需求，便于提前确认动线。', 'Two garden rooms have step-free access and roll-in showers, and the main villa has a lift. Share your requirements so the team can plan the route with you.'] },
]

export const contactFAQs: { question: Copy; answer: Copy }[] = [
  { question: ['多久能收到回复？', 'When should I expect a reply?'], answer: ['这里是模板演示，表单不会发送或保存。如接入真实礼宾服务，可在此说明实际回复时效。', 'This is a template demonstration: forms do not send or store information. A live property can publish its actual response times here.'] },
  { question: ['不住宿也能体验餐厅或水疗吗？', 'Can non-residents visit?'], answer: ['参考行程中，餐厅可安排非住店宾客，水疗仅面向住店客人。实际可用性需由运营方确认。', 'The sample programme allows outside dinner reservations, while spa access is for residents. Availability must be confirmed by the property.'] },
  { question: ['能举办婚礼或私人活动吗？', 'Are private celebrations possible?'], answer: ['小型庆祝活动可通过礼宾咨询。请说明日期、人数及期望安排，以便真实运营团队提供方案。', 'Use the enquiry form to outline dates, guest numbers and the celebration you have in mind. A connected hospitality team can then prepare a proposal.'] },
  { question: ['可以更改日期吗？', 'Can dates be changed?'], answer: ['参考标准价格允许抵达十四天前申请调整，须确认房态。此演示不创建或修改任何实际订单。', 'The sample standard rate allows date changes fourteen days ahead, subject to availability. This demonstration creates or changes no reservation.'] },
]

export const categoryLabels: Record<string, Copy> = {
  all: ['全部', 'All'], rooms: ['客房', 'Rooms'], suites: ['套房', 'Suites'], villas: ['别墅', 'Villas'],
  dining: ['餐饮', 'Dining'], spa: ['水疗', 'Spa'], lake: ['湖上与远方', 'On the lake'],
  stories: ['老宅故事', 'Stories'], travel: ['旅行', 'Travel'], table: ['餐桌', 'Table'], wellness: ['身心', 'Wellness'],
}

export function formatDate(value: string, locale: TemplateLocale): string {
  return new Intl.DateTimeFormat(locale === 'zh' ? 'zh-CN' : 'en-GB', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T12:00:00Z`))
}

export const gallery: { file: string; time: string; title: Copy; caption: Copy }[] = [
  { file: 'jn8m3K9n20iTNIIX22KOjsgZ79E.jpg', time: '07:00', title: ['湖面初醒', 'First light on the lake'], caption: ['薄雾停留在水面，第一艘船正等在码头', 'Mist lifts from the water as the first boat waits.'] },
  { file: 'xXlmpH6LBTUwdpfMRG1bb3roFDk.jpg', time: '10:30', title: ['老宅的早晨', 'A morning at the house'], caption: ['百叶窗慢慢变暖，拱廊下的咖啡刚好入口', 'Coffee under the arches while the shutters catch the sun.'] },
  { file: 'jYA11Oj7UJwx9l0Z2tCUsnQKHo.jpg', time: '14:00', title: ['水与温石', 'Water and warm stone'], caption: ['走进老蓄水池，把午后留给自己', 'A quiet afternoon in the restored cisterns.'] },
  { file: 'l0UCxm4VON02fw5oYqFizXfhfk.jpg', time: '18:00', title: ['花园的金色时刻', 'The garden at golden hour'], caption: ['树荫下的开胃酒，等待光线轻轻散去', 'An aperitivo in the shade as the light softens.'] },
  { file: 'mnJiN6o4FD0Tm1X4c9GXiMmVxg.jpg', time: '20:00', title: ['灯亮时开席', 'A table after sunset'], caption: ['晚餐靠着水，灯笼一盏盏亮起来', 'Dinner by the shore, with lanterns reflected in the water.'] },
  { file: 'JZ7pvQGqzItueQQRO2jjMxXctAg.jpg', time: '22:30', title: ['夜晚重新安静', 'The house settles'], caption: ['最后一班渡轮已经驶过，湖岸又安静下来', 'The last ferry has passed and the shoreline grows still.'] },
]
