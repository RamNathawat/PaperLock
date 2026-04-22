"use client";

import { useFormContext, useFormState } from "react-hook-form";
import { OptionCards } from "@/app/disclosure/components/OptionControls";

const PAGE_2_OFFSET = 19;

const ITEMS = [
  "Electric Air Purifier", "Garage Door Opener", "Intercom", "Central Vacuum",
  "Security System", "Smoke Detectors", "Fire Suppression System", "Dishwasher",
  "Electrical Wiring", "Garbage Disposal", "Gas Grill", "Vent Hood",
  "Microwave Oven", "Built-In Oven / Range", "Kitchen Stove", "Trash Compactor",
  "Built-In Icemaker", "Solar Panels", "Generators", "Source of Household Water",
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

  const nameParts = name.split(".");
  let fieldError: any = errors;
  for (const part of nameParts) { fieldError = fieldError?.[part]; if (!fieldError) break; }
  const hasError = submitCount > 0 && !!fieldError;

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

export default function Step3AppliancesExtended({ readOnly }: { readOnly?: boolean }) {
  return (
    <fieldset disabled={readOnly} className={readOnly ? "pointer-events-none opacity-70 border-none p-0 m-0 min-w-0" : "border-none p-0 m-0 min-w-0"}>
      <div className="space-y-5">
        <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Appliances</p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">Appliances Continued</h2>
        <p className="text-sm text-gray-500 mt-1">Select the condition of each item. All fields are required.</p>
      </div>
      {ITEMS.map((item, index) => (
        <ApplianceRow key={index} label={item} name={`appliances.${PAGE_2_OFFSET + index}`} commentName={`applianceComments.${PAGE_2_OFFSET + index}`} />
      ))}
    </div>
    </fieldset>
  );
}