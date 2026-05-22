---
name: douyin-video-breakdown
description: 单条抖音爆款视频深度拆解 skill。用户给一条视频 URL，本 skill 编排 Bash 调用 research-kit Python CLI 采集（视频下载 + 关键帧 + 转录），然后用《微域生光自媒体运营实战》方法论体系做 5 章深度拆解，写出一份 HTML 全景报告。触发词：抖音视频拆解、爆款视频拆解、单视频分析、拆解这条视频、douyin-video-breakdown、视频拆解。
---

# 抖音爆款视频深度拆解

输入：一条抖音视频 URL（分享链接 / 完整链接 / v.douyin.com 短链）。
输出：一份 HTML 单视频拆解报告，覆盖文案结构、视觉画面、爆款因素、可复用模板 5 个维度。

产物路径：
- `research-kit/output/videos/<aweme_id>/report.html` — 完整拆解报告（纯文字，不内嵌图片）
- `research-kit/output/videos/<aweme_id>/index.json` — skill 运行摘要

---

## 编排总览

```
用户输入：单条抖音视频 URL
   ↓
Step 1 · Bash 调用 video-collect CLI
   uv run research-kit video-collect --url <URL> --workspace-root output/videos
   产物：meta.json / 1-4.jpg / transcript.txt / index.json
   ↓
Step 2 · Read 读所有素材（含图片），应用 5 章判定框架
   ↓
Step 3 · Write 写出 report.html + index.json（运行摘要）
   ↓
最终：用一句中文总结产出路径
```

---

## Step 1 · Bash 调用 video-collect 采集

### 1.1 确定 workspace 路径

在 `research-kit/` 目录下执行，workspace-root 固定 `output/videos`（相对于 research-kit/）。

```bash
cd research-kit
uv run research-kit video-collect \
  --url "<用户输入的视频 URL>" \
  --workspace-root output/videos \
  --proxy "$HTTPS_PROXY"
```

可选参数：
- `--skip-transcribe`：跳过转录（快速模式，只抓元数据+帧）
- `--keep-video`：保留下载的 video.mp4
- `--frame-count 4`：抽帧数（默认 4）

### 1.2 解析 CLI 输出

CLI stdout 输出 JSON 摘要：

```json
{
  "ok": true,
  "aweme_id": "7423751793017965876",
  "workspace": "D:/code/weelume-base/research-kit/output/videos/7423751793017965876",
  "title": "标题...",
  "duration_seconds": 231.05,
  "frames": 4,
  "transcript_ok": true,
  "failures": []
}
```

解析规则：
- `ok=true` 且 `failures=[]`：正常继续 Step 2。
- `ok=false` 或 `failures` 非空：必须告知用户失败阶段，不得继续生成空报告。
- `transcript_ok=false`：转录失败或视频无语音，Step 2/3 中语言分析降级（只分析画面和能从标题/评论推断的内容）。

记录 `aweme_id` 和 `workspace` 供后续步骤使用。

---

## Step 2 · 读取素材，应用 5 章判定框架

### 2.1 读取文件

```
Read: output/videos/<aweme_id>/meta.json
Read: output/videos/<aweme_id>/transcript.txt
Read images: output/videos/<aweme_id>/1.jpg
Read images: output/videos/<aweme_id>/2.jpg
Read images: output/videos/<aweme_id>/3.jpg
Read images: output/videos/<aweme_id>/4.jpg
```

**注意**：图片用 Claude 视觉能力直接理解，不要把 CDN URL 填到任何地方。

### 2.2 meta.json 字段说明

| 字段 | 含义 | 显示规则 |
|---|---|---|
| `title` | 视频标题（含话题标签） | 去掉 `#话题` 标签后作为 `title_clean` |
| `author_name` | 博主昵称 | 直接展示 |
| `author_douyin_id` | 抖音号 | 可能为 null，null 时显示 `—` |
| `duration_seconds` | 视频时长（秒） | 转为 `MM:SS` 格式 |
| `play_count` | 播放量 | 可能为 null；万/亿格式显示 |
| `digg_count` | 点赞数 | 可能为 null；万格式显示 |
| `comment_count` | 评论数 | 可能为 null |
| `share_count` | 分享数 | 可能为 null |
| `create_time` | 发布时间（unix timestamp） | 转为 `YYYY-MM-DD` |

