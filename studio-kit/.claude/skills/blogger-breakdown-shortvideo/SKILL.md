---
name: blogger-breakdown-shortvideo
description: 把博主拆解 14 章 HTML 报告转成 60-75 秒、抖音爆款节奏的竖屏短视频，强绑定 微域生光 Playbook 运营方法论。触发词：博主拆解短视频、博主短视频、把博主拆解做成视频、blogger-breakdown-shortvideo。
---

# blogger-breakdown-shortvideo

把 `research-kit` 已产出的博主拆解 14 章 HTML 报告，自动转成 **60-75 秒** 的竖屏短视频。

**核心约束**：
1. **强绑定 微域生光 Playbook 方法论**——每条视频围绕 1-2 个支柱组织叙事，口播必须显式说出方法论关键词
2. **只讲博主做对的事 + 怎么放大**——不分析任何短板（信息可能不足以支撑判断）
3. **抖音爆款节奏**——4-5 张幻灯片、60-75 秒、黄金 3 秒钩子、强结尾互动 hook
4. **🚦 用户必须确认文案后才能制作视频**——禁止单方面写脚本就直接进 TTS。Step 2 必须先输出 **3 份不同角度的文案草稿**让用户对比选择，用户明确选定（可附带修正意见）后才能 Write `script.json` 并进入 Step 3。**这条没有例外**，即使用户说"你看着办"也必须先出 3 份让 ta 选。

管线（带用户确认卡点）：

```
Step 1 extract            (自动)
   ↓ outline.json
Step 2.2 三份草稿          (自动起草)
   ↓
Step 2.3 ⏸️ 用户确认       (强制人工卡点，没确认禁止往下)
   ↓
Step 2.4 Write script.json (自动)
   ↓
Step 3-5 tts → render → compose  (自动)
   ↓
final.mp4
```

---

## Step 0：关键词澄清与路径硬等式

在执行任何步骤之前，**必须**先确认并锁定以下变量。这些是路径硬等式，不允许后续任何 agent 自行解释或推断。

```
report_dir     = <用户提供的绝对路径，该目录下应含 overview.html 或 index.json>
blogger_slug   = <从 report_dir 的父级目录名推断，或从 index.json 的 blogger_id 字段读取>
run_id         = <从 report_dir 目录名推断，或从 index.json 的 run_id 字段读取>
workspace      = D:\code\weelume-base\studio-kit\output\shortvideos\<blogger_slug>\<run_id>
voice_sample   = D:\code\weelume-base\studio-kit\assets\voice-samples\default-zh.wav （可选覆盖）
target_seconds = 70 （区间 60-75，不建议覆盖）
kit_root       = D:\code\weelume-base\studio-kit
```

**检查 report_dir 是否存在**：

```bash
# 伪代码——Claude 通过 Read 尝试读取 index.json 验证
Read: <report_dir>\index.json
```

若 `report_dir` 不存在或无法读取 `index.json`，立即报错退出，提示用户检查路径。

若用户未提供 `report_dir`，询问后再继续。确认变量后，在回复中展示锁定的路径表，再开始后续步骤。

---

## Step 1：提取博主信息

运行 `studio-kit extract` 子命令，从报告目录中提取关键信息，生成 `outline.json`。

```bash
uv --directory D:\code\weelume-base\studio-kit run studio-kit extract \
  --report-dir <report_dir> \
  --out <workspace>\outline.json
```

成功后，Read `<workspace>\outline.json`，确认顶层包含以下字段：

- `blogger_slug`
- `run_id`
- `stats`（含 `display_name`、`followers`、`likes`、`works_count`）
- `verdict`（一句话答卷）
- `chapters`（数组，≥1 项）
- `top_quotes`（数组）
- `frame_refs`（数组，可为空）

若字段缺失，报告具体缺失字段，不继续执行后续步骤。

---

## Step 2：用户参与的文案设计（3 份草稿 → 用户选 → Write）

> ⛔ **本 Step 是人机协作环节，不是 Claude 单方面执行的环节**。流程必须是：起草 3 份草稿 → **停下来** → 用户选定/修正 → 才能 Write `script.json`。
> ⛔ 哪怕用户说"你直接做""我都行""你选一个"，**仍要**先出 3 份给 ta 看，因为 ta 不知道有多少种角度可选。
> ⛔ 不允许跳过 2.2 / 2.3 直接到 2.4。

