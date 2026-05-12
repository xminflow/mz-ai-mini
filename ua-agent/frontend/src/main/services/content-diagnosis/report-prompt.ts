import type { Platform } from "../../../shared/contracts/capture";

export interface BuildContentDiagnosisReportPromptInput {
  dataRoot: string;
  guideRoot: string;
  runId: string;
  platform: Platform;
}

export function buildContentDiagnosisReportPrompt(
  input: BuildContentDiagnosisReportPromptInput,
): string {
  const platformLabel = input.platform === "xiaohongshu" ? "小红书" : "抖音";
  return [
    "Use the douyin-content-diagnosis-report skill to generate the final content diagnosis report.",
    "",
    "Parameters:",
    `- data_root: ${input.dataRoot}`,
    `- guide_root: ${input.guideRoot}`,
    `- run_id: ${input.runId}`,
    `- platform: ${input.platform}`,
    `- platform_label: ${platformLabel}`,
    "",
    `Read the ${platformLabel} video material files from data_root.`,
    "You may read Markdown files under guide_root to connect the diagnosis to 百万粉博主流量实战.",
    `Write with ${platformLabel} platform context. Do not call it 抖音 when platform_label is 小红书.`,
    "The final artifact must be the Markdown report written to <data_root>/diagnosis.generated.md.",
    "Do not write to <data_root>/diagnosis.md directly; the app will publish the final copy.",
    "Keep the exact six-section structure required by the skill.",
    "Do not output machine metadata, run ids, raw file names, or checklist text in the final Markdown.",
    "Do not invent any missing metrics such as views, completion rate, conversion rate, or follower growth.",
    "The report must prioritize concrete problems, why they matter, and directly usable rewrites.",
    "After writing the report, print one short Chinese summary sentence.",
  ].join("\n");
}
