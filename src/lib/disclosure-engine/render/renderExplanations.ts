import { PDFDocument, PDFPage, PDFFont } from "pdf-lib";
import { EXPLANATION_LAYOUT } from "../layout/rpcd_2026.semantic";
import { DisclosureInput } from "../schema/disclosure.schema";
import { drawOverflowText } from "../utils/drawOverflowText";

/**
 * IMPORTANT FIX:
 *
 * We use ONLY:
 * - page1NotWorkingExplanation
 * - page2NotWorkingExplanation
 *
 * for appliance explanations.
 *
 * We DO NOT render applianceComments separately because that causes:
 * - duplicate comments
 * - mismatch with validation
 * - seller2 PDF inconsistencies
 */

function buildUnifiedExplanation(data: any): string {
  const lines: string[] = [];

  // General explanation block
  if (data.explanation?.trim()) {
    lines.push(data.explanation.trim());
  }

  // Question comments
  if (data.questionComments) {
    Object.entries(data.questionComments).forEach(([k, v]) => {
      if (typeof v === "string" && v.trim()) {
        lines.push(`Q${k}: ${v.trim()}`);
      }
    });
  }

  // System comments
  if (data.systemComments) {
    Object.entries(data.systemComments).forEach(([k, v]) => {
      if (typeof v === "string" && v.trim()) {
        lines.push(`${k}: ${v.trim()}`);
      }
    });
  }

  /**
   * DO NOT render:
   * data.applianceComments
   *
   * That was causing duplicated PDF text because
   * page1/page2 explanations were also rendering.
   */

  // Page 1 appliance explanations
  if (data.page1NotWorkingExplanation?.trim()) {
    lines.push(data.page1NotWorkingExplanation.trim());
  }

  // Page 2 appliance explanations
  if (data.page2NotWorkingExplanation?.trim()) {
    lines.push(data.page2NotWorkingExplanation.trim());
  }

  return lines.join("\n\n");
}

export function renderExplanations(
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput,
  pdfDoc?: PDFDocument // optional — needed only if overflow pages must be added
) {
  const text = buildUnifiedExplanation(data);

  if (!text.trim()) return;

  const layout = EXPLANATION_LAYOUT.explanation;
  const page = pages[layout.page - 1];

  if (!page) return;

  drawOverflowText({
    pdfDoc,
    page,
    font,
    text,

    x: layout.x,
    yTop: layout.yTop,
    yBottom: 40, // safe bottom margin
    maxWidth: layout.width,

    size: 10,
    lineHeight: layout.lineHeight,

    continuationHeader:
      "Oklahoma RPCD Disclosure — Continued",
  });
}