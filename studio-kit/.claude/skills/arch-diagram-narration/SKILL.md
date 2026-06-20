---
name: arch-diagram-narration
description: 把一个技术主题/需求做成"技术方案 + drawio 架构/流程图 + 本人音色讲解"的横版视频。先出文字方案确认，再出 drawio 多图导 PNG 预览确认，再做 json 与视频。触发词：架构讲解视频、技术方案视频、把架构讲一遍、arch-diagram-narration。
---

# arch-diagram-narration

把用户提供的技术主题/需求，做成 **1920×1080 横版架构讲解视频**：先以文字方案确认内容范围，再用 drawio 绘制架构/流程/时序图（含高亮变体），批量导出 PNG 给用户预览确认，最后写 `script.json` 并调 CLI 合成配音视频。

本 skill 负责**起草文字方案 → Gate 1 确认 → 写 drawio → 导 PNG → Gate 2 预览确认 → 写 script.json → 调用 CLI 渲染**。CLI 负责校验、TTS、ffmpeg 合成，skill 不重复实现这些能力。

**两道强制确认门（无例外）**：

1. **🚦 Gate 1**：起草文字技术方案后，**必须**让用户确认，未确认禁止往下（禁止写 drawio / 导图 / 做视频）。
2. **🚦 Gate 2**：导出 PNG 后，**必须**让用户预览 `images\` 里的图片确认，未确认禁止写 `script.json` / 渲染视频。

**即使用户说"你看着办"也必须先出内容让其确认，无例外。**

管线（标注两个强制人工卡点）：

```
Step 0  路径硬等式               (锁定 slug / run_id / workspace，不推断)
   ↓
Step 1  起草文字技术方案          (目标 / 分层组件 / 关键流程 / 选型)
   ↓
   ⏸️  Gate 1：用户确认文字方案   ← 强制人工卡点，禁止跳过
   ↓ 用户确认
Step 2  写 drawio 多图            (diagrams\*.drawio，含高亮变体)
   ↓
Step 3  导出 PNG                  (drawio-export CLI，输出 images\)
   ↓
   ⏸️  Gate 2：用户预览图片确认   ← 强制人工卡点，禁止跳过
   ↓ 用户确认
Step 4  写 script.json            (ArchVideoDoc，段落映射到 PNG)
   ↓
Step 5  渲染视频                  (arch-video CLI → final.mp4)
   ↓
output\arch\<slug>\<run_id>\final.mp4
```

---

## Step 0：路径硬等式与前提确认

在执行任何步骤之前，**必须**先确认并锁定以下变量。这些是路径硬等式，不允许后续任何步骤自行推断或修改。

```
slug       = <用户指定或从标题推断的英文 slug，如 im-arch / aicamp-arch>
run_id     = <用户指定或日期，如 20260620>
workspace  = D:\code\weelume-base\studio-kit\output\arch\<slug>\<run_id>
kit_root   = D:\code\weelume-base\studio-kit

workspace 子目录：
  diagrams\   ← .drawio 文件（基础图 + 高亮变体）
  images\     ← 导出的 PNG
  audio\      ← TTS 音频（CLI 自动产出）
  clips\      ← 片段 mp4（CLI 自动产出）
  final.mp4   ← 最终合成视频
