"use client";

import { useWizard } from "@/lib/wizard/index";
import { useFormContext } from "react-hook-form";

const DISPLAY_STEPS = [
  "Property",
  "Appliances",
  "Systems",
  "Zoning",
  "Questions",
  "Financial",
  "Signatures",
];

function countErrors(errors: Record<string, any>): number {
  if (!errors || typeof errors !== "object") return 0;
  let count = 0;
  for (const key of Object.keys(errors)) {
    const val = errors[key];
    if (!val) continue;
    if (val.message !== undefined || val.type !== undefined) count += 1;
    else count += countErrors(val);
  }
  return count;
}

export default function ProgressBar() {
  const { stepNumber } = useWizard();
  const { formState: { errors, submitCount } } = useFormContext();

  const hasErrors = submitCount > 0 && countErrors(errors) > 0;

  const applianceProgress =
    stepNumber === 2 ? 50 : stepNumber >= 3 ? 100 : 0;

  let questionsProgress = 0;
  if (stepNumber === 6) questionsProgress = 33;
  if (stepNumber === 7) questionsProgress = 66;
  if (stepNumber >= 8) questionsProgress = 100;

  const bars = [
    stepNumber >= 1 ? 100 : 0,   // Property
    applianceProgress,            // Appliances
    stepNumber >= 4 ? 100 : 0,   // Systems
    stepNumber >= 5 ? 100 : 0,   // Zoning
    questionsProgress,            // Questions
    stepNumber >= 9 ? 100 : 0,   // Financial
    stepNumber >= 10 ? 100 : 0,  // Signatures
  ];

  let visibleStepIndex = 0;
  if (stepNumber === 1) visibleStepIndex = 0;
  else if (stepNumber <= 3) visibleStepIndex = 1;
  else if (stepNumber === 4) visibleStepIndex = 2;
  else if (stepNumber === 5) visibleStepIndex = 3;
  else if (stepNumber <= 8) visibleStepIndex = 4;
  else if (stepNumber === 9) visibleStepIndex = 5;
  else visibleStepIndex = 6;

  const completionPercent = Math.round(
    (bars.reduce((sum, v) => sum + v, 0) / (DISPLAY_STEPS.length * 100)) * 100
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          {DISPLAY_STEPS[visibleStepIndex]}
        </p>
        <p className="text-[11px] font-medium text-gray-400">
          {completionPercent}% Complete
        </p>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {bars.map((value, i) => {
          const isActive = i === visibleStepIndex;
          return (
            <div key={i} className="flex flex-col gap-[3px]">
              {/* Main bar */}
              <div
                className={`h-2 rounded-full overflow-hidden transition-all duration-300 ${
                  isActive
                    ? "bg-gray-100 shadow-[0_0_0_3px_rgba(36,99,235,0.15)]"
                    : "bg-gray-100"
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${value}%`,
                    backgroundColor: "#2463EB",
                  }}
                />
              </div>

              {/* Red error underline — only on active step when there are errors */}
              <div
                className={`h-[2px] rounded-full transition-all duration-200 ${
                  isActive && hasErrors ? "bg-red-400" : "bg-transparent"
                }`}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}