import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { BloggerAnalysisShell } from "./BloggerAnalysisShell";
import { BloggerReportPage } from "./pages/BloggerReportPage";

function BloggerAnalysisRoutes(): JSX.Element {
  return (
    <Routes>
      <Route path="douyin">
        <Route index element={<BloggerAnalysisShell />} />
        <Route path=":id" element={<BloggerReportPage />} />
        <Route path=":id/report" element={<LegacyReportRedirect />} />
      </Route>
      <Route path="xiaohongshu" element={<XiaohongshuBloggerAnalysisPlaceholder />} />
      <Route index element={<Navigate to="douyin" replace />} />
      <Route path="*" element={<Navigate to="/blogger-analysis/douyin" replace />} />
    </Routes>
  );
}

function LegacyReportRedirect(): JSX.Element {
  const params = useParams();
  return <Navigate to={`/blogger-analysis/douyin/${params.id ?? ""}`} replace />;
}

function XiaohongshuBloggerAnalysisPlaceholder(): JSX.Element {
  return (
    <div
      className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 p-6"
      data-testid="xhs-blogger-analysis-screen"
    >
      <header>
        <h1 className="text-2xl font-semibold">小红书博主拆解</h1>
        <p className="mt-1 text-sm text-muted-foreground">该页面暂未开放。</p>
      </header>
      <div className="rounded-3xl bg-card p-10 text-center text-sm text-muted-foreground shadow-sm">
        敬请期待
      </div>
    </div>
  );
}

export function BloggerAnalysis(): JSX.Element {
  return <BloggerAnalysisRoutes />;
}
