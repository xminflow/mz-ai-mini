import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { AppSettingsContract } from "@/shared/contracts/settings";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

import { useUpdateSettings } from "../hooks/useSettings";

interface NetworkTabProps {
  settings: AppSettingsContract;
}

export function NetworkTab({ settings }: NetworkTabProps): JSX.Element {
  const update = useUpdateSettings();

  const [httpsProxy, setHttpsProxy] = useState(settings.network.httpsProxy ?? "");
  const [httpProxy, setHttpProxy] = useState(settings.network.httpProxy ?? "");
  const [noProxy, setNoProxy] = useState(settings.network.noProxy ?? "");

  useEffect(() => {
    setHttpsProxy(settings.network.httpsProxy ?? "");
    setHttpProxy(settings.network.httpProxy ?? "");
    setNoProxy(settings.network.noProxy ?? "");
  }, [settings.network.httpsProxy, settings.network.httpProxy, settings.network.noProxy]);

  const dirty =
    httpsProxy !== (settings.network.httpsProxy ?? "") ||
    httpProxy !== (settings.network.httpProxy ?? "") ||
    noProxy !== (settings.network.noProxy ?? "");

  const onSave = () => {
    update.mutate({
      network: {
        httpsProxy: httpsProxy.trim() || undefined,
        httpProxy: httpProxy.trim() || undefined,
        noProxy: noProxy.trim() || undefined,
      },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">网络代理</CardTitle>
        <CardDescription>
          这些代理会作为环境变量传给后续启动的 LLM 子进程。留空表示不设置。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <FormField label="HTTPS_PROXY">
          <Input
            value={httpsProxy}
            placeholder="http://127.0.0.1:7890"
            onChange={(e) => setHttpsProxy(e.target.value)}
            spellCheck={false}
          />
        </FormField>
        <FormField label="HTTP_PROXY">
          <Input
            value={httpProxy}
            placeholder="http://127.0.0.1:7890"
            onChange={(e) => setHttpProxy(e.target.value)}
            spellCheck={false}
          />
        </FormField>
        <FormField label="NO_PROXY">
          <Input
            value={noProxy}
            placeholder="localhost,127.0.0.1"
            onChange={(e) => setNoProxy(e.target.value)}
            spellCheck={false}
          />
        </FormField>
        <div className="pt-2">
          <Button onClick={onSave} disabled={!dirty || update.isPending}>
            {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            保存
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
