// Page dimensions
export const PAGE_WIDTH = 612;
export const PAGE_HEIGHT = 792;

// GLOBAL CHECKBOX SIZE
export const CHECKBOX_SIZE = 11;

// PROPERTY IDENTIFIER
export const PROPERTY_IDENTIFIER = {
  page: 0,
  x: 138,
  y: 765,
  fontSize: 10,
};

// ---------------------------
// PAGE 1 MATRIX
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
// PAGE 2 — LOCKED ROW Y MAP
// ---------------------------

export const PAGE2_ROW_Y: Record<number, number> = {
  0: 697.4,
  1: 682.3,
  2: 667.2,
  3: 652.1,
  4: 637.0,
  5: 621.9,
  6: 606.8,
  7: 591.7,
  8: 576.6,
  9: 561.5,
  10: 548,
  11: 533.5,
  12: 518,
  13: 504,
  14: 489,
  15: 473.5,
  16: 459,
  17: 444, 
  18: 428,
  19: 412,
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