// Resolve a downloadable mp4 URL for a Xiaohongshu video note page URL.
//
// The video extraction mirrors the stable field order used by
// XHS-Downloader: prefer `video.consumer.originVideoKey`, otherwise pick the
// highest-resolution item from `video.media.stream.h264/h265` and return its
// first backup URL or master URL.

const MOBILE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/121.0.2277.107 Version/17.0 Mobile/15E148 Safari/604.1";

const FETCH_TIMEOUT_MS = 10_000;
const NOTE_ID_PATTERNS: RegExp[] = [
  /xiaohongshu\.com\/(?:explore|search_result)\/([0-9A-Za-z]{8,32})/i,
  /xiaohongshu\.com\/discovery\/item\/([0-9A-Za-z]{8,32})/i,
  /(?:^|[?&])note_id=([0-9A-Za-z]{8,32})(?:&|$)/i,
];

interface XhsVideoItem {
  height?: number;
  videoBitrate?: number;
  size?: number;
  masterUrl?: string;
  backupUrls?: string[];
}

interface XhsNoteShape {
  video?: {
    consumer?: {
      originVideoKey?: string;
    };
    media?: {
      stream?: {
        h264?: XhsVideoItem[];
        h265?: XhsVideoItem[];
      };
    };
  };
}

export function extractXhsNoteId(url: string): string | null {
  if (typeof url !== "string" || url.length === 0) return null;
  for (const re of NOTE_ID_PATTERNS) {
    const m = url.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

export function extractXhsInitialState(html: string): unknown {
  const match = html.match(
    /window\.__INITIAL_STATE__\s*=\s*({[\s\S]*?})\s*<\/script>/,
  );
  if (!match || !match[1]) return null;

  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

export function extractXhsNoteData(initialState: unknown): XhsNoteShape | null {
  if (!isRecord(initialState)) return null;

  const mobileNote = deepGet(initialState, ["noteData", "data", "noteData"]);
  if (isRecord(mobileNote)) return mobileNote as XhsNoteShape;

  const detailMap = deepGet(initialState, ["note", "noteDetailMap"]);
  if (isRecord(detailMap)) {
    for (const value of Object.values(detailMap)) {
      const note = isRecord(value) ? value.note : undefined;
      if (isRecord(note)) return note as XhsNoteShape;
    }
  }

  return null;
}

export function extractXhsVideoDownloadUrlFromNote(note: XhsNoteShape): string | null {
  const originVideoKey = note.video?.consumer?.originVideoKey;
  if (typeof originVideoKey === "string" && originVideoKey.length > 0) {
    if (originVideoKey.startsWith("http://") || originVideoKey.startsWith("https://")) {
      return decodeEscapedUrl(originVideoKey);
    }
    return decodeEscapedUrl(`https://sns-video-bd.xhscdn.com/${originVideoKey}`);
  }

  const h264 = note.video?.media?.stream?.h264 ?? [];
  const h265 = note.video?.media?.stream?.h265 ?? [];
  const items = [...h264, ...h265].filter(isVideoItem);
  if (items.length === 0) return null;

  items.sort((a, b) => scoreVideoItem(a) - scoreVideoItem(b));
  const best = items[items.length - 1];
  const backup = best?.backupUrls?.find((u) => typeof u === "string" && u.length > 0);
  const url = backup ?? best?.masterUrl ?? null;
  return url === null ? null : decodeEscapedUrl(url);
}

export async function resolveXhsVideoDownloadUrl(pageUrl: string): Promise<string | null> {
  if (typeof pageUrl !== "string" || pageUrl.length === 0) return null;

  let targetUrl = pageUrl;
  let noteId = extractXhsNoteId(targetUrl);
  try {
    const response = await fetch(targetUrl, {
      headers: { "User-Agent": MOBILE_USER_AGENT },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    targetUrl = response.url || targetUrl;
    noteId = noteId ?? extractXhsNoteId(targetUrl);
    const html = await response.text();
    const direct = extractXhsVideoDownloadUrlFromHtml(html);
    if (direct !== null) return direct;
  } catch {
    return null;
  }

  if (noteId === null) return null;
  const canonical = `https://www.xiaohongshu.com/explore/${noteId}`;
  if (canonical === targetUrl) return null;

  try {
    const response = await fetch(canonical, {
      headers: { "User-Agent": MOBILE_USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    return extractXhsVideoDownloadUrlFromHtml(await response.text());
  } catch {
    return null;
  }
}

function extractXhsVideoDownloadUrlFromHtml(html: string): string | null {
  const state = extractXhsInitialState(html);
  const note = extractXhsNoteData(state);
  if (note !== null) {
    const fromState = extractXhsVideoDownloadUrlFromNote(note);
    if (fromState !== null) return fromState;
  }

  const originKey = html.match(/"originVideoKey"\s*:\s*"([^"]+)"/)?.[1];
  if (originKey && originKey.length > 0) {
    return decodeEscapedUrl(`https://sns-video-bd.xhscdn.com/${originKey}`);
  }

  const masterUrl = html.match(/"masterUrl"\s*:\s*"([^"]+)"/)?.[1];
  return masterUrl ? decodeEscapedUrl(masterUrl) : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function deepGet(root: unknown, keys: string[]): unknown {
  let cur = root;
  for (const key of keys) {
    if (!isRecord(cur)) return undefined;
    cur = cur[key];
  }
  return cur;
}

function isVideoItem(value: unknown): value is XhsVideoItem {
  if (!isRecord(value)) return false;
  const masterUrl = value.masterUrl;
  const backupUrls = value.backupUrls;
  return (
    typeof masterUrl === "string" ||
    (Array.isArray(backupUrls) && backupUrls.some((u) => typeof u === "string"))
  );
}

function scoreVideoItem(item: XhsVideoItem): number {
  const height = typeof item.height === "number" ? item.height : 0;
  const bitrate = typeof item.videoBitrate === "number" ? item.videoBitrate : 0;
  const size = typeof item.size === "number" ? item.size : 0;
  return height * 1_000_000_000 + bitrate * 1_000 + size;
}

function decodeEscapedUrl(url: string): string {
  return url
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&");
}
