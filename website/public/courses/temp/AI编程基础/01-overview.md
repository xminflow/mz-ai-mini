# 1.1 工具全景与选型

第一阶段你已经从零做出并上线了一个全栈应用——前端页面、后端接口、一个像样的数据库，全跑通了。那个仓库接下来会一直陪着你：这一整个阶段，每讲一样新东西，都会往它里面加一块真配置，最后攒出一套完全属于你自己的 AI 开发工作流。今天先解决第一件事：手里到底该拿哪把"刀"。

## 别再纠结"哪个更强"了

刚跨过第一阶段的人，几乎每个上来都会问同一串问题：Claude Code 和 Codex，到底哪个更强？该学哪个？两个都学会不会精力分散？

先把这个问题拆掉，因为它本身就问错了。

你在第一阶段大概率只认真用过一个 AI 编程工具，用顺手了，就默认"工具只能有一个，得挑最强的那个"。但真到了每天写代码的场景，你会发现这两个工具的能力上限咬得非常紧，今天这家发个新模型领先半个月，下个月那家追上来反超——你要是把宝押在"永远选最强"上，等于每个月都要推倒重学一遍。这条路走不通。

真正职业选手的做法是另一套逻辑：**挑一个当每天的主力，吃透它的每一个高级功能；再留一个当副手，专门在关键时刻做"第二意见"。** 主力决定你的日常效率，副手决定你在主力翻车时有没有退路。这两个角色分工清楚了，"哪个更强"就变成了一个不用回答的伪问题——它俩你都会用，只是用法不同。

所以这一节的目标不是让你二选一，而是让你看清这两个工具各自是什么形状，然后想清楚：谁当你的主力，谁当你的副手。

## 它俩到底是什么，为什么长得这么像

先说共性，因为共性比差异重要得多。

Claude Code 和 Codex，本质上是**同一类东西**：住在你终端里的、能自己动手干活的 AI 编程助手。这里的关键词是"能自己动手"。第一阶段你用的工具，多半是你说一句、它回一段代码，你再自己复制粘贴到文件里、自己去终端跑命令。而这两个工具不一样——你跟它说"给登录接口加上限流"，它会自己去读你的项目文件、自己改代码、自己在终端跑测试、跑挂了自己再改。你从"抄它答案的人"变成了"给它派活、验收结果的人"。

举个第一阶段你多半经历过的对比。以前你想给某个函数补测试，流程是：你问 AI 怎么写 → 它给你一段测试代码 → 你复制到测试文件 → 你去终端敲命令跑 → 报错了你再把错误信息贴回去问它 → 它给新版本 → 你再复制、再跑……一个来回你要手动搬运五六趟。换成 agentic 工具，你只说一句"给这个函数补上测试并确保通过"，接下来读文件、写测试文件、在终端跑测试、看到失败、定位原因、改代码、再跑——这一整个循环它自己转，转到测试全绿才停下来回你一句"搞定了"。你中途几乎不用插手。

这种"能自己规划步骤、自己调用工具、自己迭代到完成"的 AI，业内叫 **agentic（智能体式）** 工具。你可以把普通 AI 想成一个只会隔着窗口递纸条的顾问，而 agentic 工具是一个你把项目钥匙交给它、它能直接进屋干活的助手。正因为它能直接动你的文件和终端，"怎么管住它别乱来"就成了后面几节的重头戏——这里先埋个头。

还有一层共性顺带说清：这两个工具除了让你坐在终端里一问一答地用（交互模式），也都能"无人值守"地跑。Claude Code 用 `claude -p` 起一个 headless（无界面）任务，Codex 用 `codex exec` 把结果流式吐到标准输出，两者都能塞进脚本、塞进 CI 流水线里自动执行。这条现在用不上，但你要知道它俩不只是"聊天窗口"，往后能长成你自动化流程里的一环。

搞清楚这层共性，你就明白为什么这两个工具学起来能互相迁移了：底层心智模型是一套的，换工具主要是换命令名和配置格式，不是从头再学。

## 一个工具，好几副面孔

第二个要打通的概念是"形态"。同一个工具，你能从好几个不同的入口去用它，这些入口叫它的形态。

