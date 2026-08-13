# 《Claude Code 完整指南》写作规格 + 已核实事实清单

> 本文件是写作 agent 的唯一依据。**只写本文件中列出的事实**；本文件没有的具体字段名/默认值/价格，一律不要编造，留 `<!-- TODO 核实: 具体问题 -->` HTML 注释。

---

## 一、成品定位

- 这是 VIP 课程第一章《AI编程基础》的**第二节**，独立长文，手册级，目标 10000–13000 中文字。
- 承接第一节《AI 时代下的开发者发展路线》。第一节的两个核心结论会被反复引用：
  1. **AI 不担责，所以产生不了信任**；
  2. **把 AI 当"内奸"用**——低级玩家识破就干掉，高级玩家先装傻用起来、盯住每一步、关键处不放权，最后榨干全部价值。
  第 4 节（权限）就是这条"内奸心法"的技术落地，务必明确回扣。
- 只讲 Claude Code，**不做与 Codex / Cursor 的横向对比**。

## 二、口吻与硬规则（违反即返工）

1. **禁第一人称**：正文不出现「我 / 我们」指代作者或讲师。面向读者一律用「你」。举例里读者的口吻也要避开「我」（「帮我看看」→「帮忙看看」）。
2. **有立场、敢下结论**：用无人称权威句式——「更推荐 X」「这条路建议直接跳过」「Y 已经废弃、别再用」。
3. **禁研究报告腔**：不要导航句（「本节将介绍…」）、不交代研究过程、不要 `*未核实*` 标记、不要独立《数据来源》节、不要 emoji、不要几乎逐句加粗、不要每个条目套同一模板。
4. **禁免责腔**：不要「以官网为准」「仅供参考」「拿不准就…」。时效当确定事实陈述（如「截至 2026 年年中」）。唯一例外：版本迭代极快的项，可写「以 `claude --help` 为准」。
5. **必须大量使用真实场景举例**（这是硬要求）：每个概念、每项配置、每条命令，都要配一个能代入的具体情境——谁、在什么项目里、遇到了什么、敲了什么、看到了什么、结果怎样。只给定义和参数表不合格。参数表后面必须跟至少一个真实用例。
6. **不重复第一阶段基础**：终端怎么用、Node 怎么装，一句话带过。
7. 结尾小节一律叫 `## 总结`，不写「本节产出」。

## 三、贯穿主线（所有举例优先用它）

练习仓库：**社团报名系统 `signup-app`**（学员第一阶段做过并上线的全栈应用）。

- 技术栈：Next.js（App Router）+ Prisma + PostgreSQL，包管理 `pnpm`，部署在一台 VPS 上。
- 目录：`src/app/`（页面与 API 路由）、`src/lib/`、`prisma/schema.prisma`、`tests/`、`.env`（含数据库连接串）、`scripts/deploy.sh`。
- 已知的真实痛点，写作时反复取用：
  - 每次开会话都要重新交代一遍「这个项目用 pnpm 不用 npm」「迁移必须走 prisma migrate 不许手改 SQL」；
  - 有一次 AI 直接跑了 `prisma migrate reset`，把本地开发库清空了；
  - 报名接口在并发下出现重复报名，因为没加唯一约束；
  - `.env` 里有生产数据库连接串，绝对不能被读进上下文或打到日志里；
  - 上线脚本 `scripts/deploy.sh` 会直接推生产，绝不能自动执行。

## 四、命令框约定

- 代码块只给「该敲的部分」，**不带 `$` / `>` / `#` 提示符前缀**。
- 命令用 ```bash，预期输出**另起**一个 ```text 块或引用块，不要混在一起。
- 多系统差异用中文标签行区分：「macOS / Linux」「Windows（PowerShell）」。
- SVG 示意图里的 `$ claude` 可保留（那是视觉符号不是可复制命令）。

## 五、可视化

- 每个 part 画 **1 张**手写内联 SVG（见各 part 的指派），不要多画。
- 风格：线 + 点 + 框 + 标签，克制。深色底 `#0d0d12`，中性白字 `#e5e5ea`，弱化灰 `#8a8a94`，边框灰 `#3a3a44`。
- 品牌色点睛：主蓝 `#0099ff`、暗金 `#eaaa08`（警示）、翡翠绿 `#16b364`（成功/产出）、粉 `#d42672`（阻断/错误）、紫 `#8c5eff`。
- 必须 `viewBox` + `width="100%" height="auto"` + `role="img"` + `aria-label`，字号 ≥ 12。
- 实线 = 去程/主流程；虚线 = 返程/循环。**箭头方向务必核对**。
- 多维横向对比用 Markdown 表格，不要画成 SVG。
- 真实界面截图用标准 Markdown 图片 `/courses/01-ai-programming-basics/img/xxx.png`，并在紧邻处写 `<!-- 截图: 该截什么 -->`。不要用 `![[...]]` 语法。

