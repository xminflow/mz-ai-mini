import { Navigate, Route, Routes } from "react-router-dom";

import { PersonaSettingsPage } from "./pages/PersonaSettingsPage";
import { StrategySettingsPage } from "./pages/StrategySettingsPage";

export function Persona(): JSX.Element {
  return (
    <Routes>
      <Route index element={<Navigate to="profile" replace />} />
      <Route path="profile" element={<PersonaSettingsPage />} />
      <Route path="strategy" element={<StrategySettingsPage />} />
      <Route path="*" element={<Navigate to="/persona/profile" replace />} />
    </Routes>
  );
}