```

> `workspace` 固定落在 `output\arch\...`，不允许与其他产物目录混用。

**确认动作**：若用户未提供 `slug` 或 `run_id`，从主题/日期推断后**展示给用户确认**，不允许直接沿用。确认后在回复中展示锁定的路径表，再开始 Step 1。

---

## Step 1：起草文字技术方案

根据用户提供的主题/需求，起草一份结构化文字技术方案，包含以下内容：

1. **视频目标**：一句话说明视频要讲什么、面向什么受众。
2. **图的规划**：列出本次需要绘制的所有 drawio 图（基础图 + 高亮变体），说明每张图的主题与用途。例如：
   - `arch.drawio`（基础总览图）
   - `arch.client.drawio`（客户端层高亮变体，其余层压暗）
   - `arch.logic.drawio`（逻辑层高亮变体）
3. **分层组件清单**：列出架构/流程/时序的主要层次或节点，说明各自职责。
4. **讲解段落规划**：说明每段讲什么、对应哪张图/变体。
5. **选型与设计亮点**（可选）：若有值得特别说明的技术选型或设计决策，在此列出。

**文案要求**：面向零技术背景也能听懂——术语要口语化；单段 narration 目标 40-80 字。

---

## 🚦 Gate 1：用户确认文字方案（强制卡点，无例外）

> ⛔ **本卡点是强制人工卡点**。任何情况下，**必须**先完整输出文字技术方案给用户确认，**未得到用户明确确认禁止往下**（禁止写 drawio、禁止导图、禁止做视频）。
>
> ⛔ 哪怕用户说"你看着办""你定""直接做"，仍要先出方案——因为图的规划和讲解段落划分是否符合用户预期，必须由用户确认。**这条没有例外。**
>
> ⛔ 不允许在 Step 1 方案出来后直接跳到 Step 2。

**必须输出的确认格式**：

```
## 文字技术方案（请确认后我再写 drawio 图）

视频目标：<一句话>

图的规划（共 N 张）：
| 文件名 | 用途 |
|--------|------|
| arch.drawio | 基础总览图 |
| arch.<focus>.drawio | <focus> 层高亮变体 |
| … | … |

分层/节点清单：
- <层/节点名>：<职责说明>
- …

讲解段落规划（共 N 段）：
| 段 | 对应图 | 讲解要点 |
|----|--------|----------|
| 0  | arch.drawio | 总览，一句话点出定位 |
| 1  | arch.<focus>.drawio | <focus> 层：职责 + 关键组件 |
| … | … | … |

请确认：
1. 图的规划是否完整、正确？
2. 讲解段落划分是否符合预期？
3. 有无需要新增/删除/调整的内容？

确认后（回复"确认"或给出修改意见），我再写 drawio 图。
```

**确认后的处理规则**：
- 用户回复"确认"或类似明确确认 → 进入 Step 2。
- 用户提出修改意见 → 按意见修改方案后**重新输出完整方案**，等待再次确认。
- **没有用户明确确认前，禁止写 drawio**。

### Gate 1 门禁自检（写 drawio 之前在内心走一遍）

- [ ] 我在上一轮回复中**确实**输出过完整文字技术方案吗？
- [ ] 用户**确实**明确回复了确认吗？（"确认" / "可以" / "按这个来" 等明确表态）
- [ ] 用户没有提出未处理的修改意见吗？

任一项答"否"——**回到 Step 1 重新输出方案**，不允许写 drawio。

---

## Step 2：写 drawio 多图

通过 Gate 1 后，按方案在 `<workspace>\diagrams\` 下创建所有 drawio 文件。

### drawio 文件命名约定

- **基础图**：`<id>.drawio`，如 `arch.drawio`、`flow.drawio`
- **高亮变体**：`<id>.<focus>.drawio`，如 `arch.client.drawio`（表示客户端层高亮的变体）
- 图型不限：架构图、流程图、时序图，drawio 原生均支持

### drawio 画布与品牌约定（硬约束）

所有 drawio 文件必须满足以下约定：

1. **深色画布**：`mxGraphModel` 属性 `background="#12141C"`，不允许使用其他背景色。
2. **品牌角标**：右下角必须放一个文本元素，内容固定为 `微域生光 | 十一AI编程`，`fontColor=#8FA0B5`，`align=right`。参考结构：
   ```xml
   <mxCell id="brand" value="微域生光 | 十一AI编程"
     style="text;html=1;fontColor=#8FA0B5;fontSize=12;align=right;verticalAlign=middle;"
     vertex="1" parent="1">
     <mxGeometry x="1060" y="740" width="300" height="30" as="geometry" />
   </mxCell>
   ```
3. **禁止出现**：`weelume`、任何域名、任何英文品牌名——包括图内文本、标题、注释。

### 字号规范（硬约束，竖版 1080×1920）

