# 别把 Claude Code 当聊天框用

装完之后的头几天，大多数人是这么用的：终端里敲 `claude`，光标闪起来，然后像用网页版一样问一句「帮忙写一个报名接口的校验函数」，它吐出一段代码，复制，切回编辑器，粘贴，再手动改两行让它能跑。第二天嫌来回切窗口麻烦，干脆又回到浏览器；一周之后，工作流原封不动地退回老样子——AI 变成一个更聪明的搜索框，仓库还是你一个人在搬。

这么用不能算错，但它把一个能在你仓库里动手的东西，硬压成了一个只会说话的东西。同样一句话丢给同样的模型，有人拿回一段需要自己接线的代码，有人拿回一次改完、跑过、测试变绿的完整改动。差别不在模型强弱，在于你有没有把它当成一个 **agent** 来配置和约束——它能读你的整个仓库，能自己决定读哪些文件，能跑命令看结果，跑错了会自己再来一遍；而它能碰什么、不能碰什么，是你给它划的线。

下面所有例子都落在第一阶段那个社团报名系统 `signup-app`：Next.js + Prisma + PostgreSQL，`pnpm` 管包，部署在一台 VPS 上，线上有真人在报名。

## 1. 它到底是什么

编辑器里的代码补全插件，本质是「在你光标停的地方，猜下一段该写什么」。它的视野是当前文件加上少量相邻上下文，它的动作只有一个：往编辑器里塞字符。你要什么，得自己找到文件、把光标放对位置、把相关代码贴给它。

Claude Code 是另一类东西。它跑在终端里，以你启动它的那个目录当作工作区，然后自己去干活。三个特征把它和补全类工具彻底区分开。

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

## 2. 装上并跑通

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

<!-- 截图: 首次启动 claude 的引导与登录界面 -->
<!-- TODO 核实: 首次启动的引导步骤顺序（主题选择、登录方式选择等具体项） -->

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

<!-- 截图: claude doctor 的体检结果面板 -->

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

## 3. 一次会话的解剖

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

| 按键 | 作用 |
|---|---|
| `Ctrl+J` | 插入换行而不提交 |
| `Ctrl+C` | 中断当前动作 |
| `Ctrl+D` | 退出（800ms 内按两次确认） |
| `Ctrl+O` | 切换详细转录视图 |
| `Ctrl+R` | 搜索历史输入 |
| `Ctrl+T` | 切换待办清单显示 |
| `Ctrl+L` | 强制重绘屏幕，已输入内容保留 |
| `↑` / `↓` | 翻历史输入 |
| `Ctrl+G` 或 `Ctrl+X Ctrl+E` | 用外部编辑器编辑当前输入 |
| `Ctrl+B` 或 `Ctrl+X Ctrl+B` | 把当前任务转入后台 |
| `Shift+Tab` | 循环切换权限模式 |
| `Ctrl+V`（Windows / WSL 为 `Alt+V`） | 粘贴图片 |

表格看完没用，落到场景上才记得住。

`Ctrl+J` 用在写长需求的时候。给 `signup-app` 提一个稍微复杂的任务，你想分三行写清楚「要什么、不许动什么、怎么算做完」，直接按回车会在第一行就提交出去。每行末尾按 `Ctrl+J` 换行，全部写完再回车。

`Ctrl+C` 用在踩刹车的时候。你只想看一眼报名接口，它却顺着依赖一路读到整个 `src/lib/`——按下去立刻停，补一句「只看 `src/app/api/signup/` 下面的文件」。中断的成本远低于让它跑完再返工。

`Ctrl+O` 用在「它到底干了什么」不清楚的时候。默认界面是收敛的，只给结果概要；切到详细转录，每一次文件读取、每一条命令、每一段返回全都摊开。改完 Prisma schema 之后测试莫名其妙变绿了，怀疑它偷偷改了测试断言——按 `Ctrl+O` 翻回去看，一目了然。

`Ctrl+R` 用在重复劳动上。上周敲过一段很长的排查指令，这周同样的问题又冒头，搜个关键词把当时那条捞出来复用。

粘贴图片这条别小看。报名页在手机上样式炸了，与其描述「按钮跑到卡片外面去了」，不如直接截图 `Ctrl+V` 贴进去（Windows 和 WSL 用 `Alt+V`），补一句「iPhone 上的报名页，按钮溢出容器，找一下是哪条样式的问题」。它能看到图。

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
