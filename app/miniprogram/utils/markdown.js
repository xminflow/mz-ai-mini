const BLOCK_IMAGE_PATTERN = /^\s*!\[([^\]]*)\]\(([^)]+)\)\s*$/;
const BLOCK_HEADING_PATTERN = /^\s*(#{1,6})\s+(.+?)\s*$/;
const BLOCK_HORIZONTAL_RULE_PATTERN = /^\s*(?:-{3,}|\*{3,}|_{3,}|(?:-\s+){2,}-?|(?:\*\s+){2,}\*?|(?:_\s+){2,}_?)\s*$/;
const BLOCK_QUOTE_PATTERN = /^\s*>\s?(.*)\s*$/;
const BLOCK_UNORDERED_LIST_PATTERN = /^\s*[-*+]\s+(.+?)\s*$/;
const BLOCK_ORDERED_LIST_PATTERN = /^\s*(\d+)\.\s+(.+?)\s*$/;
const TABLE_ALIGNMENT_PATTERN = /^:?-{3,}:?$/;
const INLINE_PATTERN =
  /\[\^([^\]]+)\]|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|__([^_]+)__|`([^`]+)`|\*([^*]+)\*|_([^_]+)_/g;

const normalizeMarkdown = (markdown) => String(markdown || "").replace(/\r\n?/g, "\n");

const isBlankLine = (line) => line.trim() === "";

const parseImageLine = (line) => {
  const matched = BLOCK_IMAGE_PATTERN.exec(line);
  if (!matched) {
    return null;
  }

  return {
    alt: matched[1],
    src: matched[2].trim(),
  };
};

const parseHeadingLine = (line) => {
  const matched = BLOCK_HEADING_PATTERN.exec(line);
  if (!matched) {
    return null;
  }

  return {
    level: matched[1].length,
    text: matched[2].replace(/\s+#+\s*$/, "").trim(),
  };
};

const isHorizontalRuleLine = (line) => BLOCK_HORIZONTAL_RULE_PATTERN.test(line);

const parseQuoteLine = (line) => {
  const matched = BLOCK_QUOTE_PATTERN.exec(line);
  return matched ? matched[1] : null;
};

const parseUnorderedListLine = (line) => {
  const matched = BLOCK_UNORDERED_LIST_PATTERN.exec(line);
  return matched ? matched[1] : null;
};

const parseOrderedListLine = (line) => {
  const matched = BLOCK_ORDERED_LIST_PATTERN.exec(line);
  if (!matched) {
    return null;
  }

  return {
    order: matched[1],
    text: matched[2],
  };
};

const parseFootnoteDefinitionLine = (line) => {
  const normalizedLine = String(line || "").trim();
  if (!normalizedLine.startsWith("[^")) {
    return null;
  }

  const separatorIndex = normalizedLine.indexOf("]:");
  if (separatorIndex < 3) {
    return null;
  }

  const label = normalizedLine.slice(2, separatorIndex).trim();
  const content = normalizedLine.slice(separatorIndex + 2).trim();
  if (!label || !content) {
    return null;
  }

  return {
    label,
    content,
  };
};

const splitTableRow = (line) => {
  const normalizedLine = String(line || "").trim();
  if (!normalizedLine.includes("|")) {
    return null;
  }

  const rowContent = normalizedLine
    .replace(/^\|/, "")
    .replace(/\|$/, "");

  const cells = [];
  let currentCell = "";
  let isEscaped = false;

  for (let index = 0; index < rowContent.length; index += 1) {
    const currentCharacter = rowContent[index];

    if (isEscaped) {
      currentCell += currentCharacter;
      isEscaped = false;
      continue;
    }

    if (currentCharacter === "\\") {
      isEscaped = true;
      continue;
    }

    if (currentCharacter === "|") {
      cells.push(currentCell.trim());
      currentCell = "";
      continue;
    }

    currentCell += currentCharacter;
  }

  if (isEscaped) {
    currentCell += "\\";
  }

  cells.push(currentCell.trim());
  return cells;
};

const parseTableAlignment = (cell) => {
  const normalizedCell = String(cell || "").trim();
  if (!TABLE_ALIGNMENT_PATTERN.test(normalizedCell)) {
    return null;
  }

  if (normalizedCell.startsWith(":") && normalizedCell.endsWith(":")) {
    return "center";
  }

  if (normalizedCell.endsWith(":")) {
    return "right";
  }

  return "left";
};

const buildTableCell = (text, columnIndex, align, prefix, inlineParseOptions) => ({
  id: `${prefix}-cell-${columnIndex}`,
  align,
  inlines: parseInlineSegments(text, inlineParseOptions),
});

const parseTableBlock = (lines, startIndex, blockIndex, inlineParseOptions) => {
  if (startIndex + 1 >= lines.length) {
    return null;
  }

  const headerCells = splitTableRow(lines[startIndex]);
  const separatorCells = splitTableRow(lines[startIndex + 1]);

  if (!headerCells || !separatorCells || headerCells.length < 2) {
    return null;
  }

  if (separatorCells.length !== headerCells.length) {
    return null;
  }

  const columnAlignments = separatorCells.map(parseTableAlignment);
  if (columnAlignments.some((alignment) => alignment === null)) {
    return null;
  }

  const rows = [];
  let lineIndex = startIndex + 2;

  while (lineIndex < lines.length) {
    const currentLine = lines[lineIndex];
    if (isBlankLine(currentLine)) {
      break;
    }

    const parsedRow = splitTableRow(currentLine);
    if (!parsedRow) {
      break;
    }

    const normalizedRow = headerCells.map(
      (_, columnIndex) => parsedRow[columnIndex] || ""
    );

    rows.push({
      id: `table-row-${rows.length}`,
      cells: normalizedRow.map((text, columnIndex) =>
        buildTableCell(
          text,
          columnIndex,
          columnAlignments[columnIndex],
          `table-row-${rows.length}`,
          inlineParseOptions
        )
      ),
    });
    lineIndex += 1;
  }

  return {
    block: {
      id: `table-${blockIndex}`,
      type: "table",
      columns: headerCells.length,
      header: headerCells.map((text, columnIndex) =>
        buildTableCell(
          text,
          columnIndex,
          columnAlignments[columnIndex],
          "table-header",
          inlineParseOptions
        )
      ),
      rows,
    },
    nextIndex: lineIndex,
  };
};

const containsFencedCodeSyntax = (lines) =>
  lines.some((line) => line.trim().startsWith("```"));

