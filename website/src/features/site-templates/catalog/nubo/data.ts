export type Copy = readonly [string, string]
export const photo = (id: string) => `/templates/nubo/photos/${id}.webp`

export interface Room {
  slug: string
  name: Copy
  title: Copy
  intro: Copy
  description: Copy
  image: string
  scenes: { title: Copy; body: Copy; image: string }[]
}

export const rooms: Room[] = [
  {
    slug: 'kitchen', name: ['厨房时光', 'Kitchen'], title: ['晚餐时分\n多一双帮忙的手', 'A second pair of hands\nat dinner'],
    intro: ['让一天最忙碌的时刻安静下来', 'The loudest hour of the day, made calmer'],
    description: ['晚餐往往是六件小事同时发生，却只有一个人在忙。收拾、摆盘、端菜，交给机器人；你把时间留给餐桌旁的人。', 'Dinner is six small jobs at once, and usually one person doing all of them. Clearing, setting, carrying: Weelume takes the ones that don’t need you, so the hour belongs to the people at the table.'],
    image: 'JMZeDArAPMmVlXUSb59AM4S6Y', scenes: [
      { title: ['下午六点，每个人都有自己的期待', 'Six o’clock, and everyone wants something different'], body: ['有人要拿盘子，桌上还放着午餐的东西，锅里的米饭快溢出来了。机器人在你开始之前清理台面、摆好餐具，让每晚重复的忙碌变得从容。', 'Someone needs a plate, the table still has lunch on it, the rice is about to boil over. Usually one person is doing all of it. Weelume clears the surfaces and sets the table, leaving you room to cook.'], image: 'JMZeDArAPMmVlXUSb59AM4S6Y' },
      { title: ['它记得，牛奶快喝完了', 'Notices the milk is nearly out'], body: ['随着食材在一周里陆续消耗，它会记下家里真正缺少的东西。购物清单跟随生活变化，下次采购前就已准备好。', 'As things leave the fridge over the week, Weelume keeps a list of what the house actually ran out of. What you’re out of, ready for the next shop.'], image: 'xKSEviCkA9W32EBCPeuGUDGWbwY' },
      { title: ['系好围裙前，备菜已经开始', 'Prep done before you start cooking'], body: ['切片、分量、整理备料，机器人先做准备工作。烹饪的节奏由你决定，晚餐的准备有它一起完成。', 'It chops, slices, and measures. Cooking goes better when the cutting board is already halfway done before you tie the apron. The pace is yours. The prep is handled.'], image: 'jeplaMV5DSqGLRib90xEleN4GE' },
    ],
  },
  {
    slug: 'family', name: ['家人与陪伴', 'Family'], title: ['对小小的家人\n多一点耐心', 'Gentle with\nthe small ones'],
    intro: ['缓慢、耐心，恰到好处的帮助', 'The slow, patient kind of help'],
    description: ['孩子需要耐心的陪伴。陪着走向校车站，找到遗落的积木，打理傍晚的琐事，让家人之间的相处少一些安排、多一些自在。', 'Children need someone who doesn’t rush them and finds the lost Lego every single time. Weelume walks to the bus stop, handles the boring parts of the evening, and lets the people in your home be people.'],
    image: 'CVVlOgRCvoT9Fmob3rgBrs6XY', scenes: [
      { title: ['每天遛狗，无需提醒', 'Walks the dog. Every day, without being asked'], body: ['不论晴雨，在熟悉的时间走过熟悉的路线。它知道狗狗喜欢在哪里停留，也记得避开哪道门。散步结束，大家都更放松。', 'Rain or shine, same time, same route. It knows which lamp post deserves a pause and which gate to give a wide berth. The dog comes home calm. So does everyone else.'], image: 'AezYeaUC8DVKEnzisFc9DHQOM' },
      { title: ['找回那块丢失的积木', 'Finds the lost Lego'], body: ['睡前整理地板，同一本故事可以耐心读两遍。力度感知双手在孩子身边放慢动作，保持轻柔，让陪伴更安心。', 'Tidies the floor before bed. Reads the same story twice without sighing. Force-sensing hands mean it stays slow and soft near the people who need it slow.'], image: 'CVVlOgRCvoT9Fmob3rgBrs6XY' },
      { title: ['你安心待客，它照顾细节', 'Keeps the evening moving'], body: ['杯子及时添满，托盘再次送到面前。你留在谈话之中，机器人照顾每一件小事，让美好的夜晚自然延续。', 'The glasses stay full. The tray comes around again. You host while Weelume circulates, so the conversation keeps going. The night belongs to the people in it.'], image: 'AkfqDuVkjktmahEsR0a0ezx9rlE' },
    ],
  },
  {
    slug: 'daily-duties', name: ['日常琐事', 'Daily duties'], title: ['你忙的时候\n它来接过包裹', 'Takes the parcel\nwhen you’re busy'],
    intro: ['即使出门在外，日常也有人照料', 'The day handled, whether you’re there or not'],
    description: ['迎接快递、签收包裹、妥善放进屋内。收到一张照片和一条消息，省去错过配送后再次奔波的麻烦。', 'Meets the courier. Signs for the box. Sets it inside, out of the rain and out of sight. You get a photo and a note instead of a card on the mat and a trip across town.'],
    image: 'Rp50382nl4MlTtEW6DKbCXt39uE', scenes: [
      { title: ['把采购物品从车里搬进家', 'Carries the shop in from the car'], body: ['沉重的购物袋、整箱饮料，它会先把冷藏食物归位，再将其他东西整理到台面。回家后，最费力的部分已经完成。', 'The heavy bags, the awkward cases, the crate of water. It puts the cold things away first and leaves the rest sorted on the counter. You come home to a kitchen that’s already done the hard part.'], image: 'Rp50382nl4MlTtEW6DKbCXt39uE' },
      { title: ['家里安静时，把地板打扫好', 'Vacuums when the house is quiet'], body: ['在人们离开后按顺序清洁房间，挪开物品再放回原处。回家前地板已经干净，省去安排清洁时间的心思。', 'It works through the rooms in order, moves what needs moving, and puts it back. The floors are clean before you get home. No scheduling required.'], image: '0MwqppnigTZLAWvCcVydrTCXZCw' },
      { title: ['从分类到折叠，照料好衣物', 'Sorts the laundry, start to finish'], body: ['深浅色分开，及时洗涤与晾晒，折叠后放到合适的位置。椅子上的那堆衣服终于有了归处。', 'Darks and lights separated without a reminder. Loads started and moved on time. Folded and left where they belong. The pile on the chair finally dealt with.'], image: '3VIglJhUObdpgghYlY45YqNKE' },
    ],
  },
  {
    slug: 'housekeeping', name: ['居家养护', 'Housekeeping'], title: ['照顾好家\n也照顾好院子', 'Charges the bike\nand tends the home'],
    intro: ['把家的每一处照料妥当', 'The house, properly maintained'],
    description: ['草坪、车库和零碎的户外工作，总有事情等着做。机器人接手重复性的养护，让房子在忙碌的日子里依然井井有条。', 'There is always something that needs doing. Weelume handles the recurring ones: the lawns, the garage, the small outdoor jobs that pile up when life gets busy. The property looks after itself.'],
    image: 'Nr2QL5KepfsOCmTOEveYMqp7lo', scenes: [
      { title: ['草坪始终平整，无需提醒', 'Keeps the lawn even'], body: ['每周按时修剪，保持一致的高度与边缘，清理碎草后将工具归位。花园看起来被用心照料，因为它确实如此。', 'Same height, same edges, same day of the week. It mows the grass, sorts the clippings, and puts the mower back where it lives. The garden looks tended. Which it is.'], image: 'qd4gM5krrDfPSJ05Fg8CYcXz304' },
      { title: ['每一件工具，都回到原位', 'Puts the tools back where they belong'], body: ['抽屉合好，扳手挂回挂钩，车库清理整齐。常用物品总在你熟悉的位置，电动自行车也充好了电。', 'Every drawer closed, every wrench on its hook. It clears what needs clearing and keeps the garage the way it should be. The bike is charged and ready for the next ride.'], image: 'Nr2QL5KepfsOCmTOEveYMqp7lo' },
      { title: ['番茄成熟时，它知道', 'Picks the tomatoes before they go over'], body: ['查看菜畦，摘下成熟的果实，给仍在生长的蔬菜浇水。花园有自己的节奏，它也会跟上。', 'Checks the vegetable beds, harvests what’s ready, and waters what isn’t. The garden keeps its own schedule. Weelume keeps up.'], image: 'qd4gM5krrDfPSJ05Fg8CYcXz304' },
    ],
  },
]

