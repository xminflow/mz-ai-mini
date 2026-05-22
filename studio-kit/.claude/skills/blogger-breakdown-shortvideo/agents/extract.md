# extract.md — outline.json 契约文档

本文件描述 `studio-kit extract` 子命令的输出产物 `outline.json` 的 JSON schema 及各字段语义。

`studio-kit extract` 的职责是：从博主拆解 14 章 HTML 报告目录中解析关键信息，提炼出短视频脚本所需的结构化数据，写入 `outline.json`。

---

## 调用方式

```bash
uv --directory D:\code\weelume-base\studio-kit run studio-kit extract \
  --report-dir <report_dir> \
  --out <workspace>\outline.json
```

- `--report-dir`：报告目录绝对路径，目录下应包含 `index.json` 和至少一个章节 HTML 文件（如 `overview.html`）。
- `--out`：输出的 `outline.json` 绝对路径，父目录若不存在则自动创建。

---

## outline.json — 顶层结构

```json
{
  "blogger_slug": "string",
  "run_id": "string",
  "stats": { ... },
  "verdict": "string",
  "chapters": [ ... ],
  "top_quotes": [ ... ],
  "frame_refs": [ ... ]
}
```

---

## 字段详细说明

### `blogger_slug`

- 类型：`string`
- 来源：从 `index.json` 的 `blogger_id` 字段读取，或从 `report_dir` 的父级目录名推断。
- 约束：仅含小写字母、数字和连字符，不含空格或特殊字符。
- 示例：`"zhang-san-fitness"`

---

### `run_id`

- 类型：`string`
- 来源：从 `index.json` 的 `run_id` 字段读取，或从 `report_dir` 目录名推断（通常为时间戳格式）。
- 示例：`"20260115-143022"`

---

### `stats`

- 类型：`object`
- 语义：博主账号核心数据快照，用于 `slide-stats` 幻灯片渲染。

```json
{
  "display_name": "string",
  "followers": "string",
  "likes": "string",
  "works_count": "string"
}
```

字段说明：

| 字段 | 类型 | 描述 | 示例 |
|------|------|------|------|
| `display_name` | string | 博主显示名（用于 cover 幻灯片标题） | `"张三健身"` |
| `followers` | string | 粉丝数（已格式化，含单位） | `"128.5万"` |
| `likes` | string | 总获赞数（已格式化，含单位） | `"3200万"` |
| `works_count` | string | 作品数量（已格式化，含单位） | `"487条"` |

注：所有数字字段均为**已格式化的字符串**，包含人类可读的单位（万、亿等），不是原始数字，便于直接渲染到幻灯片。

---

### `verdict`

- 类型：`string`
- 语义：一句话答卷，概括博主的核心定位或拆解结论，用于 `cover` 幻灯片的 quote 卡片。
- 约束：≤60 字，口语化，直接陈述，不以「该博主」开头。
- 示例：`"靠垂直内容积累信任，每条视频都是一次产品种草，转化率远超行业均值。"`

---

### `chapters`

- 类型：`array`
- 语义：14 章报告的结构化摘要，每项对应一章。Claude 在 Step 2 写脚本时从此数组中选取最关键的 2-4 章内容映射到幻灯片。
- 约束：数组长度通常为 14，允许 10-16 之间。

每项结构：

```json
{
  "id": "string",
  "title": "string",
  "summary": "string",
  "bullets": ["string", ...],
  "quotes": ["string", ...]
}
```

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| `id` | string | 如 `"ch01"` | 章节 ID |
| `title` | string | ≤30 字 | 章节标题 |
| `summary` | string | ≤200 字 | 章节核心内容摘要，用于 Claude 理解章节主旨 |
| `bullets` | array of string | ≤5 条，每条 ≤80 字 | 该章最关键的可行动要点 |
| `quotes` | array of string | ≤3 条 | 该章出现的博主原话引用 |

---

### `top_quotes`

- 类型：`array`
- 语义：从全部 14 章中精选的最有传播力的博主金句，用于 `slide-quote` 幻灯片。
- 约束：≤5 条，优先选与选题策略、变现方式、内容哲学相关的金句。

每项结构：

```json
{
  "text": "string",
  "source_chapter": "string"
}
```

| 字段 | 类型 | 约束 | 描述 |
|------|------|------|------|
| `text` | string | ≤100 字 | 金句原文（可适度裁剪，保持意思完整） |
| `source_chapter` | string | 如 `"ch07"` | 来源章节 ID |

---

### `frame_refs`

- 类型：`array`
- 语义：关键帧截图引用，用于 `slide-cover` 或 `slide-bullets` 的背景/插图。可为空数组。
- 约束：≤4 个。

每项结构：

```json
{
  "path": "string",
  "caption": "string"
}
```

| 字段 | 类型 | 描述 |
|------|------|------|
| `path` | string | 关键帧截图的绝对路径（相对于 report_dir 的相对路径也可接受，由 render 命令解析） |
| `caption` | string | 截图说明，≤40 字 |

---

## 完整示例

```json
{
  "blogger_slug": "zhang-san-fitness",
  "run_id": "20260115-143022",
  "stats": {
    "display_name": "张三健身",
    "followers": "128.5万",
    "likes": "3200万",
    "works_count": "487条"
  },
  "verdict": "靠垂直内容积累信任，每条视频都是一次产品种草，转化率远超行业均值。",
  "chapters": [
    {
      "id": "ch01",
      "title": "账号定位与人设构建",
      "summary": "博主以「普通人逆袭」为核心人设，聚焦 25-35 岁上班族减脂需求，通过持续的真实体型变化记录建立信任资产。",
      "bullets": [
        "人设锚点：普通人 + 可复制的方法论",
        "垂直赛道：上班族减脂，拒绝健身极客叙事",
        "信任资产：每季度公布真实体重数据"
      ],
      "quotes": [
        "我不是教练，我只是比你早踩了两年坑。"
      ]
    }
  ],
  "top_quotes": [
    {
      "text": "我不是教练，我只是比你早踩了两年坑。",
      "source_chapter": "ch01"
    }
  ],
  "frame_refs": [
    {
      "path": "frames/cover_frame.jpg",
      "caption": "博主账号主页截图"
    }
  ]
}
```

---

## 验证规则（供 `studio-kit script --validate` 参考）

1. 顶层所有必填字段不可缺失、不可为 null。
2. `stats` 的四个子字段均为非空字符串。
3. `verdict` 长度 ≤ 60 字。
4. `chapters` 数组长度 ≥ 1。
5. 每章 `bullets` 长度 ≤ 5，每条 ≤ 80 字。
6. `top_quotes` 长度 ≤ 5。
7. `frame_refs` 长度 ≤ 4。