字号要够大、手机上清晰可读。架构图按以下标准（已验证）：

| 元素 | fontSize | 说明 |
|------|----------|------|
| 图标题 | **54** | 顶部白字加粗居中 |
| 节点主标题 | **28~30** 加粗 | 节点框主文案 |
| 节点括号说明 | **19** 小灰字 | 长说明用「主+副两级」HTML，避免溢出（见下） |
| 层标签（竖排 strip） | **24** | 左侧竖排层名 |
| 辅助标注（如被测边界） | **22** | |
| 顶栏 CTA / 品牌角标 | **26 / 22** 加粗 | 见下「顶栏与字幕约定」 |

**长文本节点用「主+副两级」HTML value**（主标题大、括号说明小，防溢出）。例：
```xml
<mxCell id="cN" value="&lt;b style=&quot;font-size:30px&quot;&gt;任务配置&lt;/b&gt;&lt;br&gt;&lt;span style=&quot;font-size:19px;color:#A9B4C2&quot;&gt;选知识库 · 评测集 · 指标&lt;/span&gt;"
  style="rounded=1;html=1;whiteSpace=wrap;fillColor=#283142;strokeColor=#4DA3FF;strokeWidth=1.5;fontColor=#EAEEF5;" .../>
```
短标题节点直接 `fontSize=28`。务必 `html=1` 才能渲染 HTML value。

### 顶栏与字幕约定（竖版讲解视频）

- **满画布背景矩形**：每张图第一个 cell 放 `fillColor=#12141C;strokeColor=none;` 的 0,0→1080×1920 矩形，强制 draw.io 按页面尺寸导出（否则按内容包围盒裁切，比例错乱）。
- **顶栏（y≈44）**：左侧亮橙 CTA `评论区扣 666 · 进群免费领 AI 编程与 AI 大模型学习资料`（`fontColor=#FBBF77;fontStyle=1;fontSize=26;align=left;`），右侧亮蓝品牌 `微域生光 | 十一AI编程`（`fontColor=#9DC8FF;fontStyle=1;fontSize=22;align=right;`），两段不重叠。
- **内容区 y≈230~1650；底部 y≈1660~1920 留空给字幕**（CLI 用 `ARCH_PORTRAIT`：字幕底部居中、字号 64、距底 210，落在留白带不压图）。
- 渲染竖版加 `--portrait`：`uv run studio-kit arch-video --script <...> --portrait`。
- 封面用爆款风（标签 pill + 「评论区扣 666」旋转贴纸 + 数字徽章 + 大字阴影）。

### 高亮变体规则

高亮变体用于把讲解焦点落到特定区域，其余区域压暗，实现视觉聚焦：

- **目标区域**（当前讲解对象）：保持原始 `style` 不变，正常显示。
- **非目标区域**（其余 cell）：在原 `style` 字符串末尾追加 `opacity=25;`，使其半透明压暗。
- **每个变体对应一张 PNG**，用于 `script.json` 中的对应讲解段。

**高亮变体示例（`arch.client.drawio`，客户端层高亮，逻辑层压暗）**：
```xml
<!-- 客户端层：保持正常 -->
<mxCell id="band_client" value="" style="rounded=1;html=1;fillColor=#1B2130;strokeColor=#4DA3FF;strokeWidth=2;arcSize=3;" .../>
<!-- 逻辑层：追加 opacity=25; 压暗 -->
<mxCell id="band_logic" value="" style="rounded=1;html=1;fillColor=#1B2130;strokeColor=#A78BFA;strokeWidth=2;arcSize=3;opacity=25;" .../>
```

### 推荐配色（可选参考）

| 层次 | 强调色 | 适用场景 |
|------|--------|----------|
| 客户端/前端 | `#4DA3FF`（蓝） | Web / App / 桌面端 |
| 业务逻辑 | `#A78BFA`（紫） | API / 核心服务 |
| 数据层 | `#34D399`（绿） | 数据库 / 缓存 |
| 基础设施 | `#FB923C`（橙） | 中间件 / 消息队列 |
| 外部服务 | `#22D3EE`（青） | 第三方 API / 网关 |

