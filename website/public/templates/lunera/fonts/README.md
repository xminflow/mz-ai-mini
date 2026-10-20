# 品牌字体来源

官网首页与 Lunera、Grovia 模板共用 MiSans 字体（小米发布）与 Poppins 字体；参考本地 yiliart 项目的字体组合、分片方式与排版层级。

- MiSans：`misans@4.1.0` 的 Normal 系列，Regular/Bold 两档，来自 yiliart 的本地文件。保留完整 Unicode 分片，二进制文件未修改；CSS 字重映射为 400/700，font-family 使用 Weelume 品牌别名。仅请求页面所需的分片。
- MiSans 官方介绍和字体许可协议：<https://hyperos.mi.com/font/>。字体许可采用小米的 MiSans 字体知识产权许可协议，**并非 SIL OFL**。使用 MiSans 的声明保留于本文件及模板说明中。
- Poppins：Copyright 2020 The Poppins Project Authors，<https://github.com/itfoundry/Poppins>。拉丁子集来自 yiliart，400/600/700 三档。许可全文见 `Poppins-OFL.txt`。
- 统一字体声明在 `src/styles/brand-fonts.css`，首页通过 `home-typography.css` 使用；模板保留原有的共享导入入口，不复制字库。
- 所有字体由本站提供，运行时不访问外部字体服务。
