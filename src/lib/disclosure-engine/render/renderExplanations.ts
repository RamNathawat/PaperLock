import { PDFDocument, PDFPage, PDFFont, rgb } from "pdf-lib";
import { EXPLANATION_LAYOUT } from "../layout/rpcd_2026.semantic";
import { DisclosureInput } from "../schema/disclosure.schema";
import { flattenObject } from "../utils/flatten";
import { drawWrappedText } from "../utils/drawWrappedText";

function buildUnifiedExplanation(data: any): string {
  const lines: string[] = [];

  if (data.explanation?.trim()) {
    lines.push(data.explanation.trim());
  }

  if (data.questionComments) {
    Object.entries(data.questionComments).forEach(([k, v]) => {
      if (typeof v === "string" && v.trim()) {
        lines.push(`Q${k}: ${v.trim()}`);
      }
    });
  }

  if (data.systemComments) {
    Object.entries(data.systemComments).forEach(([k, v]) => {
      if (typeof v === "string" && v.trim()) {
        lines.push(`${k}: ${v.trim()}`);
      }
    });
  }

  return lines.join("\n");
}

/**
 * Word-wraps `text` into lines that fit within `maxWidth`.
 * Returns the array of wrapped lines.
 */
function wrapLines(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    if (!paragraph.trim()) {
      lines.push(""); // preserve blank lines
      continue;
    }

    const words = paragraph.split(/\s+/);
    let current = "";

    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) <= maxWidth) {
        current = test;
      } else {
        if (current) lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
  }

  return lines;
}

/**
 * Draws explanation text into the built-in box on Page 4.
 * If more lines exist than fit in that box, they are drawn on
 * dynamically appended continuation pages so text is never clipped.
 */
export function renderExplanations(
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput,
  pdfDoc?: PDFDocument  // optional — needed only if overflow pages must be added
) {
  const text = buildUnifiedExplanation(data);
  if (!text.trim()) return;

  const layout     = EXPLANATION_LAYOUT.explanation;
  const page       = pages[layout.page - 1];
  if (!page) return;

  const SIZE        = 10;
  const LINE_HEIGHT = layout.lineHeight;   // 14
  const MAX_WIDTH   = layout.width;        // 545
  const Y_TOP       = layout.yTop;         // 170
  const Y_BOTTOM    = 40;                  // leave ~40pt margin at bottom

  const linesPerPage = Math.floor((Y_TOP - Y_BOTTOM) / LINE_HEIGHT);

  const allLines = wrapLines(text, font, SIZE, MAX_WIDTH);

  // ── Draw first batch into the built-in box ──────────────────
  const firstBatch = allLines.slice(0, linesPerPage);
  let currentY     = Y_TOP;

  for (const line of firstBatch) {
    if (line) {
      page.drawText(line, {
        x:    layout.x,
        y:    currentY,
        size: SIZE,
        font,
        color: rgb(0, 0, 0),
      });
    }
    currentY -= LINE_HEIGHT;
  }

  // ── Overflow: append continuation pages ─────────────────────
  const overflowLines = allLines.slice(linesPerPage);
  if (overflowLines.length === 0 || !pdfDoc) return;

  // Page dimensions — use the same size as page 1
  const { width, height } = pages[0].getSize();

  // Continuation page constants
  const CONT_Y_TOP    = height - 50;   // ~742 for letter
  const CONT_Y_BOTTOM = 50;
  const linesPerCont  = Math.floor((CONT_Y_TOP - CONT_Y_BOTTOM) / LINE_HEIGHT);
  const CONT_X        = layout.x;

  let remaining = overflowLines;

  while (remaining.length > 0) {
    const contPage = pdfDoc.addPage([width, height]);

    // Header
    contPage.drawText("Oklahoma RPCD Disclosure — Continued", {
      x: CONT_X,
      y: CONT_Y_TOP + 16,
      size: 9,
      font,
      color: rgb(0.5, 0.5, 0.5),
    });

    const batch  = remaining.slice(0, linesPerCont);
    remaining    = remaining.slice(linesPerCont);
    let y        = CONT_Y_TOP;

    for (const line of batch) {
      if (line) {
        contPage.drawText(line, {
          x:    CONT_X,
          y,
          size: SIZE,
          font,
          color: rgb(0, 0, 0),
        });
      }
      y -= LINE_HEIGHT;
    }
  }
}