---

## Step 3：导出 PNG

写完所有 drawio 文件后，用 `drawio-export` 命令批量导出为 PNG：

```bash
cd D:\code\weelume-base\studio-kit && uv run studio-kit drawio-export --src <workspace>\diagrams --out <workspace>\images
```

成功后 `<workspace>\images\` 下应有与每个 `.drawio` 文件同名的 PNG，如 `arch.png`、`arch.client.png`。

若导出失败（drawio exe 缺失 / 退出码非零），命令会明确报错，不会静默兜底——必须先解决环境问题再继续。

> 若需覆盖已有 PNG，加 `--force` 标志。

---

## 🚦 Gate 2：用户预览图片确认（强制卡点，无例外）

> ⛔ **本卡点是强制人工卡点**。导出 PNG 后，**必须**让用户预览 `images\*.png` 里的图片，**未得到用户明确确认禁止写 `script.json`、禁止渲染视频**。
>
> ⛔ 哪怕用户说"你看着办""图应该没问题""直接渲染吧"，仍要停下来请用户看图确认——因为 drawio 文件内容、高亮变体效果、品牌角标是否正确，必须由用户目视核验。**这条没有例外。**
>
> ⛔ 不允许在 Step 3 导出完成后直接跳到 Step 4。

**必须输出的确认提示**：

```
PNG 已导出至 <workspace>\images\，共 N 张：
  arch.png              ← 基础总览图
  arch.client.png       ← 客户端层高亮变体
  arch.logic.png        ← 逻辑层高亮变体
  …

请打开 images\ 文件夹预览每张图，核查：
1. 画面内容与文字方案中的图规划是否一致？
2. 高亮变体中目标区域是否清晰、非目标区域是否压暗（opacity=25）？
3. 每张图右下角是否有品牌角标"微域生光 | 十一AI编程"？
4. 画面中无 weelume、无域名、无英文品牌名？