### 2.1 顺序读取 3 份指南（缺一不可）

```
Read: D:\code\weelume-base\studio-kit\.claude\skills\blogger-breakdown-shortvideo\agents\methodology-primer.md
Read: D:\code\weelume-base\studio-kit\.claude\skills\blogger-breakdown-shortvideo\agents\script.md
Read: <workspace>\outline.json
```

`methodology-primer.md` 必须**先于** `script.md` 读取，因为脚本规则会引用其中的方法论关键词。

### 2.2 给用户 3 份不同角度的文案草稿（强制环节，禁止跳过）

读完 outline 之后，**必须**起草 3 份不同主线支柱 / 不同钩子角度的文案草稿，按以下格式一次性输出给用户对比选择。**不允许只输出 1 份**，也不允许直接 Write `script.json`。

3 份草稿必须显著差异化，建议沿以下 3 个角度选择（如果博主信息不支撑某个角度，可换为别的支柱组合，但 3 份仍要可区分）：

| 草稿 | 主线支柱 | 角度气质 | 钩子类型 |
|---|---|---|---|
| 草稿 A · 运营动作派 | positioning + topics/scripts | 拆"他具体做对了什么动作" | 反差钩子（"X，却卖 Y"） |
| 草稿 B · 商业链路派 | monetization + foundations | 拆"他的钱怎么赚的" | 数字钩子（客单 / 收入 / 阶梯数） |
| 草稿 C · 内容工程派 | topics/scripts + growth | 拆"他怎么把内容工业化" | 疑问钩子（"为什么他...?"） |

输出格式（每份草稿 ≤120 字概要，不要写完整 JSON）：

```markdown
## 草稿 A · 运营动作派
- 主线支柱：<篇名 1> + <篇名 2>
- 方法论关键词（narration 会精确说出）：<2-4 个>
- cover 钩子（一句话）："<完整开场首句>"
- hook 大字 / 副标："<8 字内>" / "<≤25 字副标>"
- bullets 核心 3 点：1)<...> 2)<...> 3)<...>
- compare 走向：<早期做对的事> → <现在怎么放大>
- 视频总气质：<2-4 词，如"硬核拆解 / 数字密度高">

## 草稿 B · 商业链路派
（同上结构）

## 草稿 C · 内容工程派
（同上结构）
```

3 份输出后，**停下来等用户选**。必须显式问用户：

> 请选择 A / B / C 中的一份作为最终文案。也可以指定一份并提出修改意见，比如"用 A 但把 hook 换成 B 的数字角度"。确认后我再生成完整 script.json。

### 2.3 用户确认 / 修正

- 如果用户回复"用 A"或类似明确选择，进入 2.4。
- 如果用户回复"用 A 但 hook 改成...""B 的 bullets 第 3 条换成..." 等修正意见，按修正意见更新该份草稿，再次输出给用户确认。
- 如果用户回复"3 份都不满意"或"换个角度"，重新设计 3 份新草稿。
- **没有用户明确确认前，禁止 Write `script.json`**。这条没有例外。

### 2.4 Write 最终 script.json

**门禁自检（写之前在内心走一遍）**：

- [ ] 我在上一轮回复中**确实**输出过 3 份草稿吗？（不是只在心里想了 3 个角度）
- [ ] 用户**确实**明确指定了选择某一份吗？（"用 A" / "B 但 hook 改成..." 之类）
- [ ] 用户没有说"3 份都不要 / 换角度"？

任一项答 "否"——**回到 2.2 重新输出草稿**，不允许 Write。

通过门禁后，根据 `script.md` 规则把选定草稿展开成完整 `<workspace>\script.json`。硬约束：

- **slides.length ∈ [4, 5]**
- **顺序固定**：
  ```
  index 0: cover
  index 1: hook                                  ← 必有，黄金 3 秒视觉冲击
  index 2: bullets 或 compare                     ← 核心成长动作 / 做对放大
  index 3: bullets 或 compare 或 quote (可选)      ← 仅 5 张模式
  index N-1: cta
  ```
