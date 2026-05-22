# script.md — Claude 写 script.json 的规则手册

本文件是 Claude 在 Step 2 生成 `script.json` 时必须遵守的完整规则。规则具有约束力，不允许为了「效果更好」而绕过任何约束。

---

## script.json 结构

```json
{
  "blogger_slug": "string",
  "run_id": "string",
  "target_seconds": 110,
  "speed_chars_per_sec": 5.5,
  "slides": [
    {
      "index": 0,
      "slide_type": "cover",
      "title": "博主名字",
      "subtitle": "一句话定位（可选）",
      "narration": "开场口播文案，2-3句话",
      "bullets": [],
      "quote": "",
      "source": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "extra": "",
      "duration_estimate_s": 8.0
    }
  ]
}
```

顶层字段说明：

| 字段 | 类型 | 描述 |
|------|------|------|
| `blogger_slug` | string | 从 outline.json 复制 |
| `run_id` | string | 从 outline.json 复制 |
| `target_seconds` | number | 目标总时长秒数，默认 110 |
| `speed_chars_per_sec` | number | 语速常数，固定 5.5，不可修改 |
| `slides` | array | 幻灯片数组，7-9 项 |

---

## 幻灯片类型规则

| slide_type | 必填字段 | 时长建议 | 用途 |
|-----------|---------|---------|------|
| `cover` | `title`, `narration` | 6-8s | 开场（博主名 + 核心定位） |
| `stats` | `title`, `narration`, `bullets`（3个数字条目） | 8-10s | 数据亮点（粉丝/获赞/作品数 + 经济模式） |
| `quote` | `narration`, `quote`, `source` | 12-16s | 放大金句（博主代表性原话） |
| `bullets` | `title`, `narration`, `bullets`（3-4条） | 14-18s | 要点（选题策略/可借鉴动作/变现方式等） |
| `compare` | `title`, `narration`, `compare_before`, `compare_after` | 14-18s | 对照（早期 vs 近期，弱点 vs 建议） |
| `cta` | `narration` | 6-8s | 结尾（引导关注 Weelume） |

**非必填字段在不适用的 slide_type 中必须设置为空字符串 `""` 或空数组 `[]`，不允许省略字段。**

---

## 幻灯片顺序规则

1. **第 1 张必须是 `cover`**，`index` = 0。
2. **最后一张必须是 `cta`**，`index` = N-1。
3. 中间 5-7 张推荐顺序（可根据内容调整，但必须合理）：

```
[cover]
  stats          — 数据快照，建立量级认知
  quote          — 第一个金句，建立情感共鸣
  bullets        — 核心打法（选题策略或内容方法论）
  compare 或 bullets  — 对照或可借鉴动作
  quote          — 第二个金句（风险提示或精华浓缩）（可选）
[cta]
```

4. 同一个 `slide_type` 可以出现多次（例如 2 个 `bullets`，2 个 `quote`），但 `compare` 最多出现 1 次，`stats` 最多出现 1 次，`cover` 和 `cta` 各只能出现 1 次。

---

## 口播脚本（narration）规则

### 规则 1：口语化

不要书面语，像在对话里说话。

| 禁止 | 建议替换 |
|------|---------|
| 该博主 | 他 / 她 |
| 受众群体 | 看他视频的人 |
| 内容矩阵 | 他做的这些视频 |
| 变现路径 | 怎么赚钱 |
| 深度运营 | 用心做内容 |
| 赋能 | 帮助 |
| 闭环 | 形成完整链路（或直接避免该词） |
| 私域 | 粉丝群 / 私人渠道 |

### 规则 2：节奏感

- 每句话不超过 18 字。
- 多用短句，遇到需要停顿的地方用逗号或句号分断。
- 不用分号，不用冒号，不用括号。

### 规则 3：字数硬约束

**所有 slide 的 `narration` 总字数 ≤ `target_seconds × speed_chars_per_sec`**

默认 `110 × 5.5 = 605 字`。

- 超过 605 字时，必须削减 narration 内容，不允许通过增大 `target_seconds` 来规避约束。
- 每写一张幻灯片，在脑内估算当前累计字数，避免后期被迫大量删减。
- 建议分配：cover 35字、stats 45字、quote 60字、bullets 70-80字、compare 70-80字、cta 30字。

