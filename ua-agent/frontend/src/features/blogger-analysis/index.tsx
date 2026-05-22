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
      <Route index element={<Navigate to="douyin" replace />} />
      <Route path="*" element={<Navigate to="/blogger-analysis/douyin" replace />} />
    </Routes>
  );
}

function LegacyReportRedirect(): JSX.Element {
  const params = useParams();
  return <Navigate to={`/blogger-analysis/douyin/${params.id ?? ""}`} replace />;
}

export function BloggerAnalysis(): JSX.Element {
  return <BloggerAnalysisRoutes />;
}
