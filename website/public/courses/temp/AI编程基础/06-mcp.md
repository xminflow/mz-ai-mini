# 1.6 MCP 工具接入

上一节你学会了给主力派分身、开并行分支，把一台机器上的活拆开同时干。但不管派多少个分身、开多少条 worktree，它们全都困在同一个圈子里——只够得着**你项目目录里的那些文件**。这一节要做的，是把这个圈子捅破：让 AI 伸手够到项目之外的东西，你的数据库、你的在线文档、你挂在别处的第三方服务。

## AI 其实是个"够不着"的高手

先说一个你迟早会撞上的场景。

你在练习仓库里让主力干活，读代码、改代码、跑测试，它都利索。可有一天你想让它干这么件事："看看数据库里 `users` 表现在到底有哪些字段，跟代码里的模型对一下，看有没有对不上的。"它卡住了。它能读到你代码里写的那份数据模型定义，但它读不到**数据库里真实的表结构**——那东西不在你的项目文件里，它在一个跑着的数据库服务里，AI 的手伸不进去。

再换个场景。你用的某个框架最近发了新版本，API 改了。你让 AI 按新版本写，它写出来的却是旧版本的老写法——因为它脑子里那份知识有截止日期，而最新的用法只存在于官网那份**在线文档**里，它同样够不着。

这就是纯靠"读本地文件"的天花板。AI 本事再大，能动的也只有你摊在它面前的那些文件。凡是活的、在别处的、要实时去问的东西——数据库、在线文档、你公司内部的某个 API、你的任务系统——它一概碰不到。不是它不会，是它**没有那根线**接过去。

MCP 就是那根线。

## 把 MCP 想成一个"统一插座"

MCP 的全称是 Model Context Protocol（模型上下文协议）。名字唬人，但它解决的事特别朴素：**给 AI 定一套统一的接口标准，好让它能接上各种外部能力。**

打个你天天见的比方。你家墙上的插座是统一规格的，所以不管是台灯、手机充电器还是电风扇，插头都能插进去用电——你不需要给每个电器单独在墙里埋一条专线。MCP 就是给 AI 世界定的那种"统一插座规格"：数据库做一个符合这个规格的"插头"（这个插头叫 **MCP server**），在线文档做一个，你的第三方服务再做一个，然后它们全都能插到 AI 这个"插座"上。AI 不用为每一样外部能力单独学一套对接方式，它只认 MCP 这一套标准接口，剩下的对接细节由各自的 MCP server 在背后处理。

所以整条链路是三层，你务必分清：

- **最左边是 AI 客户端**——就是你的 Claude Code 或 Codex，它是要用电的"电器"。
- **中间是 MCP server**——那个"插头 + 适配器"，一头按 MCP 标准跟 AI 对话，另一头用外部服务自己的方式去访问真实资源。
- **最右边是外部服务本身**——你的数据库、文档站、第三方 API，真正存着数据、干着活的地方。

下面这张图把这三层摆清楚：

