"use client";

import { useContext } from "react";
import { useFormContext, useFormState } from "react-hook-form";
import InfoTooltip from "@/app/disclosure/components/InfoTooltip";
import { YesNoCards, ChipGroup } from "@/app/disclosure/components/OptionControls";
import { ReadOnlyContext } from "../page";

const QUESTIONS: Record<number, { text: string; tip: string }> = {
  38: { text: "Are you aware of shared common features affecting the property?", tip: "Are there shared driveways, walls, fences, wells, or other features that are jointly owned or maintained with a neighbor?" },
  39: { text: "Other than utility easements, are you aware of easements or right-of-ways?", tip: "Does anyone else have a legal right to use part of the property — e.g. a neighbor's access path, a pipeline easement, or a conservation restriction?" },
  40: { text: "Are you aware of encroachments affecting the property?", tip: "Does a fence, building, or structure from this property or a neighboring property cross over a property line?" },
  41: { text: "Are you aware of a mandatory homeowner's association?", tip: "Is the property part of an HOA that all owners are required to join and pay dues to? Include the amount and how often dues are paid." },
  42: { text: "Are you aware of zoning, building code or setback violations?", tip: "Is there anything on the property that violates local zoning rules — like a shed too close to the lot line, an unpermitted structure, or non-conforming use?" },
  43: { text: "Are you aware of notices from any government or agencies affecting the property?", tip: "Have you received any official notices, citations, orders, or letters from a city, county, state, or federal agency about the property?" },
  44: { text: "Are you aware of any surface leases (agricultural, commercial, oil & gas)?", tip: "Is any part of the property subject to a lease for farming, grazing, mineral extraction, oil & gas, or any commercial activity?" },
  45: { text: "Are you aware of filed litigation or lawsuits affecting the property?", tip: "Is there any pending or recent lawsuit, legal dispute, or court action that involves the property or its ownership?" },
  46: { text: "Is the property located in a fire district which requires payment?", tip: "Some rural Oklahoma properties fall within a rural fire district that charges an annual fee for fire protection service. Is this property in one?" },
  47: { text: "Is the property located in a private utility district?", tip: "Is water, sewer, garbage, or another utility service provided by a private district (not the city), which may charge membership fees?" },
  48: { text: "Are you aware of other defects affecting the property not disclosed above?", tip: "Is there any other known problem, damage, or condition that hasn't already been covered by a previous question?" },
  49: { text: "Are you aware of any other fees, leases, liens, dues or financed fixtures?", tip: "Are there any other financial obligations attached to the property — like a solar panel lease, a lien, dues to a road maintenance group, or a financed appliance?" },
  50: { text: "Are you aware of warranties covering the property, fixtures, or improvements?", tip: "Are there any active warranties on the roof, HVAC, appliances, new construction, or any other part of the property that will transfer to the buyer?" },
};

const inputCls = "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all";

function ErrDot({ show, msg = "Required" }: { show: boolean; msg?: string }) {
  if (!show) return null;
  return (
    <div className="flex items-center gap-1.5 mt-1.5">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
      <p className="text-xs font-semibold text-amber-700 whitespace-nowrap">{msg}</p>
    </div>
  );
}

function ErrChip({ show, msg = "Required" }: { show: boolean; msg?: string }) {
  if (!show) return null;
  return <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full uppercase tracking-wide whitespace-nowrap">{msg}</span>;
}

function ReadOnlyText({ name }: { name: string }) {
  const { watch } = useFormContext();
  const text = watch(name);
  if (!text) return null;
  return (
    <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">
      {text}
    </p>
  );
}

