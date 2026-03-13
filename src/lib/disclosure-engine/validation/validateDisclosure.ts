import { DisclosureInput } from "../schema/disclosure.schema";

export function validateDisclosureInput(data: DisclosureInput) {

  // --------------------------------------------------
  // Version
  // --------------------------------------------------
  if (data.version !== "01-01-2026") {
    throw new Error("Unsupported disclosure version");
  }

  // --------------------------------------------------
  // Required fields
  // --------------------------------------------------
  if (!data.propertyIdentifier || data.propertyIdentifier.trim() === "") {
    throw new Error("propertyIdentifier is required");
  }

  if (data.sellerOccupying === undefined) {
    throw new Error("sellerOccupying is required (0 = occupying, 1 = not occupying)");
  }

  if (!data.appliances) {
    throw new Error("appliances section is required");
  }

  // --------------------------------------------------
  // Initials — must be exactly 1 character each
  // --------------------------------------------------
  if (data.initials) {
    const { buyerInitial1, buyerInitial2, sellerInitial1, sellerInitial2 } = data.initials;

    if (buyerInitial1 !== undefined && buyerInitial1.length !== 1) {
      throw new Error("initials.buyerInitial1 must be exactly 1 character");
    }
    if (buyerInitial2 !== undefined && buyerInitial2.length !== 1) {
      throw new Error("initials.buyerInitial2 must be exactly 1 character");
    }
    if (sellerInitial1 !== undefined && sellerInitial1.length !== 1) {
      throw new Error("initials.sellerInitial1 must be exactly 1 character");
    }
    if (sellerInitial2 !== undefined && sellerInitial2.length !== 1) {
      throw new Error("initials.sellerInitial2 must be exactly 1 character");
    }
  }

  // --------------------------------------------------
  // NOT_WORKING explanation required
  // --------------------------------------------------
  const hasNotWorking = Object.values(data.appliances).some(
    (status) => status === "NOT_WORKING"
  );

  if (hasNotWorking && !data.page2NotWorkingExplanation?.trim()) {
    throw new Error(
      "page2NotWorkingExplanation is required when any appliance is marked NOT_WORKING"
    );
  }

  // --------------------------------------------------
  // Explanation length
  // --------------------------------------------------
  if (data.explanation && data.explanation.length > 1500) {
    throw new Error("explanation exceeds 1500 character limit");
  }

  if (data.page2NotWorkingExplanation && data.page2NotWorkingExplanation.length > 1500) {
    throw new Error("page2NotWorkingExplanation exceeds 1500 character limit");
  }

  // --------------------------------------------------
  // Additional pages — howMany required if YES
  // --------------------------------------------------
  if (data.additionalPages) {
    if (
      data.additionalPages.hasAdditionalPages === "YES" &&
      !data.additionalPages.howMany?.trim()
    ) {
      throw new Error(
        "additionalPages.howMany is required when hasAdditionalPages is YES"
      );
    }
  }

  // --------------------------------------------------
  // Sewer — privateType required if type is Private
  // --------------------------------------------------
  if (data.sewerSystem?.type === 1 && data.sewerSystem.privateType === undefined) {
    throw new Error(
      "sewerSystem.privateType is required when sewer type is Private"
    );
  }

  // --------------------------------------------------
  // Q41 — hoaAmount required if Q41 is YES
  // --------------------------------------------------
  if (data.questions?.[41] === "YES" && !data.q41Inline?.hoaAmount?.trim()) {
    throw new Error("q41Inline.hoaAmount is required when Q41 is YES");
  }

  // --------------------------------------------------
  // Q41 — ifYesAmount required if unpaid is YES
  // --------------------------------------------------
  if (data.q41Inline?.unpaid === "YES" && !data.q41Inline.ifYesAmount?.trim()) {
    throw new Error("q41Inline.ifYesAmount is required when unpaid is YES");
  }

  // --------------------------------------------------
  // Q46 — amount required if Q46 is YES
  // --------------------------------------------------
  if (data.questions?.[46] === "YES" && !data.q46Inline?.amount?.trim()) {
    throw new Error("q46Inline.amount is required when Q46 is YES");
  }
}