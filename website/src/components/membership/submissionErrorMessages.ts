export type SubmissionErrorKind =
  | 'quota_exhausted'
  | 'duplicate_pending'
  | 'invalid_payload'
  | 'member_required'
  | 'auth_required'
  | 'network'
  | 'unknown'

const FALLBACK_BY_CODE: Record<string, SubmissionErrorKind> = {
  'MEMBER_SUBMISSION.QUOTA_EXHAUSTED': 'quota_exhausted',
  'MEMBER_SUBMISSION.DUPLICATE_PENDING': 'duplicate_pending',
  'MEMBER_SUBMISSION.INVALID_PAYLOAD': 'invalid_payload',
  'MEMBER_SUBMISSION.MEMBER_REQUIRED': 'member_required',
  auth_required: 'auth_required',
}

export function classifySubmissionError(code: string | undefined, status: number): SubmissionErrorKind {
  if (code && FALLBACK_BY_CODE[code]) return FALLBACK_BY_CODE[code]
  if (status === 401) return 'auth_required'
  if (status === 403) return 'member_required'
  if (status === 409) return 'quota_exhausted'
  if (status === 422) return 'invalid_payload'
  if (status === 0) return 'network'
  return 'unknown'
}

export function describeSubmissionError(kind: SubmissionErrorKind, fallback?: string): string {
  switch (kind) {
    case 'quota_exhausted':
      return '本月配额已用完，下月 1 号自动重置。'
    case 'duplicate_pending':
      return '你已经有一条同类型的待处理工单，请等当前工单交付后再提交。'
    case 'invalid_payload':
      return fallback ?? '内容格式不正确，请检查后再提交。'
    case 'member_required':
      return '会员状态已失效，请先续费再提交。'
    case 'auth_required':
      return '登录状态已过期，请重新登录后再提交。'
    case 'network':
      return '网络连接异常，请检查网络后重试。'
    default:
      return fallback ?? '提交失败，请稍后重试。'
  }
}
