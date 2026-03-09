import fs from "fs";
import path from "path";
import { PDFPage, PDFDocument, PDFFont } from "pdf-lib";
import { DisclosureInput } from "../schema/disclosure.schema";
import { SIGNATURE_LAYOUT } from "../layout/rpcd_2026.semantic";
import * as raw from "../../../forms/orec/2026/layout";

export async function renderSignatures(
  pdfDoc: PDFDocument,
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput
) {
  // --------------------------------------------------
  // Signatures
  // --------------------------------------------------
  if (data.signatures?.sellerSignatureBase64) {
    await drawSignatureFromFile(pdfDoc, pages, SIGNATURE_LAYOUT.seller);
  }

  if (data.signatures?.buyerSignatureBase64) {
    await drawSignatureFromFile(pdfDoc, pages, SIGNATURE_LAYOUT.buyer);
  }

  // --------------------------------------------------
  // Additional pages question — page 5
  // --------------------------------------------------
  if (data.additionalPages) {
    const page5 = pages[4];

    const checkX =
      data.additionalPages.hasAdditionalPages === "YES"
        ? raw.PAGE5_ADDITIONAL_PAGES.yesX
        : raw.PAGE5_ADDITIONAL_PAGES.noX;

    page5.drawText("X", {
      x: checkX,
      y: raw.PAGE5_ADDITIONAL_PAGES.y,
      size: raw.CHECKBOX_SIZE,
      font,
    });

    if (
      data.additionalPages.hasAdditionalPages === "YES" &&
      data.additionalPages.howMany
    ) {
      page5.drawText(data.additionalPages.howMany, {
        x: raw.PAGE5_ADDITIONAL_PAGES.howManyX,
        y: raw.PAGE5_ADDITIONAL_PAGES.y,
        size: 10,
        font,
      });
    }
  }

  // --------------------------------------------------
  // Initials on every page — one character per box
  // --------------------------------------------------
  if (data.initials) {
    pages.forEach((page, pageIndex) => {
      const isLastPage = pageIndex === pages.length - 1;

      const coords = isLastPage
        ? raw.PAGE5_INITIALS_BOXES
        : raw.PAGE_INITIALS_DEFAULT;

      if (data.initials?.buyerInitial1) {
        page.drawText(data.initials.buyerInitial1, {
          x: coords.buyer1X,
          y: coords.y,
          size: 10,
          font,
        });
      }

      if (data.initials?.buyerInitial2) {
        page.drawText(data.initials.buyerInitial2, {
          x: coords.buyer2X,
          y: coords.y,
          size: 10,
          font,
        });
      }

      if (data.initials?.sellerInitial1) {
        page.drawText(data.initials.sellerInitial1, {
          x: coords.seller1X,
          y: coords.y,
          size: 10,
          font,
        });
      }

      if (data.initials?.sellerInitial2) {
        page.drawText(data.initials.sellerInitial2, {
          x: coords.seller2X,
          y: coords.y,
          size: 10,
          font,
        });
      }
    });
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

  const scale = Math.min(
    layout.width / image.width,
    layout.height / image.height
  );

  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;

  const offsetX = layout.x + (layout.width - scaledWidth) / 2;
  const offsetY = layout.y + (layout.height - scaledHeight) / 2;

  page.drawImage(image, {
    x: offsetX,
    y: offsetY,
    width: scaledWidth,
    height: scaledHeight,
  });
}