---

# 已核实事实清单

> 双验来源：`code.claude.com/docs` 官方文档（2026-07-22 抓取）+ 本机实测（Claude Code **2.1.216**，Windows）。
> Kimi 部分来源：`platform.kimi.com` 官方文档（2026-07-23 抓取）。
> **凡标「未核实」的，不要写进正文。**

## A. 版本与安装

- 本机实测版本：`2.1.216`。
- 系统要求：macOS 13.0+、Windows 10 / Server 2019+、Ubuntu 20.04+、Debian 10+、Alpine 3.19+；≥4GB 内存；x64 或 ARM64。依赖 ripgrep（通常内置，Alpine 需手动装）。
- 安装方式（**只有原生安装器自带自动更新**）：

| 方式 | 命令 | 自动更新 |
|---|---|---|
| 原生安装器（macOS/Linux/WSL） | `curl -fsSL https://claude.ai/install.sh \| bash` | 有 |
| 原生安装器（Windows PowerShell） | `irm https://claude.ai/install.ps1 \| iex` | 有 |
| Homebrew | `brew install --cask claude-code` | 无 |
| WinGet | `winget install Anthropic.ClaudeCode` | 无 |
| npm | `npm install -g @anthropic-ai/claude-code`（Node.js 22+） | 无 |

- 查版本 `claude --version`；更新 `claude update`；只读体检 `claude doctor`（会话内用 `/doctor`，能顺带修问题）。
- 更新频道设置在 `~/.claude/settings.json`：`"autoUpdatesChannel": "stable"`（约晚一周、跳过重大回归）或 `"latest"`（默认）。可用 `"minimumVersion"` 卡最低版本。
- 禁用自动更新：环境变量 `DISABLE_AUTOUPDATER=1`。
- Windows：Git for Windows 可选，装了才有 Bash 工具，否则用 PowerShell 工具；可用 `CLAUDE_CODE_GIT_BASH_PATH` 指定 Git Bash 路径。WSL 2 支持沙箱隔离，WSL 1 和原生 Windows 不支持。

## B. 启动与 CLI 参数（本机 `claude --help` 实测）

| 参数 | 作用 |
|---|---|
| `claude` | 启动交互会话 |
| `claude "问题"` | 带首条提示启动 |
| `-p, --print` | 非交互，打印结果后退出 |
| `-c, --continue` | 继续当前目录下最近一次会话 |
| `-r, --resume [值]` | 按 session ID 恢复，或打开交互选择器 |
| `--model <名>` | 指定模型 |
| `--effort <级别>` | low / medium / high / xhigh / max |
| `--permission-mode <模式>` | 见 D 节 |
| `--add-dir <目录...>` | 额外授予访问的目录 |
| `--allowedTools <工具...>` | 预批准工具，如 `"Bash(git *) Edit"` |
| `--disallowedTools <工具...>` | 禁用工具 |
| `--settings <文件或JSON>` | 额外加载一份设置 |
| `--setting-sources <来源>` | 逗号分隔，限定加载 user/project/local |
| `--safe-mode` | 禁用全部自定义（CLAUDE.md、skills、插件、hooks、MCP、自定义命令与 agent 等），排查配置故障用；管理员策略仍生效 |
| `--bare` | 极简模式，跳过 hooks、LSP、插件同步、自动记忆、CLAUDE.md 自动发现 |
| `--tools <工具...>` | 限定内置工具集，`""` 全关，`default` 全开 |
| `--session-id <uuid>` | 指定会话 ID |
| `--fork-session` | 复制出新会话而非复用原 ID |
| `--bg, --background` | 作为后台 agent 启动，立即返回（用 `claude agents` 管理） |
| `-w, --worktree [名]` | 为本次会话新建 git worktree |
| `--fallback-model <名>` | 主模型过载时自动降级（逗号分隔多个，**仅 `--print` 下生效**） |
| `--append-system-prompt <文本>` | 追加系统提示 |
| `--output-format <格式>` | text / json / stream-json |
| `--max-turns <N>` | 限制轮数 |
| `--max-budget-usd <金额>` | 花费上限 |
| `-d, --debug [过滤器]` | 调试日志，可按类别过滤如 `"api,hooks"` |
| `--dangerously-skip-permissions` | 跳过全部权限检查，仅限无外网的沙箱 |

- 子命令（本机实测）：`agents`（管理后台 agent）、`auth`、`doctor`、`install`、`mcp`、`plugin`、`project`、`setup-token`（生成长期 token）、`update`。
- 管道用法：`cat logs.txt | claude -p "分析这段日志"`。

## C. 交互内的斜杠命令（挑高频写，别全表堆进去）

会话与上下文：`/clear`（清空上下文）、`/compact [指令]`（压缩对话）、`/context`（可视化当前上下文占用）、`/rewind`（回退代码与对话到检查点）、`/resume`、`/rename`、`/export`、`/copy`、`/status`、`/usage`。

