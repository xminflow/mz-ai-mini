---
name: track-research
description: 端到端「赛道分析」skill。用户给一个赛道关键词，本 skill 编排 3 个子 agent（采集 / 创作 / 审核）串行调用 WebSearch / WebFetch 在不登录、不绕反爬的前提下采集公开资料（搜索引擎、维基百科、政府/行业研究机构、权威媒体、公开榜单），用投研级行业分析框架 + 微域生光方法论做赛道深度拆解，输出 6 份 HTML 报告（执行摘要 / 行业研判 / 竞争格局 / 商业模式 / AI 落地 / 操盘手册）+ 内容审核报告。触发词：赛道分析、赛道拆解、track-research、调研一下 X 赛道、X 赛道怎么做、X 赛道现在好做吗、分析一下 X 行业、X 这个方向能不能切。
---

# 赛道分析 · 端到端 skill

读取一个赛道关键词（家用咖啡机评测 / 中老年穿搭 / AI 写作工具……），本 skill **不直接采集、不直接写报告**，而是按"澄清 → 采集 agent → 创作 agent → 审核 agent → 终态汇报"的流程编排 3 个子 agent，避免主会话上下文爆炸（具体规则全部在 `agents/{collect,write,review}.md` 三个指南文件里，主 skill 只编排）。

最终产物：

- `<reports_dir>/00_overview.html`：执行摘要 / 一句话判断 / 三个反常识数字
- `<reports_dir>/01_market.html`：行业研判（TAM/SAM/SOM、CAGR、PEST、风险量化）
- `<reports_dir>/02_competition.html`：竞争格局与标杆账号矩阵
- `<reports_dir>/03_business_model.html`：商业模式 + 变现链路
- `<reports_dir>/04_ai_driven_analysis.html`：AI 落地与赋能
- `<reports_dir>/05_playbook.html`：从零到一操盘手册（含三场景财务预测）
- `<reports_dir>/check_report.md`：审查报告
- `<reports_dir>/index.json`：产物索引

报告同时回答三个核心问题：

> 1. 这个赛道现在到底是不是好时机？看好 / 谨慎 / 看空，凭什么？
> 2. 头部玩家用的是什么招式？没被占住的差异化空间在哪？
> 3. 一个新入局者从零开始，第 1 个月 / 第 3 个月 / 第 6 个月该做什么，能赚多少？

---

## 编排总览

```
用户输入：赛道关键词（自然语言，可能模糊）
   ↓
Step 0 · 关键词澄清（主会话本身完成）
   关键词模糊 → 一次性问 3 个澄清问题 → 锁定上下文变量
   关键词明确 → 跳过
   ↓
Step 1 · 派 collect agent
   接口：传入 6 个上下文变量 + agents/collect.md 绝对路径
   产物：<raw_dir>/{sources.json, index.md, data_index.md, material/*.md}
   主会话只看完成回报，不读 material 全文
   ↓
Step 2 · 派 write agent
   接口：传入 8 个上下文变量 + agents/write.md 绝对路径 + templates/ 目录路径
   产物：<reports_dir>/{00-05.html, index.json}
        所有数据图全部内联到 HTML（内联 SVG + CSS 横条），不再产生 charts/*.png 或 charts_manifest.json
   主会话只看完成回报，不读 HTML 全文
   ↓
Step 3 · 派 review agent
   接口：传入 6 个上下文变量 + agents/review.md 绝对路径 + agents/write.md 绝对路径（供反查骨架/禁用词）
   动作：审核（ABCDEFG 七类，新增 跨页跳转 / 装饰 SVG / 数据图覆盖度 三类）+ 最多 2 轮修复循环
   产物：6 份 HTML（已修复硬错误）+ <reports_dir>/check_report.md
   主会话只看完成回报，不读 check_report 全文
   ↓
Step 4 · 终态汇报（主会话本身完成）
   一句中文总结：6 份 HTML 路径 + 审查结论 + 数据缺口提示
```

