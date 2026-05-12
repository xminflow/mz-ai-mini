import { useEffect } from "react";
import { useTheme } from "next-themes";

import { useSettings } from "@/features/settings/hooks/useSettings";

// Bridges the persisted `settings.theme` value (from <userData>/config.json) into
// next-themes' runtime theme state. Mounted once at app root; renders nothing.
export function ThemeSync(): null {
  const { data: settings } = useSettings();
  const { theme: current, setTheme } = useTheme();

  useEffect(() => {
    if (!settings) return;
    if (settings.theme !== current) {
      setTheme(settings.theme);
    }
  }, [settings, current, setTheme]);

  return null;
}