export const faqs: { question: Copy; answer: Copy }[] = [
  { question: ['什么时候发货', 'When will it ship?'], answer: ['产品目前处于内测阶段，预订后将按顺序确认发货时间。本模板为演示页面，所有预订均不产生真实订单。', 'The product is in beta. Reserved units receive a confirmed shipping window in allocation order. This template is a demonstration; reservations create no real orders.'] },
  { question: ['在儿童和宠物身边安全吗', 'Is it safe around children and pets?'], answer: ['力度感知双手遇到轻微阻力便会停止。靠近人时放慢速度，休息时段暂停移动。产品能力与安全描述均为模板示意。', 'Force-sensing hands stop at light resistance. Movement slows near people and pauses during quiet hours. Product capabilities and safety descriptions are illustrative demo content.'] },
  { question: ['家里的数据如何处理', 'What happens to my data?'], answer: ['感知和行为计算在设备本地完成，音视频留在家中。转让或归还设备前可以清除家庭模型。演示表单只在当前页面校验，不发送或保存数据。', 'Perception and behavior run on-device; household audio and video stay at home. The household model can be cleared. Demo forms validate locally and do not send or save data.'] },
  { question: ['需要一直联网吗', 'Does it need the internet?'], answer: ['联网用于软件更新，感知、决策和家庭模型在本地运行。短暂断网时，日常功能仍可继续。', 'Connectivity is used for software updates. Perception, decisions, and the household model run locally, so daily routines keep working during an outage.'] },
  { question: ['续航多久，需要手动充电吗', 'How long does the battery last?'], answer: ['标准版演示续航为 18 小时，Pro 为 23 小时。电量较低时设备会自行返回充电座。', 'The standard model has an illustrative 18-hour battery; Pro has 23 hours. It returns to the dock when power runs low.'] },
  { question: ['初次设置需要多久', 'How hard is it to set up?'], answer: ['演示设定约为 42 分钟。拆箱、安置充电座、完成配对，再带它熟悉家里的空间。', 'The illustrative setup takes about 42 minutes: unpack, place the dock, pair once, and walk it through your home.'] },
  { question: ['一次购买还是订阅制', 'Do I own it, or is there a subscription?'], answer: ['设备为一次购买，Care 服务为可选月度方案。模板仅展示套餐，不收取费用。', 'The device is a one-time purchase. Care is an optional monthly plan. This template displays plans and takes no payment.'] },
]

