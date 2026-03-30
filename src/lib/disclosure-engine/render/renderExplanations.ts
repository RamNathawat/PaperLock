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

  if (
    data.sewerSystem?.type === 1 &&
    data.sewerSystem?.privateType !== undefined
  ) {
    lines.push(
      `Private sewer subtype: ${data.sewerSystem.privateType}`
    );
  }

  if (data.inlineOptions?.fireSuppresionDate?.trim()) {
    lines.push(
      `Fire suppression serviced: ${data.inlineOptions.fireSuppresionDate}`
    );
  }

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