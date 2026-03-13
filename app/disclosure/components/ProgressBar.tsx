"use client";

import { useWizard } from "@/lib/wizard/index";

const STEP_LABELS = [
  "Property",
  "Appliances",
  "Systems",
  "Zoning & Flood",
  "Questions",
  "Financial",
  "Signatures",
];

export default function ProgressBar() {
  const { stepNumber, totalSteps } = useWizard();
  const percent = Math.round((stepNumber / totalSteps) * 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">
          Step {stepNumber} of {totalSteps} — {STEP_LABELS[stepNumber - 1]}
        </span>
        <span className="text-sm text-gray-500">{percent}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
