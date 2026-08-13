# 1.3 自定义命令、hooks 与权限管理

上一节你给练习仓库写好了一份 `CLAUDE.md`，把项目的框架、测试命令、目录约定一次讲清楚了。但那份文件有个你多半已经隐约感觉到的软肋：它是**软约束**。CLAUDE.md 里的每一句话，本质都是"请你注意……"——AI 会尽量遵守，但它是"尽量"，不是"必须"。这一节要解决的，就是当"请注意"不够用的时候，怎么给 AI 装上真正硬的规矩。

## 光靠"请注意"为什么不保险

先看三个你迟早会撞上的场景。

第一个：重复操作老记不住。你每次让 AI 改完代码，都得追一句"提交前先跑一遍格式化""顺手把测试跑绿"。CLAUDE.md 里也白纸黑字写了这条规矩。可它十次里总有那么一两次，忙着改别的就把这步漏了。不是它存心不听，是这类"每次都要做的琐事"塞在一大段上下文里，被冲淡是常态。

第二个，也是更吓人的一个：AI 自作主张跑了条危险命令。你让它清理一下临时文件，它理解成了 `rm -rf` 一整个目录，等你反应过来，东西已经没了。agentic 工具能自己动手是它的价值，但"能自己动手"和"会动错手"是一体两面——只要它有权敲这条命令，光靠 CLAUDE.md 里写一句"不要用 rm -rf"是拦不住的，因为那句话它可能压根没往那儿想。

第三个：越是要紧的规矩，越不能只靠它自觉。"绝对不许读 `.env` 里的密钥""push 到远端之前必须先问一声"——这种一旦破例就可能出大事的红线，你需要的是一道**它绕不过去的闸门**，而不是一句它"应该会遵守"的提醒。

这三件事，对应的正是这一节的三大块硬办法：

- **自定义命令**——把每次都要做的那套重复流程，固化成一个 `/命令`，一喊就整套跑完，不靠它记。
- **hooks（钩子）**——在 AI 每次动手的关键节点上架一道自动关卡，该拦的当场拦下，不看它自觉。
- **权限管理**——用一份"谁能进、谁不能进"的门禁清单，从技术上划死它能碰什么、碰之前要不要先问你。

CLAUDE.md 管的是"它懂不懂你的规矩"，这三样管的是"它绕不绕得过你的规矩"。软硬各就各位，AI 才真正可控。

## 自定义命令：把重复流程存成一个"快捷键"

先从最轻、最好上手的一块讲起。

你想想手机上的快捷指令，或者输入法里的自定义短语：你把一长串固定的话存成一个短代号，下次要用，敲两个字就整段带出来了。自定义命令就是这个思路——把一段你**反复要对 AI 说的、结构固定的指令**，存成一个文件，之后在会话里敲一个 `/名字` 就能把整段调出来执行。它不给 AI 加什么新本事，纯粹是帮你省掉"每次都把那一大段要求重新打一遍"的力气，顺便保证每次要求都一字不差、不会今天漏这句明天忘那句。

在 Claude Code 里，一个自定义命令就是一个 Markdown 文件，放在两个地方之一：

- 放进项目的 `.claude/commands/` 目录——这个命令只在这个项目里有，会跟着项目进 git，团队每个人都能用。
- 放进你个人的 `~/.claude/commands/` 目录——这是你自己的私人命令，在你这台机器上、所有项目里都能用。

文件名就是命令名。你在 `.claude/commands/` 下建一个 `review.md`，会话里就多了一个 `/review` 命令可以敲。文件内容分两部分：顶上一小段用 `---` 包起来的 frontmatter（写这个命令的元信息），下面的正文就是这个命令真正要对 AI 说的话。

