export type MembershipTier = 'none' | 'basic' | 'premium'
export type AccountStatus = 'active' | 'disabled'

export type CampAccountAdmin = {
  account_id: string
  username: string
  email: string | null
  status: AccountStatus
  membership_tier: MembershipTier
  membership_started_at: string | null
  membership_expires_at: string | null
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export type CampAccountPage = {
  items: CampAccountAdmin[]
  total: number
  page: number
  page_size: number
}
