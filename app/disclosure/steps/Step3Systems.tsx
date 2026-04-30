"use client";

import { useContext } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { ReadOnlyContext } from "../page";
import {
  OptionCards,
  ChipGroup,
} from "@/app/disclosure/components/OptionControls";

/** Resolve a nested error object by dot-separated path */
function getNestedVal(obj: any, path: string) {
  return path.split(".").reduce((o: any, k) => o?.[k], obj);
}

const STATUS_OPTIONS = [
  { label: "Working",              value: "WORKING"     },
  { label: "Not Working",         value: "NOT_WORKING" },
  { label: "Do Not Know",         value: "UNKNOWN"     },
  { label: "None / Not Included", value: "NONE"        },
];

function getNestedError(errors: any, path: string) {
  return path.split(".").reduce((obj: any, k) => obj?.[k], errors);
}

function ErrChip({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">
      Required
    </span>
  );
}

// ─── ReadOnlyComment ──────────────────────────────────────────────────────────
function ReadOnlyComment({ name }: { name: string }) {
  const { watch } = useFormContext();
  const text = watch(name);
  if (!text) return null;
  return (
    <p className="text-sm text-gray-500 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
      {text}
    </p>
  );
}

// ─── SystemRow ────────────────────────────────────────────────────────────────
// Matches the ApplianceRow pattern from Step2: card with OptionCards + optional
// sub-type chips that only appear when the system is active (not NONE/blank).
// When active AND children are provided, a sub-type selection is REQUIRED.
function SystemRow({
  label,
  name,
  commentName,
  subTypeName,
  children,
}: {
  label: string;
  name: string;
  commentName: string;
  /** RHF field name for the sub-type chip — used to detect sub-type errors */
  subTypeName?: string;
  children?: React.ReactNode;
}) {
  const { register, watch, control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const isReadOnly = useContext(ReadOnlyContext);
  const value = watch(name);

  const hasError    = submitCount > 0 && !!getNestedError(errors, name);
  const isActive    = !!value && value !== "NONE";
  const hasSubError = submitCount > 0 && !!subTypeName && !!getNestedVal(errors, subTypeName);

  return (
    <div
      className={`rounded-2xl border p-5 space-y-4 ${
        hasError ? "border-amber-200 bg-amber-50/40" : "border-gray-100 bg-gray-50/30"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        {hasError && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-700 whitespace-nowrap">Required</span>
          </div>
        )}
      </div>

      {/* Status selector */}
      <OptionCards name={name} options={STATUS_OPTIONS} cols={2} required={false} />

      {/* Always register comment so RHF keeps the value across remounts */}
      <input type="hidden" {...register(commentName)} />

      {/* Comment textarea — editable mode */}
      {value === "NOT_WORKING" && !isReadOnly && (
        <textarea
          {...register(commentName)}
          rows={3}
          placeholder={`Describe the issue with ${label.toLowerCase()}…`}
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      )}

      {/* Comment — read-only display */}
      {value === "NOT_WORKING" && isReadOnly && <ReadOnlyComment name={commentName} />}

      {/* Sub-type chips — only when system is active */}
      {isActive && children && (
        <div className={`pt-3 border-t space-y-2 ${
          hasSubError ? "border-amber-200" : "border-gray-100"
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</p>
            <ErrChip show={hasSubError} />
          </div>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Step3Systems ─────────────────────────────────────────────────────────────
export default function Step3Systems() {
  const { watch, setValue } = useFormContext();
  const isReadOnly = useContext(ReadOnlyContext);

  const sewerType          = String(watch("sewerSystem.type") ?? "");
  const fireSuppresionDate = watch("inlineOptions.fireSuppresionDate");

  return (
    <fieldset
      disabled={isReadOnly}
      className={
        isReadOnly
          ? "pointer-events-none opacity-70 border-none p-0 m-0 min-w-0"
          : "border-none p-0 m-0 min-w-0"
      }
    >
      <div className="space-y-5">
        {/* Header */}
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
            Systems
          </p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">
            Systems &amp; Utilities
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Select the condition of each system. Sub-type options appear when applicable.
          </p>
        </div>

        <SystemRow label="Water Heater" name="systems.waterHeater" commentName="systemComments.waterHeater" subTypeName="inlineOptions.waterHeaterType">
          <ChipGroup name="inlineOptions.waterHeaterType" options={["Electric", "Gas", "Tankless", "Solar", "Other"]} required />
        </SystemRow>

        <SystemRow label="Water Softener" name="systems.waterSoftener" commentName="systemComments.waterSoftener" subTypeName="inlineOptions.waterSoftenerType">
          <ChipGroup name="inlineOptions.waterSoftenerType" options={["Leased", "Owned"]} required />
        </SystemRow>

        <SystemRow label="Air Conditioning" name="systems.ac" commentName="systemComments.ac" subTypeName="inlineOptions.acType">
          <ChipGroup name="inlineOptions.acType" options={["Central", "Window Units", "Evaporative / Swamp", "Other"]} required />
        </SystemRow>

        <SystemRow label="Heating System" name="systems.heating" commentName="systemComments.heating" subTypeName="inlineOptions.heatingType">
          <ChipGroup name="inlineOptions.heatingType" options={["Electric", "Gas", "Heat Pump"]} required />
        </SystemRow>

        <SystemRow label="Gas Supply" name="systems.gasSupply" commentName="systemComments.gasSupply" subTypeName="inlineOptions.gasSupplyType">
          <ChipGroup name="inlineOptions.gasSupplyType" options={["Public", "Propane", "Butane"]} required />
        </SystemRow>

        <SystemRow label="Propane Tank" name="systems.propaneTank" commentName="systemComments.propaneTank" subTypeName="inlineOptions.propaneTankType">
          <ChipGroup name="inlineOptions.propaneTankType" options={["Leased", "Owned"]} required />
        </SystemRow>

        <SystemRow label="Generator" name="systems.generator" commentName="systemComments.generator" subTypeName="inlineOptions.generatorType">
          <ChipGroup name="inlineOptions.generatorType" options={["Leased", "Owned", "Financed"]} required />
        </SystemRow>

        <SystemRow label="Water Source" name="systems.waterSource" commentName="systemComments.waterSource" subTypeName="inlineOptions.waterSourceType">
          <ChipGroup name="inlineOptions.waterSourceType" options={["Public / Municipal", "Private Well", "Shared Well", "Other"]} required />
        </SystemRow>

        {/* Sewer — extra conditional: access type required, private sub-type required when Private selected */}
        <SystemRow label="Sewer System" name="systems.sewer" commentName="systemComments.sewer" subTypeName="sewerSystem.type">
          <div className="space-y-3">
            <ChipGroup name="sewerSystem.type" options={["Public", "Private"]} required />
            {sewerType === "1" && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Private system type</p>
                <ChipGroup name="sewerSystem.privateType" options={["Septic", "Aerobic", "Lagoon", "Other"]} required />
              </div>
            )}
          </div>
        </SystemRow>

        <SystemRow label="Security System" name="systems.security" commentName="systemComments.security" subTypeName="inlineOptions.securitySystemType">
          <ChipGroup name="inlineOptions.securitySystemType" options={["Leased", "Owned", "Monitored", "Financed"]} required />
        </SystemRow>

        <SystemRow label="Solar Panels" name="systems.solar" commentName="systemComments.solar" subTypeName="inlineOptions.solarPanelType">
          <ChipGroup name="inlineOptions.solarPanelType" options={["Leased", "Owned", "Financed"]} required />
        </SystemRow>

        {/* Fire Suppression — extra: inspection date */}
        <SystemRow label="Fire Suppression System" name="systems.fireSuppression" commentName="systemComments.fireSuppression">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Last inspection date</p>
            {isReadOnly ? (
              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-2 border border-gray-100 inline-block">
                {fireSuppresionDate || <span className="text-gray-400 italic">Not provided</span>}
              </p>
            ) : (
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
                className="w-48 rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            )}
          </div>
        </SystemRow>
      </div>
    </fieldset>
  );
}