模型与配置：`/model [别名]`、`/effort [级别]`、`/thinking [on|off]`、`/fast [on|off]`、`/config`、`/permissions`、`/hooks`、`/keybindings`、`/doctor`。

工作方式：`/plan`（进入计划模式）、`/agents`、`/mcp`、`/memory`、`/init`、`/code-review [级别] [--fix]`、`/security-review`、`/verify`、`/diff`、`/tasks`、`/background`。

其他：`/help`、`/login`、`/logout`、`/bug`、`/exit`。

**重要变化：自 2.1.215 起 `/verify` 与 `/code-review` 不再自动运行，必须显式调用。**

## D. 键盘与输入技巧（本机可实测）

| 按键 | 作用 |
|---|---|
| `Shift+Tab` | 循环切换权限模式 |
| `Ctrl+C` | 中断当前动作 |
| `Ctrl+D` | 退出（800ms 内按两次确认） |
| `Ctrl+J` | 插入换行而不提交 |
| `Ctrl+O` | 切换详细转录视图 |
| `Ctrl+T` | 切换待办清单显示 |
| `Ctrl+L` | 强制重绘屏幕（保留已输入内容） |
| `Ctrl+R` | 历史搜索 |
| `↑` / `↓` | 翻历史输入 |
| `Ctrl+G` 或 `Ctrl+X Ctrl+E` | 用外部编辑器编辑当前输入 |
| `Ctrl+B` 或 `Ctrl+X Ctrl+B` | 把当前任务转入后台 |
| `Ctrl+X Ctrl+K` | 停掉所有后台 subagent |
| `Ctrl+V`（Windows/WSL 为 `Alt+V`） | 粘贴图片 |

输入技巧：
- `@路径` 引用文件，如 `@src/app/api/signup/route.ts`；可直接拖拽文件进终端。
- `#` 开头快速写入记忆。
- `!` 开头直接当 bash 执行，如 `!pnpm test`。
- 自定义键位写在 `~/.claude/keybindings.json`，`/keybindings` 可打开编辑，保存后自动生效无需重启。

## E. 权限系统（本节是重头，要厚）

六种权限模式：

| 模式 | 文件修改 | 命令执行 | 适用场景 |
|---|---|---|---|
| `default`（别名 `manual`） | 逐次询问 | 逐次询问（只读命令免问） | 敏感改动、生产相关 |
| `acceptEdits` | 自动批准 | 读写类自动，其他仍问 | 已定方案，连续改代码 |
| `plan` | 不落手，只出方案 | 不落手 | 动手前先规划 |
| `auto` | 分类器判定 | 分类器判定 | 长任务自动化 |
| `dontAsk` | 拒绝 | 仅预批准的工具 | CI / 锁定环境 |
| `bypassPermissions` | 直接执行 | 直接执行 | 仅限容器 / 一次性虚拟机 |

- 切换：`Shift+Tab` 循环，或 `claude --permission-mode plan` 启动，或 settings 里 `"permissions": { "defaultMode": "plan" }`。
- 2.1.200 起 `default` 在界面上显示为 manual 模式（`⏸ manual mode on`），两个名字都被接受。
- 规则语法（写在 settings.json）：
```json
{
  "permissions": {
    "allow": ["Bash(pnpm test)", "Bash(pnpm run *)", "Read(src/**)"],
    "deny": ["Bash(rm -rf *)", "Read(.env*)", "Bash(./scripts/deploy.sh)"],
    "ask": ["Bash(git push *)"]
  }
}
```
- `allow` 免问、`deny` 直接拒绝、`ask` 强制询问（即使模式本来允许）。
- **2.1.214 起的破坏性变化（重点讲）**：单段目录规则只匹配当前工作目录下那一层。`Edit(src/**)` 现在只匹配 `<cwd>/src` 下的文件；要任意深度必须写 `Edit(**/src/**)`。`deny` / `ask` 规则仍保持任意深度匹配。
- 受写保护的路径（默认会拦）：`.git/`、`.claude/`、`.vscode/`、`.idea/`、`.bashrc`、`.zshrc`、`.npmrc`、`.mcp.json`、`.gitconfig`。
- `auto` 模式（2.1.207 起在多数后端免开关可用）：由分类器逐条判断；显式写的 `ask` / `deny` 规则仍然强制生效。默认拒绝约 30 类高危动作（`curl | bash`、生产部署、强制删除、泄露密钥、force push 等）。启用：`"permissions": { "defaultMode": "auto" }`。
- `/permissions` 可交互查看和增删规则，并能看到最近被分类器拒掉的操作。
- 权限决策类型：`allow` / `deny` / `ask` / `defer`。
- 会话内对文件编辑选「不再询问」只持续到会话结束；对 git 仓库和脚本的选择会永久保存。

## F. 模型与上下文预算

