---
name: blogger-breakdown-xhs
description: 把博主拆解 14 章 HTML 报告做成 8 张小红书爆款图文（3:4 1242×1656）。固定结构：封面+钩子+5 章节亮点+CTA。触发词：博主拆解小红书、博主图文、把博主拆解做成小红书、blogger-breakdown-xhs。
---

# blogger-breakdown-xhs

把 `research-kit` 已产出的博主拆解 14 章 HTML 报告，自动转成 **8 张 3:4 竖版小红书图文（1242×1656 PNG）**。

产物是 8 张可以直接在小红书 PC 端上传的极光黑 PNG，不是视频、不是封面集合，也不是单张长图。本 skill **直接复用** `blogger-breakdown-shortvideo` 的 `studio-kit extract` 命令，**不重写 outline.json**，下游只新增小红书图文相关的渲染与脚本。

**核心约束**：
1. **8 张固定结构**——`00 cover` · `01 hook` · `02-06 point × 5` · `07 cta`，类型、顺序、张数都是硬约束（由 `XhsDoc.cards_must_be_eight` 校验，违反即抛错）。一张都不能多、不能少、不能换位。
2. **只讲博主做对的事 + 怎么放大**——不分析任何短板（信息可能不足以支撑判断）。和短视频版同一条铁律，原因相同：拆解视角必须是"他踩中了什么"，不是"他还差什么"。
3. **小红书爆款节奏**——封面强吸引（≤14 字主标 + 反共识 hook）、钩子强反差（不是粉丝多就能复制）、章节强洞见（每张 point 一个独立的可截图金句）、CTA 强动作（关注 / 看下一篇）。每张图必须**独立成立**，刷到任意一张都能看懂。
4. **🚦 用户必须确认文案后才能渲染图片**——禁止单方面写完 `script.json` 就直接调渲染命令。Step 2 必须先输出 **3 份不同角度的文案草稿**让用户对比选择，用户明确选定（可附带修正意见）后才能 Write `script.json` 并进入 Step 3。**这条没有例外**，即使用户说"你看着办"也必须先出 3 份让 ta 选。
5. **强品牌约束**——可见层只能出现「微域生光」中文四字。**禁止** `weelume.com`、英文品牌、任何域名、任何外链文字（小红书审核会压制带外链的图文）。这条同时是文案 Agent 的硬约束和渲染器的硬约束。

管线（带用户确认卡点）：

```
Step 1 extract             (自动，复用 shortvideo 同款命令)
   ↓ outline.json
Step 2.2 三份草稿           (自动起草，A·方法论 / B·心路 / C·数据)
   ↓
Step 2.3 ⏸️ 用户确认        (强制人工卡点，没确认禁止往下)
   ↓
Step 2.4 Write script.json (自动)
   ↓
Step 3 render-xhs           (自动)
   ↓
images/00.png .. 07.png
```

---

## Step 0：关键词澄清与路径硬等式

在执行任何步骤之前，**必须**先确认并锁定以下变量。这些是路径硬等式，不允许后续任何 agent 自行解释或推断。

```
report_dir     = <用户提供的绝对路径，该目录下应含 overview.html 或 index.json>
blogger_slug   = <从 report_dir 的父级目录名推断，或从 index.json 的 blogger_id 字段读取>
run_id         = <从 report_dir 目录名推断，或从 index.json 的 run_id 字段读取>
workspace      = D:\code\weelume-base\studio-kit\output\xhs\<blogger_slug>\<run_id>
kit_root       = D:\code\weelume-base\studio-kit
```

> 注意 `workspace` 与 shortvideo skill 不同：xhs 落在 `output\xhs\...`，shortvideo 落在 `output\shortvideos\...`。即使是同一博主同一 run_id 也**不允许**共用目录，避免 outline.json 之外的产物互相覆盖。

**检查 report_dir 是否存在**：

```bash
# 伪代码——Claude 通过 Read 尝试读取 index.json 验证
Read: <report_dir>\index.json
```

若 `report_dir` 不存在或无法读取 `index.json`，立即报错退出，提示用户检查路径。

若用户未提供 `report_dir`，询问后再继续。确认变量后，在回复中展示锁定的路径表，再开始后续步骤。

---

