import { ipcMain } from "electron";
import log from "electron-log/main";

import {
  DouyinHotBoardKey,
  DouyinHotItem,
  DouyinHotListRequest,
  DouyinHotListResult,
} from "../../shared/contracts/douyin-hot";
import { SCHEMA_VERSION } from "../../shared/contracts/error";

const CHANNEL = "douyin-hot:list";

const URLS: Record<DouyinHotBoardKey, string> = {
  hot: "https://so-landing.douyin.com/aweme/v1/hot/search/list/?aid=581610&detail_list=1&board_type=0&board_sub_type=&need_board_tab=true&need_covid_tab=false&version_code=32.3.0",
  seeding:
    "https://so-landing.douyin.com/aweme/v1/hot/search/list/?aid=581610&detail_list=1&board_type=2&board_sub_type=seeding&need_board_tab=false&need_covid_tab=false&version_code=32.3.0",
  entertainment:
    "https://so-landing.douyin.com/aweme/v1/hot/search/list/?aid=581610&detail_list=1&board_type=2&board_sub_type=2&need_board_tab=false&need_covid_tab=false&version_code=32.3.0",
  society:
    "https://so-landing.douyin.com/aweme/v1/hot/search/list/?aid=581610&detail_list=1&board_type=2&board_sub_type=4&need_board_tab=false&need_covid_tab=false&version_code=32.3.0",
};

const REQUEST_HEADERS: Record<string, string> = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Referer: "https://so-landing.douyin.com/",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "zh-CN,zh;q=0.9",
};

const FETCH_TIMEOUT_MS = 8000;

function failure(message: string): DouyinHotListResult {
  return {
    schema_version: SCHEMA_VERSION,
    ok: false,
    error: {
      code: "DOUYIN_HOT_FETCH_FAILED",
      message: message.length > 1024 ? `${message.slice(0, 1021)}...` : message,
    },
  };
}

function pickString(source: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const v = source[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return null;
}

function pickUrl(source: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const raw = pickString(source, key);
    if (raw === null) continue;
    try {
      const url = raw.startsWith("//") ? `https:${raw}` : raw;
      const parsed = new URL(url);
      if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.toString();
    } catch {
      continue;
    }
  }
  return null;
}

function pickNumber(source: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    const v = source[key];
    if (typeof v === "number" && Number.isFinite(v) && v >= 0) {
      return Math.trunc(v);
    }
    if (typeof v === "string" && v.trim().length > 0) {
      const parsed = Number(v);
      if (Number.isFinite(parsed) && parsed >= 0) return Math.trunc(parsed);
    }
  }
  return null;
}

function hotDetailUrl(row: Record<string, unknown>, word: string): string {
  const upstreamUrl = pickUrl(
    row,
    "url",
    "link",
    "link_url",
    "schema_url",
    "share_url",
    "jump_url",
    "detail_url",
  );
  if (upstreamUrl !== null) return upstreamUrl;

  const sentenceId = pickString(row, "sentence_id", "sentenceId");
  if (sentenceId !== null) {
    return `https://www.douyin.com/hot/${encodeURIComponent(sentenceId)}`;
  }

  return `https://www.douyin.com/search/${encodeURIComponent(word)}`;
}

// Lenient extraction: upstream schema is provider-controlled and may shift.
// Pull the few fields we need from common paths and ignore the rest.
export function extractItems(payload: unknown): DouyinHotItem[] {
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const data = (root["data"] ?? root) as Record<string, unknown>;
  const candidates: unknown[] = [];
  for (const key of ["word_list", "list", "items", "trending_list"]) {
    const v = data[key];
    if (Array.isArray(v)) candidates.push(...v);
  }
  if (candidates.length === 0) return [];

  const items: DouyinHotItem[] = [];
  candidates.forEach((raw, idx) => {
    if (!raw || typeof raw !== "object") return;
    const row = raw as Record<string, unknown>;
    const word = pickString(row, "word", "title", "name");
    if (!word) return;
    const positionRaw = pickNumber(row, "position", "rank", "order");
    const rank = positionRaw && positionRaw > 0 ? positionRaw : idx + 1;
    const hot_value = pickNumber(row, "hot_value", "hotValue", "score", "heat_score");
    const label = pickString(row, "label", "tag");
    const url = hotDetailUrl(row, word);
    items.push({ rank, word, url, hot_value, label });
  });
  // Stable order by rank, since upstream sometimes returns unsorted detail rows.
  items.sort((a, b) => a.rank - b.rank);
  return items;
}

async function fetchBoard(board: DouyinHotBoardKey): Promise<DouyinHotListResult> {
  const url = URLS[board];
  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: REQUEST_HEADERS,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return failure(`network error: ${msg}`);
  }

  if (!response.ok) {
    return failure(`upstream HTTP ${response.status} ${response.statusText}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return failure(`response was not valid JSON: ${msg}`);
  }

  const items = extractItems(payload);
  if (items.length === 0) {
    return failure("upstream returned no recognizable hot-list items");
  }

  const result: DouyinHotListResult = {
    schema_version: SCHEMA_VERSION,
    ok: true,
    board,
    items,
    fetched_at: new Date().toISOString(),
  };

  const parsed = DouyinHotListResult.safeParse(result);
  if (!parsed.success) {
    return failure(`internal contract validation failed: ${parsed.error.message}`);
  }
  return parsed.data;
}

export function registerDouyinHotHandler(): void {
  ipcMain.handle(CHANNEL, async (_event, rawArgs: unknown) => {
    const start = Date.now();
    const parsedArgs = DouyinHotListRequest.safeParse(rawArgs);
    if (!parsedArgs.success) {
      const result = failure(`invalid request: ${parsedArgs.error.message}`);
      log.warn(`douyin-hot:list invoked → exit 1 (0 ms) board=invalid`);
      return result;
    }
    const { board } = parsedArgs.data;
    const result = await fetchBoard(board);
    const elapsed = Date.now() - start;
    const exitFlag = result.ok ? 0 : 1;
    log.info(`douyin-hot:list invoked → exit ${exitFlag} (${elapsed} ms) board=${board}`);
    return result;
  });
}

export function unregisterDouyinHotHandler(): void {
  ipcMain.removeHandler(CHANNEL);
}
