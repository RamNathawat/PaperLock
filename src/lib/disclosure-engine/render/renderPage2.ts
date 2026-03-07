import { PDFPage, PDFFont } from "pdf-lib";
import * as raw from "../../../forms/orec/2026/layout.js";
import { DisclosureInput, ZoningType } from "../schema/disclosure.schema.js";
import { drawWrappedText } from "../utils/drawWrappedText.js";

const ZONING_X: Record<ZoningType, { y: number; x: number }> = {
  residential:        { y: raw.PAGE2_ZONING_Q1_ROW1.y, x: raw.PAGE2_ZONING_Q1_ROW1.firstX },
  commercial:         { y: raw.PAGE2_ZONING_Q1_ROW1.y, x: raw.PAGE2_ZONING_Q1_ROW1.firstX + raw.PAGE2_ZONING_Q1_ROW1.deltas[0] },
  historical:         { y: raw.PAGE2_ZONING_Q1_ROW1.y, x: raw.PAGE2_ZONING_Q1_ROW1.firstX + raw.PAGE2_ZONING_Q1_ROW1.deltas[1] },
  office:             { y: raw.PAGE2_ZONING_Q1_ROW1.y, x: raw.PAGE2_ZONING_Q1_ROW1.firstX + raw.PAGE2_ZONING_Q1_ROW1.deltas[2] },
  agricultural:       { y: raw.PAGE2_ZONING_Q1_ROW1.y, x: raw.PAGE2_ZONING_Q1_ROW1.firstX + raw.PAGE2_ZONING_Q1_ROW1.deltas[3] },
  industrial:         { y: raw.PAGE2_ZONING_Q1_ROW1.y, x: raw.PAGE2_ZONING_Q1_ROW1.firstX + raw.PAGE2_ZONING_Q1_ROW1.deltas[4] },
  urban_conservation: { y: raw.PAGE2_ZONING_Q1_ROW2.y, x: raw.PAGE2_ZONING_Q1_ROW2.firstX },
  other:              { y: raw.PAGE2_ZONING_Q1_ROW2.y, x: raw.PAGE2_ZONING_Q1_ROW2.firstX + raw.PAGE2_ZONING_Q1_ROW2.deltas[0] },
  unknown:            { y: raw.PAGE2_ZONING_Q1_ROW2.y, x: raw.PAGE2_ZONING_Q1_ROW2.firstX + raw.PAGE2_ZONING_Q1_ROW2.deltas[1] },
  no_zoning:          { y: raw.PAGE2_ZONING_Q1_ROW2.y, x: raw.PAGE2_ZONING_Q1_ROW2.firstX + raw.PAGE2_ZONING_Q1_ROW2.deltas[2] },
};

