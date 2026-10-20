# 微域生光 · 视觉设计工作室模板

参考站：[Studio Think](https://studiothink.framer.website/)，页面品牌统一为微域生光 / Weelume。模板以现有 Grovia 的站点注册、页面拆分、响应式预览和本地表单模式接入，注册为 `listed: false`，可从模板工作台或 `/templates/studiothink/site` 预览。

覆盖首页、关于、作品、联系四个页面，默认中文，英文版本通过各页面后的 `/en` 路径访问，并支持页面级语言切换。素材位于 `website/public/templates/studiothink/`，使用本地视频与图片，联系表单只做浏览器端必填校验和成功状态展示，不发送数据。

导航、页脚和右下角模板市场入口使用现有微域生光 Logo；右下角入口沿用其他模板的深色胶囊规范，移动端仅显示 Logo。页面正文、标题、按钮和浮动入口统一使用项目本地 Poppins / MiSans 字体令牌。

验证命令：

```powershell
pnpm exec tsc --noEmit
node scripts/capture-studiothink.mjs
```
