# drawio 主题样式规范（与 PPT 主题统一）

配套主题：黑底 + Google 三色四周光晕 + 中性白字 + Google 蓝强调。
drawio 图**只画拓扑**（盒子/箭头），导出**透明 SVG**后嵌入 HTML 框架（`.stage > img.diagram`）；
背景光晕、颗粒由 HTML 提供，**drawio 不要画背景矩形**。

## 设计 token

| 用途 | 值 |
|---|---|
| 主文字 | `#F1F2F5`（粗体标题） |
| 主文字 | `#FFFFFF` 粗体 |
| 副文字 | `#E6EAF0`（节点内小字，**别用更暗的灰，会看不见**） |
| 连线/箭头 | `#9AA3B2` strokeWidth 2 |
| 节点 | **无背景 `fillColor=none` + 只描边 + 白字**（实测最清晰） |
| 细边（默认节点） | `strokeColor=#AEB6C6;strokeWidth=1.5`（**禁用 strokeOpacity**：drawio 会把它导成整组 opacity，连白字一起拖暗变灰） |
| 强调色 Google 蓝 | `#5A9CFF` |
| 语义色（可选分类） | 蓝 `#5A9CFF` / 红 `#FF6A5C` / 黄 `#FFCE54` / 绿 `#4AD6A0` |
| 字体 | `Inter,Microsoft YaHei` |
| 字号 | 标题 26 / 副标 20（不要更小） |
| 圆角 | `rounded=1;arcSize=18` |

## 可直接粘贴的样式串

**默认节点（无背景 + 只描边 + 白字）**
```
rounded=1;arcSize=18;html=1;fillColor=none;strokeColor=#AEB6C6;strokeWidth=1.5;verticalAlign=middle;align=center;
```
> 坑：① **不要用 `strokeOpacity`**——drawio 导出会变成整组 opacity，把白字一起拖暗成灰。② 不要用半透明浅色填充（白底低透明），drawio 无背景模糊，文字会糊。直接 `fillColor=none` + 白字最清晰。

**强调/主角节点（蓝边）**
```
rounded=1;arcSize=18;html=1;fillColor=none;strokeColor=#5A9CFF;strokeWidth=2;verticalAlign=middle;align=center;
```

**语义分类节点**：把上面的 `strokeColor` 换成对应语义色（红/黄/绿），`fillColor` 同步换或保持玻璃。

**节点文字（value，HTML）**
```html
<span style="font-family:Inter,Microsoft YaHei;font-size:26px;color:#F1F2F5;font-weight:bold;">主标题</span><br>
<span style="font-family:Inter,Microsoft YaHei;font-size:20px;color:#C6CCD6;">副说明</span>
```

**连线**
```
endArrow=block;html=1;strokeColor=#9AA3B2;strokeWidth=2;endFill=1;
```

**反馈/回退虚线（蓝）**
```
endArrow=block;html=1;strokeColor=#5A9CFF;strokeWidth=1.5;dashed=1;edgeStyle=orthogonalEdgeStyle;rounded=1;labelBackgroundColor=none;fontColor=#E6EAF0;
```
> 坑：**连线上的文字必须加 `labelBackgroundColor=none`**。否则 drawio 默认给标签加白色底框（导出成 `background-color:#ffffff`），在深色页面上是一块刺眼白底。文字色用 `fontColor=#E6EAF0` 并在 span 里同样写 `#E6EAF0`。

## ⚠️ 头号坑：导出 SVG 的深色配色错乱（必须修正）

drawio 导出的 SVG 根节点带 `color-scheme: light dark`，且每个颜色都包成
`light-dark(浅色, 深色)`。**嵌入深色 HTML 页面时，Chrome 解析为深色变体**——
于是 `#AEB6C6` 描边变成近黑、白字变暗灰，看上去就是“字看不清/灰扑扑”。
**这才是之前白字发灰的真正根因，不是 strokeOpacity、也不是描边/填充本身。**

修正：导出后把 `color-scheme: light dark` 改成 `color-scheme: light`，
让所有 `light-dark()` 取第一个（即图里实际设定的）颜色。
已固化进 `studio_kit.render.drawio_export.export_drawio_to_svg()`（自动调用
`patch_svg_for_dark_theme()`）。手动导出时务必执行同样替换。

## 规则
1. **不画背景矩形**（透明导出，让 HTML 光晕透出）。
2. **导出后必须修正 `color-scheme`**（见上，否则白字/描边在深色页面发灰）。
3. 节点文字主用 `#FFFFFF`（粗体）、副字 `#E6EAF0`，禁用深灰/银灰（不可见）。
4. 强调用 Google 蓝 `#5A9CFF`；多类别才用红/黄/绿语义色。
5. 字号 ≥ 20，字体统一 `Inter,Microsoft YaHei`。
6. 导出：`export_drawio_to_svg()`（含修正）；或手动 `draw.io.exe --export --format svg` 后改 `color-scheme`。放入 `html/`，HTML 里 `<img class="diagram" src="x.svg">`。

参考实现见 `../diagrams/flow.drawio`。
