import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";

import {
  CHECKBOX_SIZE,
  PAGE3_ROW_Y,
  PAGE3_YES_NO_COLUMNS,
  PAGE3_Q37_INLINE,
} from "../../forms/orec/2026/layout";

async function testOverlay() {
  const filePath = path.join(
    process.cwd(),
    "src/forms/orec/2026/template.pdf"
  );

  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.getPages()[2]; // Page 3

  // ==================================================
  // Render Q7–Q38 Yes/No (Skip Q16)
  // ==================================================

  Object.entries(PAGE3_ROW_Y).forEach(([key, y]) => {
    const questionNumber = Number(key);

    // Q16 has NO Yes/No checkboxes
    if (questionNumber === 16) return;

    drawVerticalYesNo(page, font, y);
  });

  // ==================================================
  // Q37 Secondary Inline Yes/No
  // ==================================================

  const q37Y = PAGE3_ROW_Y[37];
  const inlineY = q37Y - PAGE3_Q37_INLINE.offsetFromRow;

  drawTextAt(
    page,
    font,
    PAGE3_Q37_INLINE.firstX,
    inlineY
  );

  drawTextAt(
    page,
    font,
    PAGE3_Q37_INLINE.firstX +
      PAGE3_Q37_INLINE.deltaToSecond,
    inlineY
  );

  // ==================================================
  // Save
  // ==================================================

  const outputPath = path.join(
    process.cwd(),
    "src/forms/orec/2026/test-overlay.pdf"
  );

  fs.writeFileSync(outputPath, await pdfDoc.save());

  console.log("Page 3 rendered with locked Y mapping.");
}

// ==================================================
// HELPERS
// ==================================================

function drawTextAt(
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

function drawVerticalYesNo(
  page: any,
  font: any,
  y: number
) {
  drawTextAt(page, font, PAGE3_YES_NO_COLUMNS.YES, y);
  drawTextAt(page, font, PAGE3_YES_NO_COLUMNS.NO, y);
}

testOverlay();