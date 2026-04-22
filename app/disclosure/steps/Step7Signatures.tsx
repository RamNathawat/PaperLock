"use client";

import { useFormContext } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useWizard } from "@/lib/wizard/index";
import SignatureCanvas from "react-signature-canvas";
import { motion, AnimatePresence } from "framer-motion";
import { mergePayloads } from "@/src/lib/disclosure-engine/utils/mergePayloads";
import { buildCleanPayload } from "@/src/lib/disclosure-engine/utils/buildCleanPayload";


// ─────────────────────────────────────────────────────────────
// Reusable signature pad + modal
// ─────────────────────────────────────────────────────────────
function SigPad({
  fieldName,
  label,
  required = true,
  showErrors,
  errors,
  register,
  setValue,
}: {
  fieldName: string;
  label: string;
  required?: boolean;
  showErrors: boolean;
  errors: any;
  register: any;
  setValue: any;
}) {
  const [open, setOpen] = useState(false);
  const padRef = useRef<SignatureCanvas>(null);

  // Watch current value by reading it from the form at render time
  const { watch } = useFormContext();
  const current = watch(fieldName);

  const fieldError = fieldName.split(".").reduce((obj: any, k) => obj?.[k], errors);
  const hasError = showErrors && !!fieldError;

  const handleSave = () => {
    if (padRef.current?.isEmpty()) { alert("Please provide a signature first."); return; }
    const dataUrl = padRef.current?.getTrimmedCanvas().toDataURL("image/png");
    setValue(fieldName, dataUrl, { shouldValidate: true, shouldDirty: true });
    setOpen(false);
  };

  return (
    <>
      <div className={`rounded-xl border p-5 space-y-4 bg-white ${hasError ? "border-amber-300" : "border-gray-100"}`}>
        {hasError && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <p className="text-xs font-semibold text-amber-700">Signature required before continuing</p>
          </div>
        )}

        <p className="text-sm font-bold text-gray-800">
          {label} {required && <span className="text-red-500">*</span>}
        </p>

        <div className="space-y-3">
          <input type="hidden" {...register(fieldName, required ? { required: true } : {})} />

          {current ? (
            <div className="border border-gray-200 rounded-xl p-2 bg-gray-50 flex flex-col items-center">
              <img src={current} alt={label} className="max-h-24 object-contain" />
              <button type="button" onClick={() => setOpen(true)}
                className="mt-2 text-[11px] font-semibold text-[#2463EB] hover:underline">
                Tap to redraw signature
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setOpen(true)}
              className={`w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl h-28 bg-gray-50 hover:bg-gray-100 transition-colors ${
                hasError ? "border-amber-300 bg-amber-50" : "border-gray-200"
              }`}>
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              <span className="text-sm font-medium text-gray-600">Tap to Sign</span>
            </button>
          )}
          <p className="text-[10px] text-gray-400">By signing, you are electronically signing this document.</p>
        </div>
      </div>

      {/* Signature Modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50 shadow-sm">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Sign Document</h3>
                <p className="text-xs text-gray-500">{label} — please sign below</p>
              </div>
              <button type="button" onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300 transition-colors">✕</button>
            </div>

            <div className="flex-1 bg-white relative">
              <SignatureCanvas ref={padRef}
                canvasProps={{ className: "absolute inset-0 w-full h-full" }}
                minWidth={1.5} maxWidth={3} dotSize={2} penColor="#2463EB" />
              <div className="absolute inset-x-0 bottom-1/4 pointer-events-none flex items-center justify-center opacity-20">
                <p className="text-3xl font-black uppercase tracking-widest text-gray-300 select-none">Sign Here</p>
              </div>
              <div className="absolute left-10 right-10 bottom-1/4 border-b-2 border-gray-200 pointer-events-none opacity-50" />
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-4">
              <button type="button" onClick={() => padRef.current?.clear()}
                className="flex-1 py-4 text-sm font-bold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                Clear
              </button>
              <button type="button" onClick={handleSave}
                className="flex-[2] py-4 text-sm font-bold text-white bg-[#2463EB] shadow-md rounded-xl hover:bg-blue-700 transition-colors flex justify-center items-center gap-2">
                Save Signature <span className="bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">✔</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Step7Signatures
// ─────────────────────────────────────────────────────────────
export default function Step7Signatures({ isSeller2 }: { isSeller2?: boolean }) {
  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors, submitCount },
  } = useFormContext();
  const { values } = useWizard();


  const showErrors = submitCount > 0;

  const seller1Sig = watch("signatures.sellerSignatureBase64");

  const [pdfUrl,     setPdfUrl]     = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError,   setPdfError]   = useState(false);
  const prevUrlRef = useRef<string | null>(null);

  const currentBase64 = isSeller2
    ? watch("signatures.seller2SignatureBase64")
    : seller1Sig;

  useEffect(() => {
    let cancelled = false;

    async function generatePreview() {
      setPdfLoading(true);
      setPdfError(false);

      try {
        const flat: Record<string, any> = mergePayloads(Object.values(values || {}));
        const sigs = getValues("signatures");
        if (sigs) flat.signatures = { ...(flat.signatures || {}), ...sigs };
        const cleanPayload = buildCleanPayload(flat, values as any);
        const payloadHash = JSON.stringify({ ...cleanPayload, version: "01-01-2026", isPreview: true });

        if ((window as any).__cachedPdfHash === payloadHash && (window as any).__cachedPdfUrl) {
          if (prevUrlRef.current && prevUrlRef.current !== (window as any).__cachedPdfUrl) {
            URL.revokeObjectURL(prevUrlRef.current);
          }
          prevUrlRef.current = (window as any).__cachedPdfUrl;
          if (!cancelled) { setPdfUrl((window as any).__cachedPdfUrl); setPdfLoading(false); }
          return;
        }

        const res = await fetch("/api/disclosure/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payloadHash,
        });

        if (!res.ok || cancelled) return;

        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);

        if (prevUrlRef.current && prevUrlRef.current !== (window as any).__cachedPdfUrl) {
          URL.revokeObjectURL(prevUrlRef.current);
        }
        prevUrlRef.current = url;
        if (!cancelled) { setPdfUrl(url); setPdfLoading(false); }
      } catch {
        if (!cancelled) { setPdfError(true); setPdfLoading(false); }
      }
    }

    generatePreview();
    return () => { cancelled = true; };
  }, [currentBase64, getValues, values]);

  useEffect(() => {
    return () => {
      if (prevUrlRef.current && prevUrlRef.current !== (window as any).__cachedPdfUrl) {
        URL.revokeObjectURL(prevUrlRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Final Step</p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">Review &amp; Sign</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review the generated disclosure below, then add your signature to complete.
        </p>
      </div>

      {/* If Seller 2: show a notice explaining the context */}
      {isSeller2 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center mt-0.5 flex-shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-900">Co-Seller Signature Required</p>
            <p className="text-xs text-blue-700 mt-0.5">
              The disclosure was completed and signed by Seller 1. Please review and add your own signature below to cosign the document.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:items-start">
        {/* ── PDF Preview ── */}
        <div className="w-full lg:col-span-7 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Document Preview</p>
          <div className="relative rounded-xl bg-gray-50 border border-gray-100 overflow-hidden">
            {pdfLoading && (
              <div className="flex flex-col items-center justify-center gap-3 text-gray-400"
                   style={{ height: "min(620px, 60vw)" }}>
                <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <p className="text-sm">Generating preview…</p>
              </div>
            )}
            {pdfError && !pdfLoading && (
              <div className="flex flex-col items-center justify-center gap-2 text-gray-400"
                   style={{ height: "min(620px, 60vw)" }}>
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-400">Preview unavailable</p>
                <p className="text-xs text-gray-300">The PDF will still be generated on submit</p>
              </div>
            )}
            {pdfUrl && !pdfLoading && (
              <>
                <iframe src={pdfUrl} title="Disclosure PDF Preview" className="w-full rounded-xl"
                  style={{ height: "min(620px, 75vw)" }} />
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Full screen
                </a>
              </>
            )}
          </div>
        </div>

        {/* ── Signature panel ── */}
        <div className="w-full lg:col-span-5 lg:sticky lg:top-24 space-y-4">

          {isSeller2 ? (
            <div className="space-y-4">
              {/* Persist Seller 1's signature data so RHF doesn't drop it */}
              <input type="hidden" {...register("signatures.sellerSignatureBase64")} />
              <input type="hidden" {...register("signatures.sellerName")} />
              <input type="hidden" {...register("signatures.sellerDate")} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Seller 1 — locked read-only display */}
                <div className="rounded-xl border border-gray-100 p-5 space-y-3 bg-gray-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-sm font-bold text-gray-700">Seller 1</p>
                    </div>
                    <p className="text-xs text-green-700 font-medium">Already Signed</p>
                  </div>
                  {seller1Sig ? (
                    <div className="border border-gray-200 rounded-xl p-2 bg-white flex flex-col items-center">
                      <img src={seller1Sig} alt="Seller 1 Signature" className="max-h-24 object-contain opacity-75" />
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-xl p-4 bg-white flex flex-col items-center justify-center h-28">
                      <p className="text-xs text-gray-400 italic">No signature on file</p>
                    </div>
                  )}
                </div>

                {/* Seller 2 — active signature pad */}
                <div className="flex flex-col">
                  <SigPad
                    fieldName="signatures.seller2SignatureBase64"
                    label="Seller 2"
                    required={true}
                    showErrors={showErrors}
                    errors={errors}
                    register={register}
                    setValue={setValue}
                  />
                </div>
              </div>

              {/* Seller 2 name + date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Printed Name <span className="text-red-400">*</span></label>
                  <input
                    {...register("signatures.seller2Name", { required: true })}
                    type="text"
                    placeholder="Full name"
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB] ${
                      showErrors && (errors as any)?.signatures?.seller2Name ? "border-amber-300 bg-amber-50" : "border-gray-200"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date <span className="text-red-400">*</span></label>
                  <input
                    {...register("signatures.seller2Date", { required: true })}
                    type="date"
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB] ${
                      showErrors && (errors as any)?.signatures?.seller2Date ? "border-amber-300 bg-amber-50" : "border-gray-200"
                    }`}
                  />
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Seller 1 signature pad */}
              <SigPad
                fieldName="signatures.sellerSignatureBase64"
                label="Seller Signature"
                required={true}
                showErrors={showErrors}
                errors={errors}
                register={register}
                setValue={setValue}
              />

              {/* Seller 1 name + date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Printed Name <span className="text-red-400">*</span></label>
                  <input
                    {...register("signatures.sellerName", { required: true })}
                    type="text"
                    placeholder="Full name"
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB] ${
                      showErrors && (errors as any)?.signatures?.sellerName ? "border-amber-300 bg-amber-50" : "border-gray-200"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Date <span className="text-red-400">*</span></label>
                  <input
                    {...register("signatures.sellerDate", { required: true })}
                    type="date"
                    className={`w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB] ${
                      showErrors && (errors as any)?.signatures?.sellerDate ? "border-amber-300 bg-amber-50" : "border-gray-200"
                    }`}
                  />
                </div>
              </div>
            </>
          )}

          {/* Security notice */}
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#2463EB] shrink-0 shadow-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-700">Legally binding document</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                By signing you certify all information is accurate to the best of your knowledge.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}