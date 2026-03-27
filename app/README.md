# 小程序说明

当前小程序前端统一通过 HTTP 访问后端接口，不使用云函数。

## 开发说明

- 本地开发默认请求 `http://127.0.0.1:8000/api/v1`
- `develop` 环境会自动附加本地调试身份头，便于联调登录与业务接口
- `trial` / `release` 环境需要在 `miniprogram/core/runtime-config.js` 中配置真实 HTTP API 域名
