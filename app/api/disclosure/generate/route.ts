import { NextRequest, NextResponse } from "next/server";
import { generateDisclosurePDF } from "@/src/lib/disclosure-engine/generateDisclosurePDF";
import { validateDisclosureInput } from "@/src/lib/disclosure-engine/validation/validateDisclosure";
import { DisclosureInput } from "@/src/lib/disclosure-engine/schema/disclosure.schema";

import { normalizeDisclosureData } from "@/src/lib/disclosure-engine/utils/normalizeDisclosureData";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const normalized = normalizeDisclosureData(body) as DisclosureInput;

    /**
     * Preview should never block on validation
     */
    if (!body.isPreview) {
      validateDisclosureInput(normalized);
    }

    const pdfBuffer = await generateDisclosurePDF(
      normalized
    );

    /**
     * Next.js 16 requires Uint8Array / ArrayBuffer
     * instead of raw Node Buffer
     */
    const pdfBytes = new Uint8Array(pdfBuffer);

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="oklahoma-disclosure.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unknown PDF generation error",
      },
      { status: 500 }
    );
  }
}