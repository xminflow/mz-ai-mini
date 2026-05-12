import { Navigate, Route, Routes } from "react-router-dom";

import { FeatureErrorBoundary } from "./ErrorBoundary";
import { KeywordCrawlShell } from "./KeywordCrawlShell";
import { ContentDiagnosisPage } from "./pages/ContentDiagnosisPage";
import { DouyinCollectPage } from "./pages/DouyinCollectPage";
import { HotAnalysisPage } from "./pages/HotAnalysisPage";
import { LibraryPage } from "./pages/LibraryPage";
import { RealTimeTrendsPage } from "./pages/RealTimeTrendsPage";
import { XiaohongshuCollectPage } from "./pages/XiaohongshuCollectPage";

export function KeywordCrawl(): JSX.Element {
  return (
    <FeatureErrorBoundary>
      <Routes>
        <Route element={<KeywordCrawlShell />}>
          <Route index element={<Navigate to="library" replace />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="hot-analysis" element={<HotAnalysisPage />} />
          <Route path="content-diagnosis" element={<ContentDiagnosisPage />} />
          <Route path="douyin" element={<DouyinCollectPage />} />
          <Route path="xiaohongshu" element={<XiaohongshuCollectPage />} />
          <Route path="realtime-trends" element={<RealTimeTrendsPage />} />
          <Route path="*" element={<Navigate to="library" replace />} />
        </Route>
      </Routes>
    </FeatureErrorBoundary>
  );
}
