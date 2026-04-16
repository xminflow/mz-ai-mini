import { createBrowserRouter, Link } from 'react-router-dom'
import { RootLayout } from '../components/layout'
import { AboutPage, CasesPage, HomePage, ProjectsPage } from '../pages'

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'cases', element: <CasesPage /> },
      { path: 'about', element: <AboutPage /> },
      {
        path: '*',
        element: (
          <section className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-20 text-center sm:gap-6 sm:px-6 sm:py-28">
            <span className="font-mono text-xs tracking-[0.4em] text-muted sm:text-sm">404</span>
            <h1 className="text-[28px] font-semibold leading-[1.2] tracking-tight text-ink sm:text-3xl sm:leading-[1.15] lg:text-4xl">
              页面暂未上线
            </h1>
            <p className="max-w-md text-sm leading-[1.85] text-muted sm:text-[15px]">
              你访问的路径不存在，或者内容还在酝酿中。先从首页或项目列表开始浏览吧。
            </p>
            <div className="mt-1 flex gap-3 sm:mt-2">
              <Link
                to="/"
                className="inline-flex items-center rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-canvas transition-transform hover:-translate-y-0.5 sm:px-5 sm:text-sm"
              >
                回到首页
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center rounded-full border border-hairline bg-surface/60 px-4 py-2 text-[13px] font-medium text-ink transition-colors hover:border-hairline-strong sm:px-5 sm:text-sm"
              >
                浏览项目
              </Link>
            </div>
          </section>
        ),
      },
    ],
  },
])
