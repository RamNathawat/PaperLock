"use client";

import { useFormContext } from "react-hook-form";

export default function Step3Systems() {
  const { register } = useFormContext();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Systems & Utilities</h2>
        <p className="text-sm text-gray-500 mt-1">Select the type for each system in the property.</p>
      </div>

      {/* Water Heater */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Water Heater Type</label>
        <div className="flex flex-wrap gap-4">
          {["Electric", "Gas", "Tankless", "Solar", "Other"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.waterHeaterType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Water Softener */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Water Softener</label>
        <div className="flex flex-wrap gap-4">
          {["Owned", "Leased", "None"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.waterSoftenerType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* AC */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Air Conditioning Type</label>
        <div className="flex flex-wrap gap-4">
          {["Central", "Window Units", "Evaporative/Swamp", "None", "Other"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.acType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Heating */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Heating Type</label>
        <div className="flex flex-wrap gap-4">
          {["Gas", "Electric", "Propane", "Oil", "Other"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.heatingType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Gas Supply */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Gas Supply</label>
        <div className="flex flex-wrap gap-4">
          {["Natural Gas", "Propane", "None"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.gasSupplyType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Propane Tank */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Propane Tank</label>
        <div className="flex flex-wrap gap-4">
          {["Owned", "Leased", "None"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.propaneTankType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Generator */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Generator</label>
        <div className="flex flex-wrap gap-4">
          {["Owned", "Leased", "None"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.generatorType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Water Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Water Source</label>
        <div className="flex flex-wrap gap-4">
          {["Public/Municipal", "Private Well", "Shared Well", "Other"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.waterSourceType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Sewer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Sewer System</label>
        <div className="flex flex-wrap gap-4">
          {["Public", "Private"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("sewerSystem.type")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 mt-3 ml-4">
          <p className="text-xs text-gray-500 w-full">If private, select type:</p>
          {["Septic", "Aerobic", "Lagoon", "Other"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("sewerSystem.privateType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Security System */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Security System</label>
        <div className="flex flex-wrap gap-4">
          {["Leased", "Owned", "Monitored", "Financed"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.securitySystemType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Solar Panels */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Solar Panels</label>
        <div className="flex flex-wrap gap-4">
          {["Leased", "Owned", "Financed"].map((opt, i) => (
            <label key={i} className="flex items-center gap-2 text-sm text-black">
              <input {...register("inlineOptions.solarPanelType")} type="radio" value={i} className="accent-blue-600" />
              {opt}
            </label>
          ))}
        </div>
      </div>

      {/* Fire Suppression Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fire Suppression System — Last Inspection Date
        </label>
        <input
          {...register("inlineOptions.fireSuppresionDate")}
          type="text"
          placeholder="MM/DD/YYYY"
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
        />
      </div>
    </div>
  );
}
