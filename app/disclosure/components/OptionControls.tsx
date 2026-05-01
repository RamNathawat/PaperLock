/**
 * Shared styled radio/checkbox primitives used across all disclosure form steps.
 *
 * Three components:
 *   <OptionCards>  — full pill-card options (2 or 4, wraps to grid)
 *   <YesNoCards>   — convenience wrapper for binary YES / NO questions
 *   <ChipGroup>    — compact inline chips for type selectors & multi-option lists
 */

"use client";

import { useFormContext } from "react-hook-form";
import { useContext } from "react";
import { ReadOnlyContext } from "../page";

// ─── OptionCards ─────────────────────────────────────────────────────────────
// Use for: 4-option appliance/system rows (Working / Not Working / Unknown / None)
//          or any group with 3–8 options that need clear visual distinction.
export function OptionCards({
  name,
  options,
  required = true,
  cols = 2,
}: {
  name: string;
  options: { label: string; value: string }[];
  required?: boolean;
  /** How many columns on sm+ screens. Default 2. */
  cols?: 2 | 3 | 4;
}) {
  const { register, watch } = useFormContext();
  const isReadOnly = useContext(ReadOnlyContext);
  const current = watch(name);
  const colClass = cols === 4 ? "sm:grid-cols-4" : cols === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className={`grid grid-cols-1 ${colClass} gap-2`}>
      {options.map((opt) => {
        const isSelected = String(current) === String(opt.value);
        return (
          <label
            key={opt.value}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all select-none
              ${isReadOnly ? "pointer-events-none cursor-default" : "cursor-pointer hover:border-gray-300 hover:bg-gray-50"}
              ${isSelected
                ? "bg-blue-50 border-blue-500 text-blue-700 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                : "bg-white border-gray-200 text-gray-600"
              }`}
          >
            {/* Custom radio dot */}
            <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
              ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"}`}>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <input
              {...register(name, (required && !isReadOnly) ? { required: true } : {})}
              type="radio"
              value={opt.value}
              className="sr-only"
            />
            <span className="text-sm font-medium leading-tight">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

// ─── YesNoCards ──────────────────────────────────────────────────────────────
// Use for: all YES / NO questions. Side-by-side on all screen sizes.
// Both options use the same blue selection state — no semantic color coding.
export function YesNoCards({ name, required = true }: { name: string; required?: boolean }) {
  const { register, watch } = useFormContext();
  const isReadOnly = useContext(ReadOnlyContext);
  const current = watch(name);

  return (
    <div className="flex gap-3">
      {(["YES", "NO"] as const).map((opt) => {
        const isSelected = current === opt;
        return (
          <label
            key={opt}
            className={`flex-1 flex items-center justify-center gap-2.5 py-3 rounded-2xl border transition-all select-none font-semibold text-sm
              ${isReadOnly ? "pointer-events-none cursor-default" : "cursor-pointer hover:border-gray-300 hover:bg-gray-50"}
              ${isSelected
                ? "bg-blue-50 border-blue-500 text-blue-700 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                : "bg-white border-gray-200 text-gray-500"
              }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
              ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"}`}>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <input
              {...register(name, (required && !isReadOnly) ? { required: true } : {})}
              type="radio"
              value={opt}
              className="sr-only"
            />
            {opt === "YES" ? "Yes" : "No"}
          </label>
        );
      })}
    </div>
  );
}

// ─── YesNoUnknownCards ────────────────────────────────────────────────────────
// Use for: Yes / No / Unknown (3-option questions, e.g. flood zone)
export function YesNoUnknownCards({
  name,
  required = true,
  options = ["Yes", "No", "Unknown"],
}: {
  name: string;
  required?: boolean;
  options?: string[];
}) {
  const { register, watch } = useFormContext();
  const isReadOnly = useContext(ReadOnlyContext);
  const current = watch(name);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((label, i) => {
        const isSelected = String(current) === String(i);
        return (
          <label
            key={label}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border transition-all select-none text-sm font-medium
              ${isReadOnly ? "pointer-events-none cursor-default" : "cursor-pointer hover:border-gray-300 hover:bg-gray-50"}
              ${isSelected
                ? "bg-blue-50 border-blue-500 text-blue-700 shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                : "bg-white border-gray-200 text-gray-500"
              }`}
          >
            <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors
              ${isSelected ? "border-blue-600 bg-blue-600" : "border-gray-300 bg-white"}`}>
              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
            </span>
            <input
              {...register(name, (required && !isReadOnly) ? { required: true } : {})}
              type="radio"
              value={i}
              className="sr-only"
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}

// ─── ChipGroup ────────────────────────────────────────────────────────────────
// Use for: type selectors with many options (Electric / Gas / Tankless…)
//          or zoning classification (10 options). Chips wrap naturally.
export function ChipGroup({
  name,
  options,
  required = true,
  type = "radio",
}: {
  name: string;
  options: string[];
  required?: boolean;
  type?: "radio" | "checkbox";
}) {
  const { register, watch } = useFormContext();
  const isReadOnly = useContext(ReadOnlyContext);
  const current = watch(name);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((label, i) => {
        const val = String(i);
        const isSelected = type === "checkbox"
          ? Array.isArray(current) && current.includes(val)
          : String(current) === val;

        return (
          <label
            key={label}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all select-none text-sm font-medium
              ${isReadOnly ? "pointer-events-none cursor-default" : "cursor-pointer hover:border-blue-300 hover:bg-blue-50"}
              ${isSelected
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-600"
              }`}
          >
            <input
              {...register(name, (required && !isReadOnly) ? { required: true } : {})}
              type={type}
              value={val}
              className="sr-only"
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}

// ─── ValueChipGroup ───────────────────────────────────────────────────────────
// Same as ChipGroup but uses explicit { label, value } pairs (for zoning etc.)
export function ValueChipGroup({
  name,
  options,
  required = true,
}: {
  name: string;
  options: { label: string; value: string }[];
  required?: boolean;
}) {
  const { register, watch } = useFormContext();
  const isReadOnly = useContext(ReadOnlyContext);
  const current = watch(name);

  return (
    <div className="flex flex-wrap gap-2">
      {options.map(({ label, value }) => {
        const isSelected = current === value;
        return (
          <label
            key={value}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all select-none text-sm font-medium
              ${isReadOnly ? "pointer-events-none cursor-default" : "cursor-pointer hover:border-blue-300 hover:bg-blue-50"}
              ${isSelected
                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                : "bg-white border-gray-200 text-gray-600"
              }`}
          >
            <input
              {...register(name, (required && !isReadOnly) ? { required: true } : {})}
              type="radio"
              value={value}
              className="sr-only"
            />
            {label}
          </label>
        );
      })}
    </div>
  );
}
