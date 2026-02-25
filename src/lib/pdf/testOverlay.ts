import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

import {
  PROPERTY_IDENTIFIER,
  APPLIANCE_COLUMNS,
  APPLIANCE_FIRST_ROW_Y,
  APPLIANCE_ROW_SPACING,
} from "../../forms/orec/2026/layout";

async function testOverlay() {
  const filePath = path.join(
    process.cwd(),
    "src/forms/orec/2026/template.pdf"
  );

  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();
  const page = pages[0];

  const TOTAL_ROWS = 19;
  const SEWER_ROW_INDEX = 9;

  const SEWER_ROW_Y = 202.5;       // Your locked sewer value
  const POST_SEWER_OFFSET = 13;  

  for (let rowIndex = 0; rowIndex < TOTAL_ROWS; rowIndex++) {

    const baseY =
      APPLIANCE_FIRST_ROW_Y -
      rowIndex * APPLIANCE_ROW_SPACING;

    let rowY = baseY;

    if (rowIndex === SEWER_ROW_INDEX) {
      rowY = SEWER_ROW_Y; // Lock sewer precisely
    }

    if (rowIndex > SEWER_ROW_INDEX) {
      rowY = baseY - POST_SEWER_OFFSET;
    }

    renderRow(page, font, rowY);
  }

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

  const newPdfBytes = await pdfDoc.save();
  fs.writeFileSync(outputPath, newPdfBytes);

  console.log("Page 1 rendered with final calibrated sewer adjustment.");
}

function renderRow(page: any, font: any, rowY: number) {
  const CHECKBOX_VERTICAL_ADJUST = 0.5;

  page.drawText("X", {
    x: APPLIANCE_COLUMNS.WORKING,
    y: rowY - CHECKBOX_VERTICAL_ADJUST,
    size: 11,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText("X", {
    x: APPLIANCE_COLUMNS.NOT_WORKING,
    y: rowY - CHECKBOX_VERTICAL_ADJUST,
    size: 11,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText("X", {
    x: APPLIANCE_COLUMNS.DO_NOT_KNOW,
    y: rowY - CHECKBOX_VERTICAL_ADJUST,
    size: 11,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText("X", {
    x: APPLIANCE_COLUMNS.NONE,
    y: rowY - CHECKBOX_VERTICAL_ADJUST,
    size: 11,
    font,
    color: rgb(0, 0, 0),
  });
}

testOverlay();