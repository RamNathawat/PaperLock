// Page dimensions
export const PAGE_WIDTH = 612;
export const PAGE_HEIGHT = 792;

// PROPERTY IDENTIFIER
export const PROPERTY_IDENTIFIER = {
  page: 0,
  x: 138,
  y: 765,
  fontSize: 10,
};

// Appliance matrix layout
export const APPLIANCE_COLUMNS = {
  WORKING: 370,
  NOT_WORKING: 426.5,
  DO_NOT_KNOW: 484,
  NONE: 541.5,
};

export const APPLIANCE_FIRST_ROW_Y = 345;
export const APPLIANCE_ROW_SPACING = 15.1;

// Sewer inline checkboxes (Public / Private)
export const SEWER_INLINE = {
  y: 209.5,
  publicX: 105,
  deltaToPrivate: 44, // 149 - 105
  size: 10.5,
};

export const SEPTIC_INLINE = {
  y: 198,               
  firstX: 119,          
  deltaToSecond: 68,    
  deltaToThird: 155,    
  size: 10.5,
};

export const WATER_HEATER_INLINE = {
  rowIndex: 3,
  firstX: 100,       
  deltaToSecond: 50, 
  deltaToThird: 87,  
  size: 10.5,
};

export const WATER_SOFTENER_INLINE = {
  rowIndex: 5,
  firstX: 106.5,      
  deltaToSecond: 51,
  size: 10.5,
};

export const AC_INLINE = {
  rowIndex: 10,
  firstX: 145,      
  deltaToSecond: 50,
  deltaToThird: 86.5,
  size: 10.5,
};

export const HEATING_INLINE = {
  rowIndex: 14,
  firstX: 110.5,
  deltaToSecond: 50.5,
  deltaToThird: 87,
  size: 10.5,
};

export const GAS_SUPPLY_INLINE = {
  rowIndex: 17,
  firstX: 93,
  deltaToSecond: 44.5,
  deltaToThird: 98.5,
  size: 10.5,
};

export const PROPANE_TANK_INLINE = {
  rowIndex: 18,
  firstX: 101,
  deltaToSecond: 51,
  size: 10.5,
};

// ---------------------------
// PAGE 2 MATRIX (NEW)
// ---------------------------

export const PAGE2_FIRST_ROW_Y = 670; // temporary calibration value
export const PAGE2_ROW_SPACING = 15.1; // temporary assumption