export const updates: { date: string; tag: Copy; version: string; title: Copy; body: Copy }[] = [
  { date: '2026-07-08', tag: ['里程碑', 'Milestone'], version: 'Beta · 140', title: ['140 个家庭，故事仍在继续', 'One hundred and forty homes, and counting'], body: ['本周内测覆盖了 140 个家庭。从小公寓到大家庭，更多生活场景帮助我们理解机器人的真实表现，也让产品判断有了更扎实的依据。', 'The beta crossed 140 households this week. Enough range now to see how the robot behaves in small flats and full houses alike, and enough data to replace a few of our guesses.'] },
  { date: '2026-06-30', tag: ['新功能', 'New'], version: '0.9', title: ['它开始自己理解安静时段', 'Quiet hours, learned naturally'], body: ['观察入住后的第一周，逐渐理解家里的休息规律。夜晚放慢动作、暂停任务，在清晨到来前安静等待。', 'It watches the first week and works out when the house sleeps. Movement slows, tasks pause, and it holds until morning without a schedule set by hand.'] },
  { date: '2026-06-11', tag: ['体验优化', 'Improved'], version: '0.8.4', title: ['面对小物件，双手更加轻柔', 'Steadier hands near the small stuff'], body: ['优化轻量物品的抓握响应。无论一块积木还是一杯水，力度感知都更加平稳、更有耐心。', 'Grip response is smoother at the light end of the range. Picking up a single Lego or a full glass now feels steadier. Force sensing got a little more patient.'] },
  { date: '2026-06-02', tag: ['问题修复', 'Fixed'], version: '0.8.3', title: ['明亮日光下，也能顺利回到充电座', 'A smoother return in bright light'], body: ['修正直射阳光对充电座返回传感器的影响。现在它能识别眩光，无需绕圈便可完成停靠。', 'Direct sun near the dock used to confuse the return sensor. It reads the glare correctly now and parks on the first pass.'] },
  { date: '2026-05-07', tag: ['计划公告', 'Announcement'], version: 'Beta', title: ['第二轮内测计划于八月开放', 'A second beta wave opens in August'], body: ['我们计划邀请更多家庭加入下一轮内测。候补名单中的朋友将收到邀请与详细安排。此处为参考站产品更新演示。', 'A second wave will welcome a few hundred more homes. If you are on the waitlist, keep an eye on your inbox. These updates are demonstration content adapted from the reference site.'] },
]