| 别名 | 说明 |
|---|---|
| `opus` | 最强，成本最高 |
| `sonnet` | 均衡，当前默认，原生 1M 上下文（2.1.197 起） |
| `haiku` | 快且便宜 |
| `fable` | 新增模型 |

- 切换：启动加 `--model sonnet`，会话内 `/model opus`，或 settings 里 `"model": "claude-sonnet-5"`。
- effort 级别：`low` / `medium` / `high` / `xhigh` / `max`（另有 `ultracode`，2.1.195 起，代码专用最大档）。`/effort high` 或 `--effort high`，settings 里 `"effortLevel"`。
- 扩展思考：`/thinking on` 切换，settings 里 `"alwaysThinkingEnabled"`。思考按输入 token 计费。
- 快速模式：`/fast on`，速度约 2.5 倍、单价更高，默认跨会话保持。**不写死单价**，让学员在自己账号计费页看。
- 可用模型白名单：settings 里 `"availableModels": ["sonnet", "haiku"]`，配 `"enforceAvailableModels": true` 可禁止命令行覆盖。
- 上下文管理：
  - `/context` 看占用构成（系统提示、记忆、环境信息、MCP 工具、消息历史）。
  - `/compact [指令]` 压缩，可带指令指定保留重点；触发 `PreCompact` / `PostCompact` hook。
  - 自动压缩默认开启，`"autoCompactEnabled": false` 或环境变量 `DISABLE_AUTO_COMPACT=1` 关掉。
  - 压缩后项目根 CLAUDE.md 会被重新注入，**子目录 CLAUDE.md 不会自动恢复**。
  - `/clear` 直接清空重开——很多情况下比反复 compact 更划算，写作时要给出「什么时候该 clear 而不是 compact」的判断标准。
  - `/rewind` 回退代码与对话到检查点（文件检查点由 `"fileCheckpointingEnabled"` 控制，默认开）。

## G. 接入 Kimi（独立一节，第 6 节）

**域名现状**：文档站 `platform.moonshot.cn` 已 301 永久跳转到 `platform.kimi.com`；**API 域名仍是 `api.moonshot.cn`**。海外对应 `platform.kimi.ai` / `api.moonshot.ai`。

**兼容端点**：`https://api.moonshot.cn/anthropic`（Claude Code 会自行在其后拼 `/v1/messages`）。不需要任何额外自定义 header。

**在售编程相关模型**（迭代极快，写作时如实给出并说明看 `platform.kimi.com/docs/models`）：

| model id | 上下文 | 定位 |
|---|---|---|
| `kimi-k3` | 1M | 旗舰，多模态 + 编程 + 推理，官方点名适配 Claude Code 这类编程 Agent |
| `kimi-k2.7-code` | 256K | 编程专用 |
| `kimi-k2.7-code-highspeed` | 256K | 编程专用高速版，输出速度约为普通版 5–6 倍 |
| `kimi-k2.6` | 256K | 通用 + 视觉 + Agent |
| `kimi-k2.5` | 256K | Agent / 编程 / 视觉 / 通用 |

（`moonshot-v1-*` 老系列 8 月 31 日全平台下线；`kimi-k2` 系列已于 2026-05-25 下线。）

**官方接入配置（原文，11 个变量，一个都不能少）**

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

Windows（PowerShell）：同样 11 条，语法为 `$env:ANTHROPIC_BASE_URL="..."`。官方**没有**用 `setx`，即只对当前 PowerShell 会话生效。

也可以写进 `~/.claude/settings.json` 的 `env` 字段（官方明确支持）。官方三条警告：settings 的 `env` 会**覆盖**终端里 export 的同名变量；文件里是明文 Key，别提交 git；改完要重启 Claude Code。两种方式**二选一，不要混用**。

**每个变量漏配会怎样（官方逐条说明，写作时必须落成场景）**：
- `ANTHROPIC_MODEL` 不设 → 用 Claude 默认模型名，Kimi 端不认识，报 model not found。
- 四个 `ANTHROPIC_DEFAULT_*_MODEL` 不设 → 对应档位的任务失败（例如 haiku 档负责的后台标题生成、摘要）。
- `CLAUDE_CODE_SUBAGENT_MODEL` 不设 → 子 agent 失败或明显变差。**这就是"主对话一切正常、一派子任务就崩"的根因。**
- `CLAUDE_CODE_AUTO_COMPACT_WINDOW` 必须与模型上下文一致：k3 填 `1048576`，k2.7-code 填 `262144`。不一致会过早压缩丢上下文，或反过来报上下文超限。
- `ENABLE_TOOL_SEARCH` 必须 `false`，Kimi 端点暂不支持，否则工具调用异常。

**`[1m]` 后缀的真相**：这是 Claude Code 客户端侧的扩展上下文标记，官方原文说明发给上游前会被剥掉，所以 `kimi-k3[1m]` 实际发出去的 model 是 `kimi-k3`。Kimi 文档只要求照抄拼写，没解释含义。

