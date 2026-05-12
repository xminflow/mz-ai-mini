import type { SelfMediaGuideFile } from "@/shared/contracts/self-media-guide";

export interface GuideFileListItem extends SelfMediaGuideFile {
  displayTitle: string;
  numberLabel: string;
}

export interface GuideChapter {
  id: string;
  title: string;
  label: string | null;
  slug: string;
  files: GuideFileListItem[];
}

export function cleanTitle(title: string): string {
  return title
    .replace(/^第[一二三四五六七八九十百千万\d]+[章节篇课讲][：:、\s-]*/, "")
    .replace(/^\d{1,3}[.、\-\s]+/, "")
    .trim();
}

export function chapterMeta(directory: string): { title: string; label: string | null } {
  if (directory.length === 0) return { title: "导读", label: null };
  const leaf = directory.split("/").filter(Boolean).at(-1) ?? directory;
  const match = /^(\d{1,3})[-_、.\s]*(.+)$/.exec(leaf);
  if (match !== null) {
    return {
      label: `第 ${Number(match[1])} 篇`,
      title: cleanTitle(match[2] ?? leaf),
    };
  }
  return { title: cleanTitle(leaf), label: null };
}

export function chapterSlug(directory: string): string {
  if (directory.length === 0) return "intro";
  return directory
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.trim()
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "") || "chapter";
}

export function fileNumberLabel(file: SelfMediaGuideFile): string {
  const name = file.relative_path.split("/").at(-1) ?? file.relative_path;
  const match = /^(\d{1,3})[-_、.\s]/.exec(name);
  if (match === null) return "•";
  return Number(match[1]).toString().padStart(2, "0");
}

export function groupedFiles(files: SelfMediaGuideFile[]): GuideChapter[] {
  const groups = new Map<string, GuideChapter>();
  for (const file of files) {
    const key = file.directory;
    const current = groups.get(key);
    const meta = chapterMeta(key);
    const item: GuideFileListItem = {
      ...file,
      displayTitle: cleanTitle(file.title),
      numberLabel: fileNumberLabel(file),
    };
    if (current === undefined) {
      groups.set(key, {
        id: key || "root",
        title: meta.title,
        label: meta.label,
        slug: chapterSlug(key),
        files: [item],
      });
    } else {
      current.files.push(item);
    }
  }
  return Array.from(groups.values());
}
