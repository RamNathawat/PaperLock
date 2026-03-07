import fs from "fs";
import path from "path";
import { generateDisclosurePDF } from "./generateDisclosurePDF.js";
import { DisclosureInput } from "./schema/disclosure.schema.js";

async function run() {
  console.log("Starting test run...");

  const fullDemoData: DisclosureInput = {
    version: "01-01-2026",

    propertyIdentifier: "1234 Elm Street, Tulsa, OK 74103",

    sellerOccupying: 0,

    zoningType: "residential",

    sewerSystem: {
      type: 1,
      privateType: 0,
    },

    initials: {
      buyerInitial1: "J",
      buyerInitial2: "B",
      sellerInitial1: "M",
      sellerInitial2: "S",
    },

    additionalPages: {
      hasAdditionalPages: "YES",
      howMany: "2",
    },

    appliances: Object.fromEntries(
      Array.from({ length: 19 }, (_, i) => [
        i,
        i % 4 === 0
          ? "WORKING"
          : i % 4 === 1
          ? "NOT_WORKING"
          : i % 4 === 2
          ? "UNKNOWN"
          : "NONE",
      ])
    ),

    inlineOptions: {
      waterHeaterType: 1,
      waterSoftenerType: 0,
      acType: 2,
      heatingType: 1,
      gasSupplyType: 0,
      propaneTankType: 1,
      generatorType: 1,
      waterSourceType: 0,
      fireSuppresionDate: "01/15/2024",
    },

    page2NotWorkingExplanation:
      "Hot tub heating element requires repair. Garbage disposal not functioning.",

    questions: Object.fromEntries(
      Array.from({ length: 44 }, (_, i) => [
        i + 7,
        i % 2 === 0 ? "YES" : "NO",
      ])
    ),

    page3TextFields: {
      roofAge: "12 years",
      roofLayers: "2",
      termiteBaitAnnualCost: "150",
    },

    q37Inline: 1,

    q41Inline: {
      payableType: 2,
      unpaid: "YES",
      ifYesAmount: "500",
      managerName: "John Doe",
      phone: "555-0199",
    },

    q46Inline: {
      payableType: 1,
      amount: "300",
      paidTo: "City Fire Dept",
    },

    q47Details: {
      utilities: [0, 1, 2, 3],
      otherExplain: "Co-op",
      initialMembership: "1000",
      annualMembership: "350",
    },

    financial: {
      hoa: "YES",
      hoaAmount: "350",
      specialAssessment: "YES",
      specialAssessmentAmount: "1200",
    },

    explanation:
      "Seller discloses that the hot tub heating element requires repair. HOA special assessment issued in 2025. All known material defects are disclosed in good faith.",

    signatures: {
      sellerSignatureBase64: "use-file",
      buyerSignatureBase64: "use-file",
    },
  };

  const buffer = await generateDisclosurePDF(fullDemoData);

  const outputPath = path.join(
    process.cwd(),
    "src/forms/orec/2026/output-FULLY-FILLED.pdf"
  );

  fs.writeFileSync(outputPath, buffer);

  console.log("✅ Fully filled PDF generated.");
}

run().catch(console.error);