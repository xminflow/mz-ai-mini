export interface BloggerSampleFailureView {
  label: string;
  shouldSupplement: boolean;
}

function has(raw: string, pattern: RegExp): boolean {
  return pattern.test(raw);
}

export function describeBloggerSampleFailure(
  raw: string | null,
): BloggerSampleFailureView | null {
  if (raw === null) return null;
  const text = raw.trim();
  if (text.length === 0) return null;

  if (has(text, /GET mp4/i) && has(text, /HTTP\s*403/i)) {
    return { label: "视频下载被平台拒绝（HTTP 403）", shouldSupplement: true };
  }
  if (has(text, /GET mp4/i) && has(text, /HTTP\s*(404|410)/i)) {
    return { label: "视频已失效或已下架", shouldSupplement: true };
  }
  if (has(text, /无法解析视频下载链接|download link/i)) {
    return { label: "视频下载链接解析失败", shouldSupplement: true };
  }
  if (has(text, /FRAME_EXTRACT_FAILED/i) || has(text, /ffmpeg/i)) {
    return { label: "视频抽帧失败", shouldSupplement: true };
  }
  if (has(text, /ASR_MODEL_MISSING/i)) {
    return { label: "语音识别模型未安装", shouldSupplement: false };
  }
  if (has(text, /TRANSCRIPT_NO_AUDIO/i)) {
    return { label: "视频没有可识别的人声", shouldSupplement: false };
  }
  if (has(text, /TRANSCRIPT_DECODE_FAILED|TRANSCRIPT_FAILED/i)) {
    return { label: "音频转写失败", shouldSupplement: false };
  }

  return { label: "素材处理失败", shouldSupplement: false };
}
