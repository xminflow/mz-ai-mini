const DEFAULT_READ_TIME = "5 分钟阅读";

const padNumber = (value) => String(value).padStart(2, "0");

const formatReadTime = (minutes) => {
  const parsedMinutes = Number(minutes);

  if (!Number.isFinite(parsedMinutes) || parsedMinutes <= 0) {
    return DEFAULT_READ_TIME;
  }

  return `${Math.round(parsedMinutes)} 分钟阅读`;
};

const formatDateLabel = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return `${date.getFullYear()}.${padNumber(date.getMonth() + 1)}.${padNumber(date.getDate())}`;
};

const splitParagraphs = (content) => {
  if (!content) {
    return [];
  }

  return String(content)
    .split(/\r?\n\s*\r?\n/g)
    .map((paragraph) => paragraph.replace(/\r?\n/g, " ").trim())
    .filter(Boolean);
};

const stripMarkdownSyntax = (content) => {
  if (!content) {
    return "";
  }

  return String(content)
    .replace(/```([\s\S]*?)```/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[ \t]*>\s?/gm, "")
    .replace(/^[ \t]*[-*+]\s+/gm, "")
    .replace(/^[ \t]*\d+\.\s+/gm, "")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
};

const splitMarkdownParagraphs = (content) => splitParagraphs(stripMarkdownSyntax(content));

module.exports = {
  formatDateLabel,
  formatReadTime,
  splitMarkdownParagraphs,
  splitParagraphs,
  stripMarkdownSyntax,
};
