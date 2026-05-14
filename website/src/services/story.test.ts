import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildReportSections } from './reportSections.ts'

describe('buildReportSections', () => {
  it('maps summary and report documents into ordered sections', () => {
    const result = buildReportSections({
      case_id: '1001',
      type: 'case',
      title: '宠物新零售行业创业案例',
      summary: '案例摘要',
      summary_markdown: '# 摘要',
      documents: {
        business_case: {
          document_id: '1',
          title: '机会分析原始标题',
          markdown_content: '# 机会分析',
        },
        market_research: {
          document_id: '2',
          title: '市场调研原始标题',
          markdown_content: '# 市场调研',
        },
        business_model: {
          document_id: '3',
          title: '商业模式原始标题',
          markdown_content: '# 商业模式',
        },
        ai_business_upgrade: {
          document_id: '4',
          title: 'AI 升级原始标题',
          markdown_content: '# AI 升级',
        },
      },
    })

    assert.deepEqual(
      result.map((section) => section.key),
      ['summary', 'business_case', 'market_research', 'business_model', 'ai_business_upgrade'],
    )
    assert.deepEqual(
      result.map((section) => section.label),
      ['简介', '创业机会分析', '市场调研', '商业模式', 'AI 升级'],
    )
    assert.equal(result[0].content, '# 摘要')
    assert.equal(result[1].title, '机会分析原始标题')
  })

  it('includes how_to_do only when the API returns non-empty content', () => {
    const result = buildReportSections({
      case_id: '2001',
      type: 'project',
      title: 'AI 工具项目',
      summary: '项目摘要',
      summary_markdown: '',
      documents: {
        business_case: {
          markdown_content: '# 机会分析',
        },
        market_research: {
          markdown_content: '# 市场调研',
        },
        business_model: {
          markdown_content: '   ',
        },
        ai_business_upgrade: {
          markdown_content: '# AI 升级',
        },
        how_to_do: {
          title: '',
          markdown_content: '# 如何做',
        },
      },
    })

    assert.deepEqual(
      result.map((section) => section.key),
      ['business_case', 'market_research', 'ai_business_upgrade', 'how_to_do'],
    )
    assert.equal(result.at(-1)?.label, '如何做')
    assert.equal(result.at(-1)?.title, '如何做')
  })
})
