---
name: arch-diagram-narration
description: 把一份架构描述/文档做成"横版架构图 + 本人音色逐段讲解 + 讲到哪层高亮哪层"的解说视频（1920×1080 mp4）。触发词：架构图讲解视频、把架构讲一遍、架构讲解、arch-diagram-narration。
---

# arch-diagram-narration

把用户提供的架构描述/文档，自动转成 **1920×1080 横版架构图讲解视频**：每段讲解对应架构图一个高亮区域，讲到哪层亮哪层，配本人音色 TTS 朗读，ffmpeg 合成 final.mp4。

本 skill 负责**起草 `ArchDoc` 结构 → 强制用户确认 → 写 `script.json` → 调用 CLI 渲染**。CLI (`studio-kit arch-video`) 负责校验、TTS 合成、录屏、合成，skill 不重复实现这些能力。

**核心约束**：
1. **🚦 Step 3 强制用户确认（无例外）**——先输出**讲解大纲 + 每段文案 + 每段高亮目标清单**给用户确认；**未确认禁止写 `script.json`、禁止渲染**。即使用户说"你看着办"也必须先出清单让其确认，呼应用户长期偏好——这条没有例外。
2. **品牌铁律（硬约束）**——可见层只允许 `微域生光 | 十一AI编程`；**禁止** `weelume.com`、任何域名、任何英文品牌名出现在画面或字幕。`script.json` 内的 `title`、`subtitle`、`narration` 所有字段均适用。
3. **highlight 引用必须存在**——所有 `segment.highlight` 引用的 layerId / nodeId 必须在 `diagram` 中确实存在，否则 CLI 校验会报错（`ArchDoc` 模型校验器会拒绝悬空引用）。
4. **讲解顺序**——先 `highlight:"all"` 总览，再逐层 `highlight:"<layerId>"`，关键服务用 `highlight:["<nodeId>"]` 点到框。不得随意打乱。
5. **排版约束**——层数建议 ≤7、每层框 ≤5（横版 1920px 宽度约束，超出会挤压可读性）。

管线（带用户确认卡点）：

```
Step 0 路径硬等式          (锁定变量，不推断)
   ↓ 确认 source / slug / run_id / workspace
Step 1 抽取图模型          (自动：从 source 抽 layers + nodes，配强调色)
   ↓ diagram 草稿
Step 2 起草讲解段          (自动：总览 → 逐层 → 关键节点，口语化措辞)
   ↓ segments 草稿
Step 3 ⏸️ 强制用户确认     (强制人工卡点，没确认禁止往下)
   ↓ 用户确认或修正
Step 4 Write script.json  (自动，严格匹配 ArchDoc schema)
   ↓
Step 5 渲染               (自动调用 studio-kit arch-video)
   ↓
output/arch/<slug>/<run_id>/final.mp4
```

---

## Step 0：路径硬等式与前提确认

在执行任何步骤之前，**必须**先确认并锁定以下变量。这些是路径硬等式，不允许后续任何步骤自行推断或修改。

```
source        = <用户提供的架构描述/文档绝对路径，或对话中给出的架构要点>
slug          = <用户指定或从标题推断的英文 slug，如 im-arch / aicamp-arch>
run_id        = <用户指定或日期，如 20260620>
workspace     = D:\code\weelume-base\studio-kit\output\arch\<slug>\<run_id>
kit_root      = D:\code\weelume-base\studio-kit
```

> `workspace` 固定落在 `output\arch\...`，不允许与其他产物目录混用。

**确认动作**：

- 若 `source` 是文件路径，用 Read 读取确认文件存在；若是对话要点，在回复中原文复述给用户确认。
- 若用户未提供 `slug` 或 `run_id`，从标题/日期推断后**展示给用户确认**，不允许直接沿用。
- 确认后在回复中展示锁定的路径表，再开始 Step 1。

---

## Step 1：抽取架构图模型（diagram）

从 `source` 中识别架构层次结构，按 `ArchDiagram` 格式组织：

**layer（层）字段规则**：
- `id`：英文 slug，如 `client`、`logic`、`infra`（全局唯一，不得重复）
- `title`：中文层名，如 `客户端层`、`业务逻辑层`
- `accent`：深色系强调色（十六进制），用不同颜色区分不同层，推荐配色：
  - 蓝系 `#4DA3FF`（客户端/前端）
  - 紫系 `#A78BFA`（业务逻辑）
  - 绿系 `#34D399`（数据层）
  - 橙系 `#FB923C`（基础设施/中间件）
  - 青系 `#22D3EE`（外部服务/网关）

