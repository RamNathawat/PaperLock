import { PDFPage, PDFFont } from "pdf-lib";
import * as raw from "../../../forms/orec/2026/layout.js";
import { DisclosureInput } from "../schema/disclosure.schema.js";
import { APPLIANCE_LAYOUT } from "../layout/rpcd_2026.semantic.js";
import { flattenObject } from "../utils/flatten.js";

export function renderAppliances(
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput
) {
  const resolveRowY = (i: number) => {
    const baseY =
      raw.APPLIANCE_FIRST_ROW_Y -
      i * raw.APPLIANCE_ROW_SPACING;

    return i === 9
      ? 202.5
      : i > 9
      ? baseY - 12.5
      : baseY;
  };

  // 🔥 Generic flattening (no manual listing anymore)
  const flat = flattenObject(data);

  for (const [path, layout] of Object.entries(APPLIANCE_LAYOUT)) {
    const status = flat[`${path}.status`];
    if (!status) continue;

    const page = pages[layout.page];
    const y = resolveRowY(layout.rowIndex);

    let x: number | undefined;

    switch (status) {
      case "WORKING":
        x = raw.APPLIANCE_COLUMNS.WORKING;
        break;
      case "NOT_WORKING":
        x = raw.APPLIANCE_COLUMNS.NOT_WORKING;
        break;
      case "UNKNOWN":
        x = raw.APPLIANCE_COLUMNS.DO_NOT_KNOW;
        break;
      case "NONE":
        x = raw.APPLIANCE_COLUMNS.NONE;
        break;
    }

    if (typeof x !== "number") continue;

    page.drawText("X", {
      x,
      y,
      size: raw.CHECKBOX_SIZE,
      font,
    });
  }
}