<svg viewBox="0 0 840 380" width="100%" height="auto" style="max-width:840px" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <defs>
    <marker id="mcpBlue" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#0099ff"/></marker>
    <marker id="mcpCyan" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#22ccdd"/></marker>
    <marker id="mcpGray" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L7,3 L0,6 Z" fill="#8a8a94"/></marker>
  </defs>
  <rect x="0" y="0" width="840" height="380" rx="14" fill="#0d0d12"/>
  <text x="130" y="34" fill="#8a8a94" font-size="12.5" text-anchor="middle">① AI 客户端（电器）</text>
  <text x="420" y="34" fill="#8a8a94" font-size="12.5" text-anchor="middle">② MCP server（统一插头）</text>
  <text x="715" y="34" fill="#8a8a94" font-size="12.5" text-anchor="middle">③ 外部服务（真实资源）</text>
  <!-- 左：AI 客户端 -->
  <rect x="45" y="130" width="170" height="120" rx="11" fill="#155eef" fill-opacity="0.18" stroke="#0099ff" stroke-width="1.6"/>
  <text x="130" y="178" fill="#e5e5ea" font-size="15" font-weight="700" text-anchor="middle">Claude Code</text>
  <text x="130" y="202" fill="#8a8a94" font-size="12.5" text-anchor="middle">/ Codex</text>
  <text x="130" y="226" fill="#8a8a94" font-size="12" text-anchor="middle">只认 MCP 标准接口</text>
  <!-- 中：MCP server -->
  <rect x="345" y="120" width="150" height="140" rx="11" fill="#22ccdd" fill-opacity="0.14" stroke="#22ccdd" stroke-width="1.6"/>
  <text x="420" y="180" fill="#e5e5ea" font-size="15" font-weight="700" text-anchor="middle">MCP server</text>
  <text x="420" y="204" fill="#8a8a94" font-size="12" text-anchor="middle">一头对 AI</text>
  <text x="420" y="222" fill="#8a8a94" font-size="12" text-anchor="middle">一头对服务</text>
  <!-- 右：三个外部服务 -->
  <g fill="#12121a" stroke="#8a8a94" stroke-width="1.4">
    <rect x="640" y="88" width="155" height="46" rx="8"/>
    <rect x="640" y="164" width="155" height="46" rx="8"/>
    <rect x="640" y="240" width="155" height="46" rx="8"/>
  </g>
  <g fill="#e5e5ea" font-size="13" text-anchor="middle">
    <text x="717" y="116">数据库</text>
    <text x="717" y="192">在线文档</text>
    <text x="717" y="268">第三方 API</text>
  </g>
  <!-- 左 <-> 中：MCP 协议，实线去 + 虚线回 -->
  <line x1="217" y1="180" x2="341" y2="180" stroke="#0099ff" stroke-width="1.8" marker-end="url(#mcpBlue)"/>
  <line x1="341" y1="205" x2="219" y2="205" stroke="#0099ff" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#mcpBlue)"/>
  <text x="279" y="168" fill="#0099ff" font-size="11.5" text-anchor="middle">MCP 协议</text>
  <text x="279" y="228" fill="#8a8a94" font-size="11" text-anchor="middle">stdio / http / sse</text>
  <!-- 中 <-> 右：各服务自己的接口 -->
  <g fill="none">
    <line x1="497" y1="160" x2="636" y2="118" stroke="#22ccdd" stroke-width="1.6" marker-end="url(#mcpCyan)"/>
    <line x1="497" y1="190" x2="636" y2="187" stroke="#22ccdd" stroke-width="1.6" marker-end="url(#mcpCyan)"/>
    <line x1="497" y1="220" x2="636" y2="258" stroke="#22ccdd" stroke-width="1.6" marker-end="url(#mcpCyan)"/>
  </g>
  <text x="565" y="150" fill="#8a8a94" font-size="11" text-anchor="middle">各服务自己的接口</text>
  <text x="420" y="345" fill="#8a8a94" font-size="12" text-anchor="middle">实线=AI 发起请求　虚线=结果返回；AI 只需学 MCP 一套接口，就能接上右边任意多个服务</text>
</svg>

看懂这张图，MCP 就不神秘了：它不是什么智能黑魔法，就是一层**标准化的中间人**，把"AI 想用外部能力"这件麻烦事，收拢成"插上一个符合规格的 MCP server"这么一个动作。

## 三种传输：这根线怎么连过去

图里 AI 和 MCP server 之间那条线，实际连接方式有三种，你配置时要选一种，术语叫**传输方式（transport）**：

- **stdio**——MCP server 是一个跑在你**本机**上的小程序，AI 通过标准输入输出直接跟它对话。你接本地能力（比如让 AI 操作本机数据库、读本地某个工具）时用这种，最常见。
- **http**——MCP server 跑在**某个网络地址**上，AI 通过 HTTP 请求去连。你接的是一个别人已经架在远端的服务时用这种。
- **sse**——也是走网络，是 http 的一种较早的变体（基于 Server-Sent Events）。现在新接的服务大多用 http，sse 你知道有这么个东西、遇到老配置能认出来就行。

