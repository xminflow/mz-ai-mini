# 小红书图文视觉规格（极光黑）

本规格为冻结基线。所有模板、文案字数约束、渲染器实现都必须严格遵守。修改本规格前必须先取得用户确认。

---

## 全局参数

| 维度 | 值 |
| --- | --- |
| 画布尺寸 | 1242 × 1656 px（3:4，对齐小红书图文 1242×1656 推荐尺寸） |
| 张数 | 固定 8 张：`00 cover` · `01 hook` · `02-06 point × 5` · `07 cta` |
| 输出格式 | PNG，sRGB，无透明通道（白底降级失败时整张图重渲染，不允许半透明） |
| 文件命名 | `00.png` `01.png` … `07.png`（与 `XhsCard.index` 一致） |
| 安全区 | 上下各 96 px、左右各 80 px 不放主信息（顶栏 / 底栏除外） |

## 字体

- 中文标题 / 中文正文：`阿里巴巴普惠体 3.0`（与 shortvideo 模板一致），降级到 `PingFang SC`/`Microsoft YaHei`
- 数字与英文：`JetBrains Mono`，仅用于角标、页码、followers 数字、CTA 箭头
- **禁止**引入新字体族（视觉一致性优先）

## 配色

| 角色 | 色值 | 用途 |
| --- | --- | --- |
| canvas | `#050507` | 全局画布底色 |
| surface | `#0D0D12` | 卡片底面 |
| ink | `#F5F5F7` | 主文本 |
| ink-soft | `#D4D4D8` | 次级文本 |
| muted | `#8A8A94` | 角标 / 来源 / 页码 |
| accent-purple | `#A78BFA` | 极光紫，用于数字、强调词 |
| accent-cyan | `#22D3EE` | 极光青 |
| accent-pink | `#F472B6` | 极光粉 |
| hairline | `rgba(255,255,255,0.08)` | 发线分割 |
| hairline-strong | `rgba(255,255,255,0.16)` | 强发线 |

### 极光渐变文字（仅用于数字 / 一处主标题强调）

```css
background: linear-gradient(120deg, #F5F5F7 0%, #A78BFA 40%, #22D3EE 70%, #F472B6 100%);
-webkit-background-clip: text;
background-clip: text;
color: transparent;
```

### 极光底纹（仅画布）

```css
background-color: #050507;
background-image:
  radial-gradient(circle at 15% 10%, rgba(167,139,250,0.18), transparent 45%),
  radial-gradient(circle at 85% 0%,  rgba(34,211,238,0.14), transparent 50%),
  radial-gradient(circle at 50% 110%, rgba(244,114,182,0.12), transparent 55%);
```

### Noise 噪点（可选叠加，opacity 0.06，整体不喧宾夺主）

```css
mix-blend-mode: overlay;
opacity: 0.06;
```

## 排版基线网格

- 4 px 基线网格
- 标题行高 1.12，正文行高 1.5
- 数字 `font-variant-numeric: tabular-nums lining-nums`
- 字间距：标题 `-0.02em`，小字标签 `0.04em` 微展开

---

## 单张视觉规格

### 00 · cover（封面）

```
┌─────────────────────────────────────┐
│ 微域生光                       08p   │  ← 顶栏 60 px：左品牌字 / 右角标
│                                     │
│  ────发线───                        │
│                                     │
│   {kicker}                          │  ← 红色赛道标签，72 px 高
│                                     │
│   某某博主                          │  ← 主标题 line_1，120 px
│   是怎么《拆》出来的                │  ← line_2，120 px
│   ——10 万粉丝量级                  │  ← line_3 可选，72 px
│                                     │
│                                     │
│   98.3w 粉丝 · 极光渐变数字         │  ← 数字加极光渐变
│                                     │
│  ────发线───                        │
│                                     │
│  本期 08 张图，看完点击关注          │  ← 底栏 64 px
└─────────────────────────────────────┘
```

字段 → 模板占位映射：

| 字段 | 占位符 | 字号 | 行数限制 |
| --- | --- | --- | --- |
| `cover_kicker` | `{{cover_kicker}}` | 32 px | ≤ 14 字 |
| `cover_title_line_1` | `{{cover_title_line_1}}` | 110 px | ≤ 10 字 |
| `cover_title_line_2` | `{{cover_title_line_2}}` | 110 px | ≤ 10 字 |
| `cover_title_line_3` | `{{cover_title_line_3}}` | 60 px | ≤ 14 字（可空） |
| `blogger_name` | `{{blogger_name}}` | 30 px | ≤ 16 字 |
| `blogger_followers` | `{{blogger_followers}}` | 56 px 极光渐变 | ≤ 12 字 |
| `cover_badge` | `{{cover_badge}}` | 28 px JetBrains Mono | 固定 `08p` |

### 01 · hook（钩子）

