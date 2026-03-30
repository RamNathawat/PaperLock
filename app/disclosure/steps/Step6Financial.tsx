"use client";

import { useFormContext } from "react-hook-form";

export default function Step6Financial() {
  const { watch } = useFormContext();

  const explanation = watch("explanation");
  const notWorking = watch("page2NotWorkingExplanation");

  const estimatedPages =
    (explanation?.length || 0) + (notWorking?.length || 0) > 900 ? 1 : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">
          Review & Additional Notes
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          We automatically calculate whether extra disclosure pages are needed.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
        <p className="text-sm text-gray-700">
          Estimated additional pages required:
        </p>
        <p className="text-3xl font-bold text-gray-900 mt-2">
          {estimatedPages}
        </p>
      </div>
    </div>
  );
}