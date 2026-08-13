# Claude Code 与 AI编辑器插件

在过往的十几年中，大家主流的编程工具几乎不怎么变化，但是由于AI大模型的出现，为了充分利用AI编程的能力，编程工具在最近两年发生了极大的变化，回顾一下我们这两年的编程工具演化，可以大致上分为四个阶段

**第一阶段**
一开始，我们用eclipse，idea，vscode，当然更古老的ide就不说了，这些现代的集成ide，最大的特性是，当我们输入几个字母时，会自动提示我们可以选择的函数，甚至也可以帮我们直接生成一些模板代码，例如在idea里面敲下psvm就会弹出整行固定代码，这给我们提供了极大的方便。

**第二阶段**
随着chatgpt的推出，github copilot也慢慢的火了起来，copilot的优势在于，以前ide只能提示一些函数或者模板，但copilot可以直接使用AI模型的能力帮我们直接生成一段代码，以前我们绞尽脑汁写出来的算法函数，在copilot介入后，可能只需要几秒钟，编程效率明显发生了质的提升


**第三阶段**
第三阶段的起点是cursor这个新的编程工具的出现，cursor是基于vscode为原型，并深度结合AI大模型而诞生的新一代IDE，它将copilot再进行了一次升级，以前copilot只能修改一个代码文件，修改或者生成某个函数，能修改的代码范围通常都很小，但一个复杂的代码工程往往是很多文件很多函数互相引用，还有非常多的抽象层级，copilot只能关注局部代码的微调，无法复杂代码直接的关联关系。但cursor解决了这个问题，cursor可以让AI尽可能的去理解整个代码工程，然后全自动地去更新所有关联的代码，这基于它优秀的智能体模式设计和代码记忆系统。当cursor修改了一批代码后，我们也可以直观地在cursor这个ide上看到代码的变更。然后进一步确认AI写得是否正确，如果正确则批准修改，如果不正确也可以直接拒绝

**第四阶段**
其实第三阶段的cursor目前依然也是主流AI编程方案之一，并且cursor也在不断加强，但我认为cursor的上限并不高，AI编程的终极目标应该是完全抛弃IDE，我们不需要再去一行行地在IDE上审核代码，只有这样才能把AI编程的效率提升到最高，事实上AI写出来的代码审核难度非常高，特别是假设一个工程里面百分之九十的代码都是AI写的，那么作为开发者你基本没有能力去审核这些代码，因为开发者自己对这些代码也不熟悉。所以这就来到了第四阶段，也是claude code ，codex这些终端工具的形态，完全抛弃IDE的外壳，也不再去读AI写的代码，我们只需要负责与AI沟通，让AI帮我们去不断调整优化，直到实现我们想要的功能为止。那么这里就出现了一个最核心的问题：**怎么让AI写的代码达到生产级标准？** 如果AI写的代码你都没审核，你自己都不熟悉，你如何确保这个工程能够达到企业级的生产标准呢？ 这就是我们本套课程的核心目的，通过清晰的工程化设计，稳定可靠的架构设计，严格的指令把控体系设计，来让AI写出生产级代码

## claude code的具体形态

Claude Code它跑在终端里，以你启动它的那个目录当作工作区，然后自己去干活。三个特征把它和补全类工具彻底区分开。

**读得到。** 整个仓库都在它的可达范围内，而且是它自己决定读哪些文件。举个 `signup-app` 上的真实例子：报名接口在并发下出现过重复报名。你不需要先翻出 `src/app/api/signup/route.ts` 和 `prisma/schema.prisma`，把两段代码拼起来贴给它，只需要说一句「报名接口在并发下会出现同一个人报两次，查一下原因」。它自己去搜报名相关的路由，顺着代码找到写库的那一段，再去看 schema 里报名表有没有唯一约束，最后告诉你缺的是数据库层的约束，而不是接口里多加一个查询判断。这个「自己找证据」的过程，补全类工具做不到。

**动得了。** 它不只是给你一段代码，而是直接改文件、跑命令、看输出，再根据输出决定下一步。还是上面那个问题：确认原因之后，它改 `prisma/schema.prisma` 加唯一约束，生成迁移，跑 `pnpm test`，测试挂了去看报错，发现是测试里造的数据撞了新约束，回头改测试，再跑一遍变绿。这一整串里你只说了一句话。动手、看结果、修正、再动手——这是个闭环，不是扔给你一段代码就结束。

**有闸门。** 正因为它真能动手，所以每一次动手都要先过权限系统。改文件、跑命令这些动作会被拦下来问你，或者按你事先写好的规则自动放行、自动拒绝。`signup-app` 里 `scripts/deploy.sh` 一跑就推生产，`.env` 里躺着生产数据库连接串，`prisma migrate reset` 一执行本地开发库就空了——这些东西不是靠嘱咐它「别乱来」来保证的，是靠闸门挡住的。第一节说过要把 AI 当内奸用：先装傻用起来、盯住每一步、关键处不放权。这个闸门就是「关键处不放权」的技术落地，第 4 节会把它拆到最细。

把这三点串起来，一次请求内部大致是这样跑的：

<svg viewBox="0 0 760 420" width="100%" height="auto" role="img" aria-label="一次请求内部的流程：提问、读上下文、出计划，然后进入模型决定下一步、经过权限闸门、执行工具的循环，工具结果回灌后模型继续判断，完成后交付">
  <rect x="0" y="0" width="760" height="420" fill="#0d0d12"/>
  <text x="140" y="34" fill="#e5e5ea" font-size="15" text-anchor="middle" font-weight="600">提问</text>
  <text x="340" y="34" fill="#e5e5ea" font-size="15" text-anchor="middle" font-weight="600">读上下文</text>
  <text x="560" y="34" fill="#e5e5ea" font-size="15" text-anchor="middle" font-weight="600">出计划</text>
  <circle cx="140" cy="60" r="9" fill="#0d0d12" stroke="#0099ff" stroke-width="2.5"/>
  <circle cx="340" cy="60" r="9" fill="#0d0d12" stroke="#8a8a94" stroke-width="2.5"/>
  <circle cx="560" cy="60" r="9" fill="#0d0d12" stroke="#8a8a94" stroke-width="2.5"/>
  <line x1="152" y1="60" x2="322" y2="60" stroke="#8a8a94" stroke-width="1.5"/>
  <polygon points="330,60 320,55 320,65" fill="#8a8a94"/>
  <line x1="352" y1="60" x2="522" y2="60" stroke="#8a8a94" stroke-width="1.5"/>
  <polygon points="530,60 520,55 520,65" fill="#8a8a94"/>
  <text x="140" y="88" fill="#8a8a94" font-size="12" text-anchor="middle">你说要什么</text>
  <text x="340" y="88" fill="#8a8a94" font-size="12" text-anchor="middle">自己挑该读哪些文件</text>
  <text x="560" y="88" fill="#8a8a94" font-size="12" text-anchor="middle">拆成一串具体动作</text>
  <polyline points="560,72 560,120 175,120 175,166" fill="none" stroke="#8a8a94" stroke-width="1.5"/>
  <polygon points="175,174 170,164 180,164" fill="#8a8a94"/>
  <rect x="90" y="180" width="170" height="52" rx="6" fill="#0d0d12" stroke="#3a3a44" stroke-width="1.5"/>
  <text x="175" y="204" fill="#e5e5ea" font-size="14" text-anchor="middle">模型决定下一步</text>
  <text x="175" y="222" fill="#8a8a94" font-size="12" text-anchor="middle">还差什么、该做什么</text>
  <rect x="310" y="180" width="140" height="52" rx="6" fill="#0d0d12" stroke="#eaaa08" stroke-width="1.5"/>
  <text x="380" y="204" fill="#eaaa08" font-size="14" text-anchor="middle">权限闸门</text>
  <text x="380" y="222" fill="#8a8a94" font-size="12" text-anchor="middle">放行 · 问你 · 拦下</text>
  <rect x="500" y="180" width="210" height="52" rx="6" fill="#0d0d12" stroke="#3a3a44" stroke-width="1.5"/>
  <text x="605" y="204" fill="#e5e5ea" font-size="14" text-anchor="middle">执行工具</text>
  <text x="605" y="222" fill="#0099ff" font-size="12" text-anchor="middle">读文件 · 改文件 · 跑命令</text>
  <line x1="260" y1="206" x2="302" y2="206" stroke="#8a8a94" stroke-width="1.5"/>
  <polygon points="310,206 300,201 300,211" fill="#8a8a94"/>
  <line x1="450" y1="206" x2="492" y2="206" stroke="#8a8a94" stroke-width="1.5"/>
  <polygon points="500,206 490,201 490,211" fill="#8a8a94"/>
  <polyline points="605,232 605,286 175,286 175,244" fill="none" stroke="#8a8a94" stroke-width="1.5" stroke-dasharray="5 5"/>
  <polygon points="175,236 170,246 180,246" fill="#8a8a94"/>
  <text x="390" y="306" fill="#8a8a94" font-size="12" text-anchor="middle">工具结果回灌，模型再判断下一步</text>
  <polyline points="120,232 120,362 178,362" fill="none" stroke="#16b364" stroke-width="1.5"/>
  <polygon points="186,362 176,357 176,367" fill="#16b364"/>
  <circle cx="200" cy="362" r="9" fill="#0d0d12" stroke="#16b364" stroke-width="2.5"/>
  <text x="222" y="367" fill="#e5e5ea" font-size="15">交付：改动 + 说明 + 跑过的验证</text>
  <text x="222" y="390" fill="#8a8a94" font-size="12">模型判断做完了，才从这个口出来</text>
  <text x="740" y="404" fill="#8a8a94" font-size="12" text-anchor="end">实线 = 去程　虚线 = 结果返程</text>
</svg>

中间那个圈可能转一次，也可能转二十次。终端里刷过的一行行「正在读取…」「正在执行…」，就是它在转。

## 装上并跑通

系统要求先对一遍：macOS 13.0 及以上、Windows 10 或 Server 2019 及以上、Ubuntu 20.04+、Debian 10+、Alpine 3.19+；内存至少 4GB；x64 或 ARM64 处理器。它依赖 ripgrep 做代码搜索，绝大多数环境里是内置的，只有 Alpine 需要自己装一下。

安装方式有五种，取舍很明确：

| 方式 | 命令 | 自动更新 |
|---|---|---|
| 原生安装器（macOS / Linux / WSL） | `curl -fsSL https://claude.ai/install.sh \| bash` | 有 |
| 原生安装器（Windows PowerShell） | `irm https://claude.ai/install.ps1 \| iex` | 有 |
| Homebrew | `brew install --cask claude-code` | 无 |
| WinGet | `winget install Anthropic.ClaudeCode` | 无 |
| npm | `npm install -g @anthropic-ai/claude-code`（需 Node.js 22+） | 无 |

**优先用原生安装器，因为五种方式里只有它自带自动更新。** 这个工具按周迭代，这里写到的不少能力几个版本之前还不存在。用 Homebrew 或 npm 装完，三个月后你手里跑的还是三个月前的东西，遇到问题搜出来的答案全对不上号。

macOS / Linux：

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

Windows（PowerShell）：

```bash
irm https://claude.ai/install.ps1 | iex
```

装完之后，进到项目目录再启动——这一步很多人第一次会漏掉。它以启动时所在的目录当工作区，在 `signup-app` 之外启动，它就看不到这个仓库：

```bash
cd ~/code/signup-app
claude
```

首次启动会走一次登录，登录状态保存之后在任何目录启动都不用再登。会话里用 `/status` 看当前是哪个凭据、连的哪个端点，`/logout` 清掉登录状态——第 6 节接入 Kimi 时这两条会救你一命，「明明配好了却还在走原来的账号」就是靠 `/status` 一眼看穿的。

跑通之后有三条命令值得先记住。查版本：

```bash
claude --version
```

```text
2.1.216 (Claude Code)
```

手动更新：

```bash
claude update
```

体检：

```bash
claude doctor
```

`claude doctor` 是只读的，它检查安装是否健康、配置有没有毛病，只报告不改动。会话内部还有一个 `/doctor`，除了检查还能顺手把发现的问题修掉。什么时候用？某天在 `signup-app` 里启动，自定义配置突然不生效，或者报错找不到某个可执行文件——先跑 `claude doctor`，它会指出是安装路径、权限还是配置文件的问题，比一头扎进配置里瞎翻快得多。


自动更新走哪个频道，可以在 `~/.claude/settings.json` 里定：

```json
{
  "autoUpdatesChannel": "stable",
  "minimumVersion": "2.1.216"
}
```

`latest` 是默认值，跟最新版；`stable` 大约晚一周，好处是能躲掉刚发出来又被紧急修掉的重大回归。取舍很简单：自己的机器上用 `latest`，新能力早一周到手，偶尔碰上小毛病忍一忍；团队里多人协作、或者课程环境要统一，用 `stable`，别让「你那边能跑、这边跑不了」浪费半天。`minimumVersion` 是另一层保险：卡一个最低版本，低于它就不给用。

