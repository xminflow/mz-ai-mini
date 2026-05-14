import type { RawStoryDetail, RawStoryDocument, StoryReportSection } from '../types'

const REPORT_DOCUMENT_DEFINITIONS = [
  {
    key: 'business_case',
    label: '创业机会分析',
  },
  {
    key: 'market_research',
    label: '市场调研',
  },
  {
    key: 'business_model',
    label: '商业模式',
  },
  {
    key: 'ai_business_upgrade',
    label: 'AI 升级',
  },
  {
    key: 'how_to_do',
    label: '如何做',
  },
] as const

const normalizeReportDocumentSection = (
  key: string,
  label: string,
  document: RawStoryDocument | null | undefined,
): StoryReportSection | null => {
  if (!document) {
    return null
  }
  const content = typeof document.markdown_content === 'string' ? document.markdown_content.trim() : ''
  if (content === '') {
    return null
  }
  const title = typeof document.title === 'string' && document.title.trim() !== ''
    ? document.title.trim()
    : label

  return {
    key,
    label,
    title,
    content,
  }
}

export const buildReportSections = (raw: RawStoryDetail): StoryReportSection[] => {
  const sections: StoryReportSection[] = []
  const summaryMarkdown = typeof raw.summary_markdown === 'string' ? raw.summary_markdown.trim() : ''
  if (summaryMarkdown !== '') {
    sections.push({
      key: 'summary',
      label: '简介',
      title: '简介',
      content: summaryMarkdown,
    })
  }

  for (const definition of REPORT_DOCUMENT_DEFINITIONS) {
    const section = normalizeReportDocumentSection(
      definition.key,
      definition.label,
      raw.documents?.[definition.key],
    )
    if (section) {
      sections.push(section)
    }
  }

  return sections
}