function YesNoRow({ num }: { num: number }) {
  const { register, watch, control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const isReadOnly = useContext(ReadOnlyContext);
  const { text, tip } = QUESTIONS[num];
  const value    = watch(`questions.${num}`);
  const hasError = submitCount > 0 && !!(errors as any)?.questions?.[num];

  return (
    <div className={`relative rounded-2xl border p-5 space-y-4 ${hasError ? "border-amber-200 bg-amber-50/40" : "border-gray-100 bg-gray-50/30"}`}>
      <div className="absolute top-5 right-5"><InfoTooltip text={tip} /></div>
      <div>
        <p className="text-sm font-semibold text-gray-800 pr-8">Q{num}. {text}</p>
        <ErrDot show={hasError} msg="Required before continuing" />
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
      {value === "YES" && isReadOnly && <ReadOnlyText name={`questionComments.${num}`} />}
    </div>
  );
}

export default function Step7QuestionsC() {
  const isReadOnly = useContext(ReadOnlyContext);
  const { register, watch, control } = useFormContext();
  const { errors, submitCount } = useFormState({ control });
  const showErrors  = submitCount > 0;
  const q41         = watch("questions.41");
  const q46         = watch("questions.46");
  const q47         = watch("questions.47");
  const unpaidHoa   = watch("q41Inline.unpaid");

  return (
    <fieldset disabled={isReadOnly} className={isReadOnly ? "pointer-events-none opacity-70 border-none p-0 m-0 min-w-0" : "border-none p-0 m-0 min-w-0"}>
      <div className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">Questions</p>
          <h2 className="text-xl font-bold text-gray-900 mt-1">Legal, HOA &amp; District Questions</h2>
          <p className="text-sm text-gray-500 mt-1">
            All questions require a YES or NO answer. Tap <span className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#2463EB] border border-[#2463EB]/30 bg-blue-50 text-[10px] font-bold">i</span> for plain-English help.
          </p>
        </div>

        {[38, 39, 40].map((n) => <YesNoRow key={n} num={n} />)}

        {/* Q41 HOA */}
        <div className={`relative rounded-2xl border p-5 space-y-4 ${showErrors && !!(errors as any)?.questions?.[41] ? "border-amber-200 bg-amber-50/40" : "border-gray-100 bg-gray-50/30"}`}>
          <div className="absolute top-5 right-5"><InfoTooltip text={QUESTIONS[41].tip} /></div>
          <div>
            <p className="text-sm font-semibold text-gray-800 pr-8">Q41. {QUESTIONS[41].text}</p>
            <ErrDot show={showErrors && !!(errors as any)?.questions?.[41]} msg="Required before continuing" />
          </div>
          <YesNoCards name="questions.41" />
          {q41 === "YES" && (
            <div className="pt-3 border-t border-gray-100 space-y-4">
              {!isReadOnly ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Amount of dues ($)</label>
                    <input {...register("q41Inline.hoaAmount")} placeholder="e.g. 150" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Special assessment ($)</label>
                    <input {...register("q41Inline.specialAssessmentAmount")} placeholder="e.g. 500" className={inputCls} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReadOnlyField label="Amount of dues ($)" name="q41Inline.hoaAmount" />
                  <ReadOnlyField label="Special assessment ($)" name="q41Inline.specialAssessmentAmount" />
                </div>
              )}

              <div className={`rounded-xl border p-4 space-y-3 ${showErrors && !!(errors as any)?.q41Inline?.frequency ? "border-amber-200 bg-amber-50/40" : "border-gray-100"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Payable frequency</p>
                  <ErrChip show={showErrors && !!(errors as any)?.q41Inline?.frequency} />
                </div>
                <ChipGroup name="q41Inline.frequency" options={["Monthly", "Quarterly", "Annually"]} required type="radio" />
              </div>

              <div className={`rounded-xl border p-4 space-y-3 ${showErrors && !!(errors as any)?.q41Inline?.unpaid ? "border-amber-200 bg-amber-50/40" : "border-gray-100"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Any unpaid HOA dues?</p>
                  <ErrChip show={showErrors && !!(errors as any)?.q41Inline?.unpaid} />
                </div>
                <YesNoCards name="q41Inline.unpaid" />
              </div>

              {unpaidHoa === "YES" && (
                <div className={`rounded-xl border p-4 ${showErrors && !!(errors as any)?.q41Inline?.ifYesAmount ? "border-amber-200 bg-amber-50/40" : "border-gray-100"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">Unpaid dues amount ($)</label>
                    <ErrChip show={showErrors && !!(errors as any)?.q41Inline?.ifYesAmount} />
                  </div>
                  {!isReadOnly ? (
                    <input {...register("q41Inline.ifYesAmount", { required: true })} placeholder="e.g. 300"
                      className={showErrors && !!(errors as any)?.q41Inline?.ifYesAmount
                        ? "w-full rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                        : inputCls} />
                  ) : (
                    <ReadOnlyText name="q41Inline.ifYesAmount" />
                  )}
                </div>
              )}

              {!isReadOnly ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Manager name</label>
                    <input {...register("q41Inline.managerName")} placeholder="Manager name" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Phone number</label>
                    <input {...register("q41Inline.managerPhone")} placeholder="Phone number" className={inputCls} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReadOnlyField label="Manager name" name="q41Inline.managerName" />
                  <ReadOnlyField label="Phone number" name="q41Inline.managerPhone" />
                </div>
              )}
            </div>
          )}
        </div>

        {[42, 43, 44, 45].map((n) => <YesNoRow key={n} num={n} />)}

        {/* Q46 Fire district */}
        <div className={`relative rounded-2xl border p-5 space-y-4 ${showErrors && !!(errors as any)?.questions?.[46] ? "border-amber-200 bg-amber-50/40" : "border-gray-100 bg-gray-50/30"}`}>
          <div className="absolute top-5 right-5"><InfoTooltip text={QUESTIONS[46].tip} /></div>
          <div>
            <p className="text-sm font-semibold text-gray-800 pr-8">Q46. {QUESTIONS[46].text}</p>
            <ErrDot show={showErrors && !!(errors as any)?.questions?.[46]} msg="Required before continuing" />
          </div>
          <YesNoCards name="questions.46" />
          {q46 === "YES" && (
            <div className="pt-3 border-t border-gray-100 space-y-4">
              {!isReadOnly ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Fee amount ($)</label>
                    <input {...register("q46Inline.amount")} placeholder="e.g. 75" className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Paid to whom</label>
                    <input {...register("q46Inline.paidTo")} placeholder="e.g. Rural Fire District #4" className={inputCls} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <ReadOnlyField label="Fee amount ($)" name="q46Inline.amount" />
                  <ReadOnlyField label="Paid to whom" name="q46Inline.paidTo" />
                </div>
              )}
              <div className={`rounded-xl border p-4 space-y-3 ${showErrors && !!(errors as any)?.q46Inline?.frequency ? "border-amber-200 bg-amber-50/40" : "border-gray-100"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Payable frequency</p>
                  <ErrChip show={showErrors && !!(errors as any)?.q46Inline?.frequency} />
                </div>
                <ChipGroup name="q46Inline.frequency" options={["Monthly", "Quarterly", "Annually"]} required type="radio" />
              </div>
            </div>
          )}
        </div>

        {/* Q47 Utility district */}
        <div className={`relative rounded-2xl border p-5 space-y-4 ${showErrors && !!(errors as any)?.questions?.[47] ? "border-amber-200 bg-amber-50/40" : "border-gray-100 bg-gray-50/30"}`}>
          <div className="absolute top-5 right-5"><InfoTooltip text={QUESTIONS[47].tip} /></div>
          <div>
            <p className="text-sm font-semibold text-gray-800 pr-8">Q47. {QUESTIONS[47].text}</p>
            <ErrDot show={showErrors && !!(errors as any)?.questions?.[47]} msg="Required before continuing" />
          </div>
          <YesNoCards name="questions.47" />
          {q47 === "YES" && (
            <div className="pt-3 border-t border-gray-100 space-y-4">
              <div className={`rounded-xl border p-4 space-y-3 ${showErrors && !!(errors as any)?.q47Details?.services ? "border-amber-200 bg-amber-50/40" : "border-gray-100"}`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-700">Services provided</p>
                  <ErrChip show={showErrors && !!(errors as any)?.q47Details?.services} msg="Select at least one" />
                </div>
                <ChipGroup name="q47Details.services" options={["Water", "Garbage", "Sewer", "Other"]} required type="checkbox" />
              </div>
              {!isReadOnly ? (
                <>
                  <input {...register("q47Details.other")} placeholder="If Other selected, explain (optional)" className={inputCls} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Initial membership fee ($)</label>
                      <input {...register("q47Details.initialMembershipFee")} placeholder="e.g. 500" className={inputCls} />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1.5">Annual membership fee ($)</label>
                      <input {...register("q47Details.annualMembershipFee")} placeholder="e.g. 120" className={inputCls} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <ReadOnlyText name="q47Details.other" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <ReadOnlyField label="Initial membership fee ($)" name="q47Details.initialMembershipFee" />
                    <ReadOnlyField label="Annual membership fee ($)" name="q47Details.annualMembershipFee" />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {[48, 49, 50].map((n) => <YesNoRow key={n} num={n} />)}
      </div>
    </fieldset>
  );
}

// ─── Shared read-only display helpers ─────────────────────────────────────────
function ReadOnlyField({ label, name }: { label: string; name: string }) {
  const { watch } = useFormContext();
  const value = watch(name);
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 min-h-[36px]">
        {value || <span className="text-gray-300 italic">—</span>}
      </p>
    </div>
  );
}