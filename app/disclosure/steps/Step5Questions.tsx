"use client";

import { useFormContext } from "react-hook-form";

const ALL_QUESTIONS: Record<number, string> = {
  7: `Are you aware of the property being damaged or affected by flood, storm run-off, sewer backup, draining or grading defects?`,
  8: `Are you aware of any surface or ground water drainage systems which assist in draining the property, e.g. "French Drains?"`,
  9: `Are you aware of any occurrence of water in the heating and air conditioning duct system?`,
  10: `Are you aware of water seepage, leakage or other draining defects in any of the improvements on the property?`,
  11: `Are you aware of any additions being made without required permits?`,
  12: `Are you aware of any previous foundation repairs?`,
  13: `Are you aware of any alterations or repairs having been made to correct defects?`,
  14: `Are you aware of any defect or condition affecting the interior or exterior walls, ceilings, roof structure, slab/foundation, basement/storm cellar, floors, windows, doors, fences or garage?`,
  15: `Are you aware of the roof covering ever being repaired or replaced during your ownership of the property?`,
  17: `Do you know of any current defects with the roof covering?`,
  18: `Are you aware of treatment for termite or wood-destroying organism infestation?`,
  20: `Are you aware of any damage caused by termites or wood-destroying organisms?`,
  21: `Are you aware of major fire, tornado, hail, earthquake or wind damage?`,
  22: `Have you ever received payment on an insurance claim for damages to residential property and/or any improvements which were not repaired?`,
  23: `Are you aware of defects pertaining to sewer, septic, lateral lines or aerobic system?`,
  24: `Are you aware of the presence of asbestos?`,
  25: `Are you aware of the presence of radon gas?`,
  26: `Have you tested for radon gas?`,
  27: `Are you aware of the presence of lead-based paint?`,
  28: `Have you tested for lead-based paint?`,
  29: `Are you aware of any underground storage tanks on the property?`,
  30: `Are you aware of the presence of a landfill on the property?`,
  31: `Are you aware of the existence of hazardous or regulated materials and other conditions having an environmental impact?`,
  32: `Are you aware of the existence of prior manufacturing of methamphetamine?`,
  33: `Have you had the property inspected for mold?`,
  34: `Are you aware of any remedial treatment for mold on the property?`,
  35: `Are you aware of any condition on the property that would impair the health or safety of the occupants?`,
  36: `Are you aware of any wells located on the property?`,
  38: `Are you aware of features of the property shared in common with the adjoining landowners, such as fences, driveways, and roads whose use or responsibility has an effect on the property?`,
  39: `Other than utility easements serving the property, are you aware of any easements or right-of-ways affecting the property?`,
  40: `Are you aware of encroachments affecting the property?`,
  42: `Are you aware of any zoning, building code or setback requirement violations?`,
  43: `Are you aware of any notices from any government or government-sponsored agencies or any other entities affecting the property?`,
  44: `Are you aware of any surface leases, including but not limited to agricultural, commercial or oil and gas?`,
  45: `Are you aware of any filed litigation or lawsuits directly or indirectly affecting the property, including a foreclosure?`,
  48: `Are you aware of other defect(s) affecting the property not disclosed above?`,
  49: `Are you aware of any other fees, leases, liens, dues or financed fixtures or improvements required on the property that you have not disclosed?`,
  50: `Are you aware of any warranties covering the property, its fixtures, or improvements (foundation, roof shingles, etc.)?`,
};