## Step 1：提取博主信息（复用 shortvideo 同款 extract）

运行 `studio-kit extract` 子命令，从报告目录中提取关键信息，生成 `outline.json`。**这一步与 shortvideo 完全相同，只是 `--out` 落在 xhs workspace 下**。

```bash
uv --directory D:\code\weelume-base\studio-kit run studio-kit extract `
  --report-dir <report_dir> `
  --out <workspace>\outline.json
```

成功后，Read `<workspace>\outline.json`，确认顶层包含以下字段：

- `blogger_slug`
- `run_id`
- `stats`（含 `display_name`、`followers`、`likes`、`works_count`）
- `verdict`（一句话答卷）
- `chapters`（数组，**至少 5 项**——本 skill 强依赖 5 章亮点，少于 5 章必须报错并让用户检查报告完整性）
- `top_quotes`（数组）
- `frame_refs`（数组，可为空，本 skill 不直接消费 frame_refs）

若 `chapters.length < 5`，停止执行，提示用户："小红书 8 张图文强依赖 5 章亮点，当前 outline 只有 N 章。请检查 research-kit 报告是否完整生成。"

---

## Step 2：用户参与的文案设计（3 份草稿 → 用户选 → Write）

> ⛔ **本 Step 是人机协作环节，不是 Claude 单方面执行的环节**。流程必须是：起草 3 份草稿 → **停下来** → 用户选定/修正 → 才能 Write `script.json`。
> ⛔ 哪怕用户说"你直接做""我都行""你选一个"，**仍要**先出 3 份给 ta 看，因为 ta 不知道有多少种角度可选。
> ⛔ 不允许跳过 2.2 / 2.3 直接到 2.4。
> ⛔ 不允许仅基于 outline.json 直接 Write `script.json` 而不出草稿。

### 2.1 顺序读取 3 份指南（缺一不可）

```
Read: D:\code\weelume-base\studio-kit\.claude\skills\blogger-breakdown-xhs\agents\methodology-primer.md
Read: D:\code\weelume-base\studio-kit\.claude\skills\blogger-breakdown-xhs\agents\copywriting.md
Read: <workspace>\outline.json
```

`methodology-primer.md` 必须**先于** `copywriting.md` 读取——文案规则会引用其中的方法论关键词，关键词不熟会写出空话。

同时，Claude 应已经在视觉规格冻结阶段读过 `agents/visual-spec.md` 中的字数限制表，写草稿时必须严格遵守每个字段的字数上限。

### 2.2 给用户 3 份不同角度的文案草稿（强制环节，禁止跳过）

读完 outline 之后，**必须**起草 3 份不同切入角度的小红书图文文案草稿，按以下格式一次性输出给用户对比选择。**不允许只输出 1 份**，也不允许直接 Write `script.json`。

3 份草稿必须显著差异化，**固定**使用以下 3 个角度（每份草稿独立完成 8 张 `XhsCard`，按 `copywriting.md` 的 A/B/C 角度模板写）：

| 草稿 | 角度气质 | 封面 hook 类型 | 5 张 point 的骨架 |
|---|---|---|---|
| 草稿 A · 方法论拆解角 | 用 微域生光 Playbook 关键词作骨架，把博主做法对号入座 | 反共识："不是粉丝多就能复制，是他做对了 X 件事" | 5 个 Playbook 关键词各占 1 张（如 画等号 / 视觉锤 / 选题五方向 / 完播 / 离钱近） |
| 草稿 B · 心路反差角 | 从"他凭什么不是粉丝多就能复制"切入，落到"做对了哪 5 件事" | 心路反差："他粉丝 X 万，但你复制不了的，是 Y" | 5 张分别讲：选了谁 / 拍什么 / 怎么说 / 怎么稳 / 怎么变现 |
| 草稿 C · 数据骨架角 | 从 followers / 章节关键数据切入，"用数据看他怎么做对了" | 数字反差："X 万粉丝、Y 条作品、看完你会发现……" | 5 张分别从一个关键数据展开成 1 个洞见 |

输出格式（每份草稿一次性给到 8 张卡的核心字段概览，**不要写完整 JSON**，让用户对比起来快）：