拿 Codex 举例最直观。它有四副面孔：终端里的命令行界面（CLI）、装进编辑器的 IDE 扩展（支持 VS Code、Cursor、Windsurf）、一个独立的桌面 App，还有一个跑在浏览器里的云端版本（在 `chatgpt.com/codex` 上）。关键在于——这四副面孔背后是**同一个 agent 内核，共用同一份配置文件** `~/.codex/config.toml`。你在终端里定好的规矩，切到桌面 App、切到云端，规矩照样生效。这就像同一个银行账户，你从手机 App、网页、ATM、柜台哪个入口进去，动的都是同一笔钱。

Claude Code 也是一样的路子：有终端 CLI、有 VS Code 扩展、有 JetBrains 系列 IDE 的插件、有桌面应用，也有能在浏览器和 iOS 上用的 Web 版本。同样是多副面孔、同一个内核。

下面这张图把两边的形态摆到一起，你一眼就能看清"多入口、一内核"是什么意思：

<svg viewBox="0 0 820 430" width="100%" height="auto" style="max-width:820px" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <defs>
    <marker id="arrBlue" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#0099ff"/></marker>
    <marker id="arrGold" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#eaaa08"/></marker>
  </defs>
  <rect x="0" y="0" width="820" height="430" rx="14" fill="#0d0d12"/>
  <text x="150" y="34" fill="#0099ff" font-size="17" font-weight="700" text-anchor="middle">Claude Code</text>
  <text x="670" y="34" fill="#eaaa08" font-size="17" font-weight="700" text-anchor="middle">Codex</text>
  <!-- 左侧 Claude 五形态 -->
  <g fill="#12121a" stroke="#0099ff" stroke-width="1.4">
    <rect x="40" y="60" width="150" height="42" rx="7"/>
    <rect x="40" y="118" width="150" height="42" rx="7"/>
    <rect x="40" y="176" width="150" height="42" rx="7"/>
    <rect x="40" y="234" width="150" height="42" rx="7"/>
    <rect x="40" y="292" width="150" height="42" rx="7"/>
  </g>
  <g fill="#e5e5ea" font-size="13" text-anchor="middle">
    <text x="115" y="86">终端 CLI</text>
    <text x="115" y="144">VS Code 扩展</text>
    <text x="115" y="202">JetBrains 插件</text>
    <text x="115" y="260">桌面应用</text>
    <text x="115" y="318">Web / iOS</text>
  </g>
  <!-- 左侧箭头指向中央 -->
  <g stroke="#0099ff" stroke-width="1.6" fill="none">
    <line x1="190" y1="81" x2="316" y2="180" marker-end="url(#arrBlue)"/>
    <line x1="190" y1="139" x2="316" y2="195" marker-end="url(#arrBlue)"/>
    <line x1="190" y1="197" x2="316" y2="210" marker-end="url(#arrBlue)"/>
    <line x1="190" y1="255" x2="316" y2="225" marker-end="url(#arrBlue)"/>
    <line x1="190" y1="313" x2="316" y2="240" marker-end="url(#arrBlue)"/>
  </g>
  <!-- 中央内核 -->
  <rect x="320" y="150" width="180" height="120" rx="12" fill="#155eef" fill-opacity="0.16" stroke="#8a8a94" stroke-width="1.4"/>
  <text x="410" y="200" fill="#e5e5ea" font-size="14" font-weight="700" text-anchor="middle">同一个 agent 内核</text>
  <text x="410" y="228" fill="#8a8a94" font-size="12.5" text-anchor="middle">同一份配置</text>
  <text x="410" y="248" fill="#8a8a94" font-size="12.5" text-anchor="middle">规矩到处生效</text>
  <!-- 右侧箭头指向中央 -->
  <g stroke="#eaaa08" stroke-width="1.6" fill="none">
    <line x1="630" y1="102" x2="504" y2="185" marker-end="url(#arrGold)"/>
    <line x1="630" y1="160" x2="504" y2="200" marker-end="url(#arrGold)"/>
    <line x1="630" y1="218" x2="504" y2="215" marker-end="url(#arrGold)"/>
    <line x1="630" y1="276" x2="504" y2="230" marker-end="url(#arrGold)"/>
  </g>
  <!-- 右侧 Codex 四形态 -->
  <g fill="#12121a" stroke="#eaaa08" stroke-width="1.4">
    <rect x="630" y="80" width="150" height="42" rx="7"/>
    <rect x="630" y="138" width="150" height="42" rx="7"/>
    <rect x="630" y="196" width="150" height="42" rx="7"/>
    <rect x="630" y="254" width="150" height="42" rx="7"/>
  </g>
  <g fill="#e5e5ea" font-size="13" text-anchor="middle">
    <text x="705" y="106">终端 CLI (TUI)</text>
    <text x="705" y="164">IDE 扩展</text>
    <text x="705" y="222">桌面 App</text>
    <text x="705" y="280">Cloud / Web</text>
  </g>
  <text x="410" y="400" fill="#8a8a94" font-size="12.5" text-anchor="middle">无论从哪副面孔进入，动的都是同一个内核、读的都是同一份配置</text>
