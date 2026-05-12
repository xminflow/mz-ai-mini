import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { app } from "electron";
import log from "electron-log/main";

import {
  bloggerSchema,
  bloggerVideoSampleSchema,
  type Blogger,
  type BloggerStatus,
  type BloggerVideoSample,
} from "../../../shared/contracts/blogger";

import { awemeIdFromUrl } from "./extract-frames";

/**
 * Filesystem-backed blogger store.
 *
 * Layout under `app.getPath('userData')/blogger-frames/`:
 *
 *   <bloggerId>/
 *     profile.json         — full Blogger row (zod-validated)
 *     <awemeId>/
 *       meta.json          — BloggerVideoSample (sample + analysis fields)
 *       transcript.txt     — analysis transcript text (also mirrored in meta.json)
 *       1.jpg .. 4.jpg     — extracted frames (cover + 3 quarter-points)
 *
 * Reads scan + parse JSON; writes use `<file>.tmp` + rename for atomicity.
 * No SQLite; meant to replace the `bloggers` and `blogger_video_samples`
 * tables for the 博主分析 feature.
 */

function rootDir(): string {
  return path.join(app.getPath("userData"), "blogger-frames");
}

function bloggerDir(id: string): string {
  return path.join(rootDir(), id);
}

export function bloggerDataRoot(id: string): string {
  return bloggerDir(id);
}

function profilePath(id: string): string {
  return path.join(bloggerDir(id), "profile.json");
}

export function bloggerAnalysisPath(id: string): string {
  return path.join(bloggerDir(id), "analysis.md");
}

export function bloggerAnalysisDraftPath(id: string): string {
  return path.join(bloggerDir(id), "analysis.generated.md");
}

export async function writeBloggerAnalysisMarkdown(
  id: string,
  markdown: string,
): Promise<void> {
  await atomicWrite(bloggerAnalysisPath(id), markdown);
}

function videoDir(id: string, video_url: string): string {
  return path.join(bloggerDir(id), awemeIdFromUrl(video_url));
}

function metaPath(id: string, video_url: string): string {
  return path.join(videoDir(id, video_url), "meta.json");
}

function transcriptPath(id: string, video_url: string): string {
  return path.join(videoDir(id, video_url), "transcript.txt");
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, content, "utf8");
  await fs.rename(tmp, filePath);
}