如果你所在的公司禁止工具自动升级，用环境变量整个关掉：

```bash
DISABLE_AUTOUPDATER=1
```

Windows 用户还有两件事。第一，Git for Windows 是可选的，装了才有 Bash 工具可用；不装就走 PowerShell 工具，`signup-app` 里那些 `pnpm` 脚本照样能跑，只是遇到别人写的 `.sh` 脚本会别扭。Git Bash 装在非默认路径，用 `CLAUDE_CODE_GIT_BASH_PATH` 指出来。第二，沙箱隔离只有 WSL 2 支持，WSL 1 和原生 Windows 都不支持。

##  一次会话的解剖

启动之后你看到的是一个输入框。它长得像聊天，但能干的事比聊天多得多。

**第一条消息怎么发。** 直接打字回车就行，但描述方式决定了它第一步会去干什么。差的说法：「优化一下报名接口」——它不知道你指的是性能、可读性还是并发安全，只能自己猜，猜错了你就得推翻重来。好的说法：「`src/app/api/signup/route.ts` 这个接口在并发下会出现同一个人报名两次，先定位原因，别急着改代码」。目标明确、给了入口文件、还划了一条线（先别动手），它就会先去读代码、给判断，而不是直接开改。

也可以在启动时就把第一句话带上，适合那种「进去就要干这件事」的场景：

```bash
claude "把 tests/ 下失败的用例列出来，先别修"
```

**`@` 引用文件。** 输入 `@` 之后跟路径，它会把这个文件的内容带进上下文：

```text
@prisma/schema.prisma 报名表现在缺唯一约束，评估一下加上去对存量数据的影响
```

`@` 带路径补全，敲几个字母就能选，也可以把文件直接拖进终端窗口。什么时候该用？确切知道问题在哪个文件时用，省掉它自己搜索那几步；不知道在哪时别用，直接描述现象让它去找。

**`#` 写记忆。** 一行以 `#` 开头的话会被直接写进记忆，下次会话还在：

```text
#这个项目一律用 pnpm，禁止出现 npm 或 yarn 命令
```

`signup-app` 最烦人的一件事，就是每开一个新会话都要重新交代「用 pnpm 不用 npm」「迁移必须走 prisma migrate 不许手改 SQL」。`#` 是当场固化这类约定最快的手段。完整玩法在第 7 节展开，那里还有一个关键区别：这类约定属于软约束，模型可能不遵守，真正拦得住的是权限规则和 hooks。

**`!` 直接跑 bash。** 一行以 `!` 开头，后面的内容当命令直接执行，输出会进入上下文：

```text
!pnpm test
```

这比「让它去跑一遍测试」省事：你和它看到的是同一份结果，接下来的对话直接建立在这份输出上。排查线上问题尤其顺手——`!git log --oneline -10` 把最近十次提交拉进上下文，再问「哪一次改动可能引入了报名重复」。

**常用按键。** 这些不用背，用两天就成肌肉记忆：

| 按键                                | 作用               |
| --------------------------------- | ---------------- |
| `Ctrl+J`                          | 插入换行而不提交         |
| `Ctrl+C`                          | 中断当前动作           |
| `Ctrl+D`                          | 退出（800ms 内按两次确认） |
| `Ctrl+O`                          | 切换详细转录视图         |
| `Ctrl+R`                          | 搜索历史输入           |
| `Ctrl+T`                          | 切换待办清单显示         |
| `Ctrl+L`                          | 强制重绘屏幕，已输入内容保留   |
| `↑` / `↓`                         | 翻历史输入            |
| `Ctrl+G` 或 `Ctrl+X Ctrl+E`        | 用外部编辑器编辑当前输入     |
| `Ctrl+B` 或 `Ctrl+X Ctrl+B`        | 把当前任务转入后台        |
| `Shift+Tab`                       | 循环切换权限模式         |
| `Ctrl+V`（Windows / WSL 为 `Alt+V`） | 粘贴图片             |


**接着上次的会话。** 昨天排查到一半的事情，今天不用从头交代：

```bash
claude -c
```

`-c` 直接继续当前目录下最近那次会话。如果最近这次不是你要的——昨天在 `signup-app` 里同时开过「排查报名重复」和「改部署脚本」两条线——用 `-r` 打开选择器挑：

```bash
claude -r
```

知道确切的 session ID，也可以直接跟在后面恢复。会话是按目录归属的，这也是前面强调「先 `cd` 到项目目录再启动」的另一个理由。

**斜杠命令。** 在输入框里以 `/` 开头是命令而不是提问。高频的这些先混个脸熟：

- `/help`：列出所有可用命令，版本更新快，这是最靠得住的清单
- `/clear`：清空上下文重开，是被严重低估的一条命令
- `/compact`：压缩当前对话，可以带指令指定保留什么重点
- `/context`：可视化当前上下文被谁占满了
- `/model`：切换模型
- `/effort`：调节思考投入的档位
- `/plan`：进入计划模式，只出方案不落手
- `/permissions`：查看和增删权限规则
- `/status`：看当前的凭据来源、模型、连接端点
- `/memory`：查看和编辑记忆
- `/init`：分析代码库生成初始的 `CLAUDE.md`

不用现在挨个试，后面每一节会把它们放回各自该在的位置去讲。现在只要知道有这么一批东西存在，敲 `/help` 就找得到。

到这里，一个能读你仓库、能动你文件、能跑你命令的 agent 已经在 `signup-app` 里跑起来了。跑起来之后，真正的问题才刚开始：它读得到 `.env` 里的生产数据库连接串，跑得动 `scripts/deploy.sh`，也执行得了 `prisma migrate reset`——这三件事任何一件失手，代价都不是重写几行代码能挽回的。所以接下来要解决的是那个更要命的问题：怎么让它放手动手，同时又闯不了祸。

## 4. 权限：把内奸关进门禁

第一节留下过一个判断：把 AI 当内奸用。低级玩家一旦识破身份就直接干掉，代价是内奸手上那份产出也一起归零；高级玩家先装傻用起来，盯住每一步，关键时刻不放权，最后把价值榨干。

那句话听起来像心法，但它有具体的技术形态，位置就在权限系统。「先用起来」是不因为怕它删库就退回手敲代码；「盯住每一步」是每一次改文件、每一条命令在真正执行前都要过一道闸门；「关键处不放权」是 `.env` 里那串生产数据库连接串它一个字都读不到，`scripts/deploy.sh` 它永远按不动。

这不是靠嘱咐实现的。嘱咐属于下一节的 CLAUDE.md，模型可能听，也可能在第四十轮对话之后忘干净。权限系统在模型之外，是执行层的开关。

`signup-app` 那次事故就是活教材：本地开发库被一句 `prisma migrate reset` 清空。回头看，没有任何一个环节拦得住它——当时根本没有闸门，只有一句写在文档里的「迁移必须走 prisma migrate，不许手改 SQL」。

### 六种模式，先知道自己站在哪一档

Claude Code 把闸门的松紧度做成了六档：

| 模式 | 文件修改 | 命令执行 | 什么时候用 |
|---|---|---|---|
| `default`（别名 `manual`） | 逐次询问 | 逐次询问（只读命令免问） | 敏感改动、碰生产相关的东西 |
| `acceptEdits` | 自动批准 | 读写类自动，其他仍问 | 方案已经定了，连续改代码 |
| `plan` | 不落手，只出方案 | 不落手 | 动手之前先把路想清楚 |
| `auto` | 分类器判定 | 分类器判定 | 长任务、要它自己跑一段 |
| `dontAsk` | 拒绝 | 只跑预批准的工具 | CI 流水线、锁死的环境 |
| `bypassPermissions` | 直接执行 | 直接执行 | 只在容器或一次性虚拟机里 |

<svg viewBox="0 0 760 340" width="100%" height="auto" role="img" aria-label="六种权限模式按松紧程度排布在一条横轴上，左端全都问、右端全不问，越往右风险越高">
  <rect x="0" y="0" width="760" height="340" fill="#0d0d12"/>
  <text x="70" y="46" fill="#16b364" font-size="14">全都问 / 不落手</text>
  <text x="690" y="46" fill="#d42672" font-size="14" text-anchor="end">全不问 / 全放行</text>
  <line x1="60" y1="70" x2="700" y2="70" stroke="#3a3a44" stroke-width="1" stroke-dasharray="4 4"/>
  <line x1="60" y1="170" x2="692" y2="170" stroke="#8a8a94" stroke-width="1.5"/>
  <polygon points="700,170 690,165 690,175" fill="#8a8a94"/>
  <circle cx="90" cy="170" r="8" fill="#0d0d12" stroke="#16b364" stroke-width="2.5"/>
  <circle cx="210" cy="170" r="8" fill="#0d0d12" stroke="#16b364" stroke-width="2.5"/>
  <circle cx="330" cy="170" r="8" fill="#0d0d12" stroke="#0099ff" stroke-width="2.5"/>
  <circle cx="450" cy="170" r="8" fill="#0d0d12" stroke="#0099ff" stroke-width="2.5"/>
  <circle cx="570" cy="170" r="8" fill="#0d0d12" stroke="#eaaa08" stroke-width="2.5"/>
  <circle cx="690" cy="170" r="8" fill="#0d0d12" stroke="#d42672" stroke-width="2.5"/>
  <text x="90" y="140" fill="#e5e5ea" font-size="15" text-anchor="middle" font-weight="600">plan</text>
  <text x="210" y="140" fill="#e5e5ea" font-size="15" text-anchor="middle" font-weight="600">dontAsk</text>
  <text x="330" y="140" fill="#e5e5ea" font-size="15" text-anchor="middle" font-weight="600">default</text>
  <text x="450" y="140" fill="#e5e5ea" font-size="15" text-anchor="middle" font-weight="600">acceptEdits</text>
  <text x="570" y="140" fill="#e5e5ea" font-size="15" text-anchor="middle" font-weight="600">auto</text>
  <text x="690" y="140" fill="#e5e5ea" font-size="15" text-anchor="middle" font-weight="600">bypass</text>
  <text x="90" y="204" fill="#8a8a94" font-size="12" text-anchor="middle">只出方案</text>
  <text x="90" y="222" fill="#8a8a94" font-size="12" text-anchor="middle">一个字不改</text>
  <text x="210" y="204" fill="#8a8a94" font-size="12" text-anchor="middle">白名单之外</text>
  <text x="210" y="222" fill="#8a8a94" font-size="12" text-anchor="middle">一律拒绝</text>
  <text x="330" y="204" fill="#8a8a94" font-size="12" text-anchor="middle">每一步</text>
  <text x="330" y="222" fill="#8a8a94" font-size="12" text-anchor="middle">你点头</text>
  <text x="450" y="204" fill="#8a8a94" font-size="12" text-anchor="middle">改文件放行</text>
  <text x="450" y="222" fill="#8a8a94" font-size="12" text-anchor="middle">跑命令仍问</text>
  <text x="570" y="204" fill="#8a8a94" font-size="12" text-anchor="middle">分类器替你</text>
  <text x="570" y="222" fill="#8a8a94" font-size="12" text-anchor="middle">逐条判断</text>
  <text x="690" y="204" fill="#8a8a94" font-size="12" text-anchor="middle">没有闸门</text>
  <text x="690" y="222" fill="#8a8a94" font-size="12" text-anchor="middle">仅限容器</text>
  <line x1="90" y1="248" x2="90" y2="272" stroke="#3a3a44" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="450" y1="248" x2="450" y2="272" stroke="#3a3a44" stroke-width="1" stroke-dasharray="3 3"/>
  <line x1="690" y1="248" x2="690" y2="272" stroke="#3a3a44" stroke-width="1" stroke-dasharray="3 3"/>
  <text x="90" y="292" fill="#16b364" font-size="13" text-anchor="middle">陌生代码 / 迁移</text>
  <text x="450" y="292" fill="#0099ff" font-size="13" text-anchor="middle">日常写代码的常驻档</text>
  <text x="706" y="292" fill="#d42672" font-size="13" text-anchor="end">开发机上开 = 请内奸上座</text>
  <text x="380" y="326" fill="#8a8a94" font-size="12" text-anchor="middle">越往右，自动放行的范围越大，你能干预的时机越少</text>
</svg>

`plan` 是最该用起来、也最常被跳过的一档，它彻底不落手，只把方案摊给你看。给 `signup-app` 的报名接口加唯一约束这种活，直接开写是危险的——它得动 `prisma/schema.prisma`，得生成迁移文件，还可能顺手跑一次迁移。先进 `plan` 让它把「改哪个模型、加什么约束、迁移文件长什么样、存量重复数据怎么处理」列出来，你会立刻发现它漏了最关键的一环：库里已有的重复报名记录不清掉，唯一约束根本加不上去。这个问题在方案阶段发现成本是零，等它跑完迁移报错回滚再发现，成本是半小时。

