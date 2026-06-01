import type { NextConfig } from 'next'

const config: NextConfig = {
  // 与 website 一致，便于容器化部署
  // output: 'standalone',  // 暂时禁用：Windows 开发环境下 pnpm symlink 权限问题（EPERM）
}

export default config
