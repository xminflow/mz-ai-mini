export const API_SUCCESS_CODE = 'COMMON.SUCCESS' as const

export interface ApiEnvelope<T> {
  code: string
  message?: string
  data: T
}
