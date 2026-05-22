import type {
  CreateMemberSubmissionPayload,
  CreateMemberSubmissionResponse,
  DeleteMemberSubmissionResponse,
  MemberSubmissionType,
  MyMemberSubmissionsResponse,
  MyQuotaResponse,
} from './types'

export class MemberSubmissionApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(message: string, options: { status: number; code: string }) {
    super(message)
    this.name = 'MemberSubmissionApiError'
    this.status = options.status
    this.code = options.code
  }
}

async function requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    cache: 'no-store',
  })
  const payload = (await response.json().catch(() => null)) as unknown
  if (!response.ok) {
    const error =
      payload && typeof payload === 'object' && 'error' in payload
        ? (payload as { error?: { code?: string; message?: string } }).error
        : undefined
    throw new MemberSubmissionApiError(error?.message ?? '提交服务请求失败', {
      status: response.status,
      code: error?.code ?? 'member_submission_request_failed',
    })
  }
  return payload as T
}

export async function createMemberSubmission(
  payload: CreateMemberSubmissionPayload,
): Promise<CreateMemberSubmissionResponse> {
  return requestJson<CreateMemberSubmissionResponse>('/api/member-submissions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getMyQuota(): Promise<MyQuotaResponse> {
  return requestJson<MyQuotaResponse>('/api/member-submissions/me/quota')
}

export type ListMySubmissionsParams = {
  type?: MemberSubmissionType
  limit?: number
  offset?: number
}

export async function listMySubmissions(
  params: ListMySubmissionsParams = {},
): Promise<MyMemberSubmissionsResponse> {
  const search = new URLSearchParams()
  if (params.type) search.set('type', params.type)
  if (params.limit !== undefined) search.set('limit', String(params.limit))
  if (params.offset !== undefined) search.set('offset', String(params.offset))
  const query = search.toString()
  const path = query ? `/api/member-submissions/me?${query}` : '/api/member-submissions/me'
  return requestJson<MyMemberSubmissionsResponse>(path)
}

export async function deleteMemberSubmission(
  submissionId: string,
): Promise<DeleteMemberSubmissionResponse> {
  return requestJson<DeleteMemberSubmissionResponse>(
    `/api/member-submissions/${encodeURIComponent(submissionId)}`,
    { method: 'DELETE' },
  )
}
