import { Target } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  DEFAULT_PERSONA_PROFILE_FORM,
  loadPersonaProfileDraft,
  PERSONA_STORAGE_KEY,
  type PersonaProfileFormState,
} from "../persona-model";
import { clearDraft, saveDraft } from "../storage";
import {
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

async function persistPersonaProfile(draft: PersonaProfileFormState): Promise<boolean> {
  const localSaved = saveDraft(PERSONA_STORAGE_KEY, draft);
  try {
    const result = await window.api.persona.save({ profile: draft });
    return localSaved && result.ok;
  } catch {
    return false;
  }
}

export function PersonaSettingsPage(): JSX.Element {
  const initial = useMemo(() => loadPersonaProfileDraft(), []);
  const [form, setForm] = useState<PersonaProfileFormState>(initial.draft);
  const { saveStatus, skipNextSaveRef, setSaveStatus } = useAutosave({
    value: form,
    save: persistPersonaProfile,
    initialHasDraft: initial.hasDraft,
  });

  useEffect(() => {
    void window.api.persona.save({ profile: initial.draft }).catch(() => {});
  }, [initial.draft]);

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
    void window.api.persona.save({ profile: DEFAULT_PERSONA_PROFILE_FORM }).catch(() => {
      setSaveStatus("error");
    });
    toast.success("人设模板已重置。");
  }

  return (
    <PageShell
      title="人设设置"
      badges={["定位本体", "本地自动保存"]}
      saveStatus={saveStatus}
    >
      <EditorLayout
        sections={
          <>
            <SectionsRenderer sections={sections} form={form} onChange={updateField} />
            <SummaryActions onReset={handleReset} />
          </>
        }
      />
    </PageShell>
  );
}
