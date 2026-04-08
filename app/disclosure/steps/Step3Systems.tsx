"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

const STATUS_OPTIONS = [
  { label: "Working",                value: "WORKING" },
  { label: "Not Working",            value: "NOT_WORKING" },
  { label: "Do Not Know if Working", value: "UNKNOWN" },
  { label: "None / Not Included",    value: "NONE" },
];

function shouldShowSubtype(value?: string) {
  return !!value && value !== "NONE" && value !== "";
}

/**
 * Drills into a nested errors object by dot-notation path.
 * e.g. "inlineOptions.waterHeaterType" → errors.inlineOptions.waterHeaterType
 */
function getNestedError(errors: any, path: string) {
  return path.split(".").reduce((obj, key) => obj?.[key], errors);
}

// ─────────────────────────────────────────────────────────────
// InlineOptions — type selector shown after a system status is
// chosen. Required when visible (i.e. status !== NONE).
// ─────────────────────────────────────────────────────────────
function InlineOptions({
  name,
  label = "Select type",
  options,
  required = true,
}: {
  name: string;
  label?: string;
  options: string[];
  required?: boolean;
}) {
  const {
    register,
    formState: { errors, submitCount },
  } = useFormContext();

  const showErrors = submitCount > 0 && required;
  const hasError   = showErrors && !!getNestedError(errors, name);

  return (
    <div
      className={`pt-2 border-t space-y-3 ${
        hasError ? "border-red-300" : "border-gray-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hasError && (
          <span className="text-xs font-bold text-red-600 uppercase tracking-wide whitespace-nowrap">
            Required
          </span>
        )}
      </div>
      <div
        className={`flex flex-wrap gap-4 rounded-lg p-2 ${
          hasError ? "bg-red-50" : ""
        }`}
      >
        {options.map((opt, i) => (
          <label key={i} className="flex items-center gap-2 text-sm text-gray-600">
            <input
              {...register(name, required ? { required: true } : {})}
              type="radio"
              value={i}
              className="accent-[#2463EB]"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// StatusRow — the outer card for each system
// ─────────────────────────────────────────────────────────────
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
  const {
    register,
    watch,
    formState: { errors, submitCount },
  } = useFormContext();

  const value      = watch(name);
  const showErrors = submitCount > 0;
  const hasError   = showErrors && !!getNestedError(errors, name);

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
        {STATUS_OPTIONS.map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm text-gray-600">
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
          {...register(commentName)}
          rows={3}
          placeholder={`Describe issue with ${label.toLowerCase()}... (optional)`}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
        />
      )}

      {/* Inline type selector — only renders when status is not NONE/empty */}
      {shouldShowSubtype(subtypeValue) && children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────
export default function Step3Systems() {
  const { watch, setValue } = useFormContext();

  // Ensure all system keys are initialised so RHF tracks them
  useEffect(() => {
    const systemKeys = [
      "waterHeater", "ac", "heating", "gasSupply", "generator",
      "waterSource", "security", "solar", "fireSuppression",
      "waterSoftener", "propaneTank", "sewer",
    ];
    systemKeys.forEach((key) => {
      const path = `systems.${key}`;
      if (watch(path) === undefined) {
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
  const sewer            = watch("systems.sewer");
  const security         = watch("systems.security");
  const solar            = watch("systems.solar");
  const fireSuppression  = watch("systems.fireSuppression");
  const fireSuppresionDate = watch("inlineOptions.fireSuppresionDate");
  const sewerType        = String(watch("sewerSystem.type"));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Systems
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">Systems & Utilities</h2>
        <p className="text-sm text-gray-500 mt-1">
          All fields are required. If a system has a type, select it too.
        </p>
      </div>

      {/* Water Heater */}
      <StatusRow label="Water Heater" name="systems.waterHeater" subtypeValue={waterHeater} commentName="systemComments.waterHeater">
        <InlineOptions
          name="inlineOptions.waterHeaterType"
          label="Water heater type"
          options={["Electric", "Gas", "Tankless", "Solar", "Other"]}
        />
      </StatusRow>

      {/* Water Softener */}
      <StatusRow label="Water Softener" name="systems.waterSoftener" subtypeValue={waterSoftener} commentName="systemComments.waterSoftener">
        <InlineOptions
          name="inlineOptions.waterSoftenerType"
          label="Ownership type"
          options={["Leased", "Owned"]}
        />
      </StatusRow>

      {/* Air Conditioning */}
      <StatusRow label="Air Conditioning" name="systems.ac" subtypeValue={ac} commentName="systemComments.ac">
        <InlineOptions
          name="inlineOptions.acType"
          label="AC type"
          options={["Central", "Window Units", "Evaporative / Swamp", "Other"]}
        />
      </StatusRow>

      {/* Heating */}
      <StatusRow label="Heating System" name="systems.heating" subtypeValue={heating} commentName="systemComments.heating">
        <InlineOptions
          name="inlineOptions.heatingType"
          label="Heating type"
          options={["Electric", "Gas", "Heat Pump"]}
        />
      </StatusRow>

      {/* Gas Supply */}
      <StatusRow label="Gas Supply" name="systems.gasSupply" subtypeValue={gasSupply} commentName="systemComments.gasSupply">
        <InlineOptions
          name="inlineOptions.gasSupplyType"
          label="Gas supply type"
          options={["Public", "Propane", "Butane"]}
        />
      </StatusRow>

      {/* Propane Tank */}
      <StatusRow label="Propane Tank" name="systems.propaneTank" subtypeValue={propaneTank} commentName="systemComments.propaneTank">
        <InlineOptions
          name="inlineOptions.propaneTankType"
          label="Ownership type"
          options={["Leased", "Owned"]}
        />
      </StatusRow>

      {/* Generator */}
      <StatusRow label="Generator" name="systems.generator" subtypeValue={generator} commentName="systemComments.generator">
        <InlineOptions
          name="inlineOptions.generatorType"
          label="Ownership type"
          options={["Leased", "Owned", "Financed"]}
        />
      </StatusRow>

      {/* Water Source */}
      <StatusRow label="Water Source" name="systems.waterSource" subtypeValue={waterSource} commentName="systemComments.waterSource">
        <InlineOptions
          name="inlineOptions.waterSourceType"
          label="Water source type"
          options={["Public / Municipal", "Private Well", "Shared Well", "Other"]}
        />
      </StatusRow>

      {/* Sewer System — two-level conditional:
          1. Select Public or Private (always required when status ≠ NONE)
          2. If Private, select septic type (required when sewerType === "1") */}
      <StatusRow
        label="Sewer System"
        name="systems.sewer"
        subtypeValue={sewer}
        commentName="systemComments.sewer"
      >
        <InlineOptions
          name="sewerSystem.type"
          label="Sewer access type"
          options={["Public", "Private"]}
        />
        {sewerType === "1" && (
          <InlineOptions
            name="sewerSystem.privateType"
            label="Private sewer type"
            options={["Septic", "Aerobic", "Lagoon", "Other"]}
          />
        )}
      </StatusRow>

      {/* Security System */}
      <StatusRow label="Security System" name="systems.security" subtypeValue={security} commentName="systemComments.security">
        <InlineOptions
          name="inlineOptions.securitySystemType"
          label="Ownership type"
          options={["Leased", "Owned", "Monitored", "Financed"]}
        />
      </StatusRow>

      {/* Solar Panels */}
      <StatusRow label="Solar Panels" name="systems.solar" subtypeValue={solar} commentName="systemComments.solar">
        <InlineOptions
          name="inlineOptions.solarPanelType"
          label="Ownership type"
          options={["Leased", "Owned", "Financed"]}
        />
      </StatusRow>

      {/* Fire Suppression — type selector replaced with date field (no type enum on the form) */}
      <StatusRow label="Fire Suppression System" name="systems.fireSuppression" subtypeValue={fireSuppression} commentName="systemComments.fireSuppression">
        <div className="pt-2 border-t border-gray-100 space-y-3">
          <p className="text-sm font-semibold text-gray-800">Last inspection date (optional)</p>
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
        </div>
      </StatusRow>
    </div>
  );
}