export const testimonials: { name: string; city: Copy; quote: Copy; body: Copy; image: string }[] = [
  { name: 'Natalie K.', city: ['意大利 · 佛罗伦萨', 'Florence, Italy'], quote: ['像一位礼貌又安静的室友', 'Closer to a very polite housemate'], body: ['原以为又多了一件设备，后来发现它很会找丢失的小物件。自从它记住眼镜放在哪里，家里人也开始喜欢上它。', 'We expected a gadget. It turned out to be excellent at finding lost things. The whole household came around once it started remembering where the glasses were.'], image: '7bdsxktA8TA18dvBB8qT3K4jBzM' },
  { name: 'Joan P.', city: ['瑞典 · 哥德堡', 'Göteborg, Sweden'], quote: ['它记住了我们各自的小习惯', 'It learned the little things'], body: ['女儿喜欢窗帘半开，我喜欢关上。它一周就记住了两个人的习惯，生活自然就顺畅起来。', 'She likes the blinds half-open; I like them shut. It picked up on both within a week. Daily life became a little smoother.'], image: 'qPEWq9SJLmV3AALrm6vUsLuqYA' },
  { name: 'Daniel O.', city: ['美国 · 波特兰', 'Portland, Oregon'], quote: ['孩子们先给它起好了名字', 'My kids named it before I did'], body: ['现在它叫 Barnaby。最令人惊讶的是，几周之后，它就自然融入了这个家。', 'It’s Barnaby now, apparently. What surprised me was how fast it became a familiar part of the home.'], image: '2SI2XKuW8EvnDbjuCzCZ0wFDZk' },
  { name: 'Nao F.', city: ['日本 · 东京', 'Tokyo, Japan'], quote: ['完成工作，然后安静离开', 'It does the job and moves on'], body: ['不用时刻打开应用，也没有一直闪烁的灯。它处理好事情，让我把精力留给生活。', 'No app to keep opening, no light demanding attention. It does the job and leaves me time for life.'], image: 'FEC00aJXEqbNB2IKFqC4wmuh8' },
  { name: 'Marcus W.', city: ['美国 · 奥斯汀', 'Austin, Texas'], quote: ['它只需要一个充电座', 'It just wants a dock'], body: ['清理桌面、自己充电，在我们做饭时留出空间。六周过去，这些小事依然让人感到轻松。', 'It clears the table, charges itself, and leaves room while we cook. Six weeks in, those small things still make the day easier.'], image: 'ORC919ko6vIFOwECMaQE4MDx3g' },
  { name: 'Freya H.', city: ['丹麦 · 哥本哈根', 'Copenhagen, Denmark'], quote: ['第一位安静融入生活的帮手', 'A quieter kind of helper'], body: ['家里已经有太多提示音和通知。它默默把事做好，然后继续下一件。', 'The house already has enough beeps and notifications. This one gets things done and quietly moves on.'], image: 'TdxnsVxJyv3GWx8JjF9eZnotVto' },
]
