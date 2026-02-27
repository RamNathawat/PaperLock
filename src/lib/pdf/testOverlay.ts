import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";

import {
  APPLIANCE_COLUMNS,
  PAGE2_ROW_Y,
  PAGE2_SECURITY_INLINE,
  PAGE2_SOLAR_INLINE,
  CHECKBOX_SIZE,
} from "../../forms/orec/2026/layout";

async function testOverlay() {
  const filePath = path.join(
    process.cwd(),
    "src/forms/orec/2026/template.pdf"
  );

  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.getPages()[1];

  // ----------------------------------
  // Render Matrix Column (Working only)
  // ----------------------------------

  Object.entries(PAGE2_ROW_Y).forEach(([index, y]) => {
    page.drawText("X", {
      x: APPLIANCE_COLUMNS.WORKING,
      y,
      size: CHECKBOX_SIZE,
      font,
    });
  });

  // ----------------------------------
  // SECURITY INLINE (4 BOXES)
  // ----------------------------------

  drawQuadRowInline(page, font, PAGE2_SECURITY_INLINE);

  // ----------------------------------
  // SOLAR PANELS INLINE (3 BOXES)
  // ----------------------------------

  drawTripleRowInline(page, font, PAGE2_SOLAR_INLINE);

  const outputPath = path.join(
    process.cwd(),
    "src/forms/orec/2026/test-overlay.pdf"
  );

  fs.writeFileSync(outputPath, await pdfDoc.save());

  console.log("Page 2 rendered using locked row Y map.");
}

// --------------------------------------
// Generic Inline Drawers
// --------------------------------------

function drawInline(
  page: any,
  font: any,
  x: number,
  y: number
) {
  page.drawText("X", {
    x,
    y,
    size: CHECKBOX_SIZE,
    font,
  });
}

function drawTripleRowInline(
  page: any,
  font: any,
  config: any
) {
  const y = PAGE2_ROW_Y[config.rowIndex];

  drawInline(page, font, config.firstX, y);
  drawInline(page, font, config.firstX + config.deltaToSecond, y);
  drawInline(page, font, config.firstX + config.deltaToThird, y);
}

function drawQuadRowInline(
  page: any,
  font: any,
  config: any
) {
  const y = PAGE2_ROW_Y[config.rowIndex];

  drawInline(page, font, config.firstX, y);
  drawInline(page, font, config.firstX + config.deltaToSecond, y);
  drawInline(page, font, config.firstX + config.deltaToThird, y);
  drawInline(page, font, config.firstX + config.deltaToFourth, y);
}

testOverlay();