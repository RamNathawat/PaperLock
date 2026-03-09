import { PDFPage, PDFFont } from "pdf-lib";
import { DisclosureInput } from "../schema/disclosure.schema";
import { EXPLANATION_LAYOUT } from "../layout/rpcd_2026.semantic";
import { flattenObject } from "../utils/flatten";
import { drawWrappedText } from "../utils/drawWrappedText";

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