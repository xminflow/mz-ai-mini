import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import ts from 'typescript'
import { websiteRoot, localRoot, SHARED_TEMPLATE_IDS } from './lib/deformo-package.mjs'

const localEntries = new Map()
if (process.env.TEMPLATE_CATALOG_MODE === 'dev') {
  for (const id of SHARED_TEMPLATE_IDS) {
    const root = await localRoot(id)
    if (!root) continue
    const manifest = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'))
    localEntries.set(`${id}-template/template`, resolve(root, manifest.exports['./template']))
  }
}

// 只执行元数据表达式：先移除页面加载器，再由 TypeScript 消除仅供加载器使用的组件导入。
// 避免为生成目录而执行 React、样式或模板页面，也不为 Next.js 建立运行模块依赖。
const metadataOnly = context => {
  const visit = node => {
    // 目录抽取不执行页面样式；仅剔除无绑定的 CSS 导入，浏览器构建保持原源码。
    if (ts.isImportDeclaration(node) && !node.importClause && ts.isStringLiteral(node.moduleSpecifier) && /\.css(?:[?#].*)?$/.test(node.moduleSpecifier.text)) return undefined
    if (ts.isPropertyAssignment(node) && node.name.getText().replaceAll(/['"]/g, '') === 'load') return undefined
    return ts.visitEachChild(node, visit, context)
  }
  return source => ts.visitNode(source, visit)
}

export function resolveModule(specifier, context, nextResolve) {
    const localEntry = localEntries.get(specifier)
    if (localEntry) return { url: pathToFileURL(localEntry).href, shortCircuit: true }
    let candidate
    if (specifier.startsWith('@/')) candidate = resolve(websiteRoot, 'src', specifier.slice(2))
    else if (specifier.startsWith('.') && context.parentURL?.startsWith('file:')) {
      candidate = resolve(dirname(fileURLToPath(context.parentURL)), specifier)
    }
    if (candidate) {
      for (const suffix of ['.ts', '.tsx', '/index.ts', '/index.tsx']) {
        if (existsSync(candidate + suffix)) return { url: pathToFileURL(candidate + suffix).href, shortCircuit: true }
      }
    }
    return nextResolve(specifier, context)
}

export { resolveModule as resolve }

export function load(url, context, nextLoad) {
    // 模板源码沿用打包器的 JSON 默认导入语义，目录工具显式读取数据而不要求 Node 导入属性。
    if (url.endsWith('.json')) {
      const value = JSON.parse(readFileSync(fileURLToPath(url), 'utf8'))
      return { format: 'module', source: `export default JSON.parse(${JSON.stringify(JSON.stringify(value))})`, shortCircuit: true }
    }
    if (!/\.tsx?$/.test(url)) return nextLoad(url, context)
    const filename = fileURLToPath(url)
    const source = ts.createSourceFile(filename, readFileSync(filename, 'utf8'), ts.ScriptTarget.Latest, true)
    const transformed = ts.transform(source, [metadataOnly])
    const metadataSource = ts.createPrinter().printFile(transformed.transformed[0])
    transformed.dispose()
    const { outputText, diagnostics } = ts.transpileModule(metadataSource, {
      fileName: filename,
      reportDiagnostics: true,
      compilerOptions: { target: ts.ScriptTarget.ESNext, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX },
    })
    if (diagnostics?.some(item => item.category === ts.DiagnosticCategory.Error)) {
      throw new Error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
        getCanonicalFileName: name => name, getCurrentDirectory: () => websiteRoot, getNewLine: () => '\n',
      }))
    }
    return { format: 'module', source: outputText, shortCircuit: true }
}
