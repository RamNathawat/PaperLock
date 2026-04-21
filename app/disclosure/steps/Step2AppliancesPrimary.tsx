"use client";

import { useFormContext, useFormState } from "react-hook-form";
import { OptionCards } from "@/app/disclosure/components/OptionControls";

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
  { label: "Working",             value: "WORKING" },
  { label: "Not Working",         value: "NOT_WORKING" },
  { label: "Do Not Know",         value: "UNKNOWN" },
  { label: "None / Not Included", value: "NONE" },
];

function getNestedError(errs: any, path: string) {
  return path.split(".").reduce((obj, key) => obj?.[key], errs);
}

function ApplianceRow({ label, name, commentName }: { label: string; name: string; commentName: string }) {
  const { register, watch, control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const value = watch(name);
  const showErrors = submitCount > 0;

  const nameParts = name.split(".");
  let fieldError: any = errors;
  for (const part of nameParts) { fieldError = fieldError?.[part]; if (!fieldError) break; }
  const hasError = showErrors && !!fieldError;

  return (
    <div className={`rounded-2xl border p-5 space-y-4 ${hasError ? "border-amber-200 bg-amber-50/40" : "border-gray-100 bg-gray-50/30"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hasError && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-700 whitespace-nowrap">Required</span>
          </div>
        )}
      </div>

      <OptionCards name={name} options={OPTIONS} cols={2} />

      {value === "NOT_WORKING" && (
        <textarea
          {...register(commentName, { required: true, shouldUnregister: true })}
          rows={3}
          placeholder={`Describe the issue with ${label.toLowerCase()}…`}
          className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            submitCount > 0 && !!getNestedError(errors, commentName) ? "border-amber-300 bg-amber-50" : "border-gray-200"
          }`}
        />
      )}

      {value === "UNKNOWN" && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-gray-400">Optional — add context about why this is unknown</p>
          <textarea
            {...register(commentName, { required: false, shouldUnregister: true })}
            rows={2}
            placeholder={`e.g. "Never tested" or "Was here when we bought the property"`}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      )}
    </div>
  );
}

export default function Step2AppliancesPrimary() {
  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Appliances</p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">Appliances &amp; Equipment</h2>
        <p className="text-sm text-gray-500 mt-1">Select the condition of each item. All fields are required.</p>
      </div>
      {ITEMS.map(({ index, label }) => (
        <ApplianceRow key={index} label={label} name={`appliances.${index}`} commentName={`applianceComments.${index}`} />
      ))}
    </div>
  );
}