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

export default function DisclosurePage() {
  const searchParams = useSearchParams();
  const disclosureId = searchParams.get("id");
  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState(!!disclosureId);
  const draftIdRef = useRef<string | null>(disclosureId);

  useEffect(() => {
    if (!disclosureId) {
      setLoading(false);
      return;
    }
    draftIdRef.current = disclosureId;
    fetch(`/api/disclosures/${disclosureId}`, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.disclosure?.form_data) {
          setInitialValues({
            ...data.disclosure.form_data,
            disclosureId,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [disclosureId]);

  async function handleStepChanged(_from: any, _to: any, allValues: any) {
    const flat: any = Object.values(allValues).reduce((acc: any, v: any) => ({ ...acc, ...v }), {} as any);

    if (draftIdRef.current) {
      await fetch(`/api/disclosures/${draftIdRef.current}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_identifier: flat.propertyIdentifier || "Untitled",
          form_data: { ...flat, disclosureId: draftIdRef.current },
        }),
      });
    } else {
      const res = await fetch("/api/disclosures", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          property_identifier: flat.propertyIdentifier || "Untitled",
          form_data: flat,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        draftIdRef.current = data.disclosure.id;
      }
    }
  }

  async function handleCompleted(values: any) {
    const questionsRecord: Record<number, "YES" | "NO"> = {};
    if (Array.isArray(values.questions)) {
      values.questions.forEach((val: any, idx: number) => {
        if (val === "YES" || val === "NO") {
          questionsRecord[idx] = val;
        }
      });
    } else if (values.questions) {
      Object.assign(questionsRecord, values.questions);
    }

    const payload: DisclosureInput = {
      version: "01-01-2026",
      propertyIdentifier: values.propertyIdentifier,
      sellerOccupying: Number(values.sellerOccupying) as 0 | 1,
      appliances: values.appliances,
      sewerSystem: values.sewerSystem?.type !== null && values.sewerSystem?.type !== undefined
        ? {
            type: Number(values.sewerSystem.type) as 0 | 1,
            privateType: values.sewerSystem.privateType !== null && values.sewerSystem.privateType !== undefined
              ? Number(values.sewerSystem.privateType) as 0 | 1 | 2
              : undefined,
          }
        : undefined,
      inlineOptions: values.inlineOptions
        ? {
            waterHeaterType: values.inlineOptions.waterHeaterType !== undefined
              ? Number(values.inlineOptions.waterHeaterType) as 0 | 1 | 2
              : undefined,
            waterSoftenerType: values.inlineOptions.waterSoftenerType !== undefined
              ? Number(values.inlineOptions.waterSoftenerType) as 0 | 1
              : undefined,
            acType: values.inlineOptions.acType !== undefined
              ? Number(values.inlineOptions.acType) as 0 | 1 | 2
              : undefined,
            heatingType: values.inlineOptions.heatingType !== undefined
              ? Number(values.inlineOptions.heatingType) as 0 | 1 | 2
              : undefined,
            gasSupplyType: values.inlineOptions.gasSupplyType !== undefined
              ? Number(values.inlineOptions.gasSupplyType) as 0 | 1 | 2
              : undefined,
            propaneTankType: values.inlineOptions.propaneTankType !== undefined
              ? Number(values.inlineOptions.propaneTankType) as 0 | 1
              : undefined,
            generatorType: values.inlineOptions.generatorType !== undefined
              ? Number(values.inlineOptions.generatorType) as 0 | 1 | 2
              : undefined,
            waterSourceType: values.inlineOptions.waterSourceType !== undefined
              ? Number(values.inlineOptions.waterSourceType) as 0 | 1 | 2
              : undefined,
            fireSuppresionDate: values.inlineOptions.fireSuppresionDate,
            securitySystemType: values.inlineOptions.securitySystemType !== undefined
              ? Number(values.inlineOptions.securitySystemType) as 0 | 1 | 2 | 3
              : undefined,
            solarPanelType: values.inlineOptions.solarPanelType !== undefined
              ? Number(values.inlineOptions.solarPanelType) as 0 | 1 | 2
              : undefined,
          }
        : undefined,
      page2Zoning: values.page2Zoning
        ? {
            zoningType: values.page2Zoning.zoningType,
            historicalDistrict: values.page2Zoning.historicalDistrict !== undefined
              ? Number(values.page2Zoning.historicalDistrict) as 0 | 1 | 2
              : undefined,
          }
        : undefined,
      page2Flood: values.page2Flood
        ? {
            q3Main: values.page2Flood.q3Main !== undefined
              ? Number(values.page2Flood.q3Main) as 0 | 1 | 2
              : undefined,
            q3Types: Array.isArray(values.page2Flood.q3Types) && values.page2Flood.q3Types.length > 0
              ? values.page2Flood.q3Types.map(Number)
              : undefined,
            q3Municipal: values.page2Flood.q3Municipal !== undefined
              ? Number(values.page2Flood.q3Municipal) as 0 | 1 | 2
              : undefined,
            q4: values.page2Flood.q4 !== undefined
              ? Number(values.page2Flood.q4) as 0 | 1 | 2
              : undefined,
            q5: values.page2Flood.q5,
            q6: values.page2Flood.q6,
          }
        : undefined,
      page2NotWorkingExplanation: values.page2NotWorkingExplanation,
      questions: questionsRecord,
      page3TextFields: values.page3TextFields,
      q37Inline: values.q37Inline !== undefined
        ? Number(values.q37Inline) as 0 | 1
        : undefined,
      q37DamMaintenance: values.q37DamMaintenance,
      q41Inline: values.q41Inline
        ? {
            hoaAmount: values.q41Inline.hoaAmount,
            specialAssessmentAmount: values.q41Inline.specialAssessmentAmount,
            payableType: values.q41Inline.payableType !== undefined
              ? Number(values.q41Inline.payableType) as 0 | 1 | 2
              : undefined,
            unpaid: values.q41Inline.unpaid,
            ifYesAmount: values.q41Inline.ifYesAmount,
            managerName: values.q41Inline.managerName,
            phone: values.q41Inline.phone,
          }
        : undefined,
      q46Inline: values.q46Inline
        ? {
            payableType: values.q46Inline.payableType !== undefined
              ? Number(values.q46Inline.payableType) as 0 | 1 | 2
              : undefined,
            amount: values.q46Inline.amount,
            paidTo: values.q46Inline.paidTo,
          }
        : undefined,
      q47Details: values.q47Details
        ? {
            utilities: Array.isArray(values.q47Details.utilities) && values.q47Details.utilities.length > 0
              ? values.q47Details.utilities.map(Number)
              : undefined,
            otherExplain: values.q47Details.otherExplain,
            initialMembership: values.q47Details.initialMembership,
            annualMembership: values.q47Details.annualMembership,
          }
        : undefined,
      explanation: values.explanation,
      additionalPages: values.additionalPages,
      initials: values.initials,
      signatures: values.signatures,
    };

    if (draftIdRef.current) {
      await fetch(`/api/disclosures/${draftIdRef.current}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          property_identifier: values.propertyIdentifier,
          form_data: values,
        }),
      });
    }

    const res = await fetch("/api/disclosure/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "disclosure.pdf";
    a.click();
    URL.revokeObjectURL(url);
  }

  const steps = [
    {
      id: "Property",
      component: <Step1Property />,
      initialValues: initialValues ? {
        propertyIdentifier: initialValues.propertyIdentifier,
        sellerOccupying: initialValues.sellerOccupying,
        initials: initialValues.initials,
        disclosureId: initialValues.disclosureId,
      } : undefined
    },
    {
      id: "Appliances",
      component: <Step2Appliances />,
      initialValues: initialValues ? {
        appliances: initialValues.appliances,
        page2NotWorkingExplanation: initialValues.page2NotWorkingExplanation
      } : undefined
    },
    {
      id: "Systems",
      component: <Step3Systems />,
      initialValues: initialValues ? {
        inlineOptions: initialValues.inlineOptions,
        sewerSystem: initialValues.sewerSystem
      } : undefined
    },
    {
      id: "Zoning",
      component: <Step4Zoning />,
      initialValues: initialValues ? {
        page2Zoning: initialValues.page2Zoning,
        page2Flood: initialValues.page2Flood
      } : undefined
    },
    {
      id: "Questions",
      component: <Step5Questions />,
      initialValues: initialValues ? {
        questions: initialValues.questions,
        page3TextFields: initialValues.page3TextFields,
        q37Inline: initialValues.q37Inline,
        q37DamMaintenance: initialValues.q37DamMaintenance,
        q41Inline: initialValues.q41Inline,
        q46Inline: initialValues.q46Inline,
        q47Details: initialValues.q47Details,
        explanation: initialValues.explanation
      } : undefined
    },
    {
      id: "Financial",
      component: <Step6Financial />,
      initialValues: initialValues ? {
        additionalPages: initialValues.additionalPages
      } : undefined
    },
    {
      id: "Signatures",
      component: <Step7Signatures />,
      initialValues: initialValues ? {
        signatures: initialValues.signatures
      } : undefined
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading draft...</p>
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