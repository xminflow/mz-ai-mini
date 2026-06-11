import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Welcome from './components/Welcome'
import LessonViewer from './components/LessonViewer'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Welcome />} />
          <Route path="c/:chapterId/s/:sectionId" element={<LessonViewer />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