**统计数据显示规则**：
- `>= 1_0000`（1万）：显示「X.X万」
- `>= 1_0000_0000`（1亿）：显示「X.XX亿」
- `< 1_0000`：直接显示数字
- `null`：显示 `—`，单位列留空

**互动率计算**（如 play_count 和 digg_count 都不为 null）：
- 互动率 = `(digg_count / play_count) × 100%`
- `< 3%`：偏低；`3-8%`：正常；`> 8%`：高互动

### 2.3 5 章判定框架

#### #summary · 视频名片（必须填的7个字段）

1. **标题**：`title_clean`（去话题标签）
2. **作者**：`author_name`，抖音号 `@author_douyin_id`
3. **时长**：`MM:SS`
4. **发布时间**：`YYYY-MM-DD`
5. **Stats 矩阵**：播放 / 点赞 / 评论 / 分享（万格式；null 显示 `—`）
6. **互动率**（可选）：若两项数据均可用，计算并标注档位
7. **一句话判断**：「这条视频的核心武器是 <span class="text-shimmer">XXX</span>」

---

#### CH·01 · 文案/脚本结构（#script）

**框架**：小火车模型 = 车头（黄金三秒）→ 车身（中段切片）→ 车尾（落点）

**必须答的问题（5条）**：

1. **车头诊断**：黄金三秒靠什么钩子抓住注意力？属于五开头（怀旧 / 反差 / 悬念 / 观点 / 共鸣）哪类？引用转录里的原始开场句。

2. **叙述结构**：中段走的是五大结构（分类式 / 递进式 / 对比式 / 故事式 / 实验式）哪种？为什么这种结构适合这条视频的内容类型？

3. **信息密度**：每几秒有一个新刺激？属于哪个密度档位（低密度 ≥ 15s/刺激 / 中密度 5-15s / 高密度 ≤ 5s）？

4. **车尾落点**：结尾是什么类型（金句 / 反问 / 悬念 / 反转 / 行动建议 / 留白）？有没有明确 CTA？

5. **脚本骨架模板**：用一句抽象公式概括这条视频的完整句式框架（去掉专有名词，保留结构）。

**引用要求**：至少引用 2 句转录原文支撑分析（transcript.txt 为空时跳过引用，说明原因）。

---

#### CH·02 · 视觉/画面分析（#visual）

**4 帧逐析**（对 1.jpg / 2.jpg / 3.jpg / 4.jpg 逐一或合并归纳）：

**必须答的问题（4条）**：

1. **拍摄方式归类**：口播1.0（固定机位+无剪辑） / 口播2.0（多机位+快剪） / Vlog / 情景剧（角色扮演）？最强的视觉记忆点是什么？

2. **三优先级评估**（音质 > 画质 > 表现力）：哪项最弱？是否影响了观看体验？从转录质量推断收音状况（缺词多 = 收音差）。

3. **字幕风格**：字体大小 / 颜色 / 是否有关键词高亮 / 字幕频次——这套字幕风格是否帮助了内容传播？

4. **改进建议**：如果只改一个画面元素来提升完播率，应该改哪个？说明理由。

---

#### CH·03 · 爆款因素诊断（#viral）

**框架**：8 大爆款元素 × 情绪波点四出口 × 8 种受众心理任务

**8 大爆款元素打分表**（必须生成表格）：

| 元素 | 是否激活 | 激活方式（一句话描述） |
|---|---|---|
| 成本 | ✓ / — | |
| 人群 | ✓ / — | |
| 猎奇 | ✓ / — | |
| 反差 | ✓ / — | |
| 最差 | ✓ / — | |
| 怀旧 | ✓ / — | |
| 荷尔蒙 | ✓ / — | |
| 头牌 | ✓ / — | |

**必须答的问题（5条）**：

1. **核心火种**：8 大元素里哪 1-2 个是这条视频的核心爆款火种？为什么？

2. **情绪波点**：灵感来自四出口哪个象限？
   - 回忆→讲故事 / 行动→晒过程 / 分析→教知识+聊观点 / 愣神→聊观点+讲故事

3. **心理任务**：受众主要拿这条内容完成什么心理任务（主导 1-2 种）？
   - 求安慰 / 求判断 / 求身份认同 / 求避坑 / 求效率 / 求谈资 / 求陪伴 / 求替自己说话

