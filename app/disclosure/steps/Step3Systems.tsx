"use client";

import { useContext } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import { ReadOnlyContext } from "../page";
import {
  OptionCards,
  ChipGroup,
} from "@/app/disclosure/components/OptionControls";

const STATUS_OPTIONS = [
  { label: "Working",              value: "WORKING"     },
  { label: "Not Working",         value: "NOT_WORKING" },
  { label: "Do Not Know",         value: "UNKNOWN"     },
  { label: "None / Not Included", value: "NONE"        },
];

function getNestedError(errors: any, path: string) {
  return path.split(".").reduce((obj: any, k) => obj?.[k], errors);
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
function SystemRow({
  label,
  name,
  commentName,
  children,
}: {
  label: string;
  name: string;
  commentName: string;
  children?: React.ReactNode;
}) {
  const { register, watch, control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const isReadOnly = useContext(ReadOnlyContext);
  const value = watch(name);

  const hasError = submitCount > 0 && !!getNestedError(errors, name);
  const isActive = !!value && value !== "NONE";

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
        <div className="pt-3 border-t border-gray-100 space-y-2">
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

        <SystemRow label="Water Heater" name="systems.waterHeater" commentName="systemComments.waterHeater">
          <ChipGroup name="inlineOptions.waterHeaterType" options={["Electric", "Gas", "Tankless", "Solar", "Other"]} required={false} />
        </SystemRow>

        <SystemRow label="Water Softener" name="systems.waterSoftener" commentName="systemComments.waterSoftener">
          <ChipGroup name="inlineOptions.waterSoftenerType" options={["Leased", "Owned"]} required={false} />
        </SystemRow>

        <SystemRow label="Air Conditioning" name="systems.ac" commentName="systemComments.ac">
          <ChipGroup name="inlineOptions.acType" options={["Central", "Window Units", "Evaporative / Swamp", "Other"]} required={false} />
        </SystemRow>

        <SystemRow label="Heating System" name="systems.heating" commentName="systemComments.heating">
          <ChipGroup name="inlineOptions.heatingType" options={["Electric", "Gas", "Heat Pump"]} required={false} />
        </SystemRow>

        <SystemRow label="Gas Supply" name="systems.gasSupply" commentName="systemComments.gasSupply">
          <ChipGroup name="inlineOptions.gasSupplyType" options={["Public", "Propane", "Butane"]} required={false} />
        </SystemRow>

        <SystemRow label="Propane Tank" name="systems.propaneTank" commentName="systemComments.propaneTank">
          <ChipGroup name="inlineOptions.propaneTankType" options={["Leased", "Owned"]} required={false} />
        </SystemRow>

        <SystemRow label="Generator" name="systems.generator" commentName="systemComments.generator">
          <ChipGroup name="inlineOptions.generatorType" options={["Leased", "Owned", "Financed"]} required={false} />
        </SystemRow>

        <SystemRow label="Water Source" name="systems.waterSource" commentName="systemComments.waterSource">
          <ChipGroup name="inlineOptions.waterSourceType" options={["Public / Municipal", "Private Well", "Shared Well", "Other"]} required={false} />
        </SystemRow>

        {/* Sewer — extra conditional: private sub-type only when Private selected */}
        <SystemRow label="Sewer System" name="systems.sewer" commentName="systemComments.sewer">
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Access type</p>
              <ChipGroup name="sewerSystem.type" options={["Public", "Private"]} required={false} />
            </div>
            {sewerType === "1" && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Private system type</p>
                <ChipGroup name="sewerSystem.privateType" options={["Septic", "Aerobic", "Lagoon", "Other"]} required={false} />
              </div>
            )}
          </div>
        </SystemRow>

        <SystemRow label="Security System" name="systems.security" commentName="systemComments.security">
          <ChipGroup name="inlineOptions.securitySystemType" options={["Leased", "Owned", "Monitored", "Financed"]} required={false} />
        </SystemRow>

        <SystemRow label="Solar Panels" name="systems.solar" commentName="systemComments.solar">
          <ChipGroup name="inlineOptions.solarPanelType" options={["Leased", "Owned", "Financed"]} required={false} />
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