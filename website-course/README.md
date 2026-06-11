# website-course

课程 HTML 展示工程：侧边目录 + iframe 展示完整独立的课程 HTML 文档。

## 开发

```bash
pnpm install
pnpm dev      # http://localhost:5180
pnpm test     # 运行 manifest 逻辑单测
pnpm build    # 产物输出到 dist/
```

## 新增课程

1. 在 `public/courses/<章节目录>/` 放入完整 HTML 文档。
2. 在 `public/courses/manifest.json` 对应章节的 `sections` 加一条记录：
   `{ "id": "x.y", "title": "标题", "file": "<章节目录>/<文件>.html" }`
3. 无需改动代码。

## 结构

- `public/courses/` 课程文档与 `manifest.json`（两层级：章节 → 小节）
- `src/lib/manifest.ts` manifest 加载/校验/扁平化/上下节
- `src/components/` Sidebar（目录）、LessonViewer（iframe+导航）、Layout
