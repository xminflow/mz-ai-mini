export interface BuildBloggerReportPromptInput {
  dataRoot: string;
  runId: string;
  focusCount?: number;
}

export function buildBloggerReportPrompt(
  input: BuildBloggerReportPromptInput,
): string {
  const focusCount = Math.min(8, Math.max(3, input.focusCount ?? 4));
  return [
    "Use the douyin-blogger-report skill to generate the final blogger analysis report.",
    "",
    "Parameters:",
    `- data_root: ${input.dataRoot}`,
    `- run_id: ${input.runId}`,
    `- focus_count: ${focusCount}`,
    "",
    "Read only from data_root and follow the skill instructions exactly.",
    "The final artifact must be the Markdown report written to <data_root>/analysis.generated.md.",
    "Do not write to <data_root>/analysis.md directly; the app will publish the final copy.",
    "Write for human readers first: the report should read like a public-account deep-dive article, not an audit template.",
    "Prioritize mechanism-level analysis over recap-level summary: each major judgment should explain why it holds, what sample evidence supports it, and what makes it transferable.",
    "Keep evidence and analysis in the main body.",
    "If some files are missing, continue and only note the limitation inline when it changes the strength of a conclusion; do not invent data.",
    "Make the seventh chapter the core mechanism section, not a recap of earlier sections.",
    "Do not output machine metadata such as frontmatter, run ids, or checklist text in the final Markdown.",
    "Do not invent any missing metrics or engagement numbers.",
    "After writing the report, print one short Chinese summary sentence.",
  ].join("\n");
}
