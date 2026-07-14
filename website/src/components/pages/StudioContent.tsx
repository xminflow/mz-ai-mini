// src/components/pages/StudioContent.tsx
import { CtoSection } from './studio/CtoSection'
import { OrgDiagram } from './studio/OrgDiagram'
import { ProjectShowcase } from './studio/ProjectShowcase'

export function StudioContent() {
  return (
    <div className="relative">
      {/* 1. CTO 组织顶点 */}
      <CtoSection />

      {/* 2. 组织架构图：CTO 之下可扩展的多个研发部门 + 其中一个部门的内部结构放大 */}
      <OrgDiagram />

      {/* 3. 实战项目库：20 个课程项目，按难度分三档 */}
      <ProjectShowcase />
    </div>
  )
}
