import { ipcMain } from "electron";
import log from "electron-log/main";

import { SCHEMA_VERSION, type ErrorCode } from "../../shared/contracts/error";
import {
  trackAnalysisGetReportRequestSchema,
  trackAnalysisGetReportSuccessSchema,
  trackAnalysisListRequestSchema,
  trackAnalysisListSuccessSchema,
  trackAnalysisStoryTypeSchema,
  type TrackAnalysisGetReportResult,
  type TrackAnalysisListResult,
  type TrackAnalysisStory,
  type TrackAnalysisStoryDetail,
} from "../../shared/contracts/track-analysis";

const CHANNEL_LIST = "track-analysis:list";
const CHANNEL_GET_REPORT = "track-analysis:get-report";
const API_BASE_URL = "https://api.weelume.com/api/v1";
const FETCH_TIMEOUT_MS = 15_000;
const UPSTREAM_SUCCESS_CODE = "COMMON.SUCCESS";

interface UpstreamEnvelope<T> {
  code?: unknown;
  message?: unknown;
  data?: T;
}

interface UpstreamStory {
  case_id?: unknown;
  _id?: unknown;
  type?: unknown;
  title?: unknown;
  summary?: unknown;
  summary_markdown?: unknown;
  industry?: unknown;
  cover_image_url?: unknown;
  coverImageUrl?: unknown;
  tags?: unknown;
  readTime?: unknown;
  published_at?: unknown;
  publishedAt?: unknown;
  documents?: unknown;
}

interface UpstreamDocument {
  title?: unknown;
  markdown_content?: unknown;
}

interface UpstreamListData {
  items?: unknown;
  next_cursor?: unknown;
  available_industries?: unknown;
}

function failure(
  message: string,
  code: ErrorCode = "TRACK_ANALYSIS_FETCH_FAILED",
) {
  return {
    schema_version: SCHEMA_VERSION,
    ok: false as const,
    error: {
      code,
      message: message.length > 1024 ? `${message.slice(0, 1021)}...` : message,
    },
  };
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function asId(raw: UpstreamStory): string {
  const caseId = raw.case_id;
  if (typeof caseId === "string" || typeof caseId === "number") return String(caseId);
  return asString(raw._id);
}

function asStoryType(value: unknown): "case" | "project" {
  const parsed = trackAnalysisStoryTypeSchema.safeParse(value);
  return parsed.success ? parsed.data : "case";
}

function asTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const tags: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") continue;
    const tag = item.trim();
    if (tag.length === 0 || tags.includes(tag)) continue;
    tags.push(tag);
    if (tags.length >= 8) break;
  }
  return tags;
}

function resolveCoverImage(raw: UpstreamStory): string {
  const candidate = asString(raw.cover_image_url) || asString(raw.coverImageUrl);
  if (!candidate || candidate.startsWith("cloud://")) return "";
  try {
    const url = candidate.startsWith("//") ? `https:${candidate}` : candidate;
    const parsed = new URL(url);
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString();
  } catch {
    return "";
  }
  return "";
}

function formatReadTime(value: unknown): string {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return "";
  return `${Math.max(1, Math.round(value))} 分钟阅读`;
}

function formatPublishedAt(raw: UpstreamStory): string {
  const value = asString(raw.published_at) || asString(raw.publishedAt);
  if (!value) return "";
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(timestamp));
}

export function normalizeTrackAnalysisStory(raw: UpstreamStory): TrackAnalysisStory | null {
  const id = asId(raw);
  const title = asString(raw.title);
  if (!id || !title) return null;
  return {
    id,
    type: asStoryType(raw.type),
    title,
    summary: asString(raw.summary),
    industry: asString(raw.industry),
    cover_image_url: resolveCoverImage(raw),
    tags: asTags(raw.tags),
    read_time_text: formatReadTime(raw.readTime),
    published_at_text: formatPublishedAt(raw),
  };
}

export function normalizeTrackAnalysisStoryDetail(
  raw: UpstreamStory,
): TrackAnalysisStoryDetail | null {
  const story = normalizeTrackAnalysisStory(raw);
  if (story === null) return null;
  return {
    ...story,
    summary_markdown: typeof raw.summary_markdown === "string" ? raw.summary_markdown : "",
    documents: normalizeDocuments(raw.documents),
  };
}

function normalizeDocument(value: unknown): { title: string; markdown_content: string } | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as UpstreamDocument;
  return {
    title: asString(raw.title),
    markdown_content: typeof raw.markdown_content === "string" ? raw.markdown_content : "",
  };
}

