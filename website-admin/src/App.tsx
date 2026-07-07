import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

function Placeholder({ title }: { title: string }) {
  return <div className="p-8 text-xl font-semibold">{title}</div>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Placeholder title="登录" />} />
        <Route path="/users" element={<Placeholder title="用户管理" />} />
        <Route path="*" element={<Navigate to="/users" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
