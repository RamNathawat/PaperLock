"use client";

import { Wizard } from "@/lib/wizard/index";
import Step1Property from "./steps/Step1Property";
import Step2AppliancesPrimary from "./steps/Step2AppliancesPrimary";
import Step3AppliancesExtended from "./steps/Step3AppliancesExtended";
import Step3Systems from "./steps/Step3Systems";
import Step4Zoning from "./steps/Step4Zoning";
import Step5QuestionsA from "./steps/Step5QuestionsA";
import Step6QuestionsB from "./steps/Step6QuestionsB";
import Step7QuestionsC from "./steps/Step7QuestionsC";
import Step6Financial from "./steps/Step6Financial";
import Step7Signatures from "./steps/Step7Signatures";
import Navigation from "./components/Navigation";
import ProgressBar from "./components/ProgressBar";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  sharedToken?: string;
};

type FlatFormData = Record<string, any>;

// Step2AppliancesPrimary owns indexes 0–11.
// Step3AppliancesExtended owns indexes 12–26.
const PAGE_2_APPLIANCE_OFFSET = 19;

function normalizeAppliances(flat: FlatFormData) {
  const source =
    flat?.appliances ||
    flat?.Appliances?.appliances ||
    flat?.Appliances ||
    {};

  if (Array.isArray(source)) return source;

  if (typeof source === "object" && source !== null) {
    const result: Record<number, string> = {};
    Object.entries(source).forEach(([key, value]) => {
      result[Number(key)] = value as string;
    });
    return result;
  }

  return {};
}

