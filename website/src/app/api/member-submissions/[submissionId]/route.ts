import { proxyMembershipRequest } from '../../membership/_shared'
import type { DeleteMemberSubmissionResponse } from '@/features/member-submissions/types'

export const dynamic = 'force-dynamic'

type RouteContext = {
  params: Promise<{ submissionId: string }>
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { submissionId } = await context.params
  // 透传到后端 DELETE /api/v1/member-submissions/{submission_id}；
  // 权限校验、状态校验都在后端 use case 中完成。
  return proxyMembershipRequest<DeleteMemberSubmissionResponse>(
    `/member-submissions/${encodeURIComponent(submissionId)}`,
    { method: 'DELETE' },
  )
}