**接入后确实会损失的能力（必须写，否则学员会以为是自己配错）**：
1. Tool Search 不支持，必须关。
2. WebFetch 不可用，报 `temporarily unavailable` 或抓不到内容；与配置无关。变通：手动贴网页内容，或用 MCP 抓取类工具。
3. `/model` 菜单是内置固定别名列表，**永远不会显示 Kimi 模型**。是否生效以 `/status` 为准（应显示 Base URL 和 `kimi-k3[1m]`）。换模型要把所有模型变量一起改。
4. `kimi-k2.7-code`（含 highspeed）**强制思考常开**，必须保持 Thinking on，否则报 `400 invalid thinking: only type=enabled is allowed for this model`。`kimi-k3` 默认开思考不受影响；`kimi-k2.6` 思考可选。
5. 自 2.1.196 起，`ANTHROPIC_BASE_URL` 指向非 `api.anthropic.com` 时 **Remote Control 被禁用**；MCP tool search 默认也被禁用。
6. 快速模式可用性探测与 WebFetch 域名安全检查仍直连 `api.anthropic.com`，不走自定义 base URL。
7. 上游若不提供 `/v1/messages/count_tokens`，Claude Code 退化为本地估算上下文用量。

**Key 与计费**：
- 在 `platform.kimi.com/console/api-keys` 创建，选默认项目。
- 新用户赠 15 元代金券（国内手机号注册，有效期 3 个月），但 **`kimi-k3` 需要先充值（最低 10 元）才解锁，代金券不能用于 K3**。个人用户需先完成实名认证才能在线充值。
- 按 token 计费，输入输出分别计价。限速按累计充值金额分 Tier0–Tier5，Tier0 并发只有 1。**不写死单价**。

**常见报错对照（官方 FAQ）**：

| 现象 | 原因与解法 |
|---|---|
| 401 鉴权失败 | Key 无效；或之前配过 `ANTHROPIC_API_KEY` 没删，两者冲突 |
| model not found | 模型变量拼写错误，检查 `kimi-k3[1m]` 有无多余空格引号 |
| 子 agent / 后台任务报错 | `ANTHROPIC_DEFAULT_HAIKU_MODEL`、`ANTHROPIC_DEFAULT_FABLE_MODEL` 或 `CLAUDE_CODE_SUBAGENT_MODEL` 漏配 |
| 改了配置不生效 | settings.json 里 env 残留覆盖了终端变量；或终端 export 只对当前会话有效；改完要重启 |
| Key 与端点不匹配 | `.cn` 的 Key 必须配 `.cn` 端点 |
| 之前 `/login` 登录过 Claude 账号 | `ANTHROPIC_AUTH_TOKEN` 优先于已保存登录态；用 `/status` 看凭据来源，`/logout` 清除 |
| `400 invalid thinking` | k2.7-code 强制思考，保持 Thinking on；仍不行换 `kimi-k2.6`；k3 无此限制 |

**必须点名的废弃变量**：`ANTHROPIC_SMALL_FAST_MODEL` 官方已标注 DEPRECATED，被 `ANTHROPIC_DEFAULT_HAIKU_MODEL` 取代。网上大量老教程还在教它，照抄会配不上。

**通用原理**（第 6 节收尾讲清，让学员理解不止 Kimi）：Claude Code 走 Anthropic Messages 格式，请求打到 `/v1/messages`，要求上游必须流式返回。`ANTHROPIC_BASE_URL` 就是把这个请求地址顶替掉——任何实现了这套格式的服务都能接。`ANTHROPIC_AUTH_TOKEN` 的值会被加上 `Bearer ` 前缀放进 `Authorization` 头；`ANTHROPIC_API_KEY` 则作为 `X-Api-Key` 头发送、且优先于订阅登录态，这就是 Kimi 要求删掉它的原因。

**Anthropic 的官方立场（原样引用，不要美化）**：官方文档明确写「Anthropic 不背书、不维护、不审计第三方网关产品，也不支持通过任何网关把 Claude Code 路由到非 Claude 模型」。写作时如实交代，并给出务实建议：这条路能用、国内访问顺畅、成本低，但出问题时官方不接。

**不要写进正文的未核实项**：prompt caching / `cache_control` 的具体行为；图片截图输入是否可用；`document` 输入块是否支持；temperature 映射系数。

## H. CLAUDE.md 与记忆系统

加载层级（全部级联进上下文，不互相覆盖，从根到工作目录）：

| 位置 | 作用域 | 加载时机 |
|---|---|---|
| `/etc/claude-code/CLAUDE.md`（或系统对应路径） | 全组织 | 启动 |
| `~/.claude/CLAUDE.md` | 当前用户所有项目 | 启动 |
| 仓库根 `CLAUDE.md` 或 `./.claude/CLAUDE.md` | 项目团队（提交 git） | 启动 |
| `CLAUDE.local.md` | 当前用户当前项目 | 启动 |
| 子目录 `<subdir>/.claude/CLAUDE.md` | 该子目录 | **按需**，读到该目录文件时才加载 |