frontmatter 里常用的字段有这几个：`description`（一句话说清这个命令是干什么的，会显示在 `/` 菜单里）、`argument-hint`（提示这个命令后面该跟什么参数）、`allowed-tools`（限定这个命令只能用哪些工具）、`model`（指定这个命令用哪个模型跑）。下面的例子只用最基础的 `description`，其余字段等你用顺手了再按需加。（补一句：新版 Claude Code 已经把自定义命令并入了 skills（技能）体系——`.claude/skills/<名字>/SKILL.md` 和 `.claude/commands/<名字>.md` 都会生成同名的 `/命令`、行为等价；老的 `.claude/commands/*.md` 照样能用，本节就用它来讲。）

举个能直接抄走的例子。团队里"提交前审一遍代码"这件事，每次说的话其实八九不离十，那就把它固化成 `/review`。在练习仓库里建文件 `.claude/commands/review.md`，写进去：

```markdown
---
description: 审查改动，按严重程度列出问题
---
把当前的改动整体审一遍，重点看这几样：
- 有没有没考虑到的边界情况（空值、超长、并发）
- 有没有安全隐患（越权、注入、密钥硬编码）
- 命名和写法跟项目现有风格一不一致

按严重程度从高到低列出问题，每一条都指出文件和大致位置，并给一句修改建议。

这次重点看的范围：$ARGUMENTS
```

注意最后那个 `$ARGUMENTS`。它是一个占位符——你调用命令时跟在后面写的东西，会原样替换到这个位置。这样同一个命令就能带不同的参数复用。会话里敲：

```text
/review 登录接口那几个文件
```

"登录接口那几个文件"就顶替掉了 `$ARGUMENTS`，AI 收到的是一段完整、明确、每次结构都一样的审查指令，然后照着去读改动、列问题。你要是直接敲 `/review` 不带后面的话，`$ARGUMENTS` 就是空的，它会按默认范围审全部改动。

敲完你会看到什么？AI 不会再反问"你想重点看哪些方面"，而是直接照着命令里写死的那三条（边界情况、安全隐患、风格一致性）逐项过一遍，输出一份按严重程度排好序、每条带文件位置和修改建议的清单。关键就在"每次都一样"：无论是你、还是团队里别的人、还是你三个月后再用，敲出来的审查口径分毫不差，不会因为今天心情不同、话说得松紧不一，审出来的东西就飘。这就是把流程固化成命令的价值——它把"审查质量"从"你这次记不记得把要求说全"里解放了出来。

什么样的流程值得做成命令？判断很简单：**只要一段话你已经对 AI 说过第三遍、而且每次说的八九不离十，就该把它固化下来。** 提交前审查、生成符合团队规范的 commit message、按固定模板补一个接口的文档、把一个 bug 复现步骤整理成 issue——这些高频又结构固定的活，都是自定义命令的好料。放项目级（`.claude/commands/`）还是个人级（`~/.claude/commands/`），看它是团队共用的规矩还是你个人的习惯：团队要统一的口径进项目、跟着 git 走，纯你自己顺手的放个人目录、跨项目通用。

再补一个传参的写法。上面用的 `$ARGUMENTS` 是"把跟在命令后面的参数整段一把抓"；如果你想按顺序分别取用某几个参数，还能用 `$1`、`$2` 这样的**位置参数**——你调用时给的第一个词填进 `$1`、第二个填进 `$2`，以此类推。要在命令模板里把不同参数分别放到不同位置时，位置参数比 `$ARGUMENTS` 更精准。

**Codex 这边对照着看一眼。** Codex 也有几乎一样的东西：把自定义提示词放在 `~/.codex/prompts/` 目录下的 `.md` 文件里，在会话的 `/` 菜单里就能调出来，同样支持用 `$ARGUMENTS`（以及 `$1`、`$2` 这种按位置取的占位符）传参。用法你一看就懂，是同一套心智。但这里有个要紧的提醒：**Codex 官方已经把这套 `~/.codex/prompts/` 自定义命令标为不推荐（deprecated），转而推荐用 skills（技能）来做同样的事。** 所以在 Codex 里你现在新建自定义流程，别再一头扎进 prompts 目录，先去看官方主推的 skills 怎么写——方向已经换了。这也是"一主一副"里主力吃透、副手知道有这回事即可的一个具体例子。

