"use client";

import { useEffect } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { OptionCards, ChipGroup } from "@/app/disclosure/components/OptionControls";

const STATUS_OPTIONS = [
  { label: "Working",             value: "WORKING" },
  { label: "Not Working",         value: "NOT_WORKING" },
  { label: "Do Not Know",         value: "UNKNOWN" },
  { label: "None / Not Included", value: "NONE" },
];

function shouldShowSubtype(value?: string) {
  return !!value && value !== "NONE" && value !== "";
}

function getNestedError(errors: any, path: string) {
  return path.split(".").reduce((obj, key) => obj?.[key], errors);
}

// ─── InlineOptions — compact chip selector shown after status is chosen ───────
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
  const { formState: { errors, submitCount } } = useFormContext();
  const showErrors = submitCount > 0 && required;
  const hasError = showErrors && !!getNestedError(errors, name);

  return (
    <div className={`pt-3 border-t space-y-3 ${hasError ? "border-red-200" : "border-gray-100"}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {hasError && (
          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
            Required
          </span>
        )}
      </div>
      <ChipGroup name={name} options={options} required={required} type="radio" />
    </div>
  );
}

// ─── StatusRow ────────────────────────────────────────────────────────────────
function StatusRow({
  label, name, subtypeValue, commentName, children,
}: {
  label: string; name: string; subtypeValue?: string; commentName: string; children?: React.ReactNode;
}) {
  const { register, watch, control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const value = watch(name);
  const hasError = submitCount > 0 && !!getNestedError(errors, name);

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

      <OptionCards name={name} options={STATUS_OPTIONS} cols={2} />

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

      {shouldShowSubtype(subtypeValue) && children}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Step3Systems({ readOnly }: { readOnly?: boolean }) {
  const { watch, setValue } = useFormContext();

  useEffect(() => {
    const systemKeys = [
      "waterHeater", "ac", "heating", "gasSupply", "generator",
      "waterSource", "security", "solar", "fireSuppression",
      "waterSoftener", "propaneTank", "sewer",
    ];
    systemKeys.forEach((key) => {
      const path = `systems.${key}`;
      if (watch(path) === undefined) setValue(path, "", { shouldDirty: false, shouldTouch: false });
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
    <fieldset disabled={readOnly} className={readOnly ? "pointer-events-none opacity-70 border-none p-0 m-0 min-w-0" : "border-none p-0 m-0 min-w-0"}>
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Systems</p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">Systems &amp; Utilities</h2>
        <p className="text-sm text-gray-500 mt-1">All fields are required. If a system has a type, select it too.</p>
      </div>

      <StatusRow label="Water Heater" name="systems.waterHeater" subtypeValue={waterHeater} commentName="systemComments.waterHeater">
        <InlineOptions name="inlineOptions.waterHeaterType" label="Water heater type" options={["Electric", "Gas", "Tankless", "Solar", "Other"]} />
      </StatusRow>

      <StatusRow label="Water Softener" name="systems.waterSoftener" subtypeValue={waterSoftener} commentName="systemComments.waterSoftener">
        <InlineOptions name="inlineOptions.waterSoftenerType" label="Ownership type" options={["Leased", "Owned"]} />
      </StatusRow>

      <StatusRow label="Air Conditioning" name="systems.ac" subtypeValue={ac} commentName="systemComments.ac">
        <InlineOptions name="inlineOptions.acType" label="AC type" options={["Central", "Window Units", "Evaporative / Swamp", "Other"]} />
      </StatusRow>

      <StatusRow label="Heating System" name="systems.heating" subtypeValue={heating} commentName="systemComments.heating">
        <InlineOptions name="inlineOptions.heatingType" label="Heating type" options={["Electric", "Gas", "Heat Pump"]} />
      </StatusRow>

      <StatusRow label="Gas Supply" name="systems.gasSupply" subtypeValue={gasSupply} commentName="systemComments.gasSupply">
        <InlineOptions name="inlineOptions.gasSupplyType" label="Gas supply type" options={["Public", "Propane", "Butane"]} />
      </StatusRow>

      <StatusRow label="Propane Tank" name="systems.propaneTank" subtypeValue={propaneTank} commentName="systemComments.propaneTank">
        <InlineOptions name="inlineOptions.propaneTankType" label="Ownership type" options={["Leased", "Owned"]} />
      </StatusRow>

      <StatusRow label="Generator" name="systems.generator" subtypeValue={generator} commentName="systemComments.generator">
        <InlineOptions name="inlineOptions.generatorType" label="Ownership type" options={["Leased", "Owned", "Financed"]} />
      </StatusRow>

      <StatusRow label="Water Source" name="systems.waterSource" subtypeValue={waterSource} commentName="systemComments.waterSource">
        <InlineOptions name="inlineOptions.waterSourceType" label="Water source type" options={["Public / Municipal", "Private Well", "Shared Well", "Other"]} />
      </StatusRow>

      <StatusRow label="Sewer System" name="systems.sewer" subtypeValue={sewer} commentName="systemComments.sewer">
        <InlineOptions name="sewerSystem.type" label="Sewer access type" options={["Public", "Private"]} />
        {sewerType === "1" && (
          <InlineOptions name="sewerSystem.privateType" label="Private sewer type" options={["Septic", "Aerobic", "Lagoon", "Other"]} />
        )}
      </StatusRow>

      <StatusRow label="Security System" name="systems.security" subtypeValue={security} commentName="systemComments.security">
        <InlineOptions name="inlineOptions.securitySystemType" label="Ownership type" options={["Leased", "Owned", "Monitored", "Financed"]} />
      </StatusRow>

      <StatusRow label="Solar Panels" name="systems.solar" subtypeValue={solar} commentName="systemComments.solar">
        <InlineOptions name="inlineOptions.solarPanelType" label="Ownership type" options={["Leased", "Owned", "Financed"]} />
      </StatusRow>

      <StatusRow label="Fire Suppression System" name="systems.fireSuppression" subtypeValue={fireSuppression} commentName="systemComments.fireSuppression">
        <div className="pt-3 border-t border-gray-100 space-y-3">
          <p className="text-sm font-semibold text-gray-700">Last inspection date (optional)</p>
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
            className="w-48 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </StatusRow>
    </div>
    </fieldset>
  );
}