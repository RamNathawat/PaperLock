"use client";

import { useFormContext } from "react-hook-form";

function RadioGroup({
  name,
  options,
}: {
  name: string;
  options: string[];
}) {
  const { register } = useFormContext();

  return (
    <div className="flex flex-wrap gap-4">
      {options.map((opt, i) => (
        <label
          key={opt}
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
  );
}

export default function Step4Zoning() {
  const { register, watch } = useFormContext();

  const q3Main = watch("page2Flood.q3Main");
  const q4 = watch("page2Flood.q4");
  const q5 = watch("page2Flood.q5");

  const showFloodDetails = String(q3Main) === "0";
  const showInsuranceQuestions =
    String(q3Main) === "0" || String(q4) === "0";

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Zoning
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Zoning & Flood
        </h2>
      </div>

      {/* Zoning */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Zoning Classification
        </p>

        <div className="flex flex-wrap gap-4">
          {[
            ["residential", "Residential"],
            ["commercial", "Commercial"],
            ["historical", "Historical"],
            ["office", "Office"],
            ["agricultural", "Agricultural"],
            ["industrial", "Industrial"],
            ["urban_conservation", "Urban Conservation"],
            ["other", "Other"],
            ["unknown", "Unknown"],
            ["no_zoning", "No Zoning"],
          ].map(([val, label]) => (
            <label
              key={val}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <input
                {...register("page2Zoning.zoningType")}
                type="radio"
                value={val}
                className="accent-[#2463EB]"
              />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Historical district */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Is the property in a historical district?
        </p>
        <RadioGroup
          name="page2Zoning.historicalDistrict"
          options={["Yes", "No"]}
        />
      </div>

      {/* Flood zone */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Is the property located in a flood zone?
        </p>

        <RadioGroup
          name="page2Flood.q3Main"
          options={["Yes", "No", "Unknown"]}
        />

        {showFloodDetails && (
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Select flood zone type(s)
              </p>

              <div className="flex flex-wrap gap-4">
                {[
                  "100-year flood zone",
                  "500-year flood zone",
                  "Floodway",
                  "Outside hazard area",
                ].map((opt, i) => (
                  <label
                    key={i}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <input
                      {...register("page2Flood.q3Types")}
                      type="checkbox"
                      value={i}
                      className="accent-[#2463EB]"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Is there a municipal flood ordinance?
              </p>

              <RadioGroup
                name="page2Flood.q3Municipal"
                options={["Yes", "No", "Unknown"]}
              />
            </div>
          </div>
        )}
      </div>

      {/* Ever flooded */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Has the property ever flooded?
        </p>

        <RadioGroup
          name="page2Flood.q4"
          options={["Yes", "No", "Unknown"]}
        />
      </div>

      {/* Insurance branch */}
      {showInsuranceQuestions && (
        <>
          <div className="rounded-xl border border-gray-100 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-800">
              Q5. Are you aware of any flood insurance requirements concerning the property?
            </p>

            <RadioGroup
              name="page2Flood.q5"
              options={["Yes", "No"]}
            />
          </div>

          <div className="rounded-xl border border-gray-100 p-5 space-y-4">
            <p className="text-sm font-semibold text-gray-800">
              Q6. Are you aware of any flood insurance on the property?
            </p>

            <RadioGroup
              name="page2Flood.q6"
              options={["Yes", "No"]}
            />
          </div>
        </>
      )}
    </div>
  );
}