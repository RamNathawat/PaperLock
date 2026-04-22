"use client";

import dynamic from "next/dynamic";
import { Wizard } from "@/lib/wizard/index";
import { mergePayloads } from "@/src/lib/disclosure-engine/utils/mergePayloads";
import { buildCleanPayload } from "@/src/lib/disclosure-engine/utils/buildCleanPayload";

const Step1Property           = dynamic(() => import("./steps/Step1Property"));
const Step2AppliancesPrimary  = dynamic(() => import("./steps/Step2AppliancesPrimary"));
const Step3AppliancesExtended = dynamic(() => import("./steps/Step3AppliancesExtended"));
const Step3Systems            = dynamic(() => import("./steps/Step3Systems"));
const Step4Zoning             = dynamic(() => import("./steps/Step4Zoning"));
const Step5QuestionsA         = dynamic(() => import("./steps/Step5QuestionsA"));
const Step6QuestionsB         = dynamic(() => import("./steps/Step6QuestionsB"));
const Step7QuestionsC         = dynamic(() => import("./steps/Step7QuestionsC"));
const Step6Financial          = dynamic(() => import("./steps/Step6Financial"));
const Step7Signatures         = dynamic(() => import("./steps/Step7Signatures"));

import Navigation from "./components/Navigation";
import ProgressBar from "./components/ProgressBar";
import { useEffect, useRef, useState, useMemo, createContext } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const ReadOnlyContext = createContext(false);

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
    const result: string[] = [];
    Object.entries(source).forEach(([key, value]) => {
      result[Number(key)] = value as string;
    });
    return result;
  }

  return [];
}

function normalizeQuestions(flat: FlatFormData) {
  const source = flat?.questions || {};
  if (Array.isArray(source)) return source;

  if (typeof source === "object" && source !== null) {
    const result: string[] = [];
    Object.entries(source).forEach(([key, value]) => {
      result[Number(key)] = value as string;
    });
    return result;
  }

  return [];
}

// ─────────────────────────────────────────────────────────────
// Full-screen loading overlay shown while PDF is generating
// ─────────────────────────────────────────────────────────────
function GeneratingOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 max-w-xs w-full mx-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <svg className="w-7 h-7 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-base font-bold text-gray-900 tracking-tight">Generating PDF…</p>
          <p className="text-sm text-gray-400 mt-1">This usually takes a few seconds</p>
        </div>
      </div>
    </div>
  );
}

