"use client";

import { useFormContext } from "react-hook-form";
import InfoTooltip from "@/app/disclosure/components/InfoTooltip";

const QUESTIONS: Record<number, { text: string; tip: string }> = {
  38: {
    text: "Are you aware of shared common features affecting the property?",
    tip:  "Are there shared driveways, walls, fences, wells, or other features that are jointly owned or maintained with a neighbor?",
  },
  39: {
    text: "Other than utility easements, are you aware of easements or right-of-ways?",
    tip:  "Does anyone else have a legal right to use part of the property — e.g. a neighbor's access path, a pipeline easement, or a conservation restriction?",
  },
  40: {
    text: "Are you aware of encroachments affecting the property?",
    tip:  "Does a fence, building, or structure from this property or a neighboring property cross over a property line?",
  },
  41: {
    text: "Are you aware of a mandatory homeowner's association?",
    tip:  "Is the property part of an HOA that all owners are required to join and pay dues to? Include the amount and how often dues are paid.",
  },
  42: {
    text: "Are you aware of zoning, building code or setback violations?",
    tip:  "Is there anything on the property that violates local zoning rules — like a shed too close to the lot line, an unpermitted structure, or non-conforming use?",
  },
  43: {
    text: "Are you aware of notices from any government or agencies affecting the property?",
    tip:  "Have you received any official notices, citations, orders, or letters from a city, county, state, or federal agency about the property?",
  },
  44: {
    text: "Are you aware of any surface leases (agricultural, commercial, oil & gas)?",
    tip:  "Is any part of the property subject to a lease for farming, grazing, mineral extraction, oil & gas, or any commercial activity?",
  },
  45: {
    text: "Are you aware of filed litigation or lawsuits affecting the property?",
    tip:  "Is there any pending or recent lawsuit, legal dispute, or court action that involves the property or its ownership?",
  },
  46: {
    text: "Is the property located in a fire district which requires payment?",
    tip:  "Some rural Oklahoma properties fall within a rural fire district that charges an annual fee for fire protection service. Is this property in one?",
  },
  47: {
    text: "Is the property located in a private utility district?",
    tip:  "Is water, sewer, garbage, or another utility service provided by a private district (not the city), which may charge membership fees?",
  },
  48: {
    text: "Are you aware of other defects affecting the property not disclosed above?",
    tip:  "Is there any other known problem, damage, or condition that hasn't already been covered by a previous question?",
  },
  49: {
    text: "Are you aware of any other fees, leases, liens, dues or financed fixtures?",
    tip:  "Are there any other financial obligations attached to the property — like a solar panel lease, a lien, dues to a road maintenance group, or a financed appliance?",
  },
  50: {
    text: "Are you aware of warranties covering the property, fixtures, or improvements?",
    tip:  "Are there any active warranties on the roof, HVAC, appliances, new construction, or any other part of the property that will transfer to the buyer?",
  },
};

