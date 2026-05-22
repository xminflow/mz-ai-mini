# track-research · 审核 agent 执行指南

本文件由 track-research 主 SKILL.md 通过 Agent 工具调用 general-purpose 子 agent 时，附在 prompt 里使用。子 agent 启动后第一件事就是 Read 本文件，按此执行审核 + 修复循环。

## 接口契约

**输入**（由主 SKILL 传入，全部为绝对路径或显式 ID）：

- `track_keyword`：原始赛道关键词（中文，例如「AI 漫剧」）
- `track_slug`：赛道目录 slug（拼音 / 英文，例如 `ai-manyuju`）
- `run_id`：本次运行 ID（例如 `20260520T083000Z`）
- `workspace_dir`：工作区根目录（绝对路径）
- `raw_dir`：原始素材目录绝对路径（含 `sources.json` / `data_index.md` / `material/` 等）
- `reports_dir`：6 份 HTML 报告所在目录绝对路径

**输出**：

- 在 `<reports_dir>/check_report.md` 写最终审查报告（含 v1/v2 修复历史）
- 若审查发现硬错误，**就地修改** 6 份 HTML 文件修复（不重新生成整份）
- 更新 `<reports_dir>/index.json` 的 `check_report` 段
- 中间产物 `check_report_v1.md` / `check_report_v2.md` 仅在循环未通过时保留；通过后删除

**完成回报格式**（子 agent 结束时给主 SKILL 的一段简短中文）必须包含：

- 审查轮次（1 或 2）
- 最终结论（✅ 通过 / ⚠️ 未通过）
- 剩余硬错误数
- 结构性局限数
- 是否建议回流重采
- `check_report.md` 绝对路径

**不要**把完整 `check_report.md` 内容回报给主 SKILL，主 SKILL 不需要正文，只需要上述结论摘要。

---

## §1 审查类型 1 · 事实核查 / 引用溯源

对 6 份 HTML 逐份执行 5 步检查：