确认后（回复"确认"或指出需要修改的图），我再写 script.json 并渲染视频。
```

**确认后的处理规则**：
- 用户回复"确认"或类似明确确认 → 进入 Step 4。
- 用户指出某张图有问题 → 修改对应 drawio 文件并重跑导出，再次请用户预览确认。
- **没有用户明确确认前，禁止 Write `script.json`**。

### Gate 2 门禁自检（写 script.json 之前在内心走一遍）

- [ ] 我在上一轮回复中**确实**输出过图片预览确认提示吗？
- [ ] 用户**确实**明确回复了确认吗？
- [ ] 用户没有提出未处理的图片修改意见吗？

任一项答"否"——**回到 Gate 2 请用户预览确认**，不允许写 script.json。

---

## Step 4：写 script.json

通过 Gate 2 后，写 `<workspace>\script.json`，结构严格匹配 `ArchVideoDoc` schema。

**ArchVideoDoc JSON 结构**：

```json
{
  "slug": "<英文 slug，与 workspace 路径一致>",
  "run_id": "<run_id，与 workspace 路径一致>",
  "title": "<视频中文标题>",
  "subtitle": "<副标题，可为空字符串，也可省略>",
  "segments": [
    {
      "index": 0,
      "narration": "<讲解文案，非空，40-80 字，口语化>",
      "image": "images/arch.png"
    },
    {
      "index": 1,
      "narration": "<讲解文案>",
      "image": "images/arch.client.png"
    }
  ]
}
```

**字段约束（写入前必须自查）**：

- `segments[i].index` 必须等于 `i`（从 0 连续，不允许跳跃）。
- `segments[i].narration` 不得为空字符串或纯空白。
- `segments[i].image` 必须指向 `images/` 下已导出的 PNG（相对工作区路径）；高亮段指向对应高亮变体 PNG（如 `images/arch.client.png`）。
- `title`、`subtitle`、`narration` 所有字段不得含 `weelume`、`.com`、任何英文品牌名、任何域名。

**narration 文案要求**：
- 面向零技术背景也能听懂——术语口语化（不说"微服务"说"独立的小程序"；不说"负载均衡"说"分流器"）。
- 单段建议 40-80 字，控制在一口气能说完的长度。
- 每段必须说出该图/区域**做什么、为什么这样设计**中的至少一项，禁止空话套话。

---

## Step 5：渲染视频

写完 `script.json` 后，调用 CLI 生成 `final.mp4`：

```bash
uv run studio-kit arch-video --script <workspace>\script.json
```

> GPU 不可用时，先用 `--backend placeholder` 验证画面与字幕是否正确，再补跑真音色版：
>
> ```bash
> uv run studio-kit arch-video --script <workspace>\script.json --backend placeholder
> ```

成功后 `<workspace>\final.mp4` 存在，向用户报告产物路径与人工核验要点：

- 每段讲解是否与对应图片一致（讲哪段配哪张图）
- 高亮变体效果是否清晰（目标区域显眼，非目标区域压暗）
- 右下角角标是否显示 `微域生光 | 十一AI编程`
- 画面/字幕无 `weelume`、无域名、无英文品牌

---

## 品牌铁律（硬约束，适用全流程）

> **可见层只允许 `微域生光 | 十一AI编程`。**
>
> 以下内容**绝对禁止**出现在 drawio 图内文本、`title`、`subtitle`、`narration` 及任何 JSON 字段中，也绝对禁止出现在画面或字幕中：
> - `weelume`（任何大小写变体）
> - `weelume.com`
> - 任何以 `.com`、`.cn`、`www.`、`http` 开头或结尾的域名/外链
> - 任何英文品牌名

违反此铁律的内容必须在写入前重写，不允许依赖 CLI 侧拦截。

---

## 禁止事项

- **禁止跳过 Gate 1**——文字方案未确认，禁止写 drawio / 导图 / 做视频。无论用户怎么说"直接做""你定就行"。
- **禁止跳过 Gate 2**——PNG 未经用户预览确认，禁止写 `script.json`、禁止渲染视频。
- **禁止写入任何英文品牌 / 域名**——可见层只能出现 `微域生光 | 十一AI编程`，drawio 文本与字幕同此约束。
- **禁止 `segments[i].index != i`**——index 必须从 0 连续，`ArchVideoDoc` schema 校验会抛错。
- **禁止 `narration` 为空**——每段必须有实质讲解内容。
- **禁止 `image` 引用不存在的 PNG**——所有 `image` 路径必须已在 Step 3 实际导出。
- **禁止高亮变体中遗漏 `opacity=25`**——非目标 cell 必须在 `style` 末尾追加 `opacity=25;`，否则没有聚焦效果。
- **禁止 drawio 文件遗漏深色背景**——`background="#12141C"` 是视频风格的基础，遗漏会导致图片背景变白。
- **禁止共用其他 skill 的 workspace 目录**——arch 产物必须落在 `output\arch\...`，不得与 xhs / shortvideos 目录混用。

---

## 产物清单（完成后向用户报告）

```
workspace = D:\code\weelume-base\studio-kit\output\arch\<slug>\<run_id>
├── diagrams\
│   ├── arch.drawio              （基础图，Step 2 产出）
│   ├── arch.client.drawio       （高亮变体，Step 2 产出）
│   └── …（其余变体）
├── images\
│   ├── arch.png                 （Step 3 导出）
│   ├── arch.client.png          （Step 3 导出）
│   └── …
├── script.json                  （Step 4 Gate 2 确认后写出）
├── audio\
│   ├── 00.wav / 00.meta.json    （CLI 自动产出）
│   └── …
├── clips\
│   ├── 00.mp4                   （CLI 自动产出）
│   └── …
└── final.mp4                    （1920×1080 横版讲解视频，Step 5 产出）

人工核验要点：
- 每段讲解与对应图片一致
- 高亮变体聚焦效果正确（目标区域正常，非目标 opacity=25 压暗）
- 右下角角标：微域生光 | 十一AI编程
- 画面/字幕无 weelume、无域名、无英文品牌
```
