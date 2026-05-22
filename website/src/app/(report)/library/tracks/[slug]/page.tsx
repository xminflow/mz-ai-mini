import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { TrackPaywallPage } from '@/components/tracks/TrackPaywallPage'
import { TrackReportShell } from '@/components/tracks'
import { readAuthCookies } from '@/features/auth/server/cookies'
import { getWebsiteAuthState } from '@/features/auth/server/session'
import { checkActiveMembership } from '@/features/membership/server/check-membership'
import {
  TrackAnalysisFetchError,
  fetchTrackAnalysisDetail,
  fetchTrackReportContent,
} from '@/services/track-analysis'

export const dynamic = 'force-dynamic'

interface TrackDetailPageProps {
  params: Promise<{ slug: string }>
  searchParams?: Promise<{ tab?: string }>
}

export async function generateMetadata({
  params,
}: TrackDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const detail = await fetchTrackAnalysisDetail(slug)
    const description =
      detail.stance_summary ??
      `${detail.track_keyword} 赛道的执行摘要、行业研判、竞争格局、商业模式、AI 落地、操盘手册——基于真实数据，消除信息差，把别人验证过的方向变成你的 AI × 自媒体获客方法。`
    const title = `${detail.track_keyword} · 赛道深度分析`
    return {
      title,
      description,
      openGraph: {
        title: `${title} · 微域生光`,
        description,
      },
    }
  } catch {
    return { title: '赛道深度分析' }
  }
}

export default async function TrackAnalysisDetailPage({
  params,
  searchParams,
}: TrackDetailPageProps) {
  const { slug } = await params
  const resolvedSearch = (await searchParams) ?? {}

  let detail
  try {
    detail = await fetchTrackAnalysisDetail(slug)
  } catch (error) {
    if (error instanceof TrackAnalysisFetchError && error.status === 404) {
      notFound()
    }
    throw error
  }

  if (detail.report_metas.length === 0) {
    // 服务端按 status='published' 过滤；正常情况下报告非空。空报告视为数据异常。
    throw new Error('Track analysis has no reports')
  }

  const loginNext = `/library/tracks/${slug}`

  // 先解析登录态（免费内容也需要用于顶部栏）；cookie 刷新只发生一次。
  const authState = await getWebsiteAuthState()
  const cookies = await readAuthCookies()
  const accessToken = authState.authenticated ? (cookies.accessToken ?? undefined) : undefined

  // 付费内容：验证会员资格，未登录跳登录页，已登录无会员展示付费墙
  if (!detail.is_free) {
    if (!authState.authenticated) {
      redirect(`/login?next=${encodeURIComponent(loginNext)}`)
    }
    const isActiveMember = accessToken ? await checkActiveMembership(accessToken) : false
    if (!isActiveMember) {
      return <TrackPaywallPage detail={detail} />
    }
  }

  // 优先按 URL ?tab=<key> 决定初始报告；缺省取第一份。
  const tabKey = typeof resolvedSearch.tab === 'string' ? resolvedSearch.tab : null
  const initialKey = tabKey
    && detail.report_metas.some((meta) => meta.key === tabKey)
    ? tabKey
    : detail.report_metas[0].key

  let initialReport
  try {
    initialReport = await fetchTrackReportContent(slug, initialKey, accessToken)
  } catch (error) {
    // 单份报告 404 时退回到第一份，避免整页崩溃
    if (
      error instanceof TrackAnalysisFetchError &&
      error.status === 404 &&
      initialKey !== detail.report_metas[0].key
    ) {
      initialReport = await fetchTrackReportContent(
        slug,
        detail.report_metas[0].key,
        accessToken,
      )
    } else {
      throw error
    }
  }

  return (
    <TrackReportShell
      detail={detail}
      initialReport={initialReport}
      authState={authState}
      loginNext={loginNext}
    />
  )
}
