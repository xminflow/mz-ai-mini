import { loadDraft, normalizeString, placeholder } from "./storage";

export const PERSONA_STORAGE_KEY = "ua-agent.persona-profile.v1";

export interface PersonaProfileFormState {
  targetAudience: string;
  coreProblem: string;
  trustReason: string;
  expectedResult: string;
}

export interface PersonaSummaryCard {
  positioningLine: string;
  audience: string;
  problem: string;
  trust: string;
  result: string;
  plainText: string;
}

export const DEFAULT_PERSONA_PROFILE_FORM: PersonaProfileFormState = {
  targetAudience: "",
  coreProblem: "",
  trustReason: "",
  expectedResult: "",
};

export function normalizePersonaProfileDraft(raw: unknown): PersonaProfileFormState {
  if (raw === null || typeof raw !== "object") {
    return DEFAULT_PERSONA_PROFILE_FORM;
  }
  const source = raw as Partial<Record<keyof PersonaProfileFormState, unknown>>;
  return {
    targetAudience: normalizeString(source.targetAudience),
    coreProblem: normalizeString(source.coreProblem),
    trustReason: normalizeString(source.trustReason),
    expectedResult: normalizeString(source.expectedResult),
  };
}

export function loadPersonaProfileDraft(storage: Storage | null = globalThis.localStorage ?? null): {
  draft: PersonaProfileFormState;
  hasDraft: boolean;
} {
  return loadDraft(PERSONA_STORAGE_KEY, DEFAULT_PERSONA_PROFILE_FORM, normalizePersonaProfileDraft, storage);
}

export function buildPersonaSummary(form: PersonaProfileFormState): PersonaSummaryCard {
  const positioningLine = [
    form.targetAudience.trim() || "我服务一类具体的人",
    form.coreProblem.trim() || "解决一个具体问题",
    form.expectedResult.trim() || "并交付一个能被感知的结果",
  ].join("，");

  const sections = [
    ["一句话定位", positioningLine],
    ["我服务谁", placeholder(form.targetAudience, "待填写：先写清楚你最想服务的那类人")],
    ["我解决什么问题", placeholder(form.coreProblem, "待填写：先把用户最愿意解决的问题写具体")],
    ["我凭什么值得信任", placeholder(form.trustReason, "待填写：补上经验、案例、方法或真实经历")],
    ["用户最终会得到什么", placeholder(form.expectedResult, "待填写：把结果写成用户能感知到的变化")],
  ] as const;

  return {
    positioningLine,
    audience: placeholder(form.targetAudience, "待填写"),
    problem: placeholder(form.coreProblem, "待填写"),
    trust: placeholder(form.trustReason, "待填写"),
    result: placeholder(form.expectedResult, "待填写"),
    plainText: sections.map(([title, content]) => `【${title}】\n${content}`).join("\n\n"),
  };
}
