import { PDFPage, PDFFont } from "pdf-lib";
import { DisclosureInput } from "../schema/disclosure.schema.js";
import { TEXT_LAYOUT } from "../layout/rpcd_2026.semantic.js";
import { flattenObject } from "../utils/flatten.js";

export function renderTextFields(
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput
) {
  const flat = flattenObject(data);

  for (const [path, layout] of Object.entries(TEXT_LAYOUT)) {
    const value = flat[path];
    if (!value) continue;

    const page = pages[layout.page];

    page.drawText(String(value), {
      x: layout.x,
      y: layout.y,
      size: layout.fontSize,
      font,
    });
  }
}