```markdown
## 草稿 A · 方法论拆解角

- 主线 Playbook 关键词（5 个，每张 point 绑定 1 个）：画等号 / 视觉锤 / 选题五方向 / 完播 / 离钱近
- 封面（00）
  - cover_kicker：「上班族减脂赛道」
  - cover_title 三行："这个博主" / "怎么把 128 万粉丝" / "做成 2C2B 两条变现"
  - blogger_followers："128 万粉丝"
- 钩子（01）
  - hook_kicker：「一句话答卷」
  - hook_big 三行："不是粉丝多" / "就能复制" / "是「他做对了什么」可以学"
  - hook_sub：「下面是他做对的 5 件事」
- 5 张 point（02~06，每张 ≤16 字标题 / ≤60 字解读 / 可选引用）
  - 02 · 画等号：title「选了谁，比拍什么更早决定」/ insight「他把"上班族减脂"画上了等号——这一类人，他全占了」
  - 03 · 视觉锤：title「他自己就是视觉锤」/ insight「没有八块腹肌反而更可信，他长得就像每个加完班的你」
  - 04 · 选题五方向：title「选题只押人和情两路」/ insight「128 条选题里，全在拍人、拍焦虑、拍真实，不教知识」
  - 05 · 完播：title「完播率撑住了算法」/ insight「他每条视频前 3 秒，都有一个反差或数字」
  - 06 · 离钱近：title「变现只走离钱近一路」/ insight「训练营 + 品牌合作，跳过中间所有平台佣金」
- CTA（07）
  - cta_kicker：「看 100 个博主拆解」
  - cta_big 三行："看他怎么走" / "不如先看" / "他在哪里走过"
  - cta_sub：「关注 微域生光，每周拆一个真实跑出来的博主 →」

## 草稿 B · 心路反差角
（同上结构，5 张 point 按"选了谁 / 拍什么 / 怎么说 / 怎么稳 / 怎么变现"骨架）

## 草稿 C · 数据骨架角
（同上结构，5 张 point 每张以一个关键数字开场）
```

3 份输出后，**停下来等用户选**。必须显式问用户：

> 请选择 A / B / C 中的一份作为最终文案。也可以指定一份并提出修改意见，比如"用 A 但 02 换成 B 的角度"。确认后我再生成完整 script.json 并渲染图片。

### 2.3 用户确认 / 修正

- 如果用户回复"用 A"或类似明确选择，进入 2.4。
- 如果用户回复"用 A 但 02 换成…""B 的 03 title 改成…" 等修正意见，按修正意见更新该份草稿，再次输出给用户确认。
- 如果用户回复"3 份都不满意"或"换个角度"，重新设计 3 份新草稿。
- **没有用户明确确认前，禁止 Write `script.json`**。这条没有例外。

### 2.4 Write 最终 script.json

**门禁自检（写之前在内心走一遍）**：

- [ ] 我在上一轮回复中**确实**输出过 3 份草稿吗？（不是只在心里想了 3 个角度）
- [ ] 用户**确实**明确指定了选择某一份吗？（"用 A" / "B 但 02 改成..." 之类）
- [ ] 用户没有说"3 份都不要 / 换角度"？

任一项答 "否"——**回到 2.2 重新输出草稿**，不允许 Write。

通过门禁后，根据 `copywriting.md` 规则把选定草稿展开成完整 `<workspace>\script.json`（schema = `XhsDoc`）。硬约束：

- **cards.length = 8**（由 `XhsDoc.cards_must_be_eight` 在 CLI 侧校验）
- **顺序固定**：
  ```
  index 0: cover
  index 1: hook
  index 2: point   ← 5 张亮点的第 1 张
  index 3: point
  index 4: point
  index 5: point
  index 6: point   ← 5 张亮点的最后一张
  index 7: cta
  ```