选哪种不用纠结：**跑在你本机的小程序用 stdio，架在远端的地址用 http**，八成场景这一句就够。

## 配置放哪：local / project / user 三级作用域

跟前面几节的 `CLAUDE.md`、权限配置一个思路，MCP server 的配置也分作用域（scope），看你想让它管多大范围、要不要共享。Claude Code 分三级（用 `claude mcp add` 时靠 `-s`/`--scope` 指定）：

- **local（默认）**：只对**当前这个项目、且只有你自己**生效，不进版本库。你临时试一个 server、或它只跟你个人有关，用这级——不指定 scope 时就是它。
- **project**：写进项目根目录的 `.mcp.json` 里，**能跟着仓库进 git、被团队共享**。队友拉下代码，同一套 MCP server 配置就有了。要让整个团队都用上"这个项目专属的 server"，用这级。
- **user**：对你**所有项目**都生效。你接的是"不管在哪个项目都想用"的通用能力（比如一个查文档的 server），用这级，省得每个项目重配一遍。

判断很简单：**只自己临时用就 local，要共享给团队就 project（进 `.mcp.json`），想跨所有项目通用就 user。**

## 手把手：给练习仓库接一个能查数据库的 server

光讲不练没用。这就给你第一阶段那个练习仓库接一个真的 MCP server。你的全栈应用带着一个数据库，前面那个"够不着数据库真实表结构"的痛点正好落在这儿——就接一个能读数据库的 server，让 AI 从此能直接问你的库。

**第一步，写配置。** 先提醒一句："读数据库"这种能力，得有一个专门对接数据库的 MCP server。官方早期那个 postgres 参考实现（`@modelcontextprotocol/server-postgres`）如今已经归档、不再维护，别再用它——要接数据库，去 MCP 官方 registry 里挑一个当前仍在维护的数据库 server（按你的库是 PostgreSQL、MySQL 还是 SQLite 选对应的那个）。下面用"你选定的数据库 server 包名"代指它，配法都是同一个套路。

在练习仓库根目录建一个 `.mcp.json` 文件（放 project 作用域，因为这个数据库是这个项目专属、又要共享给团队的），写进这样一段。这是一个 stdio 传输的 server——它是个跑在你本机、通过 `npx` 拉起来的小程序：

```json
{
  "mcpServers": {
    "db": {
      "command": "npx",
      "args": [
        "-y",
        "你选定的数据库 server 包名",
        "postgresql://用户名:密码@localhost:5432/你的库名"
      ]
    }
  }
}
```

逐行看这段：`db` 是你给这个 server 起的名字（后面调用、配权限都用它，随你取）；`command` 加 `args` 合起来就是"怎么把这个 server 程序启动起来"——这里用 `npx` 拉起你从 registry 选定的那个数据库 server，最后那串 `postgresql://...` 是你数据库的连接地址，把用户名、密码、库名换成你自己的。

如果你不想手写 JSON，Claude Code 也提供了命令行的加法，基本形态是 `claude mcp add <名字> <启动命令或地址> [参数...]`。接一个本机 stdio 小程序时，要用 `--` 把"启动 server 的那条命令"跟前面的参数分隔开；要给 server 传环境变量（比如密钥）就用 `-e`：

```bash
claude mcp add db -e API_KEY=xxx -- npx -y 你选定的数据库 server 包名 postgresql://...
```

如果接的是远端的 HTTP server，就不用 `--`，改成加 `--transport http` 再跟地址，例如：

```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
```

两种方式等价，选一种即可。手写 `.mcp.json` 的好处是它明明白白摆在仓库里、能进 git 给团队共享，更推荐这种。