const pushTextSegment = (segments, text) => {
  if (!text) {
    return;
  }

  const previousSegment = segments[segments.length - 1];
  if (previousSegment && previousSegment.type === "text") {
    previousSegment.text += text;
    return;
  }

  segments.push({
    id: `inline-${segments.length}`,
    type: "text",
    text,
  });
};

const pushInlineSegment = (segments, segment) => {
  segments.push({
    id: `inline-${segments.length}`,
    ...segment,
  });
};

const registerFootnoteReference = (label, options) => {
  if (!options || !options.footnoteDefinitions) {
    return false;
  }

  const footnoteText = options.footnoteDefinitions[label];
  if (typeof footnoteText !== "string") {
    throw new Error(`Markdown footnote reference "${label}" is not defined.`);
  }

  if (!options.referencedFootnotes[label]) {
    options.referencedFootnotes[label] = true;
    options.footnoteOrder.push(label);
  }

  return true;
};

const parseInlineSegments = (text, options = null) => {
  INLINE_PATTERN.lastIndex = 0;
  if (!text) {
    return [];
  }

  const segments = [];
  let cursor = 0;
  try {
    let matched = INLINE_PATTERN.exec(text);

    while (matched) {
      if (matched.index > cursor) {
        pushTextSegment(segments, text.slice(cursor, matched.index));
      }

      if (matched[1] !== undefined) {
        if (!registerFootnoteReference(matched[1].trim(), options)) {
          pushTextSegment(segments, matched[0]);
        }
      } else if (matched[2] !== undefined) {
        pushInlineSegment(segments, {
          type: "link",
          text: matched[2],
          url: matched[3].trim(),
        });
      } else if (matched[4] !== undefined || matched[5] !== undefined) {
        pushInlineSegment(segments, {
          type: "strong",
          text: matched[4] || matched[5],
        });
      } else if (matched[6] !== undefined) {
        pushInlineSegment(segments, {
          type: "inline-code",
          text: matched[6],
        });
      } else if (matched[7] !== undefined || matched[8] !== undefined) {
        pushInlineSegment(segments, {
          type: "emphasis",
          text: matched[7] || matched[8],
        });
      }

      cursor = INLINE_PATTERN.lastIndex;
      matched = INLINE_PATTERN.exec(text);
    }

    if (cursor < text.length) {
      pushTextSegment(segments, text.slice(cursor));
    }

    return segments;
  } finally {
    INLINE_PATTERN.lastIndex = 0;
  }
};

const isParagraphBoundary = (line) => {
  return Boolean(
    parseImageLine(line) ||
      parseHeadingLine(line) ||
      isHorizontalRuleLine(line) ||
      parseQuoteLine(line) !== null ||
      parseUnorderedListLine(line) !== null ||
      parseOrderedListLine(line)
  );
};

const isTableStart = (lines, lineIndex) =>
  Boolean(parseTableBlock(lines, lineIndex, 0));

const extractFootnoteDefinitions = (lines) => {
  const bodyLines = [];
  const footnoteDefinitions = {};

  lines.forEach((line) => {
    const footnoteDefinition = parseFootnoteDefinitionLine(line);
    if (!footnoteDefinition) {
      bodyLines.push(line);
      return;
    }

    if (footnoteDefinitions[footnoteDefinition.label]) {
      throw new Error(
        `Markdown footnote definition "${footnoteDefinition.label}" is duplicated.`
      );
    }

    footnoteDefinitions[footnoteDefinition.label] = footnoteDefinition.content;
    bodyLines.push("");
  });

  return {
    bodyLines,
    footnoteDefinitions,
  };
};

