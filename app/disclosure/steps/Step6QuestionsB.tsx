"use client";

import { useFormContext, useFormState } from "react-hook-form";
import InfoTooltip from "@/app/disclosure/components/InfoTooltip";
import { YesNoCards } from "@/app/disclosure/components/OptionControls";

const QUESTIONS: Record<number, { text: string; tip: string }> = {
  21: { text: "Are you aware of major fire, tornado, hail, earthquake or wind damage?", tip: "Has the property suffered significant structural or cosmetic damage from a natural disaster or severe weather event?" },
  22: { text: "Have you received payment on an insurance claim that was not repaired?", tip: "Did you collect insurance money for damage but choose not to make the repairs? If so, that damage still exists and must be disclosed." },
  23: { text: "Are you aware of sewer, septic, lateral line or aerobic defects?", tip: "Are there any known problems with how waste leaves the home — including main sewer lines, septic tanks, or aerobic treatment systems?" },
  24: { text: "Are you aware of asbestos?", tip: "Is there any known asbestos-containing material in insulation, floor tiles, ceiling tiles, or other building materials?" },
  25: { text: "Are you aware of radon gas?", tip: "Radon is a naturally occurring radioactive gas that can accumulate in basements and lower levels. Do you know of any radon presence?" },
  26: { text: "Have you tested for radon gas?", tip: "Has a radon test ever been performed on the property? If yes, add the result in the comments." },
  27: { text: "Are you aware of lead-based paint?", tip: "Lead paint was common in homes built before 1978. Do you know of any lead-based paint on walls, trim, or other surfaces?" },
  28: { text: "Have you tested for lead-based paint?", tip: "Has a certified inspector ever tested the property for lead-based paint? If yes, note the result." },
  29: { text: "Are you aware of underground storage tanks?", tip: "Are there any buried fuel tanks, old oil tanks, or other underground containers on the property — even decommissioned ones?" },
  30: { text: "Are you aware of a landfill on the property?", tip: "Was any part of the land ever used to bury waste, debris, construction materials, or garbage?" },
  31: { text: "Are you aware of hazardous or regulated environmental conditions?", tip: "Has the property ever been used for industrial, agricultural chemical, or other activities that may have contaminated the soil or groundwater?" },
  32: { text: "Are you aware of prior methamphetamine manufacturing?", tip: "Oklahoma law requires disclosure if the property was ever used to manufacture meth. Cleanup is expensive and legally regulated." },
  33: { text: "Have you had the property inspected for mold?", tip: "Has a professional mold inspection been conducted? If yes, describe the findings in the comments." },
  34: { text: "Are you aware of remedial mold treatment on the property?", tip: "Has mold ever been professionally treated or remediated on the property?" },
  35: { text: "Are you aware of any condition impairing occupant health or safety?", tip: "Is there any other known condition — beyond what's already listed — that could pose a risk to the health or safety of someone living in the home?" },
  36: { text: "Are you aware of any wells located on the property?", tip: "Are there any water wells, dry wells, or abandoned wells on the property? Include both active and capped/decommissioned wells." },
};

function YesNoRow({ num }: { num: number }) {
  const { register, watch, control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const { text, tip } = QUESTIONS[num];
  const value    = watch(`questions.${num}`);
  const hasError = submitCount > 0 && !!(errors as any)?.questions?.[num];

  return (
    <div className={`relative rounded-2xl border p-5 space-y-4 ${hasError ? "border-amber-200 bg-amber-50/40" : "border-gray-100 bg-gray-50/30"}`}>
      <div className="absolute top-5 right-5">
        <InfoTooltip text={tip} />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 pr-8">Q{num}. {text}</p>
        {hasError && (
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            <p className="text-xs font-semibold text-amber-700">Required before continuing</p>
          </div>
        )}
      </div>

      <YesNoCards name={`questions.${num}`} />

      {value === "YES" && (
        <textarea
          {...register(`questionComments.${num}`, { required: true, shouldUnregister: true })}
          rows={3}
          placeholder={`Add details for Q${num}…`}
          className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            submitCount > 0 && !!(errors as any)?.questionComments?.[num] ? "border-amber-300 bg-amber-50" : "border-gray-200"
          }`}
        />
      )}
    </div>
  );
}

export default function Step6QuestionsB() {
  const { register, watch, formState: { errors, submitCount } } = useFormContext();
  const showErrors = submitCount > 0;
  const q37 = watch("questions.37");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Questions</p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">Environmental &amp; Land Questions</h2>
        <p className="text-sm text-gray-500 mt-1">
          All questions require a YES or NO answer. Tap <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#2463EB] border border-[#2463EB]/30 bg-blue-50 text-[10px] font-bold">i</span> for plain-English help.
        </p>
      </div>

      {[21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].map((n) => (
        <YesNoRow key={n} num={n} />
      ))}

      {/* Q37 — with conditional sub-form */}
      <div className={`relative rounded-2xl border p-5 space-y-4 ${showErrors && !!(errors as any)?.questions?.[37] ? "border-red-300 bg-red-50" : "border-gray-100 bg-gray-50/30"}`}>
        <div className="absolute top-5 right-5">
          <InfoTooltip text="Does the property include any dam, berm, or water retention structure — even a small earthen dam on a pond? If so, note who is responsible for maintenance." />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 pr-8">Q37. Are you aware of any dams located on the property?</p>
          {showErrors && !!(errors as any)?.questions?.[37] && (
            <span className="inline-flex mt-1.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
              Required before continuing
            </span>
          )}
        </div>

        <YesNoCards name="questions.37" />

        {q37 === "YES" && (
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <textarea
              {...register("questionComments.37")}
              rows={3}
              placeholder="Add dam details… (optional)"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <div className={`rounded-xl border p-4 space-y-3 ${showErrors && !!(errors as any)?.q37Inline?.maintenance ? "border-red-300 bg-red-50" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Are you responsible for dam maintenance?</p>
                {showErrors && !!(errors as any)?.q37Inline?.maintenance && (
                  <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wide">Required</span>
                )}
              </div>
              <YesNoCards name="q37Inline.maintenance" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}