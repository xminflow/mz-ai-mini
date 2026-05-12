import { Compass, Goal, LandPlot, Rocket, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import {
  buildStrategySummary,
  DEFAULT_STRATEGY_FORM,
  loadStrategyDraft,
  STRATEGY_STORAGE_KEY,
  type StrategyFormState,
} from "../strategy-model";
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

export function StrategySettingsPage(): JSX.Element {
  const initial = useMemo(() => loadStrategyDraft(), []);
  const [form, setForm] = useState<StrategyFormState>(initial.draft);
  const { saveStatus, skipNextSaveRef, setSaveStatus } = useAutosave({
    value: form,
    save: (draft) => saveDraft(STRATEGY_STORAGE_KEY, draft),
    initialHasDraft: initial.hasDraft,
  });
  const summary = useMemo(() => buildStrategySummary(form), [form]);

  function updateField<Key extends keyof StrategyFormState>(key: Key, value: StrategyFormState[Key]): void {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleReset(): void {
    skipNextSaveRef.current = true;
    setForm(DEFAULT_STRATEGY_FORM);
    clearDraft(STRATEGY_STORAGE_KEY);
    setSaveStatus("idle");
    toast.success("战略模板已重置。");
  }

  return (
    <PageShell
      title="战略设置"
      badges={["账号作战地图", "本地自动保存", "最小战略"]}
      saveStatus={saveStatus}
    >
      <EditorLayout
        sections={<SectionsRenderer sections={sections} form={form} onChange={updateField} />}
        sidebar={
          <Card className="sticky top-0 border-border/70 bg-card shadow-sm">
            <CardHeader className="border-b border-border/60">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">战略摘要</h2>
                </div>
                <div className="rounded-md bg-emerald-100 px-2 py-1 text-[11px] font-medium text-emerald-900 dark:bg-emerald-200 dark:text-emerald-950">
                  最小摘要
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5 pt-6">
              <section className="rounded-lg border border-border/70 bg-muted/40 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  为什么现在做
                </div>
                <p className="text-sm leading-7 text-foreground">{summary.whyNow}</p>
              </section>
              <section className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">核心判断</div>
                <div className="space-y-3 text-sm leading-7">
                  <div><div className="font-medium text-foreground">一年目标</div><div className="text-muted-foreground">{summary.annualGoal}</div></div>
                  <div><div className="font-medium text-foreground">赛道判断</div><div className="text-muted-foreground">{summary.marketDecision}</div></div>
                  <div><div className="font-medium text-foreground">平台主场</div><div className="text-muted-foreground">{summary.platformDecision}</div></div>
                  <div><div className="font-medium text-foreground">商业承接</div><div className="text-muted-foreground">{summary.monetization}</div></div>
                </div>
              </section>
              <section className="space-y-3">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">边界与验证</div>
                <div className="rounded-lg border border-border/70 bg-background p-4 text-sm leading-7 text-muted-foreground">
                  <p><span className="font-medium text-foreground">机会边界：</span>{summary.boundary}</p>
                  <p className="mt-3"><span className="font-medium text-foreground">30 天验证假设：</span>{summary.hypothesis}</p>
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