- `@import` 语法：正文里写 `@docs/guidelines.md` 或 `See @README.md for setup`。相对路径相对于所在文件，`~/` 开头为绝对路径。最多递归 4 层。代码块内的 `@xxx` 会被跳过，不会误当导入。
- `/init` 分析代码库生成初始 CLAUDE.md；已存在则提改进建议，不覆盖。会读取并整合 Cursor（`.cursorrules`）、Copilot（`.github/copilot-instructions.md`）等已有规则文件。
- `.claude/rules/*.md` 支持按路径条件加载，frontmatter 写：
```yaml
---
paths:
  - "src/app/api/**/*.ts"
  - "prisma/**"
---
```
- 自动记忆：默认开启，存在 `~/.claude/projects/<项目>/memory/`，启动时加载 `MEMORY.md` 的前 200 行或 25KB，主题文件按需读取。`/memory` 查看编辑，环境变量 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` 关闭。`/compact` 不会清掉它。
- 会话里用 `#` 开头的一句话可直接写入记忆。
- **关键立场**：CLAUDE.md 是**软约束**——它是提示词的一部分，模型可能不遵守。真正的硬约束是 settings.json 的权限规则和 hooks。这个区分要讲透，第 7 节与第 4、10 节呼应。

## I. settings.json 配置层级

优先级从高到低：

| 层级 | 位置 | 作用域 | 是否入库 |
|---|---|---|---|
| 管理策略 | `/etc/claude-code/managed-settings.json`（或系统对应路径） | 全组织 | IT 下发，不可覆盖 |
| CLI 参数 | `--model`、`--permission-mode` 等 | 当前会话 | — |
| 本地 | `.claude/settings.local.json` | 当前用户 + 当前项目 | 应 gitignore |
| 项目 | `.claude/settings.json` | 全体协作者 | 提交 git |
| 用户 | `~/.claude/settings.json` | 当前用户全部项目 | 否 |

常用字段（只写这些，别扩写）：`model`、`effortLevel`、`alwaysThinkingEnabled`、`availableModels`、`enforceAvailableModels`、`permissions`（`defaultMode` / `allow` / `deny` / `ask`）、`env`、`hooks`、`autoMemoryEnabled`、`autoCompactEnabled`、`fileCheckpointingEnabled`、`editorMode`（`normal` / `vim`）、`autoUpdatesChannel`、`minimumVersion`、`disableAllHooks`、`allowedMcpServers`。

顶部可加 `"$schema": "https://json.schemastore.org/claude-code-settings.json"` 获得编辑器补全。

**优先级细节**：同一个变量既在 shell 里 export 又在 settings 的 `env` 里写了，**settings 里的值生效**；`env` 中的变量优先于同名 settings 字段（如 `ANTHROPIC_MODEL` 覆盖 `model`）。

## J. 自定义命令 / Skills

- 位置：`.claude/skills/<名>/SKILL.md`（当前形态）或 `.claude/commands/<名>.md`（旧式单文件，仍可用）；用户级放 `~/.claude/skills/`；插件带的放插件 `skills/`。
- 调用：`/<名>`；插件内的为 `/插件名:技能名`。子目录形成命名空间，如 `.claude/skills/admin/reset/SKILL.md` → `/admin:reset`。
- frontmatter 字段：
```yaml
---
description: "给 /help 看的一句话说明"
argument-hint: "<分支名> <环境>"
disable-model-invocation: false
allowed-tools: ["Read", "Bash(pnpm *)"]
model: "claude-haiku-4-5"
effort: "low"
---
```
- 参数占位：`$ARGUMENTS`（整串）、`$1` `$2`（位置参数）、`$0`（技能名）。
- 正文里 `!命令` 内联执行 bash 并把输出带进上下文；`@路径` 引入文件内容。
- `disable-model-invocation: true` 表示只能用户手打 `/名` 调用，模型不会自动用。默认情况下模型会依据 description 自动挑选相关技能。
- **延迟加载**：技能正文只在被用到时才进上下文，所以装一堆也不心疼——这是它和直接把内容写进 CLAUDE.md 的最大区别。

## K. Subagent 与并行

