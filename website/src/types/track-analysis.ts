export interface TrackReportMeta {
  key: string
  title: string
  type: string
  sections: number
  charts: number
  description: string
}

export interface TrackAnalysisListItem {
  slug: string
  track_keyword: string
  region: string
  audience: string
  industry: string | null
  stance: string | null
  stance_summary: string | null
  cover_image_url: string | null
  tags: string[]
  key_numbers: Record<string, number> | null
  data_sources_count: number | null
  is_free: boolean
  status: string
  captured_at: string | null
  published_at: string | null
  created_at: string
  updated_at: string
  report_metas: TrackReportMeta[]
}

export interface TrackAnalysisDetail extends TrackAnalysisListItem {
  source_run_id: string | null
}

export interface TrackReportContent {
  slug: string
  key: string
  title: string
  type: string
  sections: number
  charts: number
  description: string
  html: string
}

export interface TrackAnalysisListResult {
  items: TrackAnalysisListItem[]
  next_cursor: string | null
  available_industries: string[]
  available_stances: string[]
}

const KEY_NUMBER_LABELS: Record<string, { label: string; suffix?: string }> = {
  // ── 通用市场规模（跨赛道标准字段）──
  market_size_cny_100m: { label: '市场规模', suffix: ' 亿' },
  som_cny_100m: { label: '可获市场(SOM)', suffix: ' 亿' },
  sam_cny_100m: { label: '服务市场(SAM)', suffix: ' 亿' },
  market_size_2024_cny_100m: { label: '2024 市场规模', suffix: ' 亿' },
  market_size_2025_cny_100m: { label: '2025 市场规模', suffix: ' 亿' },
  market_size_2026e_cny_100m: { label: '2026E 市场规模', suffix: ' 亿' },
  market_size_2030e_cny_100m: { label: '2030E 市场规模', suffix: ' 亿' },
  // ── 通用增速与集中度 ──
  cagr_forecast_pct: { label: '预测 CAGR', suffix: '%' },
  cagr_historical_pct: { label: '历史 CAGR', suffix: '%' },
  cr5_pct: { label: 'CR5 集中度', suffix: '%' },
  cr10_pct: { label: 'CR10 集中度', suffix: '%' },
  ecommerce_penetration_pct: { label: '电商渗透率', suffix: '%' },
  // ── 通用成本与启动 ──
  startup_cost_base_cny: { label: '启动成本(中性)', suffix: ' 元' },
  startup_cost_conservative_cny: { label: '启动成本(保守)', suffix: ' 元' },
  startup_cost_optimistic_cny: { label: '启动成本(乐观)', suffix: ' 元' },
  // ── 赛道专属字段（AI 漫剧等）──
  hit_rate_pct: { label: '中签率', suffix: '%' },
  avg_roi: { label: '平均 ROI', suffix: '×' },
  traffic_cost_share_pct: { label: '流量成本占比', suffix: '%' },
  production_cost_per_min_cny_2025: { label: '单分钟成本', suffix: ' 元' },
  individual_tool_cost_per_month_cny: { label: '个人月工具成本', suffix: ' 元' },
}

export interface KeyNumberHighlight {
  key: string
  label: string
  display: string
}

function formatNumber(value: number): string {
  if (Number.isInteger(value)) return value.toLocaleString('zh-CN')
  // 1 位小数足够卡片可读，避免 0.123456 之类的展示
  return value.toFixed(1)
}

export function pickKeyNumberHighlights(
  raw: Record<string, number> | null,
  limit = 3,
): KeyNumberHighlight[] {
  if (raw === null) return []
  const out: KeyNumberHighlight[] = []
  // 优先按 KEY_NUMBER_LABELS 的声明顺序展示，命中即取
  const preferred: string[] = [
    // 通用优先展示顺序（跨赛道卡片最有决策价值的指标）
    'som_cny_100m',
    'market_size_cny_100m',
    'cagr_forecast_pct',
    'cr5_pct',
    'ecommerce_penetration_pct',
    'startup_cost_base_cny',
    // 赛道专属备选
    'market_size_2025_cny_100m',
    'hit_rate_pct',
    'avg_roi',
    'traffic_cost_share_pct',
    'market_size_2030e_cny_100m',
  ]
  const seen = new Set<string>()
  for (const key of preferred) {
    if (out.length >= limit) break
    if (!(key in raw)) continue
    const meta = KEY_NUMBER_LABELS[key]
    if (!meta) continue
    const value = raw[key]
    const display = `${formatNumber(value)}${meta.suffix ?? ''}`
    out.push({ key, label: meta.label, display })
    seen.add(key)
  }
  if (out.length < limit) {
    for (const [key, value] of Object.entries(raw)) {
      if (out.length >= limit) break
      if (seen.has(key)) continue
      const meta = KEY_NUMBER_LABELS[key]
      const label = meta?.label ?? key
      const display = `${formatNumber(value)}${meta?.suffix ?? ''}`
      out.push({ key, label, display })
    }
  }
  return out
}
