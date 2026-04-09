export type FlatFormData = Record<string, any>;

const PAGE_2_APPLIANCE_OFFSET = 19;

export function buildCleanPayload(
  flatValues: FlatFormData,
  allSteps: Record<string, FlatFormData>
): Record<string, any> {
  const safeMergeAll = (...objs: any[]) => {
    const res: Record<string, any> = {};
    objs.forEach((obj) => {
      if (!obj) return;
      Object.entries(obj).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") res[k] = v;
      });
    });
    return res;
  };

  const appliancesA = allSteps["Appliances"]?.appliances || {};
  const appliancesB = allSteps["Appliances Continued"]?.appliances || {};
  const appliancesC = allSteps["Systems"]?.appliances || {};
  const mergedAppliances: Record<string, string> = safeMergeAll(
    flatValues.appliances, appliancesA, appliancesB, appliancesC
  );

  const sys = allSteps["Systems"]?.systems || flatValues.systems || {};

  const systemToApplianceMap: Record<string, number> = {
    waterHeater: 3, waterSoftener: 5, sewer: 9, ac: 10,
    heating: 14, gasSupply: 17, propaneTank: 18,
    security: 23, fireSuppression: 25, solar: 36,
    generator: 37, waterSource: 38,
  };

  Object.entries(systemToApplianceMap).forEach(([sysKey, appIndex]) => {
    if (sys[sysKey] && sys[sysKey] !== "")
      mergedAppliances[appIndex.toString()] = sys[sysKey];
  });

  const questionsA = allSteps["Questions"]?.questions || {};
  const questionsB = allSteps["Questions Continued"]?.questions || {};
  const questionsC = allSteps["Questions Final"]?.questions || {};
  const mergedQuestions = safeMergeAll(flatValues.questions, questionsA, questionsB, questionsC);

  const commentsA = allSteps["Questions"]?.questionComments || {};
  const commentsB = allSteps["Questions Continued"]?.questionComments || {};
  const commentsC = allSteps["Questions Final"]?.questionComments || {};
  const mergedComments = safeMergeAll(flatValues.questionComments, commentsA, commentsB, commentsC);

  const q16 = allSteps["Questions"]?.q16Inline || flatValues.q16Inline || {};
  const q19 = allSteps["Questions"]?.q19Inline || flatValues.q19Inline || {};

  const q37MaintenanceRaw =
    allSteps["Questions Continued"]?.q37Inline?.maintenance ||
    flatValues?.q37Inline?.maintenance;
  const q37Inline: 0 | 1 | undefined =
    q37MaintenanceRaw === "YES" ? 0 : q37MaintenanceRaw === "NO" ? 1 : undefined;

  const q41 = allSteps["Questions Final"]?.q41Inline || flatValues.q41Inline || {};
  const q46 = allSteps["Questions Final"]?.q46Inline || flatValues.q46Inline || {};
  const q47 = allSteps["Questions Final"]?.q47Details || flatValues.q47Details || {};

  const applianceCommentsPage1 = allSteps["Appliances"]?.applianceComments || {};
  const applianceCommentsPage2 = allSteps["Appliances Continued"]?.applianceComments || {};
  const allApplianceComments   = safeMergeAll(
    flatValues.applianceComments, applianceCommentsPage1, applianceCommentsPage2
  );

  const page1Notes = Object.entries(allApplianceComments)
    .filter(([key, val]) => Number(key) < PAGE_2_APPLIANCE_OFFSET && val)
    .map(([key, val]) => `Appliance ${key}: ${val}`).join("\n");

  const page2Notes = Object.entries(allApplianceComments)
    .filter(([key, val]) => Number(key) >= PAGE_2_APPLIANCE_OFFSET && val)
    .map(([key, val]) => `Appliance ${key}: ${val}`).join("\n");

  const frequencyMap: Record<string, 0 | 1 | 2> = { Monthly: 0, Quarterly: 1, Annually: 2 };
  const utilityMap: Record<string, number>       = { Water: 0, Garbage: 1, Sewer: 2, Other: 3 };

  return {
    version: "01-01-2026",
    propertyIdentifier: allSteps["Property"]?.propertyIdentifier || flatValues.propertyIdentifier || "",
    sellerOccupying: allSteps["Property"]?.sellerOccupying ?? flatValues.sellerOccupying,
    appliances: mergedAppliances,
    systems: allSteps["Systems"]?.systems || flatValues.systems || {},
    inlineOptions: allSteps["Systems"]?.inlineOptions || flatValues.inlineOptions || {},
    sewerSystem: allSteps["Systems"]?.sewerSystem || flatValues.sewerSystem || {},
    page2Zoning: allSteps["Zoning"]?.page2Zoning || flatValues.page2Zoning || {},
    page2Flood: allSteps["Zoning"]?.page2Flood || flatValues.page2Flood || {},
    questions: mergedQuestions,
    questionComments: mergedComments,
    q37Inline,
    q41Inline: {
      hoaAmount: q41.hoaAmount,
      specialAssessmentAmount: q41.specialAssessmentAmount,
      payableType: typeof q41.frequency === "string" ? frequencyMap[q41.frequency] : q41.payableType,
      unpaid: q41.unpaid,
      ifYesAmount: q41.ifYesAmount,
      managerName: q41.managerName,
      phone: q41.managerPhone || q41.phone,
    },
    q46Inline: {
      amount: q46.amount,
      paidTo: q46.paidTo,
      payableType: typeof q46.frequency === "string" ? frequencyMap[q46.frequency] : q46.payableType,
    },
    q47Details: {
      utilities: Array.isArray(q47.services)
        ? q47.services.map((s: string) => utilityMap[s]).filter((v: number) => v !== undefined)
        : q47.utilities || [],
      otherExplain: q47.other || q47.otherExplain,
      initialMembership: q47.initialMembershipFee || q47.initialMembership,
      annualMembership: q47.annualMembershipFee || q47.annualMembership,
    },
    page3TextFields: {
      roofAge: q16.roofAge,
      roofLayers: q16.layers,
      termiteBaitAnnualCost: q19.annualCost,
    },
    explanation: typeof flatValues.explanation === "string" ? flatValues.explanation : "",
    signatures: allSteps["Signatures"]?.signatures || flatValues.signatures || {},
    page1NotWorkingExplanation:
      allSteps["Appliances"]?.page1NotWorkingExplanation ||
      flatValues.page1NotWorkingExplanation || page1Notes || "",
    page2NotWorkingExplanation:
      allSteps["Appliances Continued"]?.page2NotWorkingExplanation ||
      flatValues.page2NotWorkingExplanation || page2Notes || "",
    additionalPages: allSteps["Financial"]?.additionalPages || flatValues.additionalPages,
    initials: allSteps["Property"]?.initials || flatValues.initials,
  };
}