- 定义文件：`.claude/agents/<名>.md`（项目级）或 `~/.claude/agents/<名>.md`（用户级），插件也可携带。
- frontmatter：
```yaml
---
name: "schema-reviewer"
description: "审查 Prisma schema 变更与迁移安全性"
model: "claude-sonnet-5"
tools: ["Read", "Grep", "Bash(pnpm prisma *)"]
memory: true
---
```
- 核心价值：**独立上下文**。subagent 有自己的 context window 和系统提示，只把摘要回传主对话，详细过程不占主会话上下文。
- 权限继承父会话，frontmatter 里写权限模式会被忽略（2.1.212 起 Task 工具的 `mode` 参数也被忽略）。
- 工具受 `tools` 字段限制。
- `/agents` 打开 agent 视图查看与管理。
- **2.1.212 起 subagent 默认不再生成嵌套 subagent**，需要更深层要设 `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=2`。
- **2.1.212 起 `/fork` 语义变了**：现在是「把当前会话复制成一个后台会话」，不再是会话内 subagent；会话内委托改用 `/subtask`。
- 后台：`claude --bg "任务描述"` 启动后台 agent，或会话内 `Ctrl+B` 把当前任务转后台，`/agents` 查看，`Ctrl+X Ctrl+K` 全停。
- worktree：`claude -w [名]` 为本次会话新建 git worktree，实现同一仓库多条线并行互不干扰。
- **写作重点**：要给出「什么时候真该派 subagent」的判断标准——广度搜索、独立可并行的大任务值得派；三五个文件读一读、简单验证不值得，派了反而更慢更贵。

## L. Hooks

- 配置位置：项目 `.claude/settings.json` 或用户 `~/.claude/settings.json` 的 `"hooks"` 字段；插件放 `hooks/hooks.json`。
- **只详细讲这 6 个高频事件**，其余用一句话带过「还有二十多个覆盖会话、压缩、任务、配置变更等时机」：

| 事件 | 触发时机 | 能否阻断 |
|---|---|---|
| `SessionStart` | 会话开始或恢复 | 否 |
| `UserPromptSubmit` | 用户提交提示时 | 能 |
| `PreToolUse` | 工具调用前 | 能 |
| `PostToolUse` | 工具成功后 | 能 |
| `Stop` | Claude 结束一次回复 | 能 |
| `SessionEnd` | 会话结束 | 否 |

（可提及但不展开：`PermissionRequest`、`PreCompact` / `PostCompact`、`SubagentStart` / `SubagentStop`、`FileChanged`、`Notification`。）

- matcher 语法：`"*"` 或省略匹配全部；只含字母数字下划线连字符空格逗号竖线时按精确名或列表匹配（如 `Bash`、`Edit|Write`）；含其他字符时按 JavaScript 正则处理（如 `^Notebook`、`mcp__.*`）。
- 不同事件的 matcher 匹配对象不同：工具类事件匹配工具名；`SessionStart` 匹配来源（`startup` / `resume` / `clear` / `compact`）；`SessionEnd` 匹配原因；`SubagentStart` / `SubagentStop` 匹配 agent 类型。
- hook 收到的输入 JSON 字段：`session_id`、`transcript_path`、`cwd`、`permission_mode`、`hook_event_name`，工具类事件另有工具名与入参。
- 退出码语义（**最重要，务必讲清**）：

| 退出码 | 含义 |
|---|---|
| `0` | 成功。解析 stdout 的 JSON，输出可加进上下文 |
| `2` | **阻断**。忽略 stdout，stderr 内容作为阻断理由回给模型 |
| 其他 | 非阻断错误，stderr 进调试日志 |

- 结构化输出可返回 `{"continue": false, "stopReason": "..."}` 停止；`PreToolUse` 可返回 `permissionDecision` 为 `allow` / `deny` / `ask` / `defer`。
- hook 类型：`command`（跑脚本）、`http`（打到本地服务）、`prompt`（用一句提示让模型判断）、`agent`（派 agent 判断）、`mcp_tool`。
- **2.1.214 起** hook 的 `if:` 条件里单段 `dir/**` 只匹配 `<cwd>/dir`，与权限规则的变化同源。
- 应急开关：settings 里 `"disableAllHooks": true`。
- **写作场景**：给 `signup-app` 写一个 `PreToolUse` hook，拦住任何试图执行 `scripts/deploy.sh` 或 `prisma migrate reset` 的命令，退出码 2 + stderr 说明理由；再给一个 `PostToolUse` hook，在改完 `.ts` 文件后自动跑 `pnpm lint --fix`。

## M. MCP

- 添加（本机实测的确切形式）：
```bash
claude mcp add --transport http sentry https://mcp.sentry.dev/mcp
claude mcp add --transport http corridor https://app.corridor.dev/api/mcp --header "Authorization: Bearer ..."
claude mcp add my-server -e API_KEY=xxx -- npx my-mcp-server
claude mcp add my-server -- my-command --some-flag arg1
```
  即 `claude mcp add [options] <名字> <命令或URL> [参数...]`，stdio 用 `--` 分隔子进程参数，`-e` 传环境变量；HTTP/SSE 用 `--transport`。