- **总字数 ∈ [330, 410]**，每张 `duration_estimate_s = round(len(narration) / 5.5, 1)`
- **总时长 `sum(duration_estimate_s) ∈ [60, 75]`**
- **方法论关键词**：所有 narration 拼起来必须精确匹配至少 1 个 `methodology-primer.md` 关键词，且出现在 bullets 或 compare 的 narration 中
- **黄金 3 秒**：cover 首句必须为疑问 / 反差 / 数字
- **结尾 hook**：cta 之前一张的 narration 末句必须埋互动钩子
- **禁词**：见 `script.md` 规则 5——不出现"短板/不足/欠缺"等任何指向博主自身问题的词
- **compare 字段**：`compare_before` = 早期做对的事，`compare_after` = 现在怎么放大（详见 `script.md`）
- **narration 标点要多**：每个完整子句应在 14 字内有句号 / 逗号断开，便于字幕按标点自然切分（避免一句话被硬切）

### 2.5 校验

```bash
uv --directory D:\code\weelume-base\studio-kit run studio-kit script \
  --validate \
  --script <workspace>\script.json
```

校验通过后，再人工自查 `script.md` 末尾的"校验清单"。若任一项不过，必须重写。**不允许通过删除约束来规避失败。**

确认校验通过后再进入 Step 3。

---

## Step 3：生成 TTS 音频

```bash
uv --directory D:\code\weelume-base\studio-kit run studio-kit tts \
  --script <workspace>\script.json \
  --voice-sample <voice_sample>
```

此命令将为每张幻灯片生成 `<workspace>\audio\slide_<index>.wav`。

若 `voice_sample` 路径不存在，命令会使用静音占位音轨（由 studio-kit 内部处理），不报错退出。

---

## Step 4：渲染幻灯片

```bash
uv --directory D:\code\weelume-base\studio-kit run studio-kit render \
  --script <workspace>\script.json \
  --audio-dir <workspace>\audio
```

此命令将读取 `templates/` 目录下对应 `slide_type` 的 HTML 模板，注入数据，截图为 `<workspace>\slides\slide_<index>.mp4`。

---

## Step 5：合成最终视频

```bash
uv --directory D:\code\weelume-base\studio-kit run studio-kit compose \
  --script <workspace>\script.json \
  --audio-dir <workspace>\audio \
  --slides-dir <workspace>\slides
```

此命令将所有幻灯片视频和音频合流，输出 `<workspace>\final.mp4`。

---

## Step 6：完成

Read `<workspace>\script.json` 取 `slides` 数组长度（N）和所有 `duration_estimate_s` 之和（总时长估算）。

向用户报告：

```
视频已生成：<workspace>\final.mp4

- 视频时长约：X 秒（根据 script.json 估算）
- 共 N 张幻灯片
- 幻灯片顺序：cover → ... → cta

注意：
- 若 voice_sample 不存在，当前使用静音占位音轨，字幕已烧入幻灯片。
- 若要接入真实音色，请提供 D:\code\weelume-base\studio-kit\assets\voice-samples\default-zh.wav，
  然后重新运行 Step 3-5（tts → render → compose）。
```

---

## 错误处理原则

- 任何 Bash 命令返回非零退出码，必须停止管线，读取错误输出，向用户报告具体原因，不自行猜测修复。
- 若 script.json 校验连续失败 2 次，停止并让用户审查 outline.json 内容。
- 不允许跳过任何步骤（例如跳过 tts 直接 render），除非用户明确要求。
- **⛔ 未经用户对 3 份草稿明确选定，禁止 Write `script.json`、禁止启动 TTS / render / compose。** 这条违反不可挽回（会让用户拿到 ta 没选过的脚本和视频），且不在"可猜测修复"范围内。如果发现自己跳过了用户确认，必须立即停止后续动作，回到 Step 2.2 重新出 3 份草稿。
- **方法论关键词缺失**：若 narration 中无法精确匹配到任何 `methodology-primer.md` 列出的关键词，必须重写脚本，**不允许通过**。不要靠"自创术语"或"近义改写"绕开（关键词是精确字符串匹配）。
- **短板叙事检测**：若 script.json 任一字段包含禁词（短板/不足/欠缺/缺点/缺陷/做得不好/待提升/有待加强/建议他/应该/可以更好/优化空间/改进方向），必须重写。
- **时长越界**：若总时长 < 60s，扩写最薄弱 slide 或补一张；若 > 75s，从最不关键的 slide 削减字数；**不允许**通过修改 `target_seconds` 跳过约束。
- **张数越界**：若 slides.length 不在 [4, 5]，必须重写。
