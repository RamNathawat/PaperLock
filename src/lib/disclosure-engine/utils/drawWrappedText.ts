import { PDFPage, PDFFont } from "pdf-lib";

interface WrapBox {
  x: number;
  yTop: number;
  width: number;
  lineHeight: number;
  maxLines: number;
}

export function drawWrappedText(
  page: PDFPage,
  font: PDFFont,
  text: string,
  box: WrapBox,
  fontSize: number
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];

  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    const width = font.widthOfTextAtSize(
      testLine,
      fontSize
    );

    if (width > box.width) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);

  // 🚨 HARD FAIL ON OVERFLOW
  if (lines.length > box.maxLines) {
    throw new Error(
      `Explanation exceeds allowed space. Max lines: ${box.maxLines}, Required lines: ${lines.length}`
    );
  }

  lines.forEach((line, index) => {
    page.drawText(line, {
      x: box.x,
      y: box.yTop - index * box.lineHeight,
      size: fontSize,
      font,
    });
  });
}