碰生产、碰数据库迁移、碰一段自己都没读过的陌生代码，默认先 `plan`，这条没有例外。

`default`（从 2.1.200 起界面显示为 `⏸ manual mode on`，两个名字都认）每一步都停下来问。刚上手时它能让你看清它到底想干什么，连续写代码时则会把人烦死——改十二个文件要点十二次。

`acceptEdits` 是日常写代码的常驻档。方案已经在 `plan` 里确认过，接下来就是把 `src/app/api/signup/route.ts` 和几个组件改一遍，这时文件修改自动放行，但真要跑 `pnpm prisma migrate dev`，它还是会停下来问。松紧刚好卡在「不打断心流」和「不越界」之间。

`auto` 交给分类器判断，适合打算走开二十分钟的长任务。`dontAsk` 给 CI 和锁死环境用：白名单之外一概拒绝，不弹窗不等待，因为流水线里没人点确认。

`bypassPermissions` 只有一个正确用法——一次性容器或用完就丢的虚拟机。在自己的开发机上开这一档，等于把内奸请上主位：`.env` 随便读、`deploy.sh` 随便跑、`rm -rf` 随便执行，而你连一次点头的机会都没有。命令行上 `--dangerously-skip-permissions` 里的 `dangerously` 不是修辞。

### 三种切换方式

会话里按 `Shift+Tab` 循环切换，这是用得最多的方式。方案想清楚了，从 `plan` 切到 `acceptEdits` 接着干；要动迁移了，再切回 `plan`。

启动时直接指定：

```bash
claude --permission-mode plan
```

或者写进项目的 `.claude/settings.json`，让整个团队开会话时默认就在这一档：

```json
{
  "permissions": {
    "defaultMode": "plan"
  }
}
```

`signup-app` 这种带生产数据库连接串的仓库，项目级 `defaultMode` 设成 `plan` 是合理的——新人克隆下来第一次开会话，它先摊方案而不是先动手。

### allow / deny / ask：把规矩写死

模式管的是整体松紧，规则管的是具体某件事。三种规则写在 `settings.json` 里：

```json
{
  "permissions": {
    "allow": [
      "Bash(pnpm test)",
      "Bash(pnpm run *)",
      "Read(src/**)"
    ],
    "deny": [
      "Read(.env*)",
      "Bash(./scripts/deploy.sh)",
      "Bash(rm -rf *)"
    ],
    "ask": [
      "Bash(git push *)"
    ]
  }
}
```

`allow` 里的免问，`deny` 里的直接拒绝，`ask` 里的强制询问——哪怕当前模式本来会自动放行，`ask` 也能把它拦下来问你一次。

对着 `signup-app` 逐条看这份配置在挡什么。

`Bash(pnpm test)` 和 `Bash(pnpm run *)` 免问，因为跑测试和跑脚本每天要发生几十次，每次弹窗纯属噪音；`Read(src/**)` 免问，因为它得读代码才能干活。

`Read(.env*)` 进 `deny`，挡的是那串生产数据库连接串。这一条比看起来重要得多——`.env` 一旦被读进上下文，连接串就进了对话历史，还可能被顺手打进日志、贴进报错分析。这不是「它会不会拿去干坏事」的问题，是密钥泄露的问题。

`Bash(./scripts/deploy.sh)` 进 `deny`，因为这个脚本直接推生产，不该有任何被自动执行的可能。

`Bash(git push *)` 进 `ask` 而不是 `deny`，因为推代码本身是正常操作，但推之前你得看一眼推的是哪个分支。

还有一层机制值得知道：会话里对某个文件编辑选了「不再询问」，只活到会话结束；但对 git 仓库和脚本的选择会永久保存。某次图省事给 `deploy.sh` 点了「不再询问」，那个口子就一直留在那儿，不会自己关上。

### 2.1.214 的破坏性变化：规则写了却没生效

某天为了调报名接口，直接进到接口目录再开会话：

```bash
cd signup-app/src/app/api/signup
claude
```

然后每改一个文件都在弹询问。配置明明写着 `Edit(src/**)`，为什么不生效？

从 2.1.214 起，单段目录规则只匹配**当前工作目录下那一层**。此刻 cwd 是 `signup-app/src/app/api/signup`，`Edit(src/**)` 找的是这个目录下的 `src` 子目录——根本不存在，所以一条都匹配不上。

要任意深度匹配，规则必须写成：

```json
{
  "permissions": {
    "allow": ["Edit(**/src/**)"]
  }
}
```

关键在于这个变化**只影响 `allow`**。`deny` 和 `ask` 仍然保持任意深度匹配。这个设计有道理：放行规则收紧只是让你多点几次确认，最坏结果是麻烦；拦截规则收紧会让本该被挡住的操作漏过去，最坏结果是事故。所以 `Read(.env*)` 这条不管从仓库哪个角落启动会话，都拦得住。

排查这类问题的姿势：先看 cwd 在哪儿，再看规则是单段还是 `**` 开头。绝大多数「规则失效」都是这两件事之一。

### 有些路径默认就动不了

不用写任何规则，下面这些路径的写入默认会被拦住：`.git/`、`.claude/`、`.vscode/`、`.idea/`、`.bashrc`、`.zshrc`、`.npmrc`、`.mcp.json`、`.gitconfig`。

`.claude/` 和 `.git/` 尤其关键，理由是同一个：它们是规则本身待的地方。`.claude/settings.json` 里装着上面所有的 `deny` 规则，如果这个目录可写，整套权限系统就成了自证清白的循环——模型改一行配置，把 `Read(.env*)` 从 `deny` 里删掉，然后光明正大地读。闸门的钥匙不能挂在闸门里侧。`.git/` 同理，能写 `.git/hooks/pre-commit` 就等于能在你每次提交时执行任意命令，绕过所有工具层面的检查。

`.bashrc`、`.zshrc`、`.npmrc` 则是 shell 和包管理器的启动配置，往里面塞一行东西，影响的是你以后开的每一个终端。

### auto 模式的分类器

`auto` 从 2.1.207 起在多数后端不需要额外开关就能用。它的做法是拿一个分类器逐条判断每次工具调用该不该放行，默认拒绝约三十类高危动作——`curl | bash` 这种下载即执行、生产环境部署、强制删除、把密钥打进输出、force push，都在里面。

启用方式：

```json
{
  "permissions": {
    "defaultMode": "auto"
  }
}
```

但即便开了 `auto`，显式写的 `deny` 和 `ask` 依然强制生效，优先级高于分类器，这个顺序不能反。原因很直接：分类器判断的是「这个动作看起来危不危险」，属于通用常识；`deny` 规则表达的是「在这个项目里这件事绝对不行」，属于本地知识。`scripts/deploy.sh` 在分类器眼里只是个普通 shell 脚本，没有任何特征让它显得比 `scripts/seed.sh` 更危险——只有你知道它会推生产。

会话里用 `/permissions` 打开权限视图，能查看和增删规则，也能看到最近被分类器拒掉了哪些操作。开了 `auto` 之后定期扫一眼这个列表很有价值，你会看到它到底在尝试做什么，其中有没有你根本没预料到的动作。

### 一条要记住的分界

这一节可以压成一句话：**CLAUDE.md 是软约束，权限规则是硬约束。**

写在 CLAUDE.md 里的「不许手改 SQL」本质上是提示词的一部分，模型大概率会听，但上下文长了、话题偏了、压缩过一次之后就未必。这类约束失效时不会报错，只会在某个你没盯着的时刻悄悄发生。写在 `settings.json` 的 `deny` 里就不一样，它在模型之外，模型看不到、改不动、绕不过，请求会被直接驳回。

希望它遵守的，写进 CLAUDE.md；绝对不能被违反的，写进权限规则。这个区分后面讲 hooks 时还会回来一次，那时会看到硬约束还能更硬。

## 5. 模型与上下文预算

### 四个模型，怎么选

| 别名 | 说明 |
|---|---|
| `opus` | 最强，成本最高 |
| `sonnet` | 均衡，当前默认，从 2.1.197 起原生 1M 上下文 |
| `haiku` | 快且便宜 |
| `fable` | 新增模型 |

日常写代码用默认的 `sonnet`，这是绝大多数时间该待的地方。给 `signup-app` 加一个报名截止时间字段、改一版邮件模板、补几个测试——这类活 `sonnet` 完全够，换 `opus` 只是多花钱。

两种情况值得切 `opus`：一是难啃的架构问题，比如「报名并发下出现重复记录，该加唯一约束、加行锁、还是改成先占位再确认」，这种要权衡取舍的判断 `opus` 明显更靠谱；二是自己已经查了半小时还没头绪的排错，比如迁移在本地跑得好好的、上了 VPS 就报连接池耗尽。

批量机械活切 `haiku`：三十个文件里的旧 API 调用统一换新、给一批组件补类型标注。这类任务不需要判断力，只需要不出错。

切换有三种方式：启动时 `--model opus`，会话里 `/model opus`，或者写进 settings 的 `"model"` 字段。

`effort` 控制它在一个任务上愿意花多少力气，级别 `low` / `medium` / `high` / `xhigh` / `max`，另有 2.1.195 起的 `ultracode`，代码专用的最大档。会话内 `/effort high`，启动时 `--effort high`，settings 里是 `"effortLevel"`。

扩展思考用 `/thinking on` 切换，settings 里对应 `"alwaysThinkingEnabled"`。思考按输入 token 计费，不是白送的——排查那个连接池问题时开着值，改邮件模板时开着就是浪费。

快速模式 `/fast on`，速度约 2.5 倍，单价更高，而且默认跨会话保持。这一条要留意：某次赶进度开了 `/fast`，第二天开新会话它还开着，账单出来的时候人是懵的。具体贵多少去自己账号的计费页看。

团队里想统一模型，settings 里可以卡白名单：

```json
{
  "availableModels": ["sonnet", "haiku"],
  "enforceAvailableModels": true
}
```

加上 `enforceAvailableModels` 之后，命令行的 `--model opus` 也覆盖不了。给学员团队或者预算有上限的项目用，这一对配置很实用。

### 上下文是有限预算

上下文窗口是一笔预算，会花光。花光之后的表现不是报错，而是它开始遗忘——第三轮说过「这个项目用 pnpm 不用 npm」，到第四十轮它给你敲了一句 `npm install`。

`/context` 能看到这笔预算的构成：系统提示、记忆、环境信息、MCP 工具定义、消息历史各占多少。第一次看通常会有个发现——MCP 工具定义比想象中吃得多，装了七八个 server 而实际只用两个的话，光工具定义就能吃掉一大块。

`/compact` 是压缩，把之前的对话总结成一段摘要留下。可以带指令指定保留重点：

```bash
/compact 保留 prisma schema 的改动方案和已经确认的迁移步骤
```

自动压缩默认开着，settings 里 `"autoCompactEnabled": false` 或者环境变量 `DISABLE_AUTO_COMPACT=1` 可以关掉。

`/clear` 是直接清空重开。

### 什么时候该 clear 而不是 compact

这是个真正影响效率的判断，标准有三条：

**话题已经换了。** 上半场在调报名接口的并发问题，现在要改前端表单样式。两件事之间没有任何共享上下文，压缩只是把一堆用不上的东西换成一段用不上的摘要。直接 `/clear`。

**上一轮的探索是死路。** 试了三种方案改并发问题全都不对。压缩会把三条错路的痕迹留在摘要里，模型带着这些痕迹继续想，已经被自己的错误结论带偏了。清空重开、重新描述问题，往往十分钟就出来了。

**上下文里全是无关的文件内容。** 为了定位一个问题它读了二十个文件，其中十八个跟最终原因无关。这些内容还占着位置，压缩只能把它们压成几行一样没用的摘要。

反过来说，`compact` 适合的场景其实很窄：同一个任务还没做完、上下文快满了，而前面的讨论里确实有必须带下去的决策。

代价要看清楚。压缩一定会丢细节，更麻烦的是压完之后模型对早期决策的记忆是二手的——它记得的不是「讨论过 A、B、C 三个方案，因为 B 在并发下会丢数据所以选了 A」，而是摘要里那句「决定采用 A 方案」。后面遇到新情况需要重新评估时，它没有原始依据，只能在一句结论上继续推。所以反复 compact 的会话质量是逐轮衰减的，压过两次还没做完，通常说明这个任务本身该拆了。

`/rewind` 解决的是另一类问题：`/clear` 是「不要之前的上下文了」，`/rewind` 是「刚才那几步改错了，退回去重来」，代码和对话一起回退到检查点。文件检查点由 `"fileCheckpointingEnabled"` 控制，默认开着。改崩一片文件而 git 还没提交的时候，这是最快的退路。

