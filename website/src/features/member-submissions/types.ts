export type MemberSubmissionType = 'blogger' | 'track'

export type MemberSubmissionStatus =
  | 'pending'
  | 'processing'
  | 'done'
  | 'rejected'
  | 'cancelled'

export type QuotaSnapshot = {
  type: MemberSubmissionType
  period_key: string
  period_start: string
  period_end: string
  limit: number
  consumed: number
  remaining: number
}

export type MemberSubmissionItem = {
  submission_id: string
  type: MemberSubmissionType
  payload_text: string
  payload_meta: Record<string, unknown>
  status: MemberSubmissionStatus
  period_key: string
  processed_note: string | null
  processed_at: string | null
  created_at: string
  updated_at: string
}

export type CreateMemberSubmissionResponse = {
  submission_id: string
  type: MemberSubmissionType
  status: MemberSubmissionStatus
  period_key: string
  submitted_at: string
  quota_after: QuotaSnapshot
}

export type MyMemberSubmissionsResponse = {
  items: MemberSubmissionItem[]
  total: number
  limit: number
  offset: number
  quotas: QuotaSnapshot[]
}

export type MyQuotaResponse = {
  quotas: QuotaSnapshot[]
}

export type CreateMemberSubmissionPayload = {
  type: MemberSubmissionType
  payload_text: string
  payload_meta?: Record<string, unknown>
}

export type DeleteMemberSubmissionResponse = {
  submission_id: string
  type: MemberSubmissionType
  deleted: boolean
}
