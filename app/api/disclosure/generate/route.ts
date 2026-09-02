import { NextRequest, NextResponse } from "next/server";
import { generateDisclosurePDF } from "@/src/lib/disclosure-engine/generateDisclosurePDF";
import { validateDisclosureInput } from "@/src/lib/disclosure-engine/validation/validateDisclosure";
import { DisclosureInput } from "@/src/lib/disclosure-engine/schema/disclosure.schema";

import { normalizeDisclosureData } from "@/src/lib/disclosure-engine/utils/normalizeDisclosureData";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // Inject the version if missing — stored form_data from the DB may not
    // have it (it's only added by buildCleanPayload during the wizard flow).
    const body = { version: "01-01-2026", ...rawBody };

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