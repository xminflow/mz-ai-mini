# script.md — Claude 写 script.json 的规则手册

本文件是 Claude 在 Step 2 生成 `script.json` 时必须遵守的完整规则。规则具有约束力，不允许为了「效果更好」而绕过任何约束。

---

## script.json 结构

```json
{
  "blogger_slug": "string",
  "run_id": "string",
  "target_seconds": 70,
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
      "hook_big_text": "",
      "hook_sub_text": "",
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
| `target_seconds` | number | 目标总时长秒数，默认 **70**（区间 60-75） |
| `speed_chars_per_sec` | number | 语速常数，固定 5.5，不可修改 |
| `slides` | array | 幻灯片数组，**4-5 项**（不允许低于 4，不允许高于 5） |

---

## 幻灯片类型规则

| slide_type | 必填字段 | 时长建议 | 用途 |
|-----------|---------|---------|------|
| `cover` | `title`, `narration` | 5-7s | 开场（博主名 + 核心定位）；narration 首句必须是疑问/反差/数字 |
| `hook` | `hook_big_text`, `narration` | 3-5s | **黄金 3 秒视觉冲击**——大字（数字/反差短句）+ 1 句口播钩子 |
| `quote` | `narration`, `quote`, `source` | 10-13s | 放大金句（博主代表性原话） |
| `bullets` | `title`, `narration`, `bullets`（3-4条） | 13-18s | 核心成长动作（**至少 1 条要与主线方法论支柱对应**） |
| `compare` | `title`, `narration`, `compare_before`, `compare_after` | 12-16s | **做对的事 → 把它放大**（严禁短板/建议叙事，详见后文 compare 字段规范） |
| `stats` | `title`, `narration`, `bullets`（3个数字条目） | 8-10s | 数据亮点（**60-75s 模式下默认不再使用**；数字冲击交给 hook） |
| `cta` | `narration` | 5-7s | 结尾（引导关注 微域生光） |

**非必填字段在不适用的 slide_type 中必须设置为空字符串 `""` 或空数组 `[]`，不允许省略字段。**

---

## 幻灯片顺序规则

1. **第 1 张必须是 `cover`**，`index` = 0。
2. **第 2 张必须是 `hook`**（黄金 3 秒视觉冲击）。
3. **最后一张必须是 `cta`**，`index` = N-1。
4. 中间 1-2 张从 `bullets` / `compare` / `quote` 中选，强制顺序：

```
[cover]                              ─ index 0
  hook                                ─ index 1，必有
  bullets 或 compare                   ─ index 2，核心成长动作 / 做对放大
  quote 或 compare 或 bullets (可选)    ─ index 3（如果有 5 张）
