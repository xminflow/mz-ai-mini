// src/components/pages/StudioContent.tsx
import { CtoSection } from './studio/CtoSection'
import { OrgDiagram } from './studio/OrgDiagram'

export function StudioContent() {
  return (
    <div className="relative">
      {/* 1. CTO 组织顶点 */}
      <CtoSection />

      {/* 2. 组织架构图：CTO 之下可扩展的多个研发部门 + 其中一个部门的内部结构放大 */}
      <OrgDiagram />
    </div>
  )
}
