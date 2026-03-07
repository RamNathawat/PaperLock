export type YesNo = "YES" | "NO";

export type ApplianceStatus =
  | "WORKING"
  | "NOT_WORKING"
  | "UNKNOWN"
  | "NONE";

export type ZoningType =
  | "residential"
  | "commercial"
  | "historical"
  | "office"
  | "agricultural"
  | "industrial"
  | "urban_conservation"
  | "other"
  | "unknown"
  | "no_zoning";

export interface FinancialSection {
  hoa: YesNo;
  hoaAmount?: string;
  specialAssessment: YesNo;
  specialAssessmentAmount?: string;
}

export interface SignatureBlock {
  sellerSignatureBase64?: string;
  buyerSignatureBase64?: string;
}

export interface InitialsBlock {
  buyerInitial1?: string;
  buyerInitial2?: string;
  sellerInitial1?: string;
  sellerInitial2?: string;
}

export interface InlineOptions {
  waterHeaterType?: 0 | 1 | 2;
  waterSoftenerType?: 0 | 1;
  acType?: 0 | 1 | 2;
  heatingType?: 0 | 1 | 2;
  gasSupplyType?: 0 | 1 | 2;
  propaneTankType?: 0 | 1;
  generatorType?: 0 | 1 | 2;
  waterSourceType?: 0 | 1 | 2;
  fireSuppresionDate?: string;
}

export interface Q41Inline {
  payableType?: 0 | 1 | 2;
  unpaid?: YesNo;
  ifYesAmount?: string;
  managerName?: string;
  phone?: string;
}

export interface Q46Inline {
  payableType?: 0 | 1 | 2;
  amount?: string;
  paidTo?: string;
}

export interface Q47Details {
  utilities?: number[];
  otherExplain?: string;
  initialMembership?: string;
  annualMembership?: string;
}

export interface SewerSystem {
  type?: 0 | 1;
  privateType?: 0 | 1 | 2;
}

export interface Page3TextFields {
  roofAge?: string;
  roofLayers?: string;
  termiteBaitAnnualCost?: string;
}

export interface AdditionalPages {
  hasAdditionalPages: YesNo;
  howMany?: string;
}

export interface DisclosureInput {
  version: "01-01-2026";

  propertyIdentifier?: string;

  /** 0 = OCCUPYING, 1 = NOT OCCUPYING */
  sellerOccupying?: 0 | 1;

  appliances?: Record<number, ApplianceStatus>;

  inlineOptions?: InlineOptions;

  questions?: Record<number, YesNo>;

  q37Inline?: 0 | 1;

  q41Inline?: Q41Inline;

  q46Inline?: Q46Inline;

  q47Details?: Q47Details;

  sewerSystem?: SewerSystem;

  zoningType?: ZoningType;

  page2NotWorkingExplanation?: string;

  page3TextFields?: Page3TextFields;

  initials?: InitialsBlock;

  additionalPages?: AdditionalPages;

  financial: FinancialSection;

  explanation?: string;

  signatures?: SignatureBlock;
}