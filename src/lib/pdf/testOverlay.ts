import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";

import {
  CHECKBOX_SIZE,
  PAGE3_ROW_Y,
  PAGE3_YES_NO_COLUMNS,
  PAGE3_Q37_INLINE,
  PAGE4_ROW_Y,
  PAGE4_YES_NO_COLUMNS,
  PAGE4_Q41_PAYABLE,
  PAGE4_Q41_UNPAID,
  PAGE4_Q46_PAYABLE,
  PAGE4_Q47_UTILITIES,
  PAGE4_TEXT_FIELDS,
  PAGE4_EXPLANATION_BOX,
  PAGE4_INITIALS,
  PAGE5_YES_NO,
  PAGE5_SIGNATURES,
  PAGE5_INITIALS,
} from "../../forms/orec/2026/layout";

async function testOverlay() {
  const filePath = path.join(process.cwd(), "src/forms/orec/2026/template.pdf");
  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // ==================================================
  // PAGE 3
  // ==================================================

  const page3 = pdfDoc.getPages()[2];

  Object.entries(PAGE3_ROW_Y).forEach(([key, y]) => {
    if (Number(key) === 16) return;
    drawVerticalYesNo(page3, font, y, PAGE3_YES_NO_COLUMNS);
  });

  const q37Y = PAGE3_ROW_Y[37];
  const inlineY = q37Y - PAGE3_Q37_INLINE.offsetFromRow;

  drawText(page3, font, PAGE3_Q37_INLINE.firstX, inlineY);
  drawText(page3, font, PAGE3_Q37_INLINE.firstX + PAGE3_Q37_INLINE.deltaToSecond, inlineY);

  // ==================================================
  // PAGE 4
  // ==================================================

  const page4 = pdfDoc.getPages()[3];

  Object.values(PAGE4_ROW_Y).forEach((y) => {
    drawVerticalYesNo(page4, font, y, PAGE4_YES_NO_COLUMNS);
  });

  drawTriple(page4, font, PAGE4_Q41_PAYABLE);
  drawDouble(page4, font, PAGE4_Q41_UNPAID);
  drawTriple(page4, font, PAGE4_Q46_PAYABLE);
  drawMulti(page4, font, PAGE4_Q47_UTILITIES);

  // Text Samples (Calibration)
  drawTextValue(page4, font, "250", PAGE4_TEXT_FIELDS.q41AmountOfDues);
  drawTextValue(page4, font, "100", PAGE4_TEXT_FIELDS.q41SpecialAssessment);
  drawTextValue(page4, font, "500", PAGE4_TEXT_FIELDS.q41IfYesAmount);
  drawTextValue(page4, font, "John Smith", PAGE4_TEXT_FIELDS.q41ManagerName);
  drawTextValue(page4, font, "555-1234", PAGE4_TEXT_FIELDS.q41Phone);
  drawTextValue(page4, font, "300", PAGE4_TEXT_FIELDS.q46Amount);
  drawTextValue(page4, font, "City Fire Dept", PAGE4_TEXT_FIELDS.q46PaidTo);
  drawTextValue(page4, font, "Utility Co-op", PAGE4_TEXT_FIELDS.q47IfOtherExplain);
  drawTextValue(page4, font, "1000", PAGE4_TEXT_FIELDS.q47InitialMembership);
  drawTextValue(page4, font, "350", PAGE4_TEXT_FIELDS.q47AnnualMembership);

  drawMultiline(page4, font, "Sample explanation text for Page 4.", PAGE4_EXPLANATION_BOX);

  drawInitials(page4, font, "AB", PAGE4_INITIALS.buyerX, PAGE4_INITIALS.y);
  drawInitials(page4, font, "CD", PAGE4_INITIALS.sellerX, PAGE4_INITIALS.y);

  // ==================================================
  // PAGE 5
  // ==================================================

  const page5 = pdfDoc.getPages()[4];

  drawText(page5, font, PAGE5_YES_NO.firstX, PAGE5_YES_NO.y);
  drawText(page5, font, PAGE5_YES_NO.firstX + PAGE5_YES_NO.deltaToSecond, PAGE5_YES_NO.y);

  drawTextValue(page5, font, "Seller Sig 1", PAGE5_SIGNATURES.seller1);
  drawTextValue(page5, font, "Seller Sig 2", PAGE5_SIGNATURES.seller2);
  drawTextValue(page5, font, "Buyer Sig 1", PAGE5_SIGNATURES.buyer1);
  drawTextValue(page5, font, "Buyer Sig 2", PAGE5_SIGNATURES.buyer2);

  drawInitials(page5, font, "AB", PAGE5_INITIALS.buyerX, PAGE5_INITIALS.y);
  drawInitials(page5, font, "CD", PAGE5_INITIALS.sellerX, PAGE5_INITIALS.y);

  fs.writeFileSync(
    path.join(process.cwd(), "src/forms/orec/2026/test-overlay.pdf"),
    await pdfDoc.save()
  );

  console.log("Pages 3–5 rendered.");
}

// ==================================================
// HELPERS
// ==================================================

function drawText(page: any, font: any, x: number, y: number) {
  page.drawText("X", { x, y, size: CHECKBOX_SIZE, font });
}

function drawVerticalYesNo(page: any, font: any, y: number, cols: any) {
  drawText(page, font, cols.YES, y);
  drawText(page, font, cols.NO, y);
}

function drawTriple(page: any, font: any, config: any) {
  drawText(page, font, config.firstX, config.y);
  drawText(page, font, config.firstX + config.deltaToSecond, config.y);
  drawText(page, font, config.firstX + config.deltaToThird, config.y);
}

function drawDouble(page: any, font: any, config: any) {
  drawText(page, font, config.firstX, config.y);
  drawText(page, font, config.firstX + config.deltaToSecond, config.y);
}

function drawMulti(page: any, font: any, config: any) {
  drawText(page, font, config.firstX, config.y);
  config.deltas.forEach((d: number) => drawText(page, font, config.firstX + d, config.y));
}

function drawTextValue(page: any, font: any, value: string, pos: any) {
  page.drawText(value, { x: pos.x, y: pos.y, size: 10, font });
}

function drawMultiline(page: any, font: any, text: string, box: any) {
  let y = box.yTop;
  text.split("\n").forEach(line => {
    page.drawText(line, { x: box.x, y, size: 10, font });
    y -= box.lineHeight;
  });
}

function drawInitials(page: any, font: any, value: string, x: number, y: number) {
  page.drawText(value, { x, y, size: 10, font });
}

testOverlay();