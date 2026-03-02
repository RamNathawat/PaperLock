import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { DisclosureInput } from "./schema/disclosure.schema.js";
import { renderAppliances } from "./render/renderAppliances.js";
import { renderCheckboxes } from "./render/renderCheckboxes.js";
import { renderTextFields } from "./render/renderTextFields.js";
import { renderExplanations } from "./render/renderExplanations.js";
import { renderSignatures } from "./render/renderSignatures.js";
import { validateDisclosureInput } from "./validation/validateDisclosure.js";

export async function generateDisclosurePDF(
  data: DisclosureInput
): Promise<Buffer> {

  validateDisclosureInput(data);

  const templatePath = path.join(
    process.cwd(),
    "src/forms/orec/2026/template.pdf"
  );

  const pdfBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(pdfBytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  renderAppliances(pages, font, data);
  renderCheckboxes(pages, font, data);
  renderTextFields(pages, font, data);
  renderExplanations(pages, font, data);
  await renderSignatures(pdfDoc, pages, data);

  return Buffer.from(await pdfDoc.save());
}