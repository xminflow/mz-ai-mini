import { Compass, Goal, LandPlot, Rocket } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  DEFAULT_STRATEGY_FORM,
  loadStrategyDraft,
  STRATEGY_STORAGE_KEY,
  type StrategyFormState,
} from "../strategy-model";
import { clearDraft, saveDraft } from "../storage";
import {
  EditorLayout,
  PageShell,
  SectionsRenderer,
  SummaryActions,
  useAutosave,
  type SectionDefinition,
} from "../shared";

const sections: SectionDefinition<StrategyFormState>[] = [
  {
    id: "origin",
    title: "出发点",
    icon: Rocket,
    fields: [
      { key: "motivation", label: "我为什么必须做这个账号", placeholder: "例如：需要一个长期沉淀信任和线索的内容阵地。", rows: 3 },
      { key: "annualGoal", label: "这个账号未来一年要服务哪个现实目标", placeholder: "例如：稳定获得咨询线索、建立个人品牌、验证某条赛道。", rows: 3 },
    ],
  },
  {
    id: "track",
    title: "赛道判断",
    icon: LandPlot,
    fields: [
      { key: "trackWhy", label: "我的赛道为什么值得做", placeholder: "例如：这是高信任赛道，用户问题重复出现，而且长期有商业价值。", rows: 3 },
    ],
  },
  {
    id: "platform",
    title: "平台主场",
    icon: Compass,
    fields: [
      { key: "platformChoice", label: "我选择哪个平台作为主场", placeholder: "例如：抖音做分发，小红书做搜索，先选一个主场。", rows: 3 },
    ],
  },
  {
    id: "business",
    title: "商业承接与边界",
    icon: Goal,
    fields: [
      { key: "businessModel", label: "未来靠什么承接这份信任", placeholder: "例如：咨询、服务、课程、私域、职业机会。", rows: 3 },
      { key: "opportunityBoundary", label: "哪些机会即使诱人，也会稀释长期定位", placeholder: "例如：和主赛道不一致的合作、只带热闹不带目标用户的话题。", rows: 3 },
      { key: "nextHypothesis", label: "接下来 30 天只验证一个关键假设", placeholder: "例如：这个定位有没有人看，这类内容能不能带来咨询。", rows: 3 },
    ],
  },
];

async function persistStrategy(draft: StrategyFormState): Promise<boolean> {
  const localSaved = saveDraft(STRATEGY_STORAGE_KEY, draft);
  try {
    const result = await window.api.persona.save({ strategy: draft });
    return localSaved && result.ok;
  } catch {
    return false;
  }
}

export function StrategySettingsPage(): JSX.Element {
  const initial = useMemo(() => loadStrategyDraft(), []);
  const [form, setForm] = useState<StrategyFormState>(initial.draft);
  const { saveStatus, skipNextSaveRef, setSaveStatus } = useAutosave({
    value: form,
    save: persistStrategy,
    initialHasDraft: initial.hasDraft,
  });

  useEffect(() => {
    void window.api.persona.save({ strategy: initial.draft }).catch(() => {});
  }, [initial.draft]);

  function updateField<Key extends keyof StrategyFormState>(key: Key, value: StrategyFormState[Key]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleReset(): void {
    skipNextSaveRef.current = true;
    setForm(DEFAULT_STRATEGY_FORM);
    clearDraft(STRATEGY_STORAGE_KEY);
    setSaveStatus("idle");
    void window.api.persona.save({ strategy: DEFAULT_STRATEGY_FORM }).catch(() => {
      setSaveStatus("error");
    });
    toast.success("战略模板已重置。");
  }

  return (
    <PageShell
      title="战略设置"
      badges={["账号作战地图", "本地自动保存"]}
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