4. **完播曲线推断**：基于钩子强度和切片密度，最弱的完播点在哪个时间段？为什么？

5. **爆款诊断**：为什么这条视频的播放量是现在这个水平？（如数据为 null，基于内容结构做推断性判断）

---

#### CH·04 · 可复用模板提炼（#template）

**必须答的问题（4条）**：

1. **三段模板句式**：
   - 车头模板：`[钩子类型]：[抽象句式]`（例："你以为 X，其实是 Y" = 反差型钩子）
   - 车身骨架：`[结构名] × [节数] × [切片频率]`
   - 车尾公式：`[结语类型] + [CTA类型]`

2. **标题模板**：把原标题去掉专有名词，留下可复用的框架句式。

3. **适用场景**：这套模板适合哪类账号？（行业 / 人设 / 内容类型）复用时必须替换什么、可以保留什么？

4. **复用风险**：哪些元素来自博主的个人禀赋（声音特质 / 脸 / 资源 / 长期积累的信任），直接抄了也没效果？

---

#### CH·05 · 可抄动作清单（#actions）

**三层清单结构**（不得少于总共 6 条）：

**立刻能抄的动作（3-5条）**，每条必须：
- 以动词开头
- 具体到操作层面（能直接执行，不是方向性建议）
- 举例：「用"你以为 X 但其实是 Y"作开场，抓住认知反差受众」

**需要训练才能抄的能力（2-3条）**：
- 说明需要积累什么前提才能做到

**基本抄不了的要素（1-2条）**：
- 说明是哪种个人禀赋或资源壁垒

---

## Step 3 · 生成报告 HTML + index.json

### 3.1 HTML 报告生成

1. 从 `templates/video.html.tmpl` **完整复制骨架**到内存。
2. 替换所有 `{{...}}` 占位符（见模板注释）。
3. 按 5 章框架填写所有 `<!-- TODO(章节): ... -->` 位置的正文内容。
4. 每章末尾的 `qa-card · 必须答的问题` 必须逐条作答，不得留空。
5. Write 写出到：`output/videos/<aweme_id>/report.html`

**关键禁止**：
- 禁止把 meta.json 里的 `cover_url`（抖音 CDN URL）或任何图片 src 放入报告 HTML。报告不包含图片。
- 禁止添加 `<header>` sticky 顶栏或 `<footer>` 页脚。
- 禁止修改 `<head>` 里的 CSS / Tailwind config / 字体定义。

### 3.2 写入 index.json

```json
{
  "skill": "douyin-video-breakdown",
  "skill_version": "0.1.0",
  "run_id": "<RUN_ID>",
  "video": {
    "aweme_id": "<aweme_id>",
    "title": "<原始标题>",
    "title_clean": "<去话题标签的标题>",
    "author_name": "<昵称>",
    "author_douyin_id": "<抖音号 或 null>",
    "duration_seconds": 0.0,
    "play_count": null,
    "digg_count": null,
    "comment_count": null,
    "share_count": null,
    "page_url": "<原始输入 URL>",
    "frames_count": 4,
    "transcript_ok": true,
    "transcription_engine": "FunASR-Nano-2512 via ua-agent backend"
  },
  "report": {
    "path": "report.html",
    "chapters": ["summary", "script", "visual", "viral", "template", "actions"]
  }
}
```

---

## 附录：方法论速查

### 小火车模型
- **车头**：黄金三秒，靠一个钩子不让人划走
- **车身**：若干切片，每片一个价值点，用叙述结构穿起来
- **车尾**：落点 + CTA，给观众一个理由关注/转发

### 五开头类型
怀旧开头 / 反差开头 / 悬念开头 / 观点开头 / 共鸣开头

### 五大叙述结构
分类式 / 递进式 / 对比式 / 故事式 / 实验式

### 8 大爆款元素
成本、人群、猎奇、反差、最差、怀旧、荷尔蒙、头牌

### 情绪波点四出口
回忆→讲故事 / 行动→晒过程 / 分析→教知识+聊观点 / 愣神→聊观点+讲故事

### 8 种受众心理任务
求安慰、求判断、求身份认同、求避坑、求效率、求谈资、求陪伴、求替自己说话

### 三优先级（制作品质）
音质 > 画质 > 表现力
