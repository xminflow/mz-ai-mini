import type { NextConfig } from 'next'

const config: NextConfig = {
  // 与 website 一致，便于容器化部署。
  // TODO(部署前必须重新启用)：Windows + pnpm 本地构建 standalone 会因创建 symlink 报 EPERM，
  // 故本地开发暂时注释。生产部署（Linux 容器）务必恢复 output: 'standalone'。
  // output: 'standalone',
}

export default config
