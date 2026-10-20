'use client'

import { PageScrollbar as DocumentScrollbar } from '../../../shared/PageScrollbar'

export function PageScrollbar({ label }: { label: string }) {
  return <DocumentScrollbar label={label} className="nb-scrollbar" controlsId="nb-main" />
}
