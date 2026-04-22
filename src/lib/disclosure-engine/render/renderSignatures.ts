import { PDFPage, PDFDocument, PDFFont } from "pdf-lib";
import { DisclosureInput } from "../schema/disclosure.schema";
import { SIGNATURE_LAYOUT } from "../layout/rpcd_2026.semantic";
import * as raw from "../../../forms/orec/2026/layout";

// Width of each initials box in points (measured from the template).
// buyer1 and buyer2 boxes are identical; same for seller1 and seller2.
const INITIALS_BOX_WIDTH = 22;
const INITIALS_SIZE = 10;

/**
 * Returns the x position that visually centers a single-character initial
 * inside its box.
 */
function centeredInitialX(
  boxLeftX: number,
  char: string,
  font: PDFFont
): number {
  const charWidth = font.widthOfTextAtSize(char, INITIALS_SIZE);
  return boxLeftX + (INITIALS_BOX_WIDTH - charWidth) / 2;
}

export async function renderSignatures(
  pdfDoc: PDFDocument,
  pages: PDFPage[],
  font: PDFFont,
  data: DisclosureInput
) {
  // ── Seller 1 signature → seller slot only ──────────────────────────────
  if (data.signatures?.sellerSignatureBase64) {
    await drawSignatureFromBase64(
      pdfDoc,
      pages,
      SIGNATURE_LAYOUT.seller,
      data.signatures.sellerSignatureBase64
    );
  }

  // ── Seller 2 signature → seller2 slot only ─────────────────────────────
  // If seller2SignatureBase64 exists use it; otherwise leave the slot blank.
  if (data.signatures?.seller2SignatureBase64) {
    await drawSignatureFromBase64(
      pdfDoc,
      pages,
      SIGNATURE_LAYOUT.seller2,
      data.signatures.seller2SignatureBase64
    );
  }

  // ── Buyer signatures (unchanged) ───────────────────────────────────────
  if (data.signatures?.buyerSignatureBase64) {
    await drawSignatureFromBase64(
      pdfDoc,
      pages,
      SIGNATURE_LAYOUT.buyer,
      data.signatures.buyerSignatureBase64
    );
    await drawSignatureFromBase64(
      pdfDoc,
      pages,
      SIGNATURE_LAYOUT.buyer2,
      data.signatures.buyerSignatureBase64
    );
  }

  // ── Additional pages checkbox ──────────────────────────────────────────
  if (data.additionalPages) {
    const page5 = pages[4];
    if (!page5) return;

    const checkX =
      data.additionalPages.hasAdditionalPages === "YES"
        ? raw.PAGE5_ADDITIONAL_PAGES.yesX
        : raw.PAGE5_ADDITIONAL_PAGES.noX;

    const numX = Number(checkX);
    if (!Number.isNaN(numX)) {
      page5.drawText("X", {
        x: numX,
        y: Number(raw.PAGE5_ADDITIONAL_PAGES.y),
        size: raw.CHECKBOX_SIZE,
        font,
      });
    }

    if (
      data.additionalPages.hasAdditionalPages === "YES" &&
      data.additionalPages.howMany
    ) {
      page5.drawText(data.additionalPages.howMany, {
        x: Number(raw.PAGE5_ADDITIONAL_PAGES.howManyX),
        y: Number(raw.PAGE5_ADDITIONAL_PAGES.y),
        size: 10,
        font,
      });
    }
  }

  // ── Initials on every page (centered within each box) ─────────────────
  if (data.initials) {
    pages.forEach((page, pageIndex) => {
      const isLastPage = pageIndex === pages.length - 1;
      const coords = isLastPage
        ? raw.PAGE5_INITIALS_BOXES
        : raw.PAGE_INITIALS_DEFAULT;

      const safeY = Number(coords.y);
      if (!Number.isFinite(safeY)) return;

      if (data.initials?.buyerInitial1) {
        page.drawText(data.initials.buyerInitial1, {
          x: centeredInitialX(coords.buyer1X, data.initials.buyerInitial1, font),
          y: safeY,
          size: INITIALS_SIZE,
          font,
        });
      }

      if (data.initials?.buyerInitial2) {
        page.drawText(data.initials.buyerInitial2, {
          x: centeredInitialX(coords.buyer2X, data.initials.buyerInitial2, font),
          y: safeY,
          size: INITIALS_SIZE,
          font,
        });
      }

      if (data.initials?.sellerInitial1) {
        page.drawText(data.initials.sellerInitial1, {
          x: centeredInitialX(coords.seller1X, data.initials.sellerInitial1, font),
          y: safeY,
          size: INITIALS_SIZE,
          font,
        });
      }

      if (data.initials?.sellerInitial2) {
        page.drawText(data.initials.sellerInitial2, {
          x: centeredInitialX(coords.seller2X, data.initials.sellerInitial2, font),
          y: safeY,
          size: INITIALS_SIZE,
          font,
        });
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

  // Strip the data URL prefix if present (e.g. "data:image/png;base64,...")
  const rawBase64 = base64.includes(",") ? base64.split(",")[1] : base64;

  const imageBytes = Uint8Array.from(atob(rawBase64), (c) => c.charCodeAt(0));

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