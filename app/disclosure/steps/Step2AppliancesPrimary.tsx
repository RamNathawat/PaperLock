"use client";

import { useFormContext } from "react-hook-form";

const ITEMS: { index: number; label: string }[] = [
  { index: 0,  label: "Sprinkler System" },
  { index: 1,  label: "Swimming Pool" },
  { index: 2,  label: "Hot Tub / Spa" },
  { index: 4,  label: "Water Purifier" },
  { index: 6,  label: "Sump Pump" },
  { index: 7,  label: "Plumbing" },
  { index: 8,  label: "Whirlpool Tub" },
  { index: 11, label: "Window Air Conditioner(s)" },
  { index: 12, label: "Attic Fan" },
  { index: 13, label: "Fireplaces" },
  { index: 15, label: "Humidifier" },
  { index: 16, label: "Ceiling Fans" },
];

const OPTIONS = [
  { label: "Working",                value: "WORKING" },
  { label: "Not Working",            value: "NOT_WORKING" },
  { label: "Do Not Know if Working", value: "UNKNOWN" },
  { label: "None / Not Included",    value: "NONE" },
];

function ApplianceRow({
  label,
  name,
  commentName,
}: {
  label: string;
  name: string;
  commentName: string;
}) {
  const {
    register,
    watch,
    formState: { errors, submitCount },
  } = useFormContext();

  const value = watch(name);
  const showErrors = submitCount > 0;

  // Drill into nested error path like "appliances.0"
  const nameParts = name.split(".");
  let fieldError: any = errors;
  for (const part of nameParts) {
    fieldError = fieldError?.[part];
    if (!fieldError) break;
  }
  const hasError = showErrors && !!fieldError;

  // Helper to drill down for comments
  function getNestedError(errs: any, path: string) {
    return path.split(".").reduce((obj, key) => obj?.[key], errs);
  }

  return (
    <div
      className={`rounded-xl border p-5 space-y-4 ${
        hasError ? "border-red-400 bg-red-50" : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hasError && (
          <span className="text-xs font-bold text-red-600 uppercase tracking-wide whitespace-nowrap">
            Required before continuing
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <input
              {...register(name, { required: true })}
              type="radio"
              value={option.value}
              className="accent-[#2463EB]"
            />
            {option.label}
          </label>
        ))}
      </div>

      {value === "NOT_WORKING" && (
        <textarea
          {...register(commentName, { required: true })}
          rows={3}
          placeholder={`Describe issue with ${label.toLowerCase()}...`}
          className={`w-full rounded-lg border px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 ${
            submitCount > 0 && !!getNestedError(errors, commentName)
              ? "border-red-400 bg-red-50"
              : "border-gray-200"
          }`}
        />
      )}
    </div>
  );
}

export default function Step2AppliancesPrimary() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Appliances
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Appliances & Equipment
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Select the condition of each item. All fields are required.
        </p>
      </div>

      {ITEMS.map(({ index, label }) => (
        <ApplianceRow
          key={index}
          label={label}
          name={`appliances.${index}`}
          commentName={`applianceComments.${index}`}
        />
      ))}
    </div>
  );
}