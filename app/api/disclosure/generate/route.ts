import { NextRequest, NextResponse } from "next/server";
import { generateDisclosurePDF } from "@/src/lib/disclosure-engine/generateDisclosurePDF";
import { validateDisclosureInput } from "@/src/lib/disclosure-engine/validation/validateDisclosure";
import { DisclosureInput } from "@/src/lib/disclosure-engine/schema/disclosure.schema";

function toNum(v: any): number | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  const n = Number(v);
  return isNaN(n) ? undefined : n;
}

function normalizeRecord(obj: any) {
  if (!obj) return undefined;
  if (Array.isArray(obj)) {
    return Object.fromEntries(
      obj
        .map((v, i) => [i, v])
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
  }
  return obj;
}

function coerce(data: any): DisclosureInput {
  return {
    ...data,
    version: "01-01-2026",

    sellerOccupying: toNum(data.sellerOccupying) as 0 | 1,

    appliances: normalizeRecord(data.appliances),

    questions: normalizeRecord(data.questions),

    inlineOptions: data.inlineOptions
      ? {
          ...data.inlineOptions,
          waterHeaterType: toNum(data.inlineOptions.waterHeaterType),
          waterSoftenerType: toNum(data.inlineOptions.waterSoftenerType),
          acType: toNum(data.inlineOptions.acType),
          heatingType: toNum(data.inlineOptions.heatingType),
          gasSupplyType: toNum(data.inlineOptions.gasSupplyType),
          propaneTankType: toNum(data.inlineOptions.propaneTankType),
          generatorType: toNum(data.inlineOptions.generatorType),
          waterSourceType: toNum(data.inlineOptions.waterSourceType),
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
          privateType: toNum(data.sewerSystem.privateType) as
            | 0
            | 1
            | 2,
        }
      : undefined,

    q41Inline: data.q41Inline
      ? {
          ...data.q41Inline,
          payableType: toNum(data.q41Inline.payableType) as
            | 0
            | 1
            | 2,
        }
      : undefined,

    q46Inline: data.q46Inline
      ? {
          ...data.q46Inline,
          payableType: toNum(data.q46Inline.payableType) as
            | 0
            | 1
            | 2,
        }
      : undefined,

    q47Details: data.q47Details
      ? {
          ...data.q47Details,
          utilities: Array.isArray(data.q47Details.utilities)
            ? data.q47Details.utilities
                .map((v: any) => toNum(v))
                .filter((v: any) => v !== undefined)
            : [],
        }
      : undefined,

    page2Zoning: data.page2Zoning
      ? {
          ...data.page2Zoning,
          historicalDistrict: toNum(
            data.page2Zoning.historicalDistrict
          ) as 0 | 1 | 2,
        }
      : undefined,

    page2Flood: data.page2Flood
      ? {
          ...data.page2Flood,
          q3Main: toNum(data.page2Flood.q3Main) as
            | 0
            | 1
            | 2,
          q3Types: Array.isArray(data.page2Flood.q3Types)
            ? data.page2Flood.q3Types
                .map((v: any) => toNum(v))
                .filter((v: any) => v !== undefined)
            : undefined,
          q3Municipal: toNum(
            data.page2Flood.q3Municipal
          ) as 0 | 1 | 2,
          q4: toNum(data.page2Flood.q4) as 0 | 1 | 2,
        }
      : undefined,

    q37Inline: toNum(data.q37Inline) as 0 | 1,
  };
}

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

  const data = coerce(raw);

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
        "Content-Disposition":
          'attachment; filename="disclosure.pdf"',
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