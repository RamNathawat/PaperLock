"use client";

import { useFormContext } from "react-hook-form";

const SIMPLE_QUESTIONS = {
  21: "Are you aware of major fire, tornado, hail, earthquake or wind damage?",
  22: "Have you received payment on an insurance claim that was not repaired?",
  23: "Are you aware of sewer, septic, lateral line or aerobic defects?",
  24: "Are you aware of asbestos?",
  25: "Are you aware of radon gas?",
  26: "Have you tested for radon gas?",
  27: "Are you aware of lead-based paint?",
  28: "Have you tested for lead-based paint?",
  29: "Are you aware of underground storage tanks?",
  30: "Are you aware of a landfill on the property?",
  31: "Are you aware of hazardous or regulated environmental conditions?",
  32: "Are you aware of prior methamphetamine manufacturing?",
  33: "Have you had the property inspected for mold?",
  34: "Are you aware of remedial mold treatment on the property?",
  35: "Are you aware of any condition impairing occupant health or safety?",
  36: "Are you aware of any wells located on the property?",
};

function YesNoRow({ num, text }: { num: number; text: string }) {
  const { register, watch } = useFormContext();
  const value = watch(`questions.${num}`);

  return (
    <div className="rounded-xl border border-gray-100 p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-800">
        Q{num}. {text}
      </p>

      <div className="flex flex-wrap gap-4">
        {["YES", "NO"].map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
            <input
              {...register(`questions.${num}`)}
              type="radio"
              value={opt}
              className="accent-[#2463EB]"
            />
            {opt}
          </label>
        ))}
      </div>

      {value === "YES" && (
        <textarea
          {...register(`questionComments.${num}`)}
          rows={3}
          placeholder={`Add details for Q${num}...`}
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
        />
      )}
    </div>
  );
}

export default function Step6QuestionsB() {
  const { register, watch } = useFormContext();
  const q37 = watch("questions.37");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Questions
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Environmental & Land Questions
        </h2>
      </div>

      {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].map((num) => (
        <YesNoRow
          key={num}
          num={num}
          text={SIMPLE_QUESTIONS[num as keyof typeof SIMPLE_QUESTIONS]}
        />
      ))}

      {/* Q37 dam */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Q37. Are you aware of any dams located on the property?
        </p>

        <div className="flex gap-4">
          {["YES", "NO"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
              <input
                {...register("questions.37")}
                type="radio"
                value={opt}
                className="accent-[#2463EB]"
              />
              {opt}
            </label>
          ))}
        </div>

        {q37 === "YES" && (
          <div className="space-y-4">
            <textarea
              {...register("questionComments.37")}
              rows={3}
              placeholder="Add dam details..."
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-3">
                Are you responsible for maintenance?
              </p>

              <div className="flex gap-4">
                {["YES", "NO"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      {...register("q37Inline.maintenance")}
                      type="radio"
                      value={opt}
                      className="accent-[#2463EB]"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}