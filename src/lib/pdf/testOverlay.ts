import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import {
  PROPERTY_IDENTIFIER,
  APPLIANCE_COLUMNS,
  APPLIANCE_FIRST_ROW_Y,
  APPLIANCE_ROW_SPACING,
  SEWER_INLINE,
  SEPTIC_INLINE,
  WATER_HEATER_INLINE,
  WATER_SOFTENER_INLINE,
  AC_INLINE,
  HEATING_INLINE,
  GAS_SUPPLY_INLINE,
  PROPANE_TANK_INLINE,
} from "../../forms/orec/2026/layout";

async function testOverlay() {
  const filePath = path.join(
    process.cwd(),
    "src/forms/orec/2026/template.pdf"
  );

  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.getPages()[0];

  const TOTAL_ROWS = 19;
  const SEWER_ROW_INDEX = 9;
  const SEWER_ROW_Y = 202.5;
  const POST_SEWER_OFFSET = 12.5;

  // ----------------------------------
  // Single Source of Truth: Row Y Resolver
  // ----------------------------------

  function resolveRowY(rowIndex: number): number {
    const baseY =
      APPLIANCE_FIRST_ROW_Y -
      rowIndex * APPLIANCE_ROW_SPACING;

    if (rowIndex === SEWER_ROW_INDEX) {
      return SEWER_ROW_Y;
    }

    if (rowIndex > SEWER_ROW_INDEX) {
      return baseY - POST_SEWER_OFFSET;
    }

    return baseY;
  }

  // ----------------------------------
  // Render Appliance Matrix
  // ----------------------------------

  for (let i = 0; i < TOTAL_ROWS; i++) {
    renderMatrixRow(page, font, resolveRowY(i));
  }

  // ----------------------------------
  // Sewer Inline (Public / Private)
  // ----------------------------------

  const sewerPrivateX =
    SEWER_INLINE.publicX + SEWER_INLINE.deltaToPrivate;

  drawInline(page, font, SEWER_INLINE.publicX, SEWER_INLINE.y, SEWER_INLINE.size);
  drawInline(page, font, sewerPrivateX, SEWER_INLINE.y, SEWER_INLINE.size);

  // ----------------------------------
  // Septic Inline (Static Y)
  // ----------------------------------

  drawTripleStaticInline(page, font, SEPTIC_INLINE);

  // ----------------------------------
  // Row-Based Inline Groups
  // ----------------------------------

  drawTripleRowInline(page, font, WATER_HEATER_INLINE, resolveRowY);
  drawDoubleRowInline(page, font, WATER_SOFTENER_INLINE, resolveRowY);
  drawTripleRowInline(page, font, AC_INLINE, resolveRowY);
  drawTripleRowInline(page, font, HEATING_INLINE, resolveRowY);
  drawTripleRowInline(page, font, GAS_SUPPLY_INLINE, resolveRowY);
  drawDoubleRowInline(page, font, PROPANE_TANK_INLINE, resolveRowY);

  // ----------------------------------
  // Property Identifier
  // ----------------------------------

  page.drawText("1234 Maple Street, Tulsa OK 74103", {
    x: PROPERTY_IDENTIFIER.x,
    y: PROPERTY_IDENTIFIER.y,
    size: PROPERTY_IDENTIFIER.fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  const outputPath = path.join(
    process.cwd(),
    "src/forms/orec/2026/test-overlay.pdf"
  );

  fs.writeFileSync(outputPath, await pdfDoc.save());

  console.log("Page 1 fully rendered with all inline groups.");
}

// --------------------------------------------------
// Matrix Row Renderer
// --------------------------------------------------

function renderMatrixRow(page: any, font: any, rowY: number) {
  const size = 11;

  page.drawText("X", { x: APPLIANCE_COLUMNS.WORKING, y: rowY, size, font });
  page.drawText("X", { x: APPLIANCE_COLUMNS.NOT_WORKING, y: rowY, size, font });
  page.drawText("X", { x: APPLIANCE_COLUMNS.DO_NOT_KNOW, y: rowY, size, font });
  page.drawText("X", { x: APPLIANCE_COLUMNS.NONE, y: rowY, size, font });
}

// --------------------------------------------------
// Generic Inline Drawer
// --------------------------------------------------

function drawInline(
  page: any,
  font: any,
  x: number,
  y: number,
  size: number
) {
  page.drawText("X", { x, y, size, font });
}

// --------------------------------------------------
// Static Triple Inline (For Septic row)
// --------------------------------------------------

function drawTripleStaticInline(page: any, font: any, config: any) {
  const secondX = config.firstX + config.deltaToSecond;
  const thirdX = config.firstX + config.deltaToThird;

  drawInline(page, font, config.firstX, config.y, config.size);
  drawInline(page, font, secondX, config.y, config.size);
  drawInline(page, font, thirdX, config.y, config.size);
}

// --------------------------------------------------
// Row-Based Double Inline
// --------------------------------------------------

function drawDoubleRowInline(
  page: any,
  font: any,
  config: any,
  resolveRowY: (i: number) => number
) {
  const y = resolveRowY(config.rowIndex);
  const secondX = config.firstX + config.deltaToSecond;

  drawInline(page, font, config.firstX, y, config.size);
  drawInline(page, font, secondX, y, config.size);
}

// --------------------------------------------------
// Row-Based Triple Inline
// --------------------------------------------------

function drawTripleRowInline(
  page: any,
  font: any,
  config: any,
  resolveRowY: (i: number) => number
) {
  const y = resolveRowY(config.rowIndex);
  const secondX = config.firstX + config.deltaToSecond;
  const thirdX = config.firstX + config.deltaToThird;

  drawInline(page, font, config.firstX, y, config.size);
  drawInline(page, font, secondX, y, config.size);
  drawInline(page, font, thirdX, y, config.size);
}

testOverlay();