# 小程序说明

当前小程序前端统一通过 HTTP 访问后端接口，不使用云函数。

## 开发说明

- 本地开发的后端地址统一由 `miniprogram/core/runtime-config.js` 管理，默认本地地址为 `http://127.0.0.1:8001/api/v1`
- 如需覆盖本地联调地址，修改 `miniprogram/core/runtime-config.local.js` 中的 `localApiOrigin`
- `develop` 环境会自动附加本地调试身份头，便于联调登录与业务接口
- `trial` / `release` 环境固定连接生产云托管后端；当前生产 API 域名为 `https://api.weelume.com`
