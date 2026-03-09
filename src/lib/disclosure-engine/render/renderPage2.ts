import { PDFPage, PDFFont } from "pdf-lib";
import * as raw from "../../../forms/orec/2026/layout";
import { DisclosureInput, ZoningType } from "../schema/disclosure.schema";
import { drawWrappedText } from "../utils/drawWrappedText";

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
  // Appliance continuation grid — indices 19+ only
  // PAGE2_ROW_Y key N = appliance index N + 19
  // --------------------------------------------------
  if (data.appliances) {
    Object.entries(raw.PAGE2_ROW_Y).forEach(([keyStr, y]) => {
      const page2RowKey = Number(keyStr);
      const applianceIndex = page2RowKey + 19;
      const status = data.appliances![applianceIndex];

      if (!status) return;

      let x: number | undefined;
      switch (status) {
        case "WORKING":     x = raw.APPLIANCE_COLUMNS.WORKING; break;
        case "NOT_WORKING": x = raw.APPLIANCE_COLUMNS.NOT_WORKING; break;
        case "UNKNOWN":     x = raw.APPLIANCE_COLUMNS.DO_NOT_KNOW; break;
        case "NONE":        x = raw.APPLIANCE_COLUMNS.NONE; break;
      }

      if (typeof x === "number") {
        page.drawText("X", { x, y, size: 11, font });
      }
    });
  }

  // --------------------------------------------------
  // Security system inline (rowIndex 4) — data-driven
  // --------------------------------------------------
  if (data.inlineOptions?.securitySystemType !== undefined) {
    const securityY = raw.PAGE2_ROW_Y[4];
    const base = raw.PAGE2_SECURITY_INLINE.firstX;
    const deltas = [
      raw.PAGE2_SECURITY_INLINE.deltaToSecond,
      raw.PAGE2_SECURITY_INLINE.deltaToThird,
      raw.PAGE2_SECURITY_INLINE.deltaToFourth,
    ];

    let x = base;
    if (data.inlineOptions.securitySystemType > 0) {
      x = base + deltas[data.inlineOptions.securitySystemType - 1];
    }

    page.drawText("X", { x, y: securityY, size: 11, font });
  }

  // --------------------------------------------------
  // Solar panels inline (rowIndex 17) — data-driven
  // --------------------------------------------------
  if (data.inlineOptions?.solarPanelType !== undefined) {
    const solarY = raw.PAGE2_ROW_Y[17];
    const base = raw.PAGE2_SOLAR_INLINE.firstX;
    const deltas = [
      raw.PAGE2_SOLAR_INLINE.deltaToSecond,
      raw.PAGE2_SOLAR_INLINE.deltaToThird,
    ];

    let x = base;
    if (data.inlineOptions.solarPanelType > 0) {
      x = base + deltas[data.inlineOptions.solarPanelType - 1];
    }

    page.drawText("X", { x, y: solarY, size: 11, font });
  }

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
  // Fire Suppression System date
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
  // Zoning Q1 — supports legacy zoningType and new page2Zoning.zoningType
  // --------------------------------------------------
  const zoningType = data.page2Zoning?.zoningType ?? data.zoningType;
  if (zoningType) {
    const coord = ZONING_X[zoningType];
    page.drawText("X", { x: coord.x, y: coord.y, size: 11, font });
  }

  // --------------------------------------------------
  // Zoning Q2 — historical district (0=YES, 1=NO, 2=UNKNOWN)
  // --------------------------------------------------
  if (data.page2Zoning?.historicalDistrict !== undefined) {
    const x =
      data.page2Zoning.historicalDistrict === 0
        ? raw.PAGE2_ZONING_Q2.firstX
        : data.page2Zoning.historicalDistrict === 1
        ? raw.PAGE2_ZONING_Q2.firstX + raw.PAGE2_ZONING_Q2.deltas[0]
        : raw.PAGE2_ZONING_Q2.firstX + raw.PAGE2_ZONING_Q2.deltas[1];

    page.drawText("X", { x, y: raw.PAGE2_ZONING_Q2.y, size: 11, font });
  }

  // --------------------------------------------------
  // Flood Q3 Main (0=YES, 1=NO, 2=UNKNOWN)
  // --------------------------------------------------
  if (data.page2Flood?.q3Main !== undefined) {
    const x =
      data.page2Flood.q3Main === 0
        ? raw.PAGE2_FLOOD_Q3_MAIN.firstX
        : data.page2Flood.q3Main === 1
        ? raw.PAGE2_FLOOD_Q3_MAIN.firstX + raw.PAGE2_FLOOD_Q3_MAIN.deltas[0]
        : raw.PAGE2_FLOOD_Q3_MAIN.firstX + raw.PAGE2_FLOOD_Q3_MAIN.deltas[1];

    page.drawText("X", { x, y: raw.PAGE2_FLOOD_Q3_MAIN.y, size: 11, font });
  }

  // --------------------------------------------------
  // Flood Q3 Types — multi-select array of indices
  // --------------------------------------------------
  if (data.page2Flood?.q3Types) {
    data.page2Flood.q3Types.forEach((index) => {
      let x = raw.PAGE2_FLOOD_Q3_TYPES.firstX;
      if (index > 0) {
        x = raw.PAGE2_FLOOD_Q3_TYPES.firstX + raw.PAGE2_FLOOD_Q3_TYPES.deltas[index - 1];
      }
      page.drawText("X", { x, y: raw.PAGE2_FLOOD_Q3_TYPES.y, size: 11, font });
    });
  }

  // --------------------------------------------------
  // Flood Q3 Municipal (0=YES, 1=NO)
  // --------------------------------------------------
  if (data.page2Flood?.q3Municipal !== undefined) {
    const x =
      data.page2Flood.q3Municipal === 0
        ? raw.PAGE2_FLOOD_Q3_MUNICIPAL.firstX
        : raw.PAGE2_FLOOD_Q3_MUNICIPAL.firstX + raw.PAGE2_FLOOD_Q3_MUNICIPAL.deltas[0];

    page.drawText("X", { x, y: raw.PAGE2_FLOOD_Q3_MUNICIPAL.y, size: 11, font });
  }

  // --------------------------------------------------
  // Flood Q4 (0=YES, 1=NO)
  // --------------------------------------------------
  if (data.page2Flood?.q4 !== undefined) {
    const x =
      data.page2Flood.q4 === 0
        ? raw.PAGE2_FLOOD_Q4.firstX
        : raw.PAGE2_FLOOD_Q4.firstX + raw.PAGE2_FLOOD_Q4.deltas[0];

    page.drawText("X", { x, y: raw.PAGE2_FLOOD_Q4.y, size: 11, font });
  }

  // --------------------------------------------------
  // Flood Q5
  // --------------------------------------------------
  if (data.page2Flood?.q5) {
    const x =
      data.page2Flood.q5 === "YES"
        ? raw.PAGE2_FLOOD_VERTICAL_COLUMNS.YES
        : raw.PAGE2_FLOOD_VERTICAL_COLUMNS.NO;

    page.drawText("X", { x, y: raw.PAGE2_FLOOD_Q5_Y, size: 11, font });
  }

  // --------------------------------------------------
  // Flood Q6
  // --------------------------------------------------
  if (data.page2Flood?.q6) {
    const x =
      data.page2Flood.q6 === "YES"
        ? raw.PAGE2_FLOOD_VERTICAL_COLUMNS.YES
        : raw.PAGE2_FLOOD_VERTICAL_COLUMNS.NO;

    page.drawText("X", { x, y: raw.PAGE2_FLOOD_Q6_Y, size: 11, font });
  }
}