[cta]                                 ─ index N-1
```

5. 类型出现次数约束：
   - `cover` / `hook` / `cta` 各 **恰好 1 次**
   - `bullets` / `compare` / `quote` 三者**合计 1-2 次**，任意单类型最多 1 次
   - `stats` 在 60-75s 模式下**不使用**（数字冲击交给 hook）
6. **slides.length ∈ [4, 5]**，不允许 3 张以下或 6 张以上。

---

## 爆款三铁律（违反任何一条必须重写）

短视频不是中视频解说。以下三条是把脚本"爆款化"的硬约束，校验失败必须重写，不允许"为了内容完整"绕过。

### 铁律 1：黄金 3 秒钩子

- `cover` 的 `narration` **第一句**必须是**疑问 / 反差 / 数字**三选一。
  - ❌ "今天我们来拆解一个博主"
  - ❌ "这是一个做减脂的博主"
  - ✅ "他不是教练，粉丝却比很多教练多。" （反差）
  - ✅ "128 万粉丝，0 投流，他怎么做到的？" （数字 + 疑问）
- `hook` slide 的 `narration` ≤ 25 字，1 句话；`hook_big_text` 是这句话的视觉锚（一个数字 / 一个反差短句 / 一个疑问 ≤ 8 字）。

### 铁律 2：每 8-10 秒一个转折

- 相邻两张 slide 的 `narration` 之间必须**语义构成转折**，或末句出现转折词：
  "但 / 可是 / 反过来 / 关键在 / 真正原因 / 不是 X，是 Y / 没追 X，他堆 Y"。
- `compare` slide 天然满足此约束（"早期做对的事 → 现在怎么放大"是一次转折）。

### 铁律 3：结尾强 hook

- `cta` **之前一张** slide 的 `narration` 末句必须埋一个**互动钩子**：
  - 评论区互动："评论区告诉我，你最想拆的下一个博主是谁。"
  - 系列预告："下期我们拆同一个赛道的另一个号。"
- `cta` 本身仍保留固定结尾句（见规则 6）。

---

## 方法论强绑定（违反必须重写）

详见 `methodology-primer.md`，本节是脚本侧的执行约束。

1. **Read 顺序必须是**：`methodology-primer.md` → `script.md` → `outline.json`，再写 `script.json`。
2. **写之前先决策**（在回复中告诉用户）：
   - 该博主**做对的核心一件事**是什么？（≤25 字）
   - 这件事对应 Playbook 哪 1-2 个支柱？
   - 我会在哪几张 slide 的 `narration` 中精确说出哪几个方法论关键词？
3. **强制项**：所有 `slides[*].narration` 拼起来必须**精确匹配**至少 1 个 `methodology-primer.md` 中列出的关键词（如 `画等号` / `选题五方向` / `八大爆款元素` / `三层标签` / `完播` / `赛马机制` / `铁粉机制` / `流量经济` / `粉丝经济` / `信任前置` / `收入=流量×变现` / `变现四原则` / `离钱近` / `2C2B` / `4P` / `视觉锤` / `文字钉` / `内容定位三原则` / `选题系列化` / `四型脚本` / `三分拍七分剪` / `目的垂直` 等）。
4. 关键词必须出现在 `bullets` 或 `compare` slide 的 `narration` 中，**不允许只出现在 cover 或 cta**。
5. 不允许只在 `bullets[*]` 字符串里出现术语而 `narration` 中没有（视觉看到、耳朵听不到 = 无效）。

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

### 规则 2：节奏感（同时关系字幕切分质量）

- 每句话不超过 18 字。
- **每个完整子句尽量在 14 字内有句号或逗号断开** —— 字幕按标点自然切分，子句过长会被硬切成无意义短语。
- 多用短句，遇到需要停顿的地方用逗号或句号分断。
- 不用分号，不用冒号，不用括号。
- 反例（违反，会让字幕硬切）："早期他就用反直觉结论加顶部红黄字打开人"（18 字单子句，无逗号）
- 正例："早期他就用反直觉结论，加顶部红黄字，打开人"（每子句 ≤9 字，字幕自然切分）

### 规则 3：字数硬约束

**所有 slide 的 `narration` 总字数 ∈ [330, 410] 字**

公式：`target_seconds × speed_chars_per_sec = 70 × 5.5 = 385 字`，允许 ±25 字浮动。

- 超过 410 字必须削减，不允许通过增大 `target_seconds` 规避（`target_seconds` 默认 70，上限 75）。
- 低于 330 字说明节奏太散，需要补一张 slide 或扩写。
- 4-5 张幻灯片的建议字数分配：

| slide_type | 建议字数 |
|---|---|
| cover | 35-45 字 |
| hook | 15-25 字 |
| bullets | 100-130 字 |
| compare | 80-110 字 |
| quote | 50-70 字（若有） |
| cta | 30-40 字 |

### 规则 4：narration 与幻灯片内容的关系

- `narration` 是**口播配音文案**，是说给观众听的话，不是幻灯片上显示的内容。
- 幻灯片上显示 `title`、`bullets`、`quote`，口播要**解释和引导**它们，但不能**照读**。
- 例如，幻灯片上显示「月涨粉 5 万」，口播可以说「他最猛的一个月，新来了 5 万人」，而不是「月涨粉 5 万」。

### 规则 5：禁词列表

以下词语在 narration 中**禁止使用**：

**AI 感 / 书面语类**：
- 深度运营 / 矩阵 / 赋能 / 闭环 / 私域 / 该博主 / 受众 / 内容生态 / 变现路径

**短板叙事类**（本 skill 不分析任何博主短板，信息可能不足以支撑判断）：
- 短板 / 不足 / 欠缺 / 缺点 / 缺陷 / 问题（指代博主自身问题时禁用）
- 做得不好 / 还需要改进 / 待提升 / 有待加强 / 不够 / 弱项
- 建议他 / 应该 / 可以更好 / 优化空间 / 改进方向

例外：可以说"行业里大多数博主**做不到** X"等不指向当前博主短板的表达。

### 规则 6：CTA 文案规范

最后一张 `cta` 的 `narration` 固定格式，**必须**使用以下句子（允许在前面加 1 句过渡语，但末尾这句不可修改）：

```
更多博主拆解，关注 微域生光，我们研究真实的博主增长。
```

例如可以写成：

```
以上就是这次拆解的核心。更多博主拆解，关注 微域生光，我们研究真实的博主增长。
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
60 ≤ sum(duration_estimate_s) ≤ 75
```

`target_seconds` 默认 70，允许 ±5 秒浮动；不允许低于 60 秒（节奏太散）或高于 75 秒（脱离抖音爆款时长）。

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

## compare 幻灯片的字段规范（重要：仅做"做对 → 放大"叙事）

模板可见 label 为「做对的事 RIGHT MOVE」→「把它放大 SCALE UP」。

- `compare_before`：博主**早期就做对的核心动作**（基础事实），≤80 字。
  - ✅ 范式："早期就抓住了上班族这一类人"
  - ✅ 范式："最初就只发真实失败经历"
  - ❌ 不允许："早期内容很杂 / 早期定位模糊 / 早期不够垂直"
- `compare_after`：博主**近期围绕同一件对的事，把它放大成现在的规模/系统**，≤80 字。
  - ✅ 范式："现在他把这件事做成了 2C 训练营 + 2B 品牌合作"
  - ✅ 范式："现在每条视频都按同一个公式量产"
  - ❌ 不允许："建议他 / 后续可以 / 应该改进"

严禁的 compare 叙事类型：
- 「早期短板 → 后来改进」
- 「现在弱点 → 建议优化」
- 任何指向博主自身问题的判断

**信息不足以构建"做对 → 放大"对照时，跳过 compare**，用第二张 `bullets` 顶替（顺序变为 `cover → hook → bullets → bullets → cta`）。

narration 句式参考：
- "早期他就抓住了……，现在他把这件事做成了……"
- "他从一开始就在做……，现在这件事被他放大成了……"

来源：从 chapters 中找"账号成长""定位演化""赛道选择""变现链路成熟"等正向章节。

---

## 从 outline.json 到 script.json 的映射建议

| script.json 幻灯片 | outline.json 数据来源 |
|-------------------|----------------------|
| `cover`.title | `stats.display_name` |
| `cover`.subtitle | 从 chapters 中提炼一句话定位 |
| `cover`.narration | 围绕 `verdict` 展开；首句必须为疑问/反差/数字 |
| `cover`.verdict | `verdict` 字段 |
| `hook`.hook_big_text | 从 `stats` 取一个高冲击数字（粉丝 / 获赞 / 月涨粉），或从 chapters 提炼一句 ≤8 字的反差短句 |
| `hook`.hook_sub_text | 一句解释（≤25 字），让 hook_big_text 的含义清晰 |
| `hook`.narration | ≤25 字钩子口播，提出疑问或埋反差 |
| `bullets`.bullets | 从 chapters 中选**博主做对的核心动作**章节的 bullets（3-4 条） |
| `bullets`.narration | 至少 1 条与主线方法论支柱对应，**显式说出方法论关键词** |
| `compare`.before | 博主早期就**做对**的事（不是短板） |
| `compare`.after | 同一件对的事，现在被**放大**成了什么 |
| `quote`.quote | `top_quotes[0].text`（如使用 quote slide） |
| `cta`.narration | 倒数第二张已埋互动钩子，cta 直接用固定结尾 |

---

## 完整 script.json 示例（5 张 / ~67 秒）

主线方法论支柱：**positioning（画等号 + 视觉锤）+ monetization（离钱近 + 2C2B）**

```json
{
  "blogger_slug": "zhang-san-fitness",
  "run_id": "20260115-143022",
  "target_seconds": 70,
  "speed_chars_per_sec": 5.5,
  "slides": [
    {
      "index": 0,
      "slide_type": "cover",
      "title": "张三健身",
      "subtitle": "上班族减脂",
      "narration": "他不是教练，粉丝却比很多教练多。128 万粉丝里，80% 是上班族。今天我们拆他怎么做到的。",
      "verdict": "靠人群画等号建立信任，再把信任切成 2C2B 两条变现。",
      "bullets": [],
      "quote": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "hook_big_text": "",
      "hook_sub_text": "",
      "extra": "",
      "stat_1_label": "", "stat_1_value": "",
      "stat_2_label": "", "stat_2_value": "",
      "stat_3_label": "", "stat_3_value": "",
      "duration_estimate_s": 8.4
    },
    {
      "index": 1,
      "slide_type": "hook",
      "title": "",
      "subtitle": "",
      "narration": "他不是赢在量，他赢在'谁'——人群对了。",
      "hook_big_text": "128万",
      "hook_sub_text": "粉丝里 80% 是上班族",
      "bullets": [],
      "quote": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "verdict": "",
      "extra": "",
      "stat_1_label": "", "stat_1_value": "",
      "stat_2_label": "", "stat_2_value": "",
      "stat_3_label": "", "stat_3_value": "",
      "duration_estimate_s": 3.6
    },
    {
      "index": 2,
      "slide_type": "bullets",
      "title": "他干对了三件事",
      "subtitle": "",
      "narration": "他干对了三件事。第一，他把上班族减脂这件事画上了等号，这就是他的画等号。第二，他的视觉锤就是自己，一个普通上班族，没有八块腹肌反而更有说服力。第三，他选的变现方式离钱近，直接做训练营和品牌合作，省掉中间所有环节，从信任到付费只隔一步。",
      "bullets": [
        "需求 = 上班族减脂（画等号）",
        "视觉锤 = 一个普通上班族",
        "变现 = 训练营 + 品牌合作（离钱近）"
      ],
      "quote": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "verdict": "",
      "hook_big_text": "",
      "hook_sub_text": "",
      "extra": "",
      "stat_1_label": "", "stat_1_value": "",
      "stat_2_label": "", "stat_2_value": "",
      "stat_3_label": "", "stat_3_value": "",
      "duration_estimate_s": 21.5
    },
    {
      "index": 3,
      "slide_type": "compare",
      "title": "他怎么把这件事放大",
      "subtitle": "",
      "narration": "早期他就抓住了一类人，上班族。不是健身极客，也不是减脂教练，就是和你我一样要上班的人。现在他把这件事做成了 2C2B 两条变现——上班族进他的训练营，品牌也找他做合作。同一波粉丝，跑出两条收入。评论区告诉我，你最想拆下一个博主是谁。",
      "bullets": [],
      "quote": "",
      "frame_ref": "",
      "compare_before": "早期就抓住了上班族这一类人，做最朴素的真实减脂记录",
      "compare_after": "现在做成了 2C 训练营 + 2B 品牌合作两条变现链路",
      "verdict": "",
      "hook_big_text": "",
      "hook_sub_text": "",
      "extra": "",
      "stat_1_label": "", "stat_1_value": "",
      "stat_2_label": "", "stat_2_value": "",
      "stat_3_label": "", "stat_3_value": "",
      "duration_estimate_s": 21.1
    },
    {
      "index": 4,
      "slide_type": "cta",
      "title": "",
      "subtitle": "",
      "narration": "以上就是他的成长拆解。更多博主拆解，关注 微域生光，我们研究真实的博主增长。",
      "bullets": [],
      "quote": "",
      "frame_ref": "",
      "compare_before": "",
      "compare_after": "",
      "verdict": "",
      "hook_big_text": "",
      "hook_sub_text": "",
      "extra": "",
      "stat_1_label": "", "stat_1_value": "",
      "stat_2_label": "", "stat_2_value": "",
      "stat_3_label": "", "stat_3_value": "",
      "duration_estimate_s": 7.5
    }
  ]
}
```

校验：
- 总字数 ≈ 341 字，总时长 ≈ 62.1 秒（∈ [60, 75]，∈ [330, 410]） ✓
- 5 张幻灯片，顺序 `cover → hook → bullets → compare → cta` ✓
- narration 中精确出现 `画等号` / `视觉锤` / `离钱近` / `2C2B` 四个方法论关键词，均在 bullets 与 compare 中 ✓
- compare_before 写的是"做对的事"，compare_after 写的是"放大"，未涉及短板 ✓
- cover 首句"他不是教练，粉丝却比很多教练多"= 反差钩子 ✓
- compare 的 narration 末句埋了互动钩子"评论区告诉我，你最想拆下一个博主是谁" ✓

---

## 校验清单（写完后自查）

在 Write 生成 script.json 之前，Claude 必须按以下清单自查。**任一项不过必须重写。**

### 结构
- [ ] `slides.length ∈ [4, 5]`
- [ ] 第 1 张是 `cover`（index = 0）
- [ ] 第 2 张是 `hook`（index = 1）
- [ ] 最后一张是 `cta`
- [ ] `cover` / `hook` / `cta` 各恰好 1 次
- [ ] `bullets` / `compare` / `quote` 三者合计 1-2 次，任意单类型最多 1 次
- [ ] 60-75s 模式下没有 `stats`
- [ ] 所有字段均已填写（非必填字段设为 `""` 或 `[]`）

### 字数与时长
- [ ] narration 总字数 ∈ [330, 410]
- [ ] `sum(duration_estimate_s) ∈ [60, 75]`
- [ ] `target_seconds = 70`

### 爆款三铁律
- [ ] `cover.narration` 首句为疑问 / 反差 / 数字
- [ ] `hook.narration` ≤ 25 字，`hook.hook_big_text` 非空（数字或反差短句）
- [ ] 相邻 slide 间至少出现 1 次转折（语义或转折词）
- [ ] `cta` 之前一张的 `narration` 末句埋了互动钩子（评论区或系列预告）

### 方法论强绑定
- [ ] 已在回复中明确告知用户"本期主线支柱 = X / Y"
- [ ] 所有 narration 拼起来精确匹配至少 1 个 `methodology-primer.md` 关键词
- [ ] 该关键词出现在 `bullets` 或 `compare` slide 的 `narration` 中（非 cover/cta）

### 内容铁律
- [ ] **未出现任何短板/建议类禁词**（短板/不足/欠缺/缺点/缺陷/做得不好/待提升/有待加强/建议他/应该/可以更好/优化空间/改进方向）
- [ ] `compare_before` 写的是博主做对的事，不是"早期不足"
- [ ] `compare_after` 写的是"怎么放大"，不是"改进建议"
- [ ] `quote.quote` 字段来自 outline.json，未改写原意（如使用 quote）
- [ ] `cta.narration` 以「更多博主拆解，关注 微域生光，我们研究真实的博主增长。」结尾
