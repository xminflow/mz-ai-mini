import type {
  AsrInstallProgressEvent,
  AsrInstallResult,
  AsrStatusResult,
} from "@/shared/contracts/transcript";
import { CheckCircle2, Download, Loader2, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";

function formatBytes(bytes: number | null): string {
  if (bytes === null || bytes <= 0) return "—";
  const gb = bytes / (1024 * 1024 * 1024);
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(0)} MB`;
}

export function AsrTab(): JSX.Element {
  const [status, setStatus] = useState<AsrStatusResult | null>(null);
  const [installing, setInstalling] = useState(false);
  const [progress, setProgress] = useState<AsrInstallProgressEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const raw = await window.api.asr.status();
        if (cancelled) return;
        setStatus(raw as AsrStatusResult);
      } catch (err) {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : String(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTick]);

  useEffect(() => {
    const id = window.api.asr.onInstallProgress((rawEvent) => {
      const event = rawEvent as AsrInstallProgressEvent;
      setProgress(event);
      if (event.stage === "error" && event.message) {
        setErrorMessage(event.message);
      }
    });
    return () => {
      window.api.asr.offInstallProgress(id);
    };
  }, []);

  const handleInstall = async (): Promise<void> => {
    setInstalling(true);
    setErrorMessage(null);
    setProgress({ stage: "queued" });
    try {
      const raw = await window.api.asr.install();
      const result = raw as AsrInstallResult;
      if (!result.ok) {
        setErrorMessage(result.error.message);
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setInstalling(false);
      setRefreshTick((n) => n + 1);
    }
  };

  const installed = status?.installed === true;
  const sizeLabel = formatBytes(status?.size_bytes ?? null);
  const percent = progress?.percent !== undefined ? Math.min(100, Math.round(progress.percent)) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">语音识别模型</CardTitle>
        <CardDescription>
          本地语音识别模型，约 3.3 GB，仅需下载一次。
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm">
          {installed ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-medium text-emerald-700 dark:text-emerald-300">
                已安装
              </span>
              <span className="text-muted-foreground">· {sizeLabel}</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span className="font-medium text-amber-700 dark:text-amber-300">未安装</span>
            </>
          )}
        </div>

        {installing || progress !== null ? (
          <div
            className="rounded-md border border-border bg-muted/40 p-3"
            data-testid="asr-install-progress"
          >
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {progress?.stage === "queued" && "准备中…"}
                {progress?.stage === "listing" && (progress.message ?? "枚举文件…")}
                {progress?.stage === "downloading" &&
                  (progress.file && progress.file.length > 0 ? `下载 ${progress.file}` : "下载中")}
                {progress?.stage === "verifying" && "校验中…"}
                {progress?.stage === "done" && "完成"}
                {progress?.stage === "error" && "下载失败"}
              </span>
              {percent !== null ? <span>{percent}%</span> : null}
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded bg-muted">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${percent ?? 0}%` }}
              />
            </div>
          </div>
        ) : null}

        {errorMessage !== null ? (
          <div
            className="rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
            data-testid="asr-error"
          >
            {errorMessage}
          </div>
        ) : null}

        <div className="pt-1">
          <Button
            onClick={() => {
              void handleInstall();
            }}
            disabled={installing || installed}
            data-testid="asr-install-button"
          >
            {installing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {installed ? "已安装" : installing ? "下载中…" : "下载语音模型"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