export function DisclosurePage({ sharedToken }: Props) {
  const searchParams = useSearchParams();

  const disclosureId = searchParams.get("id");
  const token = sharedToken || searchParams.get("token");

  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState(!!disclosureId || !!token);

  const draftIdRef = useRef<string | null>(disclosureId);
  const autosaveTimeoutRef = useRef<any>(null);

  const perStepValuesRef = useRef<Record<string, FlatFormData>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const endpoint = token
          ? `/api/shared-links/${token}`
          : disclosureId
          ? `/api/disclosures/${disclosureId}`
          : null;

        if (!endpoint) {
          setLoading(false);
          return;
        }

        const res = await fetch(endpoint, {
          credentials: token ? undefined : "include",
        });

        const data = await res.json();

        const flat: FlatFormData =
          (data.link?.form_data as FlatFormData) ||
          (data.disclosure?.form_data as FlatFormData);

        if (!flat) {
          setLoading(false);
          return;
        }

        setInitialValues({
          Property: {
            propertyIdentifier: flat.propertyIdentifier,
            sellerOccupying: flat.sellerOccupying,
            initials: flat.initials,
            disclosureId,
          },

          AppliancesPrimary: {
            appliances: normalizeAppliances(flat),
            page1NotWorkingExplanation: flat.page1NotWorkingExplanation,
            applianceComments: flat.applianceComments,
          },

          AppliancesExtended: {
            appliances: normalizeAppliances(flat),
            page2NotWorkingExplanation: flat.page2NotWorkingExplanation,
            applianceComments: flat.applianceComments,
          },

          Systems: {
            inlineOptions: flat.inlineOptions,
            sewerSystem: flat.sewerSystem,
            systems: flat.systems,
          },

          Zoning: {
            page2Zoning: flat.page2Zoning,
            page2Flood: flat.page2Flood,
          },

          QuestionsA: {
            questions: flat.questions,
            questionComments: flat.questionComments,
            q16Inline: flat.page3TextFields
              ? {
                  roofAge: flat.page3TextFields.roofAge,
                  layers: flat.page3TextFields.roofLayers,
                }
              : flat.q16Inline,
            q19Inline: flat.page3TextFields
              ? { annualCost: flat.page3TextFields.termiteBaitAnnualCost }
              : flat.q19Inline,
          },

          QuestionsB: {
            questions: flat.questions,
            questionComments: flat.questionComments,
            q37Inline: flat.q37Inline,
          },

          QuestionsC: {
            questions: flat.questions,
            questionComments: flat.questionComments,
            q41Inline: flat.q41Inline,
            q46Inline: flat.q46Inline,
            q47Details: flat.q47Details,
          },

          Financial: {
            additionalPages: flat.additionalPages,
          },

          Signatures: {
            signatures: flat.signatures,
          },
        });

        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    loadData();
  }, [disclosureId, token]);

  async function handleStepChanged(
    _from: any,
    _to: any,
    allValues: Record<string, FlatFormData>
  ) {
    const safeMerge = (a: any, b: any) => {
      const res: Record<string, any> = { ...(a || {}) };
      if (b) {
        Object.entries(b).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== "") {
            res[k] = v;
          }
        });
      }
      return res;
    };

    const flat: FlatFormData = Object.values(allValues).reduce(
      (acc: FlatFormData, value: FlatFormData) => {
        const merged = { ...acc, ...value };
        if (acc.appliances || value.appliances) {
          merged.appliances = safeMerge(acc.appliances, value.appliances);
        }
        if (acc.questions || value.questions) {
          merged.questions = safeMerge(acc.questions, value.questions);
        }
        if (acc.questionComments || value.questionComments) {
          merged.questionComments = safeMerge(acc.questionComments, value.questionComments);
        }
        if (acc.systemComments || value.systemComments) {
          merged.systemComments = safeMerge(acc.systemComments, value.systemComments);
        }
        if (acc.inlineOptions || value.inlineOptions) {
          merged.inlineOptions = safeMerge(acc.inlineOptions, value.inlineOptions);
        }
        if (acc.sewerSystem || value.sewerSystem) {
          merged.sewerSystem = safeMerge(acc.sewerSystem, value.sewerSystem);
        }
        if (acc.q41Inline || value.q41Inline) {
          merged.q41Inline = safeMerge(acc.q41Inline, value.q41Inline);
        }
        if (acc.q46Inline || value.q46Inline) {
          merged.q46Inline = safeMerge(acc.q46Inline, value.q46Inline);
        }
        if (acc.page2Flood || value.page2Flood) {
          merged.page2Flood = safeMerge(acc.page2Flood, value.page2Flood);
        }
        if (acc.q47Details || value.q47Details) {
          merged.q47Details = safeMerge(acc.q47Details, value.q47Details);
        }
        return merged;
      },
      {}
    );

    const endpoint = token
      ? `/api/shared-links/${token}`
      : draftIdRef.current
      ? `/api/disclosures/${draftIdRef.current}`
      : null;

    if (!endpoint) return;

    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    autosaveTimeoutRef.current = setTimeout(async () => {
      await fetch(endpoint, {
        method: "PATCH",
        credentials: token ? undefined : "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          token
            ? { form_data: flat }
            : {
                property_identifier: flat.propertyIdentifier || "Untitled",
                form_data: flat,
              }
        ),
      });
    }, 500);
  }

  async function handleCompleted(
    flatValues: FlatFormData,
    allStepsFromWizard?: Record<string, FlatFormData>
  ) {
    try {
      const allSteps = allStepsFromWizard || perStepValuesRef.current || {};

      const safeMergeAll = (...objs: any[]) => {
        const res: Record<string, any> = {};
        objs.forEach((obj) => {
          if (!obj) return;
          Object.entries(obj).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== "") {
              res[k] = v;
            }
          });
        });
        return res;
      };

      const appliancesA = allSteps["Appliances"]?.appliances || {};
      const appliancesB = allSteps["Appliances Continued"]?.appliances || {};
      const appliancesC = allSteps["Systems"]?.appliances || {};

      const mergedAppliances: Record<string, string> = safeMergeAll(
        flatValues.appliances,
        appliancesA,
        appliancesB,
        appliancesC
      );

      const sys = allSteps["Systems"]?.systems || flatValues.systems || {};

      const systemToApplianceMap: Record<string, number> = {
        waterHeater: 3,
        waterSoftener: 5,
        sewer: 9,
        ac: 10,
        heating: 14,
        gasSupply: 17,
        propaneTank: 18,
        security: 23,
        fireSuppression: 25,
        solar: 36,
        generator: 37,
        waterSource: 38,
      };

      Object.entries(systemToApplianceMap).forEach(([sysKey, appIndex]) => {
        if (sys[sysKey] && sys[sysKey] !== "") {
          mergedAppliances[appIndex.toString()] = sys[sysKey];
        }
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
        q37MaintenanceRaw === "YES" ? 0
        : q37MaintenanceRaw === "NO" ? 1
        : undefined;

      const q41 = allSteps["Questions Final"]?.q41Inline || flatValues.q41Inline || {};
      const q46 = allSteps["Questions Final"]?.q46Inline || flatValues.q46Inline || {};
      const q47 = allSteps["Questions Final"]?.q47Details || flatValues.q47Details || {};

      const applianceCommentsPage1 = allSteps["Appliances"]?.applianceComments || {};
      const applianceCommentsPage2 = allSteps["Appliances Continued"]?.applianceComments || {};
      const allApplianceComments = safeMergeAll(
        flatValues.applianceComments,
        applianceCommentsPage1,
        applianceCommentsPage2
      );

      const page1Notes = Object.entries(allApplianceComments)
        .filter(([key, val]) => Number(key) < PAGE_2_APPLIANCE_OFFSET && val)
        .map(([key, val]) => `Appliance ${key}: ${val}`)
        .join("\n");

      const page2Notes = Object.entries(allApplianceComments)
        .filter(([key, val]) => Number(key) >= PAGE_2_APPLIANCE_OFFSET && val)
        .map(([key, val]) => `Appliance ${key}: ${val}`)
        .join("\n");

      const frequencyMap: Record<string, 0 | 1 | 2> = {
        Monthly: 0,
        Quarterly: 1,
        Annually: 2,
      };

      const utilityMap: Record<string, number> = {
        Water: 0,
        Garbage: 1,
        Sewer: 2,
        Other: 3,
      };

      const cleanPayload = {
        version: "01-01-2026" as const,

        propertyIdentifier:
          allSteps["Property"]?.propertyIdentifier ||
          flatValues.propertyIdentifier ||
          "",

        sellerOccupying:
          allSteps["Property"]?.sellerOccupying ??
          flatValues.sellerOccupying,

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
          payableType:
            typeof q41.frequency === "string"
              ? frequencyMap[q41.frequency]
              : q41.payableType,
          unpaid: q41.unpaid,
          ifYesAmount: q41.ifYesAmount,
          managerName: q41.managerName,
          phone: q41.managerPhone || q41.phone,
        },

        q46Inline: {
          amount: q46.amount,
          paidTo: q46.paidTo,
          payableType:
            typeof q46.frequency === "string"
              ? frequencyMap[q46.frequency]
              : q46.payableType,
        },

        q47Details: {
          utilities: Array.isArray(q47.services)
            ? q47.services
                .map((s: string) => utilityMap[s])
                .filter((v: number) => v !== undefined)
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

        explanation:
          typeof flatValues.explanation === "string" ? flatValues.explanation : "",

        signatures: allSteps["Signatures"]?.signatures || flatValues.signatures || {},

        page1NotWorkingExplanation:
          allSteps["Appliances"]?.page1NotWorkingExplanation ||
          flatValues.page1NotWorkingExplanation ||
          page1Notes ||
          "",

        page2NotWorkingExplanation:
          allSteps["Appliances Continued"]?.page2NotWorkingExplanation ||
          flatValues.page2NotWorkingExplanation ||
          page2Notes ||
          "",

        additionalPages:
          allSteps["Financial"]?.additionalPages || flatValues.additionalPages,

        initials: allSteps["Property"]?.initials || flatValues.initials,
      };

      // ── If this is a shared link, fire is_submitted PATCH first ──
      // This triggers the email send in the route handler.
      if (token) {
        await fetch(`/api/shared-links/${token}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            form_data: cleanPayload,
            is_submitted: true,
          }),
        });
      }

      // ── Generate and download the PDF ──
      const res = await fetch("/api/disclosure/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Failed to generate PDF: ${err.error}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "disclosure.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("Something went wrong while generating PDF.");
    }
  }

  const steps = [
    { id: "Property", component: <Step1Property />, initialValues: initialValues?.Property },
    { id: "Appliances", component: <Step2AppliancesPrimary />, initialValues: initialValues?.AppliancesPrimary },
    { id: "Appliances Continued", component: <Step3AppliancesExtended />, initialValues: initialValues?.AppliancesExtended },
    { id: "Systems", component: <Step3Systems />, initialValues: initialValues?.Systems },
    { id: "Zoning", component: <Step4Zoning />, initialValues: initialValues?.Zoning },
    { id: "Questions", component: <Step5QuestionsA />, initialValues: initialValues?.QuestionsA },
    { id: "Questions Continued", component: <Step6QuestionsB />, initialValues: initialValues?.QuestionsB },
    { id: "Questions Final", component: <Step7QuestionsC />, initialValues: initialValues?.QuestionsC },
    { id: "Financial", component: <Step6Financial />, initialValues: initialValues?.Financial },
    { id: "Signatures", component: <Step7Signatures />, initialValues: initialValues?.Signatures },
  ];

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="bg-white border border-gray-100 rounded-xl p-8">
          <Wizard
            steps={steps}
            onCompleted={handleCompleted}
            onStepChanged={handleStepChanged}
            footer={<Navigation />}
            header={<ProgressBar />}
          />
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function DisclosurePageWrapper(props: Props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DisclosurePage {...props} />
    </Suspense>
  );
}