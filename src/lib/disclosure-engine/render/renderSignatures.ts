import { PDFPage, PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import { DisclosureInput } from "../schema/disclosure.schema";
import { SIGNATURE_LAYOUT } from "../layout/rpcd_2026.semantic";
import * as raw from "../../../forms/orec/2026/layout";

export async function renderSignatures(
  pdfDoc: PDFDocument,
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput
) {
  if (data.signatures?.sellerSignatureBase64) {
    await drawSignatureFromBase64(
      pdfDoc,
      pages,
      SIGNATURE_LAYOUT.seller,
      data.signatures.sellerSignatureBase64
    );
  }

  if (data.signatures?.seller2SignatureBase64) {
    await drawSignatureFromBase64(
      pdfDoc,
      pages,
      SIGNATURE_LAYOUT.seller2,
      data.signatures.seller2SignatureBase64
    );
  }

  // Buyer signature removed per workflow requirements

  const extraPages = pages.length - 5;
  const page5 = pages[4];
  
  if (page5) {
    if (extraPages > 0) {
      // YES check
      page5.drawText("X", {
        x: Number(raw.PAGE5_ADDITIONAL_PAGES.yesX),
        y: Number(raw.PAGE5_ADDITIONAL_PAGES.y),
        size: raw.CHECKBOX_SIZE,
        font,
      });
      // Page count
      page5.drawText(String(extraPages), {
        x: Number(raw.PAGE5_ADDITIONAL_PAGES.howManyX),
        y: Number(raw.PAGE5_ADDITIONAL_PAGES.y),
        size: 10,
        font,
      });
    } else {
      // NO check
      page5.drawText("X", {
        x: Number(raw.PAGE5_ADDITIONAL_PAGES.noX),
        y: Number(raw.PAGE5_ADDITIONAL_PAGES.y),
        size: raw.CHECKBOX_SIZE,
        font,
      });
    }
  }

  if (data.initials) {
    pages.forEach((page, pageIndex) => {
      const isLastPage = pageIndex === pages.length - 1;
      const coords = isLastPage
        ? raw.PAGE5_INITIALS_BOXES
        : raw.PAGE_INITIALS_DEFAULT;

      const safeY = Number(coords.y);
      if (!Number.isFinite(safeY)) return;

      const drawCenteredInitial = (text: string, baseX: number) => {
        const size = 10;
        const textWidth = font.widthOfTextAtSize(text, size);
        // baseX is roughly the left margin of a box designed for 1-2 characters.
        // The visual center of the targeted 15pt wide initials box is about baseX + 5
        const center = baseX + 5;
        page.drawText(text, {
          x: center - textWidth / 2,
          y: safeY,
          size,
          font,
        });
      };

      if (data.initials?.buyerInitial1) {
        drawCenteredInitial(data.initials.buyerInitial1, Number(coords.buyer1X));
      }

      if (data.initials?.buyerInitial2) {
        drawCenteredInitial(data.initials.buyerInitial2, Number(coords.buyer2X));
      }

      if (data.initials?.sellerInitial1) {
        drawCenteredInitial(data.initials.sellerInitial1, Number(coords.seller1X));
      }

      if (data.initials?.sellerInitial2) {
        drawCenteredInitial(data.initials.sellerInitial2, Number(coords.seller2X));
      }
    });
  }
}

async function drawSignatureFromBase64(
  pdfDoc: PDFDocument,
  pages: PDFPage[],
  layout: {
    page: number;
    x: number;
    y: number;
    width: number;
    height: number;
  },
  base64: string
) {
  const page = pages[layout.page];
  if (!page) return;

  // The base64 from react-signature-canvas includes "data:image/png;base64,"
  const base64Data = base64.includes("base64,") 
    ? base64.split("base64,")[1] 
    : base64;

  const imageBytes = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));

  let image;
  try {
    image = await pdfDoc.embedPng(imageBytes);
  } catch {
    image = await pdfDoc.embedJpg(imageBytes);
  }

  const scale = Math.min(
    layout.width / image.width,
    layout.height / image.height
  );

  const scaledWidth = image.width * scale;
  const scaledHeight = image.height * scale;

  const offsetX = Number(layout.x) + (layout.width - scaledWidth) / 2;
  const offsetY = Number(layout.y) + (layout.height - scaledHeight) / 2;

  if (!Number.isFinite(offsetX) || !Number.isFinite(offsetY)) return;

  page.drawImage(image, {
    x: offsetX,
    y: offsetY,
    width: scaledWidth,
    height: scaledHeight,
  });
}