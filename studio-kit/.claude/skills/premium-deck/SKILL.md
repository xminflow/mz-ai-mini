---
name: premium-deck
description: 高端深色幻灯主题模板（黑底 + Google 三色四角光晕 + 磨砂玻璃 + 大号 kicker），横版 1920×1080 出 PPT、竖版 1080×1920 出口播视频图。用 HTML/CSS → 无头 Chrome 截 PNG，drawio 仅出透明 SVG 拓扑嵌入。触发词：高端 PPT、premium deck、深色幻灯、Google 光晕主题、起一套新 deck、premium-deck。
---

# premium-deck

把一套选题做成**高端深色幻灯**：

- **横版 1920×1080** → `arch-ppt` 组装成 16:9 PPT（文案进演讲者备注）
- **竖版 1080×1920** → 作为口播/短视频的画面图（喂 `arch-video` 的 PNG 序列）

视觉走 **HTML/CSS → 无头 Chrome 截 PNG**（drawio 矢量做不出真光晕/磨砂/渐变文字）。drawio 只用来画**拓扑**（盒子+箭头），导**透明 SVG** 嵌进 HTML 框架。

参考成片：`output/ppt/ai-dev-path/`（横）、`output/arch/ai-dev-path/20260621/`（竖）。

## 样式架构（唯一真源 + 两套几何）

```
templates/
  tokens.css            ← 横竖唯一真源：配色 token、字体、颗粒、毛玻璃/高亮质感常量、语义色
  style.landscape.css   ← 横版 1920×1080 的几何与字号（引用 tokens 变量）
  style.portrait.css    ← 竖版 1080×1920 的几何与字号、cols 改纵向堆叠
  slide.cover.html      ← 各版式范例（复制改文案即可）
  slide.statement.html
  slide.grid4.html      ← 含高亮玻璃卡示例
  slide.cols2.html
  slide.cols3.html
  slide.diagram.html    ← drawio 拓扑嵌入（横版专用）
  drawio-theme.md       ← drawio 节点/连线/文字的主题样式 + 导出坑
```

**每页 HTML 固定引两张表**（顺序不能反）：

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="style.landscape.css">   <!-- 竖版改成 style.portrait.css -->
```

> 🔑 **改品牌色 / 玻璃质感只动 `tokens.css` 一处**，横竖同步生效。几何/字号差异是两版各自合理的取值，不算重复，分别放在 landscape / portrait。**禁止**把颜色写死进 orientation 文件——那会让两版漂移（曾经踩过：横竖两份 style.css 各改一次、漏一处就花脸）。

## 起一套新 deck（横版为例）

```
workspace = D:\code\weelume-base\studio-kit\output\ppt\<slug>\
```

1. **建目录** `output/ppt/<slug>/html/`，把 `templates/` 下的 `tokens.css`、`style.landscape.css`（竖版另加 `style.portrait.css`）拷进去。
2. **写每页 HTML**：从 `slide.*.html` 范例里挑版式复制进 `html/`，改文案。版式见下。
3. **画 drawio 图**（如需）：按 `drawio-theme.md` 画，用 `export_drawio_to_svg()` 导透明 SVG 进 `html/`，页面用 `<img class="diagram" src="x.svg">`。
4. **渲染 PNG**：
   ```
   uv run studio-kit slide-render --html-dir output/ppt/<slug>/html --out-dir output/ppt/<slug>/images
   # 竖版：--html-dir <竖版html目录> --width 1080 --height 1920
   ```
   （跳过以 `_` 开头的辅助文件；可加 `--only <页名>` 只渲染指定页。）
5. **组装 PPT**（横版）：写 `script.json`（`ArchVideoDoc`，段→images/*.png），再
   ```
   uv run studio-kit arch-ppt --script output/ppt/<slug>/script.json
   ```
   原 PPT 被 PowerPoint 占用时会自动另存 `-2`，关掉后重跑即写回原名。

## 版式速查

| 版式 | 用途 | 关键结构 |
|---|---|---|
| cover | 封面 | `.pill` + `.cover>.big/.sub` |
| statement | 金句/观点 | `.pill` + `.statement>.big/.sub`，`.accent` 高亮关键词 |
| grid4 | 2×2 概念格 | `.grid4` + 四个 `.cell`（右列加 `.r`）；高亮某格加 `.on`、其余加 `.off` |
| cols2 | 双栏对比 | `.cols2`+`.mid`+两个 `.col`；`.tag` 三色 cool/warm/violet（横版左右、竖版上下） |
| cols3 | 三类并列 | `.cols3` + 三个 `.card`，色调 g-blue/g-yellow/g-red（横版并排、竖版竖排） |
| diagram | 流程/架构 | `.stage>img.diagram`（嵌 drawio 透明 SVG，横版专用） |

**高亮 = 放大 + 浮起玻璃卡**：grid4 里给重点格加 `on`，其余加 `off`（变暗 0.32）。质感来自 tokens，几何来自 orientation。

## 硬约束（不可违反）

- **可见层只允许「微域生光 | 十一AI编程」**。禁止 `weelume.com`、任何域名、任何英文品牌名。"vibe coding" 是范式名可保留，不是品牌。
- **CTA 文案固定**：`看简介免费领取最新 AI 编程学习资料，助你升职加薪`。
- 字体 `Inter,Microsoft YaHei`；主强调 Google 蓝 `#5A9CFF`；多类别才用红/黄/绿语义色。
- 大字号、不要小字；卡片均匀磨砂（不要斜向渐变=会两半色）。

## 已知坑（都已固化进工具/规范，照做即可）

- **drawio 导出 SVG 在深色页发灰**：导出带 `color-scheme: light dark` + `light-dark()`，Chrome 取深色变体。`export_drawio_to_svg()` 已自动改成 `light`。手动导出务必同样替换。详见 `drawio-theme.md`。
- **drawio 连线文字白底框**：边必须加 `labelBackgroundColor=none`，否则深色页出刺眼白块。
- **Chrome 截图必须用绝对输出路径**（相对路径会写错位置/拒绝访问）。`slide-render` 已处理。
- **单字孤行**：中文标题/陈述太长会把末字甩到下一行；适当下调该页字号或改写文案，别留单字。
- **PPT 被占用**：`arch-ppt` 会另存 `-2`；让用户关掉 PowerPoint 再重跑写回原名。

## 相关
- 渲染能力：`studio_kit.render.html_render`（slide-render）、`studio_kit.render.drawio_export`（export_drawio_to_svg）、`pptx_build`（arch-ppt）。
- drawio 驱动的通用架构讲解视频走另一套：skill `arch-diagram-narration`（图用 drawio→PNG，非本主题）。
