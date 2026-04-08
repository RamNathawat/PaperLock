"use client";

import { useFormContext } from "react-hook-form";

export default function Step1Property() {
  const {
    register,
    formState: { errors, submitCount },
  } = useFormContext();

  const showErrors = submitCount > 0;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#2463EB]">
          Property
        </p>
        <h2 className="text-xl font-bold text-gray-900 mt-1">Property Information</h2>
      </div>

      {/* Property Address */}
      <div
        className={`rounded-xl border p-5 space-y-3 ${
          showErrors && errors.propertyIdentifier
            ? "border-red-400 bg-red-50"
            : "border-gray-100"
        }`}
      >
        <label className="block text-sm font-semibold text-gray-800">
          Location of Subject Property
        </label>
        {showErrors && errors.propertyIdentifier && (
          <p className="text-xs font-bold text-red-600 uppercase tracking-wide">
            Required before continuing
          </p>
        )}
        <input
          {...register("propertyIdentifier", {
            required: "Property address is required",
          })}
          type="text"
          placeholder="1234 Elm Street, Tulsa, OK 74103"
          className={`w-full border rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB] ${
            showErrors && errors.propertyIdentifier
              ? "border-red-400 bg-white"
              : "border-gray-300"
          }`}
        />
      </div>

      {/* Seller Occupying */}
      <div
        className={`rounded-xl border p-5 space-y-3 ${
          showErrors && errors.sellerOccupying
            ? "border-red-400 bg-red-50"
            : "border-gray-100"
        }`}
      >
        <label className="block text-sm font-semibold text-gray-800">
          Is the seller currently occupying the property?
        </label>
        {showErrors && errors.sellerOccupying && (
          <p className="text-xs font-bold text-red-600 uppercase tracking-wide">
            Required before continuing
          </p>
        )}
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              {...register("sellerOccupying", { required: true })}
              type="radio"
              value={0}
              className="accent-[#2463EB]"
            />
            Yes, currently occupying
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              {...register("sellerOccupying", { required: true })}
              type="radio"
              value={1}
              className="accent-[#2463EB]"
            />
            Not occupying
          </label>
        </div>
      </div>

      {/* Initials */}
      <div className="rounded-xl border border-gray-100 p-5 space-y-3">
        <p className="text-sm font-semibold text-gray-800">Initials</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Buyer Initials</p>
            <div className="flex gap-2">
              <input
                {...register("initials.buyerInitial1")}
                maxLength={1}
                placeholder="J"
                className="w-14 border border-gray-300 rounded-lg px-3 py-2 text-center text-sm text-black uppercase"
              />
              <input
                {...register("initials.buyerInitial2")}
                maxLength={1}
                placeholder="B"
                className="w-14 border border-gray-300 rounded-lg px-3 py-2 text-center text-sm text-black uppercase"
              />
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Seller Initials</p>
            <div className="flex gap-2">
              <input
                {...register("initials.sellerInitial1")}
                maxLength={1}
                placeholder="M"
                className="w-14 border border-gray-300 rounded-lg px-3 py-2 text-center text-sm text-black uppercase"
              />
              <input
                {...register("initials.sellerInitial2")}
                maxLength={1}
                placeholder="S"
                className="w-14 border border-gray-300 rounded-lg px-3 py-2 text-center text-sm text-black uppercase"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}