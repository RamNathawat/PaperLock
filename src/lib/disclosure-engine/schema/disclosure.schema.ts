export type YesNo = "YES" | "NO";

export type ApplianceStatus =
  | "WORKING"
  | "NOT_WORKING"
  | "UNKNOWN"
  | "NONE";

export interface ApplianceItem {
  status: ApplianceStatus;
}

export interface AppliancesSection {
  sprinklerSystem: ApplianceItem;
  swimmingPool: ApplianceItem;
  hotTub: ApplianceItem;
  plumbing: ApplianceItem;
  airConditioning: ApplianceItem;
}

export interface FinancialSection {
  hoa: YesNo;
  hoaAmount?: string;
  specialAssessment: YesNo;
  specialAssessmentAmount?: string;
}

export interface SignatureBlock {
  sellerSignatureBase64?: string; // used as trigger
  buyerSignatureBase64?: string;
}

export interface DisclosureInput {
  version: "01-01-2026";

  appliances: AppliancesSection;
  financial: FinancialSection;

  explanation?: string;

  signatures?: SignatureBlock;
}