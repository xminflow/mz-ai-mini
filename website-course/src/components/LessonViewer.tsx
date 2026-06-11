import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useLayoutManifest } from './Layout'
import { flattenSections, findAdjacent } from '../lib/manifest'

// 右侧课程展示：顶部上/下一节导航条 + iframe 加载完整 HTML 文档
export default function LessonViewer() {
  const manifest = useLayoutManifest()
  const { chapterId = '', sectionId = '' } = useParams()
  const navigate = useNavigate()
  const [iframeError, setIframeError] = useState(false)

  const flat = useMemo(() => flattenSections(manifest), [manifest])
  const { prev, current, next } = findAdjacent(flat, chapterId, sectionId)
  const currentFile = current?.file

  // iframe 的 onError 对跨文档加载不可靠，这里用 HEAD 显式探测课程文件是否存在。
  // 依赖 currentFile 字符串（而非每次渲染都新建的 current 对象），避免失败态触发无限重渲染循环。
  useEffect(() => {
    setIframeError(false)
    if (!currentFile) return
    let alive = true
    fetch(`/courses/${currentFile}`, { method: 'HEAD' })
      .then((res) => {
        if (alive && !res.ok) setIframeError(true)
      })
      .catch(() => {
        if (alive) setIframeError(true)
      })
    return () => {
      alive = false
    }
  }, [currentFile])

  if (!current) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-gray-500">
        <p>未找到该课程</p>
        <button type="button" className="text-blue-600 underline" onClick={() => navigate('/')}>
          返回目录
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
        <button
          type="button"
          disabled={!prev}
          onClick={() => prev && navigate(`/c/${prev.chapterId}/s/${prev.id}`)}
          className="rounded px-3 py-1 text-sm text-blue-600 enabled:hover:bg-blue-50 disabled:text-gray-300"
        >
          ← 上一节
        </button>
        <span className="truncate px-2 text-sm font-medium text-gray-700">
          {current.id} {current.title}
        </span>
        <button
          type="button"
          disabled={!next}
          onClick={() => next && navigate(`/c/${next.chapterId}/s/${next.id}`)}
          className="rounded px-3 py-1 text-sm text-blue-600 enabled:hover:bg-blue-50 disabled:text-gray-300"
        >
          下一节 →
        </button>
      </div>
      <div className="relative flex-1">
        {iframeError ? (
          <div className="flex h-full items-center justify-center text-red-600">
            课程文件缺失：{current.file}
          </div>
        ) : (
          <iframe
            key={current.file}
            src={`/courses/${current.file}`}
            title={current.title}
            className="h-full w-full border-0"
            onError={() => setIframeError(true)}
          />
        )}
      </div>
    </div>
  )
}
