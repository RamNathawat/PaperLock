import { PDFPage, PDFFont } from "pdf-lib";
import { DisclosureInput } from "../schema/disclosure.schema.js";
import { EXPLANATION_LAYOUT } from "../layout/rpcd_2026.semantic.js";
import { flattenObject } from "../utils/flatten.js";
import { drawWrappedText } from "../utils/drawWrappedText.js";

export function renderExplanations(
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput
) {
  const flat = flattenObject(data);

  for (const [path, layout] of Object.entries(EXPLANATION_LAYOUT)) {
    const text = flat[path];
    if (!text) continue;

    const page = pages[layout.page];

    drawWrappedText(
      page,
      font,
      text,
      layout,
      10
    );
  }
}