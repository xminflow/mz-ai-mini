export type MembershipTier = 'none' | 'normal' | 'premium'

export type MembershipOrderStatus = 'pending' | 'paid' | 'closed'

export type CreateOrderResponse = {
  order_no: string
  sku: string
  amount_fen: number
  status: MembershipOrderStatus
  code_url: string
  qr_expires_at: string
}

export type OrderStatusResponse = {
  order_no: string
  sku: string
  amount_fen: number
  status: MembershipOrderStatus
  code_url: string | null
  paid_at: string | null
  membership_applied: boolean
  membership_started_at: string | null
  membership_expires_at: string | null
}

export type MyMembershipResponse = {
  tier: MembershipTier
  started_at: string | null
  expires_at: string | null
  is_active: boolean
  remaining_days: number
}

export type FrontendApiError = {
  error: {
    code: string
    message: string
  }
}
