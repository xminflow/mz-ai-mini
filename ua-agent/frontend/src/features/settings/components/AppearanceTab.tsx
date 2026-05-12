import { Check } from "lucide-react";

import type { AppSettingsContract } from "@/shared/contracts/settings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { cn } from "@/shared/lib/utils";

import { useUpdateSettings } from "../hooks/useSettings";

interface AppearanceTabProps {
  settings: AppSettingsContract;
}

const THEMES: ReadonlyArray<{
  id: AppSettingsContract["theme"];
  label: string;
  description: string;
}> = [
  { id: "system", label: "跟随系统", description: "根据操作系统配色自动切换。" },
  { id: "light", label: "浅色", description: "始终使用浅色主题。" },
  { id: "dark", label: "深色", description: "始终使用深色主题。" },
];

export function AppearanceTab({ settings }: AppearanceTabProps): JSX.Element {
  const update = useUpdateSettings();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">外观</CardTitle>
        <CardDescription>选择应用的主题模式。</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {THEMES.map((t) => {
          const selected = settings.theme === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                if (!selected) update.mutate({ theme: t.id });
              }}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition",
                selected
                  ? "border-foreground bg-muted/60"
                  : "border-border hover:border-foreground/30 hover:bg-muted/30",
              )}
              aria-pressed={selected}
            >
              <div className="flex w-full items-center justify-between">
                <span className="text-sm font-semibold">{t.label}</span>
                {selected ? <Check className="h-4 w-4" /> : null}
              </div>
              <span className="field-description">{t.description}</span>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