（想现在就零门槛跑通一遍、手边又没有数据库？可以先拿官方一直维护的 **filesystem server** 顶替走一遍全流程：`claude mcp add docs -- npx -y @modelcontextprotocol/server-filesystem /你的/文档目录`。它能让 AI 读到你指定的那个本地目录里的文档，同样是"把手伸到项目文件之外"的典型例子。）

**第二步，用 `/mcp` 确认接上了。** 配置写好后，重新启动 `claude`，然后敲这条斜杠命令：

```text
/mcp
```

它会列出当前所有 MCP server 和各自的状态。接成功了，你会看到你那个 `db` 亮着已连接的状态，底下还能展开它提供了哪些工具（比如"列出所有表""查询某张表"之类）：

```text
db  ✔ connected
  tools: list_tables, query, ...
```

要是 `db` 显示的是连接失败或红叉，先别往下走——多半是连接串写错了或数据库没启动，翻到本节最后的排错。

**第三步，在会话里真的用它一次。** 接上就该试真活。回到会话里，直接用大白话让 AI 去问数据库，比如："连数据库看看 `users` 表现在有哪些字段，跟代码里的模型定义对一下，有没有对不上的。"

这一次它不会再卡住了。它会调用刚接上的 `db` server 去读真实的表结构，把数据库里的实况跟你代码里的模型摆到一起给你比对。你会看到它明确地"去查了一趟数据库"再回答——那个之前够不着的东西，现在够着了。这一步能跑通，本节的实操目标就达成了：你的练习仓库里多了一个 MCP server，AI 的手第一次伸出了项目文件之外。

## 延迟加载：为什么接一堆 server 也不心疼

你可能担心：接的 server 越多，AI 要记的工具就越多，会不会把上下文（1.4 讲的那份"有限预算"）撑爆？

放心，MCP 在这件事上设计得很聪明，用的是**延迟加载**。意思是：接上的 server 提供的那些工具，AI 平时并**不会把每个工具的完整说明书都塞进上下文**里占着地方；只有当它判断"这次真要用到这个工具"了，才去把对应的详细定义拉进来。所以你哪怕接了七八个 server，绝大多数时候它们只是"挂在那儿待命"，几乎不占预算——用到谁才现拿谁。这就让你可以放心地把常用外部能力都接上，不必为每个 server 的开销斤斤计较。

## 给外部工具也套上权限闸门

1.3 讲过用权限规则管住 AI 别乱来。接了 MCP server 之后，这些外部工具同样要纳入那套闸门——毕竟一个能"查询数据库"的工具，用不好也能"改数据库"。

MCP 工具在权限规则里有固定的写法，格式是 **`mcp__<server 名>__<工具名>`**（注意是双下划线分隔）。比如你想允许上面那个 `db` server 的查询工具，就写 `mcp__db__query`。你可以把只读的查询类工具放进 allow、把可能改动数据的工具留着每次问你，规则语法跟 1.3 学的完全一样，只是工具名换成了这种带前缀的形式。这样一来，AI 通过 MCP 够到的外部世界，也照样在你的安全闸门管辖之内。

## Codex 这边怎么接

副手 Codex 对 MCP 是完整支持的，配置思路一样，只是落在它那份 `~/.codex/config.toml` 里（TOML 格式，不是 JSON）。同样一个 stdio 的 server，在 Codex 里写成这样：

```toml
[mcp_servers.db]
command = "npx"
args = ["-y", "你选定的数据库 server 包名", "postgresql://..."]
```

如果接的是远端 HTTP 的 server，则用 `url` 指地址、用 `bearer_token_env_var` 指定一个存放访问令牌的环境变量名（把密钥放环境变量里、不写死进配置文件，这是好习惯）：

```toml
[mcp_servers.docs]
url = "https://某个文档服务的地址"
bearer_token_env_var = "DOCS_TOKEN"
```

