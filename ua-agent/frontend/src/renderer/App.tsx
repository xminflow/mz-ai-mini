import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { useBloggerEvents } from "@/features/blogger-analysis/hooks/useBloggerEvents";
import { defaultNavTo, navItems } from "@/shared/nav/navItems";
import { SidebarShell } from "@/shared/nav/SidebarShell";
import { TitleBar } from "@/shared/nav/TitleBar";
import { useGlobalTaskRuntime } from "@/shared/tasks/useGlobalTaskRuntime";
import { TooltipProvider } from "@/shared/ui/tooltip";

export function App(): JSX.Element {
  useBloggerEvents();
  useGlobalTaskRuntime();

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex h-screen w-screen flex-col overflow-hidden bg-background text-foreground">
        <TitleBar />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <SidebarShell>
            <Suspense fallback={<div className="p-8 text-sm text-muted-foreground">加载中…</div>}>
              <Routes>
                {navItems.map(({ path, Element }) => (
                  <Route key={path} path={path} element={<Element />} />
                ))}
                <Route path="*" element={<Navigate to={defaultNavTo} replace />} />
              </Routes>
            </Suspense>
          </SidebarShell>
        </div>
      </div>
    </TooltipProvider>
  );
}
