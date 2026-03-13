"use client";

import { useWizard } from "@/lib/wizard/index";

export default function Navigation() {
  const { isFirstStep, isLastStep, isLoading, goToPreviousStep } = useWizard();

  return (
    <div className="flex justify-between mt-8">
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
        className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition disabled:opacity-50"
      >
        {isLoading ? "Loading..." : isLastStep ? "Generate PDF" : "Next →"}
      </button>
    </div>
  );
}
