"use client";

import { useFormContext } from "react-hook-form";

const SIMPLE_QUESTIONS = {
  7: "Are you aware of flood, storm run-off, sewer backup, draining or grading defects?",
  8: "Are you aware of any surface or ground water drainage systems?",
  9: "Are you aware of any water in the heating and air conditioning duct system?",
  10: "Are you aware of water seepage, leakage or draining defects?",
  11: "Are you aware of additions made without required permits?",
  12: "Are you aware of previous foundation repairs?",
  13: "Are you aware of alterations or repairs made to correct defects?",
  14: "Are you aware of defects affecting walls, ceilings, roof, slab, floors, windows, doors, fences or garage?",
  15: "Was the roof covering repaired or replaced during ownership?",
  17: "Do you know of any current roof defects?",
  18: "Are you aware of termite treatment?",
  20: "Are you aware of termite or wood-destroying organism damage?",
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

export default function Step5QuestionsA() {
  const { register, watch } = useFormContext();
  const q19 = watch("questions.19");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Questions
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Structural, Roof & Termite Questions
        </h2>
      </div>

      {[7, 8, 9, 10, 11, 12, 13, 14, 15].map((num) => (
        <YesNoRow
          key={num}
          num={num}
          text={SIMPLE_QUESTIONS[num as keyof typeof SIMPLE_QUESTIONS]}
        />
      ))}

      {/* Q16 roof age */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Q16. Approximate age of roof covering
        </p>

        <input
          {...register("q16Inline.roofAge")}
          placeholder="Roof age (years)"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
        />

        <input
          {...register("q16Inline.layers")}
          placeholder="Number of layers"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
        />
      </div>

      <YesNoRow num={17} text={SIMPLE_QUESTIONS[17]} />
      <YesNoRow num={18} text={SIMPLE_QUESTIONS[18]} />

      {/* Q19 termite bait */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Q19. Are you aware of a termite bait system installed on the property?
        </p>

        <div className="flex gap-4">
          {["YES", "NO"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
              <input
                {...register("questions.19")}
                type="radio"
                value={opt}
                className="accent-[#2463EB]"
              />
              {opt}
            </label>
          ))}
        </div>

        {q19 === "YES" && (
          <input
            {...register("q19Inline.annualCost")}
            placeholder="Annual cost ($)"
            className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
          />
        )}
      </div>

      <YesNoRow num={20} text={SIMPLE_QUESTIONS[20]} />
    </div>
  );
}