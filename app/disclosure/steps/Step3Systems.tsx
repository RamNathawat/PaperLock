"use client";

import { useContext, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { ReadOnlyContext } from "../page";

const STATUS_OPTIONS = [
  { label: "Working",                  value: "WORKING"     },
  { label: "Not Working",              value: "NOT_WORKING" },
  { label: "Do Not Know if Working",   value: "UNKNOWN"     },
  { label: "None / Not Included",      value: "NONE"        },
];

function shouldShowSubtype(value?: string) {
  return !!value && value !== "NONE";
}

// ─── StatusRow ─────────────────────────────────────────────────────────────────
// Renders the 4-option status radio group for a single system item.
// When isReadOnly is true the inputs are disabled and pointer-events removed,
// matching the exact pattern used in Step1Property and Step2AppliancesPrimary.
function StatusRow({
  label,
  name,
  subtypeValue,
  commentName,
  children,
}: {
  label: string;
  name: string;
  subtypeValue?: string;
  commentName: string;
  children?: React.ReactNode;
}) {
  const { register, watch } = useFormContext();
  const isReadOnly = useContext(ReadOnlyContext);
  const value = watch(name);

  return (
    <div className="rounded-xl border border-gray-100 p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-800">{label}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STATUS_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          return (
            <label
              key={option.value}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all select-none
                ${isReadOnly
                  ? "pointer-events-none cursor-default"
                  : "cursor-pointer hover:border-gray-300 hover:bg-gray-50"
                }
                ${isSelected
                  ? "bg-blue-50 border-blue-500 text-blue-700 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                  : "bg-white border-gray-200 text-gray-600"
                }`}
            >
              <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
                ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"}`}>
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <input
                {...register(name)}
                type="radio"
                value={option.value}
                disabled={isReadOnly}
                className="sr-only"
              />
              <span className="text-sm font-medium leading-tight">{option.label}</span>
            </label>
          );
        })}
      </div>

      {/* Comment box — only shown when NOT working, hidden for read-only */}
      {value === "NOT_WORKING" && !isReadOnly && (
        <textarea
          {...register(commentName)}
          rows={3}
          placeholder={`Describe issue with ${label.toLowerCase()}...`}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
        />
      )}

      {/* Comment — read-only display */}
      {value === "NOT_WORKING" && isReadOnly && (
        <ReadOnlyComment name={commentName} />
      )}

      {shouldShowSubtype(subtypeValue) && children}
    </div>
  );
}

// ─── ReadOnlyComment ───────────────────────────────────────────────────────────
function ReadOnlyComment({ name }: { name: string }) {
  const { watch } = useFormContext();
  const text = watch(name);
  if (!text) return null;
  return (
    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
      {text}
    </p>
  );
}

