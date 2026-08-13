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