function YesNoRow({
  num,
  text,
  register,
}: {
  num: number;
  text: string;
  register: any;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <p className="text-sm text-gray-700 flex-1">
          <span className="font-medium text-gray-900">Q{num}.</span> {text}
        </p>
        <div className="flex gap-4 shrink-0">
          {["YES", "NO"].map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm text-black">
              <input
                {...register(`questions.${num}`)}
                type="radio"
                value={opt}
                className="accent-blue-600"
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">
      {label}
    </p>
  );
}

export default function Step5Questions() {
  const { register, watch } = useFormContext();
  const questions = watch("questions") || {};

  const inputClass =
    "mt-1 block border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Disclosure Questions</h2>
        <p className="text-sm text-gray-500 mt-1">
          Answer all questions to the best of your knowledge.
        </p>
      </div>

      {/* ── Flood and Water ── */}
      <SectionLabel label="Flood and Water" />
      {[7, 8, 9, 10].map((n) => (
        <YesNoRow key={n} num={n} text={ALL_QUESTIONS[n]} register={register} />
      ))}

      {/* ── Additions / Alterations / Repairs ── */}
      <SectionLabel label="Additions / Alterations / Repairs" />
      {[11, 12, 13, 14, 15].map((n) => (
        <YesNoRow key={n} num={n} text={ALL_QUESTIONS[n]} register={register} />
      ))}

      {/* Q16 — text fields only, no YES/NO */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <p className="text-sm font-medium text-gray-900 mb-3">
          Q16. Approximate age of roof covering / number of layers
        </p>
        <div className="flex gap-4">
          <div>
            <label className="text-xs text-gray-500">Roof Age</label>
            <input
              {...register("page3TextFields.roofAge")}
              type="text"
              placeholder="e.g. 12 years"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">Number of Layers</label>
            <input
              {...register("page3TextFields.roofLayers")}
              type="text"
              placeholder="e.g. 2"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {[17, 18].map((n) => (
        <YesNoRow key={n} num={n} text={ALL_QUESTIONS[n]} register={register} />
      ))}

      {/* Q19 — termite bait with inline cost */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-700 flex-1">
            <span className="font-medium text-gray-900">Q19.</span> Are you aware
            of a termite bait system installed on the property?
          </p>
          <div className="flex gap-4 shrink-0">
            {["YES", "NO"].map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 text-sm text-black">
                <input
                  {...register("questions.19")}
                  type="radio"
                  value={opt}
                  className="accent-blue-600"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
        {questions["19"] === "YES" && (
          <div className="mt-3">
            <label className="text-xs text-gray-500">Annual Cost ($)</label>
            <input
              {...register("page3TextFields.termiteBaitAnnualCost")}
              type="text"
              placeholder="150"
              className={inputClass}
            />
          </div>
        )}
      </div>

      {[20, 21, 22, 23].map((n) => (
        <YesNoRow key={n} num={n} text={ALL_QUESTIONS[n]} register={register} />
      ))}

      {/* ── Environmental ── */}
      <SectionLabel label="Environmental" />
      {[24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36].map((n) => (
        <YesNoRow key={n} num={n} text={ALL_QUESTIONS[n]} register={register} />
      ))}

      {/* Q37 — dams with inline dam maintenance */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-700 flex-1">
            <span className="font-medium text-gray-900">Q37.</span> Are you aware
            of any dams located on the property?
          </p>
          <div className="flex gap-4 shrink-0">
            {["YES", "NO"].map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 text-sm text-black">
                <input
                  {...register("questions.37")}
                  type="radio"
                  value={opt}
                  className="accent-blue-600"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
        {questions["37"] === "YES" && (
          <div className="mt-3">
            <label className="text-xs text-gray-500 block mb-1">
              Are you responsible for the maintenance of that dam?
            </label>
            <div className="flex gap-4">
              {["YES", "NO"].map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 text-sm text-black">
                  <input
                    {...register("q37DamMaintenance")}
                    type="radio"
                    value={opt}
                    className="accent-blue-600"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Property Shared in Common, Easements & Legal ── */}
      <SectionLabel label="Property Shared in Common, Easements & Legal" />
      {[38, 39, 40].map((n) => (
        <YesNoRow key={n} num={n} text={ALL_QUESTIONS[n]} register={register} />
      ))}

      {/* Q41 — mandatory HOA with all inline fields */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-700 flex-1">
            <span className="font-medium text-gray-900">Q41.</span> Are you aware
            of a mandatory homeowner's association?
          </p>
          <div className="flex gap-4 shrink-0">
            {["YES", "NO"].map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 text-sm text-black">
                <input
                  {...register("questions.41")}
                  type="radio"
                  value={opt}
                  className="accent-blue-600"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
        {questions["41"] === "YES" && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-xs text-gray-500">Amount of Dues ($)</label>
                <input
                  {...register("q41Inline.hoaAmount")}
                  type="text"
                  placeholder="350"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Special Assessment ($)</label>
                <input
                  {...register("q41Inline.specialAssessmentAmount")}
                  type="text"
                  placeholder="1200"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Payable</label>
              <div className="flex gap-4">
                {["Monthly", "Quarterly", "Annually"].map((opt, i) => (
                  <label key={i} className="flex items-center gap-1.5 text-sm text-black">
                    <input
                      {...register("q41Inline.payableType")}
                      type="radio"
                      value={i}
                      className="accent-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Are there unpaid dues or assessments?
              </label>
              <div className="flex gap-4">
                {["YES", "NO"].map((opt) => (
                  <label key={opt} className="flex items-center gap-1.5 text-sm text-black">
                    <input
                      {...register("q41Inline.unpaid")}
                      type="radio"
                      value={opt}
                      className="accent-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            {watch("q41Inline.unpaid") === "YES" && (
              <div className="flex gap-4 flex-wrap">
                <div>
                  <label className="text-xs text-gray-500">Unpaid Amount ($)</label>
                  <input
                    {...register("q41Inline.ifYesAmount")}
                    type="text"
                    placeholder="500"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Manager Name</label>
                  <input
                    {...register("q41Inline.managerName")}
                    type="text"
                    placeholder="John Doe"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500">Phone</label>
                  <input
                    {...register("q41Inline.phone")}
                    type="text"
                    placeholder="555-0199"
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {[42, 43, 44, 45].map((n) => (
        <YesNoRow key={n} num={n} text={ALL_QUESTIONS[n]} register={register} />
      ))}

      {/* Q46 — fire district */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-700 flex-1">
            <span className="font-medium text-gray-900">Q46.</span> Is the
            property located in a fire district which requires payment?
          </p>
          <div className="flex gap-4 shrink-0">
            {["YES", "NO"].map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 text-sm text-black">
                <input
                  {...register("questions.46")}
                  type="radio"
                  value={opt}
                  className="accent-blue-600"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
        {questions["46"] === "YES" && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-xs text-gray-500">Amount of Fee ($)</label>
                <input
                  {...register("q46Inline.amount")}
                  type="text"
                  placeholder="300"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Paid To</label>
                <input
                  {...register("q46Inline.paidTo")}
                  type="text"
                  placeholder="City Fire Dept"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 block mb-1">Payable</label>
              <div className="flex gap-4">
                {["Monthly", "Quarterly", "Annually"].map((opt, i) => (
                  <label key={i} className="flex items-center gap-1.5 text-sm text-black">
                    <input
                      {...register("q46Inline.payableType")}
                      type="radio"
                      value={i}
                      className="accent-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Q47 — private utility district */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-gray-700 flex-1">
            <span className="font-medium text-gray-900">Q47.</span> Is the
            property located in a private utility district?
          </p>
          <div className="flex gap-4 shrink-0">
            {["YES", "NO"].map((opt) => (
              <label key={opt} className="flex items-center gap-1.5 text-sm text-black">
                <input
                  {...register("questions.47")}
                  type="radio"
                  value={opt}
                  className="accent-blue-600"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
        {questions["47"] === "YES" && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-gray-500 block mb-1">
                Check applicable utilities
              </label>
              <div className="flex flex-wrap gap-3">
                {["Water", "Garbage", "Sewer", "Other"].map((opt, i) => (
                  <label key={i} className="flex items-center gap-1.5 text-sm text-black">
                    <input
                      {...register("q47Details.utilities")}
                      type="checkbox"
                      value={i}
                      className="accent-blue-600"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-4 flex-wrap">
              <div>
                <label className="text-xs text-gray-500">If other, explain</label>
                <input
                  {...register("q47Details.otherExplain")}
                  type="text"
                  placeholder="Co-op"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Initial Membership ($)</label>
                <input
                  {...register("q47Details.initialMembership")}
                  type="text"
                  placeholder="1000"
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Annual Membership ($)</label>
                <input
                  {...register("q47Details.annualMembership")}
                  type="text"
                  placeholder="350"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Miscellaneous ── */}
      <SectionLabel label="Miscellaneous" />
      {[48, 49, 50].map((n) => (
        <YesNoRow key={n} num={n} text={ALL_QUESTIONS[n]} register={register} />
      ))}

      {/* General explanation box */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          If you answered YES to any items on pages 2–4, list item number(s) and explain:
        </label>
        <textarea
          {...register("explanation")}
          rows={4}
          placeholder="e.g. Q12: Foundation was repaired in 2018 by licensed contractor..."
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}