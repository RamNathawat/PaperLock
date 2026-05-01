"use client";

import { useContext, useEffect, useRef } from "react";
import { useFormContext } from "react-hook-form";
import { useWizard } from "@/lib/wizard/index";
import { ReadOnlyContext } from "../page";
import { mergePayloads } from "@/src/lib/disclosure-engine/utils/mergePayloads";
import { buildCleanPayload } from "@/src/lib/disclosure-engine/utils/buildCleanPayload";

const CHARS_PER_BUILT_IN_BOX = 800;
const CHARS_PER_CONT_PAGE    = 4400;

function buildAutoExplanation(wizardValues: Record<string, any>): string {
  const lines: string[] = [];
  const comments: Record<string, string> = {};
  Object.values(wizardValues || {}).forEach((stepData: any) => {
    if (stepData?.questionComments) {
      Object.entries(stepData.questionComments).forEach(([k, v]) => {
        if (typeof v === "string" && v.trim()) comments[k] = v.trim();
      });
    }
  });
  Object.entries(comments).forEach(([qNum, text]) => {
    lines.push(`Q${qNum}: ${text}`);
  });
  return lines.join("\n\n");
}

export default function Step6Financial() {
  const isReadOnly = useContext(ReadOnlyContext);
  const { register, watch, setValue, getValues } = useFormContext();
  const { values: wizardValues } = useWizard();

  const didAutoPopulate = useRef(false);
  useEffect(() => {
    if (isReadOnly) return; // don't auto-populate on seller 2
    if (didAutoPopulate.current) return;
    didAutoPopulate.current = true;
    const current = getValues("explanation");
    if (current && current.trim()) return;
    const auto = buildAutoExplanation(wizardValues);
    if (auto) setValue("explanation", auto, { shouldDirty: false });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const explanation = (watch("explanation") as string) || "";
  const charCount   = explanation.length;

  const overflowChars = Math.max(0, charCount - CHARS_PER_BUILT_IN_BOX);
  const autoPages     = overflowChars > 0 ? Math.ceil(overflowChars / CHARS_PER_CONT_PAGE) : 0;

  useEffect(() => {
    if (isReadOnly) return;
    if (autoPages > 0) {
      setValue("additionalPages.hasAdditionalPages", "YES");
      setValue("additionalPages.howMany", String(autoPages));
    } else {
      setValue("additionalPages.hasAdditionalPages", "NO");
      setValue("additionalPages.howMany", "");
    }
  }, [autoPages, setValue, isReadOnly]);

  // Eager PDF pre-generation (only for seller 1)
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (isReadOnly) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const flat: Record<string, any> = mergePayloads(Object.values(wizardValues || {}));
        flat.explanation      = getValues("explanation");
        flat.additionalPages  = getValues("additionalPages");
        const cleanPayload    = buildCleanPayload(flat, wizardValues as any);
        const payloadHash     = JSON.stringify({ ...cleanPayload, version: "01-01-2026", isPreview: true });
        if ((window as any).__cachedPdfHash === payloadHash) return;
        const res = await fetch("/api/disclosure/generate", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: payloadHash,
        });
        if (res.ok) {
          const blob = await res.blob();
          const url  = URL.createObjectURL(blob);
          if ((window as any).__cachedPdfUrl) URL.revokeObjectURL((window as any).__cachedPdfUrl);
          (window as any).__cachedPdfUrl  = url;
          (window as any).__cachedPdfHash = payloadHash;
        }
      } catch { /* silent */ }
    }, 1500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [explanation, getValues, isReadOnly]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <fieldset disabled={isReadOnly} className={isReadOnly ? "pointer-events-none opacity-70 border-none p-0 m-0 min-w-0" : "border-none p-0 m-0 min-w-0"}>
      {/* Hidden inputs to explicitly register these programmatic fields */}
      <input type="hidden" {...register("additionalPages.hasAdditionalPages")} />
      <input type="hidden" {...register("additionalPages.howMany")} />

      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Additional Notes</p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">Additional Explanations</h2>
          <p className="text-sm text-gray-500 mt-1">
            {isReadOnly
              ? "These explanations were provided by Seller 1 and are part of the disclosure record."
              : "Any YES answers you provided with comments have been pre-filled below. You may add more context or leave as-is. Write as much as you need — the PDF will automatically add pages if required."}
          </p>
        </div>

        {explanation.trim() && !isReadOnly && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 flex items-start gap-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
            <p className="text-xs font-medium text-blue-700">
              Pre-filled from your YES answers. You can edit, add to, or leave this as-is — it will appear in the PDF exactly as written.
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          {isReadOnly ? (
            /* Read-only: show explanation as a static block */
            <div className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 bg-gray-50 min-h-[160px] whitespace-pre-wrap">
              {explanation || <span className="text-gray-400 italic">No additional explanation provided.</span>}
            </div>
          ) : (
            <textarea
              {...register("explanation")}
              rows={10}
              placeholder="e.g. Q41: The HOA fee is $200 per month..."
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2463EB] resize-y"
            />
          )}
          {!isReadOnly && (
            <div className="flex justify-end">
              <span className="text-[11px] text-gray-400">{charCount.toLocaleString()} chars</span>
            </div>
          )}
        </div>

        {!isReadOnly && autoPages > 0 && (
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">Text overflow pages generated</p>
              <span className="text-2xl font-bold text-[#2463EB]">{autoPages}</span>
            </div>
            <p className="text-xs text-blue-600 font-medium">The PDF will automatically check the "YES" box for additional pages.</p>
            <p className="text-xs text-gray-500">Your notes are {overflowChars.toLocaleString()} chars beyond the built-in box. {autoPages} continuation {autoPages === 1 ? "page" : "pages"} will be appended automatically.</p>
          </div>
        )}

        {!isReadOnly && autoPages === 0 && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-[13px] text-gray-500 mb-1">
              <span className="font-semibold text-gray-700">Automated Pagination: </span>
              The final PDF will automatically append and mark exactly how many additional pages are required if you exceed the built-in character limit above.
            </p>
          </div>
        )}

        {!isReadOnly && (
          <p className="text-xs text-gray-400">Text is automatically word-wrapped and paginated — it will never be cut off.</p>
        )}
      </div>
    </fieldset>
  );
}