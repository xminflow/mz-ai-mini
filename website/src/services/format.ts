export const formatDateLabel = (isoString: string | undefined): string => {
  if (!isoString || typeof isoString !== 'string') {
    return ''
  }
  const parsed = new Date(isoString)
  if (Number.isNaN(parsed.getTime())) {
    return ''
  }
  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const day = String(parsed.getDate()).padStart(2, '0')
  return `${year}.${month}.${day}`
}

export const formatReadTime = (minutes: number | undefined): string => {
  if (typeof minutes !== 'number' || !Number.isFinite(minutes) || minutes <= 0) {
    return ''
  }
  return `${Math.round(minutes)} 分钟阅读`
}

const CLOUD_FILE_PREFIX = 'cloud://'

export const isCloudFileId = (value: string): boolean => value.startsWith(CLOUD_FILE_PREFIX)
