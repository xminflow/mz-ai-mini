import { Navigate, Route, Routes } from "react-router-dom";

import { ProductAnalysisPage } from "./pages/ProductAnalysisPage";
import { TrackAnalysisDetailPage } from "./pages/TrackAnalysisDetailPage";
import { TrackAnalysisPage } from "./pages/TrackAnalysisPage";

export function TrackAnalysis(): JSX.Element {
  return (
    <Routes>
      <Route index element={<Navigate to="track" replace />} />
      <Route path="track" element={<TrackAnalysisPage />} />
      <Route path="track/:id" element={<TrackAnalysisDetailPage />} />
      <Route path="product" element={<ProductAnalysisPage />} />
      <Route path="overview" element={<Navigate to="/track-analysis/track" replace />} />
      <Route path="*" element={<Navigate to="/track-analysis/track" replace />} />
    </Routes>
  );
}
