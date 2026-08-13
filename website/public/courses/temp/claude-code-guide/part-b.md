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

---

到这里，闸门装好了，模型选好了，后端也备好了。但每次开一个新会话，还是得从头交代一遍「这个项目用 pnpm 不用 npm」「迁移必须走 prisma migrate」——这些话说了几十遍，它下一次开会话照样不知道。下一段要解决的就是这件事：怎么让它真正读懂你这个项目。