---

## Step 0 · 关键词澄清（主会话执行）

### 0.1 何时触发

**触发澄清**（关键词模糊，必须问）：

- 用户只给单一名词（例如「咖啡」「穿搭」「AI 工具」）
- 关键词同时覆盖多个细分赛道（例如「咖啡」可指家用机 / 连锁店 / 咖啡豆电商 / 咖啡内容博主）
- 关键词地域跨度大且差异显著（例如「茶饮」中国 vs 东南亚结构完全不同）
- 关键词的读者画像不明（B 端创业者 / C 端从业者 / 投资人各自要的深度差异大）

**跳过澄清**（关键词已锁定，直接进入 Step 1）：

- 用户给出复合关键词且 3 维度齐全（例如「家用咖啡机评测内容 + 中国大陆 + 个人内容创业者」）
- 用户上轮已澄清过，本轮要求复跑
- 用户明确说"先跑一版看看"，可放宽到任意细分进入

### 0.2 询问哪 3 个澄清维度

一次性问完 3 个问题（不要逐个问），用清单格式：

1. **聚焦范围**：限定到哪个细分？例如"咖啡"→"家用咖啡机评测内容" / "连锁咖啡店运营" / "咖啡豆电商" / "咖啡相关内容博主"。
2. **地域**：覆盖哪个市场？默认中国大陆。可选：全球 / 中国大陆 / 港澳台 / 东南亚 / 美国 / 欧洲 / 日韩。
3. **读者画像**：报告给谁看？决定语气与深度——投资人（看市场+商业模式） / 个人创业者（看操盘+财务预测） / 大厂业务负责人（看竞争+AI 落地） / 行业从业者（看趋势+差异化空间）。

询问语气：直接列三问，附上"不答完则默认细分=最常见品类、地域=中国大陆、读者=个人创业者"。

### 0.3 锁定上下文变量

澄清完后必须把"上下文变量"全部锁死，打印给用户。这 8 个变量是 3 个 agent 的统一接口（少一个 agent 就会摸不着北）：

```
track_keyword: 家用咖啡机评测内容
region:        中国大陆
audience:      个人创业者
track_slug:    jiayong-kafeiji-pingce-neirong
run_id:        20260520T083000Z
workspace_dir: D:\code\weelume-base\research-kit\output\tracks\<track_slug>
raw_dir:       <workspace_dir>\raw
reports_dir:   <workspace_dir>\reports\<run_id>
```

**命名规则与硬等式**：

- `track_slug`：关键词转拼音再连字符。中文多音字或拼音冲突时附 4 位 hash 后缀。**禁止**直接用中文做目录名（Windows 路径在 Bash/Python 间传递时容易出问题）。
- `run_id`：`YYYYMMDDTHHMMSSZ` UTC，跟博主拆解一致。
- `workspace_dir`：固定 `<project_root>\output\tracks\<track_slug>`，跨 run 复用同一目录（raw/ 共享、reports/ 按 run_id 隔离）。
- `raw_dir = <workspace_dir>\raw`（**硬等式，3 个 agent 不可自行解释**）
- `reports_dir = <workspace_dir>\reports\<run_id>`（**硬等式，3 个 agent 不可自行解释**）

Windows 用反斜杠绝对路径，**不要**用 `/d/...` POSIX 风格——pathlib 在 Windows 不识别。

---

## Step 1 · 派 collect agent

### 1.1 调用范式

```
Agent:
  subagent_type: general-purpose
  description: track-research · collect <track_slug>
  prompt:
    你是 track-research skill 的采集子 agent。

    【上下文变量】
    track_keyword: <track_keyword>
    region:        <region>
    audience:      <audience>
    track_slug:    <track_slug>
    run_id:        <run_id>
    workspace_dir: <workspace_dir>
    raw_dir:       <raw_dir>

    【执行指南】
    请立刻 Read 下面这份文件，按它的全部规则执行：
    D:\code\weelume-base\research-kit\.claude\skills\track-research\agents\collect.md

    【完成后】
    按指南中的「完成回报格式」回报。不要回报 material 全文。
```

