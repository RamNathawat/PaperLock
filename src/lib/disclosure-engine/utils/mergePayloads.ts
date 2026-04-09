export function mergePayloads(stepsArray: any[]) {
  const result: any = {};
  stepsArray.forEach((stepVals) => {
    if (!stepVals || typeof stepVals !== "object") return;
    
    Object.keys(stepVals).forEach((key) => {
      const val = stepVals[key];
      // Note: we consider simple object maps for nested RHF state (e.g. appliances, questions)
      if (typeof val === "object" && val !== null && !Array.isArray(val)) {
        result[key] = { ...(result[key] || {}), ...val };
      } else {
        result[key] = val;
      }
    });
  });
  return result;
}