### 规则 4：narration 与幻灯片内容的关系

- `narration` 是**口播配音文案**，是说给观众听的话，不是幻灯片上显示的内容。
- 幻灯片上显示 `title`、`bullets`、`quote`，口播要**解释和引导**它们，但不能**照读**。
- 例如，幻灯片上显示「月涨粉 5 万」，口播可以说「他最猛的一个月，新来了 5 万人」，而不是「月涨粉 5 万」。

### 规则 5：禁词列表

以下词语在 narration 中**禁止使用**：

- 深度运营
- 矩阵
- 赋能
- 闭环
- 私域
- 该博主
- 受众
- 内容生态
- 变现路径

### 规则 6：CTA 文案规范

最后一张 `cta` 的 `narration` 固定格式，**必须**使用以下句子（允许在前面加 1 句过渡语，但末尾这句不可修改）：

```
更多博主拆解，关注 Weelume，我们研究真实的博主增长。
```

例如可以写成：

```
以上就是这次拆解的核心。更多博主拆解，关注 Weelume，我们研究真实的博主增长。
```

---

## duration_estimate_s 计算规则

每张幻灯片的时长估算公式：

```
duration_estimate_s = round(len(narration) / speed_chars_per_sec, 1)
```

- `len(narration)` 是 narration 字符串的 Unicode 字符数（含标点符号）。
- `speed_chars_per_sec` = 5.5（固定常数）。
- 保留一位小数。

所有幻灯片的 `duration_estimate_s` 之和必须满足：

```
sum(duration_estimate_s) ≤ target_seconds + 5
```

（允许 5 秒超量余量）

---

## stats 幻灯片的 bullets 格式

`stats` 类型的 `bullets` 数组必须恰好有 3 项，每项格式为：

```
"<数字值>|<标签>"
```

例如：

```json
"bullets": [
  "128.5万|粉丝",
  "3200万|获赞",
  "487条|作品"
]
```

其中 `<数字值>` 直接来自 `outline.json` 的 `stats` 字段，`<标签>` 为对应的中文说明。

Python render 命令会将这 3 条分别注入 `slide-stats.html.tmpl` 的 `{{stat_1_value}}`/`{{stat_1_label}}` 等占位符。

---

## quote 幻灯片的字段规范

- `quote`：博主原话，直接来自 `outline.json` 的 `top_quotes[n].text`，不可改写（可适度截短，但不可改义）。
- `source`：来源标注，格式为 `「<章节标题>」`，从 `top_quotes[n].source_chapter` 对应到 `chapters` 数组中找到 `title` 拼接而成。

---

## compare 幻灯片的字段规范

- `compare_before`：对应「早期状态」或「当前弱点」，≤80 字。
- `compare_after`：对应「近期变化」或「改进建议」，≤80 字。
- 来源：从 chapters 中找到最适合做对照的章节（通常是「成长轨迹」「可改进空间」「对标建议」等章节）。

---

## 从 outline.json 到 script.json 的映射建议

| script.json 幻灯片 | outline.json 数据来源 |
|-------------------|----------------------|
| `cover`.title | `stats.display_name` |
| `cover`.subtitle | 从 chapters 中提炼一句话定位 |
| `cover`.narration | 围绕 `verdict` 展开 |
| `stats`.bullets | `stats.followers/likes/works_count` |
| `stats`.extra | 从 chapters 中找变现模式描述 |
| `quote[0]`.quote | `top_quotes[0].text` |
| `bullets`.bullets | 从 chapters 中选核心打法章节的 bullets |
| `compare`.before/after | 从 chapters 中选成长/建议章节 |
| `quote[1]`.quote | `top_quotes[1].text`（若存在） |

---

## 完整 script.json 示例（7张版）