**node（框）字段规则**：
- `id`：形如 `<layerId>.<name>`，如 `client.mobile`、`logic.msg`（全局唯一）
- `title`：组件/服务中文名，如 `iOS/Android`、`消息服务`
- `sub`：副标题（可空），如技术栈说明 `本地缓存`、`Redis`
- `accent`：可空，若节点需要特殊强调色可覆盖所属层颜色

**排版约束**（硬约束，写进 diagram 前自查）：
- 层数 ≤7（横版排布，超出会挤压到不可读）
- 每层框数 ≤5（横向平铺，超出会溢出）
- 若原始架构超出约束，**必须合并次要节点**，并说明合并决策

---

## Step 2：起草讲解段（segments）

按以下固定顺序起草讲解段，**不得跳过或重排**：

1. **第 0 段（总览）**：`highlight: "all"`，用 1-2 句话点出这套架构的整体定位和核心价值，引出分段讲解。
2. **逐层段**：对每个 layer 各出 1 段，`highlight: "<layerId>"`，说明该层的职责和关键组件。若某层只有 1 个框，可考虑直接用 `highlight: ["<nodeId>"]`。
3. **关键节点段（按需）**：对技术上关键或用户关心的具体服务，出 `highlight: ["<nodeId>"]` 点亮单框，深入说明其作用或设计决策。

**讲解文案要求**：
- 面向**零技术背景也能听懂**——术语要口语化（不说"微服务"说"独立的小程序"；不说"负载均衡"说"分流器"）。
- 单段 narration 建议 **40-80 字**，控制在一口气能说完的长度。
- 禁止出现：`weelume`、`weelume.com`、任何英文品牌、任何域名、任何外链文字。
- 禁止空话套话：每段必须说出该层/框**做什么、为什么这样设计**中的至少一项。

---

## Step 3：🚦 强制用户确认（硬约束，无例外）

> ⛔ **本步骤是强制人工卡点**。任何情况下，**必须**先完整输出讲解大纲给用户确认，**未得到用户明确确认禁止写 `script.json`、禁止调用渲染命令**。
>
> ⛔ 哪怕用户说"你看着办""你定""直接做"，仍要先出清单——因为用户不知道高亮顺序和文案是否符合他的预期，强制确认是用户长期偏好（见 MEMORY）。
>
> ⛔ 不允许在 Step 2 草稿出来后直接跳到 Step 4。

**必须输出的确认清单格式**：

```
## 架构图讲解大纲（请确认后我再生成 script.json）

架构标题：<title>
架构副标题：<subtitle 或 无>
总段数：N 段

| 段 | 高亮目标 | 文案（narration） |
|----|---------|-----------------|
| 0  | 全图高亮 (all) | <第0段文案，≤80字> |
| 1  | 层：<layerId> (<layerTitle>) | <第1段文案> |
| 2  | 层：<layerId> (<layerTitle>) | <第2段文案> |
| …  | …       | …               |
| N  | 框：<nodeId> (<nodeTitle>) | <第N段文案> |

diagram 层次预览：
- <layer1.title>（accent: <color>）：<node1>, <node2>, …
- <layer2.title>（accent: <color>）：<node1>, …
- …

请确认：
1. 层次结构是否完整、正确？
2. 讲解顺序和文案是否符合预期？
3. 有无需要新增/删除/调整的内容？

确认后（回复"确认"或给出修改意见），我再写 script.json 并开始渲染。
```

**确认后的处理规则**：
- 用户回复"确认"或类似明确确认 → 进入 Step 4。
- 用户提出修改意见 → 按意见修改清单后**重新输出**，等待再次确认。
- 用户说"第 N 段换个说法" → 修改对应段后再次展示完整清单确认。
- **没有用户明确确认前，禁止 Write `script.json`**。

### Step 3 门禁自检（写 script.json 之前在内心走一遍）

- [ ] 我在上一轮回复中**确实**输出过完整讲解清单（含每段文案和高亮目标）吗？
- [ ] 用户**确实**明确回复了确认吗？（"确认" / "可以" / "按这个来" 等明确表态）
- [ ] 用户没有提出未处理的修改意见吗？

任一项答"否"——**回到 Step 3 重新输出确认清单**，不允许写 script.json。

---

## Step 4：Write script.json

通过 Step 3 门禁后，写 `<workspace>\script.json`，结构严格匹配 `ArchDoc` schema。

**ArchDoc JSON 结构（字段精确，不得增删）**：

