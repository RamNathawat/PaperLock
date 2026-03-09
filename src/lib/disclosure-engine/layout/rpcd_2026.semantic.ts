import * as raw from "../../../forms/orec/2026/layout";

/* =========================
   YES/NO FINANCIAL
   ========================= */

export interface YesNoLayout {
  page: number;
  yesX: number;
  noX: number;
  y: number;
}

export const CHECKBOX_LAYOUT: Record<string, YesNoLayout> = {
  "financial.hoa": {
    page: 3,
    yesX: raw.PAGE4_YES_NO_COLUMNS.YES,
    noX: raw.PAGE4_YES_NO_COLUMNS.NO,
    y: raw.PAGE4_ROW_Y[41],
  },
  "financial.specialAssessment": {
    page: 3,
    yesX: raw.PAGE4_YES_NO_COLUMNS.YES,
    noX: raw.PAGE4_YES_NO_COLUMNS.NO,
    y: raw.PAGE4_ROW_Y[46],
  },
};

/* =========================
   TEXT FIELDS
   ========================= */

export interface TextLayout {
  page: number;
  x: number;
  y: number;
  fontSize: number;
}

export const TEXT_LAYOUT: Record<string, TextLayout> = {
  "financial.hoaAmount": {
    page: 3,
    x: raw.PAGE4_TEXT_FIELDS.q41AmountOfDues.x,
    y: raw.PAGE4_TEXT_FIELDS.q41AmountOfDues.y,
    fontSize: 10,
  },
  "financial.specialAssessmentAmount": {
    page: 3,
    x: raw.PAGE4_TEXT_FIELDS.q41SpecialAssessment.x,
    y: raw.PAGE4_TEXT_FIELDS.q41SpecialAssessment.y,
    fontSize: 10,
  },
};

/* =========================
   EXPLANATION BOX
   ========================= */

export const EXPLANATION_LAYOUT = {
  "explanation": {
    page: 3,
    x: 38,
    yTop: 170,
    width: 545,
    lineHeight: 14,
    maxLines: 10,
  },
};

/* =========================
   APPLIANCES
   ========================= */

export interface ApplianceLayout {
  page: number;
  rowIndex: number;
}

export const APPLIANCE_LAYOUT: Record<string, ApplianceLayout> = {
  "appliances.sprinklerSystem": { page: 0, rowIndex: 0 },
  "appliances.swimmingPool": { page: 0, rowIndex: 1 },
  "appliances.hotTub": { page: 0, rowIndex: 2 },
  "appliances.plumbing": { page: 0, rowIndex: 7 },
  "appliances.airConditioning": { page: 0, rowIndex: 10 },
};

/* =========================
   SIGNATURES (Page 5)
   ========================= */

export interface SignatureLayout {
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const SIGNATURE_LAYOUT = {
  seller: {
    page: 4,
    x: raw.PAGE5_SIGNATURES.seller1.x-80,
    y: raw.PAGE5_SIGNATURES.seller1.y-9,
    width: 180,
    height: 20, // your adjusted height
  },
  buyer: {
    page: 4,
    x: raw.PAGE5_SIGNATURES.buyer1.x-80,
    y: raw.PAGE5_SIGNATURES.buyer1.y-11,
    width: 180,
    height: 20,
  },
};