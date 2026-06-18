import type { NextConfig } from 'next'

// 训练营独立站点为纯静态内容页,无后端 API 依赖。
// standalone 产物仅在设置 NEXT_STANDALONE=1 时启用(Docker 构建在 Linux 下设置);
// 本地 Windows 构建不设置该变量,避免 standalone 复制阶段的符号链接权限报错(EPERM)。
const config: NextConfig = {
  ...(process.env.NEXT_STANDALONE === '1' ? { output: 'standalone' as const } : {}),
}

export default config