export function DisclosurePage({ sharedToken }: Props) {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const disclosureId = searchParams.get("id");
  const token        = sharedToken || searchParams.get("token");

  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading]             = useState(!!disclosureId || !!token);
  const [generating, setGenerating]       = useState(false);
  const [isSeller2Session, setIsSeller2Session] = useState(false);
  const [hasSeller2, setHasSeller2]       = useState(false);

  const draftIdRef            = useRef<string | null>(disclosureId);
  const autosaveTimeoutRef    = useRef<any>(null);
  const perStepValuesRef      = useRef<Record<string, FlatFormData>>({});

  useEffect(() => {
    const loadData = async () => {
      try {
        const endpoint = token
          ? `/api/shared-links/${token}`
          : disclosureId
          ? `/api/disclosures/${disclosureId}`
          : null;

        if (!endpoint) { setLoading(false); return; }

        const res  = await fetch(endpoint, { credentials: token ? undefined : "include" });
        const data = await res.json();

        const flat: FlatFormData =
          (data.link?.form_data as FlatFormData) ||
          (data.disclosure?.form_data as FlatFormData);

        if (!flat) { setLoading(false); return; }

        // Detect Seller 2 session:
        // The link has been submitted by Seller 1 (is_submitted=true) AND
        // Seller 1's signature is already saved in the form data.
        const linkIsSubmitted  = !!data.link?.is_submitted;
        const seller1HasSigned = !!flat.signatures?.sellerSignatureBase64;
        setIsSeller2Session(!!token && linkIsSubmitted && seller1HasSigned);

        const hasSeller2Email = !!data.link?.seller2_email;
        setHasSeller2(hasSeller2Email);

        setInitialValues({
          Property: {
            propertyIdentifier: flat.propertyIdentifier,
            address: flat.address || {
              street: flat.propertyIdentifier ? flat.propertyIdentifier.split(",")[0]?.trim() : "",
            },
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
            systemComments: flat.systemComments,
          },
          Zoning: {
            page2Zoning: flat.page2Zoning,
            page2Flood: flat.page2Flood,
          },
          QuestionsA: {
            questions: normalizeQuestions(flat),
            questionComments: flat.questionComments,
            q16Inline: flat.page3TextFields
              ? { roofAge: flat.page3TextFields.roofAge, layers: flat.page3TextFields.roofLayers }
              : flat.q16Inline,
            q19Inline: flat.page3TextFields
              ? { annualCost: flat.page3TextFields.termiteBaitAnnualCost }
              : flat.q19Inline,
          },
          QuestionsB: {
            questions: normalizeQuestions(flat),
            questionComments: flat.questionComments,
            q37Inline: flat.q37Inline,
          },
          QuestionsC: {
            questions: normalizeQuestions(flat),
            questionComments: flat.questionComments,
            q41Inline: flat.q41Inline,
            q46Inline: flat.q46Inline,
            q47Details: flat.q47Details,
          },
          Financial: {
            additionalPages: flat.additionalPages,
            explanation: flat.explanation,
          },
          Signatures: { signatures: flat.signatures },
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
      if (Array.isArray(a) || Array.isArray(b)) {
        const res = [...(Array.isArray(a) ? a : [])];
        const bArr = Array.isArray(b) ? b : [];
        bArr.forEach((v, i) => {
          if (v !== undefined && v !== null) res[i] = v;
        });
        return res;
      }
      const res: Record<string, any> = { ...(a || {}) };
      if (b) {
        Object.entries(b).forEach(([k, v]) => {
          if (v !== undefined && v !== null) res[k] = v;
        });
      }
      return res;
    };

    const flat: FlatFormData = Object.values(allValues).reduce(
      (acc: FlatFormData, value: FlatFormData) => {
        const merged = { ...acc, ...value };
        if (acc.appliances || value.appliances)
          merged.appliances = safeMerge(acc.appliances, value.appliances);
        if (acc.applianceComments || value.applianceComments)
          merged.applianceComments = safeMerge(acc.applianceComments, value.applianceComments);
        if (acc.questions || value.questions)
          merged.questions = safeMerge(acc.questions, value.questions);
        if (acc.questionComments || value.questionComments)
          merged.questionComments = safeMerge(acc.questionComments, value.questionComments);
        if (acc.systemComments || value.systemComments)
          merged.systemComments = safeMerge(acc.systemComments, value.systemComments);
        if (acc.inlineOptions || value.inlineOptions)
          merged.inlineOptions = safeMerge(acc.inlineOptions, value.inlineOptions);
        if (acc.sewerSystem || value.sewerSystem)
          merged.sewerSystem = safeMerge(acc.sewerSystem, value.sewerSystem);
        if (acc.q41Inline || value.q41Inline)
          merged.q41Inline = safeMerge(acc.q41Inline, value.q41Inline);
        if (acc.q46Inline || value.q46Inline)
          merged.q46Inline = safeMerge(acc.q46Inline, value.q46Inline);
        if (acc.page2Flood || value.page2Flood)
          merged.page2Flood = safeMerge(acc.page2Flood, value.page2Flood);
        if (acc.q47Details || value.q47Details)
          merged.q47Details = safeMerge(acc.q47Details, value.q47Details);
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

    if (autosaveTimeoutRef.current) clearTimeout(autosaveTimeoutRef.current);

    autosaveTimeoutRef.current = setTimeout(async () => {
      await fetch(endpoint, {
        method: "PATCH",
        credentials: token ? undefined : "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          token
            ? { form_data: flat }
            : { property_identifier: flat.propertyIdentifier || "Untitled", form_data: flat }
        ),
      });
    }, 500);
  }

  async function handleCompleted(
    rawFlatValues: FlatFormData,
    allStepsFromWizard?: Record<string, FlatFormData>
  ) {
    setGenerating(true);

    try {
      // In the seller 2 (read-only) flow the wizard never calls handleNext on
      // read-only steps, so allStepsFromWizard is missing those entries entirely.
      // Seed each step from initialValues so that applianceComments,
      // page1NotWorkingExplanation, and any other seller-1 data is always present
      // in allSteps before buildCleanPayload runs.
      const wizardSteps = allStepsFromWizard || perStepValuesRef.current || {};
      const stepToInitialKey: Record<string, keyof NonNullable<typeof initialValues>> = {
        "Appliances":          "AppliancesPrimary",
        "Appliances Continued":"AppliancesExtended",
        "Systems":             "Systems",
        "Zoning":              "Zoning",
        "Questions":           "QuestionsA",
        "Questions Continued": "QuestionsB",
        "Questions Final":     "QuestionsC",
        "Financial":           "Financial",
        "Property":            "Property",
        "Signatures":          "Signatures",
      };
      const allSteps: Record<string, FlatFormData> = { ...wizardSteps };
      if (initialValues) {
        Object.entries(stepToInitialKey).forEach(([stepId, initKey]) => {
          if (!allSteps[stepId] && initialValues[initKey]) {
            allSteps[stepId] = initialValues[initKey];
          }
        });
      }

      const flatValues  = mergePayloads(Object.values(allSteps));
      const cleanPayload = buildCleanPayload(flatValues, allSteps);

      // ── Shared link: fire the appropriate submit flag ──
      if (token) {
        if (isSeller2Session) {
          // Seller 2 co-signing: this is the FINAL submit — triggers email + PDF
          await fetch(`/api/shared-links/${token}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              form_data:          flatValues,
              pdf_payload:        cleanPayload,
              seller2_submitted:  true,
            }),
          });
        } else {
          // Seller 1 submitting:
          // - If hasSeller2: server will send Seller 2 an invite (no PDF email yet)
          // - If no Seller 2: server will send the final PDF email immediately
          await fetch(`/api/shared-links/${token}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              form_data:    flatValues,
              pdf_payload:  cleanPayload,
              is_submitted: true,
            }),
          });
        }
      }

      // ── Generate and download PDF ──
      const res = await fetch("/api/disclosure/generate", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(cleanPayload),
      });

      if (!res.ok) {
        const err = await res.json();
        setGenerating(false);
        alert(`Failed to generate PDF: ${err.error}`);
        return;
      }

      const blob = await res.blob();
      const url  = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href     = url;
      link.download = "disclosure.pdf";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => window.URL.revokeObjectURL(url), 2000);

      // ── Redirect to thank-you page ──
      if (token) {
        router.push("/fill/thank-you?shared=1");
      } else {
        router.push("/fill/thank-you");
      }

    } catch (error) {
      console.error("PDF generation failed:", error);
      setGenerating(false);
      alert("Something went wrong while generating the PDF.");
    }
  }

  const steps = useMemo(() => [
    { id: "Property",            component: <Step1Property readOnly={isSeller2Session} isSeller2={isSeller2Session} hasSeller2Email={hasSeller2} />, initialValues: initialValues?.Property },
    { id: "Appliances",          component: <Step2AppliancesPrimary />,  initialValues: initialValues?.AppliancesPrimary },
    { id: "Appliances Continued",component: <Step3AppliancesExtended />, initialValues: initialValues?.AppliancesExtended },
    { id: "Systems",             component: <Step3Systems />,            initialValues: initialValues?.Systems },
    { id: "Zoning",              component: <Step4Zoning />,             initialValues: initialValues?.Zoning },
    { id: "Questions",           component: <Step5QuestionsA />,         initialValues: initialValues?.QuestionsA },
    { id: "Questions Continued", component: <Step6QuestionsB />,         initialValues: initialValues?.QuestionsB },
    { id: "Questions Final",     component: <Step7QuestionsC />,         initialValues: initialValues?.QuestionsC },
    { id: "Financial",           component: <Step6Financial />,          initialValues: initialValues?.Financial },
    { id: "Signatures",          component: <Step7Signatures isSeller2={isSeller2Session} />, initialValues: initialValues?.Signatures },
  ], [initialValues, isSeller2Session, hasSeller2]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-10 py-8 flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-500">Loading your disclosure…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      {generating && <GeneratingOverlay />}

      <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6 sm:p-8">
          <div className="py-2.5 disclosure-form">
            <ReadOnlyContext.Provider value={isSeller2Session}>
              <Wizard
                steps={steps}
                onCompleted={handleCompleted}
                onStepChanged={handleStepChanged}
                footer={<Navigation />}
                header={<ProgressBar />}
              />
            </ReadOnlyContext.Provider>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";

export default function DisclosurePageWrapper(props: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f9fb]" />}>
      <DisclosurePage {...props} />
    </Suspense>
  );
}