import type { TemplateDevice } from './types'

/** 截图、画廊与模拟设备共用同一组真实 CSS 视口尺寸。 */
export const TEMPLATE_DEVICES = {
  desktop: { label: 'PC', width: 1440, height: 1000 },
  tablet: { label: 'iPad', width: 834, height: 1180 },
  mobile: { label: 'H5', width: 390, height: 844 },
} as const satisfies Record<TemplateDevice, { label: string; width: number; height: number }>

export function isTemplateDevice(value: string | undefined): value is TemplateDevice {
  return value !== undefined && Object.hasOwn(TEMPLATE_DEVICES, value)
}
