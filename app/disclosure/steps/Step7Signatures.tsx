"use client";

import { useFormContext } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import { useWizard } from "@/lib/wizard/index";

// ─────────────────────────────────────────────────────────────
// Signature upload sub-component
// ─────────────────────────────────────────────────────────────
function SignatureUpload({
  name,
  required = false,
}: {
  name: string;
  required?: boolean;
}) {
  const {
    setValue,
    register,
    formState: { errors, submitCount },
  } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);

  const parts = name.split(".");
  let err: any = errors;
  for (const p of parts) { err = err?.[p]; if (!err) break; }
  const hasError = submitCount > 0 && required && !!err;

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setValue(name, base64, { shouldValidate: true });
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <input {...register(name, required ? { required: true } : {})} type="hidden" />
      <label
        className={`flex flex-col items-center justify-center w-full h-28 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
          preview
            ? "border-[#2463EB]/40 bg-blue-50"
            : hasError
            ? "border-red-400 bg-red-50"
            : "border-gray-200 bg-gray-50 hover:border-[#2463EB]/40 hover:bg-blue-50"
        }`}
      >
        {preview ? (
          <img src={preview} alt="Signature" className="h-20 object-contain p-2" />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <span className="text-xs font-medium">Upload signature image</span>
            <span className="text-[10px] text-gray-300">PNG or JPG</span>
          </div>
        )}
        <input type="file" accept="image/png,image/jpeg" onChange={handleFile} className="hidden" />
      </label>
      {hasError && (
        <p className="text-xs font-bold text-red-600 uppercase tracking-wide">
          Signature required before continuing
        </p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main Step7Signatures
// ─────────────────────────────────────────────────────────────
export default function Step7Signatures() {
  const {
    register,
    formState: { errors, submitCount },
  } = useFormContext();
  const { values } = useWizard();

  const showErrors = submitCount > 0;

  const [pdfUrl,     setPdfUrl]     = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const [pdfError,   setPdfError]   = useState(false);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function generatePreview() {
      setPdfLoading(true);
      setPdfError(false);

      try {
        const flat: Record<string, any> = {};
        Object.values(values || {}).forEach((stepVals: any) => {
          if (stepVals && typeof stepVals === "object") Object.assign(flat, stepVals);
        });

        const res = await fetch("/api/disclosure/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...flat, version: "01-01-2026" }),
        });

        if (!res.ok || cancelled) return;

        const blob = await res.blob();
        const url  = URL.createObjectURL(blob);

        if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = url;

        if (!cancelled) { setPdfUrl(url); setPdfLoading(false); }
      } catch {
        if (!cancelled) { setPdfError(true); setPdfLoading(false); }
      }
    }

    generatePreview();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => { if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current); };
  }, []);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Final Step
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mt-1">Review & Sign</h2>
        <p className="text-sm text-gray-500 mt-1">
          Review the generated disclosure below, then add your signature to complete.
        </p>
      </div>

      {/*
        Layout:
        - Mobile:  PDF preview stacked above signature panel, full width
        - Tablet+: side by side, PDF left (7 cols), sig right (5 cols)
      */}
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-5 lg:items-start">

        {/* ── PDF Preview ── */}
        <div className="w-full lg:col-span-7 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Document Preview
          </p>

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
                <iframe
                  src={pdfUrl}
                  title="Disclosure PDF Preview"
                  className="w-full rounded-xl"
                  style={{ height: "min(620px, 75vw)" }}
                />
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                >
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

          {/* Seller — required */}
          <div
            className={`relative rounded-xl border p-5 space-y-4 bg-white ${
              showErrors && (errors as any)?.signatures?.sellerSignatureBase64
                ? "border-red-300"
                : "border-gray-100"
            }`}
          >
            {showErrors && (errors as any)?.signatures?.sellerSignatureBase64 && (
              <div className="absolute -top-3 right-4 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                Required before continuing
              </div>
            )}

            <p className="text-sm font-bold text-gray-800">
              Seller Signature <span className="text-red-500">*</span>
            </p>

            <SignatureUpload name="signatures.sellerSignatureBase64" required />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Printed Name <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("signatures.sellerName", { required: true })}
                  type="text"
                  placeholder="Full name"
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB] ${
                    showErrors && (errors as any)?.signatures?.sellerName
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {showErrors && (errors as any)?.signatures?.sellerName && (
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mt-1">Required</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Date <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("signatures.sellerDate", { required: true })}
                  type="date"
                  className={`w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB] ${
                    showErrors && (errors as any)?.signatures?.sellerDate
                      ? "border-red-400 bg-red-50"
                      : "border-gray-200"
                  }`}
                />
                {showErrors && (errors as any)?.signatures?.sellerDate && (
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-wide mt-1">Required</p>
                )}
              </div>
            </div>
          </div>

          {/* Buyer — optional */}
          <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
            <p className="text-sm font-bold text-gray-800">
              Buyer Signature{" "}
              <span className="text-gray-400 text-xs font-normal">(optional)</span>
            </p>

            <SignatureUpload name="signatures.buyerSignatureBase64" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Printed Name</label>
                <input
                  {...register("signatures.buyerName")}
                  type="text"
                  placeholder="Full name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Date</label>
                <input
                  {...register("signatures.buyerDate")}
                  type="date"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
                />
              </div>
            </div>
          </div>

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