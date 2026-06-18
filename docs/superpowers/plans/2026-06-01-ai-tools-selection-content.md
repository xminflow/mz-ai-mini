# 《AI工具篇 · 第一部分：选型 + 安装入门》内容实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 community 第一阶段 `ai-tools`（「AI工具篇」）的占位讲义替换为面向零技术背景读者的「AI 工程工具选型 + 安装入门」真实内容。

**Architecture:** 纯内容数据改动——只编辑 `community/src/lib/content/ai-coding.ts` 中 `slug: 'ai-tools'` 的 `lecture`（必要时同步 `summary` / `objectives`），复用现有 `LectureBlock` 联合类型与 `LectureBlocks.tsx` 渲染组件。零新依赖、零接口、不改路由/导航/middleware/后端。

**Tech Stack:** Next.js 15 App Router、React 19、TypeScript、Tailwind v4。命令在 `D:/code/weelume-base/community` 目录执行。

> 验证策略：前端内容改动，按 CLAUDE.md「前端不要求组件级测试」，以 `pnpm exec tsc --noEmit` + `pnpm lint` + `pnpm build` + `pnpm dev` 页面通读作为验收，不写单元测试。
> 设计依据：`docs/superpowers/specs/2026-06-01-ai-tools-selection-design.md`（方向 A：壳 vs 大脑认知框架 → 按场景分流不排名 → 主推 Claude Code + 国产模型手把手装上跑通）。

---

### Task 1: 撰写并替换 `ai-tools` 阶段讲义内容

**Files:**
- Modify: `community/src/lib/content/ai-coding.ts`（`STAGES` 中 `slug: 'ai-tools'` 项的 `lecture`；按需微调同项 `summary` / `objectives`）

约束（写作时必须遵守）：
- 只用现有 `LectureBlock` 类型：`heading` / `paragraph` / `list`(可 `ordered`) / `code`(`lang`) / `callout`(`info` | `warn` | `tip`) / `image`。**不新增类型**。
- 受众零技术背景：大白话 + 生活化比喻；每个第一次出现的术语（终端、安装、密钥、环境变量…）当场一句话解释。
- 禁油腻话术（保姆级 / 干货满满 / 赶紧收藏）；不堆术语；不暴露内部品牌/引流暗示。
- 现实门槛（科学上网 / 海外支付 / 付费 / 封号风险）：坦白但克制，中性措辞，不渲染、不教规避。
- 不写死易过期精确价格 / 版本号；用「以官方为准」+ 量级感（如「低至几十元一月」）。
- 不排名；用「你是这种人 → 用这套」的场景分流。

内容五段（对应 spec「内容结构」），按顺序产出 `LectureBlock[]`：

1. **开篇钩子** — paragraph×1-2：不用懂代码也能做出能用的东西；「第一步用哪个工具」劝退一片；本节只解决三件事——看懂、选对、装上跑通。
2. **破除误解：工具是「两层」** — heading +（壳/大脑比喻）paragraph + list（壳：Claude Code/Codex/Kimi 命令行；大脑：Claude/GPT/Kimi/GLM）+ callout(info)：壳与大脑可拆开搭配，这是国内也能用上「最好的壳」的原因。
3. **认识选手（不排名）** — heading + 国外（Claude Code / Codex，门槛：科学上网+海外支付）paragraph/list + 国内（Kimi / GLM：能力对标、免梯子、人民币付费、便宜、可塞进 Claude Code）paragraph/list + callout(warn)：现实门槛中性提醒。
4. **对号入座（按场景分流）** — heading + list 或多段「你是这种人 → 用这套」（能且愿意上网+海外付费 → Claude Code 原生；不能/嫌麻烦 → Claude Code 壳 + 国产大脑；预算敏感 → 国产入门档）+ callout(info)：坦白但克制的取舍提醒。
5. **手把手：装上跑出第一个结果** — heading + paragraph（主推 Claude Code + 国产大脑及理由）+ 「终端是什么」一句话 paragraph + ordered list 步骤（装 Node → 装 Claude Code → 填两样：钥匙 API Key 与地址接入地址，即两个环境变量 → 说一句话做最小例子 → 看到结果），每步含「你会看到什么/卡住怎么办」+ code 块（示例命令，含「以官方为准」注释，不写死版本）+ callout(tip)：第一次陌生很正常 + 收尾 paragraph（承接后续部分）。
   - 非主推路径（Claude Code 原生 / Codex / 各家自带命令行）仅一句话指路，不详写。

- [ ] **Step 1: 写入内容**

  在 `ai-coding.ts` 中，将 `slug: 'ai-tools'` 项的 `lecture` 占位数组整体替换为上述五段对应的 `LectureBlock[]`；如 `summary` / `objectives` 与「选型+安装入门」表述不一致，同步微调（保持与后续部分不冲突，不扩范围）。`accent: 'cyan'` 等其它字段保持不变。

- [ ] **Step 2: 类型检查**

  Run: `pnpm exec tsc --noEmit`
  Expected: 无错误输出（退出码 0）。`LectureBlock` 各成员字段（如 `callout.tone` 仅 info/warn/tip、`list.items` 为 string[]、`code.lang`）均合法。

---

### Task 2: 集成验证（lint + build + 页面通读）

**Files:** 无（仅验证）

- [ ] **Step 1: Lint**

  Run: `pnpm lint`
  Expected: 无 error（无 `any`、无未用变量）。

- [ ] **Step 2: Build**

  Run: `pnpm build`
  Expected: 构建成功；`/ai-coding/[stage]` 仍预生成含 `ai-tools` 在内的 3 个路径。

- [ ] **Step 3: 页面通读验证**

  Run: `pnpm dev`（端口 8666），浏览器访问 `http://localhost:8666/ai-coding/ai-tools`，逐项确认：
  - 五段内容按顺序渲染，heading/paragraph/list/code/callout 版式正常，暗色 + cyan 强调风格一致，窄屏正常。
  - 零基础视角通读：无未解释术语、无油腻话术、现实门槛表述中性克制、不排名、主推路径步骤完整可跟。
  - 列表页 `/ai-coding` 卡片与底部上一/下一阶段导航不受影响。

- [ ] **Step 4（可选）: 提交**

  仅添加本计划涉及文件，避免裹挟无关暂存改动：

  ```bash
  git add community/src/lib/content/ai-coding.ts
  git commit -m "feat(community): AI工具篇第一部分——AI工程工具选型与安装入门讲义"
  ```

---

## 自检（Self-Review）

- **Spec 覆盖**：开篇/两层认知/认识选手/对号入座/手把手安装（Task 1 五段）、载体与类型约束（Task 1 约束）、口吻与现实门槛口径（Task 1 约束）、验收标准（Task 2）——spec 各项均有对应。
- **占位符扫描**：本计划不含 TBD/TODO；内容的「真实 prose」在执行时按各段要点产出（内容创作本质，非计划缺口）；代码示例用「以官方为准」注释而非写死版本，是有意设计。
- **类型一致性**：仅使用 `ai-coding.ts` 已定义的 `LectureBlock` 成员与字段名；不引入新类型、不改 getter 与渲染组件签名。
