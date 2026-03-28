"use client";

import { Wizard } from "@/lib/wizard/index";
import Step1Property from "./steps/Step1Property";
import Step2Appliances from "./steps/Step2Appliances";
import Step3Systems from "./steps/Step3Systems";
import Step4Zoning from "./steps/Step4Zoning";
import Step5Questions from "./steps/Step5Questions";
import Step6Financial from "./steps/Step6Financial";
import Step7Signatures from "./steps/Step7Signatures";
import Navigation from "./components/Navigation";
import ProgressBar from "./components/ProgressBar";
import { DisclosureInput } from "@/src/lib/disclosure-engine/schema/disclosure.schema";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type Props = {
  sharedToken?: string;
};

// 🔥 normalize appliances for Step2 (index-based)
function normalizeAppliances(flat: any) {
  const source =
    flat?.appliances ||
    flat?.Appliances?.appliances ||
    flat?.Appliances ||
    {};

  if (Array.isArray(source)) return source;

  if (typeof source === "object") {
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

  const disclosureId = searchParams.get("id");
  const token = sharedToken || searchParams.get("token");

  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState(!!disclosureId || !!token);
  const draftIdRef = useRef<string | null>(disclosureId);

  const autosaveTimeoutRef = useRef<any>(null);

  // =============================
  // LOAD
  // =============================
  useEffect(() => {
    // 🔥 CLIENT FLOW (public)
    if (token) {
      fetch(`/api/shared-links/${token}`)
        .then(res => res.json())
        .then(data => {
          if (data.link?.form_data) {
            setInitialValues(data.link.form_data);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));

      return;
    }

    // 🔥 DASHBOARD FLOW
    if (!disclosureId) {
      setLoading(false);
      return;
    }

    draftIdRef.current = disclosureId;

    fetch(`/api/disclosures/${disclosureId}`, {
      credentials: "include",
    })
      .then(res => res.json())
      .then(data => {
        if (data.disclosure?.form_data) {
          const flat = data.disclosure.form_data;

          // 🔥 map flat → step structure
          setInitialValues({
            Property: {
              propertyIdentifier: flat.propertyIdentifier,
              sellerOccupying: flat.sellerOccupying,
              initials: flat.initials,
              disclosureId,
            },
            Appliances: {
              appliances: normalizeAppliances(flat),
              page2NotWorkingExplanation:
                flat.page2NotWorkingExplanation,
            },
            Systems: {
              inlineOptions: flat.inlineOptions,
              sewerSystem: flat.sewerSystem,
            },
            Zoning: {
              page2Zoning: flat.page2Zoning,
              page2Flood: flat.page2Flood,
            },
            Questions: {
              questions: flat.questions,
              page3TextFields: flat.page3TextFields,
              q37Inline: flat.q37Inline,
              q37DamMaintenance: flat.q37DamMaintenance,
              q41Inline: flat.q41Inline,
              q46Inline: flat.q46Inline,
              q47Details: flat.q47Details,
              explanation: flat.explanation,
            },
            Financial: {
              additionalPages: flat.additionalPages,
            },
            Signatures: {
              signatures: flat.signatures,
            },
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [disclosureId, token]);

  // =============================
  // AUTOSAVE
  // =============================
  async function handleStepChanged(_from: any, _to: any, allValues: any) {
    type FormValues = Record<string, any>;

    const flat = Object.values(allValues as FormValues).reduce(
      (acc, v) => ({ ...acc, ...v }),
      {} as FormValues
    );

    // 🔥 CLIENT FLOW
    if (token) {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
      }

      autosaveTimeoutRef.current = setTimeout(async () => {
        try {
          await fetch(`/api/shared-links/${token}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              form_data: flat,
            }),
          });
        } catch (err) {
          console.error("Autosave failed:", err);
        }
      }, 500);

      return;
    }

    // 🔥 DASHBOARD FLOW
    if (draftIdRef.current) {
      await fetch(`/api/disclosures/${draftIdRef.current}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_identifier: flat.propertyIdentifier || "Untitled",
          form_data: flat,
        }),
      });
    }
  }

  // =============================
  // COMPLETE
  // =============================
  async function handleCompleted(values: any) {
    if (token) {
      await fetch(`/api/shared-links/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          form_data: values,
          is_submitted: true,
        }),
      });
    }

    const res = await fetch("/api/disclosure/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "disclosure.pdf";
    a.click();

    URL.revokeObjectURL(url);
  }

  const steps = [
    { id: "Property", component: <Step1Property />, initialValues: initialValues?.Property },
    { id: "Appliances", component: <Step2Appliances />, initialValues: initialValues?.Appliances },
    { id: "Systems", component: <Step3Systems />, initialValues: initialValues?.Systems },
    { id: "Zoning", component: <Step4Zoning />, initialValues: initialValues?.Zoning },
    { id: "Questions", component: <Step5Questions />, initialValues: initialValues?.Questions },
    { id: "Financial", component: <Step6Financial />, initialValues: initialValues?.Financial },
    { id: "Signatures", component: <Step7Signatures />, initialValues: initialValues?.Signatures },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto py-10 px-4">

        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Oklahoma Residential Property Condition Disclosure
        </h1>
        <p className="text-gray-500 text-sm mb-8">Form 01-01-2026</p>

        <Wizard
          steps={steps}
          onCompleted={handleCompleted}
          onStepChanged={handleStepChanged}
          footer={<Navigation />}
          header={<ProgressBar />}
        />
      </div>
    </div>
  );
}