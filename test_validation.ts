import { buildCleanPayload } from "./src/lib/disclosure-engine/utils/buildCleanPayload";
import { validateDisclosureInput } from "./src/lib/disclosure-engine/validation/validateDisclosure";

const storedData = {
  version: "01-01-2026",
  propertyIdentifier: "123 Main St",
  sellerOccupying: true,
  appliances: [undefined, "WORKING", "WORKING", undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, "WORKING", undefined],
  systems: { waterHeater: "WORKING" },
  questions: { "41": "YES", "46": "YES", "47": "YES" },
  q41Inline: { hoaAmount: "100", frequency: "Monthly", specialAssessmentAmount: "200" },
  q46Inline: { amount: "50", paidTo: "Fire Dept", frequency: "Annually" },
  q47Details: { services: ["Water"], initialMembershipFee: "10", annualMembershipFee: "20" },
  sewerSystem: { type: "1", privateType: "0" },
  page1NotWorkingExplanation: "a",
  page2NotWorkingExplanation: "b"
};

const completeFlatValues = {
  ...storedData,
  signatures: { sellerSignatureBase64: "test", seller2SignatureBase64: "test2" },
  initials: { sellerInitial1: "AB", sellerInitial2: "CD" }
};

try {
  const payload = buildCleanPayload(completeFlatValues, {});
  validateDisclosureInput(payload);
  console.log("Validation passed", JSON.stringify(payload, null, 2));
} catch (e) {
  console.error("Validation failed:", e.message);
}