管理这些 server，Codex 用的是 `codex mcp` 这组命令。

Codex 还多一手很有意思的能力：**它自己就能反过来当一个 MCP server**。也就是说，你可以让别的 AI 客户端把 Codex 当成一个外部能力接进去、调用它来干活——这在"让主力指挥副手"这类编排场景里有用。启动它作 server 的子命令是 `codex mcp-server`（子命令名随版本会变，以 `codex mcp --help` 为准）。

这层你现在知道"Codex 既能接别人、也能被别人接"就够了，真用到时再查它当时的确切子命令。

## 新手最容易卡的几个点

**卡点一：`/mcp` 里 server 显示连接失败。** 最常见是连接串写错——数据库的用户名、密码、端口、库名有一个对不上，或者数据库服务压根没启动。先在终端里用数据库自己的客户端确认这串地址能连上，再回来看 MCP。stdio 类的 server 连不上，也可能是 `npx` 拉包时网络不通，按 1.1 那招给终端配上代理再试。

**卡点二：改了 `.mcp.json` 但不生效。** MCP 配置是**启动时读**的。你新增或改了 server，得**重启 `claude`** 才会重新加载，在已经开着的会话里改是不会热更新的。改完记得退出重进。

**卡点三：作用域放混了。** 把"只有这个项目要用的 server"配成了 user 级（对所有项目生效），结果切到别的项目它也来连、报一堆错。记住那条判断：项目专属、要共享的进 project（项目根目录 `.mcp.json`），只自己临时用的用默认的 local，真正通用的才放 user。

**卡点四：担心把密码提交进 git。** 项目级 `.mcp.json` 会进版本库，而上面那个连接串里明晃晃带着数据库密码——直接提交就把密码泄露给所有能看到仓库的人了。稳妥的做法是把密码这类敏感值放进环境变量、在配置里引用（就像 Codex 那份 `bearer_token_env_var` 干的事），或者把带真实密码的配置文件加进 `.gitignore`。这条别偷懒，密码进了 git 历史很难彻底清干净。

## 总结

这一节把 AI 能触及的边界，从"你项目里的本地文件"一路扩到了"你的数据库、在线文档、第三方服务"。

往回收几条关键。核心就一个类比：**MCP 是给 AI 定的统一插座标准**，各种外部能力做成符合规格的 MCP server（插头），AI 只认 MCP 这一套接口，就能接上任意多个外部服务，不必为每样能力单独学一套对接。整条链路记住三层——AI 客户端、中间的 MCP server、最右边的真实服务。连接方式有 stdio / http / sse 三种，本机小程序用 stdio、远端地址用 http。配置分 local（默认、仅本项目本人）、project（`.mcp.json`、随仓库进 git 共享）、user（全项目通用）三级作用域，既能手写也能用 `claude mcp add` 加，靠 `/mcp` 查看状态。工具是延迟加载的，接多也不吃亏；外部工具照样要用 `mcp__<server>__<工具>` 的权限规则管住。副手 Codex 用 `config.toml` 里的 `[mcp_servers.<名>]` 接，格式换成 TOML，而且它自己还能反过来当一个 MCP server 被别人调用。

到这里，你的练习仓库里应该已经接上了一个能读数据库的 MCP server，并且真的让 AI 查了一次库、拿到了本地文件里没有的实况。回头看这一整个阶段：1.2 给它写了规矩，1.3 配了命令、关卡和权限，1.4 教它管好记忆，1.5 学会派分身并行，1.6 又给它接上了外部能力——你手里的"武器"已经配齐了。

最后一节 1.7 要做的，是把这一路攒下的所有配置拧成一股绳，用在最硬的一仗上：**接手一个几万行、没人交接的陌生大代码库**。工具再全，面对一个完全看不懂的老项目，怎么让 AI 先摸清结构、再小步安全地动手、而不是上来就乱改一通——那是这一阶段的收尾，也是把前面所有本事真正串成一套流程的地方。
