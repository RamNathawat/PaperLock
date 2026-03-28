import { DisclosureInput } from "../schema/disclosure.schema";

export function validateDisclosureInput(data: DisclosureInput) {

  // version
  if (data.version !== "01-01-2026") {
    throw new Error("Unsupported disclosure version");
  }

  // propertyIdentifier
  if (!data.propertyIdentifier || data.propertyIdentifier.trim() === "") {
    throw new Error("propertyIdentifier is required");
  }

  // initials — only validate if provided AND non-empty
  if (data.initials) {
    const { buyerInitial1, buyerInitial2, sellerInitial1, sellerInitial2 } = data.initials;
    if (buyerInitial1 && buyerInitial1.length !== 1) {
      throw new Error("initials.buyerInitial1 must be exactly 1 character");
    }
    if (buyerInitial2 && buyerInitial2.length !== 1) {
      throw new Error("initials.buyerInitial2 must be exactly 1 character");
    }
    if (sellerInitial1 && sellerInitial1.length !== 1) {
      throw new Error("initials.sellerInitial1 must be exactly 1 character");
    }
    if (sellerInitial2 && sellerInitial2.length !== 1) {
      throw new Error("initials.sellerInitial2 must be exactly 1 character");
    }
  }

  // NOT_WORKING explanation — only required if appliances exist and have NOT_WORKING
  if (data.appliances) {
    const hasNotWorking = Object.values(data.appliances).some(
      (status) => status === "NOT_WORKING"
    );
    if (hasNotWorking && !data.page2NotWorkingExplanation?.trim()) {
      throw new Error(
        "page2NotWorkingExplanation is required when any appliance is marked NOT_WORKING"
      );
    }
  }

  // explanation length
  if (data.explanation && data.explanation.length > 1500) {
    throw new Error("explanation exceeds 1500 character limit");
  }
  if (data.page2NotWorkingExplanation && data.page2NotWorkingExplanation.length > 1500) {
    throw new Error("page2NotWorkingExplanation exceeds 1500 character limit");
  }

  // additionalPages
  if (
    data.additionalPages?.hasAdditionalPages === "YES" &&
    !data.additionalPages.howMany?.trim()
  ) {
    throw new Error("additionalPages.howMany is required when hasAdditionalPages is YES");
  }

  // sewer
  if (data.sewerSystem?.type === 1 && data.sewerSystem.privateType === undefined) {
    throw new Error("sewerSystem.privateType is required when sewer type is Private");
  }

  // Q41
  if (data.questions?.[41] === "YES" && !data.q41Inline?.hoaAmount?.trim()) {
    throw new Error("q41Inline.hoaAmount is required when Q41 is YES");
  }
  if (data.q41Inline?.unpaid === "YES" && !data.q41Inline.ifYesAmount?.trim()) {
    throw new Error("q41Inline.ifYesAmount is required when unpaid is YES");
  }

  // Q46
  if (data.questions?.[46] === "YES" && !data.q46Inline?.amount?.trim()) {
    throw new Error("q46Inline.amount is required when Q46 is YES");
  }
}