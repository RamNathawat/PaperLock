// Page dimensions
export const PAGE_WIDTH = 612;
export const PAGE_HEIGHT = 792;

// Global checkbox size
export const CHECKBOX_SIZE = 11;

// PROPERTY IDENTIFIER
export const PROPERTY_IDENTIFIER = {
  page: 0,
  x: 138,
  y: 765,
  fontSize: 10,
};

// ---------------------------
// PAGE 1: APPLIANCE MATRIX
// ---------------------------

export const APPLIANCE_COLUMNS = {
  WORKING: 370,
  NOT_WORKING: 426.5,
  DO_NOT_KNOW: 484,
  NONE: 541.5,
};

export const APPLIANCE_FIRST_ROW_Y = 345;
export const APPLIANCE_ROW_SPACING = 15.1;

// ---------------------------
// PAGE 2: ROW MAPPINGS & INLINE BOXES
// ---------------------------

export const PAGE2_ROW_Y: Record<number, number> = {
  0: 697.4, 1: 682.3, 2: 667.2, 3: 652.1, 4: 637.0, 5: 621.9, 6: 606.8, 7: 591.7,
  8: 576.6, 9: 561.5, 10: 548, 11: 533.5, 12: 518, 13: 504, 14: 489, 15: 473.5,
  16: 459, 17: 444, 18: 428, 19: 412,
};

// Security System (4-box inline)
export const PAGE2_SECURITY_INLINE = {
  rowIndex: 4,
  firstX: 112,
  deltaToSecond: 50.5,
  deltaToThird: 99.5,
  deltaToFourth: 161,
};

// Solar Panels (3-box inline)
export const PAGE2_SOLAR_INLINE = {
  rowIndex: 17,
  firstX: 97,
  deltaToSecond: 50.5,
  deltaToThird: 100,
};

// ---------------------------
// PAGE 2: ZONING & HISTORICAL
// ---------------------------

export const PAGE2_ZONING_Q1_ROW1 = {
  y: 280,
  firstX: 185,
  deltas: [62, 128.5, 185.5, 227, 289.5],
};

export const PAGE2_ZONING_Q1_ROW2 = {
  y: 268,
  firstX: 44,
  deltas: [100, 141, 198],
};

export const PAGE2_ZONING_Q2 = {
  y: 241.5,
  firstX: 45,
  deltas: [33, 64.5],
};

// ---------------------------
// PAGE 2: FLOOD & WATER
// ---------------------------

// Q3 main (FEMA flood zone)
export const PAGE2_FLOOD_Q3_MAIN = {
  y: 193.5,
  firstX: 45.5,
  deltas: [33, 64.5], // Yes / No / Unknown
};

// Q3 types (4 boxes)
export const PAGE2_FLOOD_Q3_TYPES = {
  y: 159,
  firstX: 47,
  deltas: [101, 203, 258.5],
};

// Q3 municipal flood zone
export const PAGE2_FLOOD_Q3_MUNICIPAL = {
  y: 123,
  firstX: 105,
  deltas: [34, 64.5],
};

// Q4 reservoir
export const PAGE2_FLOOD_Q4 = {
  y: 96,
  firstX: 127,
  deltas: [33, 64.5],
};

// Q5 & Q6 vertical Yes/No
export const PAGE2_FLOOD_Q5_Y = 81;
export const PAGE2_FLOOD_Q6_Y = 65;

export const PAGE2_FLOOD_VERTICAL_COLUMNS = {
  YES: 526.5,
  NO: 554.5,
};