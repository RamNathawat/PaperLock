"use client";

import { useFormContext } from "react-hook-form";

export default function Step4Zoning() {
  const { register } = useFormContext();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Zoning & Flood</h2>
        <p className="text-sm text-gray-500 mt-1">Provide zoning classification and flood zone information.</p>
      </div>

      {/* Zoning Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Zoning Classification</label>
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
            <label key={val} className="flex items-center gap-2 text-sm text-black">
              <input {...register("page2Zoning.zoningType")} type="radio" value={val} className="accent-blue-600" />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Historical District */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Is the property in a historical district?
        </label>
        <div className="flex gap-6">
          {["Yes", "No"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("page2Zoning.historicalDistrict")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Q3 Flood Zone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Q3. Is the property located in a flood zone?
        </label>
        <div className="flex gap-6">
          {["Yes", "No", "Unknown"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("page2Flood.q3Main")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

        {/* Q3 Flood Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            If yes, select flood zone type(s):
          </label>
          <div className="flex flex-wrap gap-4">
            {["100-year flood zone", "500-year flood zone", "Floodway", "Outside hazard area"].map((opt, i) => (
              <label key={i} className="flex items-center gap-2 text-sm text-black">
                <input {...register(`page2Flood.q3Types`)} type="checkbox" value={i} className="accent-blue-600" />
                {opt}
              </label>
            ))}
          </div>
        </div>

      {/* Q3 Municipal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Is there a municipal flood ordinance that affects the property?
        </label>
        <div className="flex gap-6">
          {["Yes", "No", "Unknown"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("page2Flood.q3Municipal")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Q4 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Q4. Has the property ever flooded?
        </label>
        <div className="flex gap-6">
          {["Yes", "No", "Unknown"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("page2Flood.q4")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Q5 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Q5. Is the property insured for flood damage?
        </label>
        <div className="flex gap-6">
          {["YES", "NO"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-black">
              <input {...register("page2Flood.q5")} type="radio" value={opt} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Q6 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Q6. Has a flood insurance claim ever been filed on the property?
        </label>
        <div className="flex gap-6">
          {["YES", "NO"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-black">
              <input {...register("page2Flood.q6")} type="radio" value={opt} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
