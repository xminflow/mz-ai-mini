export interface ReportAppendixSection {
  id: string;
  title: string;
  markdown: string;
}

export interface ParsedBloggerReport {
  title: string | null;
  articleMarkdown: string;
  appendixSections: ReportAppendixSection[];
}

function normalizeMarkdown(markdown: string): string {
  return markdown.replace(/\r\n?/g, "\n");
}

export function stripReportFrontmatter(markdown: string): string {
  const normalized = normalizeMarkdown(markdown);
  if (!normalized.startsWith("---\n")) return normalized;

  const closingIndex = normalized.indexOf("\n---\n", 4);
  if (closingIndex === -1) return normalized;
  return normalized.slice(closingIndex + 5);
}

export function reportTitle(markdown: string): string | null {
  const match = /^#\s+(.+)$/m.exec(markdown);
  return match?.[1]?.trim() ?? null;
}

function parseAppendixSections(markdown: string): ReportAppendixSection[] {
  const appendixBody = markdown.replace(/^##\s+附录\s*$/m, "").trim();
  if (appendixBody.length === 0) return [];

  const headingRegex = /^###\s+(.+)$/gm;
  const matches = [...appendixBody.matchAll(headingRegex)];
  if (matches.length === 0) {
    return [{ id: "appendix-0", title: "附录", markdown: appendixBody }];
  }

  return matches.map((match, index) => {
    const title = match[1]?.trim() ?? `附录 ${index + 1}`;
    const start = match.index ?? 0;
    const contentStart = start + match[0].length;
    const nextStart = matches[index + 1]?.index ?? appendixBody.length;
    const markdownSection = appendixBody.slice(contentStart, nextStart).trim();
    return {
      id: `appendix-${index}`,
      title,
      markdown: markdownSection.length > 0 ? markdownSection : "暂无内容。",
    };
  });
}

export function parseBloggerReport(markdown: string): ParsedBloggerReport {
  const stripped = stripReportFrontmatter(markdown).trim();
  const appendixMatch = /^##\s+附录\s*$/m.exec(stripped);

  if (appendixMatch === null || appendixMatch.index === undefined) {
    return {
      title: reportTitle(stripped),
      articleMarkdown: stripped,
      appendixSections: [],
    };
  }

  const articleMarkdown = stripped.slice(0, appendixMatch.index).trim();
  const appendixMarkdown = stripped.slice(appendixMatch.index).trim();

  return {
    title: reportTitle(articleMarkdown),
    articleMarkdown,
    appendixSections: parseAppendixSections(appendixMarkdown),
  };
}