### 1.2 验收

收到 collect agent 回报后，主会话用一次 Bash + Grep 校验产物齐全：

```bash
ls "<raw_dir>/sources.json" "<raw_dir>/index.md" "<raw_dir>/data_index.md"
ls "<raw_dir>/material/" | wc -l   # 应 ≥ 10
```

四份产物有任一缺失或 material 数量 < 10 → 用 `SendMessage` 续 collect agent 让它补采（不要重派新 agent，浪费上下文）；续两次仍不达标 → 跳到 Step 4 报告用户由其决策。

---

## Step 2 · 派 write agent

### 2.1 调用范式

```
Agent:
  subagent_type: general-purpose
  description: track-research · write <track_slug>
  prompt:
    你是 track-research skill 的创作子 agent。

    【上下文变量】
    track_keyword: <track_keyword>
    region:        <region>
    audience:      <audience>
    track_slug:    <track_slug>
    run_id:        <run_id>
    workspace_dir: <workspace_dir>
    raw_dir:       <raw_dir>
    reports_dir:   <reports_dir>

    【执行指南】
    请立刻 Read 下面这份文件，按它的全部规则执行：
    D:\code\weelume-base\research-kit\.claude\skills\track-research\agents\write.md

    【模板目录】
    6 份 HTML 模板在 D:\code\weelume-base\research-kit\.claude\skills\track-research\templates\
    每份 HTML 必须从对应 `<id>.html.tmpl` 派生（id ∈ {00_overview, 01_market, 02_competition,
    03_business_model, 04_ai_driven_analysis, 05_playbook}）。模板里硬编码的颜色、emoji 视觉
    锚点（如 audience 章节的 ✅/⚠️/❌ 三栏 + #34d399/#fbbf24/#f87171 配色）请按模板填内容，
    不要替换。

    【图表生成】
    - 重点数据必须用直观图展示，统一走"内联 SVG（柱/折线/饼/散点/流程）+ CSS 横条（百分比/评分）"两种实现
    - 严禁调用 highcharts MCP 或任何外部图表服务；严禁产生 data-rk-chart 占位符 / charts/*.png / charts_manifest.json
    - 严禁装饰性 SVG（封面/插画）；每张 SVG 必须承载真实数据
    - 每份 HTML 至少的图数见 agents/write.md §6.4 必备图清单

    【独立性约束】
    - 6 份 HTML 之间禁止互相跳转（不写顶部导航条、不写底部 Continue Reading、不写"详见 0X 第 N 节"）
    - 页内 anchor 跳转（#top-players 等）允许

    【完成后】
    按指南中的「完成回报格式」回报。不要回报 6 份 HTML 全文。
```

### 2.2 验收

```bash
ls "<reports_dir>/00_overview.html" "<reports_dir>/01_market.html" "<reports_dir>/02_competition.html" \
   "<reports_dir>/03_business_model.html" "<reports_dir>/04_ai_driven_analysis.html" \
   "<reports_dir>/05_playbook.html" "<reports_dir>/index.json"
```

任何 HTML / index.json 缺失 → 续 write agent；续两次仍缺则报告用户。

---

## Step 3 · 派 review agent

### 3.1 调用范式