## hooks：给每次动手架一道安检门

自定义命令省的是"你重复打字的力气"，但它管不住 AI 自己的行为——命令得你主动去敲，AI 该漏的还是会漏，该乱来还是能乱来。要在 AI **自己动手的那一刻**去卡它，靠的是 hooks。

打个最贴切的比方：hooks 就是机场安检门。你不用盯着每个旅客、也不用指望每个人自觉不带违禁品——你只要在"登机前"这个必经的节点架一道门，所有人都得从这儿过，该拦的当场拦下、该开包检查的当场检查。hooks 就是架在 AI 工作流关键节点上的这种自动关卡：**你事先定好"在什么时刻、对什么操作，自动跑一段你的检查逻辑"，之后 AI 每次走到那个节点，你的逻辑就自动触发一次，全程不用你在场。**

关键在于这些"时刻"是固定的、可挂载的。Claude Code 里，这几个高置信可用的挂载点（叫**事件**）你先记住：

- **PreToolUse**——AI 准备调用某个工具**之前**。这是最重要的一道门，因为操作还没真发生，你能在这儿把它拦下来。
- **PostToolUse**——某个工具调用**完成之后**。适合做"事后收尾"，比如它一改完文件就自动跑格式化。
- **UserPromptSubmit**——你提交一条消息、AI 开始处理**之前**。
- **Stop**——AI 结束一轮回复、准备停下**的时候**。
- **SessionStart**——一个会话刚启动**的时候**。

（Claude Code 的 hook 事件不止这五个，还有 `SessionEnd`、`PreCompact`、`SubagentStop` 等一批，日常先把上面这五个最常用的吃透，其余用到时再查官方文档。）

hooks 配在哪？不在 CLAUDE.md 里，而在 `settings.json` 里——这正好呼应上一节讲的分工：CLAUDE.md 是给 AI 看的行为指导（软），settings.json 是给工具执行的技术配置（硬），hooks 属于后者。它的大致结构是这样：在 `hooks` 下面，按事件名分组，每组里用 `matcher` 说明"这道门只管哪些工具"（按工具名或正则匹配，比如只管 `Bash`、或只管 `Edit` 和 `Write`），再挂上要跑的命令。

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "你的检查脚本" }
        ]
      }
    ]
  }
}
```

这段配置的层次记住这几层：`hooks` 下面按**事件名**分组（这里是 `PreToolUse`）；每个事件是一个数组，每一项用 `matcher` 指定这道门管哪些工具——`"Bash"` 只管终端命令，`"Edit|Write"` 用竖线一次管多个，写 `"*"` 或干脆省略就是管全部；`matcher` 命中之后，真正要跑的动作挂在它下面的 `hooks` 数组里，`type` 为 `"command"` 表示执行一条命令行，`command` 就是你那段检查脚本的路径。

脚本被触发时怎么拿到"这次到底要干什么"？Claude Code 会把这次工具调用的详情以一段 **JSON 从标准输入（stdin）**喂给你的脚本，其中终端命令的原文放在 `.tool_input.command` 这个字段里。所以脚本里常用 `jq -r '.tool_input.command'` 把这次要跑的命令取出来做检查。

那这道门怎么决定"放行还是拦下"？有两种方式，都要记牢。

第一种最简单，看脚本的**退出码**：退出码返回 **2**，就等于把这次操作拦下（阻断），脚本打到 stderr 的内容会作为反馈回传给 AI，让它知道为什么被拦、好改个安全的做法；正常退出（`0`）就放行。这是全节最该记死的一条硬规则。

第二种做更细的决策：让脚本正常退出（`0`），同时往标准输出打一段 JSON，用 `hookSpecificOutput.permissionDecision` 字段直接下判断：

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "命中 rm -rf，已拦下"
  }
}
```

