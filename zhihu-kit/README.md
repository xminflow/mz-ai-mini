# zhihu-kit

《自媒体运营实战》知乎专栏的写作仓库——**手册的免费公开版**。

把已在官网会员区上线的《自媒体运营手册》（8 卷 80 节），按节级颗粒度压缩、改写成知乎长文。一节 = 一篇知乎文，共 82 篇（含 2 篇序章）。

本子工程是**纯文档库**：没有 Python 代码、没有 CLI、没有依赖。只有 Markdown 与素材。

## 内容溯源（重要）

知乎专栏不是另一份独立创作，它的每一节都严格对应手册里的一节：

| 用途 | 路径 | 说明 |
|------|------|------|
| **节级结构索引** | `ua-agent/frontend/resources/skills/weelume-playbook-advisor/references/vol01-vol08.md` | 8 份 Markdown，定义"专栏一共有多少节、节标题叫什么、节内要点是什么"——是节号和标题的唯一来源 |
| **改写源（正文蓝本）** | `website/src/app/(playbook)/playbook/<chapter>/page.tsx` | 10 个会员页 React 组件，承载手册成品正文。改写知乎文时以此为蓝本，压缩、改口吻、去会员页排版痕迹 |
| **创作计划** | `asserts/2026-05-17-自媒体运营手册-book.md` | 手册创作意图、字数预算、立场基线，遇到歧义回查此文件 |

知乎与手册的关系：

- ✅ 内容股一致（不能讲手册不讲的）
- ✅ 篇幅相当或略长（手册节 5000-8000 字，知乎文 **7000-8000 字**——不是压缩版，是叙事展开版）
- ✅ 改形态（手册是表格/工具卡片/清单为主的工具书，知乎是叙事段落+案例为主的长文）
- ✅ 改口吻（手册是付费产品的庄重笔触，知乎是吸读者上钩的钩子化叙事）
- ❌ 不能搬手册原段（必须改写。一字不改照贴会导致会员价值稀释）
- ❌ 不能透露会员页 URL / 引导购买（默认走品牌名「微域生光」自然传播）

## 目录约定

```
zhihu-kit/
├── README.md           本文件
├── column-map.md       专栏全局篇目地图（82 篇 + 状态 + 改写源）
├── style-guide.md      写作规范（口吻、禁忌、改写策略、品牌叙事、引用约定）
├── articles/           已定稿、准备发布或已发布的正文
│   ├── 00-preface/     序章 2 篇
│   ├── vol1-foundations/   底层逻辑（7 篇）
│   ├── vol2-positioning/   定位（10 篇）
│   ├── vol3-topics/        选题与素材库（9 篇）
│   ├── vol4u-copy/         文案与通用结构（9 篇）
│   ├── vol4d-scripts/      四型脚本（4 篇）
│   ├── vol5-production/    拍摄·剪辑·表现力（11 篇）
│   ├── vol6-growth/        增长·算法·投放（11 篇）
│   ├── vol7-monetization/  变现与商业模式（11 篇）
│   └── vol8-industry/      行业战斗卷（8 篇）
├── drafts/             草稿（与 articles/ 同结构镜像）
├── outlines/           详细大纲（写作前先出大纲）
└── assets/
    ├── cases/          引用的真实案例素材（可来自 research-kit 既往报告，已匿名化）
    └── figures/        自制图表、对比表
```

文件命名：`<vol-dir>/<节号>-<slug>.md`，例 `articles/vol1-foundations/1.0-three-axioms.md`。

## 写作流程

1. **出大纲**：`outlines/<vol-dir>/<节号>-<slug>.md`。要点全部从对应 `vol0X.md` 索引节抽取，钩子从 `page.tsx` 正文里挑反常识结论。
2. **扩写草稿**：`drafts/<vol-dir>/<节号>-<slug>.md`。以 `page.tsx` 正文为蓝本叙事化展开到 **7000-8000 字**，拆掉表格/工具卡片改成段落，重写口吻，加入 2-3 个匿名化案例（含 1 个失败对比案例，可从 `research-kit/output/...` 抽，避开手册原例）。
3. **定稿**：`git mv drafts/... articles/...`，更新 `column-map.md` 状态。
4. **发布**：复制 `articles/...` 内容到知乎，回填 `column-map.md` 的"知乎 URL"列与发布日期。

## 边界

- 本仓库**不**直接调用 research-kit / website 代码。源头文件只读不改。
- 本仓库**不**做发布自动化。知乎无开放 API，复制粘贴即可。
- 未来若要批量化（例如让 LLM 按 `page.tsx → drafts/.md` 跑一遍），再加 `.claude/skills/`；当前阶段不引入。

## 关键参照（写作时直接读）

- `D:\code\weelume-base\ua-agent\frontend\resources\skills\weelume-playbook-advisor\references\vol0X-*.md`（节级索引）
- `D:\code\weelume-base\website\src\app\(playbook)\playbook\<chapter>\page.tsx`（改写源正文）
- `D:\code\weelume-base\asserts\2026-05-17-自媒体运营手册-book.md`（创作计划）
- `D:\code\weelume-base\CLAUDE.md`（项目硬约束）
- `style-guide.md`（本仓库写作规范）
