import type { NextConfig } from 'next'
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants'
import { existsSync, readFileSync } from 'node:fs'
import { resolve, join } from 'node:path'

const API_PREFIX = '/api/v1'
const LOCAL_API_ORIGIN = 'http://127.0.0.1:8000'
const PRODUCTION_API_ORIGIN = 'https://api.weelume.com'

const trimTrailingSlashes = (value: string): string => value.replace(/\/+$/, '')

const resolveInternalApiOrigin = (): string => {
  const configuredOrigin = process.env.INTERNAL_API_URL
  if (typeof configuredOrigin === 'string' && configuredOrigin.trim() !== '') {
    return trimTrailingSlashes(configuredOrigin.trim())
  }

  if (process.env.NODE_ENV !== 'production') {
    return trimTrailingSlashes(LOCAL_API_ORIGIN)
  }

  return trimTrailingSlashes(PRODUCTION_API_ORIGIN)
}

const config: NextConfig = {
  // 并行验收可指定独立产物目录，避免多次构建互相覆盖追踪清单。
  distDir: process.env.WEBSITE_BUILD_DIR ?? '.next',
  output: 'standalone',
  outputFileTracingRoot: resolve(process.cwd()),
  transpilePackages: ['kelo-template', 'velara-template', 'kittypaw-template', 'benjamen-template', 'zenpanda-template', 'pawlio-template', 'estaymart-template', 'vetala-template', 'consutech-template', 'spycat-template', 'ospey-template', 'jironews-template', 'noter-template', 'deformo-template', 'uiuxfolio-template', 'latte-template', 'cerno-template', 'foldex-template', 'souma-template', 'conicorn-template', 'grovia-template', 'furnexa-template', 'mondragon-template', 'lunera-template', 'noirei-template', 'hellomonday-template', 'liubai-template', 'nubo-template', 'recueil-template', 'studiothink-template', 'tabfolio-template', 'unseen-template', 'tomasfolio-template', 'artemis-template', 'graybeam-template', 'drip-template', 'folioxa-template', 'ilse-moreno-template', 'offersuite-template', 'portfolica-template', 'shelta-template', 'rescale-template'],
  env: {
    NEXT_PUBLIC_API_BASE_URL: API_PREFIX,
  },
  async rewrites() {
    const target = resolveInternalApiOrigin()
    return [
      {
        source: '/api/v1/:path*',
        destination: `${target}/api/v1/:path*`,
      },
    ]
  },
  // www.weelume.com → weelume.com 兜底重定向。优先依赖 CDN/DNS 层的 301；
  // 这里作为应用层 safety net，避免 CDN 配置漏掉时两个域名同时被搜索引擎收录。
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.weelume.com' }],
        destination: 'https://weelume.com/:path*',
        permanent: true,
      },
    ]
  },
}

export default function nextConfig(phase: string): NextConfig {
  // 本地路径仅用于 dev；生产构建一律读取锁定的随仓模板运行包。
  if (phase !== PHASE_DEVELOPMENT_SERVER) return config
  const aliases: Record<string, string> = {}
  for (const id of ['kelo', 'velara', 'kittypaw', 'benjamen', 'zenpanda', 'pawlio', 'estaymart', 'vetala', 'consutech', 'spycat', 'ospey', 'jironews', 'noter', 'deformo', 'uiuxfolio', 'latte', 'cerno', 'foldex', 'souma', 'furnexa', 'mondragon', 'conicorn', 'grovia', 'lunera', 'noirei', 'hellomonday', 'liubai', 'nubo', 'recueil', 'studiothink', 'tabfolio', 'unseen', 'tomasfolio', 'artemis', 'graybeam', 'drip', 'folioxa', 'ilse-moreno', 'offersuite', 'portfolica', 'shelta', 'rescale']) {
    const localFile = resolve(id + '.local')
    if (!existsSync(localFile)) continue
    const { source } = JSON.parse(readFileSync(localFile, 'utf8')) as { source: string }
    const manifest = JSON.parse(readFileSync(join(source, 'package.json'), 'utf8')) as { name: string; exports: Record<string, string> }
    if (manifest.name !== id + '-template') throw new Error(id + '.local 指向了错误的模板')
    for (const entry of ['template', 'host']) aliases[id + '-template/' + entry + '$'] = resolve(source, manifest.exports['./' + entry])
  }
  if (Object.keys(aliases).length === 0) return config
  return {
    ...config,
    // 按预览端口隔离缓存，避免多个开发服务并发覆盖客户端模块清单。
    distDir: process.env.WEBSITE_DEV_PORT ? `.next-templates-dev-${process.env.WEBSITE_DEV_PORT}` : '.next-templates-dev',
    webpack(webpackConfig) {
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        ...aliases,
      }
      // 模板与主站版本可能不同，开发时统一优先使用宿主依赖。
      webpackConfig.resolve.modules = [resolve('node_modules'), ...webpackConfig.resolve.modules]
      return webpackConfig
    },
  }
}
