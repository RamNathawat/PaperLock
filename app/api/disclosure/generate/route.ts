import { NextRequest, NextResponse } from "next/server";
import { generateDisclosurePDF } from "@/src/lib/disclosure-engine/generateDisclosurePDF";
import { validateDisclosureInput } from "@/src/lib/disclosure-engine/validation/validateDisclosure";
import { DisclosureInput } from "@/src/lib/disclosure-engine/schema/disclosure.schema";

export async function POST(req: NextRequest) {
    // --------------------------------------------------
    // Parse body
    // --------------------------------------------------
    let data: DisclosureInput;

    try {
        data = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }

    // --------------------------------------------------
    // Validate
    // --------------------------------------------------
    try {
        validateDisclosureInput(data);
    } catch (e: any) {
        return NextResponse.json(
            { error: e.message },
            { status: 422 }
        );
    }

    // --------------------------------------------------
    // Generate PDF
    // --------------------------------------------------
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