export function renderPage2(
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput
) {
  const page = pages[1];

  // --------------------------------------------------
  // Appliance continuation grid (left column marker)
  // --------------------------------------------------
  Object.values(raw.PAGE2_ROW_Y).forEach((y) => {
    page.drawText("X", {
      x: raw.APPLIANCE_COLUMNS.WORKING,
      y,
      size: 11,
      font,
    });
  });

  // --------------------------------------------------
  // Security inline (rowIndex 4)
  // --------------------------------------------------
  const securityY = raw.PAGE2_ROW_Y[4];
  page.drawText("X", {
    x: raw.PAGE2_SECURITY_INLINE.firstX,
    y: securityY,
    size: 11,
    font,
  });

  // --------------------------------------------------
  // Solar inline (rowIndex 17)
  // --------------------------------------------------
  const solarY = raw.PAGE2_ROW_Y[17];
  page.drawText("X", {
    x: raw.PAGE2_SOLAR_INLINE.firstX,
    y: solarY,
    size: 11,
    font,
  });

  // --------------------------------------------------
  // Generators inline (rowIndex 18)
  // --------------------------------------------------
  if (data.inlineOptions?.generatorType !== undefined) {
    const generatorY = raw.PAGE2_ROW_Y[18];
    const base = raw.PAGE2_GENERATORS_INLINE.firstX;
    const deltas = [
      raw.PAGE2_GENERATORS_INLINE.deltaToSecond,
      raw.PAGE2_GENERATORS_INLINE.deltaToThird,
    ];

    let x = base;
    if (data.inlineOptions.generatorType > 0) {
      x = base + deltas[data.inlineOptions.generatorType - 1];
    }

    page.drawText("X", { x, y: generatorY, size: 11, font });
  }

  // --------------------------------------------------
  // Source of Household Water inline (rowIndex 19)
  // --------------------------------------------------
  if (data.inlineOptions?.waterSourceType !== undefined) {
    const waterSourceY = raw.PAGE2_ROW_Y[19];
    const base = raw.PAGE2_WATER_SOURCE_INLINE.firstX;
    const deltas = [
      raw.PAGE2_WATER_SOURCE_INLINE.deltaToSecond,
      raw.PAGE2_WATER_SOURCE_INLINE.deltaToThird,
    ];

    let x = base;
    if (data.inlineOptions.waterSourceType > 0) {
      x = base + deltas[data.inlineOptions.waterSourceType - 1];
    }

    page.drawText("X", { x, y: waterSourceY, size: 11, font });
  }

  // --------------------------------------------------
  // Fire Suppression System date of last inspection
  // --------------------------------------------------
  if (data.inlineOptions?.fireSuppresionDate) {
    page.drawText(data.inlineOptions.fireSuppresionDate, {
      x: raw.PAGE2_FIRE_SUPPRESSION_DATE.x,
      y: raw.PAGE2_FIRE_SUPPRESSION_DATE.y,
      size: 10,
      font,
    });
  }

  // --------------------------------------------------
  // Page 2 Not Working explanation box
  // --------------------------------------------------
  if (data.page2NotWorkingExplanation) {
    drawWrappedText(
      page,
      font,
      data.page2NotWorkingExplanation,
      raw.PAGE2_NOT_WORKING_BOX,
      10
    );
  }

  // --------------------------------------------------
  // Zoning Q1 — single select
  // --------------------------------------------------
  if (data.zoningType) {
    const coord = ZONING_X[data.zoningType];
    page.drawText("X", {
      x: coord.x,
      y: coord.y,
      size: 11,
      font,
    });
  }

  // --------------------------------------------------
  // Zoning Q2
  // --------------------------------------------------
  page.drawText("X", {
    x: raw.PAGE2_ZONING_Q2.firstX,
    y: raw.PAGE2_ZONING_Q2.y,
    size: 11,
    font,
  });

  // --------------------------------------------------
  // Flood Q3 Main
  // --------------------------------------------------
  page.drawText("X", {
    x: raw.PAGE2_FLOOD_Q3_MAIN.firstX,
    y: raw.PAGE2_FLOOD_Q3_MAIN.y,
    size: 11,
    font,
  });

  // Flood Q3 Types
  page.drawText("X", {
    x: raw.PAGE2_FLOOD_Q3_TYPES.firstX,
    y: raw.PAGE2_FLOOD_Q3_TYPES.y,
    size: 11,
    font,
  });

  // Flood Q3 Municipal
  page.drawText("X", {
    x: raw.PAGE2_FLOOD_Q3_MUNICIPAL.firstX,
    y: raw.PAGE2_FLOOD_Q3_MUNICIPAL.y,
    size: 11,
    font,
  });

  // --------------------------------------------------
  // Flood Q4
  // --------------------------------------------------
  page.drawText("X", {
    x: raw.PAGE2_FLOOD_Q4.firstX,
    y: raw.PAGE2_FLOOD_Q4.y,
    size: 11,
    font,
  });

  // --------------------------------------------------
  // Flood Q5
  // --------------------------------------------------
  page.drawText("X", {
    x: raw.PAGE2_FLOOD_VERTICAL_COLUMNS.YES,
    y: raw.PAGE2_FLOOD_Q5_Y,
    size: 11,
    font,
  });

  // Flood Q6
  page.drawText("X", {
    x: raw.PAGE2_FLOOD_VERTICAL_COLUMNS.NO,
    y: raw.PAGE2_FLOOD_Q6_Y,
    size: 11,
    font,
  });
}