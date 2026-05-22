import { NextResponse } from 'next/server'

import { readAuthCookies } from '@/features/auth/server/cookies'
import { getWebsiteAuthState } from '@/features/auth/server/session'
import {
  TrackAnalysisFetchError,
  fetchTrackReportContent,
} from '@/services/track-analysis'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ slug: string; reportKey: string }>
}

export async function GET(_request: Request, context: RouteContext): Promise<Response> {
  const { slug, reportKey } = await context.params

  // 确保 token 已刷新后读取，再转发给后端
  const authState = await getWebsiteAuthState()
  const cookies = await readAuthCookies()
  const accessToken = authState.authenticated ? (cookies.accessToken ?? undefined) : undefined

  try {
    const result = await fetchTrackReportContent(slug, reportKey, accessToken)
    return NextResponse.json(result, {
      status: 200,
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    if (error instanceof TrackAnalysisFetchError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status || 500 },
      )
    }
    return NextResponse.json(
      {
        error: {
          code: 'TRACK_ANALYSIS.REPORT_UNKNOWN',
          message: '赛道报告暂时无法加载',
        },
      },
      { status: 500 },
    )
  }
}
