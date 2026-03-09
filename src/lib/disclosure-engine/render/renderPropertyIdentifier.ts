import { PDFPage, PDFFont } from "pdf-lib";
import * as raw from "../../../forms/orec/2026/layout";
import { DisclosureInput } from "../schema/disclosure.schema";

export function renderPropertyIdentifier(
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput
) {
  if (!data.propertyIdentifier) return;

  // Page 1 header — top of page
  pages[0].drawText(data.propertyIdentifier, {
    x: raw.PROPERTY_IDENTIFIER_HEADER.x,
    y: raw.PROPERTY_IDENTIFIER_HEADER.y,
    size: raw.PROPERTY_IDENTIFIER_HEADER.fontSize,
    font,
  });

  // Page 1 body — "LOCATION OF SUBJECT PROPERTY" field
  pages[0].drawText(data.propertyIdentifier, {
    x: raw.PROPERTY_IDENTIFIER_PAGE1.x,
    y: raw.PROPERTY_IDENTIFIER_PAGE1.y,
    size: raw.PROPERTY_IDENTIFIER_PAGE1.fontSize,
    font,
  });

  // Pages 2–5 — repeat in header at top of every page
  pages.slice(1).forEach((page) => {
    page.drawText(data.propertyIdentifier!, {
      x: raw.PROPERTY_IDENTIFIER_HEADER.x,
      y: raw.PROPERTY_IDENTIFIER_HEADER.y,
      size: raw.PROPERTY_IDENTIFIER_HEADER.fontSize,
      font,
    });
  });

  // Seller occupying checkbox — page 1 only
  if (data.sellerOccupying !== undefined) {
    const x =
      data.sellerOccupying === 0
        ? raw.SELLER_OCCUPYING.occupyingX
        : raw.SELLER_OCCUPYING.notOccupyingX;

    pages[0].drawText("X", {
      x,
      y: raw.SELLER_OCCUPYING.y,
      size: raw.CHECKBOX_SIZE,
      font,
    });
  }
}