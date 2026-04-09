"use client";

import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

export default function Step1Property() {
  const {
    register,
    watch,
    setValue,
    formState: { errors, submitCount },
  } = useFormContext();

  const showErrors = submitCount > 0;

  // Split address state
  const street = watch("address.street");
  const city = watch("address.city");
  const state = watch("address.state");
  const zip = watch("address.zip");

  useEffect(() => {
    if (street || city || state || zip) {
      const parts = [
        street,
        [city, state].filter(Boolean).join(", "),
        zip,
      ].filter(Boolean);
      setValue("propertyIdentifier", parts.join(" "), { shouldValidate: true });
    }
  }, [street, city, state, zip, setValue]);

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
        className={`rounded-xl border p-5 space-y-4 ${
          showErrors && errors.propertyIdentifier
            ? "border-red-400 bg-red-50"
            : "border-gray-100"
        }`}
      >
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Location of Subject Property
          </label>
          {showErrors && errors.propertyIdentifier && (
            <p className="text-xs font-bold text-red-600 uppercase tracking-wide mt-1">
              Complete address required before continuing
            </p>
          )}
        </div>
        
        {/* Hidden underlying value for PDF mapping */}
        <input type="hidden" {...register("propertyIdentifier", { required: true })} />

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Street Address</label>
            <input
              {...register("address.street")}
              type="text"
              placeholder="1234 Elm Street"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
            />
          </div>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
              <label className="block text-xs text-gray-500 mb-1">City</label>
              <input
                {...register("address.city")}
                type="text"
                placeholder="Tulsa"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-gray-500 mb-1">State</label>
              <input
                {...register("address.state")}
                type="text"
                placeholder="OK"
                maxLength={2}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB] uppercase"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs text-gray-500 mb-1">Zip</label>
              <input
                {...register("address.zip")}
                type="text"
                placeholder="74103"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
              />
            </div>
          </div>
        </div>
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
        <p className="text-sm font-semibold text-gray-800">Seller Initials</p>
        <div className="flex gap-3">
          <input
            {...register("initials.sellerInitial1")}
            maxLength={5}
            placeholder="JAD"
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-sm text-black uppercase focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
          />
          <input
            {...register("initials.sellerInitial2")}
            maxLength={5}
            placeholder="MS"
            className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center text-sm text-black uppercase focus:outline-none focus:ring-2 focus:ring-[#2463EB]"
          />
        </div>
      </div>
    </div>
  );
}