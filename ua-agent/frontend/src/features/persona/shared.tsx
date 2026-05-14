import { useEffect, useRef, useState, type ComponentProps, type MutableRefObject, type ReactNode } from "react";
import { ClipboardCopy, RefreshCcw, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/shared/ui/button";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { FormField } from "@/shared/ui/form-field";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import type { SaveStatus } from "./storage";

export const AUTOSAVE_DELAY_MS = 240;

export interface SectionField<T extends object> {
  key: keyof T;
  label: string;
  placeholder: string;
  type?: "input" | "textarea";
  rows?: number;
}

export interface SectionDefinition<T extends object> {
  id: string;
  title: string;
  icon: LucideIcon;
  fields?: SectionField<T>[];
  customContent?: ReactNode;
}

export function statusLabel(status: SaveStatus): string {
  switch (status) {
    case "saving":
      return "保存中";
    case "saved":
      return "已保存";
    case "error":
      return "保存失败";
    default:
      return "未修改";
  }
}

export function PageShell({
  title,
  badges,
  saveStatus,
  children,
}: {
  title: string;
  badges: string[];
  saveStatus: SaveStatus;
  children: ReactNode;
}): JSX.Element {
  return (
    <div
      className="app-shell-page h-full min-h-0 overflow-hidden bg-muted/30"
      data-testid="persona-screen"
    >
      <header className="page-header">
        <div className="max-w-3xl">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {badges.map((badge) => (
              <div
                key={badge}
                className="inline-flex items-center rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-foreground"
              >
                {badge}
              </div>
            ))}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        </div>
        <div className="flex items-center gap-3 rounded-md border border-border/70 bg-card px-4 py-3 shadow-sm">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" aria-hidden />
          <div className="text-sm text-foreground">
            <div className="font-medium">草稿状态</div>
            <div className="text-muted-foreground" data-testid="persona-save-status">
              {statusLabel(saveStatus)}
            </div>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

export function EditorLayout({
  sections,
  sidebar,
}: {
  sections: ReactNode;
  sidebar?: ReactNode;
}): JSX.Element {
  if (!sidebar) {
    return (
      <div className="min-h-0 flex-1 overflow-hidden">
        <main className="min-h-0 h-full space-y-4 overflow-y-auto pr-1">{sections}</main>
      </div>
    );
  }

  return (
    <div className="grid min-h-0 flex-1 gap-4 overflow-hidden xl:grid-cols-[minmax(0,1fr)_420px]">
      <main className="min-h-0 space-y-4 overflow-y-auto pr-1">{sections}</main>
      <aside className="min-h-0 overflow-y-auto">{sidebar}</aside>
    </div>
  );
}

export function TextareaField(props: ComponentProps<"textarea">): JSX.Element {
  return <Textarea {...props} />;
}

export function FieldRenderer<T extends object>({
  field,
  value,
  onChange,
}: {
  field: SectionField<T>;
  value: string;
  onChange: (next: string) => void;
}): JSX.Element {
  if (field.type === "input") {
    return (
      <Input
        id={String(field.key)}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        aria-label={field.label}
      />
    );
  }
  return (
    <TextareaField
      id={String(field.key)}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={field.placeholder}
      rows={field.rows ?? 3}
      aria-label={field.label}
      className="min-h-[92px] resize-y"
    />
  );
}

export function SectionsRenderer<T extends object>({
  sections,
  form,
  onChange,
}: {
  sections: SectionDefinition<T>[];
  form: T;
  onChange: <Key extends keyof T>(key: Key, value: T[Key]) => void;
}): JSX.Element {
  return (
    <>
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader className="border-b border-border/60 pb-5">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 rounded-lg bg-foreground p-2 text-background">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {section.customContent}
              {section.fields?.map((field) => (
                <FormField key={String(field.key)} label={field.label} htmlFor={String(field.key)}>
                  <FieldRenderer
                    field={field}
                    value={String(form[field.key] ?? "")}
                    onChange={(value) => onChange(field.key, value as T[keyof T])}
                  />
                </FormField>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </>
  );
}

export function SummaryActions({
  onReset,
  onCopy,
}: {
  onReset: () => void;
  onCopy?: () => void;
}): JSX.Element {
  return (
    <div className="flex flex-wrap gap-3 border-t border-border/60 pt-2">
      <Button type="button" variant="outline" onClick={onReset}>
        <RefreshCcw className="h-4 w-4" />
        重置模板
      </Button>
      {onCopy ? (
        <Button type="button" onClick={onCopy}>
          <ClipboardCopy className="h-4 w-4" />
          复制摘要
        </Button>
      ) : null}
    </div>
  );
}

export function useAutosave<T>({
  value,
  save,
  initialHasDraft,
}: {
  value: T;
  save: (draft: T) => boolean | Promise<boolean>;
  initialHasDraft: boolean;
}): { saveStatus: SaveStatus; skipNextSaveRef: MutableRefObject<boolean>; setSaveStatus: (status: SaveStatus) => void } {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(initialHasDraft ? "saved" : "idle");
  const didMountRef = useRef(false);
  const skipNextSaveRef = useRef(false);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }
    setSaveStatus("saving");
    const timer = window.setTimeout(() => {
      void Promise.resolve(save(value))
        .then((ok) => {
          setSaveStatus(ok ? "saved" : "error");
        })
        .catch(() => {
          setSaveStatus("error");
        });
    }, AUTOSAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [save, value]);

  return { saveStatus, skipNextSaveRef, setSaveStatus };
}

export async function copyPlainText(text: string): Promise<void> {
  if (typeof window.navigator.clipboard?.writeText !== "function") {
    toast.error("当前环境不支持复制。");
    return;
  }
  try {
    await window.navigator.clipboard.writeText(text);
    toast.success("已复制摘要。");
  } catch {
    toast.error("复制失败，请稍后重试。");
  }
}