- **每张 `index` 必须等于其在数组中的位置**（schema 校验）。
- **`page_label` 统一为 `"NN / 08"` 格式**（cover 可空）：cover 留空、hook=`01 / 08`、point=`02 / 08` ... `06 / 08`、cta=`07 / 08`。
- **`point_no` 必须是 5 张独立的两位编号**：`01` / `02` / `03` / `04` / `05`（不是 03/04/05/06/07，编号是"5 个亮点的序号"，不是页码）。
- **`cta_brand` 固定为 `"微域生光"`**——任何尝试写英文 / 域名 / `weelume` 的字符串，必须立即重写。
- **字数限制**：每个字段严格按照 `agents/visual-spec.md` 表格中的上限（如 `cover_title_line_1 ≤ 10 字`、`point_title ≤ 16 字`、`point_insight ≤ 60 字`、`hook_sub ≤ 24 字` 等）。**禁止**靠模板侧 `text-overflow: ellipsis` 兜底——超字数视为产物失败，必须改写。
- **方法论关键词**：5 张 point 中**至少 3 张**的 `point_title` 或 `point_kicker` 显式嵌入 1 个 `methodology-primer.md` 关键词（精确字符串匹配）。
- **禁词**：与短视频版同步——`短板 / 不足 / 欠缺 / 缺点 / 缺陷 / 做得不好 / 待提升 / 建议他 / 应该 / 可以更好 / 优化空间 / 改进方向` 在任何字段中**禁止**出现。
- **禁出现**：`weelume`、`weelume.com`、`www.`、`http`、`.com`、`.cn` 及任何英文品牌词。

写完后立即 Read 一遍 `<workspace>\script.json`，肉眼校对一次 cards 数组顺序与字数是否合规。任一项不过——重写，不允许跳到 Step 3。

---

## Step 3：渲染 8 张 PNG

把 `script.json` 渲染为 8 张 1242×1656 PNG。

```bash
uv --directory D:\code\weelume-base\studio-kit run studio-kit render-xhs `
  --script <workspace>\script.json `
  --out <workspace>\images
```

成功后，`<workspace>\images\` 下应有 `00.png` ~ `07.png` 共 **8 张**文件，文件名与 `XhsCard.index` 对齐。任一张缺失，停止并报告渲染日志。

---

## Step 4：汇报产物

向用户报告以下产物清单与上传指引：

```
小红书图文 8 张已生成：

workspace = <workspace>
├── outline.json   （Step 1 产出，复用自 shortvideo 同款 extract）
├── script.json    （Step 2.4 用户确认后产出）
└── images/
    ├── 00.png   封面
    ├── 01.png   钩子
    ├── 02.png   亮点 01
    ├── 03.png   亮点 02
    ├── 04.png   亮点 03
    ├── 05.png   亮点 04
    ├── 06.png   亮点 05
    └── 07.png   CTA

上传指引：
- 打开小红书 PC 创作中心，选择「图文笔记」
- 按 00 → 01 → 02 → 03 → 04 → 05 → 06 → 07 的顺序选择 8 张 PNG
- 小红书会保留你的选图顺序作为图文顺序，请勿乱选
- 笔记标题建议使用 00.png 的主标第 1+2 行（已经过爆款句式打磨）
```

---

## 禁止事项

- **禁止跳过 2.2 / 2.3 的 3 份草稿环节**——无论用户怎么说"你定就行"。3 份草稿是产品体验的一部分，不是可选步骤。
- **禁止把英文品牌 / 域名 / `weelume.com` 写进任何字段**——可见层只能"微域生光"。这条同时适用于 `cta_brand`、`cta_sub`、`cover_kicker`、所有 narration 类字段。
- **禁止超字数让模板裁切**——`agents/visual-spec.md` 的字数表是硬上限，超出 1 字都必须由文案 Agent 改写，不允许靠 CSS `text-overflow: ellipsis` 兜底（裁掉视为产物失败）。
- **禁止改变 8 张固定结构**——不允许出现 9 张、7 张、把 point 换成 stats、把 cta 提前等任何变体（CLI 侧 schema 校验会直接拒绝）。
- **禁止分析博主短板**——和短视频版同一条铁律。`copywriting.md` 末尾的反例清单是参考，但不是穷举：任何指向博主自身能力问题的判断都禁止。
- **禁止把 shortvideo 的 `script.json` 直接复用为 xhs 的 `script.json`**——两份 schema 完全不同（`ScriptDoc.slides` vs `XhsDoc.cards`），字段语义也不通用。outline.json 可以复用，script.json 必须分别写。
- **禁止靠"接下来我们看"等口播体写图文文案**——小红书图文是阅读体，不是听觉体，详见 `copywriting.md` 反例清单。