最后一个容易踩的点：压缩之后，项目根目录的 CLAUDE.md 会被重新注入上下文，但**子目录的 CLAUDE.md 不会自动恢复**。在 `src/app/api/.claude/CLAUDE.md` 里写了「这个目录下所有接口必须做输入校验」，压缩之后它就不在上下文里了，除非它重新读到那个目录下的文件。发现压缩后接口写得不如之前规范，多半就是这个原因。

## 6. 换个后端：把 Kimi 接进来

### 原理：顶替掉那个地址

会用到这一节，通常是两种情况：账号额度紧张，月中就把量跑完了但活还得干；或者想找个成本更低、国内访问顺畅的后端顶上一段。

Claude Code 说到底是一个客户端，它跟模型之间走 Anthropic Messages 格式，请求打到 `/v1/messages`，并且要求上游流式返回。`ANTHROPIC_BASE_URL` 干的事就一件：把这个请求地址顶替掉，原本发往 `api.anthropic.com`，改完之后发往你指定的地方。只要对面实现了这套格式，就能接上。

认证走两个变量之一。`ANTHROPIC_AUTH_TOKEN` 的值会被加上 `Bearer ` 前缀放进 `Authorization` 头；`ANTHROPIC_API_KEY` 则作为 `X-Api-Key` 头发送，而且优先于已登录的订阅账号态。这就是接第三方后端时必须确保 `ANTHROPIC_API_KEY` 是空的原因——它会抢在前面把请求搅黄。

所以这一节讲的不只是 Kimi，任何实现了这套格式的服务都能用同样的办法接上。

### Kimi 的域名与端点

域名这块最近变过，网上教程新老混杂，先说清楚：文档站的 `platform.moonshot.cn` 已经 301 永久跳转到 `platform.kimi.com`，但 **API 域名仍然是 `api.moonshot.cn`**，没跟着改。海外对应 `platform.kimi.ai` 和 `api.moonshot.ai`。

兼容端点是：

```text
https://api.moonshot.cn/anthropic
```

注意这个地址后面不带 `/v1/messages`，Claude Code 会自己拼上去。也不需要配任何额外的自定义 header。

在售的编程相关模型：

| model id | 上下文 | 定位 |
|---|---|---|
| `kimi-k3` | 1M | 旗舰，多模态 + 编程 + 推理，官方点名适配 Claude Code 这类编程 Agent |
| `kimi-k2.7-code` | 256K | 编程专用 |
| `kimi-k2.7-code-highspeed` | 256K | 编程专用高速版，输出速度约为普通版 5 到 6 倍 |
| `kimi-k2.6` | 256K | 通用 + 视觉 + Agent |
| `kimi-k2.5` | 256K | Agent / 编程 / 视觉 / 通用 |

老的 `moonshot-v1-*` 系列 8 月 31 日全平台下线，`kimi-k2` 系列已于 2026 年 5 月 25 日下线。这块迭代很快，在售型号看 `platform.kimi.com/docs/models`。

### 完整配置：11 个变量，一个都不能少

macOS / Linux：

```bash
export ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"
export ANTHROPIC_AUTH_TOKEN="你的_Kimi_API_Key"
export ANTHROPIC_MODEL="kimi-k3[1m]"
export ANTHROPIC_DEFAULT_OPUS_MODEL="kimi-k3[1m]"
export ANTHROPIC_DEFAULT_SONNET_MODEL="kimi-k3[1m]"
export ANTHROPIC_DEFAULT_HAIKU_MODEL="kimi-k3[1m]"
export ANTHROPIC_DEFAULT_FABLE_MODEL="kimi-k3[1m]"
export CLAUDE_CODE_SUBAGENT_MODEL="kimi-k3[1m]"
export ENABLE_TOOL_SEARCH="false"
export CLAUDE_CODE_AUTO_COMPACT_WINDOW="1048576"
export CLAUDE_CODE_EFFORT_LEVEL="max"
```

Windows（PowerShell）：

```powershell
$env:ANTHROPIC_BASE_URL="https://api.moonshot.cn/anthropic"
$env:ANTHROPIC_AUTH_TOKEN="你的_Kimi_API_Key"
$env:ANTHROPIC_MODEL="kimi-k3[1m]"
$env:ANTHROPIC_DEFAULT_OPUS_MODEL="kimi-k3[1m]"
$env:ANTHROPIC_DEFAULT_SONNET_MODEL="kimi-k3[1m]"
$env:ANTHROPIC_DEFAULT_HAIKU_MODEL="kimi-k3[1m]"
$env:ANTHROPIC_DEFAULT_FABLE_MODEL="kimi-k3[1m]"
$env:CLAUDE_CODE_SUBAGENT_MODEL="kimi-k3[1m]"
$env:ENABLE_TOOL_SEARCH="false"
$env:CLAUDE_CODE_AUTO_COMPACT_WINDOW="1048576"
$env:CLAUDE_CODE_EFFORT_LEVEL="max"
```

官方的 PowerShell 写法没有用 `setx`，只对当前这个窗口生效，关掉就没了。

### 每个变量漏配会出什么症状

清单堆在那儿很容易照抄了事，但真正有用的是知道漏掉某一条会看到什么现象——这些现象长得都不像「变量没配」。

`ANTHROPIC_MODEL` 没设，Claude Code 会拿 Claude 的默认模型名发过去，Kimi 端不认识，直接报 model not found。这个最好排查，报错说得很清楚。

四个 `ANTHROPIC_DEFAULT_*_MODEL` 没设，症状是对应档位的任务失败，就没那么直观了。haiku 档负责的是后台标题生成、会话摘要这类活，漏了之后主对话完全正常，只是会话列表里的标题一直空着或报错，很容易被当成小毛病放过。

`CLAUDE_CODE_SUBAGENT_MODEL` 没设，是这一堆里最难自己排查出来的。症状是主对话一切正常，写代码、改文件、跑命令全都顺畅；某次让它派一批子任务并行去做——比如同时审查 `signup-app` 的五个接口文件——立刻就崩，子 agent 失败或者产出明显变差。

难就难在主对话是好的，第一反应不会是「配置有问题」，而是「这个模型不行」或「并行任务不稳定」，于是调任务描述、减并行数、换模型，全不解决问题。根因只有一条：子 agent 用的是单独的模型变量，没设，还在用 Claude 的模型名。

`CLAUDE_CODE_AUTO_COMPACT_WINDOW` 必须跟模型的实际上下文对上。`kimi-k3` 是 1M，填 `1048576`；`kimi-k2.7-code` 是 256K，填 `262144`。填小了过早触发压缩、白丢上下文，填大了撞上游的上下文上限。用 k2.7-code 却照抄了 k3 的 `1048576`，症状就是干着干着突然报上下文超限，而 `/context` 显示明明还没满。

`ENABLE_TOOL_SEARCH` 必须是 `false`，Kimi 端点暂不支持，开着工具调用会异常。

### 写进 settings.json 的另一种方式

