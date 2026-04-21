"use client";

import { useWizard } from "@/lib/wizard/index";
import { useFormContext, useFormState } from "react-hook-form";

export default function Navigation() {
  const { isFirstStep, isLastStep, isLoading, goToPreviousStep } = useWizard();
  const { control } = useFormContext();
  // useFormState subscribes directly to the error stream — re-renders on every error change
  const { errors, submitCount } = useFormState({ control });

  const errorCount = submitCount > 0 ? countErrors(errors) : 0;

  return (
    <div className="mt-8 space-y-4">
      {/* Error indicator — soft amber, auto-clears as user fixes fields */}
      {errorCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
            <p className="text-sm font-semibold text-amber-800">
              {errorCount} {errorCount === 1 ? "field" : "fields"} need attention
            </p>
          </div>
          <span className="text-xs font-bold text-amber-600 tabular-nums bg-amber-100 px-2 py-0.5 rounded-full">
            {errorCount} left
          </span>
        </div>
      )}

      <div className="flex justify-between items-center">
        {!isFirstStep ? (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-gray-200 bg-white text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-gray-300 active:scale-[0.97] transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </button>
        ) : (
          <div />
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 active:scale-[0.97] transition-all disabled:opacity-50 shadow-sm"
        >
          {isLoading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
              </svg>
              Loading…
            </>
          ) : isLastStep ? (
            <>
              Generate PDF
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </>
          ) : (
            <>
              Continue
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function countErrors(errors: Record<string, any>): number {
  if (!errors || typeof errors !== "object") return 0;
  let count = 0;
  for (const key of Object.keys(errors)) {
    const val = errors[key];
    if (!val) continue;
    if (val.message !== undefined || val.type !== undefined) count += 1;
    else count += countErrors(val);
  }
  return count;
}