`permissionDecision` 的取值是 `allow`（放行）、`deny`（拒绝）、`ask`（转成弹窗先问你一声）、`defer`（这次不表态、交回给后面的权限规则去裁决）。这就把 hook 从一道"拦或放"的栏杆，升级成一扇能自己判断的智能门。

来看两个真能用上的例子。

**例一：PreToolUse 拦住 `rm -rf`。** 前面那个"清理临时文件结果删了一整个目录"的噩梦，就用这道门堵死。思路是：在 `PreToolUse` 上挂一道只管 `Bash` 工具的门，让你的脚本检查这次要跑的命令里有没有 `rm -rf` 这种危险片段——有，就退出码 2 直接拦下，AI 根本执行不了，还会收到被拦的反馈让它换个安全办法；没有，就正常放行。这样一来，"不许 `rm -rf`"就不再是 CLAUDE.md 里一句它可能没往心里去的提醒，而是一道它物理上过不去的关卡。

落到配置上，`settings.json` 里挂一道 `PreToolUse` 上只管 `Bash` 的门：

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": ".claude/hooks/block-rm.sh" }
        ]
      }
    ]
  }
}
```

配套的 `.claude/hooks/block-rm.sh` 脚本，从 stdin 读出这次要跑的命令，一旦命中 `rm -rf` 就用退出码 2 拦下：

```bash
#!/usr/bin/env bash
command=$(jq -r '.tool_input.command')
if echo "$command" | grep -qE 'rm[[:space:]]+-rf'; then
  echo "危险命令被拦下：$command" >&2
  exit 2
