"use client";

import { useFormContext } from "react-hook-form";
import InfoTooltip from "@/app/disclosure/components/InfoTooltip";

function getNestedError(errors: any, path: string) {
  return path.split(".").reduce((obj, key) => obj?.[key], errors);
}

function FieldBox({
  errorPath,
  label,
  tip,
  children,
}: {
  errorPath: string;
  label: string;
  tip?: string;
  children: React.ReactNode;
}) {
  const { formState: { errors, submitCount } } = useFormContext();
  const hasError = submitCount > 0 && !!getNestedError(errors, errorPath);

  return (
    <div className={`rounded-xl border p-5 space-y-4 ${hasError ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">
          {label}
          {tip && <InfoTooltip text={tip} />}
        </p>
        {hasError && (
          <span className="text-xs font-bold text-red-600 uppercase tracking-wide whitespace-nowrap shrink-0">
            Required before continuing
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Step4Zoning() {
  const {
    register,
    watch,
    formState: { errors, submitCount },
  } = useFormContext();

  const showErrors = submitCount > 0;
  const q3Main     = watch("page2Flood.q3Main");
  const q4         = watch("page2Flood.q4");

  const showFloodDetails       = String(q3Main) === "0";
  const showInsuranceQuestions = String(q3Main) === "0" || String(q4) === "0";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Zoning</p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">Zoning & Flood</h2>
      </div>

      {/* Zoning type */}
      <FieldBox
        errorPath="page2Zoning.zoningType"
        label="Zoning Classification"
        tip="Select how the property is officially designated by the local government. If you're unsure, check the county assessor's website or ask your realtor."
      >
        <div className="flex flex-wrap gap-4">
          {[
            ["residential", "Residential"],
            ["commercial",  "Commercial"],
            ["historical",  "Historical"],
            ["office",      "Office"],
            ["agricultural","Agricultural"],
            ["industrial",  "Industrial"],
            ["urban_conservation","Urban Conservation"],
            ["other",       "Other"],
            ["unknown",     "Unknown"],
            ["no_zoning",   "No Zoning"],
          ].map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 text-sm text-gray-600">
              <input {...register("page2Zoning.zoningType", { required: true })} type="radio" value={val} className="accent-[#2463EB]" />
              {label}
            </label>
          ))}
        </div>
      </FieldBox>

      {/* Historical district */}
      <FieldBox
        errorPath="page2Zoning.historicalDistrict"
        label="Is the property in a historical district?"
        tip="A historical district means the property is subject to extra rules about what changes you can make to the exterior. Buyers need to know because it limits future renovations."
      >
        <div className="flex flex-wrap gap-4">
          {["Yes", "No"].map((opt, i) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
              <input {...register("page2Zoning.historicalDistrict", { required: true })} type="radio" value={i} className="accent-[#2463EB]" />
              {opt}
            </label>
          ))}
        </div>
      </FieldBox>

      {/* Flood zone */}
      <FieldBox
        errorPath="page2Flood.q3Main"
        label="Is the property located in a flood zone?"
        tip="FEMA designates areas as flood zones based on risk. Properties in a 100-year flood zone typically require flood insurance. Check FEMA's Flood Map Service if unsure."
      >
        <div className="flex flex-wrap gap-4">
          {["Yes", "No", "Unknown"].map((opt, i) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
              <input {...register("page2Flood.q3Main", { required: true })} type="radio" value={i} className="accent-[#2463EB]" />
              {opt}
            </label>
          ))}
        </div>

        {showFloodDetails && (
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <div className={`rounded-lg border p-3 space-y-2 ${showErrors && !!getNestedError(errors, "page2Flood.q3Types") ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Select flood zone type(s)
                  <InfoTooltip text="A 100-year zone (Zone A/AE) has a 1% annual flood risk. A 500-year zone has a 0.2% risk. A floodway is the active channel — highest risk. 'Outside hazard area' means minimal risk." />
                </p>
                {showErrors && !!getNestedError(errors, "page2Flood.q3Types") && (
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Select at least one</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {["100-year flood zone", "500-year flood zone", "Floodway", "Outside hazard area"].map((opt, i) => (
                  <label key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <input {...register("page2Flood.q3Types", { required: true })} type="checkbox" value={i} className="accent-[#2463EB]" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div className={`rounded-lg border p-3 space-y-2 ${showErrors && !!getNestedError(errors, "page2Flood.q3Municipal") ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Is there a municipal flood ordinance?
                  <InfoTooltip text="Some cities have their own flood rules stricter than FEMA's. These can affect what you're allowed to build or renovate in the flood zone." />
                </p>
                {showErrors && !!getNestedError(errors, "page2Flood.q3Municipal") && (
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Required</span>
                )}
              </div>
              <div className="flex flex-wrap gap-4">
                {["Yes", "No", "Unknown"].map((opt, i) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                    <input {...register("page2Flood.q3Municipal", { required: true })} type="radio" value={i} className="accent-[#2463EB]" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </FieldBox>

      {/* Ever flooded */}
      <FieldBox
        errorPath="page2Flood.q4"
        label="Has the property ever flooded?"
        tip="Has water from a flood event (not a plumbing leak) ever entered the structure or significantly affected the land while you owned it?"
      >
        <div className="flex flex-wrap gap-4">
          {["Yes", "No", "Unknown"].map((opt, i) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
              <input {...register("page2Flood.q4", { required: true })} type="radio" value={i} className="accent-[#2463EB]" />
              {opt}
            </label>
          ))}
        </div>
      </FieldBox>

      {showInsuranceQuestions && (
        <>
          <FieldBox
            errorPath="page2Flood.q5"
            label="Q5. Are you aware of any flood insurance requirements concerning the property?"
            tip="Lenders typically require flood insurance for properties in high-risk flood zones. Even if not required, it may already be in place."
          >
            <div className="flex flex-wrap gap-4">
              {["Yes", "No"].map((opt, i) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                  <input {...register("page2Flood.q5", { required: true })} type="radio" value={i} className="accent-[#2463EB]" />
                  {opt}
                </label>
              ))}
            </div>
          </FieldBox>

          <FieldBox
            errorPath="page2Flood.q6"
            label="Q6. Are you aware of any flood insurance on the property?"
            tip="Is there an active flood insurance policy on this property right now? If so, the buyer may be able to assume it."
          >
            <div className="flex flex-wrap gap-4">
              {["Yes", "No"].map((opt, i) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                  <input {...register("page2Flood.q6", { required: true })} type="radio" value={i} className="accent-[#2463EB]" />
                  {opt}
                </label>
              ))}
            </div>
          </FieldBox>
        </>
      )}
    </div>
  );
}