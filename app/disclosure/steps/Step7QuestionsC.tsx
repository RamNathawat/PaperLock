"use client";

import { useFormContext } from "react-hook-form";

const SIMPLE_QUESTIONS = {
  38: "Are you aware of shared common features affecting the property?",
  39: "Other than utility easements, are you aware of easements or right-of-ways?",
  40: "Are you aware of encroachments affecting the property?",
  42: "Are you aware of zoning, building code or setback violations?",
  43: "Are you aware of notices from any government or agencies affecting the property?",
  44: "Are you aware of any surface leases (agricultural, commercial, oil & gas)?",
  45: "Are you aware of filed litigation or lawsuits affecting the property?",
  48: "Are you aware of other defects affecting the property not disclosed above?",
  49: "Are you aware of any other fees, leases, liens, dues or financed fixtures?",
  50: "Are you aware of warranties covering the property, fixtures, or improvements?",
};

function YesNoRow({
  num,
  text,
}: {
  num: number;
  text: string;
}) {
  const { register, watch } = useFormContext();
  const value = watch(`questions.${num}`);

  return (
    <div className="rounded-xl border border-gray-100 p-5 space-y-4">
      <p className="text-sm font-semibold text-gray-800">
        Q{num}. {text}
      </p>

      <div className="flex gap-4">
        {["YES", "NO"].map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-2 text-sm text-gray-600"
          >
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

export default function Step7QuestionsC() {
  const { register, watch } = useFormContext();

  const q41 = watch("questions.41");
  const q46 = watch("questions.46");
  const q47 = watch("questions.47");
  const unpaidHoa = watch("q41Inline.unpaid");

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Questions
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Legal, HOA & District Questions
        </h2>
      </div>

      {[38, 39, 40].map((num) => (
        <YesNoRow
          key={num}
          num={num}
          text={SIMPLE_QUESTIONS[num as keyof typeof SIMPLE_QUESTIONS]}
        />
      ))}

      {/* Q41 HOA */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Q41. Are you aware of a mandatory homeowner’s association?
        </p>

        <div className="flex gap-4">
          {["YES", "NO"].map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <input
                {...register("questions.41")}
                type="radio"
                value={opt}
                className="accent-[#2463EB]"
              />
              {opt}
            </label>
          ))}
        </div>

        {q41 === "YES" && (
          <div className="space-y-4">
            <input
              {...register("q41Inline.hoaAmount")}
              placeholder="Amount of dues ($)"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />

            <input
              {...register("q41Inline.specialAssessmentAmount")}
              placeholder="Special assessment ($)"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />

            <div className="flex flex-wrap gap-4">
              {["Monthly", "Quarterly", "Annually"].map((freq) => (
                <label
                  key={freq}
                  className="flex items-center gap-2 text-sm text-gray-600"
                >
                  <input
                    {...register("q41Inline.frequency")}
                    type="radio"
                    value={freq}
                    className="accent-[#2463EB]"
                  />
                  {freq}
                </label>
              ))}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Any unpaid HOA dues?
              </p>

              <div className="flex gap-4">
                {["YES", "NO"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <input
                      {...register("q41Inline.unpaid")}
                      type="radio"
                      value={opt}
                      className="accent-[#2463EB]"
                    />
                    {opt}
                  </label>
                ))}
              </div>
            </div>

            {unpaidHoa === "YES" && (
              <input
                {...register("q41Inline.ifYesAmount")}
                placeholder="Unpaid dues amount ($)"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
              />
            )}

            <input
              {...register("q41Inline.managerName")}
              placeholder="Manager name"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />

            <input
              {...register("q41Inline.managerPhone")}
              placeholder="Phone number"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
        )}
      </div>

      {[42, 43, 44, 45].map((num) => (
        <YesNoRow
          key={num}
          num={num}
          text={SIMPLE_QUESTIONS[num as keyof typeof SIMPLE_QUESTIONS]}
        />
      ))}

      {/* Q46 Fire district */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Q46. Is the property located in a fire district which requires payment?
        </p>

        <div className="flex gap-4">
          {["YES", "NO"].map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <input
                {...register("questions.46")}
                type="radio"
                value={opt}
                className="accent-[#2463EB]"
              />
              {opt}
            </label>
          ))}
        </div>

        {q46 === "YES" && (
          <div className="space-y-4">
            <input
              {...register("q46Inline.amount")}
              placeholder="Fee amount ($)"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />

            <input
              {...register("q46Inline.paidTo")}
              placeholder="Paid to whom"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />

            <div className="pt-2">
              <p className="text-sm font-semibold text-gray-800 mb-2">
                Payable frequency
              </p>
              <div className="flex flex-wrap gap-4">
                {["Monthly", "Quarterly", "Annually"].map((opt) => (
                  <label
                    key={opt}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <input
                      {...register("q46Inline.frequency")}
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

      {/* Q47 Utility district */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-4">
        <p className="text-sm font-semibold text-gray-800">
          Q47. Is the property located in a private utility district?
        </p>

        <div className="flex gap-4">
          {["YES", "NO"].map((opt) => (
            <label
              key={opt}
              className="flex items-center gap-2 text-sm text-gray-600"
            >
              <input
                {...register("questions.47")}
                type="radio"
                value={opt}
                className="accent-[#2463EB]"
              />
              {opt}
            </label>
          ))}
        </div>

        {q47 === "YES" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              {["Water", "Garbage", "Sewer", "Other"].map(
                (service) => (
                  <label
                    key={service}
                    className="flex items-center gap-2 text-sm text-gray-600"
                  >
                    <input
                      {...register("q47Details.services")}
                      type="checkbox"
                      value={service}
                      className="accent-[#2463EB]"
                    />
                    {service}
                  </label>
                )
              )}
            </div>

            <input
              {...register("q47Details.other")}
              placeholder="If other, explain"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />

            <input
              {...register("q47Details.initialMembershipFee")}
              placeholder="Initial membership fee ($)"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />

            <input
              {...register("q47Details.annualMembershipFee")}
              placeholder="Annual membership fee ($)"
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400"
            />
          </div>
        )}
      </div>

      {[48, 49, 50].map((num) => (
        <YesNoRow
          key={num}
          num={num}
          text={SIMPLE_QUESTIONS[num as keyof typeof SIMPLE_QUESTIONS]}
        />
      ))}
    </div>
  );
}