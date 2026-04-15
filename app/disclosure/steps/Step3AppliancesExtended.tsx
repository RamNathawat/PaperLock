"use client";

import { useFormContext } from "react-hook-form";

const PAGE_2_OFFSET = 19;

const ITEMS = [
  "Electric Air Purifier",
  "Garage Door Opener",
  "Intercom",
  "Central Vacuum",
  "Security System",
  "Smoke Detectors",
  "Fire Suppression System",
  "Dishwasher",
  "Electrical Wiring",
  "Garbage Disposal",
  "Gas Grill",
  "Vent Hood",
  "Microwave Oven",
  "Built-In Oven / Range",
  "Kitchen Stove",
  "Trash Compactor",
  "Built-In Icemaker",
  "Solar Panels",
  "Generators",
  "Source of Household Water",
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

export default function Step3AppliancesExtended() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Appliances
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Appliances Continued
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Select the condition of each item. All fields are required.
        </p>
      </div>

      {ITEMS.map((item, index) => (
        <ApplianceRow
          key={index}
          label={item}
          name={`appliances.${PAGE_2_OFFSET + index}`}
          commentName={`applianceComments.${PAGE_2_OFFSET + index}`}
        />
      ))}
    </div>
  );
}