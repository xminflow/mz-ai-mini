import type { NextConfig } from 'next'

const config: NextConfig = {
  // 与 website 一致，便于容器化部署
  output: 'standalone',
}

export default config