</svg>

为什么要专门讲形态？因为它直接影响你的选择。如果你习惯全程待在终端里，那 CLI 形态强不强你最关心；如果你想在编辑器里边写边让 AI 搭把手，IDE 扩展的体验就是关键；如果你想派个长任务出去、关掉电脑一会儿回来收结果，那能在云端跑的形态就很值钱。Codex 这套"四态共享配置"里，桌面 App 加云端联动是它挺突出的一块。

## 三条真正拉开差距的分界线

形态之外，这两个工具还有三条实打实的差异，值得你记住。

**第一条，开源还是闭源。** Codex 是开源的，用 Rust 写的，采用 Apache-2.0 协议，代码就摆在 `github.com/openai/codex` 上，谁都能看、能改、能自己编译部署。Claude Code 是闭源的。这条差异对大多数人日常写代码没影响——工具好不好用跟你能不能看到它源码基本是两回事。但如果你所在的团队有"工具必须能自己审计源码、能拉下来私有化自建"的硬性要求（不少对合规、对数据外流敏感的团队都有这条），那开源与否就是一票否决级的因素，没得商量。

**第二条，计费怎么算。** 两边都是两条路可选。Claude Code：要么走 Pro / Max 订阅，那是**包含额度制**——交固定月费，在额度内随便用，不按每次调用单独扣钱；要么走 API，按 token 用量计费。Codex 同理：用 ChatGPT 账号登录，就吃你 ChatGPT 套餐里自带的额度（官方的说法是每个 ChatGPT 套餐都含 Codex，按一个约 5 小时的滚动窗口刷新用量），或者挂 OpenAI 的 API key 按量付费。这里不写死具体多少钱、每天能发多少条——这类数字变动太快，你在自己账号的计费页看到的才算数。你只要记住结论：**如果你本来就是重度 ChatGPT / Claude 订阅用户，用对应工具基本等于"额度顺便就送了"，这是省钱的大头。**

**第三条，也是最影响后面几节的——怎么管住它别乱来。** 前面说了这俩都能直接动你的文件和终端，那"什么操作它可以自己做、什么必须先问你"就是核心。这块两边的设计思路不一样：Codex 用的是"审批"和"沙箱"两根**互相独立**的轴——沙箱管"技术上它到底能不能碰这个文件、能不能联网"，审批管"碰之前要不要先弹出来问你一声"，两根轴分开拧，能配出很细的组合。Claude Code 走的是另一条路，用一套权限模式加一份 allow / deny 规则清单来管。这里先不展开，1.3 会专门用一整节把两边讲透、还会让你亲手配一道拦截危险命令的关卡——你现在只要记住"两边都有一套安全闸门、设计思路还不太一样"就够了。

顺带留意表里那两行配置文件的差异：Claude Code 的全局配置是一份 JSON（`~/.claude/settings.json`），Codex 的是一份 TOML（`~/.codex/config.toml`）；项目级的指令文件一个叫 `CLAUDE.md`、一个叫 `AGENTS.md`。格式不同、名字不同，但要解决的是同一件事——"把你项目的规矩和你的偏好写下来喂给 AI"。这正是 1.2 一整节的主题，到时候你会两边都写一份。

把这些差异并到一张表里，方便你对着挑：

| 维度 | Claude Code | Codex |
|---|---|---|
| 形态 | CLI + IDE 扩展为主，另有桌面 / Web、iOS | CLI + IDE + 桌面 App + Cloud/Web，四态共享配置 |
| 开源 | 闭源 | Rust，Apache-2.0，公开仓库 |
| 项目指令文件 | `CLAUDE.md`（分层加载） | `AGENTS.md`（开放标准，全局+项目逐层拼接） |
| 全局配置 | `~/.claude/settings.json`（JSON） | `~/.codex/config.toml`（TOML） |
| 安全闸门 | 权限模式单轴 | 审批 × 沙箱两轴正交 |
| 自定义命令 | `.claude/commands/*.md` 斜杠命令 | `~/.codex/prompts/*.md`（官方已推荐改用 skills） |
| MCP 外接工具 | 支持接入 | 支持接入，且自身可作 MCP server |
| 非交互 / 脚本 | `claude -p`（headless） | `codex exec` |

