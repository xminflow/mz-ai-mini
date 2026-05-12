import { Check, CircleAlert, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import type { AppSettingsContract } from "@/shared/contracts/settings";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";

import { useUpdateSettings } from "../hooks/useSettings";
import { useTestLlmConnection } from "../hooks/useTestLlmConnection";

interface ProviderTabProps {
  settings: AppSettingsContract;
}

interface ProviderOption {
  id: AppSettingsContract["llm"]["provider"];
  label: string;
  description: string;
}

const PROVIDERS: readonly ProviderOption[] = [
  {
    id: "claude-code",
    label: "Claude Code",
    description: "通过本地 `claude` CLI 调用 Anthropic Claude，支持流式输出和会话恢复。",
  },
  {
    id: "codex",
    label: "Codex",
    description: "通过本地 `codex` CLI 调用 OpenAI Codex，工作目录固定为应用默认 userData。",
  },
  {
    id: "kimi",
    label: "Kimi",
    description: "通过本地 `kimi` CLI 调用 Kimi Code，认证沿用本机登录态。",
  },
];

export function ProviderTab({ settings }: ProviderTabProps): JSX.Element {
  const update = useUpdateSettings();
  const test = useTestLlmConnection();

  const [claudeBinPath, setClaudeBinPath] = useState(settings.llm.claudeCode.binPath ?? "");
  const [claudeApiKey, setClaudeApiKey] = useState(settings.llm.claudeCode.apiKey ?? "");
  const [defaultCwd, setDefaultCwd] = useState(settings.llm.claudeCode.defaultCwd ?? "");
  const [codexBinPath, setCodexBinPath] = useState(settings.llm.codex.binPath ?? "");
  const [kimiBinPath, setKimiBinPath] = useState(settings.llm.kimi.binPath ?? "");

  useEffect(() => {
    setClaudeBinPath(settings.llm.claudeCode.binPath ?? "");
    setClaudeApiKey(settings.llm.claudeCode.apiKey ?? "");
    setDefaultCwd(settings.llm.claudeCode.defaultCwd ?? "");
    setCodexBinPath(settings.llm.codex.binPath ?? "");
    setKimiBinPath(settings.llm.kimi.binPath ?? "");
  }, [
    settings.llm.claudeCode.binPath,
    settings.llm.claudeCode.apiKey,
    settings.llm.claudeCode.defaultCwd,
    settings.llm.codex.binPath,
    settings.llm.kimi.binPath,
  ]);

  const claudeDirty =
    claudeBinPath !== (settings.llm.claudeCode.binPath ?? "") ||
    claudeApiKey !== (settings.llm.claudeCode.apiKey ?? "") ||
    defaultCwd !== (settings.llm.claudeCode.defaultCwd ?? "");
  const codexDirty = codexBinPath !== (settings.llm.codex.binPath ?? "");
  const kimiDirty = kimiBinPath !== (settings.llm.kimi.binPath ?? "");

  const onSelectProvider = (id: ProviderOption["id"]) => {
    if (id === settings.llm.provider) return;
    update.mutate({ llm: { provider: id } });
  };

  const onSaveClaudeFields = () => {
    update.mutate({
      llm: {
        claudeCode: {
          binPath: claudeBinPath.trim() || undefined,
          apiKey: claudeApiKey.trim() || undefined,
          defaultCwd: defaultCwd.trim() || undefined,
        },
      },
    });
  };

  const onSaveCodexFields = () => {
    update.mutate({
      llm: {
        codex: {
          binPath: codexBinPath.trim() || undefined,
        },
      },
    });
  };

  const onSaveKimiFields = () => {
    update.mutate({
      llm: {
        kimi: {
          binPath: kimiBinPath.trim() || undefined,
        },
      },
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">语言模型</CardTitle>
          <CardDescription>选择驱动 AI 对话与分析能力的本地 provider。</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          {PROVIDERS.map((p) => {
            const selected = settings.llm.provider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectProvider(p.id)}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition",
                  selected
                    ? "border-foreground bg-muted/60"
                    : "border-border hover:border-foreground/30 hover:bg-muted/30",
                )}
                aria-pressed={selected}
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-sm font-semibold">{p.label}</span>
                  {selected ? <Check className="h-4 w-4" /> : null}
                </div>
                <span className="field-description">{p.description}</span>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {settings.llm.provider === "claude-code" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Claude Code 配置</CardTitle>
            <CardDescription>
              留空表示使用环境变量或系统默认值。修改后先保存，再测试连接。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FormField
              label="claude 可执行文件路径"
              description="留空时使用 PATH 上的 `claude`。Windows 下通常是 `claude.cmd` 或 `claude.exe`。"
            >
              <Input
                value={claudeBinPath}
                placeholder="例如 C:\\Users\\you\\AppData\\Roaming\\npm\\claude.cmd"
                onChange={(e) => setClaudeBinPath(e.target.value)}
                spellCheck={false}
              />
            </FormField>
            <FormField
              label="ANTHROPIC_API_KEY（可选）"
              description="留空时沿用 Claude Code 自身的登录态或系统环境变量。"
            >
              <Input
                type="password"
                value={claudeApiKey}
                placeholder="sk-ant-..."
                onChange={(e) => setClaudeApiKey(e.target.value)}
                spellCheck={false}
                autoComplete="off"
              />
            </FormField>
            <FormField
              label="旧默认工作目录（兼容）"
              description="保留兼容旧分析任务设置；AI 对话实际仍固定使用应用默认 userData。"
            >
              <Input
                value={defaultCwd}
                placeholder="例如 D:\\workspaces\\notes"
                onChange={(e) => setDefaultCwd(e.target.value)}
                spellCheck={false}
              />
            </FormField>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={onSaveClaudeFields} disabled={!claudeDirty || update.isPending}>
                {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                保存
              </Button>
              <Button variant="outline" onClick={() => test.mutate()} disabled={test.isPending}>
                {test.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                测试连接
              </Button>
              {test.data ? (
                <span className="flex items-center gap-1 text-xs">
                  {test.data.ok ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {test.data.version ?? "连接成功"}
                      </span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-amber-700 dark:text-amber-400">
                        {test.data.reason ?? "连接失败"}
                      </span>
                    </>
                  )}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : settings.llm.provider === "codex" ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Codex 配置</CardTitle>
            <CardDescription>
              认证沿用系统环境或本机登录态。运行时会固定使用应用默认 userData 目录作为工作目录。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FormField
              label="codex 可执行文件路径"
              description="留空时使用 PATH 上的 `codex`。若未安装，测试连接会直接提示。"
            >
              <Input
                value={codexBinPath}
                placeholder="例如 C:\\Users\\you\\AppData\\Local\\Programs\\codex\\codex.exe"
                onChange={(e) => setCodexBinPath(e.target.value)}
                spellCheck={false}
              />
            </FormField>
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
              工作目录固定为应用默认 userData
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={onSaveCodexFields} disabled={!codexDirty || update.isPending}>
                {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                保存
              </Button>
              <Button variant="outline" onClick={() => test.mutate()} disabled={test.isPending}>
                {test.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                测试连接
              </Button>
              {test.data ? (
                <span className="flex items-center gap-1 text-xs">
                  {test.data.ok ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {test.data.version ?? "连接成功"}
                      </span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-amber-700 dark:text-amber-400">
                        {test.data.reason ?? "连接失败"}
                      </span>
                    </>
                  )}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Kimi 配置</CardTitle>
            <CardDescription>
              认证沿用本机 `kimi login` 登录态。运行时固定使用应用默认 userData 目录作为工作目录。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FormField
              label="kimi 可执行文件路径"
              description="留空时使用 PATH 上的 `kimi`。若未安装，测试连接会直接提示。"
            >
              <Input
                value={kimiBinPath}
                placeholder="例如 C:\\Users\\you\\AppData\\Local\\Programs\\Kimi\\kimi.exe"
                onChange={(e) => setKimiBinPath(e.target.value)}
                spellCheck={false}
              />
            </FormField>
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-sm leading-7 text-muted-foreground">
              认证方式：`kimi login`
            </div>
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button onClick={onSaveKimiFields} disabled={!kimiDirty || update.isPending}>
                {update.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                保存
              </Button>
              <Button variant="outline" onClick={() => test.mutate()} disabled={test.isPending}>
                {test.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                测试连接
              </Button>
              {test.data ? (
                <span className="flex items-center gap-1 text-xs">
                  {test.data.ok ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {test.data.version ?? "连接成功"}
                      </span>
                    </>
                  ) : (
                    <>
                      <CircleAlert className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-amber-700 dark:text-amber-400">
                        {test.data.reason ?? "连接失败"}
                      </span>
                    </>
                  )}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
