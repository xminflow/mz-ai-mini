// Resolve a downloadable mp4 URL for a Douyin video page URL.
//
// Algorithm ported from agent-mesh's fetchVideoDownloadUrl in
// app/src/main/douyinCollectorManager.ts (no signatures or cookies needed —
// the iesdouyin.com share endpoint will return a JSON blob embedded in HTML
// when the request carries an iPhone Safari User-Agent).

const MOBILE_USER_AGENT =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) EdgiOS/121.0.2277.107 Version/17.0 Mobile/15E148 Safari/604.1";

const FETCH_TIMEOUT_MS = 8000;

const VIDEO_ID_PATTERNS: RegExp[] = [
  /(?:video|note)\/(\d{18,20})/,
  /modal_id=(\d{18,20})/,
  /(\d{18,20})/,
];

export function extractDouyinVideoId(url: string): string | null {
  if (typeof url !== "string" || url.length === 0) return null;
  for (const re of VIDEO_ID_PATTERNS) {
    const m = url.match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

interface RouterDataShape {
  loaderData?: {
    "video_(id)/page"?: {
      videoInfoRes?: {
        item_list?: Array<{
          video?: { play_addr?: { url_list?: string[] } };
        }>;
      };
    };
  };
}

export async function resolveDouyinVideoDownloadUrl(
  pageUrl: string,
): Promise<string | null> {
  if (typeof pageUrl !== "string" || pageUrl.length === 0) return null;

  const headers: Record<string, string> = { "User-Agent": MOBILE_USER_AGENT };

  let videoId = extractDouyinVideoId(pageUrl);
  if (!videoId) {
    // Short-link unwrap: v.douyin.com/xxx/ redirects to the canonical URL,
    // which carries the 18–20 digit ID.
    try {
      const probe = await fetch(pageUrl, {
        headers,
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      videoId = extractDouyinVideoId(probe.url ?? "");
    } catch {
      return null;
    }
  }
  if (!videoId) return null;

  const shareUrl = `https://www.iesdouyin.com/share/video/${videoId}`;
  let html: string;
  try {
    const response = await fetch(shareUrl, {
      headers,
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });
    if (!response.ok) return null;
    html = await response.text();
  } catch {
    return null;
  }

  const match = html.match(/window\._ROUTER_DATA\s*=\s*(.*?)<\/script>/s);
  if (!match || !match[1]) return null;

  let jsonText = match[1].trim();
  if (jsonText.endsWith(";")) jsonText = jsonText.slice(0, -1);

  let data: RouterDataShape;
  try {
    data = JSON.parse(jsonText) as RouterDataShape;
  } catch {
    return null;
  }

  const item = data.loaderData?.["video_(id)/page"]?.videoInfoRes?.item_list?.[0];
  const playUrl = item?.video?.play_addr?.url_list?.[0];
  if (!playUrl) return null;

  return playUrl.replace("playwm", "play");
}
