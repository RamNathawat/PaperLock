import { PDFPage, PDFFont } from "pdf-lib";
import { DisclosureInput } from "../schema/disclosure.schema";
import { EXPLANATION_LAYOUT } from "../layout/rpcd_2026.semantic";
import { drawWrappedText } from "../utils/drawWrappedText";

function buildUnifiedExplanation(data: any): string {
  const lines: string[] = [];

  // ONLY legal / questions explanation
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

  // Removed sewer subtype & fire suppression date "metadata leaks"
  // as they are primarily rendered via specific field bindings.

  return lines.join("\n");
}

export function renderExplanations(
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput
) {
  const layout = EXPLANATION_LAYOUT.explanation;
  const page = pages[layout.page];

  const text = buildUnifiedExplanation(data);

  if (!text.trim()) return;

  drawWrappedText(page, font, text, layout, 10);
}