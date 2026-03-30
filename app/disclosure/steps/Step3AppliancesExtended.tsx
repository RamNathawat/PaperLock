"use client";

import { useFormContext } from "react-hook-form";

const ITEMS = [
  "Electric Air Purifier",
  "Garage Door Opener",
  "Intercom",
  "Central Vacuum",
  "Smoke Detectors",
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
];

const OPTIONS = [
  { label: "Working", value: "WORKING" },
  { label: "Not Working", value: "NOT_WORKING" },
  { label: "Do Not Know if Working", value: "UNKNOWN" },
  { label: "None / Not Included", value: "NONE" },
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
  const { register, watch } = useFormContext();
  const value = watch(name);

  return (
    <div className="rounded-xl border border-gray-100 p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-800">{label}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <input
              {...register(name)}
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
          {...register(commentName)}
          rows={3}
          placeholder={`Describe issue with ${label.toLowerCase()}...`}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
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
      </div>

      {ITEMS.map((item, index) => (
        <ApplianceRow
          key={index}
          label={item}
          name={`appliances.${100 + index}`}
          commentName={`applianceComments.${100 + index}`}
        />
      ))}
    </div>
  );
}