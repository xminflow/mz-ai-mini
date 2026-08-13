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
