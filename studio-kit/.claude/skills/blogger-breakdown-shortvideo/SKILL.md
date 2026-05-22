---
name: blogger-breakdown-shortvideo
description: 把博主拆解 14 章 HTML 报告转成 2 分钟以内、竖屏短视频。触发词：博主拆解短视频、博主短视频、把博主拆解做成视频、blogger-breakdown-shortvideo。
---

# blogger-breakdown-shortvideo

把 `research-kit` 已产出的博主拆解 14 章 HTML 报告，自动转成 2 分钟以内的竖屏短视频。

管线：`extract → script（Claude） → tts → render → compose`

---

## Step 0：关键词澄清与路径硬等式

在执行任何步骤之前，**必须**先确认并锁定以下变量。这些是路径硬等式，不允许后续任何 agent 自行解释或推断。

```
report_dir     = <用户提供的绝对路径，该目录下应含 overview.html 或 index.json>
blogger_slug   = <从 report_dir 的父级目录名推断，或从 index.json 的 blogger_id 字段读取>
run_id         = <从 report_dir 目录名推断，或从 index.json 的 run_id 字段读取>
workspace      = D:\code\weelume-base\studio-kit\output\shortvideos\<blogger_slug>\<run_id>
voice_sample   = D:\code\weelume-base\studio-kit\assets\voice-samples\default-zh.wav （可选覆盖）
target_seconds = 110 （可选覆盖）
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

## Step 2：读取 agents/script.md 指南，写 script.json

先读取脚本写作规则：

```
Read: D:\code\weelume-base\studio-kit\.claude\skills\blogger-breakdown-shortvideo\agents\script.md
```

再读取上一步产出的 outline：

```
Read: <workspace>\outline.json
```

**根据 script.md 的规则和 outline.json 的内容，直接 Write 生成 `<workspace>\script.json`**，要求：

- 共 7-9 张幻灯片（具体张数由内容决定，不可低于 7 张，不可高于 9 张）
- 所有 slide 的 `narration` 总字数 ≤ `target_seconds × 5.5`（默认 605 字）
- `slide_type` 顺序约束：
  - 第 1 张必须是 `cover`
  - 最后一张必须是 `cta`
  - 中间 5-7 张建议顺序：`stats → quote → bullets → compare 或 bullets → quote → cta`
- 每张幻灯片的 `duration_estimate_s = len(narration) / 5.5`（保留一位小数）
- 所有 `duration_estimate_s` 之和 ≤ `target_seconds + 5`（允许 5 秒余量）

写入完成后，运行校验命令：

```bash
uv --directory D:\code\weelume-base\studio-kit run studio-kit script \
  --validate \
  --script <workspace>\script.json
```

若校验失败，读取错误信息，修正 `script.json` 后重新校验。确认校验通过后再进入 Step 3。

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