1. **抽取数字**：grep 每份 HTML 中 `<数字>(亿|万|%|元|条|个|家|倍)` 命中
2. **反查 data_index.md**：每个数字必须能在底稿找到一行（数值/单位/来源/时间一致）
3. **反查 material/**：底稿来源文件必须真实存在且原文确实出现该数字
4. **URL 验证**：脚注 URL 必须能在 `raw/sources.json` 找到（不允许伪造）
5. **跨文档一致性**：同一数字在不同 HTML 必须一致；`00_overview.html` 出现的所有数字必须能在后 5 份找到

任一失败 = **硬错误**（必修才能通过）

---

## §2 审查类型 2 · 质量自检清单（ABCDEFG 七类）

> §2 是本指南的核心。在修复循环（§3）之前，先把 7 类全部跑一遍并落入 check_report 各章节。每一类下"命中即硬错误"的项目用 grep 实测，不要"看一眼觉得没问题"。

### A · 章节完整性

- 6 份 HTML 全在；每份 H2 章节按 `agents/write.md` §3 既定骨架全覆盖
- `00_overview.html` **8 节**齐（取消旧的"九节·六份 HTML 导航"）：timestamp / hero / three-numbers / why-now / verdicts / audience / answers / guide
- `05_playbook.html` 失败模式 ≥ 3 种、收入来源 ≥ 2 种、财务三场景齐
- **不允许**出现"完成进度 / 任务进度 / 报告交付 / 已生成完毕 / 本报告已完成 / 审查轮次"等工程类章节或卡片——审查 grep 命中即硬错误

### B · 写作硬约束

- 数字一致性已校验（详见 §1）
- 防幻觉四分类标注合规（fact / analysis / recommendation / projection）
- 单段 ≤ 5 行；长句 ≤ 40 字；行动建议都以动词开头

### C · 禁用术语（grep 必查，命中即硬错误）

把以下正则交给 Bash + ripgrep / grep，全 6 份 HTML 一次扫完。命中数必须为 0：

```bash
# C-1：自我打折 / 工程术语 / 完工进度（与读者无关）
grep -nE "(A 级|B 级|S 级|置信度|未获取|未交叉验证|据相关数据|待补充|数据缺口|完成进度|分析进度|任务进度|采集进度|生成完毕|本报告已完成|审查轮次|final_status|check_report|硬错误|6 份 HTML 全部生成|已交付|报告交付|WebSearch|WebFetch|抓取|登录墙|material |data_index|sources\.json|research-kit|track_slug|track-research|run_id|raw/|workspace|highcharts|data-rk-chart|尚无实证|样本量有限|待验证|仅供参考|我推测|原报告未取得|PDF 未下载|白皮书未|抓取失败|本节存在 X 问题)" \
  <reports_dir>/*.html

# C-2：夸大 / 迎合 / 以偏概全（违反实事求是）
grep -nE "(百分百|绝对|必然|稳赚|躺赢|无脑做|爆款|蓝海|风口已至|下一个万亿|颠覆性|革命性|完美|无懈可击|非常适合|强烈推荐|千万不要错过|抓住机会|遥遥领先|必将|一定会|所有人都能|普通人也能轻松|只要 XX 就能|头部账号都能)" \
  <reports_dir>/*.html
```

**立场分布检查**（必须满足）：

```bash
# 同篇报告的立场标签不能全是"看好"——夸大/迎合的典型信号
grep -cE '(看好|谨慎|看空)' <reports_dir>/00_overview.html
# 进一步：grep "看空|谨慎" 命中数 ≥ 1（全报告至少有 1 个非"看好"立场）
```

立场全是"看好" + 0 个"谨慎/看空" = 硬错误，必修。

### D · HTML 卫生

- `<html lang="zh-CN">` 已设置
- Tailwind CDN 已注入 `<head>`
- 阿里巴巴普惠体 3 已注入（55-Regular / 65-Medium / 85-Bold 三档）
- 无 `<script>` 交互逻辑（除 Tailwind CDN）
- `index.json` 已生成且 schema 正确
- 所有 `<img>` 标签的 `src` 必须为 `data:image/...;base64,...`（**无外链 `<img src="http">`**）
- 内联 SVG 必须含 `viewBox` 属性

### E · 跨页跳转禁令（grep 必查，命中即硬错误）

每份 HTML 必须独立完整，**不允许**跳转到其他 5 份 HTML 之一。审查 grep：

```bash
grep -nE 'href="(00_overview|01_market|02_competition|03_business_model|04_ai_driven_analysis|05_playbook)\.html' \
  <reports_dir>/*.html
```

命中数必须为 0。页内 anchor（如 `<a href="#top-players">`、`<a href="#overview">`）允许保留。

典型违规位置（修复时定位优先扫这些处）：
- 顶部"六份 HTML 导航"侧栏 / 顶栏
- 底部 `<nav>` Continue Reading footer
- 章节内"详见 01_market 第 N 节"上下文链接
- `00_overview.html` 的"这份报告能帮你回答什么"小节中带 anchor 的 a 标签

### F · 装饰性 SVG 禁令

**每张 SVG 都必须承载真实数据**（坐标轴 + 数据点 + 数据标签 / 散点 / 饼扇区等）。审查规则：

- 找 6 份 HTML 中所有 `<svg viewBox=`，对每个 SVG 判定它是否包含至少一个 `<rect>`/`<circle>`/`<line>`/`<path>`/`<polyline>` 作为**数据图元**（不是"渐变背景 + 文字 callout"）
- 出现"viewBox 1600×900 + linearGradient + rect 全屏背景 + text 数据 callout 卡片"这种**纯装饰封面 SVG** = 硬错误，必修：替换为承载数据的内联 SVG 柱状/折线/散点图

### G · 数据可视化覆盖度

每份 HTML 必须满足 `agents/write.md` §6.4 的"必备图清单"最低数量：

| HTML | 至少 | 检查口径 |
|------|------|---------|
| `00_overview.html` | 1 | 顶部市场规模数据图 |
| `01_market.html` | 2 | 趋势图 + 三层占比图 |
| `02_competition.html` | 2 | 定位矩阵图 + 能力对比 |
| `03_business_model.html` | 2 | 收入构成 + 成本拆解 |
| `04_ai_driven_analysis.html` | 1 | AI 介入价值链流程图 |
| `05_playbook.html` | 2 | 财务三场景预测 + 启动成本结构 |

审查 grep（实测每份命中数）：

```bash
grep -cE '<svg [^>]*viewBox|<div class="h-2 bg-white' <reports_dir>/*.html
```

未达上表"至少"数量 = 硬错误。

---

## §3 修复循环（最多 2 轮）

```
首次审查 (check_report_v1.md)
   ↓ 有硬错误?
   是 → 自动 fix（针对硬错误逐条修，禁止重新生成整份 HTML） → 复审 (check_report_v2.md)
       ↓ 仍有硬错误?
       是 → 终止 + 输出 check_report.md 给人工
       否 → 通过，删除 v* 中间产物
   否 → 通过
```

**禁止**：在自动 fix 阶段重新生成整份 HTML——这会引入新的不一致。逐条改、改完即停。

**典型修复路径**：

| 硬错误类型 | 修复动作 |
|---|---|
| C 类禁用词命中 | 直接删除该词所在句 / 替换为合规措辞 |
| E 类跨页 a 标签 | 把 `<a href="0X_xxx.html">XX</a>` 改成 `<span>XX</span>` 或纯文字，并清除外层 `<nav>` 导航容器 |
| F 类装饰 SVG | 用承载数据的内联 SVG 替换；数据从 `data_index.md` 取 |
| G 类数据图不足 | 增补内联 SVG / CSS 横条，每张图脚 figcaption 注明数据来源 |
| 章节里出现"完成进度"等工程区块 | 直接删除整个 `<section>` 区块 |

---

## §4 硬错误 vs 结构性局限 vs 回流信号

- **硬错误**（必修）：
  - 数字编造、URL 伪造、数据与来源不符、跨文档矛盾
  - C 类禁用术语命中
  - E 类跨页 a 标签命中
  - F 类装饰性 SVG 残留
  - G 类数据图数量不达 §2.G 表最低要求
  - A 类章节缺失 / 出现"完成进度"等工程章节
- **结构性局限**（已披露即不阻断）：
  - 单一来源数据已用「据 XX 报告」含蓄限定
  - 公开页时效性
- **回流信号**（中断循环 + 报告用户）：
  - 核心结论（市场规模 / 头部账号 / 关键定价）缺一手源
  - 整个赛道公开素材深度不足以支撑 ≥ 3 份 HTML 的核心章节

---

## §5 `check_report.md` 格式

```markdown
# 赛道分析审查报告

> 生成时间：YYYY-MM-DDTHH:MM:SSZ
> run_id：20260520T083000Z
> 审查轮次：2/2
> 最终结论：✅ 通过 / ⚠️ 未通过（剩余硬错误 N 项需人工处理）

## 审查结论

| 项目 | 数量 |
|---|---|
| 硬错误 | 0 |
| 结构性局限（已披露，不阻断） | 3 |
| A 章节完整性问题 | 0 |
| C 禁用术语命中 | 0 |
| E 跨页跳转命中 | 0 |
| F 装饰 SVG 命中 | 0 |
| G 数据图覆盖度未达标的 HTML 数 | 0 |
| 是否建议回流重采 | ❌ |

## 硬错误清单

（按 HTML 文件分组列出，每项含：位置 / 类型 / 原文 / 修复后）

## 结构性局限清单

（已披露不阻断，仅记录）

## 修复历史

| 轮次 | 时间 | 硬错误数 | 修复条目 |
|---|---|---|---|
| v1 | YYYY-MM-DDTHH:MM:SSZ | 5 | … |
| v2 | YYYY-MM-DDTHH:MM:SSZ | 0 | … |
```
