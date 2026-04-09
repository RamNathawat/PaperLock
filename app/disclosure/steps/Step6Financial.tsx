"use client";

import { useFormContext } from "react-hook-form";

// The built-in explanation box on Page 4 fits roughly 800 chars.
// Beyond that, the PDF engine automatically appends continuation pages.
// There is no upper limit — write as much as needed.
const CHARS_PER_BUILT_IN_BOX = 800;
const CHARS_PER_CONT_PAGE    = 4400;

export default function Step6Financial() {
  const { register, watch } = useFormContext();

  const explanation = (watch("explanation") as string) || "";
  const charCount   = explanation.length;

  const overflowChars = Math.max(0, charCount - CHARS_PER_BUILT_IN_BOX);
  const contPages     = overflowChars > 0
    ? Math.ceil(overflowChars / CHARS_PER_CONT_PAGE)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Additional Notes
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">
          Additional Explanations
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Use this space to add context for any YES answers, or anything else the buyer should know.
          Write as much as you need — the PDF will automatically add pages if required.
        </p>
      </div>

      {/* Textarea — no max length, no limit */}
      <div className="space-y-1.5">
        <textarea
          {...register("explanation")}
          rows={10}
          placeholder="Add any additional details or explanations here… (optional)"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2463EB] resize-y"
        />
        <div className="flex justify-end">
          <span className="text-[11px] text-gray-400">{charCount.toLocaleString()} chars</span>
        </div>
      </div>

      {/* Page estimate card — only shown when there's content */}
      {charCount > 0 && (
        <div className={`rounded-xl border p-5 space-y-2 transition-colors ${
          contPages > 0 ? "border-blue-100 bg-blue-50" : "border-gray-100 bg-gray-50"
        }`}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-gray-700">
              Additional pages that will be appended
            </p>
            <span className={`text-2xl font-bold ${contPages > 0 ? "text-[#2463EB]" : "text-gray-900"}`}>
              {contPages}
            </span>
          </div>

          <p className="text-xs text-gray-500">
            {contPages === 0
              ? "Your notes fit within the built-in form. No extra pages needed."
              : `Your notes are ${overflowChars.toLocaleString()} chars beyond the built-in box. ${contPages} continuation ${contPages === 1 ? "page" : "pages"} will be appended automatically.`
            }
          </p>
        </div>
      )}

      <p className="text-xs text-gray-400">
        Text is automatically word-wrapped and paginated — it will never be cut off.
      </p>
    </div>
  );
}