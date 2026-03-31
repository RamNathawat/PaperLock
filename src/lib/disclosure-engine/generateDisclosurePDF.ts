import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";

import { DisclosureInput } from "./schema/disclosure.schema";
import { validateDisclosureInput } from "./validation/validateDisclosure";

import { renderPropertyIdentifier } from "./render/renderPropertyIdentifier";
import { renderAppliances } from "./render/renderAppliances";
import { renderInlineOptions } from "./render/renderInlineOptions";
import { renderSewerInline } from "./render/renderSewerInline";
import { renderPage2 } from "./render/renderPage2";
import { renderQuestions } from "./render/renderQuestions";
import { renderQ37Inline } from "./render/renderQ37Inline";
import { renderQ41Q46Inline } from "./render/renderQ41Q46Inline";
import { renderQ47Inline } from "./render/renderQ47Inline";
import { renderCheckboxes } from "./render/renderCheckboxes";
import { renderTextFields } from "./render/renderTextFields";
import { renderExplanations } from "./render/renderExplanations";
import { renderSignatures } from "./render/renderSignatures";

export async function generateDisclosurePDF(
  data: DisclosureInput
): Promise<Buffer> {
  if (data.version !== "01-01-2026") {
    throw new Error("Unsupported disclosure version");
  }

  validateDisclosureInput(data);

  const templatePath = path.join(
    process.cwd(),
    "src/forms/orec/2026/template.pdf"
  );

  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  /**
   * 1) Broad global renderers FIRST
   * These are most likely to affect multiple pages.
   */
  renderCheckboxes(pages, font, data);
  renderTextFields(pages, font, data);
  renderExplanations(pages, font, data);

  /**
   * 2) Precise page renderers AFTER
   * These should win final coordinate collisions.
   */

  // PAGE 1
  renderPropertyIdentifier(pages, font, data);
  renderAppliances(pages, font, data);
  renderInlineOptions(pages, font, data);
  renderSewerInline(pages, font, data);

  // PAGE 2
  renderPage2(pages, font, data);

  // PAGE 3–4
  renderQuestions(pages, font, data);
  renderQ37Inline(pages, font, data);
  renderQ41Q46Inline(pages, font, data);
  renderQ47Inline(pages, font, data);

  /**
   * 3) Signatures always LAST
   */
  await renderSignatures(pdfDoc, pages, font, data);

  const finalBytes = await pdfDoc.save();
  return Buffer.from(finalBytes);
}