function YesNoRow({ num }: { num: number }) {
  const {
    register,
    watch,
    formState: { errors, submitCount },
  } = useFormContext();

  const { text, tip } = QUESTIONS[num];
  const value    = watch(`questions.${num}`);
  const hasError = submitCount > 0 && !!(errors as any)?.questions?.[num];

  return (
    <div
      className={`rounded-xl border p-5 space-y-4 ${
        hasError ? "border-red-400 bg-red-50" : "border-gray-100"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-semibold text-gray-800">
          Q{num}. {text}
          <InfoTooltip text={tip} />
        </p>
        {hasError && (
          <span className="text-xs font-bold text-red-600 uppercase tracking-wide whitespace-nowrap shrink-0">
            Required before continuing
          </span>
        )}
      </div>
      <div className="flex gap-4">
        {["YES", "NO"].map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
            <input {...register(`questions.${num}`, { required: true })} type="radio" value={opt} className="accent-[#2463EB]" />
            {opt}
          </label>
        ))}
      </div>
      {value === "YES" && (
        <textarea {...register(`questionComments.${num}`)} rows={3} placeholder={`Add details for Q${num}… (optional)`} className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
      )}
    </div>
  );
}

function InlineError({ show, message = "Required" }: { show: boolean; message?: string }) {
  if (!show) return null;
  return <span className="text-xs font-bold text-red-600 uppercase tracking-wide whitespace-nowrap">{message}</span>;
}

export default function Step7QuestionsC() {
  const {
    register,
    watch,
    formState: { errors, submitCount },
  } = useFormContext();

  const showErrors = submitCount > 0;
  const q41        = watch("questions.41");
  const q46        = watch("questions.46");
  const q47        = watch("questions.47");
  const unpaidHoa  = watch("q41Inline.unpaid");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Questions</p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">Legal, HOA & District Questions</h2>
        <p className="text-sm text-gray-500 mt-1">
          All questions require a YES or NO answer. Tap <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#2463EB] border border-[#2463EB]/30 bg-blue-50 text-[10px] font-bold">i</span> for plain-English help.
        </p>
      </div>

      {[38, 39, 40].map((n) => <YesNoRow key={n} num={n} />)}

      {/* Q41 HOA */}
      <div className={`rounded-xl border p-5 space-y-4 ${showErrors && !!(errors as any)?.questions?.[41] ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800">
            Q41. {QUESTIONS[41].text}
            <InfoTooltip text={QUESTIONS[41].tip} />
          </p>
          <InlineError show={showErrors && !!(errors as any)?.questions?.[41]} message="Required before continuing" />
        </div>
        <div className="flex gap-4">
          {["YES", "NO"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
              <input {...register("questions.41", { required: true })} type="radio" value={opt} className="accent-[#2463EB]" />
              {opt}
            </label>
          ))}
        </div>
        {q41 === "YES" && (
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Amount of dues ($)</label>
                <input {...register("q41Inline.hoaAmount")} placeholder="e.g. 150" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Special assessment ($)</label>
                <input {...register("q41Inline.specialAssessmentAmount")} placeholder="e.g. 500" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
            </div>
            <div className={`rounded-lg border p-3 space-y-2 ${showErrors && !!(errors as any)?.q41Inline?.frequency ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Payable frequency</p>
                <InlineError show={showErrors && !!(errors as any)?.q41Inline?.frequency} />
              </div>
              <div className="flex flex-wrap gap-4">
                {["Monthly", "Quarterly", "Annually"].map((freq) => (
                  <label key={freq} className="flex items-center gap-2 text-sm text-gray-600">
                    <input {...register("q41Inline.frequency", { required: true })} type="radio" value={freq} className="accent-[#2463EB]" />
                    {freq}
                  </label>
                ))}
              </div>
            </div>
            <div className={`rounded-lg border p-3 space-y-2 ${showErrors && !!(errors as any)?.q41Inline?.unpaid ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Any unpaid HOA dues?</p>
                <InlineError show={showErrors && !!(errors as any)?.q41Inline?.unpaid} />
              </div>
              <div className="flex gap-4">
                {["YES", "NO"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                    <input {...register("q41Inline.unpaid", { required: true })} type="radio" value={opt} className="accent-[#2463EB]" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            {unpaidHoa === "YES" && (
              <div className={`rounded-lg border p-3 ${showErrors && !!(errors as any)?.q41Inline?.ifYesAmount ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-semibold text-gray-800">Unpaid dues amount ($)</label>
                  <InlineError show={showErrors && !!(errors as any)?.q41Inline?.ifYesAmount} />
                </div>
                <input {...register("q41Inline.ifYesAmount", { required: true })} placeholder="e.g. 300" className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Manager name</label>
                <input {...register("q41Inline.managerName")} placeholder="Manager name" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Phone number</label>
                <input {...register("q41Inline.managerPhone")} placeholder="Phone number" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {[42, 43, 44, 45].map((n) => <YesNoRow key={n} num={n} />)}

      {/* Q46 Fire district */}
      <div className={`rounded-xl border p-5 space-y-4 ${showErrors && !!(errors as any)?.questions?.[46] ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800">
            Q46. {QUESTIONS[46].text}
            <InfoTooltip text={QUESTIONS[46].tip} />
          </p>
          <InlineError show={showErrors && !!(errors as any)?.questions?.[46]} message="Required before continuing" />
        </div>
        <div className="flex gap-4">
          {["YES", "NO"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
              <input {...register("questions.46", { required: true })} type="radio" value={opt} className="accent-[#2463EB]" />
              {opt}
            </label>
          ))}
        </div>
        {q46 === "YES" && (
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Fee amount ($)</label>
                <input {...register("q46Inline.amount")} placeholder="e.g. 75" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Paid to whom</label>
                <input {...register("q46Inline.paidTo")} placeholder="e.g. Rural Fire District #4" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
            </div>
            <div className={`rounded-lg border p-3 space-y-2 ${showErrors && !!(errors as any)?.q46Inline?.frequency ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Payable frequency</p>
                <InlineError show={showErrors && !!(errors as any)?.q46Inline?.frequency} />
              </div>
              <div className="flex flex-wrap gap-4">
                {["Monthly", "Quarterly", "Annually"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
                    <input {...register("q46Inline.frequency", { required: true })} type="radio" value={opt} className="accent-[#2463EB]" />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Q47 Utility district */}
      <div className={`rounded-xl border p-5 space-y-4 ${showErrors && !!(errors as any)?.questions?.[47] ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-800">
            Q47. {QUESTIONS[47].text}
            <InfoTooltip text={QUESTIONS[47].tip} />
          </p>
          <InlineError show={showErrors && !!(errors as any)?.questions?.[47]} message="Required before continuing" />
        </div>
        <div className="flex gap-4">
          {["YES", "NO"].map((opt) => (
            <label key={opt} className="flex items-center gap-2 text-sm text-gray-600">
              <input {...register("questions.47", { required: true })} type="radio" value={opt} className="accent-[#2463EB]" />
              {opt}
            </label>
          ))}
        </div>
        {q47 === "YES" && (
          <div className="pt-3 border-t border-gray-100 space-y-4">
            <div className={`rounded-lg border p-3 space-y-2 ${showErrors && !!(errors as any)?.q47Details?.services ? "border-red-400 bg-red-50" : "border-gray-100"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Services provided</p>
                <InlineError show={showErrors && !!(errors as any)?.q47Details?.services} message="Select at least one" />
              </div>
              <div className="flex flex-wrap gap-4">
                {["Water", "Garbage", "Sewer", "Other"].map((service) => (
                  <label key={service} className="flex items-center gap-2 text-sm text-gray-600">
                    <input {...register("q47Details.services", { required: true })} type="checkbox" value={service} className="accent-[#2463EB]" />
                    {service}
                  </label>
                ))}
              </div>
            </div>
            <input {...register("q47Details.other")} placeholder="If Other selected, explain (optional)" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Initial membership fee ($)</label>
                <input {...register("q47Details.initialMembershipFee")} placeholder="e.g. 500" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Annual membership fee ($)</label>
                <input {...register("q47Details.annualMembershipFee")} placeholder="e.g. 120" className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {[48, 49, 50].map((n) => <YesNoRow key={n} num={n} />)}
    </div>
  );
}