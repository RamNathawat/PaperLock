// ==================================================
// GLOBAL
// ==================================================

export const PAGE_WIDTH = 612;
export const PAGE_HEIGHT = 792;

export const CHECKBOX_SIZE = 11;

export const PROPERTY_IDENTIFIER = {
  page: 0,
  x: 138,
  y: 765,
  fontSize: 10,
};

// ==================================================
// PAGE 1
// ==================================================

export const APPLIANCE_COLUMNS = {
  WORKING: 370,
  NOT_WORKING: 426.5,
  DO_NOT_KNOW: 484,
  NONE: 541.5,
};

export const APPLIANCE_FIRST_ROW_Y = 345;
export const APPLIANCE_ROW_SPACING = 15.1;

// ==================================================
// PAGE 2 (Already Locked)
// ==================================================

export const PAGE2_FLOOD_VERTICAL_COLUMNS = {
  YES: 526.5,
  NO: 554.5,
};

// ==================================================
// PAGE 3
// ==================================================

export const PAGE3_YES_NO_COLUMNS = {
  YES: 526.5,
  NO: 554.5,
};

export const PAGE3_ROW_Y: Record<number, number> = {
  7: 713.5, 8: 686, 9: 665.5, 10: 644,
  11: 603, 12: 587.5, 13: 573, 14: 551.5, 15: 524.5,
  16: 500,
  17: 475.5, 18: 460.5, 19: 445.5, 20: 430,
  21: 415, 22: 393, 23: 372.5,
  24: 337, 25: 321.5, 26: 306.5, 27: 291,
  28: 276, 29: 260.5, 30: 245.5, 31: 224,
  32: 203.5, 33: 188, 34: 172.5, 35: 157.5,
  36: 142.5, 37: 121, 38: 74,
};

export const PAGE3_Q37_INLINE = {
  offsetFromRow: 5.5,
  firstX: 322,
  deltaToSecond: 35,
};

// ==================================================
// PAGE 4
// ==================================================

export const PAGE4_YES_NO_COLUMNS = {
  YES: 526.5,
  NO: 554.5,
};

export const PAGE4_ROW_Y: Record<number, number> = {
  39: 714.5,
  40: 693,
  41: 623,
  42: 542,
  43: 521,
  44: 500,
  45: 479.5,
  46: 434,
  47: 351,
  48: 274.5,
  49: 253,
  50: 227,
};

export const PAGE4_Q41_PAYABLE = {
  y: 629.5,
  firstX: 150,
  deltaToSecond: 53.5,
  deltaToThird: 112.5,
};

export const PAGE4_Q41_UNPAID = {
  y: 605.5,
  firstX: 305,
  deltaToSecond: 38,
};

export const PAGE4_Q46_PAYABLE = {
  y: 409.5,
  firstX: 152,
  deltaToSecond: 54,
  deltaToThird: 111.5,
};

export const PAGE4_Q47_UTILITIES = {
  y: 370,
  firstX: 133.5,
  deltas: [45, 103, 150],
};

// PAGE 4 TEXT FIELDS

export const PAGE4_TEXT_FIELDS = {
  q41AmountOfDues: { x: 130, y: 652.5 },
  q41SpecialAssessment: { x: 280, y: 652.5 },
  q41IfYesAmount: { x: 180, y: 580.5 },
  q41ManagerName: { x: 300, y: 580.5 },
  q41Phone: { x: 305, y: 556 },
  q46Amount: { x: 152, y: 433 },
  q46PaidTo: { x: 265, y: 433 },
  q47IfOtherExplain: { x: 125, y: 345 },
  q47InitialMembership: { x: 156, y: 321 },
  q47AnnualMembership: { x: 335, y: 321 },
};

export const PAGE4_EXPLANATION_BOX = {
  x: 40,
  yTop: 205,
  lineHeight: 12,
};

export const PAGE4_INITIALS = {
  buyerX: 160,
  sellerX: 282,
  y: 40,
};

// ==================================================
// PAGE 5
// ==================================================

export const PAGE5_YES_NO = {
  y: 696,
  firstX: 271,
  deltaToSecond: 36,
};

export const PAGE5_SIGNATURES = {
  seller1: { x: 150, y: 670 },
  seller2: { x: 360, y: 670 },
  buyer1: { x: 150, y: 505 },
  buyer2: { x: 360, y: 505 },
};

export const PAGE5_INITIALS = {
  buyerX: 160,
  sellerX: 290,
  y: 50,
};