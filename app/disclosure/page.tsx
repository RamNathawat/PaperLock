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
import { useRouter, useSearchParams } from "next/navigation";

type Props = {
  sharedToken?: string;
};

type FlatFormData = Record<string, any>;

function normalizeAppliances(flat: FlatFormData) {
  const source =
    flat?.appliances ||
    flat?.Appliances?.appliances ||
    flat?.Appliances ||
    {};

  if (Array.isArray(source)) return source;

  if (typeof source === "object" && source !== null) {
    const result: Record<number, string> = {};
    Object.entries(source).forEach(([_, value], index) => {
      result[index] = value as string;
    });
    return result;
  }

  return {};
}

export default function DisclosurePage({ sharedToken }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const disclosureId = searchParams.get("id");
  const token = sharedToken || searchParams.get("token");

  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState(!!disclosureId || !!token);

  const draftIdRef = useRef<string | null>(disclosureId);
  const autosaveTimeoutRef = useRef<any>(null);

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
            page1NotWorkingExplanation:
              flat.page1NotWorkingExplanation,
          },

          AppliancesExtended: {
            appliances: normalizeAppliances(flat),
            page2NotWorkingExplanation:
              flat.page2NotWorkingExplanation,
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
          },

          QuestionsB: {
            questions: flat.questions,
            questionComments: flat.questionComments,
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
    const flat: FlatFormData = Object.values(allValues).reduce(
      (acc: FlatFormData, value: FlatFormData) => ({
        ...acc,
        ...value,
      }),
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
                property_identifier:
                  flat.propertyIdentifier || "Untitled",
                form_data: flat,
              }
        ),
      });
    }, 500);
  }

async function handleCompleted(values: FlatFormData) {
  try {
    const q41 = values.q41Inline || {};
    const q46 = values.q46Inline || {};
    const q47 = values.q47Details || {};

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
        values.propertyIdentifier ||
        values.propertyAddress ||
        "",

      sellerOccupying: values.sellerOccupying,

      appliances: values.appliances || {},
      inlineOptions: values.inlineOptions || {},
      sewerSystem: values.sewerSystem || {},

      page2Zoning: values.page2Zoning || {},
      page2Flood: values.page2Flood || {},

      questions: values.questions || {},
      questionComments: values.questionComments || {},

      q37Inline: values.q37Inline,

      q41Inline: {
        hoaAmount: q41.hoaAmount,
        specialAssessmentAmount:
          q41.specialAssessmentAmount,
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
        initialMembership:
          q47.initialMembershipFee ||
          q47.initialMembership,
        annualMembership:
          q47.annualMembershipFee ||
          q47.annualMembership,
      },

      explanation:
        typeof values.explanation === "string"
          ? values.explanation
          : "",

      signatures: values.signatures || {},

      page1NotWorkingExplanation:
        values.page1NotWorkingExplanation || "",

      page2NotWorkingExplanation:
        values.page2NotWorkingExplanation || "",
    };

    const applianceComments =
      values.applianceComments || {};

    const page1Notes = Object.entries(applianceComments)
      .filter(([key, value]) => Number(key) < 100 && value)
      .map(([key, value]) => `Appliance ${key}: ${value}`)
      .join("\n");

    const page2Notes = Object.entries(applianceComments)
      .filter(([key, value]) => Number(key) >= 100 && value)
      .map(([key, value]) => `Appliance ${key}: ${value}`)
      .join("\n");

    cleanPayload.page1NotWorkingExplanation =
      cleanPayload.page1NotWorkingExplanation ||
      page1Notes;

    cleanPayload.page2NotWorkingExplanation =
      cleanPayload.page2NotWorkingExplanation ||
      page2Notes;

    console.log("FINAL PDF PAYLOAD", cleanPayload);

    const res = await fetch("/api/disclosure/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 2000);
  } catch (error) {
    console.error("PDF generation failed:", error);
    alert("Something went wrong while generating PDF.");
  }
}

  const steps = [
    {
      id: "Property",
      component: <Step1Property />,
      initialValues: initialValues?.Property,
    },
    {
      id: "Appliances",
      component: <Step2AppliancesPrimary />,
      initialValues: initialValues?.AppliancesPrimary,
    },
    {
      id: "Appliances Continued",
      component: <Step3AppliancesExtended />,
      initialValues: initialValues?.AppliancesExtended,
    },
    {
      id: "Systems",
      component: <Step3Systems />,
      initialValues: initialValues?.Systems,
    },
    {
      id: "Zoning",
      component: <Step4Zoning />,
      initialValues: initialValues?.Zoning,
    },
    {
      id: "Questions",
      component: <Step5QuestionsA />,
      initialValues: initialValues?.QuestionsA,
    },
    {
      id: "Questions Continued",
      component: <Step6QuestionsB />,
      initialValues: initialValues?.QuestionsB,
    },
    {
      id: "Questions Final",
      component: <Step7QuestionsC />,
      initialValues: initialValues?.QuestionsC,
    },
    {
      id: "Financial",
      component: <Step6Financial />,
      initialValues: initialValues?.Financial,
    },
    {
      id: "Signatures",
      component: <Step7Signatures />,
      initialValues: initialValues?.Signatures,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <p className="text-sm text-gray-400 font-medium">
          Loading...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold text-gray-900">
            RPCD Disclosure
          </span>

          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 px-2.5 py-1 bg-gray-100 rounded-full">
            {token ? "Client Portal" : "Draft"}
          </span>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-12 px-6">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400 mb-1">
            Form 01-01-2026
          </p>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Oklahoma Residential Property Condition Disclosure
          </h1>
        </div>

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