表里那些 `CLAUDE.md`、`AGENTS.md`、MCP、斜杠命令，现在看着陌生很正常——它们正好是这一阶段后面几节要逐个拆开讲的东西。这张表你不用背，往后翻回来对照就行。

## 谁当主力，谁当副手

看完差异，回到那个真问题：怎么分工。

这门课的默认推荐很直接：**Claude Code 当主力，Codex 当副手（可选项）**，当然多数时候我们使用其中一个就可以了，完全胜任常规的企业级开发场景

理由是主力这个位子看的是"自己干活的深度"。Claude Code 在这方面的生态更成熟——它的 hooks（自动化关卡）、subagent（分身外包）、skill（技能）这一整套高级机制，正是把 AI 从"帮手"喂成"能独立扛活的选手"的关键，而这套东西也恰好是这一阶段后面几节要带你逐个玩透的。你把主力时间投在生态最厚的工具上，学到的东西最保值。

顺便给你一张这一阶段的路线图，你就明白"吃透主力"具体要吃哪些东西：1.2 给项目写指令文件，让它一次就懂你的规矩；1.3 配自定义命令、自动化关卡和权限清单，把重复流程固化、把危险操作拦住；1.4 学怎么管好它的"记忆"不让长会话越聊越傻；1.5 用分身把调研外包出去、开多条并行分支同时推功能；1.6 给它接上数据库、文档这些外部能力。每一节都往你那个练习仓库里落一块真配置，到阶段结束，你手里就是一套能反复复用的个人 AI 开发工作流——而不是一堆看过就忘的名词。这也是为什么前面反复强调别脚踩两条船：这条深度路线，只有把精力压在一个主力上才走得完。

那 Codex 当副手图什么？图它是"第二意见"。你想想现实里的场景：主力 AI 给你重构了一段核心逻辑，测试也过了，但你心里还是有点虚——万一它自信满满地写错了呢？这时候把这段代码丢给 Codex，让它用**另一家的模型**独立审一遍："帮忙看看这段有没有边界情况没覆盖、有没有安全隐患"。两个来路完全不同的 AI 都说没问题，这份把握就比单靠一个工具重得多；万一副手挑出了主力漏掉的坑，你更是赚到了。这种"换一双眼睛复核"的活，不需要副手多深地参与你的日常，会启动、能读代码、能给判断就够——Codex 四态共享配置、开源、在 ChatGPT 生态里额度顺手就有，干这个非常称职。

<svg viewBox="0 0 820 250" width="100%" height="auto" style="max-width:820px" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <defs>
    <marker id="arrB2" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#0099ff"/></marker>
    <marker id="arrGreen" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#16b364"/></marker>
    <marker id="arrGold2" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#eaaa08"/></marker>
  </defs>
  <rect x="0" y="0" width="820" height="250" rx="14" fill="#0d0d12"/>
  <text x="30" y="130" fill="#e5e5ea" font-size="13" text-anchor="start">你的任务</text>
  <!-- 主力 -->
  <rect x="150" y="60" width="200" height="60" rx="9" fill="#155eef" fill-opacity="0.18" stroke="#0099ff" stroke-width="1.6"/>
  <text x="250" y="86" fill="#e5e5ea" font-size="14" font-weight="700" text-anchor="middle">主力 · Claude Code</text>
  <text x="250" y="106" fill="#8a8a94" font-size="12" text-anchor="middle">日常写代码、跑测试、改到完成</text>
  <!-- 副手 -->
  <rect x="150" y="150" width="200" height="60" rx="9" fill="#eaaa08" fill-opacity="0.14" stroke="#eaaa08" stroke-width="1.6"/>
  <text x="250" y="176" fill="#e5e5ea" font-size="14" font-weight="700" text-anchor="middle">副手 · Codex</text>
  <text x="250" y="196" fill="#8a8a94" font-size="12" text-anchor="middle">关键处独立再看一遍（第二意见）</text>
  <!-- 任务分派 -->
  <line x1="95" y1="120" x2="146" y2="90" stroke="#0099ff" stroke-width="1.6" marker-end="url(#arrB2)"/>
  <line x1="95" y1="130" x2="146" y2="180" stroke="#eaaa08" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arrGold2)"/>
  <!-- 交叉验证 -->
  <line x1="350" y1="90" x2="560" y2="118" stroke="#0099ff" stroke-width="1.6" marker-end="url(#arrB2)"/>
  <line x1="350" y1="180" x2="560" y2="132" stroke="#eaaa08" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#arrGold2)"/>
  <rect x="565" y="98" width="150" height="54" rx="9" fill="#16b364" fill-opacity="0.16" stroke="#16b364" stroke-width="1.6"/>
  <text x="640" y="122" fill="#e5e5ea" font-size="13" font-weight="700" text-anchor="middle">两边都点头</text>
  <text x="640" y="140" fill="#8a8a94" font-size="12" text-anchor="middle">你才放心合并</text>
  <text x="410" y="238" fill="#8a8a94" font-size="12" text-anchor="middle">实线=主力主流程　虚线=副手交叉验证</text>
