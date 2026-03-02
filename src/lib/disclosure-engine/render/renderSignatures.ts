import fs from "fs";
import path from "path";
import { PDFPage, PDFDocument } from "pdf-lib";
import { DisclosureInput } from "../schema/disclosure.schema.js";
import { SIGNATURE_LAYOUT } from "../layout/rpcd_2026.semantic.js";

export async function renderSignatures(
  pdfDoc: PDFDocument,
  pages: PDFPage[],
  data: DisclosureInput
) {
  if (!data.signatures) return;

  if (data.signatures.sellerSignatureBase64) {
    await drawSignatureFromFile(
      pdfDoc,
      pages,
      SIGNATURE_LAYOUT.seller
    );
  }

  if (data.signatures.buyerSignatureBase64) {
    await drawSignatureFromFile(
      pdfDoc,
      pages,
      SIGNATURE_LAYOUT.buyer
    );
  }
}

async function drawSignatureFromFile(
  pdfDoc: PDFDocument,
  pages: PDFPage[],
  layout: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  }
) {
  const page = pages[layout.page];

  const imagePath = path.join(
    process.cwd(),
    "src/lib/disclosure-engine/assets/signature.jpg"
  );

  const imageBytes = fs.readFileSync(imagePath);

  const image = await pdfDoc.embedJpg(imageBytes);

  const imgWidth = image.width;
  const imgHeight = image.height;

  const scale = Math.min(
    layout.width / imgWidth,
    layout.height / imgHeight
  );

  const scaledWidth = imgWidth * scale;
  const scaledHeight = imgHeight * scale;

  const offsetX = layout.x + (layout.width - scaledWidth) / 2;
  const offsetY = layout.y + (layout.height - scaledHeight) / 2;

  page.drawImage(image, {
    x: offsetX,
    y: offsetY,
    width: scaledWidth,
    height: scaledHeight,
  });
}