function normalizeDocuments(value: unknown): TrackAnalysisStoryDetail["documents"] {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    business_case: normalizeDocument(raw["business_case"]),
    market_research: normalizeDocument(raw["market_research"]),
    business_model: normalizeDocument(raw["business_model"]),
    ai_business_upgrade: normalizeDocument(raw["ai_business_upgrade"]),
    how_to_do: normalizeDocument(raw["how_to_do"]),
  };
}

function normalizeIndustries(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const industries: string[] = [];
  for (const item of value) {
    const industry = asString(item);
    if (!industry || industries.includes(industry)) continue;
    industries.push(industry);
  }
  return industries;
}

async function fetchJson<T>(path: string, query?: URLSearchParams): Promise<T> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) {
    for (const [key, value] of query.entries()) {
      if (value !== "") url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });

  if (!response.ok) {
    let bodyPreview = "";
    try {
      bodyPreview = (await response.text()).slice(0, 500);
    } catch {
      bodyPreview = "";
    }
    const suffix = bodyPreview ? `: ${bodyPreview}` : "";
    throw new Error(`upstream HTTP ${response.status} ${response.statusText} for ${url.toString()}${suffix}`);
  }

  const envelope = (await response.json()) as UpstreamEnvelope<T>;
  if (envelope.code !== UPSTREAM_SUCCESS_CODE && envelope.code !== 0) {
    const message = typeof envelope.message === "string" ? envelope.message : "upstream returned non-success code";
    throw new Error(message);
  }
  if (envelope.data === undefined) {
    throw new Error("upstream response missing data");
  }
  return envelope.data;
}

async function listReports(rawArgs: unknown): Promise<TrackAnalysisListResult> {
  const parsedArgs = trackAnalysisListRequestSchema.safeParse(rawArgs ?? {});
  if (!parsedArgs.success) {
    return failure(`invalid request: ${parsedArgs.error.message}`, "INVALID_INPUT");
  }

  const query = new URLSearchParams();
  query.set("limit", String(parsedArgs.data.limit ?? 50));
  query.set("cursor", parsedArgs.data.cursor ?? "");
  query.set("industry", parsedArgs.data.industry ?? "");
  query.set("keyword", parsedArgs.data.keyword ?? "");

  try {
    const data = await fetchJson<UpstreamListData>("/business-cases", query);
    const rawItems = Array.isArray(data.items) ? data.items : [];
    const items = rawItems
      .map((item) =>
        item && typeof item === "object"
          ? normalizeTrackAnalysisStory(item as UpstreamStory)
          : null,
      )
      .filter((item): item is TrackAnalysisStory => item !== null);
    return trackAnalysisListSuccessSchema.parse({
      schema_version: SCHEMA_VERSION,
      ok: true,
      items,
      next_cursor: asString(data.next_cursor),
      available_industries: normalizeIndustries(data.available_industries),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return failure(message);
  }
}

async function getReport(rawArgs: unknown): Promise<TrackAnalysisGetReportResult> {
  const parsedArgs = trackAnalysisGetReportRequestSchema.safeParse(rawArgs);
  if (!parsedArgs.success) {
    return failure(`invalid request: ${parsedArgs.error.message}`, "INVALID_INPUT");
  }

  try {
    const data = await fetchJson<UpstreamStory>(
      `/business-cases/${encodeURIComponent(parsedArgs.data.id)}`,
    );
    const item = normalizeTrackAnalysisStoryDetail(data);
    if (item === null) return failure("upstream report detail is invalid");
    return trackAnalysisGetReportSuccessSchema.parse({
      schema_version: SCHEMA_VERSION,
      ok: true,
      item,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return failure(message);
  }
}

export function registerTrackAnalysisHandlers(): void {
  ipcMain.handle(CHANNEL_LIST, async (_event, rawArgs: unknown) => {
    const start = Date.now();
    const result = await listReports(rawArgs);
    log.info(`${CHANNEL_LIST} invoked -> exit ${result.ok ? 0 : 1} (${Date.now() - start} ms)`);
    return result;
  });

  ipcMain.handle(CHANNEL_GET_REPORT, async (_event, rawArgs: unknown) => {
    const start = Date.now();
    const result = await getReport(rawArgs);
    log.info(
      `${CHANNEL_GET_REPORT} invoked -> exit ${result.ok ? 0 : 1} (${Date.now() - start} ms)`,
    );
    return result;
  });
}

export function unregisterTrackAnalysisHandlers(): void {
  ipcMain.removeHandler(CHANNEL_LIST);
  ipcMain.removeHandler(CHANNEL_GET_REPORT);
}
