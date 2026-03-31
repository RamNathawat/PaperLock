"use client";

import { useFormContext } from "react-hook-form";

// PAGE 2 OFFSET: Page 1 occupies PDF rows 0–18.
// PAGE2_ROW_Y keys are 0–19, so applianceIndex = 19 + page2RowKey.
// index 19 → row 0 (Electric Air Purifier)
// index 38 → row 19 (Source of Household Water)
const PAGE_2_OFFSET = 19;

const ITEMS = [
  "Electric Air Purifier",     // index 19, page2RowKey 0
  "Garage Door Opener",        // index 20, page2RowKey 1
  "Intercom",                  // index 21, page2RowKey 2
  "Central Vacuum",            // index 22, page2RowKey 3
  "Security System",           // index 23, page2RowKey 4
  "Smoke Detectors",           // index 24, page2RowKey 5
  "Fire Suppression System",   // index 25, page2RowKey 6
  "Dishwasher",                // index 26, page2RowKey 7
  "Electrical Wiring",         // index 27, page2RowKey 8
  "Garbage Disposal",          // index 28, page2RowKey 9
  "Gas Grill",                 // index 29, page2RowKey 10
  "Vent Hood",                 // index 30, page2RowKey 11
  "Microwave Oven",            // index 31, page2RowKey 12
  "Built-In Oven / Range",     // index 32, page2RowKey 13
  "Kitchen Stove",             // index 33, page2RowKey 14
  "Trash Compactor",           // index 34, page2RowKey 15
  "Built-In Icemaker",         // index 35, page2RowKey 16
  "Solar Panels",              // index 36, page2RowKey 17
  "Generators",                // index 37, page2RowKey 18
  "Source of Household Water", // index 38, page2RowKey 19
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
          name={`appliances.${PAGE_2_OFFSET + index}`}
          commentName={`applianceComments.${PAGE_2_OFFSET + index}`}
        />
      ))}
    </div>
  );
}