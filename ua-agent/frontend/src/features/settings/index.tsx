import { Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";

import { AppearanceTab } from "./components/AppearanceTab";
import { NetworkTab } from "./components/NetworkTab";
import { ProviderTab } from "./components/ProviderTab";
import { AsrTab } from "./components/WhisperTab";
import { useSettings } from "./hooks/useSettings";

const VALID_TABS = ["provider", "asr", "network", "appearance"] as const;
type SettingsTab = (typeof VALID_TABS)[number];

function isValidTab(s: string | null): s is SettingsTab {
  return s !== null && (VALID_TABS as readonly string[]).includes(s);
}

export function Settings(): JSX.Element {
  const query = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: SettingsTab = isValidTab(tabParam) ? tabParam : "provider";

  return (
    <div className="app-shell-page max-w-5xl bg-muted/30" data-testid="settings-screen">
      <header className="page-header">
        <h1 className="text-2xl font-semibold">设置</h1>
      </header>

      {query.isLoading ? (
        <div className="flex items-center gap-2 rounded-xl bg-card px-4 py-5 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          正在加载设置…
        </div>
      ) : query.isError ? (
        <div className="rounded-md border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200">
          设置加载失败：{query.error.message}
        </div>
      ) : query.data ? (
        <Tabs
          value={activeTab}
          onValueChange={(next) => {
            const sp = new URLSearchParams(searchParams);
            if (next === "provider") sp.delete("tab");
            else sp.set("tab", next);
            setSearchParams(sp, { replace: true });
          }}
          className="flex flex-col gap-4"
        >
          <TabsList className="self-start">
            <TabsTrigger value="provider">语言模型</TabsTrigger>
            <TabsTrigger value="asr">语音识别</TabsTrigger>
            <TabsTrigger value="network">网络</TabsTrigger>
            <TabsTrigger value="appearance">外观</TabsTrigger>
          </TabsList>
          <TabsContent value="provider">
            <ProviderTab settings={query.data} />
          </TabsContent>
          <TabsContent value="asr">
            <AsrTab />
          </TabsContent>
          <TabsContent value="network">
            <NetworkTab settings={query.data} />
          </TabsContent>
          <TabsContent value="appearance">
            <AppearanceTab settings={query.data} />
          </TabsContent>
        </Tabs>
      ) : null}
    </div>
  );
}
