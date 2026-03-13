"use client";

import { useFormContext } from "react-hook-form";

const APPLIANCES = [
  "Refrigerator", "Freezer", "Dishwasher", "Garbage Disposal",
  "Microwave", "Oven/Range", "Trash Compactor", "Washer",
  "Dryer", "Ceiling Fan(s)", "Intercom System", "Central Vacuum",
  "Attic Fan", "Exhaust Fan(s)", "Garage Door Opener(s)", "Hot Tub/Spa",
  "Pool", "Pool Equipment", "Sauna",
  "Smoke Detector(s)", "CO Detector(s)", "Fire Alarm System",
  "TV Antenna/Satellite Dish", "Playground Equipment",
  "Storage Shed(s)", "Sprinkler System", "Water Softener",
  "Water Filter/Purifier", "Sump Pump", "Septic System",
  "Well Pump", "Generator", "Solar Panels",
  "Window A/C Unit(s)", "Portable Heater(s)",
  "Wood Stove/Fireplace Insert", "Gas Logs",
  "Outdoor Grill (Built-in)", "Other"
];

const OPTIONS = ["WORKING", "NOT_WORKING", "UNKNOWN", "NONE"] as const;
const LABELS = ["Working", "Not Working", "Unknown", "None"];

export default function Step2Appliances() {
  const { register, watch } = useFormContext();
  const appliances = watch("appliances") || {};
  const hasNotWorking = Object.values(appliances).some(v => v === "NOT_WORKING");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Appliances & Equipment</h2>
        <p className="text-sm text-gray-500 mt-1">
          Select the condition of each item included with the property.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 pr-4 font-medium text-gray-700 w-1/2">Item</th>
              {LABELS.map(label => (
                <th key={label} className="text-center py-2 px-2 font-medium text-gray-700">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {APPLIANCES.map((name, index) => (
              <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                <td className="py-2 pr-4 text-gray-700">{name}</td>
                {OPTIONS.map(option => (
                  <td key={option} className="text-center py-2 px-2">
                    <input
                      {...register(`appliances.${index}`)}
                      type="radio"
                      value={option}
                      className="accent-blue-600"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasNotWorking && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Please explain items marked as Not Working
          </label>
          <textarea
            {...register("page2NotWorkingExplanation")}
            rows={4}
            placeholder="Describe the issues with items marked as not working..."
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
}
