export const DEFAULT_ACCOUNT_AVATAR = '/logo/weelume-avatar-light.svg'

export function AccountAvatar({ avatarUrl, size = 'small' }: { avatarUrl: string | null; size?: 'small' | 'large' }) {
  return <img
    src={avatarUrl || DEFAULT_ACCOUNT_AVATAR}
    alt="用户头像"
    className={`${size === 'large' ? 'h-20 w-20' : 'h-7 w-7'} shrink-0 rounded-full border border-rule bg-paper object-cover`}
  />
}
