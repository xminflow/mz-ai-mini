# 官网个人资料升级

## 行为与验收

新注册账号保留内部唯一 username，独立展示名 display_name 默认 weelume，可重复，支持 1–64 个可见字符。存量账号未设置展示名时保留原 username；不覆盖历史自定义名称。未上传头像时使用官网浅色圆形 Logo `/logo/weelume-avatar-light.svg`。

导航头像菜单提供“个人信息”，在当前页面打开 Modal，不跳转独立页面。展示名及头像分别保存，互不覆盖；资料保存后刷新导航和服务端页面。头像复用既有 COS SDK，限制 2 MB 的 JPG/PNG/WebP，服务端核对类型与文件标识，账号路径及内容摘要由服务端生成。失败明确返回错误，不将上传失败伪装成成功。旧头像对象保留，不覆盖其他文件；上传成功但数据库写入失败时可能保留未引用对象，后续可按引用清理。

`/account` 保留为旧地址兼容入口，重定向到主站并打开个人信息弹窗。导航仅向已登录用户提供入口，资料 API 保留服务端鉴权。弹窗在站点外壳内使用原生 dialog 顶层展示，继承当前主站浅色或模板市场深色主题令牌，支持 Escape、关闭按钮及遮罩关闭；头像与用户名紧凑排列；根据用户要求移除邮箱绑定入口、验证码表单及相关前端状态。不恢复原先隐藏的会员板块或其他页面。

验收使用相关后端单元测试、隔离 PostgreSQL/API 集成测试、主站构建与类型检查，不要求浏览器交互验收。未进行真人微信注册或操作生产账号。

## 本次验证结果（2026-10-22）

- 完整后端回归 `python -m pytest server/api/tests -q`：313 项通过，包含个人资料迁移与真实 PostgreSQL/鉴权 API 集成测试；1 项已有 httpx 弃用警告。测试显式使用本次独立实例 `weelume_profile_test`，集成测试另建随机测试库并自动清理。初次误用旧测试库因未执行 0031 缺列失败，最终改用本次隔离新库；未修改旧测试库。
- 两次执行新增迁移和新库初始化通过，登记 31 项迁移，旧账号行数与原用户名不变；真实 API 修改展示名和头像后重新查询数据库一致，第二个账号未受影响。
- 现有 COS 真实上传 1 像素测试头像，匿名下载 SHA256 一致，并在 finally 清理确切测试对象；未修改其他对象。
- 主站在本地 WSL Linux 文件系统 `/home/xmin/workspace/weelume-checks/account-profile-20261022/website` 执行 `pnpm run template:check && pnpm build` 通过，包含类型检查和 37 页生成。仅保留已有 Lint 配置及 playbook 警告。
- 最终本地产物 HTTP 检查：首页、模板和默认 Logo 返回 200；未登录访问 `/account` 跳转登录，写入资料接口返回 401。没有执行浏览器交互检查。
- 原始日志位于 `artifacts/account-profile-20261022/`。本任务仅实现和本地验证，未发布生产。

## 升级顺序

1. 备份 agent_accounts 表结构和数据，记录行数；确认目标库与当前迁移记录。禁止重新执行全量历史迁移或初始化 SQL。
2. 在短事务内执行 `server/api/migrations/0031_add_agent_account_profile.sql`，设置 lock_timeout 为 5s、statement_timeout 为 60s；通过现有迁移机制登记文件名。脚本只用 ADD COLUMN IF NOT EXISTS 新增两个可空列，可重复检查，不回填存量账号。
3. 核对列类型与可空性、业务表行数不变、原 username 唯一约束保留，然后发布新后端，再发布主站。旧后端忽略新增列，兼容滚动切换。
4. 在隔离数据库验证两个账号都可使用 weelume、修改后重新读取保持一致、登录与刷新返回真实资料、未认证请求不可写入；存储适配在测试专用对象路径验证上传/读取，清理本次专用对象。

新库由 `server/docker/postgres/init/0002_init_schema.sql` 直接包含最终结构并登记 0031，初始化文件仅用于隔离空库。

## 验证 SQL

```sql
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_schema='public' AND table_name='agent_accounts'
  AND column_name IN ('display_name','avatar_url');
SELECT count(*) FROM agent_accounts;
SELECT filename FROM schema_migrations WHERE filename='0031_add_agent_account_profile.sql';
```

## 回滚与失败恢复

迁移失败回滚事务，修正锁冲突后重试；不部署依赖新列的后端。应用异常时回滚主站、后端镜像，保留新增列和用户更新的资料；旧代码继续使用原 username。默认不 DROP 列、不回写历史名称、不删除头像对象。若确需清理数据，单独确认影响并备份后处理。2026-10-23 用户因保存失败明确授权发布到线上并保留当前账号，具体备份、迁移和发布结果见 docs/releases/release-20261023-profile.md。

## 弹窗布局调整（2026-10-22）

根据用户后续反馈，取消独立设置页面，改为主题自适应的 Modal，复用主站按钮、边框、圆角与颜色令牌；个人信息从 LightShell 统一管理，与联系/交流群弹窗互斥。旧 /account 地址通过 settings=profile 参数兼容打开，消费后移除参数，避免刷新反复弹出。重新执行本地 WSL 构建及 HTTP 检查，并将最终镜像替换到当前 3045 预览；不做浏览器交互检查。当前预览连接的后端尚未执行 0031 和代码升级，真实保存能力仍须后端升级后使用。

用户后续明确不需要绑定邮箱，个人信息弹窗仅保留头像和用户名。移除该弹窗中的邮箱绑定请求、状态和样式，既有后端邮箱接口及历史数据保持兼容。
