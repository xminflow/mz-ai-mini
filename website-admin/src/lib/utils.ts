import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 className：先用 clsx 处理条件类名，再用 tailwind-merge 去除冲突的 Tailwind 类。
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