不想每次开终端都设一遍，可以写进 `~/.claude/settings.json` 的 `env` 字段：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://api.moonshot.cn/anthropic",
    "ANTHROPIC_AUTH_TOKEN": "你的_Kimi_API_Key",
    "ANTHROPIC_MODEL": "kimi-k3[1m]",
    "ANTHROPIC_DEFAULT_OPUS_MODEL": "kimi-k3[1m]",
    "ANTHROPIC_DEFAULT_SONNET_MODEL": "kimi-k3[1m]",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "kimi-k3[1m]",
    "ANTHROPIC_DEFAULT_FABLE_MODEL": "kimi-k3[1m]",
    "CLAUDE_CODE_SUBAGENT_MODEL": "kimi-k3[1m]",
    "ENABLE_TOOL_SEARCH": "false",
    "CLAUDE_CODE_AUTO_COMPACT_WINDOW": "1048576",
    "CLAUDE_CODE_EFFORT_LEVEL": "max"
  }
}
```

三条警告要记住。settings 里的 `env` 会**覆盖**终端里 export 的同名变量；文件里存的是明文 Key，别提交进 git，尤其别写进项目级的 `.claude/settings.json`，那等于直接把 Key 推上仓库；改完要重启 Claude Code 才生效。

环境变量和 settings 二选一，不要混用。混用之后排查「为什么改了不生效」会非常难受——终端里明明 export 成了新值，实际生效的却是 settings 里那个旧的。

### `[1m]` 后缀是什么

`kimi-k3[1m]` 里那个方括号不是 Kimi 模型名的一部分，它是 Claude Code 客户端侧的扩展上下文标记，发给上游之前会被剥掉，实际发出去的 model 字段就是 `kimi-k3`。Kimi 文档只要求照这个拼写抄，没解释含义——知道这一点，看到它就不用怀疑自己抄错了。

### 接进来之后确实会少些东西

下面这些现象出现的时候，第一反应几乎都是「是不是配错了」。不是。这些是接第三方后端之后必然损失的能力，跟配置无关。

**Tool Search 用不了**，必须显式关掉，上面那条 `ENABLE_TOOL_SEARCH="false"` 就是干这个的。

**WebFetch 不可用**。让它抓个网页会报 `temporarily unavailable`，或者干脆抓不到内容。变通办法是手动把网页内容贴进对话，或者装一个抓取类的 MCP 工具替代。

**`/model` 菜单永远不会显示 Kimi 模型**。这个菜单是内置的固定别名列表，只有 opus / sonnet / haiku / fable。打开一看没有 kimi，很容易以为配置没生效——判断依据不是这个菜单，是 `/status`，那里应该能看到 Base URL 和 `kimi-k3[1m]`。另外换模型要把所有模型变量一起改，改一个没用。

**`kimi-k2.7-code`（含 highspeed 版）强制思考常开**，必须保持 Thinking on，关掉会直接报错：

```text
400 invalid thinking: only type=enabled is allowed for this model
```

`kimi-k3` 默认开思考，不受这个限制；`kimi-k2.6` 的思考可选。

**Remote Control 被禁用**。从 2.1.196 起，只要 `ANTHROPIC_BASE_URL` 指向的不是 `api.anthropic.com`，Remote Control 就会被关掉，MCP tool search 默认也一并禁用。

**有两件事仍然直连官方域名**：快速模式的可用性探测，和 WebFetch 的域名安全检查。这两个请求不走你配的 base URL，网络到不了官方域名时，这两处会有额外的等待或失败。

**上下文用量可能不准**。上游若没有提供 `/v1/messages/count_tokens`，Claude Code 会退化成本地估算，`/context` 里的数字只是个大概。

### Key 与计费，以及那个坑

Key 在 `platform.kimi.com/console/api-keys` 创建，选默认项目就行。

这里有个必须提前知道的坑：新用户注册会送 15 元代金券（国内手机号注册，有效期三个月），但**这张券不能用于 `kimi-k3`**。想用 K3 必须先充值，最低 10 元，充完才解锁；个人用户还得先完成实名认证才能在线充值。

不知道这一条的话，流程通常是：注册、拿券、照配置全套设好、启动、报错，然后开始怀疑 Key 抄错了、端点写错了、变量漏了一个，排查半天毫无结果——实际原因只是那个模型压根没解锁。

计费按 token 走，输入输出分别计价。限速按累计充值金额分 Tier0 到 Tier5，Tier0 的并发只有 1，同一时刻只能跑一个请求。这个限制在用 Claude Code 时感知很明显，因为它经常要并行读多个文件。具体单价和各档限速去自己账号的计费页看。

### 常见报错对照

| 现象 | 原因与解法 |
|---|---|
| 401 鉴权失败 | Key 无效；或者之前配过 `ANTHROPIC_API_KEY` 没删，两者冲突 |
| model not found | 模型变量拼写错误，检查 `kimi-k3[1m]` 有没有多余的空格或引号 |
| 子 agent / 后台任务报错 | `ANTHROPIC_DEFAULT_HAIKU_MODEL`、`ANTHROPIC_DEFAULT_FABLE_MODEL` 或 `CLAUDE_CODE_SUBAGENT_MODEL` 漏配 |
| 改了配置不生效 | settings.json 的 `env` 残留覆盖了终端变量；或者终端 export 只对当前会话有效；改完要重启 |
| Key 与端点不匹配 | `.cn` 的 Key 必须配 `.cn` 的端点 |
| 之前 `/login` 登录过 Claude 账号 | `ANTHROPIC_AUTH_TOKEN` 优先于已保存的登录态；用 `/status` 看凭据来源，`/logout` 清除 |
| `400 invalid thinking` | k2.7-code 强制思考，保持 Thinking on；仍不行就换 `kimi-k2.6`；k3 没这个限制 |

### 一个必须点名的废弃变量

`ANTHROPIC_SMALL_FAST_MODEL` 已被官方标注 DEPRECATED，取代它的是 `ANTHROPIC_DEFAULT_HAIKU_MODEL`。

单独点名是因为网上大量老教程还在教它。照着抄一遍，会发现小模型档位的任务始终失败，而配置看起来一条不缺。别再用了。

### 官方的态度，以及一个务实的建议

官方文档里写得很直接：Anthropic 不背书、不维护、不审计第三方网关产品，也不支持通过任何网关把 Claude Code 路由到非 Claude 模型。这句话没有解释空间——用第三方后端出了问题，官方不接。

那还要不要用？要，但分场合。这条路确实能用，成本低，国内访问顺畅，额度紧张时顶一段完全没问题，练手项目、批量机械活、整理文档都合适。

但重要项目别把它当唯一后端。行为差异、能力缺失、上游变更随时可能发生，而发生的时候没有人对你负责。真正在意的项目上，主力后端保持官方，第三方当备用——这不是保守，是第一节那句话在工具选型上的重复：AI 不担责，所以后路得你自己留。

到这里，闸门装好了，模型选好了，后端也备好了。但每次开一个新会话，还是得从头交代一遍「这个项目用 pnpm 不用 npm」「迁移必须走 prisma migrate」——这些话说了几十遍，它下一次开会话照样不知道。下一段要解决的就是这件事：怎么让它真正读懂你这个项目。

## 7. 让它真正读懂你的项目

打开 `signup-app`，起一个新会话，让它加一个报名人数上限的字段。它上来就敲 `npm install`，你打断，说这个项目用 pnpm。它改过来，继续，直接动手写了一段 `ALTER TABLE` 的 SQL 塞进 `prisma/migrations` 里，你又打断，说迁移必须走 `prisma migrate dev` 生成，不许手改 SQL 文件。它道歉，重来，最后跑测试的时候敲了 `npm test`。

第三次打断的时候，就该意识到问题不在它笨，而在于这三句话每次开会话都要重新说一遍。会话是有生命周期的，`/clear` 一下、关掉终端、第二天重开，之前交代的全没了。靠嘴说的规矩，寿命等于一次会话；写进文件的规矩，寿命等于这个仓库。

`CLAUDE.md` 就是那个文件。它放在仓库里，启动会话时被自动读进上下文，等于每次对话开头都替你把项目的规矩复述一遍。它不是文档，是提示词的一部分——写在里面的每一个字，都会消耗真实的上下文预算，所以它该短、该具体、该只写「不写就会出错」的东西。项目的历史沿革、模块设计动机、给新人看的入门指引，都不该往里塞。

第一份不用手写。在 `signup-app` 根目录起会话，敲：

```bash
claude
```

进去之后执行：

```text
/init
```

它会把仓库扫一遍——看 `package.json` 认出包管理器和脚本、看 `prisma/schema.prisma` 认出数据库、看 `tests/` 认出测试方式，然后生成一份初稿。如果这个仓库以前用过 Cursor，根目录还留着 `.cursorrules`，或者 `.github/copilot-instructions.md` 里写过 Copilot 的规则，`/init` 会把这些已有的约定读进来一并整合，不用你手工搬。已经存在 `CLAUDE.md` 时，`/init` 不会覆盖，只会给出改进建议。

### 五个位置，级联而不是覆盖

CLAUDE.md 不止一个。它有一整套加载层级：

| 位置 | 作用域 | 加载时机 |
|---|---|---|
| `/etc/claude-code/CLAUDE.md`（或系统对应路径） | 全组织 | 启动 |
| `~/.claude/CLAUDE.md` | 当前用户的所有项目 | 启动 |
| 仓库根 `CLAUDE.md` 或 `./.claude/CLAUDE.md` | 项目团队，提交进 git | 启动 |
| `CLAUDE.local.md` | 当前用户 + 当前项目 | 启动 |
| `<子目录>/.claude/CLAUDE.md` | 该子目录 | 按需，读到那个目录的文件时才加载 |

关键在于这几层是**级联**关系，不是覆盖关系——它们全部会进上下文，谁也不会把谁顶掉。所以 `~/.claude/CLAUDE.md` 里适合写跨项目都成立的个人习惯（比如「回答用中文」「改完代码要给出验证方式」），仓库根的 `CLAUDE.md` 写团队共识并提交 git，`CLAUDE.local.md` 写只属于你这台机器的东西（本地数据库端口、你自己的调试开关），记得加进 `.gitignore`，别让它跟着 PR 跑出去。

最后一行是最容易被忽略、也最有用的一条：子目录的 CLAUDE.md 是**按需加载**的。`signup-app` 现在还小，用不上；等它长到 `src/app/` 下面几十个路由、`src/lib/` 里塞满工具函数的时候，你可以在 `src/app/api/.claude/CLAUDE.md` 里单独写「所有 API 路由必须用 `zod` 校验入参，失败返回 400 并带 `code` 字段」。这段规则只在它真的去读 `src/app/api/` 下的文件时才进上下文，平时不占一个 token。大仓库该怎么组织的答案就在这里：根目录那份只留全局都成立的，其余按目录下沉。

还有一个副作用要知道：会话被 `/compact` 压缩之后，项目根的 CLAUDE.md 会被重新注入，但子目录那些**不会自动恢复**。长会话跑到后半段发现它突然忘了 API 层的约定，八成就是这个原因，重新提一句那个目录下的文件即可。

### 拆文件：`@import` 与按路径加载

一份 CLAUDE.md 长到三百行就该拆了。正文里直接写 `@` 加路径就是导入：

```markdown
项目的接口返回格式见 @docs/api-conventions.md
数据库改动流程见 @docs/db-workflow.md
```

相对路径相对于当前文件所在位置，`~/` 开头当绝对路径处理。导入最多递归 4 层，也就是 A 导入 B、B 导入 C 这样往下最多四级，再深的不会被继续展开。代码块里的 `@xxx` 会被跳过，所以文档里写 `npm install @prisma/client` 或者示例代码里出现 `@Injectable` 都不会被误当成导入路径。

比 `@import` 更省的是 `.claude/rules/`。这个目录下的每个 `.md` 都可以在 frontmatter 里声明自己只在动哪些文件时才加载：

```markdown
---
paths:
  - "prisma/**"
  - "src/app/api/**/*.ts"
---

改动数据库前必须先在 plan 模式下给出迁移方案。
新增字段一律先可空，回填完成后再收紧约束。
禁止手写 migration SQL，一律用 pnpm prisma migrate dev 生成。
禁止执行 prisma migrate reset。
```

把这段存成 `signup-app/.claude/rules/db.md`。以后你让它改个前端样式，这四条规则一个字都不会进上下文；一旦它开始碰 `prisma/` 或者 API 路由，规则自动就位。上下文预算是有限的，这种「用得着才付钱」的组织方式，是大项目里唯一能长期维持的做法。

### 自动记忆

除了你手写的这些，Claude Code 还会自己攒东西。自动记忆默认开启，存在 `~/.claude/projects/<项目>/memory/` 下，启动时加载其中 `MEMORY.md` 的前 200 行或 25KB，其余主题文件按需读取。它记的是那种「说过一次就不该再说第二次」的偏好——比如你在 `signup-app` 里明确否决过用 `any` 兜底类型，下次它就不会再提这个方案。

手动写入很简单，在对话框里以 `#` 开头说一句话：

```text
# signup-app 的报名接口必须保证幂等，重复提交返回同一条记录而不是报错
```

回车即写入。`/memory` 可以查看和编辑已存的内容，`/compact` 压缩对话不会清掉它。不想要这套机制，环境变量 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` 关掉，或者在 settings 里把 `autoMemoryEnabled` 置为 false。

记忆和 CLAUDE.md 的分工是：CLAUDE.md 是你主动定的规矩，进 git，团队共享；记忆是它被动攒的偏好，只在你这台机器上，别人看不见。团队要遵守的东西别指望记忆，写进 CLAUDE.md。

### settings.json：五层优先级

规矩之外还有配置。`settings.json` 决定用哪个模型、默认什么权限模式、环境变量是什么、hooks 挂在哪。它同样分层，优先级从高到低：

| 层级 | 位置 | 作用域 | 是否入库 |
|---|---|---|---|
| 管理策略 | `/etc/claude-code/managed-settings.json`（或系统对应路径） | 全组织 | IT 下发，不可覆盖 |
| CLI 参数 | `--model`、`--permission-mode` 等 | 当前会话 | — |
| 本地 | `.claude/settings.local.json` | 当前用户 + 当前项目 | 应 gitignore |
| 项目 | `.claude/settings.json` | 全体协作者 | 提交 git |
| 用户 | `~/.claude/settings.json` | 当前用户全部项目 | 否 |

常用字段就这些：`model`、`effortLevel`、`alwaysThinkingEnabled`、`availableModels`、`enforceAvailableModels`、`permissions`（含 `defaultMode` / `allow` / `deny` / `ask`）、`env`、`hooks`、`autoMemoryEnabled`、`autoCompactEnabled`、`fileCheckpointingEnabled`、`editorMode`、`autoUpdatesChannel`、`minimumVersion`、`disableAllHooks`、`allowedMcpServers`。

顶部加一行 `$schema`，编辑器就有补全和字段校验，敲错一个字母当场标红：

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "model": "sonnet",
  "permissions": {
    "defaultMode": "plan",
    "deny": ["Read(.env*)", "Bash(./scripts/deploy.sh)", "Bash(pnpm prisma migrate reset*)"],
    "ask": ["Bash(git push *)"]
  }
}
```

这份放 `signup-app/.claude/settings.json` 提交 git，团队里每个人 clone 下来就自带同一套护栏。

有一个坑必须单独点出来：同一个变量既在 shell 里 `export` 了，又在 settings 的 `env` 字段里写了，**生效的是 settings 里的值**。第 6 节接 Kimi 时最常见的翻车现场就是这个——终端里明明 export 成了新模型，结果一直没生效，因为 `~/.claude/settings.json` 的 `env` 里还留着上次试验时写死的旧值。同理，`env` 中的变量优先于同名的 settings 字段，`env` 里的 `ANTHROPIC_MODEL` 会盖掉外面的 `model`。两套配置方式二选一，别混用。

### 一个必须记住的结论

CLAUDE.md 是提示词的一部分。提示词是**软约束**——模型大概率会遵守，但不保证。

这句话的分量在于：把安全要求写进 CLAUDE.md，然后觉得万事大吉，是新手最典型的一次误判。`.env` 里躺着 `signup-app` 的生产数据库连接串，你在 CLAUDE.md 里写「禁止读取 .env」，写十遍、加粗、大写、后面跟三个感叹号——它读到某个报错需要查数据库配置的时候，仍然可能去读。不是它不听话，是提示词本来就没有强制力。

真正拦得住的只有两样：settings.json 里的权限规则，和下一节要讲的 hooks。一条 `"deny": ["Read(.env*)"]` 顶得上十页 CLAUDE.md。所以分工要清楚——**CLAUDE.md 负责让它干得对，权限和 hooks 负责让它干不了不该干的**。前者是引导，后者是闸门，两者不能互相替代。

### `signup-app` 的完整实例

下面这份可以直接抄进 `signup-app/CLAUDE.md`，改掉项目名和路径就能用在自己的仓库上：

```markdown
# signup-app

社团报名系统。前后端一体，部署在单台 VPS。

## 技术栈

- Next.js（App Router）+ TypeScript
- Prisma + PostgreSQL
- 包管理器：pnpm（不要用 npm 或 yarn）

## 构建与运行

- 开发：pnpm dev
- 构建：pnpm build
- 测试：pnpm test（不是 npm test）
- 代码检查：pnpm lint

## 目录约定

- src/app/         页面与 API 路由，API 一律放 src/app/api/<资源>/route.ts
- src/lib/         纯函数与数据访问，不得直接引用 React
- prisma/          schema 与迁移文件
- tests/           测试，与被测文件同名加 .test.ts
- scripts/         运维脚本

## 数据库

- 改 schema 后必须执行 pnpm prisma migrate dev 生成迁移文件
- 新增非空字段先设默认值或先可空，回填后再收紧
- 报名相关表的唯一约束不得删除，并发下靠它防重复报名

## 代码风格

- 禁止用 any 兜底类型，确需放宽要写明原因并限定在最小范围
- 接口入参一律校验，失败返回 400 并带 code 字段
- 异常必须捕获并记录，禁止吞掉后返回成功

## 禁止事项

- 禁止手写 migration SQL
- 禁止执行 prisma migrate reset
- 禁止执行 scripts/deploy.sh（该脚本直接推生产）
- 禁止读取或打印 .env 内容
```

最后四条同时写进 settings 的 `deny` 规则里。写在这里是让它知道为什么，写在那里是让它做不到。

## 8. 把重复流程固化成命令

