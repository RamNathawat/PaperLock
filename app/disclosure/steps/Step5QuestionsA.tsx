"use client";

import { useContext } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import InfoTooltip from "@/app/disclosure/components/InfoTooltip";
import { YesNoCards } from "@/app/disclosure/components/OptionControls";
import { ReadOnlyContext } from "../page";

const QUESTIONS: Record<number, { text: string; tip: string }> = {
  7:  { text: "Are you aware of flood, storm run-off, sewer backup, draining or grading defects?", tip: "Has water ever pooled in the yard, backed up into the basement, or drained improperly after rain?" },
  8:  { text: "Are you aware of any surface or ground water drainage systems?", tip: "Are there any French drains, retention ponds, drainage easements, or stormwater infrastructure on or near the property?" },
  9:  { text: "Are you aware of any water in the heating and air conditioning duct system?", tip: "Has moisture, condensation, or standing water ever been found inside the HVAC ducts?" },
  10: { text: "Are you aware of water seepage, leakage or draining defects?", tip: "Has water ever leaked through the walls, foundation, roof, or windows?" },
  11: { text: "Are you aware of additions made without required permits?", tip: "Were any rooms, garages, decks, or structures added without obtaining a building permit from the city or county?" },
  12: { text: "Are you aware of previous foundation repairs?", tip: "Has the foundation ever been repaired, reinforced, or had piers installed to address settling or cracking?" },
  13: { text: "Are you aware of alterations or repairs made to correct defects?", tip: "Were any repairs done to fix a known problem — not just routine maintenance, but fixes for a specific defect?" },
  14: { text: "Are you aware of defects affecting walls, ceilings, roof, slab, floors, windows, doors, fences or garage?", tip: "Are there any known cracks, leaks, rot, damage, or functional issues with these structural or exterior elements?" },
  15: { text: "Was the roof covering repaired or replaced during ownership?", tip: "Has any portion of the roof shingles, tiles, or membrane been repaired or fully replaced while you owned the property?" },
  17: { text: "Do you know of any current roof defects?", tip: "Are there any active leaks, missing shingles, damaged flashing, or other known roof problems right now?" },
  18: { text: "Are you aware of termite treatment?", tip: "Has the property ever been treated for termites or other wood-destroying insects, either as a precaution or after an infestation?" },
  20: { text: "Are you aware of termite or wood-destroying organism damage?", tip: "Is there any known damage to wood framing, floors, or structural components caused by termites, carpenter ants, or wood-boring beetles?" },
};

function YesNoRow({ num }: { num: number }) {
  const { register, watch, control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const isReadOnly = useContext(ReadOnlyContext);
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

      {value === "YES" && !isReadOnly && (
        <textarea
          {...register(`questionComments.${num}`, { required: true, shouldUnregister: true })}
          rows={3}
          placeholder={`Add details for Q${num}…`}
          className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            submitCount > 0 && !!(errors as any)?.questionComments?.[num] ? "border-amber-300 bg-amber-50" : "border-gray-200"
          }`}
        />
      )}
      {value === "YES" && isReadOnly && <ReadOnlyComment name={`questionComments.${num}`} />}
    </div>
  );
}

function ReadOnlyComment({ name }: { name: string }) {
  const { watch } = useFormContext();
  const text = watch(name);
  if (!text) return null;
  return (
    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
      {text}
    </p>
  );
}

export default function Step5QuestionsA() {
  const isReadOnly = useContext(ReadOnlyContext);
  const { register, watch, formState: { errors, submitCount } } = useFormContext();
  const showErrors = submitCount > 0;
  const q19 = watch("questions.19");

  return (
    <fieldset disabled={isReadOnly} className={isReadOnly ? "pointer-events-none opacity-70 border-none p-0 m-0 min-w-0" : "border-none p-0 m-0 min-w-0"}>
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Questions</p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">Structural, Roof &amp; Termite Questions</h2>
          <p className="text-sm text-gray-500 mt-1">
            All questions require a YES or NO answer. Tap <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#2463EB] border border-[#2463EB]/30 bg-blue-50 text-[10px] font-bold">i</span> for plain-English help.
          </p>
        </div>

        {[7, 8, 9, 10, 11, 12, 13, 14, 15].map((n) => <YesNoRow key={n} num={n} />)}

        {/* Q16 — informational only */}
        <div className="relative rounded-2xl border border-gray-100 bg-gray-50/30 p-5 space-y-4">
          <div className="absolute top-5 right-5">
            <InfoTooltip text="How old is the current roof material (shingles, tile, etc.)? Also indicate how many layers are present — most codes allow a maximum of 2." />
          </div>
          <p className="text-sm font-semibold text-gray-800 pr-8">Q16. Approximate age of roof covering</p>
          <div className="grid grid-cols-2 gap-3">
            <input
              {...register("q16Inline.roofAge", { required: true })}
              placeholder="Roof age (years)"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${showErrors && !!(errors as any)?.q16Inline?.roofAge ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
            <input
              {...register("q16Inline.layers", { required: true })}
              placeholder="Number of layers"
              className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${showErrors && !!(errors as any)?.q16Inline?.layers ? "border-red-400 bg-red-50" : "border-gray-200"}`}
            />
          </div>
        </div>

        <YesNoRow num={17} />
        <YesNoRow num={18} />

        {/* Q19 — with conditional cost field */}
        <div className={`relative rounded-2xl border p-5 space-y-4 ${showErrors && !!(errors as any)?.questions?.[19] ? "border-red-300 bg-red-50" : "border-gray-100 bg-gray-50/30"}`}>
          <div className="absolute top-5 right-5">
            <InfoTooltip text="A termite bait system is a set of underground stations around the home that attract and kill termite colonies. If one is in place, the buyer will need to maintain it (often through an annual contract)." />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800 pr-8">Q19. Are you aware of a termite bait system installed on the property?</p>
            {showErrors && !!(errors as any)?.questions?.[19] && (
              <span className="inline-flex mt-1.5 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wide">
                Required before continuing
              </span>
            )}
          </div>
          <YesNoCards name="questions.19" />
          {q19 === "YES" && !isReadOnly && (
            <input {...register("q19Inline.annualCost")} placeholder="Annual maintenance cost ($) — optional"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" />
          )}
          {q19 === "YES" && isReadOnly && <ReadOnlyComment name="q19Inline.annualCost" />}
        </div>

        <YesNoRow num={20} />
      </div>
    </fieldset>
  );
}