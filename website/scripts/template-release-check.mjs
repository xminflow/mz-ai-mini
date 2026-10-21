import { verifyTemplateReleases } from './lib/template-release.mjs'
console.log('模板 ZIP 发布清单验证通过:', (await verifyTemplateReleases()).join(', '))