const buildFootnotesBlock = (blockIndex, footnoteOrder, footnoteDefinitions) => {
  if (footnoteOrder.length === 0) {
    return null;
  }

  return {
    id: `footnotes-${blockIndex}`,
    type: "footnotes",
    items: footnoteOrder.map((label, itemIndex) => ({
      id: `footnote-item-${itemIndex}`,
      label,
      marker: `${label}.`,
      inlines: parseInlineSegments(footnoteDefinitions[label]),
    })),
  };
};

const parseMarkdownToBlocks = (markdown) => {
  const normalizedMarkdown = normalizeMarkdown(markdown);
  if (normalizedMarkdown.trim() === "") {
    return [];
  }

  const extractedFootnotes = extractFootnoteDefinitions(
    normalizedMarkdown.split("\n")
  );
  const lines = extractedFootnotes.bodyLines;
  const blocks = [];
  const inlineParseOptions = {
    footnoteDefinitions: extractedFootnotes.footnoteDefinitions,
    referencedFootnotes: {},
    footnoteOrder: [],
  };
  let lineIndex = 0;

  const nextBlockId = (type) => `${type}-${blocks.length}`;

  while (lineIndex < lines.length) {
    const currentLine = lines[lineIndex];

    if (isBlankLine(currentLine)) {
      lineIndex += 1;
      continue;
    }

    const image = parseImageLine(currentLine);
    if (image) {
      blocks.push({
        id: nextBlockId("image"),
        type: "image",
        alt: image.alt,
        src: image.src,
      });
      lineIndex += 1;
      continue;
    }

    const heading = parseHeadingLine(currentLine);
    if (heading) {
      blocks.push({
        id: nextBlockId("heading"),
        type: "heading",
        level: heading.level,
        inlines: parseInlineSegments(heading.text, inlineParseOptions),
      });
      lineIndex += 1;
      continue;
    }

    const table = parseTableBlock(
      lines,
      lineIndex,
      blocks.length,
      inlineParseOptions
    );
    if (table) {
      blocks.push(table.block);
      lineIndex = table.nextIndex;
      continue;
    }

    if (isHorizontalRuleLine(currentLine)) {
      blocks.push({
        id: nextBlockId("horizontal-rule"),
        type: "horizontal-rule",
      });
      lineIndex += 1;
      continue;
    }

    const quoteLine = parseQuoteLine(currentLine);
    if (quoteLine !== null) {
      const quoteLines = [];
      while (lineIndex < lines.length) {
        const currentQuoteLine = parseQuoteLine(lines[lineIndex]);
        if (currentQuoteLine === null) {
          break;
        }
        quoteLines.push(currentQuoteLine);
        lineIndex += 1;
      }

      blocks.push({
        id: nextBlockId("quote"),
        type: "quote",
        inlines: parseInlineSegments(
          quoteLines.join(" ").trim(),
          inlineParseOptions
        ),
      });
      continue;
    }

    const unorderedListLine = parseUnorderedListLine(currentLine);
    if (unorderedListLine !== null) {
      const items = [];
      while (lineIndex < lines.length) {
        const listItemText = parseUnorderedListLine(lines[lineIndex]);
        if (listItemText === null) {
          break;
        }
        items.push({
          id: `list-item-${items.length}`,
          marker: "•",
          inlines: parseInlineSegments(listItemText, inlineParseOptions),
        });
        lineIndex += 1;
      }

      blocks.push({
        id: nextBlockId("list"),
        type: "list",
        items,
      });
      continue;
    }

    const orderedListLine = parseOrderedListLine(currentLine);
    if (orderedListLine) {
      const items = [];
      while (lineIndex < lines.length) {
        const listItem = parseOrderedListLine(lines[lineIndex]);
        if (!listItem) {
          break;
        }
        items.push({
          id: `list-item-${items.length}`,
          marker: `${listItem.order}.`,
          inlines: parseInlineSegments(listItem.text, inlineParseOptions),
        });
        lineIndex += 1;
      }

      blocks.push({
        id: nextBlockId("list"),
        type: "list",
        items,
      });
      continue;
    }

    const paragraphLines = [currentLine.trim()];
    lineIndex += 1;

    while (lineIndex < lines.length) {
      const nextLine = lines[lineIndex];
      if (
        isBlankLine(nextLine) ||
        isParagraphBoundary(nextLine) ||
        isTableStart(lines, lineIndex)
      ) {
        break;
      }
      paragraphLines.push(nextLine.trim());
      lineIndex += 1;
    }

    const paragraphText = paragraphLines.join(" ").trim();
    blocks.push({
      id: nextBlockId("paragraph"),
      type: "paragraph",
      inlines: containsFencedCodeSyntax(paragraphLines)
        ? [
            {
              id: "inline-0",
              type: "text",
              text: paragraphText,
            },
          ]
        : parseInlineSegments(paragraphText, inlineParseOptions),
    });
  }

  const footnotesBlock = buildFootnotesBlock(
    blocks.length,
    inlineParseOptions.footnoteOrder,
    extractedFootnotes.footnoteDefinitions
  );
  if (footnotesBlock) {
    blocks.push(footnotesBlock);
  }

  return blocks;
};

module.exports = {
  parseMarkdownToBlocks,
};