```
Agent:
  subagent_type: general-purpose
  description: track-research · review <track_slug>
  prompt:
    你是 track-research skill 的审核子 agent。

    【上下文变量】
    track_keyword: <track_keyword>
    track_slug:    <track_slug>
    run_id:        <run_id>
    workspace_dir: <workspace_dir>
    raw_dir:       <raw_dir>
    reports_dir:   <reports_dir>

    【执行指南】
    请立刻 Read 下面这份文件，按它的全部规则执行：
    D:\code\weelume-base\research-kit\.claude\skills\track-research\agents\review.md

    【骨架与禁用词反查参考】
    本指南 §3.A（章节完整性）与 §3.C（禁用术语）需要反查 6 份 HTML 的章节骨架定义、禁用术语清单。
    这些定义在创作指南里：
    D:\code\weelume-base\research-kit\.claude\skills\track-research\agents\write.md
    请在审查骨架完整性 / 禁用术语命中前 Read 一遍 write.md 的 §3（6 份 HTML 详细写作指引）
    与 §5（专业自信原则禁用词表）。

    【完成后】
    按指南中的「完成回报格式」回报。不要回报 check_report.md 全文。
```

### 3.2 验收

收到 review agent 回报后：

- `final_status: passed` → 进入 Step 4
- `final_status: failed` → 进入 Step 4，并把"剩余硬错误数 + 是否建议回流重采"明确告诉用户

---

## Step 4 · 终态汇报（主会话执行）

一句中文总结，告诉用户：

- 6 份 HTML 的绝对路径
- `check_report.md` 的绝对路径与审查结论（✅ / ⚠️）
- 如审查 ⚠️，列出剩余硬错误清单
- 数据缺口提示（哪些维度公开渠道深度不足，建议人工介入或后续重跑）
- 如果用户问"接下来呢"，主动推荐：在浏览器打开 `00_overview.html` 先看摘要，然后按 `01_market` → `02_competition` → `03_business_model` → `04_ai_driven_analysis` → `05_playbook` 顺序读

**禁止**：在终态汇报里暴露工程术语（`run_id` / `track_slug` / `workspace_dir` / `raw_dir` / `reports_dir` 等可以在内部 agent 调用里出现，但终态汇报给用户的句子应当用赛道关键词 + 中文路径片段表达）。

---

## 编排级硬约束

### Agent 隔离

- 3 个 agent **完全串行**，不并行（write 依赖 raw/，review 依赖 reports/）
- 主会话**只接收 agent 的完成回报**，不主动读取 `material/*.md` / `*.html` / `check_report.md` 全文
- 任一 agent 回报失败 → 用 `SendMessage` 续同一个 agent（不要重派新 agent，浪费上下文）
- 续两次仍失败 → 跳到 Step 4 报告用户由其决策

### 路径

- `workspace_dir` 必须是绝对路径，Windows 反斜杠
- `raw_dir = <workspace_dir>\raw` 与 `reports_dir = <workspace_dir>\reports\<run_id>` 是硬等式，3 个 agent 不可自行解释
- 3 个 agent 指南文件（`collect.md` / `write.md` / `review.md`）的绝对路径与 `templates/` 目录绝对路径作为常量出现在每次 Agent 调用的 prompt 里，**主会话不简化为相对路径**——子 agent 没有"项目根目录"概念

### 跨 agent 交接

- collect 写 `<raw_dir>/`，write 与 review 都只读
- write 写 `<reports_dir>/00-05.html` + `index.json`；所有数据图内联到 HTML，不再产生 PNG / manifest；不修改 collect 的产物
- review 就地修复 `<reports_dir>/00-05.html` 的硬错误 + 创建 `<reports_dir>/check_report.md` + 更新 `<reports_dir>/index.json` 的 `check_report` 段；不修改 raw/

---

## 附录 A · index.json schema

由 write agent 写入初版（`check_report` 段先留空骨架），review agent 完成后更新 `check_report` 段。

**字段约束**（发布层 `weelume_track_api.py` 强制校验，任何字段名错误都会导致 publish-track 失败）：