- 其他子命令（本机实测）：`add-json`、`add-from-claude-desktop`（仅 Mac 和 WSL）、`get`、`list`、`remove`、`login`、`logout`。
- 作用域：项目级 `.mcp.json`（提交 git，团队共享）、用户级写入 `~/.claude.json`。
- `.mcp.json` 结构：
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
- 未批准的 `.mcp.json` server 在 `claude mcp list` / `get` 中显示为「⏸ Pending approval」，不会连接；已批准的会做健康检查。
- OAuth：`claude mcp login <名>` 走浏览器授权，SSH 环境加 `--no-browser`；`claude mcp logout <名>` 清凭据。
- 会话内 `/mcp` 查看与管理连接。
- 工具命名规则：`mcp__<server>__<tool>`，如 `mcp__postgres__query`；插件内嵌的为 `mcp__plugin_<插件>_<server>__<tool>`。这个命名可以直接写进权限规则做管控。
- MCP 工具同样走权限系统，可以在 `deny` 里精确禁掉某个外部工具。

## N. 插件

- 一个插件可以打包：skills、agents、hooks、MCP server、LSP server、可执行文件、settings。
- 目录结构：`.claude-plugin/plugin.json` + `skills/` + `agents/` + `hooks/hooks.json` + `.mcp.json` 等。
- 管理命令（本机实测）：`claude plugin install <名>`、`list`、`enable`、`disable`、`details`（看组件清单与预计 token 开销）、`init`（脚手架）、`marketplace`。
- 本地开发调试：`claude --plugin-dir ./my-plugin`。
- 插件内技能调用带命名空间前缀 `/插件名:技能名`。

## O. 非交互与自动化

- `claude -p "..."` 打印后退出；配 `--output-format json` 得结构化结果，`--output-format stream-json` 流式。
- 预批准工具：`--allowedTools "Bash(pnpm test) Read Edit"`；CI 里配 `--permission-mode dontAsk` 或 `acceptEdits`。
- 成本与轮数护栏：`--max-turns`、`--max-budget-usd`。
- 一致性：CI 里建议加 `--bare` 或 `--settings` 显式指定配置，避免机器上的个人配置影响结果。
- 后台 agent：`claude --bg`，用 `claude agents` 管理。
- 长期 token：`claude setup-token`（需订阅账号）。
- **写作场景**：给 `signup-app` 写一条 CI 里跑的命令，让 Claude Code 审查 PR diff 并输出 JSON，失败则卡住流水线。

## P. 其他可写的点

- 计划模式：`/plan` 或 `--permission-mode plan` 或 `Shift+Tab` 循环进入；只出方案不落手，方案确认后再执行。改陌生代码、动数据库迁移前应当默认先用它。
- `/code-review [级别] [--fix]`：级别 low / medium / high / max，`--fix` 直接把修改应用到工作区。
- `/security-review`：安全向审查。
- `/verify`：端到端跑一遍受影响流程，确认改动真的有效。
- IDE：VS Code 有扩展，JetBrains 有插件（在 IDE 终端内运行）。
- 屏幕阅读器模式：`claude --ax-screen-reader`（2.1.208 起），纯文本渲染。
- vim 模式：settings 里 `"editorMode": "vim"`；2.1.208 起支持 `vimInsertModeRemaps` 把 `jj` 之类映射成 Esc。

---

# 分工

| part | 文件 | 覆盖小节 | 指派 SVG |
|---|---|---|---|
| A | `part-a.md` | 开场 + 1 它到底是什么 + 2 装上并跑通 + 3 一次会话的解剖 | 「一次请求内部发生了什么」：提问 → 读上下文 → 出计划 → 工具循环（读文件/改文件/跑命令，每步经过权限闸门）→ 交付。实线主流程，虚线表示工具循环回到模型 |
| B | `part-b.md` | 4 权限 + 5 模型与上下文预算 + 6 接入 Kimi | 「六种权限模式的松紧谱系」：一条横轴从「全都问」到「全不问」，六个点位标名称，下方标注各自适用场景，两端用暗金/粉色标风险 |
| C | `part-c.md` | 7 让它懂你的项目 + 8 自定义命令 + 9 subagent 与并行 | 「主会话与 subagent 的上下文隔离」：主会话一条粗线，派生出两条独立上下文的分支，分支内部各自装满工具调用，回主线时只有一条细线（摘要）汇入 |
| D | `part-d.md` | 10 hooks + 11 MCP + 12 Skills 与插件 + 13 非交互与自动化 + 14 总结 | 「软约束与硬闸门」：左边 CLAUDE.md（提示词层，虚线，可被绕过）、右边 权限规则 + hooks（执行层，实线，绕不过），中间是模型发起的工具调用穿过两层 |

每个 part 开头**不要**写大标题重复文章名，直接从该 part 第一个 `##` 小节开始（part A 例外，需要写文章 `#` 一级标题和开场段落）。
每个 part 结尾要有一句自然的过渡，接住下一个 part 的主题（part D 例外，以 `## 总结` 收尾）。
小节编号用 `## 4. 权限：把内奸关进门禁` 这种带序号的二级标题，保证四份合并后连续。