fi
exit 0
```

（脚本记得先 `chmod +x` 加上可执行权限。）

配好之后你会看到的效果是这样：当 AI 在会话里试图跑一条带 `rm -rf` 的命令，它不会真的执行，而是当场被打回，收到一句"这条命令被 hook 拦下了"之类的反馈，然后它会掉头去想别的、更安全的清理办法（比如逐个列出要删的文件让你确认，或改用移进回收站的方式）。你在旁边看到的，就是一次本该酿成事故的删除，在发生前的最后一刻被静静挡住了——没有惊险，没有善后，因为坏事根本没来得及发生。这正是 `PreToolUse` 这个"操作前"节点的全部意义：它是你唯一能赶在事情发生之前伸手的时机。

光说不够，直接看它跑一遍。下面这段演示，就是上面这道 `rm -rf` 拦截 hook 真实生效的过程：AI 想清理临时文件、抬手就是 `rm -rf`，却在执行前被 hook 当场按下，它随即改用「先列清单、再逐个确认」的稳妥做法。

```asciinema
/courses/s2-01-claude-code-codex/casts/hook-block-rm.cast
```

**例二：PostToolUse 改完文件自动格式化。** 前面那个"总忘了跑格式化"的琐事，交给这道门。在 `PostToolUse` 上挂一道只管 `Edit` 和 `Write` 工具的门：AI 每改完或写完一个文件，你的命令就自动对那个文件跑一遍格式化工具（Prettier、Black、gofmt，看你项目用哪个）。你再也不用追着它喊"记得格式化"——改完就格式化变成了雷打不动的自动动作。这就是 hooks 比 CLAUDE.md 强的地方：**它不依赖 AI 记不记得，它每次都发生。**

下面把"AI 一次动手要过的这几道关"画成一张图，你就能看清命令、hooks、权限三者是怎么串在一条链上的：

<svg viewBox="0 0 880 360" width="100%" height="auto" style="max-width:880px" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <defs>
    <marker id="k-blue" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#0099ff"/></marker>
    <marker id="k-green" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#16b364"/></marker>
    <marker id="k-pink" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#d42672"/></marker>
  </defs>
  <style>
    .kx-flow-dot { opacity: 0; }
    @keyframes kx-flow-run {
      0%   { transform: translateX(0);      opacity: 0; }
      10%  { opacity: 1; }
      90%  { opacity: 1; }
      100% { transform: translateX(700px);  opacity: 0; }
    }
    /* 滚入视野时随滚动推进播放一次；仅支持滚动时间线的浏览器启用，其余优雅降级为静态图 */
    @supports (animation-timeline: view()) {
      .kx-flow-dot { animation: kx-flow-run linear both; animation-timeline: view(); animation-range: entry 12% cover 58%; }
    }
    /* 尊重系统「减少动态效果」 */
    @media (prefers-reduced-motion: reduce) { .kx-flow-dot { animation: none; opacity: 0; } }
  </style>
  <rect x="0" y="0" width="880" height="360" rx="14" fill="#0d0d12"/>
  <text x="440" y="34" fill="#e5e5ea" font-size="15" font-weight="700" text-anchor="middle">一次工具调用要闯的关卡链</text>
  <!-- 主流程五个节点 -->
  <rect x="24" y="86" width="120" height="58" rx="9" fill="#12121a" stroke="#8a8a94" stroke-width="1.4"/>
  <text x="84" y="112" fill="#e5e5ea" font-size="13" font-weight="700" text-anchor="middle">AI 想执行</text>
  <text x="84" y="130" fill="#8a8a94" font-size="11.5" text-anchor="middle">一次工具调用</text>

  <rect x="184" y="80" width="150" height="70" rx="9" fill="#155eef" fill-opacity="0.16" stroke="#0099ff" stroke-width="1.6"/>
  <text x="259" y="104" fill="#e5e5ea" font-size="13" font-weight="700" text-anchor="middle">权限规则</text>
  <text x="259" y="124" fill="#8a8a94" font-size="11.5" text-anchor="middle">deny → ask → allow</text>
  <text x="259" y="140" fill="#8a8a94" font-size="11.5" text-anchor="middle">deny 优先级最高</text>

  <rect x="374" y="80" width="150" height="70" rx="9" fill="#8c5eff" fill-opacity="0.16" stroke="#8c5eff" stroke-width="1.6"/>
  <text x="449" y="104" fill="#e5e5ea" font-size="13" font-weight="700" text-anchor="middle">PreToolUse hook</text>
  <text x="449" y="124" fill="#8a8a94" font-size="11.5" text-anchor="middle">放行 / 拦下 / 改写</text>
  <text x="449" y="140" fill="#8a8a94" font-size="11.5" text-anchor="middle">退出码 2 = 拦下</text>

  <rect x="564" y="86" width="120" height="58" rx="9" fill="#16b364" fill-opacity="0.16" stroke="#16b364" stroke-width="1.6"/>
  <text x="624" y="119" fill="#e5e5ea" font-size="13" font-weight="700" text-anchor="middle">真正执行</text>

  <rect x="724" y="86" width="130" height="58" rx="9" fill="#12121a" stroke="#8a8a94" stroke-width="1.4"/>
  <text x="789" y="112" fill="#e5e5ea" font-size="12.5" font-weight="700" text-anchor="middle">PostToolUse</text>
  <text x="789" y="130" fill="#8a8a94" font-size="11.5" text-anchor="middle">事后收尾</text>

  <!-- 主流程实线箭头（左→右，绿色=放行推进） -->
  <g stroke="#16b364" stroke-width="1.8" fill="none">
    <line x1="144" y1="115" x2="180" y2="115" marker-end="url(#k-green)"/>
    <line x1="334" y1="115" x2="370" y2="115" marker-end="url(#k-green)"/>
    <line x1="524" y1="115" x2="560" y2="115" marker-end="url(#k-green)"/>
    <line x1="684" y1="115" x2="720" y2="115" marker-end="url(#k-green)"/>
  </g>
  <text x="162" y="105" fill="#16b364" font-size="10.5" text-anchor="middle">放行</text>
  <text x="352" y="105" fill="#16b364" font-size="10.5" text-anchor="middle">放行</text>

  <!-- 被拦下的返程（虚线，右→左，箭头指回 AI） -->
  <!-- 权限 deny 拦回 -->
  <path d="M 259 150 L 259 210 L 88 210 L 88 146" fill="none" stroke="#d42672" stroke-width="1.6" stroke-dasharray="6 4" marker-end="url(#k-pink)"/>
  <text x="170" y="203" fill="#d42672" font-size="11" text-anchor="middle">deny：直接拒绝</text>
  <!-- PreToolUse 退出码2 拦回 -->
  <path d="M 449 150 L 449 258 L 86 258 L 86 146" fill="none" stroke="#d42672" stroke-width="1.6" stroke-dasharray="6 4" marker-end="url(#k-pink)"/>
  <text x="268" y="251" fill="#d42672" font-size="11" text-anchor="middle">hook 退出码 2：当场拦下</text>

  <!-- ask 说明 -->
  <text x="259" y="300" fill="#eaaa08" font-size="11.5" text-anchor="middle">ask：不拒也不放，先弹出来问你一声</text>
  <text x="440" y="332" fill="#8a8a94" font-size="11" text-anchor="middle">实线绿=一路放行推进　　虚线粉=被拦下打回，操作根本没发生</text>
  <circle class="kx-flow-dot" cx="84" cy="115" r="6" fill="#16b364"/>
</svg>

## 权限管理：一份 AI 绕不过的门禁清单

hooks 是你自己写逻辑的"自定义门"，灵活但要动手写脚本。而对于"能不能碰这个文件""能不能跑这类命令"这种最常见的管控，Claude Code 直接内置了一套更省事的机制——**权限规则**。你不用写脚本，只要列一份门禁清单：谁允许放行、谁一律拒绝、谁得先问过你。

类比就是办公楼的门禁。前台有一份名单：这些人刷卡直接进（allow），这些人一律不许进（deny），这些人来了得先打电话请示（ask）。AI 每要动一次手，系统就拿这次操作去对这份名单，按名单办事。

规则的写法是统一的一个格式：`工具(具体范围)`。几个例子你一看就明白：

- `Bash(npm run build)`——精确匹配 `npm run build` 这一条命令。
- `Bash(npm run *)`——放行所有 `npm run` 打头的命令。这里的**空格是词边界**：`Bash(ls *)` 匹配 `ls -la`，却不会误伤 `lsof`；要是写成不带空格的 `Bash(ls*)`，那就连 `lsof` 也一起匹配了，范围大不相同。
- `Read(.env)`——匹配任意目录下的 `.env` 文件（路径按 gitignore 的语义匹配，不写 `./` 就是任意深度）；只想匹配当前目录那一个，写 `Read(./.env)`。
- `WebFetch(domain:github.com)`——针对抓取 github.com 这个域名。

把这些规则按 allow / deny / ask 分到三个篮子里，写进 `settings.json` 的 `permissions`：

```json
{
  "permissions": {
    "allow": [
      "Bash(npm test *)",
      "Read(src/**)"
    ],
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Bash(rm -rf *)"
    ],
    "ask": [
      "Bash(git push *)"
    ]
  }
}
```

这份清单读下来就是：源码随便读、测试随便跑；但 `.env` 这类密钥文件一律不许读、`rm -rf` 一律不许跑；`git push` 到远端这种要紧动作，每次都先弹出来问你一声。

配好之后，日常用起来的手感是"该顺的地方全顺、该拦的地方才停"。AI 读源码、跑测试时一路畅通，不会动不动弹窗打断你；可一旦它要 `git push`，终端里就会跳出一个提示，把它打算跑的完整命令原样列给你看，等你选"允许这一次""以后都允许"还是"拒绝"。而它要读 `.env`、要跑 `rm -rf` 时，你连弹窗都不会看到——直接被 deny 挡在门外，它只会收到"这个操作不被允许"的反馈然后另想办法。**弹窗只在 ask 的规则上出现，deny 是二话不说的静默拒绝，allow 是二话不说的放行。** 你要的正是这种"只在真正需要你拿主意的地方才来烦你"的分寸。

这里有一条评估顺序的硬规则，必须记牢：**deny 优先级最高，评估顺序是 deny → ask → allow。** 意思是，一次操作先拿去比 deny 名单——只要撞上 deny，立刻拒绝，后面 allow 里就算也写了放行也没用，deny 一票否决。撞不上 deny，再看 ask，撞上就问你。都没撞上、又落在 allow 里，才放行。这个顺序保证了你的红线（deny）永远压得住一切，不会被某条宽松的 allow 规则不小心开了口子。

**四种权限模式：一个总开关。** 除了这份逐条清单，Claude Code 还有一个"总开关"式的**权限模式**，决定整体上它有多放得开：

| 模式 | 大白话 | 适合什么时候 |
|---|---|---|
| default | 默认档：碰没授权的操作就停下来问你 | 日常写代码，最稳妥 |
| acceptEdits | 自动接受改文件，别的照旧问 | 信任它连续改一批文件时 |
| plan | 只读规划、不许动手 | 让它先摸清楚、出方案，你审完再放行 |
| bypassPermissions | 全部放行、不再问 | 极度可控的环境（如隔离沙箱）才用 |

这四个模式名就是写进 `settings.json` 里 `permissions.defaultMode` 的值。`acceptEdits` 除了自动接受文件编辑，也会自动放行 `mkdir`、`touch`、`mv`、`cp` 这类常见文件操作；`bypassPermissions` 只建议在容器、虚拟机这类隔离环境里用，即便如此，像 `rm -rf /` 这种极危险命令仍会有熔断提示兜底。

这四档里，`plan`（只读规划模式）尤其值得你现在就记住——它让 AI 只能看、不能改，专门用来对付"陌生代码库不敢让它乱动"的场景，这正是全课最后一节 1.7 的重头戏。而 `bypassPermissions` 是把所有闸门一次拆光，只有在真正隔离、出了事也无所谓的环境里才用，平时千万别图省事挂上它。

**Codex 对照：审批和沙箱是两根独立的轴。** 上一节和 1.1 都埋过这个伏笔，这里讲透。Claude Code 的权限模式是**一根轴**——从严到松一档档拧。Codex 不一样，它把这件事拆成了**两根互相独立的轴**，分开拧：

- **沙箱（`sandbox_mode`）** 管的是"技术上它到底能碰什么"：`read-only`（只能读）、`workspace-write`（能改当前工作区）、`danger-full-access`（不设限，能碰整台机器）。
- **审批（`approval_policy`）** 管的是"碰之前要不要先问你一声"：`untrusted`（几乎事事都问）、`on-request`（按需问，默认档）、`never`（从不问）。

一句话记住它俩的分工：**沙箱决定"能做什么"，审批决定"何时要经过你同意"。** 这两根轴正交，能配出很细的组合。给你两个最典型的：

| 场景 | 沙箱 | 审批 | 效果 |
|---|---|---|---|
| 日常开发（默认） | `workspace-write` | `on-request` | 能改本项目，遇到拿不准的先问你 |
| CI / 自动化流水线 | `read-only` | `never` | 只读不改、也不停下来问，适合无人值守跑 |

这两组分别对应命令行上的 `--sandbox workspace-write --ask-for-approval on-request`（默认）和 `--sandbox read-only --ask-for-approval never`（CI 常用），也可以写进 `~/.codex/config.toml` 固定下来。顺带提两个坑：老教程里的 `--full-auto` 已经弃用，现在改用 `--sandbox workspace-write`；还有一个 `--dangerously-bypass-approvals-and-sandbox`（别名 `--yolo`），顾名思义把两根轴的保护一次全拆光，等同于 Claude Code 的 `bypassPermissions`——名字里带 dangerous 不是吓唬你，非隔离环境别碰。

## 新手最容易卡的几个点

**卡点一：命令建好了，`/名字` 却出不来。** 多半是文件位置或名字不对。再核对一遍：项目级要放在项目根目录的 `.claude/commands/` 下（注意 `.claude` 前面有个点，是隐藏目录），文件扩展名是 `.md`，命令名就是去掉 `.md` 的文件名。放对了地方，在会话里敲 `/` 应该就能在列表里看到它。

**卡点二：hook 挂了却好像没触发。** 先分清你挂的是哪个事件——想在操作发生前拦，必须挂 `PreToolUse`，挂成 `PostToolUse` 就成了"事后诸葛亮"，操作早跑完了拦不住。再检查 `matcher` 有没有匹配上目标工具：想拦终端命令，matcher 要能匹配到 `Bash`；matcher 写窄了、或工具名拼错，这道门就形同虚设，AI 大摇大摆从旁边过去了。

**卡点三：以为写了 deny 就万无一失，结果还是被绕过。** 权限规则的匹配是按你写的"具体范围"来的，范围没覆盖全就有缝。比如你 deny 了 `Read(.env)`，但项目里还有 `.env.local`、`.env.production`，这些没写进去就还是能读。红线类的 deny 规则，要把同族的变体一起堵上（像上面示例里 `.env` 和 `.env.*` 一起写）。记住 deny 优先没错，但前提是这次操作得先被你的 deny 规则**匹配上**才谈得上优先。

**卡点四：hook 和权限规则分不清该用哪个。** 简单判断：只是"允许/禁止/先问一下"碰某个文件或跑某类命令，用**权限规则**就够了，一行清单搞定，不用写脚本；要在关键节点跑一段**你自己的逻辑**（检查命令内容、自动格式化、写日志、按更复杂的条件判断），才上 **hooks**。别拿 hooks 去做权限清单一行能解决的事，也别指望权限规则去做需要跑脚本才判断得了的活。

**卡点五：图省事直接开 `bypassPermissions` / `--yolo`。** 一被权限弹窗打断就想干脆全放开，这是最危险的习惯。这两个"全放行"开关是给隔离沙箱、一次性容器这种"炸了也无所谓"的环境准备的。在你自己的开发机、尤其是带着真实项目和密钥的机器上挂上它，等于把前面辛辛苦苦架的门全拆了。宁可多点两下确认，也别图这一时省事。

## 总结

这一节补上了上一节留下的那块短板：CLAUDE.md 是软约束，负责让 AI"懂"你的规矩；而当"懂"不够、需要"绕不过"的时候，靠的是这一节的三样硬办法。

往回收一下。**自定义命令**把每次都要重打一遍的固定指令存成一个 `/命令`（Claude Code 放 `.claude/commands/*.md`，用 `$ARGUMENTS` 传参；Codex 那边的 `~/.codex/prompts/` 已改推 skills），省的是你的重复劳动。**hooks** 是架在 AI 动手节点上的安检门，挂在 `PreToolUse` 就能在操作发生前拦下、挂在 `PostToolUse` 能自动收尾，退出码 2 就是那道"拦下"的硬闸——它不依赖 AI 记性，每次都发生。**权限管理**是一份 allow / deny / ask 门禁清单，配合 default / acceptEdits / plan / bypassPermissions 四个模式档位，评估时 **deny 优先**，你的红线永远压得住。对照下来，Codex 把这件事拆成审批和沙箱两根独立的轴，比单轴的权限模式更细，两个典型组合是日常的 `workspace-write` + `on-request` 和 CI 的 `read-only` + `never`。

跟着做下来，你那个练习仓库现在应该已经多了三样东西：一个像 `/review` 这样的自定义命令、一个拦住 `rm -rf` 的 PreToolUse hook、还有一份写清了红线的权限清单。软约束加硬闸门，你的主力工具从这一节起才算真正"管得住"。

不过管得住只是底盘。你很快会发现新的麻烦：会话聊得一长，AI 开始忘掉你前面说过的话、答非所问，甚至把你刚否掉的方案又改了回来——它的"记忆"是有限的，塞满了就会犯糊涂。下一节 1.4 就来拆这件事：把 AI 的上下文当成一份有限的预算来经营，学会看它、压它、清它，让长会话也不失控。