</svg>

但"默认推荐"不等于"所有人都该这么选"。有三种情况，更该反过来**把 Codex 提成主力**：

一是你本来就重度泡在 ChatGPT 生态里——团队协作、日常问答、各种插件全在那边，账号、习惯、上下文都沉淀在一处。这种情况下用 Codex 能让整条工具链收拢在同一个生态里，省掉在两家之间来回切换的摩擦，也不用为额度多操一份心；反过来硬迁到另一家，得不偿失。

二是你很吃"桌面 App + 云端联动"这套用法。设想一个真实场景：你在本地起一个"把整个模块的注释补全"这种耗时的长任务，然后合上电脑出门，路上用浏览器打开云端就能看它跑到哪了、跑完没有。Codex 的四态共享配置正是为这种"本地起、云端收、多设备接力"的节奏设计的，Claude Code 在这块的联动没这么顺。

三是你或你的团队对开源有硬要求，需要能审计源码、能私有化自建、能把代码控制在自己可控的边界内。这种情况下闭源的 Claude Code 从一开始就出局了，讨论"谁更好用"都是多余的，Codex 的 Apache-2.0 开源就是那个决定性的、不可谈判的条件。

一句话收口：**没有绝对的主力，只有适配你工作方式的主力。** 选完就别脚踩两条船各学一半——那样两个都学不透。定下来，把主力吃干榨净，副手会用就行。

## 上手：两个都装上，各喊一声"你好"

道理讲完，动手。这一节把两个工具都装上，各跑通一次，确认它们真的活着——主力也好副手也好，先都得能启动。

第一阶段你已经装过 Node、用熟了终端，这里就不重复讲了。两个工具都需要 Node 环境，你机器上应该早就有了。

**装 Codex**，一条命令：

```bash
npm install -g @openai/codex
```

（macOS 用户也可以用 Homebrew 装：`brew install --cask codex`。）

装完，验证它在不在：

```bash
codex --version
```

终端会打印出一个版本号，类似这样：

```text
codex-cli 0.x.x
```

看到版本号，就说明装好了。第一次真正启动 `codex` 时，它会引导你登录——用 ChatGPT 账号登录走套餐额度，或者填 OpenAI API key 走按量计费，按前面讲的两条计费路径，挑你手上有的那条。

**装 Claude Code**，官方最推荐的是原生安装脚本，一条命令搞定，分系统：

macOS / Linux（在终端里）：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows（在 PowerShell 里）：

```powershell
irm https://claude.ai/install.ps1 | iex
```

如果你更习惯用 npm，也可以（需要 Node 22 及以上）：

```bash
npm install -g @anthropic-ai/claude-code
```

装完同样验证一下：

```bash
claude --version
```

会看到一个版本号打印出来。想更全面地体检一下安装和配置是否正常，还可以敲 `claude doctor`，它会逐项告诉你哪里 OK、哪里要修。第一次启动 `claude`，它会引导你登录——注意 Claude Code 需要 Pro、Max、Team、Enterprise 或 Console 账号，免费版的 Claude.ai 不包含 Claude Code，你也可以改配一个 API key 走按量计费。

