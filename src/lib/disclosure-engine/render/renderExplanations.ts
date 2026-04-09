import { PDFDocument, PDFPage, PDFFont, rgb } from "pdf-lib";
import { EXPLANATION_LAYOUT } from "../layout/rpcd_2026.semantic";
import { DisclosureInput } from "../schema/disclosure.schema";
import { drawOverflowText } from "../utils/drawOverflowText";

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

  drawOverflowText({
    pdfDoc,
    page,
    font,
    text,
    x:          layout.x,
    yTop:       layout.yTop,
    yBottom:    40,                  // leave ~40pt margin at bottom
    maxWidth:   layout.width,
    size:       10,
    lineHeight: layout.lineHeight,
    continuationHeader: "Oklahoma RPCD Disclosure — Continued",
  });
}