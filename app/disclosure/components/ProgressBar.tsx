"use client";

import { useWizard } from "@/lib/wizard/index";

const DISPLAY_STEPS = [
  "Property",
  "Appliances",
  "Systems",
  "Zoning",
  "Questions",
  "Financial",
  "Signatures",
];

export default function ProgressBar() {
  const { stepNumber } = useWizard();

  /**
   * REAL WIZARD FLOW (1-based)
   * 1 Property
   * 2 Appliances A
   * 3 Appliances B
   * 4 Systems
   * 5 Zoning
   * 6 Questions A
   * 7 Questions B
   * 8 Questions C
   * 9 Financial
   * 10 Signatures
   */

  const applianceProgress =
    stepNumber === 2 ? 50 : stepNumber >= 3 ? 100 : 0;

  let questionsProgress = 0;

  if (stepNumber === 6) questionsProgress = 33;
  if (stepNumber === 7) questionsProgress = 66;
  if (stepNumber >= 8) questionsProgress = 100;

  const bars = [
    stepNumber >= 1 ? 100 : 0, // Property
    applianceProgress, // Appliances shared
    stepNumber >= 4 ? 100 : 0, // Systems
    stepNumber >= 5 ? 100 : 0, // Zoning
    questionsProgress, // Questions shared
    stepNumber >= 9 ? 100 : 0, // Financial
    stepNumber >= 10 ? 100 : 0, // Signatures
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
    (bars.reduce((sum, value) => sum + value, 0) /
      (DISPLAY_STEPS.length * 100)) *
      100
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
        {bars.map((value, i) => (
          <div
            key={i}
            className="h-2 rounded-full bg-gray-100 overflow-hidden"
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${value}%`,
                backgroundColor: "#2463EB",
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}