- `reports[].type` 必须是以下六个枚举值之一：`overview` / `market` / `competition` / `business_model` / `ai_analysis` / `playbook`（不允许用数字前缀如 `00_overview`）
- `reports[].file` 是相对于 `reports_dir` 的文件名（不是 `path` / `filename`）
- `stance` 必填，取值 `看好` / `谨慎看好` / `谨慎` / `看空` 四选一
- `stance_summary` 必填，≤ 50 字，概括立场的核心逻辑
- `key_numbers` 必填，至少 4 个量化指标；**键名必须从下列标准字段中选取**（官网卡片白名单只认标准字段，自造字段名会降级显示原始 key 名）：

  | 标准字段名 | 含义 | 单位 |
  |---|---|---|
  | `som_cny_100m` | 可获市场 SOM（**优先展示**） | 亿元 |
  | `market_size_cny_100m` | 当前年市场规模 | 亿元 |
  | `market_size_2024_cny_100m` / `_2025_` / `_2026e_` / `_2030e_` | 特定年份规模 | 亿元 |
  | `cagr_forecast_pct` | 预测 CAGR（**优先展示**） | % |
  | `cagr_historical_pct` | 历史 CAGR | % |
  | `cr5_pct` | CR5 集中度（**优先展示**） | % |
  | `cr10_pct` | CR10 集中度 | % |
  | `ecommerce_penetration_pct` | 电商渗透率（**优先展示**） | % |
  | `startup_cost_base_cny` | 启动成本（中性）（**优先展示**） | 元 |
  | `startup_cost_conservative_cny` | 启动成本（保守） | 元 |
  | `startup_cost_optimistic_cny` | 启动成本（乐观） | 元 |
  | `hit_rate_pct` | 中签率（内容赛道） | % |
  | `avg_roi` | 平均 ROI | × |
  | `traffic_cost_share_pct` | 流量成本占比 | % |

  卡片最多展示 3 个，优先顺序：`som_cny_100m` → `market_size_cny_100m` → `cagr_forecast_pct` → `cr5_pct` → `ecommerce_penetration_pct` → `startup_cost_base_cny`。

- `data_sources_count` 必填，整数，从 `raw/sources.json` 的 `total` 字段直接取

```json
{
  "run_id": "<run_id>",
  "track_keyword": "<原始关键词>",
  "track_slug": "<拼音连字符>",
  "region": "<地域>",
  "audience": "<读者画像>",
  "generated_at": "<ISO 8601 UTC，如 2026-05-21T08:00:00Z>",
  "stance": "谨慎看好",
  "stance_summary": "<≤50字，解释立场核心逻辑>",
  "key_numbers": {
    "som_cny_100m": 397,
    "cagr_forecast_pct": 12.9,
    "cr5_pct": 20,
    "ecommerce_penetration_pct": 70,
    "startup_cost_base_cny": 50000
  },
  "data_sources_count": 25,
  "reports": [
    {"type": "overview",        "file": "00_overview.html",           "title": "执行摘要",          "sections": 8, "charts": 1, "description": "<30字内容摘要>"},
    {"type": "market",          "file": "01_market.html",             "title": "行业研判",          "sections": 8, "charts": 4, "description": "<30字内容摘要>"},
    {"type": "competition",     "file": "02_competition.html",        "title": "竞争格局",          "sections": 6, "charts": 3, "description": "<30字内容摘要>"},
    {"type": "business_model",  "file": "03_business_model.html",     "title": "商业模式与变现链路", "sections": 6, "charts": 2, "description": "<30字内容摘要>"},
    {"type": "ai_analysis",     "file": "04_ai_driven_analysis.html", "title": "AI 落地与赋能",     "sections": 5, "charts": 1, "description": "<30字内容摘要>"},
    {"type": "playbook",        "file": "05_playbook.html",           "title": "从零到一操盘手册",   "sections": 6, "charts": 3, "description": "<30字内容摘要>"}
  ],
  "check_report": {
    "file": "check_report.md",
    "rounds": 0,
    "final_status": "pending",
    "hard_errors_remaining": -1,
    "structural_limitations": -1,
    "recollect_suggested": false
  }
}
```

---

**END OF SKILL**