```
┌─────────────────────────────────────┐
│ 01 / 08                             │  ← 右上页码
│                                     │
│   {hook_kicker}                     │  ← 顶部小字 28 px
│   ─── 发线短一截 ───                │
│                                     │
│   不是粉丝多                        │  ← 主文 line_1，112 px
│   就能复制                          │  ← line_2，112 px
│   是「他做对了                      │  ← line_3 极光渐变强调一处
│   什么」可以学                      │
│                                     │
│                                     │
│   {hook_sub}                        │  ← 副文 36 px，≤ 24 字
│                                     │
│ 微域生光                            │  ← 底栏品牌
└─────────────────────────────────────┘
```

- `hook_big_line_*` 最多 3 行，每行 ≤ 10 字
- 主文中允许 1 处用 `「」` 包裹的极光渐变强调（由模板自动渲染）
- `hook_sub` ≤ 24 字

### 02-06 · point（章节亮点 × 5 张共用同一套模板）

```
┌─────────────────────────────────────┐
│ {page_label}                        │  ← "03 / 08" 等
│                                     │
│   {point_kicker}                    │  ← 章节名 28 px muted
│   ─── 发线 ───                      │
│                                     │
│   01                                │  ← 大号编号 240 px 极光渐变
│                                     │
│   选题不是拍什么                    │  ← 标题 76 px
│   是为谁拍                          │  ← ≤ 16 字
│                                     │
│   ────发线────                      │
│                                     │
│   他每一条选题先想                  │  ← insight 38 px
│   "这条对谁有用"                    │  ← 2~3 行 ≤ 60 字
│   而不是"我想拍什么"                │
│                                     │
│   ┌────────────────────────┐        │  ← 引用块（可选）
│   │ "他把透明剑指向了同一  │        │  ← quote 36 px 略带柔光
│   │  人群"                  │        │
│   └────────────────────────┘        │
│   ── {point_quote_source}           │  ← 来源 22 px muted
│                                     │
│ 微域生光                            │
└─────────────────────────────────────┘
```

字段约束：

| 字段 | 字号 | 限制 |
| --- | --- | --- |
| `point_no` | 240 px 极光渐变数字 | 固定 `01`/`02`/`03`/`04`/`05` |
| `point_kicker` | 28 px muted | ≤ 12 字 |
| `point_title` | 76 px | ≤ 16 字（2 行内） |
| `point_insight` | 38 px ink | ≤ 60 字（建议 2~3 行） |
| `point_quote` | 36 px ink-soft 斜体 | ≤ 50 字（可空，留空时整块隐藏） |
| `point_quote_source` | 22 px muted | ≤ 16 字（仅当 quote 存在时显示） |

### 07 · cta（行动号召）

```
┌─────────────────────────────────────┐
│ 08 / 08                             │
│                                     │
│   {cta_kicker}                      │  ← 顶部小字 28 px
│   ─── 发线 ───                      │
│                                     │
│                                     │
│   看他怎么走                        │  ← 主文 line_1，108 px
│   不如先看                          │  ← line_2，108 px
│   他在哪里走过                      │  ← 末行极光渐变
│                                     │
│                                     │
│   {cta_sub} →                       │  ← 副文 38 px + 箭头
│                                     │
│   ────发线────                      │
│                                     │
│         微域生光                    │  ← 居中加大品牌字 56 px
│                                     │
└─────────────────────────────────────┘
```

字段约束：

| 字段 | 字号 | 限制 |
| --- | --- | --- |
| `cta_kicker` | 28 px muted | ≤ 16 字 |
| `cta_big_line_1` | 100 px | ≤ 8 字 |
| `cta_big_line_2` | 100 px | ≤ 10 字 |
| `cta_sub` | 38 px | ≤ 28 字 |
| `cta_brand` | 56 px ink | 固定 `微域生光`，不允许英文/域名 |

---

## 不变量（违反即视为破坏品牌一致性）

1. 可见层**禁止**出现 `weelume.com` / 任何英文品牌 / 任何域名（小红书审核倾向于隐藏外链）
2. 极光渐变只用于：cover 的 followers 数字、point 的大号编号、hook 主文一处强调、cta 末行——**不超过每张图 1 处**
3. 顶栏 / 底栏的发线必须是 `rgba(255,255,255,0.16)` 的 1 px 横线，不允许换成其他颜色
4. 字体只允许 `AlibabaPuHuiTi` + `JetBrains Mono`
5. 文本超出字数限制时由文案 Agent 重写，**不允许**模板侧自动 `text-overflow: ellipsis`——文本被裁掉视为产物失败

## 渲染器实现约束

- 模板中所有占位符使用 `{{field}}` 形式，与 shortvideo `slide_renderer.py` 占位约定保持一致
- 引用块（quote）当 `point_quote` 为空字符串时，整块 `<div class="quote-card">` 必须被服务端去掉或 `display:none`——不允许出现一个空框
- 渲染器调用 `page.screenshot(full_page=False, clip={x:0,y:0,width:1242,height:1656})` 精确截取
- 字体加载 `font-display: swap`，截图前必须 `await page.evaluate("document.fonts.ready")` 等字体齐