两个都登录好之后，各让它干一件最小的活，确认能对话。以 Claude Code 为例，先切到你第一阶段那个练习仓库的目录，在那儿启动它，然后问一句最没风险的话，比如"用一句话说说这个项目是干什么的"。它会自己去读你的项目文件，然后回你一句总结——注意它是"读完再答"，不是凭空瞎猜，这就是前面说的 agentic 工具会自己动手的感觉。Codex 那边同理：进同一个目录、启动、问同一句。两边都能正常读你的项目、回你话，这一节的实操目标就达成了。

之所以特意让你进练习仓库的目录里启动、而不是随便找个空文件夹，是因为这两个工具都是"以当前目录为工作根"的——它默认你在哪个目录启动，就把哪个目录当成它要打理的项目。这个习惯从第一天就养成，后面接着调教它才顺。

> 提示：这一步只是"点火确认"，不用真让它改代码。能启动、能登录、能回你一句话，就够了。真正的调教从 1.2 才开始。

## 新手最容易卡的几个点

**卡点一：`command not found`。** 装完 Codex 敲 `codex --version` 却报"找不到命令"，八成是 npm 全局安装的目录没进你的 PATH。这是环境问题，不是工具坏了——第一阶段配 Node 全局命令时踩过的同款坑，按当时的办法把 npm 全局 bin 目录加进 PATH，重开一个终端窗口再试。

**卡点二：装包卡住或超时。** `npm install -g @openai/codex` 半天不动、最后报网络错误，多半是网络到 npm 源不通畅。给终端配上代理再装：

```bash
export HTTPS_PROXY=http://192.168.32.1:7078
```

（Windows PowerShell 里则是 `$env:HTTPS_PROXY = "http://192.168.32.1:7078"`。）设完再跑一次安装命令。

**卡点三：把提示符也敲进去了。** 这门课的命令框里，只给你"该敲的那部分"，不带 `$`、`>`、`#` 这些提示符前缀——那些是终端自己显示的，不是你要输入的内容。看到 `codex --version` 就只敲 `codex --version`，别把前面的符号也抄进去。

**卡点四：纠结"是不是装错了顺序"。** 先装哪个都行，两个工具互不干扰，配置文件也各放各的（一个在 `~/.claude`，一个在 `~/.codex`），不会打架。你甚至可以在同一台机器、同一个项目里同时装着两个，用哪个就启动哪个，谁也不会覆盖谁——这正是"一主一副"能落地的前提。

**卡点五：登录时选错了计费路径。** 第一次启动会让你在"订阅 / 套餐额度"和"API key 按量计费"之间选。别慌，这个不是一锤子买卖，选错了后面能改。原则很简单：手上已经有对应的订阅（Claude 的 Pro/Max、或 ChatGPT 套餐），就走订阅登录，额度基本是"顺带就有"的，最划算；只有 API key、或者要跑自动化脚本按量结算，才走 API key 那条。拿不准就先用订阅登录跑起来，真正的用量和成本你在自己账号的计费页看得最清楚。

## 总结

这一节没写一行代码，但打通了一个最容易想岔的地方：Claude Code 和 Codex 不是"二选一挑最强"的关系，而是"一主一副、各司其职"。

往回收一下几条关键。这两个工具本质是同一类东西——住在终端里、能自己读文件改代码跑测试的 agentic 助手，底层心智是一套的，换工具主要是换命令名和配置格式，不是从头再学。它们各有好几副面孔（CLI、编辑器扩展、桌面、云端），但背后是同一个内核、读同一份配置。真正拉开差距的是三条线：开源还是闭源、计费怎么算、以及怎么管住它别乱来——最后这条是安全闸门，1.3 会专门讲透。

分工上，默认把 Claude Code 当主力、Codex 当副手：主力要吃透它的 hooks、subagent、skill 这套深度机制，副手在关键处做"第二意见"交叉验证。只有当你重度泡在 ChatGPT 生态、离不开桌面 App 加云端联动、或对开源有硬性要求时，才反过来把 Codex 提成主力。选定之后别再摇摆，把一个主力吃干榨净，远比两个都学一半强。

到这里，两个工具应该都已装好、登录、各跑通过一次对话，谁主谁副也定了下来。工具备齐、角色定了，下一节 1.2 就正式开始调教主力——给你的练习仓库写一份 `CLAUDE.md`，把"这个项目用什么框架、测试怎么跑、目录怎么摆"一次讲清楚，让 AI 不用你反复交代规矩。那是往仓库里加的第一份真正的配置。
