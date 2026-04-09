"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useRef } from "react";
import { mergePayloads } from "@/src/lib/disclosure-engine/utils/mergePayloads";
import { buildCleanPayload } from "@/src/lib/disclosure-engine/utils/buildCleanPayload";

import { useWizard } from "@/lib/wizard/index";

// The built-in explanation box on Page 4 fits roughly 800 chars.
// Beyond that, the PDF engine automatically appends continuation pages.
// There is no upper limit — write as much as needed.
const CHARS_PER_BUILT_IN_BOX = 800;
const CHARS_PER_CONT_PAGE    = 4400;

export default function Step6Financial() {
  const { register, watch, setValue, getValues } = useFormContext();
  const { values: wizardValues } = useWizard();

  const explanation = (watch("explanation") as string) || "";
  const charCount   = explanation.length;

  const overflowChars = Math.max(0, charCount - CHARS_PER_BUILT_IN_BOX);
  const autoPages     = overflowChars > 0 ? Math.ceil(overflowChars / CHARS_PER_CONT_PAGE) : 0;

  useEffect(() => {
    if (autoPages > 0) {
      setValue("additionalPages.hasAdditionalPages", "YES");
      setValue("additionalPages.howMany", String(autoPages));
    } else {
      setValue("additionalPages.hasAdditionalPages", "NO");
      setValue("additionalPages.howMany", "");
    }
  }, [autoPages, setValue]);

  // -- Eagerly pre-generate PDF to eliminate loading screen on Step 7
  const debounceRef = useRef<NodeJS.Timeout>(null);
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    
    // We only trigger prefetch 1.5 seconds after they stop typing
    debounceRef.current = setTimeout(async () => {
      try {
        // Merge historical wizard steps + active RHF step
        const flat: Record<string, any> = mergePayloads(Object.values(wizardValues || {}));
        
        // Safely extract only Step 6 fields without pulling in 'undefined' from inactive steps
        flat.explanation = getValues("explanation");
        flat.additionalPages = getValues("additionalPages");
        
        // Emulate identical preprocessing as final app/disclosure/page.tsx
        const cleanPayload = buildCleanPayload(flat, wizardValues as any);
        
        const payloadHash = JSON.stringify({ ...cleanPayload, version: "01-01-2026", isPreview: true });
        
        // Don't re-fetch if we already have this exact payload cached
        if ((window as any).__cachedPdfHash === payloadHash) return;

        const res = await fetch("/api/disclosure/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payloadHash,
        });

        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          
          // Cleanup old eager cache
          if ((window as any).__cachedPdfUrl) {
            URL.revokeObjectURL((window as any).__cachedPdfUrl);
          }
          
          (window as any).__cachedPdfUrl = url;
          (window as any).__cachedPdfHash = payloadHash;
        }
      } catch (err) {
        // Silent background fail
      }
    }, 1500);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [explanation, getValues]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Additional Notes
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Additional Explanations
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Use this space to add context for any YES answers, or anything else the buyer should know.
          Write as much as you need — the PDF will automatically add pages if required.
        </p>
      </div>

      {/* Textarea — no max length, no limit */}
      <div className="space-y-1.5">
        <textarea
          {...register("explanation")}
          rows={10}
          placeholder="e.g. Q41: The HOA fee is $200 per month..."
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2463EB] resize-y"
        />
        <div className="flex justify-end">
          <span className="text-[11px] text-gray-400">{charCount.toLocaleString()} chars</span>
        </div>
      </div>

      {/* Page estimate card */}
      {autoPages > 0 ? (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Text overflow pages generated
            </p>
            <span className="text-2xl font-bold text-[#2463EB]">
              {autoPages}
            </span>
          </div>
          <p className="text-xs text-blue-600 font-medium">
            The PDF will automatically check the "YES" box for additional pages.
          </p>
          <p className="text-xs text-gray-500">
            Your notes are {overflowChars.toLocaleString()} chars beyond the built-in box. {autoPages} continuation {autoPages === 1 ? "page" : "pages"} will be appended automatically.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-5">
           <p className="text-[13px] text-gray-500 mb-1">
             <span className="font-semibold text-gray-700">Automated Paginations: </span> 
             The final PDF will automatically append and mark exactly how many additional pages are required if you exceed the built in character limit above.
           </p>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Text is automatically word-wrapped and paginated — it will never be cut off.
      </p>
    </div>
  );
}