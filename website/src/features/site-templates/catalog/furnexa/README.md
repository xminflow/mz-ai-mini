# Furnexa 宿主适配

通用业务源码维护于独立工程 `D:/code/code-tpl/furnexa-template/`，本目录仅保留注册与品牌注入。

接入和实际验证见 [交付记录](../../../../../../docs/furnexa-template-delivery.md)。开发通过忽略的 `furnexa.local` 引用源码；生产只读取 `templates/furnexa.lock.json` 锁定的 vendor 包，不读取本机独立工程路径。

运行图片、字体和三端展示图由共享包同步器生成到 `public/templates/furnexa/`，不手工改动，不复制页面实现。

公开仓库创建受自动审批阻止，尚无真实 gitUrl。不能将本地实现完成等同于市场协议导入通过或已经发布。
