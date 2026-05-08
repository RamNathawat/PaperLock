import { NextRequest, NextResponse } from "next/server";
import { generateDisclosurePDF } from "@/src/lib/disclosure-engine/generateDisclosurePDF";
import { validateDisclosureInput } from "@/src/lib/disclosure-engine/validation/validateDisclosure";
import { DisclosureInput } from "@/src/lib/disclosure-engine/schema/disclosure.schema";

import { normalizeDisclosureData } from "@/src/lib/disclosure-engine/utils/normalizeDisclosureData";

export async function POST(req: NextRequest) {
  let raw: any;

  try {
    raw = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const data = normalizeDisclosureData(raw) as DisclosureInput;

  try {
    validateDisclosureInput(data);
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 422 }
    );
  }

  try {
    const pdfBuffer = await generateDisclosurePDF(data);

    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="disclosure.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message },
      { status: 500 }
    );
  }
}