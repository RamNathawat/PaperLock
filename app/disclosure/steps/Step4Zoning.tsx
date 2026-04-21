"use client";

import { useFormContext, useFormState } from "react-hook-form";
import InfoTooltip from "@/app/disclosure/components/InfoTooltip";
import { YesNoCards, YesNoUnknownCards, ValueChipGroup, ChipGroup } from "@/app/disclosure/components/OptionControls";

function getNestedError(errors: any, path: string) {
  return path.split(".").reduce((obj: any, key: string) => obj?.[key], errors);
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
  const { control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const hasError = submitCount > 0 && !!getNestedError(errors, errorPath);

  return (
    <div className={`relative rounded-2xl border p-5 space-y-4 ${hasError ? "border-amber-200 bg-amber-50/40" : "border-gray-100 bg-gray-50/30"}`}>
      {tip && (
        <div className="absolute top-5 right-5">
          <InfoTooltip text={tip} />
        </div>
      )}
      <div>
        <p className="text-sm font-semibold text-gray-800 pr-8">{label}</p>
        {hasError && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-amber-700">Required before continuing</p>
          </div>
        )}
      </div>
      {children}
    </div>
  );
}

export default function Step4Zoning() {
  const { register, watch, control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const showErrors = submitCount > 0;
  const q3Main = watch("page2Flood.q3Main");
  const showFloodDetails = String(q3Main) === "0";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Zoning</p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">Zoning &amp; Flood</h2>
      </div>

      {/* Zoning type — chip group (10 options) */}
      <FieldBox
        errorPath="page2Zoning.zoningType"
        label="Zoning Classification"
        tip="Select how the property is officially designated by the local government. If unsure, check the county assessor's website or ask your realtor."
      >
        <ValueChipGroup
          name="page2Zoning.zoningType"
          options={[
            { value: "residential",        label: "Residential" },
            { value: "commercial",         label: "Commercial" },
            { value: "historical",         label: "Historical" },
            { value: "office",             label: "Office" },
            { value: "agricultural",       label: "Agricultural" },
            { value: "industrial",         label: "Industrial" },
            { value: "urban_conservation", label: "Urban Conservation" },
            { value: "other",              label: "Other" },
            { value: "unknown",            label: "Unknown" },
            { value: "no_zoning",          label: "No Zoning" },
          ]}
        />
      </FieldBox>

      {/* Historical district — Yes / No */}
      <FieldBox
        errorPath="page2Zoning.historicalDistrict"
        label="Is the property in a historical district?"
        tip="A historical district means the property is subject to extra rules about exterior changes. Buyers need to know because it limits future renovations."
      >
        <YesNoUnknownCards name="page2Zoning.historicalDistrict" options={["Yes", "No"]} />
      </FieldBox>

      {/* Flood zone — Yes / No / Unknown */}
      <FieldBox
        errorPath="page2Flood.q3Main"
        label="Is the property located in a flood zone?"
        tip="FEMA designates flood zones based on risk. Properties in a 100-year flood zone typically require flood insurance."
      >
        <YesNoUnknownCards name="page2Flood.q3Main" options={["Yes", "No", "Unknown"]} />

        {showFloodDetails && (
          <div className="pt-3 border-t border-gray-100 space-y-4">
            {/* Flood zone types — checkboxes as chips */}
            <div className={`rounded-xl border p-4 space-y-3 ${showErrors && !!getNestedError(errors, "page2Flood.q3Types") ? "border-amber-200 bg-amber-50/40" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Select flood zone type(s)
                  <InfoTooltip text="A 100-year zone (Zone A/AE) has 1% annual flood risk. A 500-year zone has 0.2% risk. A floodway is the active channel — highest risk." />
                </p>
                {showErrors && !!getNestedError(errors, "page2Flood.q3Types") && (
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">Select at least one</span>
                )}
              </div>
              <ChipGroup name="page2Flood.q3Types" options={["100-year flood zone", "500-year flood zone", "Floodway", "Outside hazard area"]} type="checkbox" />
            </div>

            {/* Municipal flood ordinance */}
            <div className={`rounded-xl border p-4 space-y-3 ${showErrors && !!getNestedError(errors, "page2Flood.q3Municipal") ? "border-amber-200 bg-amber-50/40" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">
                  Is there a municipal flood ordinance?
                  <InfoTooltip text="Some cities have flood rules stricter than FEMA's. These can affect what you're allowed to build or renovate in the flood zone." />
                </p>
                {showErrors && !!getNestedError(errors, "page2Flood.q3Municipal") && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wide">Required</span>
                )}
              </div>
              <YesNoUnknownCards name="page2Flood.q3Municipal" options={["Yes", "No", "Unknown"]} />
            </div>
          </div>
        )}
      </FieldBox>

      {/* Ever flooded */}
      <FieldBox errorPath="page2Flood.q4" label="Has the property ever flooded?"
        tip="Has water from a flood event ever entered the structure or significantly affected the land while you owned it?">
        <YesNoUnknownCards name="page2Flood.q4" options={["Yes", "No", "Unknown"]} />
      </FieldBox>

      <FieldBox errorPath="page2Flood.q5" label="Q5. Are you aware of any flood insurance requirements concerning the property?"
        tip="Lenders typically require flood insurance for properties in high-risk flood zones.">
        <YesNoCards name="page2Flood.q5" />
      </FieldBox>

      <FieldBox errorPath="page2Flood.q6" label="Q6. Are you aware of any flood insurance on the property?"
        tip="Is there an active flood insurance policy on this property? If so, the buyer may be able to assume it at the existing rate.">
        <YesNoCards name="page2Flood.q6" />
      </FieldBox>
    </div>
  );
}