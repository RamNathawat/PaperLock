"use client";

import { useFormContext } from "react-hook-form";

const STATUS_OPTIONS = [
  { label: "Working", value: "WORKING" },
  { label: "Not Working", value: "NOT_WORKING" },
  { label: "Do Not Know if Working", value: "UNKNOWN" },
  { label: "None / Not Included", value: "NONE" },
];

function shouldShowSubtype(value?: string) {
  return !!value && value !== "NONE";
}

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
  const value = watch(name);

  return (
    <div className="rounded-xl border border-gray-100 p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-800">{label}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {STATUS_OPTIONS.map((option) => (
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

      {shouldShowSubtype(subtypeValue) && children}
    </div>
  );
}

function InlineOptions({
  name,
  label = "Select type",
  options,
}: {
  name: string;
  label?: string;
  options: string[];
}) {
  const { register } = useFormContext();

  return (
    <div className="pt-2 border-t border-gray-100">
      <p className="text-sm font-semibold text-gray-800 mb-3">
        {label}
      </p>

      <div className="flex flex-wrap gap-4">
        {options.map((opt, i) => (
          <label
            key={i}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
            <input
              {...register(name)}
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

export default function Step3Systems() {
  const { watch, register, setValue } = useFormContext();

  const waterHeater = watch("systems.waterHeater");
  const ac = watch("systems.ac");
  const heating = watch("systems.heating");
  const gasSupply = watch("systems.gasSupply");
  const generator = watch("systems.generator");
  const waterSource = watch("systems.waterSource");
  const sewer = watch("sewerSystem.type");
  const security = watch("systems.security");
  const solar = watch("systems.solar");
  const fireSuppression = watch("systems.fireSuppression");
  const fireSuppresionDate = watch(
    "inlineOptions.fireSuppresionDate"
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Systems
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Systems & Utilities
        </h2>
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
        label="Air Conditioning"
        name="systems.ac"
        subtypeValue={ac}
        commentName="systemComments.ac"
      >
        <InlineOptions
          name="inlineOptions.acType"
          options={[
            "Central",
            "Window Units",
            "Evaporative / Swamp",
            "Other",
          ]}
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
          options={[
            "Gas",
            "Electric",
            "Propane",
            "Oil",
            "Other",
          ]}
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
          options={["Natural Gas", "Propane", "Other"]}
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
          options={["Owned", "Leased", "Other"]}
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
          options={[
            "Public / Municipal",
            "Private Well",
            "Shared Well",
            "Other",
          ]}
        />
      </StatusRow>

      <StatusRow
        label="Sewer System"
        name="sewerSystem.type"
        subtypeValue={sewer}
        commentName="systemComments.sewer"
      >
        <InlineOptions
          name="sewerSystem.type"
          label="Select sewer access"
          options={["Public", "Private"]}
        />

        {String(sewer) === "1" && (
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

            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={fireSuppresionDate || ""}
              placeholder="MM/DD/YYYY"
              onChange={(e) => {
                const digits = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 8);

                let formatted = digits;

                if (digits.length > 2) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(
                    2
                  )}`;
                }

                if (digits.length > 4) {
                  formatted = `${digits.slice(0, 2)}/${digits.slice(
                    2,
                    4
                  )}/${digits.slice(4)}`;
                }

                setValue(
                  "inlineOptions.fireSuppresionDate",
                  formatted
                );
              }}
              className="w-48 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
            />
          </div>
        </div>
      </StatusRow>
    </div>
  );
}