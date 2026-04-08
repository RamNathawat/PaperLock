"use client";

import { useWizard } from "@/lib/wizard/index";
import { useFormContext } from "react-hook-form";

export default function Navigation() {
  const { isFirstStep, isLastStep, isLoading, goToPreviousStep } = useWizard();
  const { formState: { errors, submitCount } } = useFormContext();

  const errorCount = submitCount > 0 ? countErrors(errors) : 0;

  return (
    <div className="mt-8 space-y-4">
      {/* Error banner — only shows after a failed submit attempt */}
      {errorCount > 0 && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-red-500 text-lg">⚠</span>
            <p className="text-sm font-semibold text-red-700 uppercase tracking-wide">
              Missing Required Fields
            </p>
          </div>
          <p className="text-sm font-semibold text-red-500 text-right whitespace-nowrap">
            {errorCount} required {errorCount === 1 ? "answer" : "answers"} missing in this section
          </p>
        </div>
      )}

      <div className="flex justify-between">
        {!isFirstStep ? (
          <button
            type="button"
            onClick={goToPreviousStep}
            className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
          >
            ← Back
          </button>
        ) : (
          <div />
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 rounded-lg bg-[#2463EB] text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
        >
          {isLoading ? "Loading..." : isLastStep ? "Generate PDF" : "Next →"}
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
    if (val.message !== undefined || val.type !== undefined) {
      count += 1;
    } else {
      count += countErrors(val);
    }
  }
  return count;
}