```json
{
  "blogger_slug": "zhang-san-fitness",
  "run_id": "20260115-143022",
  "target_seconds": 110,
  "speed_chars_per_sec": 5.5,
  "slides": [
    {
      "index": 0,
      "slide_type": "cover",
      "title": "张三健身",
      "subtitle": "上班族减脂博主",
      "narration": "今天拆解一个做上班族减脂的博主。他不是教练，但粉丝比很多教练多。为什么？",
      "bullets": [],
      "quote": "",
      "source": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "extra": "",
      "duration_estimate_s": 7.3
    },
    {
      "index": 1,
      "slide_type": "stats",
      "title": "账号数据",
      "subtitle": "",
      "narration": "先看数据。128 万粉丝，获赞 3200 万，487 条视频。平均每条视频带来 6.5 万赞，这个比率在健身赛道算相当高。",
      "bullets": ["128.5万|粉丝", "3200万|获赞", "487条|作品"],
      "quote": "",
      "source": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "extra": "知识付费课程 + 品牌合作",
      "duration_estimate_s": 9.3
    },
    {
      "index": 2,
      "slide_type": "quote",
      "title": "",
      "subtitle": "",
      "narration": "他说过一句话，我觉得说清楚了他为什么能做起来。",
      "bullets": [],
      "quote": "我不是教练，我只是比你早踩了两年坑。",
      "source": "「账号定位与人设构建」",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "extra": "",
      "duration_estimate_s": 9.8
    },
    {
      "index": 3,
      "slide_type": "bullets",
      "title": "核心选题打法",
      "subtitle": "",
      "narration": "他的选题有三个不变的规律。第一，从自己真实失败里找选题。第二，标题都是疑问句，逼你点进去。第三，每条视频都有一个可以马上做的动作。",
      "bullets": [
        "真实失败经历驱动选题，比「教程」更容易被搜到",
        "标题用疑问句 + 场景词，点击率高 40%",
        "每条视频结尾给一个「今天就能做」的行动"
      ],
      "quote": "",
      "source": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "extra": "",
      "duration_estimate_s": 16.0
    },
    {
      "index": 4,
      "slide_type": "compare",
      "title": "早期 vs 近期",
      "subtitle": "",
      "narration": "看他的变化。早期内容很杂，什么都做。后来果断收窄，只做减脂。这一刀切得很准，粉丝增速从这里开始翻倍。",
      "bullets": [],
      "quote": "",
      "source": "",
      "frame_ref": "",
      "compare_before": "早期：泛健身内容，涵盖增肌、减脂、拉伸多个方向，定位模糊",
      "compare_after": "近期：只做上班族减脂，内容密度高，搜索流量占比超 60%",
      "extra": "",
      "duration_estimate_s": 12.7
    },
    {
      "index": 5,
      "slide_type": "bullets",
      "title": "可借鉴的动作",
      "subtitle": "",
      "narration": "如果你也在做垂直内容，有三件事可以直接抄。",
      "bullets": [
        "每季度公布一次真实数据，建立信任感",
        "用搜索工具找「上班族 + 痛点」组合关键词",
        "把观众留言里的失败故事变成下一条视频选题"
      ],
      "quote": "",
      "source": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "extra": "",
      "duration_estimate_s": 13.3
    },
    {
      "index": 6,
      "slide_type": "cta",
      "title": "",
      "subtitle": "",
      "narration": "以上就是这次拆解的核心。更多博主拆解，关注 Weelume，我们研究真实的博主增长。",
      "bullets": [],
      "quote": "",
      "source": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "extra": "",
      "duration_estimate_s": 6.5
    }
  ]
}
```

此示例总 narration 字数约 374 字，总时长估算约 74.9 秒，均在约束范围内。

---

## 校验清单（写完后自查）

在 Write 生成 script.json 之前，Claude 必须按以下清单自查：

- [ ] 第一张是 `cover`，最后一张是 `cta`
- [ ] 共 7-9 张
- [ ] 所有 narration 总字数 ≤ 605 字（手动估算）
- [ ] 所有 `duration_estimate_s` 之和 ≤ 115 秒
- [ ] stats 的 bullets 恰好 3 项，格式为 `"值|标签"`
- [ ] quote 的 `quote` 字段来自 outline.json，未改写原意
- [ ] cta 的 narration 以「更多博主拆解，关注 Weelume，我们研究真实的博主增长。」结尾
- [ ] 禁词列表中的词语均未出现在 narration 中
- [ ] 所有字段均已填写（非必填字段设为 `""` 或 `[]`）
