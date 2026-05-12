import { Target } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  buildPersonaSummary,
  DEFAULT_PERSONA_PROFILE_FORM,
  loadPersonaProfileDraft,
  PERSONA_STORAGE_KEY,
  type PersonaProfileFormState,
} from "../persona-model";
import { clearDraft, saveDraft } from "../storage";
import {
  copyPlainText,
  EditorLayout,
  PageShell,
  SectionsRenderer,
  SummaryActions,
  useAutosave,
  type SectionDefinition,
} from "../shared";

const sections: SectionDefinition<PersonaProfileFormState>[] = [
  {
    id: "positioning",
    title: "定位四句法",
    icon: Target,
    fields: [
      { key: "targetAudience", label: "我服务谁", placeholder: "例如：第一次做知识账号、但表达和转化都不稳定的咨询型从业者。", rows: 3 },
      { key: "coreProblem", label: "我解决什么具体问题", placeholder: "例如：帮他们把专业经验翻译成用户听得懂、愿意停留的内容。", rows: 3 },
      { key: "trustReason", label: "我凭什么可信", placeholder: "例如：多年一线经验、真实案例、长期复盘、踩坑经历。", rows: 3 },
      { key: "expectedResult", label: "我让用户得到什么结果", placeholder: "例如：让用户更快建立清晰定位、稳定表达和可承接的内容结构。", rows: 3 },
    ],
  },
];

export function PersonaSettingsPage(): JSX.Element {
  const initial = useMemo(() => loadPersonaProfileDraft(), []);
  const [form, setForm] = useState<PersonaProfileFormState>(initial.draft);
  const { saveStatus, skipNextSaveRef, setSaveStatus } = useAutosave({
    value: form,
    save: (draft) => saveDraft(PERSONA_STORAGE_KEY, draft),
    initialHasDraft: initial.hasDraft,
  });
  const summary = useMemo(() => buildPersonaSummary(form), [form]);

  function updateField<Key extends keyof PersonaProfileFormState>(
    key: Key,
    value: PersonaProfileFormState[Key],
  ): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleReset(): void {
    skipNextSaveRef.current = true;
    setForm(DEFAULT_PERSONA_PROFILE_FORM);
    clearDraft(PERSONA_STORAGE_KEY);
    setSaveStatus("idle");
    toast.success("人设模板已重置。");
  }

  return (
    <PageShell
      title="人设设置"
      badges={["定位本体", "本地自动保存", "可复制摘要"]}
      saveStatus={saveStatus}
    >
      <EditorLayout
        sections={
          <>
            <SectionsRenderer sections={sections} form={form} onChange={updateField} />
          </>
        }
        sidebar={
          <Card className="sticky top-0 border-border/70 bg-card shadow-sm">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">可复制人设卡</h2>
                </div>
                <div className="rounded-md bg-amber-100 px-2 py-1 text-[11px] font-medium text-amber-900 dark:bg-amber-200 dark:text-amber-950">
                  最小摘要
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <section className="rounded-lg border border-border/70 bg-muted/40 p-4">
                <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">一句话定位</div>
                <p className="text-sm leading-7 text-foreground">{summary.positioningLine}</p>
              </section>
              <section className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">关键信息</div>
                <div className="space-y-3 text-sm leading-7">
                  <div><div className="font-medium text-foreground">我服务谁</div><div className="text-muted-foreground">{summary.audience}</div></div>
                  <div><div className="font-medium text-foreground">我解决什么问题</div><div className="text-muted-foreground">{summary.problem}</div></div>
                  <div><div className="font-medium text-foreground">我凭什么值得信任</div><div className="text-muted-foreground">{summary.trust}</div></div>
                  <div><div className="font-medium text-foreground">用户最终会得到什么</div><div className="text-muted-foreground">{summary.result}</div></div>
                </div>
              </section>
              <SummaryActions onReset={handleReset} onCopy={() => void copyPlainText(summary.plainText)} />
            </CardContent>
          </Card>
        }
      />
    </PageShell>
  );
}
