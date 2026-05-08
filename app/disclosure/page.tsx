"use client";

import dynamic from "next/dynamic";
import { Wizard } from "@/lib/wizard/index";
import { mergePayloads } from "@/src/lib/disclosure-engine/utils/mergePayloads";
import { buildCleanPayload } from "@/src/lib/disclosure-engine/utils/buildCleanPayload";
import { normalizeDisclosureData } from "@/src/lib/disclosure-engine/utils/normalizeDisclosureData";

const Step1Property = dynamic(() => import("./steps/Step1Property"));
const Step2AppliancesPrimary = dynamic(() => import("./steps/Step2AppliancesPrimary"));
const Step3AppliancesExtended = dynamic(() => import("./steps/Step3AppliancesExtended"));
const Step3Systems = dynamic(() => import("./steps/Step3Systems"));
const Step4Zoning = dynamic(() => import("./steps/Step4Zoning"));
const Step5QuestionsA = dynamic(() => import("./steps/Step5QuestionsA"));
const Step6QuestionsB = dynamic(() => import("./steps/Step6QuestionsB"));
const Step7QuestionsC = dynamic(() => import("./steps/Step7QuestionsC"));
const Step6Financial = dynamic(() => import("./steps/Step6Financial"));
const Step7Signatures = dynamic(() => import("./steps/Step7Signatures"));

import Navigation from "./components/Navigation";
import ProgressBar from "./components/ProgressBar";
import {
  useEffect,
  useRef,
  useState,
  useMemo,
  createContext,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const ReadOnlyContext = createContext(false);

type Props = {
  sharedToken?: string;
};

type FlatFormData = Record<string, any>;




function GeneratingOverlay() {
  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-3xl shadow-2xl px-10 py-8 flex flex-col items-center gap-5 max-w-xs w-full mx-6">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-blue-600 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-20"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </div>

        <div className="text-center">
          <p className="text-base font-bold text-gray-900 tracking-tight">
            Generating PDF…
          </p>
          <p className="text-sm text-gray-400 mt-1">
            This usually takes a few seconds
          </p>
        </div>
      </div>
    </div>
  );
}