async function deleteIfExists(filePath: string): Promise<void> {
  try {
    await fs.rm(filePath, { force: true });
  } catch (err) {
    log.warn(
      `store-fs: failed to remove ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

async function deleteBloggerAnalysisArtifacts(id: string): Promise<void> {
  await Promise.all([
    deleteIfExists(bloggerAnalysisPath(id)),
    deleteIfExists(bloggerAnalysisDraftPath(id)),
  ]);
}

async function readJsonIfExists<T>(
  filePath: string,
  parse: (raw: unknown) => T | null,
): Promise<T | null> {
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch (err) {
    log.warn(`store-fs: ${filePath} contains invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
  return parse(json);
}

function parseBlogger(raw: unknown): Blogger | null {
  if (!raw || typeof raw !== "object") return null;
  const normalized = {
    analysis_generated_at: null,
    analysis_error: null,
    ...(raw as Record<string, unknown>),
  };
  const parsed = bloggerSchema.safeParse(normalized);
  if (!parsed.success) {
    log.warn(`store-fs: profile.json failed Zod parse: ${parsed.error.issues[0]?.message}`);
    return null;
  }
  return parsed.data;
}

function parseSample(raw: unknown): BloggerVideoSample | null {
  const parsed = bloggerVideoSampleSchema.safeParse(raw);
  if (!parsed.success) {
    log.warn(`store-fs: meta.json failed Zod parse: ${parsed.error.issues[0]?.message}`);
    return null;
  }
  return parsed.data;
}

async function listBloggerIds(): Promise<string[]> {
  try {
    const entries = await fs.readdir(rootDir(), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function attachReportMetadata(blogger: Blogger): Promise<Blogger> {
  if (blogger.analysis_generated_at !== null) return blogger;
  try {
    const stat = await fs.stat(bloggerAnalysisPath(blogger.id));
    return {
      ...blogger,
      analysis_generated_at: stat.mtime.toISOString(),
    };
  } catch {
    return blogger;
  }
}

// ─── Bloggers ─────────────────────────────────────────────────────────────

export async function listBloggers(): Promise<Blogger[]> {
  const ids = await listBloggerIds();
  const out: Blogger[] = [];
  for (const id of ids) {
    const b = await readJsonIfExists(profilePath(id), parseBlogger);
    if (b !== null) out.push(await attachReportMetadata(b));
  }
  // Latest first — same ordering as the SQLite version (`ORDER BY created_at DESC`).
  out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return out;
}

export async function getBlogger(id: string): Promise<Blogger | null> {
  const blogger = await readJsonIfExists(profilePath(id), parseBlogger);
  if (blogger === null) return null;
  return attachReportMetadata(blogger);
}

async function findBloggerByUrl(
  platform: Blogger["platform"],
  profile_url: string,
): Promise<Blogger | null> {
  const ids = await listBloggerIds();
  for (const id of ids) {
    const b = await readJsonIfExists(profilePath(id), parseBlogger);
    if (b !== null && b.platform === platform && b.profile_url === profile_url) {
      return b;
    }
  }
  return null;
}

/**
 * Insert-or-return-existing on (platform, profile_url). The caller is
 * responsible for canonicalising the URL before this call.
 */
export async function upsertBlogger(input: {
  platform: Blogger["platform"];
  profile_url: string;
  sec_uid: string | null;
  nowIso: string;
}): Promise<Blogger> {
  const existing = await findBloggerByUrl(input.platform, input.profile_url);
  if (existing !== null) return existing;

  const id = randomUUID();
  const blogger: Blogger = {
    id,
    platform: input.platform,
    profile_url: input.profile_url,
    sec_uid: input.sec_uid,
    douyin_id: null,
    display_name: null,
    avatar_url: null,
    follow_count: null,
    fans_count: null,
    liked_count: null,
    signature: null,
    status: "pending",
    last_error: null,
    profile_captured_at: null,
    sampled_at: null,
    total_works_at_sample: null,
    analysis_generated_at: null,
    analysis_error: null,
    created_at: input.nowIso,
    updated_at: input.nowIso,
  };
  // Validate before persisting; fail loudly if our own object doesn't pass.
  const parsed = bloggerSchema.parse(blogger);
  await atomicWrite(profilePath(id), JSON.stringify(parsed, null, 2));
  return parsed;
}

async function updateBloggerInPlace(
  id: string,
  patch: (b: Blogger) => Blogger,
): Promise<Blogger | null> {
  const current = await getBlogger(id);
  if (current === null) return null;
  const next = bloggerSchema.parse(patch(current));
  await atomicWrite(profilePath(id), JSON.stringify(next, null, 2));
  return next;
}

/**
 * Apply a successful profile capture. Sets status='profile_ready', stamps
 * profile_captured_at + updated_at, clears last_error.
 */
export async function updateBloggerProfile(
  id: string,
  fields: {
    douyin_id: string | null;
    display_name: string | null;
    avatar_url: string | null;
    follow_count: number | null;
    fans_count: number | null;
    liked_count: number | null;
    signature: string | null;
    sec_uid: string | null;
  },
  nowIso: string,
): Promise<void> {
  await updateBloggerInPlace(id, (b) => ({
    ...b,
    douyin_id: fields.douyin_id,
    display_name: fields.display_name,
    avatar_url: fields.avatar_url,
    follow_count: fields.follow_count,
    fans_count: fields.fans_count,
    liked_count: fields.liked_count,
    signature: fields.signature,
    // Coalesce — only overwrite sec_uid when capture supplied a non-null value.
    sec_uid: fields.sec_uid ?? b.sec_uid,
    status: "profile_ready",
    last_error: null,
    profile_captured_at: nowIso,
    analysis_generated_at: null,
    analysis_error: null,
    updated_at: nowIso,
  }));
}

export async function updateBloggerStatus(
  id: string,
  status: BloggerStatus,
  last_error: string | null,
  nowIso: string,
): Promise<void> {
  await updateBloggerInPlace(id, (b) => ({
    ...b,
    status,
    last_error,
    updated_at: nowIso,
  }));
}

export async function updateBloggerReportState(
  id: string,
  fields: {
    analysis_generated_at?: string | null;
    analysis_error?: string | null;
    updated_at: string;
  },
): Promise<void> {
  await updateBloggerInPlace(id, (b) => ({
    ...b,
    analysis_generated_at:
      "analysis_generated_at" in fields
        ? fields.analysis_generated_at ?? null
        : b.analysis_generated_at,
    analysis_error:
      "analysis_error" in fields ? fields.analysis_error ?? null : b.analysis_error,
    updated_at: fields.updated_at,
  }));
}

async function clearBloggerReportState(id: string, nowIso: string): Promise<void> {
  await deleteBloggerAnalysisArtifacts(id);
  await updateBloggerInPlace(id, (b) => ({
    ...b,
    analysis_generated_at: null,
    analysis_error: null,
    updated_at: nowIso,
  }));
}

export async function deleteBlogger(id: string): Promise<boolean> {
  const dir = bloggerDir(id);
  try {
    await fs.access(dir);
  } catch {
    return false;
  }
  await fs.rm(dir, { recursive: true, force: true });
  return true;
}

// ─── Samples ──────────────────────────────────────────────────────────────

export async function listBloggerSamples(id: string): Promise<BloggerVideoSample[]> {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(bloggerDir(id), { withFileTypes: true });
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
  const samples: BloggerVideoSample[] = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const meta = await readJsonIfExists(
      path.join(bloggerDir(id), e.name, "meta.json"),
      parseSample,
    );
    if (meta !== null) samples.push(meta);
  }
  samples.sort((a, b) => a.position - b.position);
  return samples;
}

/**
 * Replace the entire sample set for a blogger. Preserves `transcript`,
 * `transcript_lang`, `frames`, `analyzed_at`, `analyze_error` for any
 * `video_url` that exists in both old and new sets — clicking 「重新采样」
 * keeps the analysis we already computed.
 *
 * Sample dirs that vanish in the new set are removed (and so are their frames
 * + transcripts), since their meta.json is the only handle the rest of the
 * code uses.
 */
export async function replaceBloggerSamples(
  blogger_id: string,
  samples: BloggerVideoSample[],
  totalWorks: number,
  nowIso: string,
): Promise<void> {
  const prior = await listBloggerSamples(blogger_id);
  const priorByUrl = new Map(prior.map((s) => [s.video_url, s] as const));
  const newUrls = new Set(samples.map((s) => s.video_url));

  // 1) Drop directories whose video_url is gone.
  for (const old of prior) {
    if (newUrls.has(old.video_url)) continue;
    const dir = videoDir(blogger_id, old.video_url);
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (err) {
      log.warn(
        `store-fs: failed to remove stale sample dir ${dir}: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  // 2) Write each new meta.json — carry forward analysis when the URL was already known.
  for (const s of samples) {
    const carry = priorByUrl.get(s.video_url);
    const merged: BloggerVideoSample = {
      ...s,
      transcript: carry?.transcript ?? null,
      transcript_lang: carry?.transcript_lang ?? null,
      frames: carry?.frames ?? [],
      analyzed_at: carry?.analyzed_at ?? null,
      analyze_error: carry?.analyze_error ?? null,
    };
    const validated = bloggerVideoSampleSchema.parse(merged);
    await atomicWrite(metaPath(blogger_id, s.video_url), JSON.stringify(validated, null, 2));
  }

  await deleteBloggerAnalysisArtifacts(blogger_id);

  // 3) Update the blogger row: status='sampled', sampled_at, total_works_at_sample.
  await updateBloggerInPlace(blogger_id, (b) => ({
    ...b,
    status: "sampled",
    last_error: null,
    sampled_at: nowIso,
    total_works_at_sample: totalWorks,
    analysis_generated_at: null,
    analysis_error: null,
    updated_at: nowIso,
  }));
}

/**
 * Append new samples while keeping existing ones intact. Existing sample
 * analysis is preserved; duplicate `video_url`s are skipped.
 */
export async function appendBloggerSamples(
  blogger_id: string,
  samples: BloggerVideoSample[],
  totalWorks: number,
  nowIso: string,
): Promise<void> {
  const prior = await listBloggerSamples(blogger_id);
  const priorByUrl = new Map(prior.map((s) => [s.video_url, s] as const));
  const next: BloggerVideoSample[] = [...prior];
  let nextPosition = prior.reduce((max, sample) => Math.max(max, sample.position), -1) + 1;

  for (const s of samples) {
    if (priorByUrl.has(s.video_url)) continue;
    const validated = bloggerVideoSampleSchema.parse({
      ...s,
      position: nextPosition,
      transcript: null,
      transcript_lang: null,
      frames: [],
      analyzed_at: null,
      analyze_error: null,
    });
    next.push(validated);
    nextPosition += 1;
  }

  next.sort((a, b) => a.position - b.position);
  for (const sample of next) {
    const validated = bloggerVideoSampleSchema.parse(sample);
    await atomicWrite(metaPath(blogger_id, sample.video_url), JSON.stringify(validated, null, 2));
  }

  await deleteBloggerAnalysisArtifacts(blogger_id);

  await updateBloggerInPlace(blogger_id, (b) => ({
    ...b,
    status: "sampled",
    last_error: null,
    sampled_at: nowIso,
    total_works_at_sample: totalWorks,
    analysis_generated_at: null,
    analysis_error: null,
    updated_at: nowIso,
  }));
}

/**
 * Patch the analysis-related fields on a single sample. No-op if the sample
 * directory does not exist (caller should not be calling for a non-sample).
 */
export async function updateBloggerSampleAnalysis(
  blogger_id: string,
  video_url: string,
  fields: {
    transcript?: string | null;
    transcript_lang?: string | null;
    frames?: string[];
    analyzed_at?: string | null;
    analyze_error?: string | null;
  },
): Promise<void> {
  const file = metaPath(blogger_id, video_url);
  const current = await readJsonIfExists(file, parseSample);
  if (current === null) {
    log.warn(`store-fs: meta.json missing for ${blogger_id}/${video_url}; skipping analysis update`);
    return;
  }
  const next: BloggerVideoSample = {
    ...current,
    ...("transcript" in fields ? { transcript: fields.transcript ?? null } : {}),
    ...("transcript_lang" in fields ? { transcript_lang: fields.transcript_lang ?? null } : {}),
    ...("frames" in fields ? { frames: fields.frames ?? [] } : {}),
    ...("analyzed_at" in fields ? { analyzed_at: fields.analyzed_at ?? null } : {}),
    ...("analyze_error" in fields ? { analyze_error: fields.analyze_error ?? null } : {}),
  };
  const validated = bloggerVideoSampleSchema.parse(next);
  await atomicWrite(file, JSON.stringify(validated, null, 2));
  await clearBloggerReportState(blogger_id, new Date().toISOString());

  // Mirror transcript text to its own file when present, for easy external use.
  if ("transcript" in fields && fields.transcript !== undefined && fields.transcript !== null) {
    await atomicWrite(transcriptPath(blogger_id, video_url), fields.transcript);
  }
}

export async function deleteBloggerSample(
  blogger_id: string,
  video_url: string,
  nowIso: string,
): Promise<{ deleted: boolean; blogger: Blogger | null; remaining_samples: number }> {
  const current = await getBlogger(blogger_id);
  if (current === null) {
    return { deleted: false, blogger: null, remaining_samples: 0 };
  }

  const prior = await listBloggerSamples(blogger_id);
  const target = prior.find((sample) => sample.video_url === video_url) ?? null;
  if (target === null) {
    return { deleted: false, blogger: current, remaining_samples: prior.length };
  }

  await fs.rm(videoDir(blogger_id, video_url), { recursive: true, force: true });

  const remaining = prior.filter((sample) => sample.video_url !== video_url);
  for (let index = 0; index < remaining.length; index += 1) {
    const sample = remaining[index];
    if (sample === undefined || sample.position === index) continue;
    const validated = bloggerVideoSampleSchema.parse({
      ...sample,
      position: index,
    });
    await atomicWrite(metaPath(blogger_id, sample.video_url), JSON.stringify(validated, null, 2));
  }

  await deleteBloggerAnalysisArtifacts(blogger_id);

  const next = await updateBloggerInPlace(blogger_id, (b) => ({
    ...b,
    status: remaining.length > 0 ? "sampled" : "profile_ready",
    last_error: null,
    sampled_at: remaining.length > 0 ? b.sampled_at : null,
    total_works_at_sample: remaining.length > 0 ? b.total_works_at_sample : null,
    analysis_generated_at: null,
    analysis_error: null,
    updated_at: nowIso,
  }));

  return {
    deleted: true,
    blogger: next,
    remaining_samples: remaining.length,
  };
}