`signup-app` 每次发版前那套动作是固定的：跑一遍测试、看 lint 有没有新增告警、检查 `prisma/migrations` 里有没有没提交的迁移、对着 `git diff` 写一份变更说明。这套流程一个月要走五六次，每次都得把这四件事重新打一长串字交代一遍，还经常漏掉第三条。

第二次打同样的字，就该把它存成文件。

### 存在哪、怎么调

自定义命令（现在的正式称呼是技能）放在 `.claude/skills/<名字>/SKILL.md`。旧式的单文件写法 `.claude/commands/<名字>.md` 仍然可用，老项目里见到不用改。用户级的放 `~/.claude/skills/`，所有项目通用；插件带的放在插件自己的 `skills/` 目录下，调用时带命名空间前缀 `/插件名:技能名`。

调用就是 `/名字`。子目录会自动形成命名空间：`.claude/skills/admin/reset/SKILL.md` 对应 `/admin:reset`。命令攒多了以后按用途分几个子目录，`/help` 里看着就不乱。

### frontmatter 字段

```yaml
---
description: "给 /help 看的一句话说明，模型也靠它判断什么时候该自动用这个技能"
argument-hint: "<分支名> <环境>"
disable-model-invocation: false
allowed-tools: ["Read", "Bash(pnpm *)"]
model: "claude-haiku-4-5"
effort: "low"
---
```

- `description` 是唯一必须认真写的字段。它既显示在 `/help` 里，也是模型决定要不要主动调用这个技能的依据。写「检查」两个字，等于让它猜；写「发版前检查测试、lint、迁移状态并汇总变更」，它才知道什么时候该用。
- `argument-hint` 只影响输入时的提示文案，不参与逻辑。
- `disable-model-invocation` 置 true 表示只能由你手打 `/名字` 触发，模型不会自作主张调用。
- `allowed-tools` 限定这个技能能用哪些工具。
- `model` 和 `effort` 让单个技能跑在指定档位上，简单的固定流程用便宜的档，不必占用主会话的模型设置。

### 实例：`/release-check`

新建 `signup-app/.claude/skills/release-check/SKILL.md`：

```markdown
---
description: "发版前体检：跑测试、看改动范围、核对 schema 与迁移是否一致，输出可粘进 PR 的变更说明"
allowed-tools: ["Read", "Grep", "Bash(pnpm test)", "Bash(pnpm lint)", "Bash(git diff *)"]
effort: "medium"
---

# 发版前检查

测试结果：
!pnpm test

代码检查：
!pnpm lint

本次改动范围：
!git diff --stat main...HEAD

当前数据库模型：
@prisma/schema.prisma

请基于以上信息完成三件事：

1. 判断是否可以发版。测试或 lint 有失败，直接给出结论「不可发版」并列出失败项。
2. 核对 schema 中新增或修改的字段，是否都有对应的迁移文件；报名相关表的唯一约束是否仍然存在。
3. 输出一段变更说明，按「新增 / 修复 / 数据库变更 / 需要人工确认」四类分组，可直接粘进 PR 描述。
```

正文里 `!` 开头的行会真的去执行那条 bash 命令，把输出带进上下文；`@` 开头的路径会把文件内容读进来。所以敲下 `/release-check` 的瞬间，测试跑完了、diff 拿到了、schema 读进来了，它拿到的是当下的真实状态，不是你嘴上描述的状态。

`allowed-tools` 这一行是这个例子的重点。它只给了读和三条固定命令，没给 `Edit` 和 `Write`。这意味着它只能报告问题，不能顺手替你改。体检就该是体检，发现问题由你决定改不改——把权限收在这里，比事后一条条批准省心得多。

### 参数占位

技能可以带参数。`$ARGUMENTS` 是整串参数，`$1` `$2` 是位置参数，`$0` 是技能名本身。

`signup-app/.claude/skills/fix-issue/SKILL.md`：

```markdown
---
description: "按 issue 编号定位相关代码并给出修复方案"
argument-hint: "<issue 编号> [模块名]"
allowed-tools: ["Read", "Grep", "Bash(gh issue view *)"]
---

Issue 详情：
!gh issue view $1

在 $2 模块范围内定位相关实现，先给出问题定位与修复方案，方案确认前不要改代码。
```

调用时敲 `/fix-issue 142 signup`，`$1` 拿到 `142`，`$2` 拿到 `signup`。

### 什么时候关掉自动调用

默认情况下模型会读所有技能的 `description`，自己判断该不该用。大多数时候这是好事，但有两类技能应该加上 `disable-model-invocation: true`：

一类是有副作用的。比如一个 `/reset-dev-db` 技能会清空并重建本地开发库，这种东西必须由人按下按钮，绝不能让它在某次「顺手帮你清理一下环境」的自作主张里被触发——`signup-app` 已经因为 `prisma migrate reset` 丢过一次本地数据了。

另一类是纯快捷键性质的。比如一个把当前分支改动整理成周报的技能，它只在你想写周报的时候有用，放开自动调用只会让模型在无关的对话里误判。

### 延迟加载：这才是它和 CLAUDE.md 的本质区别

技能的正文只在被用到的时候才进上下文。平时进上下文的只有名字和那一行 `description`，正文躺在磁盘上不花一分钱。

这一条决定了内容该往哪放。CLAUDE.md 是**每次会话都要付的固定成本**——你写进去的每个字，今天开二十个会话就要付二十遍，哪怕这二十次里只有一次真的用得上。技能是**用到才付**——装三十个也不心疼，用到哪个才加载哪个。

所以判断标准很清楚：改任何一行代码都必须遵守的东西（用 pnpm、不许 any、迁移走 prisma），写 CLAUDE.md；只在特定动作时才需要的一大段流程（发版检查、issue 排查、性能分析），写成技能。把发版流程那两百字塞进 CLAUDE.md，等于让每一次跟发版无关的对话都替它买单。

## 9. 分身与并行

`signup-app` 迭代一年之后，`src/` 下面几百个文件。你想问一个问题：报名逻辑到底散在哪几处？

它开始翻。读 `src/app/api/signup/route.ts`，跟进 `src/lib/signup.ts`，发现表单组件里也有一段校验，又去看 `src/app/signup/page.tsx`，顺藤摸到 `src/lib/validators/`，中间还 grep 了几轮。二十来个文件之后答案有了：报名逻辑散在四处，其中两处的校验规则不一致。

答案是对的。代价是这二十个文件的完整内容此刻全躺在你的主会话上下文里。接下来你想让它动手把这四处统一掉，空间已经不剩多少了，`/context` 一看占用过半，再改两轮就该触发自动压缩了。真正的正事还没开始，预算先被探索过程吃光了。

subagent 解决的就是这件事，它的核心价值只有一句话：**独立上下文**。

<svg viewBox="0 0 760 400" width="100%" height="auto" role="img" aria-label="主会话派出两个 subagent，探索过程留在各自独立的上下文里，只有摘要汇回主会话">
  <rect x="0" y="0" width="760" height="400" fill="#0d0d12"/>

  <text x="380" y="30" fill="#8a8a94" font-size="13" text-anchor="middle">派出去的探索过程留在分支内，不占主会话</text>

  <rect x="262" y="60" width="236" height="92" fill="none" stroke="#3a3a44" stroke-width="1"/>
  <text x="262" y="52" fill="#8c5eff" font-size="13">subagent A：全库找报名逻辑</text>
  <circle cx="282" cy="86" r="3.5" fill="#8a8a94"/>
  <text x="296" y="91" fill="#e5e5ea" font-size="13">读 20 个文件</text>
  <circle cx="282" cy="110" r="3.5" fill="#8a8a94"/>
  <text x="296" y="115" fill="#e5e5ea" font-size="13">grep 出 12 处匹配</text>
  <circle cx="282" cy="134" r="3.5" fill="#16b364"/>
  <text x="296" y="139" fill="#e5e5ea" font-size="13">收敛成 6 行结论</text>

  <rect x="262" y="190" width="236" height="92" fill="none" stroke="#3a3a44" stroke-width="1"/>
  <text x="262" y="182" fill="#8c5eff" font-size="13">subagent B：审查迁移安全性</text>
  <circle cx="282" cy="216" r="3.5" fill="#8a8a94"/>
  <text x="296" y="221" fill="#e5e5ea" font-size="13">读 schema 与迁移目录</text>
  <circle cx="282" cy="240" r="3.5" fill="#8a8a94"/>
  <text x="296" y="245" fill="#e5e5ea" font-size="13">跑 pnpm prisma validate</text>
  <circle cx="282" cy="264" r="3.5" fill="#16b364"/>
  <text x="296" y="269" fill="#e5e5ea" font-size="13">收敛成 3 条风险</text>

  <line x1="60" y1="340" x2="694" y2="340" stroke="#0099ff" stroke-width="4"/>
  <polygon points="702,340 690,334 690,346" fill="#0099ff"/>
  <text x="60" y="374" fill="#e5e5ea" font-size="14">主会话上下文：始终留给真正要干的事</text>

  <circle cx="200" cy="340" r="5" fill="#0099ff"/>
  <polyline points="200,340 200,105 254,105" fill="none" stroke="#8a8a94" stroke-width="1.5"/>
  <polygon points="262,105 252,100 252,110" fill="#8a8a94"/>

  <circle cx="232" cy="340" r="5" fill="#0099ff"/>
  <polyline points="232,340 232,235 254,235" fill="none" stroke="#8a8a94" stroke-width="1.5"/>
  <polygon points="262,235 252,230 252,240" fill="#8a8a94"/>

  <polyline points="498,105 570,105 570,326" fill="none" stroke="#16b364" stroke-width="1" stroke-dasharray="5 5"/>
  <polygon points="570,336 565,324 575,324" fill="#16b364"/>

  <polyline points="498,235 622,235 622,326" fill="none" stroke="#16b364" stroke-width="1" stroke-dasharray="5 5"/>
  <polygon points="622,336 617,324 627,324" fill="#16b364"/>

  <text x="590" y="180" fill="#16b364" font-size="13">只回传摘要</text>
</svg>

subagent 有自己的 context window 和自己的系统提示。它翻那二十个文件的过程发生在它自己的上下文里，结束时只把结论摘要交回主会话。你主会话里增加的只有那六行结论，二十个文件的正文一个字都没进来。

### 定义一个 subagent

定义文件放 `.claude/agents/<名字>.md`（项目级）或 `~/.claude/agents/<名字>.md`（用户级），插件也可以携带。

`signup-app/.claude/agents/schema-reviewer.md`：

```markdown
---
name: "schema-reviewer"
description: "审查 Prisma schema 变更与迁移安全性，判断是否会锁表、是否破坏存量数据"
model: "claude-sonnet-5"
tools: ["Read", "Grep", "Bash(pnpm prisma *)"]
memory: true
---

你负责审查 signup-app 的数据库变更。

审查要点：

1. 新增字段是否为非空且无默认值，会不会导致存量数据违反约束。
2. 是否存在删除字段、收紧约束、修改字段语义等破坏性变更，旧版本代码还能否运行。
3. 报名相关表的唯一约束是否仍然存在，删掉会直接导致并发下重复报名。
4. 迁移是否可能长时间锁表。

输出格式：先给「可以合并 / 不可合并」的结论，再列出问题清单，每条注明文件与行号。
只做审查，不要修改任何文件。
```

`tools` 字段是这里的关键。只给了 `Read`、`Grep` 和 `pnpm prisma` 开头的命令，它就只能看和验证，改不了东西。审查者不该有修改权，这跟人类团队里评审人不直接往别人分支上推代码是一个道理。

有一点要留意：**subagent 的权限继承父会话**，在 frontmatter 里写权限模式是无效的，会被忽略（2.1.212 起，Task 工具的 `mode` 参数同样被忽略）。也就是说，主会话现在是 `plan` 模式，派出去的 subagent 也落不了手；主会话开着 `bypassPermissions`，subagent 同样什么都能干。别指望靠 agent 定义文件收紧权限，那是 settings 和 hooks 的活。`tools` 是可以收的，权限模式不行。

`/agents` 打开管理视图，能看到当前可用的 agent、查看定义、新建和编辑。

还有一条自 2.1.212 起的变化：**subagent 默认不再生成嵌套 subagent**。派出去的 A 不会再自己派一个 B 出去，避免层层套娃把成本和时间放大到不可控。确实需要更深层次，设环境变量 `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=2`。

### `/fork` 的语义变了

这条必须单独拎出来说，因为网上大量教程还在按旧语义教。

**自 2.1.212 起，`/fork` 是把当前会话复制成一个后台会话**，而不是在会话内派个分身。会话内的委托改用 `/subtask`。

