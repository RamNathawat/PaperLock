import { DisclosureInput } from "../schema/disclosure.schema.js";

export function validateDisclosureInput(
  data: DisclosureInput
) {
  if (data.version !== "01-01-2026") {
    throw new Error("Unsupported disclosure version");
  }

  if (!data.appliances) {
    throw new Error("Appliances section is required");
  }

  if (!data.financial) {
    throw new Error("Financial section is required");
  }

  if (data.explanation) {
    validateExplanationLength(data.explanation);
  }
}

function validateExplanationLength(text: string) {
  // Soft guard before layout-based overflow check
  const MAX_CHAR_LIMIT = 1500;

  if (text.length > MAX_CHAR_LIMIT) {
    throw new Error(
      `Explanation exceeds ${MAX_CHAR_LIMIT} characters`
    );
  }
}