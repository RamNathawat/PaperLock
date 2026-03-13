"use client";

import { useFormContext } from "react-hook-form";

export default function Step6Financial() {
  const { register, watch } = useFormContext();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Additional Pages</h2>
        <p className="text-sm text-gray-500 mt-1">
          Indicate if there are any additional pages attached to this disclosure.
        </p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Are there additional pages attached to this disclosure?
        </label>
        <div className="flex gap-6">
          {["YES", "NO"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-black">
              <input
                {...register("additionalPages.hasAdditionalPages")}
                type="radio"
                value={opt}
                className="accent-blue-600"
              />
              {opt}
            </label>
          ))}
        </div>
        {watch("additionalPages.hasAdditionalPages") === "YES" && (
          <div className="mt-4">
            <label className="block text-xs text-gray-500 mb-1">
              How many additional pages?
            </label>
            <input
              {...register("additionalPages.howMany")}
              type="text"
              placeholder="2"
              className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
            />
          </div>
        )}
      </div>
    </div>
  );
}