export type CampMembershipSku = 'annual_basic' | 'annual_premium'

export type CampMembershipTier = 'none' | 'basic' | 'premium'

export type CampOrderStatus = 'pending' | 'paid' | 'closed'

export type CreateCampOrderResponse = {
  order_no: string
  sku: string
  amount_fen: number
  status: CampOrderStatus
  code_url: string
  qr_expires_at: string
}

export type CampOrderStatusResponse = {
  order_no: string
  sku: string
  amount_fen: number
  status: CampOrderStatus
  code_url: string | null
  paid_at: string | null
  membership_applied: boolean
  membership_started_at: string | null
  membership_expires_at: string | null
}

export type MyCampMembershipResponse = {
  tier: CampMembershipTier
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
