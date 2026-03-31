import { NextRequest, NextResponse } from "next/server";
import { generateDisclosurePDF } from "@/src/lib/disclosure-engine/generateDisclosurePDF";
import { validateDisclosureInput } from "@/src/lib/disclosure-engine/validation/validateDisclosure";
import { DisclosureInput } from "@/src/lib/disclosure-engine/schema/disclosure.schema";

function toNum(v: unknown): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return Number.isNaN(n) ? undefined : n;
}

/**
 * RHF + wizard payloads may come as:
 * - sparse arrays
 * - numeric string-key objects
 * - nested records
 *
 * This safely normalizes everything into:
 * Record<number, value>
 */
function normalizeIndexedRecord<T>(
  obj: unknown
): Record<number, T> | undefined {
  if (!obj) return undefined;

  // numeric-string keyed object support
  if (typeof obj === "object" && !Array.isArray(obj)) {
    const entries = Object.entries(obj as Record<string, T>)
      .filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      )
      .map(([key, value]) => [Number(key), value] as const)
      .filter(([key]) => !Number.isNaN(key));

    return entries.length
      ? Object.fromEntries(entries)
      : undefined;
  }

  // sparse array support
  if (Array.isArray(obj)) {
    const entries = obj
      .map((value, index) => [index, value] as const)
      .filter(
        ([, value]) =>
          value !== undefined &&
          value !== null &&
          value !== ""
      );

    return entries.length
      ? Object.fromEntries(entries)
      : undefined;
  }

  return undefined;
}

function coerce(data: any): DisclosureInput {
  // Appliances arrive as a single merged record from page.tsx handleCompleted.
  // Step2AppliancesPrimary uses indexes 0–11.
  // Step3AppliancesExtended uses indexes 12–26.
  // No remapping needed here — just normalize whatever comes in.
  const appliances =
    normalizeIndexedRecord(data.appliances) ?? {};

  return {
    ...data,
    version: "01-01-2026",

    appliances,

    sellerOccupying: toNum(data.sellerOccupying) as 0 | 1,

    questions: normalizeIndexedRecord(data.questions),

    inlineOptions: data.inlineOptions
      ? {
          ...data.inlineOptions,
          waterHeaterType: toNum(
            data.inlineOptions.waterHeaterType
          ),
          waterSoftenerType: toNum(
            data.inlineOptions.waterSoftenerType
          ),
          acType: toNum(data.inlineOptions.acType),
          heatingType: toNum(
            data.inlineOptions.heatingType
          ),
          gasSupplyType: toNum(
            data.inlineOptions.gasSupplyType
          ),
          propaneTankType: toNum(
            data.inlineOptions.propaneTankType
          ),
          generatorType: toNum(
            data.inlineOptions.generatorType
          ),
          waterSourceType: toNum(
            data.inlineOptions.waterSourceType
          ),
          securitySystemType: toNum(
            data.inlineOptions.securitySystemType
          ),
          solarPanelType: toNum(
            data.inlineOptions.solarPanelType
          ),
        }
      : undefined,

    sewerSystem: data.sewerSystem
      ? {
          type: toNum(data.sewerSystem.type) as 0 | 1,
          privateType: toNum(
            data.sewerSystem.privateType
          ) as 0 | 1 | 2,
        }
      : undefined,

    q41Inline: data.q41Inline
      ? {
          ...data.q41Inline,
          payableType: toNum(
            data.q41Inline.payableType
          ) as 0 | 1 | 2,
        }
      : undefined,

    q46Inline: data.q46Inline
      ? {
          ...data.q46Inline,
          payableType: toNum(
            data.q46Inline.payableType
          ) as 0 | 1 | 2,
        }
      : undefined,

    q37Inline: toNum(data.q37Inline) as 0 | 1,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const normalized = coerce(body);

    validateDisclosureInput(normalized);

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