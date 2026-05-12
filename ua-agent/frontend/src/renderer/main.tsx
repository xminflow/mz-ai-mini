import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

import { App } from "./App";
import { ThemeSync } from "./ThemeSync";
import { queryClient } from "@/lib/react-query";
import "./styles/index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("#root mount node missing from index.html");
}

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <HashRouter>
          <ThemeSync />
          <App />
          <Toaster richColors position="bottom-right" />
        </HashRouter>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
