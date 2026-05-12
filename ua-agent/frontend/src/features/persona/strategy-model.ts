import { loadDraft, normalizeString, placeholder } from "./storage";

export const STRATEGY_STORAGE_KEY = "ua-agent.persona-strategy.v1";

export interface StrategyFormState {
  motivation: string;
  annualGoal: string;
  trackWhy: string;
  platformChoice: string;
  businessModel: string;
  opportunityBoundary: string;
  nextHypothesis: string;
}

export interface StrategySummaryCard {
  whyNow: string;
  annualGoal: string;
  marketDecision: string;
  platformDecision: string;
  monetization: string;
  boundary: string;
  hypothesis: string;
  plainText: string;
}

export const DEFAULT_STRATEGY_FORM: StrategyFormState = {
  motivation: "",
  annualGoal: "",
  trackWhy: "",
  platformChoice: "",
  businessModel: "",
  opportunityBoundary: "",
  nextHypothesis: "",
};

export function normalizeStrategyDraft(raw: unknown): StrategyFormState {
  if (raw === null || typeof raw !== "object") {
    return DEFAULT_STRATEGY_FORM;
  }
  const source = raw as Partial<Record<keyof StrategyFormState, unknown>>;
  return {
    motivation: normalizeString(source.motivation),
    annualGoal: normalizeString(source.annualGoal),
    trackWhy: normalizeString(source.trackWhy),
    platformChoice: normalizeString(source.platformChoice),
    businessModel: normalizeString(source.businessModel),
    opportunityBoundary: normalizeString(source.opportunityBoundary),
    nextHypothesis: normalizeString(source.nextHypothesis),
  };
}

export function loadStrategyDraft(storage: Storage | null = globalThis.localStorage ?? null): {
  draft: StrategyFormState;
  hasDraft: boolean;
} {
  return loadDraft(STRATEGY_STORAGE_KEY, DEFAULT_STRATEGY_FORM, normalizeStrategyDraft, storage);
}

export function buildStrategySummary(form: StrategyFormState): StrategySummaryCard {
  const sections = [
    ["为什么现在做", placeholder(form.motivation, "待填写：先写清楚为什么必须做这个账号")],
    ["一年目标", placeholder(form.annualGoal, "待填写：这个账号未来一年要服务哪个现实目标")],
    ["赛道判断", placeholder(form.trackWhy, "待填写：这个赛道为什么值得做")],
    ["平台主场", placeholder(form.platformChoice, "待填写：选择哪个平台作为主场")],
    ["商业承接", placeholder(form.businessModel, "待填写：未来靠什么承接这份信任")],
    ["机会边界", placeholder(form.opportunityBoundary, "待填写：哪些机会会稀释长期定位")],
    ["30 天验证假设", placeholder(form.nextHypothesis, "待填写：接下来只验证一个关键假设")],
  ] as const;

  return {
    whyNow: placeholder(form.motivation, "待填写"),
    annualGoal: placeholder(form.annualGoal, "待填写"),
    marketDecision: placeholder(form.trackWhy, "待填写"),
    platformDecision: placeholder(form.platformChoice, "待填写"),
    monetization: placeholder(form.businessModel, "待填写"),
    boundary: placeholder(form.opportunityBoundary, "待填写"),
    hypothesis: placeholder(form.nextHypothesis, "待填写"),
    plainText: sections.map(([title, content]) => `【${title}】\n${content}`).join("\n\n"),
  };
}