// ─── InlineOptions ─────────────────────────────────────────────────────────────
// Radio chip group for sub-type selectors (e.g. Electric / Gas / Tankless).
// Disabled + visual-only when read-only.
function InlineOptions({
  name,
  label = "Select type",
  options,
}: {
  name: string;
  label?: string;
  options: string[];
}) {
  const { register, watch } = useFormContext();
  const isReadOnly = useContext(ReadOnlyContext);
  const current    = watch(name);

  return (
    <div className="pt-2 border-t border-gray-100 space-y-3">
      <p className="text-sm font-semibold text-gray-800">{label}</p>

      <div className="flex flex-wrap gap-2">
        {options.map((opt, i) => {
          const val        = String(i);
          const isSelected = String(current) === val;
          return (
            <label
              key={i}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all select-none text-sm font-medium
                ${isReadOnly
                  ? "pointer-events-none cursor-default"
                  : "cursor-pointer hover:border-blue-300 hover:bg-blue-50"
                }
                ${isSelected
                  ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-600"
                }`}
            >
              <input
                {...register(name)}
                type="radio"
                value={val}
                disabled={isReadOnly}
                className="sr-only"
              />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step3Systems ──────────────────────────────────────────────────────────────
export default function Step3Systems() {
  const { watch, setValue } = useFormContext();
  const isReadOnly = useContext(ReadOnlyContext);

  /**
   * Persist nested systems.* keys so RHF does not drop them
   * when the wizard step unmounts.
   */
  useEffect(() => {
    const systemKeys = [
      "waterHeater",
      "ac",
      "heating",
      "gasSupply",
      "generator",
      "waterSource",
      "security",
      "solar",
      "fireSuppression",
      "waterSoftener",
      "propaneTank",
    ];

    systemKeys.forEach((key) => {
      const path    = `systems.${key}`;
      const current = watch(path);
      if (current === undefined) {
        setValue(path, "", { shouldDirty: false, shouldTouch: false });
      }
    });
  }, [setValue, watch]);

  const waterHeater      = watch("systems.waterHeater");
  const waterSoftener    = watch("systems.waterSoftener");
  const ac               = watch("systems.ac");
  const heating          = watch("systems.heating");
  const gasSupply        = watch("systems.gasSupply");
  const propaneTank      = watch("systems.propaneTank");
  const generator        = watch("systems.generator");
  const waterSource      = watch("systems.waterSource");
  const security         = watch("systems.security");
  const solar            = watch("systems.solar");
  const fireSuppression  = watch("systems.fireSuppression");
  const fireSuppresionDate = watch("inlineOptions.fireSuppresionDate");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Systems
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Systems &amp; Utilities
        </h2>

        {/* Read-only banner for Seller 2 */}
        {isReadOnly && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-center gap-2.5">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m0-6v2m0-6a9 9 0 110 18A9 9 0 0112 3z" />
            </svg>
            <p className="text-xs font-semibold text-amber-700">
              These fields were completed by Seller 1 and cannot be modified.
            </p>
          </div>
        )}
      </div>

      <StatusRow
        label="Water Heater"
        name="systems.waterHeater"
        subtypeValue={waterHeater}
        commentName="systemComments.waterHeater"
      >
        <InlineOptions
          name="inlineOptions.waterHeaterType"
          options={["Electric", "Gas", "Tankless", "Solar", "Other"]}
        />
      </StatusRow>

      <StatusRow
        label="Water Softener"
        name="systems.waterSoftener"
        subtypeValue={waterSoftener}
        commentName="systemComments.waterSoftener"
      >
        <InlineOptions
          name="inlineOptions.waterSoftenerType"
          options={["Leased", "Owned"]}
        />
      </StatusRow>

      <StatusRow
        label="Air Conditioning"
        name="systems.ac"
        subtypeValue={ac}
        commentName="systemComments.ac"
      >
        <InlineOptions
          name="inlineOptions.acType"
          options={["Central", "Window Units", "Evaporative / Swamp", "Other"]}
        />
      </StatusRow>

      <StatusRow
        label="Heating System"
        name="systems.heating"
        subtypeValue={heating}
        commentName="systemComments.heating"
      >
        <InlineOptions
          name="inlineOptions.heatingType"
          options={["Electric", "Gas", "Heat Pump"]}
        />
      </StatusRow>

      <StatusRow
        label="Gas Supply"
        name="systems.gasSupply"
        subtypeValue={gasSupply}
        commentName="systemComments.gasSupply"
      >
        <InlineOptions
          name="inlineOptions.gasSupplyType"
          options={["Public", "Propane", "Butane"]}
        />
      </StatusRow>

      <StatusRow
        label="Propane Tank"
        name="systems.propaneTank"
        subtypeValue={propaneTank}
        commentName="systemComments.propaneTank"
      >
        <InlineOptions
          name="inlineOptions.propaneTankType"
          options={["Leased", "Owned"]}
        />
      </StatusRow>

      <StatusRow
        label="Generator"
        name="systems.generator"
        subtypeValue={generator}
        commentName="systemComments.generator"
      >
        <InlineOptions
          name="inlineOptions.generatorType"
          options={["Leased", "Owned", "Financed"]}
        />
      </StatusRow>

      <StatusRow
        label="Water Source"
        name="systems.waterSource"
        subtypeValue={waterSource}
        commentName="systemComments.waterSource"
      >
        <InlineOptions
          name="inlineOptions.waterSourceType"
          options={["Public / Municipal", "Private Well", "Shared Well", "Other"]}
        />
      </StatusRow>

      <StatusRow
        label="Sewer System"
        name="systems.sewer"
        subtypeValue={String(watch("sewerSystem.type"))}
        commentName="systemComments.sewer"
      >
        <InlineOptions
          name="sewerSystem.type"
          label="Select sewer access"
          options={["Public", "Private"]}
        />
        {String(watch("sewerSystem.type")) === "1" && (
          <InlineOptions
            name="sewerSystem.privateType"
            label="If private, select type"
            options={["Septic", "Aerobic", "Lagoon", "Other"]}
          />
        )}
      </StatusRow>

      <StatusRow
        label="Security System"
        name="systems.security"
        subtypeValue={security}
        commentName="systemComments.security"
      >
        <InlineOptions
          name="inlineOptions.securitySystemType"
          options={["Leased", "Owned", "Monitored", "Financed"]}
        />
      </StatusRow>

      <StatusRow
        label="Solar Panels"
        name="systems.solar"
        subtypeValue={solar}
        commentName="systemComments.solar"
      >
        <InlineOptions
          name="inlineOptions.solarPanelType"
          options={["Leased", "Owned", "Financed"]}
        />
      </StatusRow>

      <StatusRow
        label="Fire Suppression System"
        name="systems.fireSuppression"
        subtypeValue={fireSuppression}
        commentName="systemComments.fireSuppression"
      >
        <div className="pt-2 border-t border-gray-100 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-800 mb-3">
              Last inspection date
            </p>

            {isReadOnly ? (
              /* Read-only: show the date as plain text */
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-2 border border-gray-100 inline-block">
                {fireSuppresionDate || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            ) : (
              /* Editable: masked date input */
              <input
                type="text"
                inputMode="numeric"
                maxLength={10}
                value={fireSuppresionDate || ""}
                placeholder="MM/DD/YYYY"
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 8);
                  let formatted = digits;
                  if (digits.length > 2) formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                  if (digits.length > 4) formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                  setValue("inlineOptions.fireSuppresionDate", formatted);
                }}
                className="w-48 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
              />
            )}
          </div>
        </div>
      </StatusRow>
    </div>
  );
}