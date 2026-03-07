import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";

import { DisclosureInput } from "./schema/disclosure.schema.js";
import { validateDisclosureInput } from "./validation/validateDisclosure.js";

import { renderPropertyIdentifier } from "./render/renderPropertyIdentifier.js";
import { renderAppliances } from "./render/renderAppliances.js";
import { renderInlineOptions } from "./render/renderInlineOptions.js";
import { renderSewerInline } from "./render/renderSewerInline.js";
import { renderPage2 } from "./render/renderPage2.js";
import { renderQuestions } from "./render/renderQuestions.js";
import { renderQ37Inline } from "./render/renderQ37Inline.js";
import { renderQ41Q46Inline } from "./render/renderQ41Q46Inline.js";
import { renderQ47Inline } from "./render/renderQ47Inline.js";
import { renderCheckboxes } from "./render/renderCheckboxes.js";
import { renderTextFields } from "./render/renderTextFields.js";
import { renderExplanations } from "./render/renderExplanations.js";
import { renderSignatures } from "./render/renderSignatures.js";

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

  // TEXT + FINANCIAL
  renderCheckboxes(pages, font, data);
  renderTextFields(pages, font, data);
  renderExplanations(pages, font, data);

  // SIGNATURES + INITIALS
  await renderSignatures(pdfDoc, pages, font, data);

  const finalBytes = await pdfDoc.save();
  return Buffer.from(finalBytes);
}