export function DisclosurePage({ sharedToken }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const disclosureId = searchParams.get("id");
  const token = sharedToken || searchParams.get("token");

  const [initialValues, setInitialValues] = useState<any>(null);
  const [loading, setLoading] = useState(!!disclosureId || !!token);
  const [generating, setGenerating] = useState(false);
  const [isSeller2Session, setIsSeller2Session] = useState(false);
  const [hasSeller2, setHasSeller2] = useState(false);

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

        const linkIsSubmitted = !!data.link?.is_submitted;
        const seller1HasSigned =
          !!flat.signatures?.sellerSignatureBase64;

        setIsSeller2Session(
          !!token && linkIsSubmitted && seller1HasSigned
        );

        const hasSeller2Email = !!data.link?.seller2_email;
        setHasSeller2(hasSeller2Email);

        const normalized = normalizeDisclosureData(flat);

        const numbersToStrings = (obj: any): any => {
          if (obj === null || obj === undefined) return obj;
          if (typeof obj === "number") return String(obj);
          if (typeof obj !== "object") return obj;
          if (Array.isArray(obj)) return obj.map(numbersToStrings);
          const result: Record<string, any> = {};
          for (const [key, value] of Object.entries(obj)) {
            result[key] = numbersToStrings(value);
          }
          return result;
        };

        const stringified = numbersToStrings(normalized);

        setInitialValues({
          Property: {
            propertyIdentifier: stringified.propertyIdentifier,
            address: stringified.address || {
              street: stringified.propertyIdentifier
                ? stringified.propertyIdentifier.split(",")[0]?.trim()
                : "",
            },
            sellerOccupying: stringified.sellerOccupying,
            initials: stringified.initials,
            disclosureId,
          },

          AppliancesPrimary: {
            appliances: stringified.appliances,
            page1NotWorkingExplanation: stringified.page1NotWorkingExplanation,
            applianceComments: stringified.applianceComments,
          },

          AppliancesExtended: {
            appliances: stringified.appliances,
            page2NotWorkingExplanation: stringified.page2NotWorkingExplanation,
            applianceComments: stringified.applianceComments,
          },

          Systems: {
            inlineOptions: stringified.inlineOptions || {},
            sewerSystem: stringified.sewerSystem || {},
            systems: stringified.systems || {},
            systemComments: stringified.systemComments || {},
          },

          Zoning: {
            page2Zoning: stringified.page2Zoning || {},
            page2Flood: stringified.page2Flood || {},
          },

          QuestionsA: {
            questions: stringified.questions || {},
            questionComments: stringified.questionComments || {},
            q16Inline: stringified.page3TextFields
              ? {
                  roofAge: stringified.page3TextFields.roofAge,
                  layers: stringified.page3TextFields.roofLayers,
                }
              : stringified.q16Inline || {},
            q19Inline: stringified.page3TextFields
              ? {
                  annualCost: stringified.page3TextFields.termiteBaitAnnualCost,
                }
              : stringified.q19Inline || {},
          },

          QuestionsB: {
            questions: stringified.questions || {},
            questionComments: stringified.questionComments || {},
            q37Inline: {
              maintenance: (() => {
                const raw =
                  stringified.q37Inline?.maintenance ??
                  (stringified.q37Inline === "0" ? "YES" :
                   stringified.q37Inline === "1" ? "NO" : undefined);
                return raw;
              })(),
            },
          },

          QuestionsC: {
            questions: stringified.questions || {},
            questionComments: stringified.questionComments || {},
            q41Inline: stringified.q41Inline || {},
            q46Inline: stringified.q46Inline || {},
            q47Details: stringified.q47Details || {},
          },

          Financial: {
            additionalPages: stringified.additionalPages,
            explanation: stringified.explanation,
          },

          Signatures: {
            signatures: stringified.signatures,
          },
        });

        setLoading(false);
      } catch {
        setLoading(false);
      }
    };

    loadData();
  }, [disclosureId, token]);
    async function handleCompleted(
    rawFlatValues: FlatFormData,
    allStepsFromWizard?: Record<string, FlatFormData>
  ) {
    setGenerating(true);

    try {
      const allSteps =
        allStepsFromWizard ||
        perStepValuesRef.current ||
        {};

      const flatValues = mergePayloads(
        Object.values(allSteps)
      );


      /**
       * CRITICAL FIX:
       * Seller 2 flow drops disabled RHF fields.
       * Restore required explanation fields manually.
       */
      const cleanPayload = buildCleanPayload(
        flatValues,
        allSteps
      );


      if (!cleanPayload.page1NotWorkingExplanation) {
        cleanPayload.page1NotWorkingExplanation =
          flatValues.page1NotWorkingExplanation || "";
      }

      if (!cleanPayload.page2NotWorkingExplanation) {
        cleanPayload.page2NotWorkingExplanation =
          flatValues.page2NotWorkingExplanation || "";
      }

      if (
        !cleanPayload.applianceComments &&
        flatValues.applianceComments
      ) {
        cleanPayload.applianceComments =
          flatValues.applianceComments;
      }

      /**
       * Final PDF download payload — defaults to cleanPayload (Seller 1),
       * overridden in the Seller 2 branch below.
       */
      let downloadPayload = cleanPayload;

      /**
       * Shared link submit flow
       */
      if (token) {
        if (isSeller2Session) {
          /**
           * CRITICAL: Fetch Seller 1's original data BEFORE writing,
           * because the PATCH replaces form_data entirely. We need
           * Seller 1's complete data for the PDF.
           */
          const storedRes = await fetch(
            `/api/shared-links/${token}`
          );
          const storedJson = await storedRes.json();
          const seller1Data =
            storedJson?.link?.form_data || {};

          /**
           * Merge: keep ALL of Seller 1's content, overlay only
           * Seller 2's signatures and initials.
           */
          const mergedFormData = {
            ...seller1Data,
            signatures: {
              ...(seller1Data.signatures || {}),
              ...(flatValues.signatures || {}),
            },
            initials: {
              ...(seller1Data.initials || {}),
              ...(flatValues.initials || {}),
            },
          };

          await fetch(`/api/shared-links/${token}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              form_data: mergedFormData,
              pdf_payload: cleanPayload,
              seller2_submitted: true,
            }),
          });

          /**
           * Build the download PDF from Seller 1's original data
           * + Seller 2's signatures. This ensures no content fields
           * are lost from read-only wizard steps.
           */
          const completeFlatValues = {
            ...seller1Data,
            signatures: mergedFormData.signatures,
            initials: mergedFormData.initials,
            page1NotWorkingExplanation:
              seller1Data.page1NotWorkingExplanation ||
              cleanPayload.page1NotWorkingExplanation,
            page2NotWorkingExplanation:
              seller1Data.page2NotWorkingExplanation ||
              cleanPayload.page2NotWorkingExplanation,
            applianceComments:
              seller1Data.applianceComments ||
              cleanPayload.applianceComments,
          };

          downloadPayload = buildCleanPayload(
            completeFlatValues,
            {}
          );
        } else {
          await fetch(`/api/shared-links/${token}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              form_data: flatValues,
              pdf_payload: cleanPayload,
              is_submitted: true,
            }),
          });
        }
      }

      /**
       * Single-seller: mirror Seller 1's signature into the Seller 2 box
       * so both signature fields in the PDF are populated.
       */
      if (!hasSeller2 && !isSeller2Session && downloadPayload.signatures?.sellerSignatureBase64) {
        downloadPayload = {
          ...downloadPayload,
          signatures: {
            ...downloadPayload.signatures,
            seller2SignatureBase64: downloadPayload.signatures.sellerSignatureBase64,
          },
        };
      }

      const res = await fetch(
        "/api/disclosure/generate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(downloadPayload),
        }
      );

      if (!res.ok) {
        const err = await res.json();

        setGenerating(false);

        alert(
          `Failed to generate PDF: ${err.error}`
        );

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

      if (token) {
        router.push("/fill/thank-you?shared=1");
      } else {
        router.push("/fill/thank-you");
      }
    } catch (error) {
      console.error(
        "PDF generation failed:",
        error
      );

      setGenerating(false);

      alert(
        "Something went wrong while generating the PDF."
      );
    }
  }

  const steps = useMemo(
    () => [
      {
        id: "Property",
        component: (
          <Step1Property
            readOnly={isSeller2Session}
            isSeller2={isSeller2Session}
            hasSeller2Email={hasSeller2}
          />
        ),
        initialValues: initialValues?.Property,
        isReadOnly: false,
      },

      {
        id: "Appliances",
        component: <Step2AppliancesPrimary />,
        initialValues:
          initialValues?.AppliancesPrimary,
        isReadOnly: isSeller2Session,
      },

      {
        id: "Appliances Continued",
        component: <Step3AppliancesExtended />,
        initialValues:
          initialValues?.AppliancesExtended,
        isReadOnly: isSeller2Session,
      },

      {
        id: "Systems",
        component: <Step3Systems />,
        initialValues: initialValues?.Systems,
        isReadOnly: isSeller2Session,
      },

      {
        id: "Zoning",
        component: <Step4Zoning />,
        initialValues: initialValues?.Zoning,
        isReadOnly: isSeller2Session,
      },

      {
        id: "Questions",
        component: <Step5QuestionsA />,
        initialValues: initialValues?.QuestionsA,
        isReadOnly: isSeller2Session,
      },

      {
        id: "Questions Continued",
        component: <Step6QuestionsB />,
        initialValues: initialValues?.QuestionsB,
        isReadOnly: isSeller2Session,
      },

      {
        id: "Questions Final",
        component: <Step7QuestionsC />,
        initialValues: initialValues?.QuestionsC,
        isReadOnly: isSeller2Session,
      },

      {
        id: "Financial",
        component: <Step6Financial />,
        initialValues: initialValues?.Financial,
        isReadOnly: isSeller2Session,
      },

      {
        id: "Signatures",
        component: (
          <Step7Signatures
            isSeller2={isSeller2Session}
            hasSeller2={hasSeller2}
          />
        ),
        initialValues: initialValues?.Signatures,
      },
    ],
    [initialValues, isSeller2Session, hasSeller2]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 px-10 py-8 flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-20"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
          </div>

          <p className="text-sm font-semibold text-gray-500">
            Loading your disclosure…
          </p>
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
            <ReadOnlyContext.Provider
              value={isSeller2Session}
            >
              <Wizard
                steps={steps}
                onCompleted={handleCompleted}
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

export default function DisclosurePageWrapper(
  props: Props
) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f7f9fb]" />
      }
    >
      <DisclosurePage {...props} />
    </Suspense>
  );
}