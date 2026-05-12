import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import { app } from "electron";
import log from "electron-log/main";

import {
  contentDiagnosisSchema,
  type ContentDiagnosis,
  type ContentDiagnosisFrame,
  type ContentDiagnosisStatus,
} from "../../../shared/contracts/content-diagnosis";
import type { MaterialEntry } from "../../../shared/contracts/library";

function rootDir(): string {
  return path.join(app.getPath("userData"), "content-diagnosis");
}

function itemDir(id: string): string {
  return path.join(rootDir(), id);
}

export function contentDiagnosisDataRoot(id: string): string {
  return itemDir(id);
}

function metaPath(id: string): string {
  return path.join(itemDir(id), "meta.json");
}

export function contentDiagnosisFramesDir(id: string): string {
  return path.join(itemDir(id), "frames");
}

export function contentDiagnosisTranscriptPath(id: string): string {
  return path.join(itemDir(id), "transcript.txt");
}

export function contentDiagnosisReportPath(id: string): string {
  return path.join(itemDir(id), "diagnosis.md");
}

export function contentDiagnosisReportDraftPath(id: string): string {
  return path.join(itemDir(id), "diagnosis.generated.md");
}

async function atomicWrite(filePath: string, content: string): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, content, "utf8");
  await fs.rename(tmp, filePath);
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
  try {
    return parse(JSON.parse(raw));
  } catch (err) {
    log.warn(
      `content-diagnosis store: invalid JSON ${filePath}: ${err instanceof Error ? err.message : String(err)}`,
    );
    return null;
  }
}

function parseItem(raw: unknown): ContentDiagnosis | null {
  const parsed = contentDiagnosisSchema.safeParse(raw);
  if (!parsed.success) {
    log.warn(`content-diagnosis store: meta.json failed parse: ${parsed.error.issues[0]?.message}`);
    return null;
  }
  return parsed.data;
}

async function listIds(): Promise<string[]> {
  try {
    const entries = await fs.readdir(rootDir(), { withFileTypes: true });
    return entries.filter((e) => e.isDirectory()).map((e) => e.name);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw err;
  }
}

async function attachReportMetadata(item: ContentDiagnosis): Promise<ContentDiagnosis> {
  if (item.analysis_generated_at !== null) return item;
  try {
    const stat = await fs.stat(contentDiagnosisReportPath(item.id));
    return { ...item, analysis_generated_at: stat.mtime.toISOString(), status: "report_ready" };
  } catch {
    return item;
  }
}

export async function listContentDiagnoses(): Promise<ContentDiagnosis[]> {
  const ids = await listIds();
  const out: ContentDiagnosis[] = [];
  for (const id of ids) {
    const item = await readJsonIfExists(metaPath(id), parseItem);
    if (item !== null) out.push(await attachReportMetadata(item));
  }
  out.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return out;
}

export async function getContentDiagnosis(id: string): Promise<ContentDiagnosis | null> {
  const item = await readJsonIfExists(metaPath(id), parseItem);
  return item === null ? null : attachReportMetadata(item);
}

export async function findContentDiagnosisByPostId(postId: string): Promise<ContentDiagnosis | null> {
  const items = await listContentDiagnoses();
  return items.find((item) => item.post_id === postId) ?? null;
}

export async function createContentDiagnosisFromEntry(input: {
  shareUrl: string;
  entry: MaterialEntry;
  nowIso: string;
}): Promise<ContentDiagnosis> {
  const existing = await findContentDiagnosisByPostId(input.entry.post_id);
  if (existing !== null) return existing;

  const item = contentDiagnosisSchema.parse({
    id: randomUUID(),
    platform: input.entry.platform,
    share_url: input.shareUrl,
    canonical_url: input.entry.share_url,
    post_id: input.entry.post_id,
    title: input.entry.caption.length > 0 ? input.entry.caption.slice(0, 80) : null,
    caption: input.entry.caption,
    author_handle: input.entry.author_handle,
    author_display_name: input.entry.author_display_name,
    like_count: input.entry.like_count,
    comment_count: input.entry.comment_count,
    share_count: input.entry.share_count,
    collect_count: input.entry.collect_count,
    author_follower_count: input.entry.author_follower_count,
    status: "captured",
    frames: [],
    transcript: input.entry.transcript,
    transcript_lang: null,
    captured_at: input.entry.captured_at,
    media_analyzed_at: null,
    analysis_generated_at: null,
    last_error: null,
    created_at: input.nowIso,
    updated_at: input.nowIso,
  });
  await atomicWrite(metaPath(item.id), JSON.stringify(item, null, 2));
  return item;
}

export async function updateContentDiagnosis(
  id: string,
  patch: Partial<{
    status: ContentDiagnosisStatus;
    frames: ContentDiagnosisFrame[];
    transcript: string | null;
    transcript_lang: string | null;
    media_analyzed_at: string | null;
    analysis_generated_at: string | null;
    last_error: string | null;
    updated_at: string;
  }>,
): Promise<ContentDiagnosis | null> {
  const current = await getContentDiagnosis(id);
  if (current === null) return null;
  const next = contentDiagnosisSchema.parse({
    ...current,
    ...patch,
    updated_at: patch.updated_at ?? new Date().toISOString(),
  });
  await atomicWrite(metaPath(id), JSON.stringify(next, null, 2));
  if ("transcript" in patch && patch.transcript !== null && patch.transcript !== undefined) {
    await atomicWrite(contentDiagnosisTranscriptPath(id), patch.transcript);
  }
  return next;
}

export async function writeContentDiagnosisMarkdown(
  id: string,
  markdown: string,
): Promise<void> {
  await atomicWrite(contentDiagnosisReportPath(id), markdown);
}

export async function deleteContentDiagnosis(id: string): Promise<boolean> {
  const dir = itemDir(id);
  try {
    await fs.access(dir);
  } catch {
    return false;
  }
  await fs.rm(dir, { recursive: true, force: true });
  return true;
}

export async function writeContentDiagnosisReadme(input: {
  id: string;
  guideRoot: string;
}): Promise<void> {
  const content = [
    "# 内容诊断输入说明",
    "",
    "- `meta.json`：素材基础信息。",
    "- `transcript.txt`：视频文案转写。",
    "- `frames/`：封面和过程画面素材。",
    `- 实战文档目录：${input.guideRoot}`,
    "",
  ].join("\n");
  await atomicWrite(path.join(itemDir(input.id), "README.input.md"), content);
}
