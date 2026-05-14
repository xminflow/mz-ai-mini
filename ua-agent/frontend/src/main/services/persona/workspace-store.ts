import { promises as fs } from "node:fs";
import path from "node:path";

import { app } from "electron";

import {
  personaWorkspaceStateSchema,
  type PersonaProfileForm,
  type PersonaSavePayload,
  type PersonaWorkspaceState,
  type StrategyForm,
} from "../../../shared/contracts/persona";

const PERSONA_JSON_FILE = "persona-context.json";
const PERSONA_MARKDOWN_FILE = "persona-context.md";

const DEFAULT_PROFILE: PersonaProfileForm = {
  targetAudience: "",
  coreProblem: "",
  trustReason: "",
  expectedResult: "",
};

const DEFAULT_STRATEGY: StrategyForm = {
  motivation: "",
  annualGoal: "",
  trackWhy: "",
  platformChoice: "",
  businessModel: "",
  opportunityBoundary: "",
  nextHypothesis: "",
};

function workspaceRoot(): string {
  return app.getPath("userData");
}

function nowIso(): string {
  return new Date().toISOString();
}

export function personaJsonPath(root = workspaceRoot()): string {
  return path.join(root, PERSONA_JSON_FILE);
}

export function personaMarkdownPath(root = workspaceRoot()): string {
  return path.join(root, PERSONA_MARKDOWN_FILE);
}

function defaultState(): PersonaWorkspaceState {
  return {
    profile: { ...DEFAULT_PROFILE },
    strategy: { ...DEFAULT_STRATEGY },
    updated_at: nowIso(),
  };
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readState(root = workspaceRoot()): Promise<PersonaWorkspaceState> {
  const filePath = personaJsonPath(root);
  if (!(await exists(filePath))) {
    return defaultState();
  }
  const raw = await fs.readFile(filePath, "utf8");
  return personaWorkspaceStateSchema.parse(JSON.parse(raw));
}

function section(title: string, body: string): string {
  return `## ${title}\n${body.trim().length > 0 ? `${body.trim()}\n` : "未设置\n"}`;
}

function field(label: string, value: string): string {
  const normalized = value.trim();
  return `- ${label}：${normalized.length > 0 ? normalized : "未设置"}`;
}

function renderMarkdown(state: PersonaWorkspaceState): string {
  return [
    "# Persona Context",
    "",
    "本文件由 ua-agent 自动生成，供 workspace 内的 AI CLI 读取当前人设与战略设置。",
    "",
    section(
      "人设设置",
      [
        field("我服务谁", state.profile.targetAudience),
        field("我解决什么具体问题", state.profile.coreProblem),
        field("我凭什么可信", state.profile.trustReason),
        field("我让用户得到什么结果", state.profile.expectedResult),
      ].join("\n"),
    ),
    "",
    section(
      "战略设置",
      [
        field("为什么现在做", state.strategy.motivation),
        field("一年目标", state.strategy.annualGoal),
        field("赛道判断", state.strategy.trackWhy),
        field("平台主场", state.strategy.platformChoice),
        field("商业承接", state.strategy.businessModel),
        field("机会边界", state.strategy.opportunityBoundary),
        field("30 天验证假设", state.strategy.nextHypothesis),
      ].join("\n"),
    ),
    "",
    `更新时间：${state.updated_at}`,
    "",
  ].join("\n");
}

async function writeStateFiles(state: PersonaWorkspaceState, root = workspaceRoot()): Promise<void> {
  await fs.mkdir(root, { recursive: true });
  await fs.writeFile(personaJsonPath(root), JSON.stringify(state, null, 2), "utf8");
  await fs.writeFile(personaMarkdownPath(root), renderMarkdown(state), "utf8");
}

export async function ensurePersonaWorkspaceFiles(root = workspaceRoot()): Promise<PersonaWorkspaceState> {
  const state = await readState(root);
  await writeStateFiles(state, root);
  return state;
}

export async function savePersonaWorkspaceState(
  payload: PersonaSavePayload,
  root = workspaceRoot(),
): Promise<PersonaWorkspaceState> {
  const current = await readState(root);
  const next: PersonaWorkspaceState = {
    profile: payload.profile ?? current.profile,
    strategy: payload.strategy ?? current.strategy,
    updated_at: nowIso(),
  };
  await writeStateFiles(next, root);
  return next;
}