差别在哪：`/fork` 之后你得到的是两个平行的会话，各自往下跑，互不影响——适合「同一个上下文，想试两条不同的方案」。`/subtask` 是在当前会话里派一个带独立上下文的子任务，做完把摘要交回来——适合上面说的那种探索场景。照着老教程敲 `/fork` 想要子任务，拿到的会是一个后台会话，然后疑惑结果为什么没回到当前对话里。

### 后台与并行

跑得久的任务不必占着终端。几种做法：

```bash
claude --bg "把 src/lib 下所有函数补上 JSDoc 注释"
```

直接作为后台 agent 启动，命令立刻返回。会话内已经跑起来的任务，`Ctrl+B` 可以转到后台，你接着聊别的。所有后台任务用 `claude agents` 管理，`Ctrl+X Ctrl+K` 一键全停。

真正的并行开发靠 git worktree：

```bash
claude -w refactor-signup
```

这一条命令为本次会话新开一个 git worktree——同一个仓库、不同的工作目录、不同的分支，文件互不干扰。场景很具体：你让它在 `refactor-signup` 这间工作台里重构报名接口，那边会改一堆文件、跑测试、来回折腾；与此同时你自己在主工作区改报名页的样式，两边谁也碰不到谁的文件，谁也不会因为对方 `git checkout` 而突然编译失败。等它那边跑完，切过去看 diff，满意就合，不满意整个 worktree 删掉，主工作区一点痕迹都没有。

### 什么时候真该派出去

subagent 不是越多越好。它有实打实的成本：要重新建立上下文、重新探索一遍它本来不知道的项目背景，最后你还得再读一遍它的报告。这些成本是固定支出，任务越小，占比越离谱。

值得派的：

- **广度搜索**。「报名逻辑散在哪几处」「哪些地方直接拼了 SQL 没走 Prisma」「全库还有多少处用了 any」——这类问题的特征是过程产生大量中间内容、结论却只有几行，正是独立上下文最划算的场景。
- **彼此独立的大块任务**。一个补 `src/lib/` 的测试，一个审 `prisma/` 的迁移，两者不共享文件、不互相依赖，并行跑省下的是整段等待时间。
- **需要限权的专职工作**。像上面那个 `schema-reviewer`，用 `tools` 把它锁成只读，比在主会话里一边审查一边提心吊胆它顺手改点什么强。

不值得派的：

- **三五个文件读一读**。你已经知道要看哪几个文件，直接 `@` 引进来更快，派出去反而要等它自己找一遍。
- **简单验证**。跑个 `pnpm test` 看结果，主会话两秒的事。
- **需要频繁来回确认的任务**。subagent 是一去一回的，中间没法插话。方案还没定、需求还在变的活，留在主会话里边聊边改。

一句话的判断标准：**过程很长、结论很短、中途不需要你插话的任务，派出去；反过来的，自己干**。

派出去的分身也好，主会话也好，到目前为止约束它们的手段还是同一套：CLAUDE.md 引导它怎么干，权限规则拦住它不该干的。但权限规则只能按工具名和参数模式匹配，管不了更复杂的判断——比如「改完 `.ts` 文件就自动跑一遍 lint 修复」，或者「凡是命令里出现 `prisma migrate reset`，不管以什么形式包装，一律当场拦下并说明理由」。这就要靠下一层闸门：hooks。

## 10. hooks：绕不过去的硬闸门

`signup-app` 的 CLAUDE.md 里已经白纸黑字写了一句：「`scripts/deploy.sh` 会直接推生产，任何情况下都不许执行。」写得再明白不过。第二天下午让它顺手把报名接口的改动收个尾，回头一看，终端里赫然躺着一行 `bash scripts/deploy.sh` 的执行记录，生产环境已经滚了一遍新代码。

这事不能怪它「不听话」，因为那句话从头到尾就没有强制力。CLAUDE.md 会被拼进提示词，和你输入的问题、和它读到的代码待遇一样——都是参考信息。模型综合一堆信息之后做判断，大多数时候会遵守，偶尔就是不遵守。第 7 节讲过这是软约束，这里给出它的另一半：想让一件事真的发生不了，只能在执行层拦。

<svg viewBox="0 0 760 360" width="100%" height="auto" role="img" aria-label="CLAUDE.md 属于提示词层可以被绕过，权限规则与 hooks 属于执行层能真正拦住，模型发起的工具调用要依次穿过这两层">
  <rect x="0" y="0" width="760" height="360" fill="#0d0d12"/>
  <text x="265" y="48" fill="#8a8a94" font-size="14" text-anchor="middle">提示词层 · CLAUDE.md</text>
  <text x="515" y="48" fill="#0099ff" font-size="14" text-anchor="middle">执行层 · 权限规则 + hooks</text>
  <rect x="210" y="62" width="110" height="224" fill="none" stroke="#8a8a94" stroke-width="1.5" stroke-dasharray="6 5"/>
  <rect x="460" y="62" width="110" height="224" fill="none" stroke="#0099ff" stroke-width="1.5"/>
  <text x="265" y="175" fill="#eaaa08" font-size="13" text-anchor="middle">只是提示词</text>
  <text x="515" y="175" fill="#16b364" font-size="13" text-anchor="middle">真正的闸门</text>
  <circle cx="50" cy="170" r="11" fill="#0d0d12" stroke="#8c5eff" stroke-width="2.5"/>
  <text x="50" y="204" fill="#e5e5ea" font-size="14" text-anchor="middle">模型</text>
  <polyline points="61,170 95,170 95,110 130,110" fill="none" stroke="#8a8a94" stroke-width="1.5"/>
  <polyline points="61,170 95,170 95,230 130,230" fill="none" stroke="#8a8a94" stroke-width="1.5"/>
  <text x="150" y="100" fill="#e5e5ea" font-size="12" text-anchor="middle">普通编辑</text>
  <text x="150" y="220" fill="#e5e5ea" font-size="12" text-anchor="middle">上线脚本</text>
  <line x1="130" y1="110" x2="652" y2="110" stroke="#8a8a94" stroke-width="1.5"/>
  <polygon points="660,110 650,105 650,115" fill="#8a8a94"/>
  <text x="706" y="115" fill="#16b364" font-size="14" text-anchor="middle">落到磁盘</text>
  <line x1="130" y1="230" x2="486" y2="230" stroke="#8a8a94" stroke-width="1.5"/>
  <line x1="492" y1="222" x2="508" y2="238" stroke="#d42672" stroke-width="2.5"/>
  <line x1="508" y1="222" x2="492" y2="238" stroke="#d42672" stroke-width="2.5"/>
  <text x="515" y="262" fill="#d42672" font-size="12" text-anchor="middle">退出码 2</text>
  <line x1="516" y1="230" x2="650" y2="230" stroke="#2a2a32" stroke-width="1.5" stroke-dasharray="5 5"/>
  <text x="706" y="235" fill="#5a5a64" font-size="14" text-anchor="middle">没发生</text>
  <polyline points="500,244 500,316 145,316" fill="none" stroke="#d42672" stroke-width="1.5" stroke-dasharray="5 5"/>
  <polygon points="137,316 147,311 147,321" fill="#d42672"/>
  <text x="330" y="338" fill="#d42672" font-size="13" text-anchor="middle">stderr 作为阻断理由回给模型</text>
</svg>

hooks 就是执行层这道闸门里最灵活的一块。它的机制朴素得不能再朴素：在固定时机，Claude Code 自动执行你指定的脚本，把当前上下文以 JSON 从标准输入喂给脚本，然后看脚本的退出码决定是放行还是掐断。脚本是你写的，判断逻辑是你定的，模型没有任何发言权。

### 六个用得最多的时机

| 事件 | 触发时机 | 能否阻断 |
|---|---|---|
| `SessionStart` | 会话开始或恢复时 | 否 |
| `UserPromptSubmit` | 你按下回车提交提示时 | 能 |
| `PreToolUse` | 工具调用之前 | 能 |
| `PostToolUse` | 工具成功执行之后 | 能 |
| `Stop` | 一次回复结束时 | 能 |
| `SessionEnd` | 会话结束时 | 否 |

除这六个之外还有二十多个事件，覆盖上下文压缩（`PreCompact` / `PostCompact`）、子任务起停（`SubagentStart` / `SubagentStop`）、权限请求（`PermissionRequest`）、文件变化（`FileChanged`）、通知等时机。日常八成的需求靠上面这六个就够，其余等真遇到场景再去查。

配置写在项目的 `.claude/settings.json` 或用户级 `~/.claude/settings.json` 的 `hooks` 字段里，插件带的 hook 放在插件的 `hooks/hooks.json`。每条 hook 有一个 `matcher` 决定它管哪些事，语法只有三种情况：写 `"*"` 或者干脆省略，匹配全部；只含字母、数字、下划线、连字符、空格、逗号、竖线时按精确名或列表匹配，比如 `Bash`、`Edit|Write`；一旦含有其他字符就按 JavaScript 正则处理，比如 `^Notebook`、`mcp__.*`。

要注意 matcher 匹配的对象随事件变。工具类事件匹配的是工具名；`SessionStart` 匹配的是会话来源，取值是 `startup` / `resume` / `clear` / `compact`；`SessionEnd` 匹配结束原因；`SubagentStart` / `SubagentStop` 匹配 agent 类型。所以在 `SessionStart` 上写 `"matcher": "Bash"` 是永远不会命中的。

### 退出码：整节最该记住的三行

脚本靠退出码说话，一共只有三种语义。

| 退出码 | 含义 |
|---|---|
| `0` | 成功。stdout 里的 JSON 会被解析，输出可以加进上下文 |
| `2` | 阻断。stdout 被忽略，**stderr 的内容作为阻断理由回给模型** |
| 其他 | 非阻断错误，stderr 进调试日志，流程继续 |

真正值钱的是退出码 2 那一行的后半句。绝大多数人第一反应是「拦住就完了」，但拦住只解决一半问题：模型不知道自己撞了什么墙，接下来大概率换个写法再撞一次——`bash scripts/deploy.sh` 被拦，它就试 `sh ./scripts/deploy.sh`，再拦，它就试 `cd scripts && ./deploy.sh`。你在旁边看着它撞三轮，钱和时间一起烧掉。

stderr 会原样回到模型面前，这个设计把闸门从「哑巴」变成了「会说话的门卫」。你不只是拦住它，还能同时告诉它为什么被拦、正确的路子是什么。写阻断理由的时候把这一点用足：不要写「forbidden」，要写「上线由人工执行，你现在应该做的是把改动提交到分支并说明验证方式」。它读到这句，下一步就直奔正确方向了。

### 给 signup-app 装两道闸

第一道拦死上线脚本和那条清库命令。`prisma migrate reset` 就是当初把本地开发库清空的元凶，这类命令一旦执行就没有后悔药，正是 hook 存在的意义。

`.claude/settings.json`：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/block-danger.sh" }
        ]
      }
    ]
  }
}
```

`.claude/hooks/block-danger.sh`：

```bash
#!/usr/bin/env bash
payload=$(cat)

if printf '%s' "$payload" | grep -qE 'scripts/deploy\.sh'; then
  echo "上线脚本只能由人工执行。把改动提交到分支，并在回复里写清需要验证哪些接口。" >&2
  exit 2
fi

if printf '%s' "$payload" | grep -qE 'migrate[[:space:]]+reset'; then
  echo "禁止重置数据库。schema 变更走 pnpm prisma migrate dev 生成迁移文件，不要清库重来。" >&2
  exit 2
fi

exit 0
```

<!-- TODO 核实: PreToolUse 传给 hook 的 JSON 中，Bash 命令文本挂在哪个具体字段名下（示例脚本目前对整个 payload 做文本匹配，可换成精确取字段） -->

装好之后开一个新会话，让它「顺便把这版发上去」，终端里会直接出现阻断，而不是执行记录：

```text
PreToolUse hook 阻断了 Bash 调用
上线脚本只能由人工执行。把改动提交到分支，并在回复里写清需要验证哪些接口。
```

<!-- 截图: 会话中 hook 阻断 bash scripts/deploy.sh 时的终端提示 -->

第二道是收尾用的。`signup-app` 里 lint 规则不少，AI 改完 `.ts` 文件经常留下一堆格式问题，人再手动跑一遍很烦。挂个 `PostToolUse`，改完就自动修：

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/lint-fix.sh" }
        ]
      }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
payload=$(cat)
printf '%s' "$payload" | grep -q '\.ts' || exit 0
pnpm lint --fix >/dev/null 2>&1
exit 0
```

注意最后是 `exit 0`。lint 修不干净不该打断工作流，让它继续跑，问题留给后面的 `/code-review`。想反过来——lint 报错就把这一步掐掉、逼模型自己改干净——那就把失败分支改成 `exit 2` 并把报错内容送进 stderr。这两种选择没有对错，取决于你希望这个项目多严格。

### 比退出码更细的控制