```json
{
  "slug": "<英文 slug>",
  "run_id": "<run_id>",
  "title": "<架构中文标题>",
  "subtitle": "<副标题，可为空字符串>",
  "diagram": {
    "layers": [
      {
        "id": "<layerId>",
        "title": "<层中文名>",
        "accent": "<十六进制色，如 #4DA3FF>",
        "nodes": [
          {
            "id": "<layerId.name>",
            "title": "<组件中文名>",
            "sub": "<副标题，可为空字符串>",
            "accent": "<可为空字符串，覆盖层色>"
          }
        ]
      }
    ]
  },
  "segments": [
    {
      "index": 0,
      "narration": "<讲解文案，非空>",
      "highlight": "all"
    },
    {
      "index": 1,
      "narration": "<讲解文案>",
      "highlight": "<layerId>"
    },
    {
      "index": 2,
      "narration": "<讲解文案>",
      "highlight": ["<nodeId>"]
    }
  ]
}
```

**`highlight` 合法值**：
- `"all"`：全图高亮（总览段）
- `"<layerId>"`：高亮整层（layerId 必须在 diagram.layers 中存在）
- `["<layerId|nodeId>", ...]`：高亮指定层或框（每个引用必须在 diagram 中存在）

**写完后必须自检**：
- `segments[i].index` 必须等于 `i`（从 0 连续，不允许跳跃）
- 所有 `highlight` 引用的 id 必须在 `diagram` 中存在（CLI 校验 `ArchDoc` 时会抛错）
- `narration` 不得为空字符串或纯空白
- `title`、`narration` 任何字段不得含 `weelume`、`.com`、任何英文品牌名
- `diagram.layers` 中 layer id 全局唯一，node id 全局唯一

---

## Step 5：渲染

写完 `script.json` 后，调用 CLI 生成 `final.mp4`：

```bash
cd D:\code\weelume-base\studio-kit && uv run studio-kit arch-video --script <workspace>\script.json
```

> GPU 不可用时，先用 `--backend placeholder` 验证画面与字幕是否正确，再补跑真音色版：
>
> ```bash
> cd D:\code\weelume-base\studio-kit && uv run studio-kit arch-video --script <workspace>\script.json --backend placeholder
> ```

成功后 `<workspace>\final.mp4` 存在，向用户报告产物路径与人工核验要点：
- 分段高亮是否与讲解文案对应（讲哪层亮哪层）
- 右下角角标是否显示 `微域生光 | 十一AI编程`
- 画面/字幕无 `weelume`、无域名、无英文品牌

---

## 品牌铁律（硬约束，适用全流程）

> **可见层只允许 `微域生光 | 十一AI编程`。**
>
> 以下内容**绝对禁止**出现在 `title`、`subtitle`、`narration`、任何 JSON 字段中，也绝对禁止出现在画面或字幕中：
> - `weelume`（任何大小写变体）
> - `weelume.com`
> - 任何以 `.com`、`.cn`、`www.`、`http` 开头或结尾的域名/外链
> - 任何英文品牌名

违反此铁律的 `script.json` 必须在写入前重写，不允许依赖 CLI 侧拦截。

---

## 禁止事项

- **禁止跳过 Step 3 确认卡点**——无论用户怎么说"你定就行""直接做"，都必须先出清单。
- **禁止写入任何英文品牌 / 域名**——可见层只能出现 `微域生光 | 十一AI编程`。
- **禁止在 `highlight` 中引用不存在的 layerId / nodeId**——CLI 校验会直接拒绝，且会浪费渲染时间。
- **禁止 `segments[i].index != i`**——index 必须从 0 连续，schema 校验会抛错。
- **禁止 `narration` 为空**——每段必须有实质讲解内容。
- **禁止超出排版约束**（层 >7 / 每层框 >5）——超出需合并节点并说明理由，不允许直接写入。
- **禁止共用其他 skill 的 workspace 目录**——arch 产物必须落在 `output\arch\...`，不得与 xhs / shortvideos 目录混用。

---

## 产物清单（完成后向用户报告）

```
workspace = D:\code\weelume-base\studio-kit\output\arch\<slug>\<run_id>
├── script.json    （Step 4 用户确认后写出）
├── audio/
│   ├── 00.wav / 00.meta.json
│   ├── 01.wav / 01.meta.json
│   └── …
├── clips/
│   ├── 00.mp4
│   ├── 01.mp4
│   └── …
└── final.mp4      （1920×1080 横版讲解视频，Step 5 产出）

人工核验要点：
- 分段高亮与讲解文案对应（讲哪层亮哪层，讲哪框亮哪框）
- 右下角角标：微域生光 | 十一AI编程
- 画面/字幕无 weelume、无域名、无英文品牌
- 总览段全图亮，逐层段只亮当前层，节点段只亮目标框
```
