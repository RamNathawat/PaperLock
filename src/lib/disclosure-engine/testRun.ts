import fs from "fs";
import path from "path";
import { generateDisclosurePDF } from "./generateDisclosurePDF.js";
import { DisclosureInput } from "./schema/disclosure.schema.js";

async function run() {
  console.log("Generating FULLY FILLED demo PDF...");

  try {
    const fullDemoData: DisclosureInput = {
      version: "01-01-2026",

      appliances: {
        sprinklerSystem: { status: "WORKING" },
        swimmingPool: { status: "WORKING" },
        hotTub: { status: "NOT_WORKING" },
        plumbing: { status: "WORKING" },
        airConditioning: { status: "UNKNOWN" },
      },

      financial: {
        hoa: "YES",
        hoaAmount: "350",
        specialAssessment: "YES",
        specialAssessmentAmount: "1200",
      },

      explanation:
        "Seller discloses that the hot tub heating element requires repair and that a special assessment was issued by the HOA in 2025 for roof replacement across the community. Plumbing and sprinkler systems are fully operational at the time of disclosure. Air conditioning status is unknown due to seasonal inactivity. All known material defects have been disclosed in good faith to the best of the seller’s knowledge.",

      signatures: {
        sellerSignatureBase64: "use-file",
        buyerSignatureBase64: "use-file",
      },
    };

    const start = Date.now();

    const buffer = await generateDisclosurePDF(fullDemoData);

    const end = Date.now();

    console.log("Render time:", end - start, "ms");

    const outputPath = path.join(
      process.cwd(),
      "src/forms/orec/2026/output-FULL-DEMO.pdf"
    );

    fs.writeFileSync(outputPath, buffer);

    console.log("✅ FULL DEMO PDF generated at:", outputPath);

  } catch (err: any) {
    console.error("🔥 ERROR:", err.message);
  }
}

run();