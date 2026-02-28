import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";

// Combined imports from your layout file
import {
  CHECKBOX_SIZE,
  // Appliance Layout
  APPLIANCE_COLUMNS,
  PAGE2_ROW_Y,
  PAGE2_SECURITY_INLINE,
  PAGE2_SOLAR_INLINE,
  // Zoning & Flood Layout
  PAGE2_ZONING_Q1_ROW1,
  PAGE2_ZONING_Q1_ROW2,
  PAGE2_ZONING_Q2,
  PAGE2_FLOOD_Q3_MAIN,
  PAGE2_FLOOD_Q3_TYPES,
  PAGE2_FLOOD_Q3_MUNICIPAL,
  PAGE2_FLOOD_Q4,
  PAGE2_FLOOD_Q5_Y,
  PAGE2_FLOOD_Q6_Y,
  PAGE2_FLOOD_VERTICAL_COLUMNS,
} from "../../forms/orec/2026/layout";

async function testOverlay() {
  const filePath = path.join(process.cwd(), "src/forms/orec/2026/template.pdf");
  const pdfBytes = fs.readFileSync(filePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.getPages()[1]; // Page 2

  // 1. APPLIANCE MATRIX (Working only)
  Object.values(PAGE2_ROW_Y).forEach((y) => {
    drawTextAt(page, font, APPLIANCE_COLUMNS.WORKING, y);
  });

  // 2. SECURITY & SOLAR (Inline logic)
  drawQuadRowInline(page, font, PAGE2_SECURITY_INLINE);
  drawTripleRowInline(page, font, PAGE2_SOLAR_INLINE);

  // 3. ZONING
  drawMultiInline(page, font, PAGE2_ZONING_Q1_ROW1);
  drawMultiInline(page, font, PAGE2_ZONING_Q1_ROW2);
  drawMultiInline(page, font, PAGE2_ZONING_Q2);

  // 4. FLOOD & WATER
  drawMultiInline(page, font, PAGE2_FLOOD_Q3_MAIN);
  drawMultiInline(page, font, PAGE2_FLOOD_Q3_TYPES);
  drawMultiInline(page, font, PAGE2_FLOOD_Q3_MUNICIPAL);
  drawMultiInline(page, font, PAGE2_FLOOD_Q4);
  
  drawVerticalYesNo(page, font, PAGE2_FLOOD_Q5_Y);
  drawVerticalYesNo(page, font, PAGE2_FLOOD_Q6_Y);

  // Save
  const outputPath = path.join(process.cwd(), "src/forms/orec/2026/test-overlay.pdf");
  fs.writeFileSync(outputPath, await pdfDoc.save());

  console.log("Page 2 fully rendered with all layout components.");
}

// ==================================================
// UNIFIED HELPERS
// ==================================================

// Basic primitive
function drawTextAt(page: any, font: any, x: number, y: number) {
  page.drawText("X", { x, y, size: CHECKBOX_SIZE, font });
}

// For configurations with a 'deltas' array (Zoning/Flood)
function drawMultiInline(page: any, font: any, config: any) {
  drawTextAt(page, font, config.firstX, config.y);
  config.deltas.forEach((delta: number) => {
    drawTextAt(page, font, config.firstX + delta, config.y);
  });
}

// For specific row-based inline boxes (Security/Solar)
function drawTripleRowInline(page: any, font: any, config: any) {
  const y = PAGE2_ROW_Y[config.rowIndex];
  drawTextAt(page, font, config.firstX, y);
  drawTextAt(page, font, config.firstX + config.deltaToSecond, y);
  drawTextAt(page, font, config.firstX + config.deltaToThird, y);
}

function drawQuadRowInline(page: any, font: any, config: any) {
  const y = PAGE2_ROW_Y[config.rowIndex];
  drawTextAt(page, font, config.firstX, y);
  drawTextAt(page, font, config.firstX + config.deltaToSecond, y);
  drawTextAt(page, font, config.firstX + config.deltaToThird, y);
  drawTextAt(page, font, config.firstX + config.deltaToFourth, y);
}

// For vertical Yes/No columns
function drawVerticalYesNo(page: any, font: any, y: number) {
  drawTextAt(page, font, PAGE2_FLOOD_VERTICAL_COLUMNS.YES, y);
  drawTextAt(page, font, PAGE2_FLOOD_VERTICAL_COLUMNS.NO, y);
}

testOverlay();