退出码只有三档，不够用的时候可以走结构化输出：脚本以退出码 0 结束，但在 stdout 里打一段 JSON。返回 `{"continue": false, "stopReason": "..."}` 可以让 Claude Code 整个停下来并给出理由；`PreToolUse` 还能返回 `permissionDecision`，取值是 `allow` / `deny` / `ask` / `defer`——等于用脚本直接接管了那一次权限判断。第 4 节配的静态权限规则管的是「这类命令允不允许」，`PreToolUse` 返回 `ask` 管的是「这一次具体要不要问」，两者叠加才是完整的门禁。

hook 也不止能跑脚本。类型一共五种：`command` 跑本地脚本，`http` 打到一个本地服务，`mcp_tool` 调 MCP 工具，剩下两种最有意思——`prompt` 用一句提示让模型来判断，`agent` 直接派一个 agent 去判断。也就是说「该不该放行」这件事本身可以交给模型做，适合那些没法用正则写死的规则，比如「这次提交的信息是否说清了改动范围」。代价是每次触发都要一次模型调用，别挂在高频事件上。

最后两个要记住的点。自 2.1.214 起，hook 的 `if:` 条件里单段 `dir/**` 只匹配 `<cwd>/dir` 这一层，和第 4 节讲的权限规则变化同源，老配置升级后要检查一遍。以及应急开关：settings 里写 `"disableAllHooks": true` 可以一次关掉全部 hook；如果连是不是 hook 的问题都拿不准，直接用 `claude --safe-mode` 启动，自定义配置全禁用，一轮就能定位是配置问题还是别的。

## 11. MCP：接上外部世界

配到这里，它对 `signup-app` 的了解已经相当到位了：代码读得到，规矩知道，越界会被拦。但有一类问题它还是答不上来——生产库里那张 `Registration` 表现在到底有多少条记录、昨晚 22 点那次报错的完整堆栈长什么样、上周新加的唯一约束到底有没有真的生效。这些东西不在仓库里，在数据库里、在监控里。缺的不是脑子，是手够不着。

MCP 就是给它接手的那套标准。把它理解成插座：以前每个外部系统都要一根专属线缆，数据库一种接法、监控一种接法、工单系统又一种；MCP 定了统一的插座规格，任何服务只要按这个规格暴露自己的能力，Claude Code 插上就能用，不用为每个系统单独写适配。

接一个 server 用 `claude mcp add`，三种传输形式的写法有区别。远程服务用 `--transport` 指定：

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
claude mcp add --transport http corridor https://app.corridor.dev/api/mcp --header "Authorization: Bearer ..."
```

本地进程（stdio）则是把要启动的命令写在后面，子进程自己的参数用 `--` 隔开，环境变量用 `-e` 传：

```bash
claude mcp add my-server -e API_KEY=xxx -- npx my-mcp-server
claude mcp add my-server -- my-command --some-flag arg1
```

那个 `--` 不是可有可无的装饰。没有它，`--some-flag` 会被 `claude mcp add` 自己当成参数吃掉，报一个看起来毫不相干的错。其余子命令有 `add-json`、`add-from-claude-desktop`（仅 Mac 和 WSL）、`get`、`list`、`remove`、`login`、`logout`。

作用域上有两个选择。写进项目根的 `.mcp.json` 并提交 git，团队里每个人克隆下来都自动有这套外部连接，`signup-app` 的数据库 server 就该放这儿；只有你自己用的（比如你个人的笔记服务）走用户级，写入 `~/.claude.json`，别去污染队友的环境。

`.mcp.json` 长这样：

```json
{
  "mcpServers": {
    "postgres": {
      "command": "npx",
      "args": ["-y", "@some/postgres-mcp"],
      "env": { "DATABASE_URL": "..." }
    }
  }
}
```

克隆下来第一次启动，`claude mcp list` 里这台 server 会显示为「⏸ Pending approval」，不会连接。这不是故障，是刻意的安全设计：`.mcp.json` 是仓库里的一个普通文件，谁提一个 PR 都能往里塞一台 server，而 server 一旦连上就等于给这个仓库开了一条通往外部的通道。所以批准这个动作必须由本机的人来做，不能由仓库内容自动决定。批准之后才会连接并做健康检查。同理，需要 OAuth 的服务用 `claude mcp login <名>` 走浏览器授权，在没有图形界面的 SSH 环境里加 `--no-browser`。会话内 `/mcp` 随时查看和管理连接状态。

真正让 MCP 和前面几节接上的，是工具命名规则：`mcp__<server>__<tool>`，比如 `mcp__postgres__query`。插件内嵌的 server 命名为 `mcp__plugin_<插件>_<server>__<tool>`。这个名字可以原样写进权限规则——外部工具走的是同一套权限系统，一点也不特殊。

于是 `signup-app` 就有了一个很实用的配法：接上能查生产库的 server，让它能自己去核对报名数据，但把写操作全部封死。接好之后先用 `/mcp` 看这台 server 到底暴露了哪几个工具，把带写语义的逐个写进 `deny`：

```json
{
  "permissions": {
    "allow": ["mcp__postgres__query", "mcp__postgres__list_tables"],
    "deny": ["mcp__postgres__execute"]
  }
}
```

<!-- TODO 核实: 所选 postgres MCP server 实际暴露的工具名清单，替换示例中的 query / list_tables / execute -->

这就是第 4 节那套「内奸心法」延伸到外部世界的样子：手给它，但只给能看的那只。生产库的读权限能让它自己验证「唯一约束加上之后重复报名是不是真的没了」，而写权限一旦到手，一次幻觉就可能变成一次不可逆的线上事故。

## 12. Skills 与插件：把配置打包带走

第 8 节里写的那些自定义命令，其实就是 skills 的简单形态。完整形态是一个目录：`.claude/skills/<名>/SKILL.md`，除了 `SKILL.md` 本身，同目录下还可以放脚本、模板、参考文档，正文里用 `@路径` 引进来。旧式的单文件 `.claude/commands/<名>.md` 仍然可用，新写的建议直接用目录形态，后面要加东西不用搬家。

再往上一层是插件。一个插件可以把 skills、agents、hooks、MCP server、LSP server、可执行文件、settings 全部打包在一起，结构是 `.claude-plugin/plugin.json` 加上 `skills/`、`agents/`、`hooks/hooks.json`、`.mcp.json` 这些目录。管理走 `claude plugin` 系列：`install` 装、`list` 看、`enable` / `disable` 开关、`details` 查看组件清单和预计的 token 开销、`init` 生成脚手架、`marketplace` 管理来源。自己开发的时候不用先安装，`claude --plugin-dir ./my-plugin` 直接加载本地目录调试，改完重启会话就生效。插件里的技能调用要带命名空间前缀，写成 `/插件名:技能名`，避免和你项目里同名的技能撞车。

什么时候值得把配置做成插件，给一个务实的判断：手上有多个仓库要用同一套规矩的时候，或者要在团队里分发的时候。比如 `signup-app` 之后你又起了两三个 Next.js + Prisma 的项目，那套「必须用 pnpm」「迁移只走 prisma migrate」的 CLAUDE.md 片段、拦上线脚本的 hook、lint 收尾的 hook，每个仓库复制一遍就开始各自漂移，改一处要同步三处——这时候打包成插件装一次，才是划算的。

反过来，只有一个项目就别折腾。`.claude/` 目录直接提交进 git，队友克隆下来就全有了，效果一模一样，还省掉插件的版本管理和分发。把简单事做复杂是这类工具最常见的浪费。

## 13. 非交互与自动化：让它在没人盯着的地方干活

`signup-app` 现在是多人在提 PR 了。想给每个 PR 自动过一遍代码审查——重点盯并发和数据一致性，就是当初报名接口重复提交那类问题——但总不能让人守在终端前一路点批准。

`claude -p` 就是为这种场景准备的：不进交互界面，跑完打印结果直接退出。配 `--output-format json` 得到结构化结果方便后续解析，`--output-format stream-json` 则是流式，适合边跑边往日志里推。输入可以走管道：

```bash
cat logs.txt | claude -p "分析这段日志，指出报名接口报错的根因"
```

非交互下权限是第一个坎。终端里没人可问，就得提前把话说死：`--allowedTools` 预批准一批工具，`--permission-mode dontAsk` 让所有没预批准的直接拒绝而不是卡住等待。审查场景只需要读，那就只放 `Read`，连编辑都不给。想让它在 CI 里真的动手改代码再提交，才用 `acceptEdits`。

第二个坎是花销。自动化最怕的是无人值守时它自己绕进死循环，跑掉一笔看不见的账。`--max-turns` 限轮数，`--max-budget-usd` 限花费，两条一起加上，最坏情况有个上限。

第三个坎最隐蔽，也最值得讲清楚：一致性。同一条命令，在你机器上跑出的结果和在 CI 上跑出的结果不一样，八成就是配置层级在作怪。第 5 节讲过设置从管理策略、CLI 参数、本地、项目、用户五层级联下来，你机器上的 `~/.claude/settings.json` 里可能配了不同的模型、开了 `alwaysThinkingEnabled`、装了七八个插件和 hook——这些 CI 机器上一个都没有。所以 CI 里要么加 `--bare` 跳过 hooks、LSP、插件同步、自动记忆和 CLAUDE.md 自动发现，跑一个干净环境；要么用 `--settings` 显式指定一份配置文件，让两边加载的东西完全一致。不加这一条，你会花很长时间去调一个根本不在代码里的差异。

拼起来就是 `signup-app` 的 PR 审查步骤：

```bash
git diff origin/main...HEAD > pr.diff

cat pr.diff | claude -p "审查这份 diff。重点检查并发下的数据一致性、错误处理、权限校验位置。存在会导致线上事故的问题时，在最后单独一行输出 BLOCKING: yes，否则输出 BLOCKING: no。" \
  --output-format json \
  --permission-mode dontAsk \
  --allowedTools "Read" \
  --max-turns 15 \
  --max-budget-usd 2 \
  --bare > review.json

jq -r '.result' review.json | grep -q 'BLOCKING: yes' && exit 1
exit 0
```

`--output-format json` 返回的是一个对象，模型那段回复正文挂在顶层的 `result` 字段上，旁边还有 `is_error`、`num_turns`、`total_cost_usd`、`session_id`、`permission_denials` 这些字段。所以上面用 `jq -r '.result'` 先把正文取出来再匹配，比对整个 JSON 做 grep 可靠——否则提示词本身出现在 JSON 里的某个字段中，也会被误判成命中。顺带一提，`total_cost_usd` 拿来在流水线日志里打一行花销，比事后去账单页对账省事。
发现阻断级问题就以非零退出码结束，流水线挂掉，PR 合不进去。跑起来之后会发现一件事：它挑出来的问题里有相当一部分是「值得看一眼但不至于拦」的，所以 `BLOCKING` 这个判定要在提示里写足够具体的标准，否则要么天天误拦、要么形同虚设。

还有两个配套的东西。`claude --bg` 把任务作为后台 agent 启动，命令立刻返回，用 `claude agents` 查看和管理——本地跑长任务时比开一个终端干等着舒服得多。CI 或服务器上没法交互登录，用 `claude setup-token` 生成一个长期 token 配进环境变量即可。

## 总结

从「装上能用」到「把它配成一个受约束、可交付的工作伙伴」，中间隔着的其实就四层东西。

**告诉它规矩**——CLAUDE.md 和记忆系统，让它知道这个项目用 pnpm 不用 npm、迁移必须走 prisma migrate。这层解决的是「它不知道」。

**限定它能碰什么**——settings.json 里的 `allow` / `deny` / `ask` 和权限模式，`.env` 读不到、`deploy.sh` 跑不了。这层解决的是「它不该碰」。

**在执行层拦住它**——hooks，规矩被绕过时真正掐断那次调用，并把理由送回它面前。这层解决的是「它偏要」。

**给它够得着的手**——MCP，让它能查真实的数据、看真实的堆栈，判断建立在事实而不是猜测上。这层解决的是「它看不见」。

四层缺哪一层，缺口都会转嫁到同一个地方：你的眼睛。少了规矩，你得每次重新交代；少了权限边界，你得盯着每一条命令；少了 hooks，你得祈祷它今天心情好；少了 MCP，你得把数据一段段贴给它。所谓「AI 编程效率高」，很多人体验不到，就是因为省下来的时间全花在盯屏幕上了。

回到第一节那个结论：AI 不担责，所以担责的是你。生产库被清空，锅是你的；密钥泄漏进日志，锅也是你的。这套配置的全部意义，就是让「你担得起这个责」变得可能——不是靠信任它变得更聪明、更听话，而是靠边界让它压根没有机会犯致命错误。内奸的价值榨得干干净净，同时永远拿不到那把能捅你的刀。

配置这件事到这里就完整了。接下来要练的，是拿着这套已经被驯服的工具，去啃真正复杂的活。
