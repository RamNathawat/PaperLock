"use client";

import { useFormContext } from "react-hook-form";
import { useEffect } from "react";

export default function Step1Property({ readOnly, isSeller2, hasSeller2Email }: { readOnly?: boolean; isSeller2?: boolean; hasSeller2Email?: boolean }) {
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
        <span className="inline-block px-2.5 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full uppercase tracking-wider mb-3">
          Property
        </span>
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Property Information</h2>
        <p className="text-sm text-gray-400 mt-1">Enter the full property address and seller details.</p>
      </div>

      {/* Property Address */}
      <div className={readOnly ? "pointer-events-none opacity-70" : ""}>
        <div
          className={`rounded-2xl border p-5 space-y-4 ${
          showErrors && errors.propertyIdentifier
            ? "border-red-300 bg-red-50"
            : "border-gray-100 bg-gray-50/50"
        }`}
      >
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Location of Subject Property
          </label>
          {showErrors && errors.propertyIdentifier && (
            <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-200 uppercase tracking-wider">
              Complete address required
            </span>
          )}
        </div>
        
        {/* Hidden underlying value for PDF mapping */}
        <input type="hidden" {...register("propertyIdentifier", { required: true })} />

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Street Address</label>
            <input
              {...register("address.street")}
              type="text"
              placeholder="1234 Elm Street"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-6">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">City</label>
              <input
                {...register("address.city")}
                type="text"
                placeholder="Tulsa"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">State</label>
              <input
                {...register("address.state")}
                type="text"
                placeholder="OK"
                maxLength={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all uppercase"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Zip</label>
              <input
                {...register("address.zip")}
                type="text"
                placeholder="74103"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seller Occupying */}
      <div
        className={`rounded-2xl border p-5 space-y-3 ${
          showErrors && errors.sellerOccupying
            ? "border-red-300 bg-red-50"
            : "border-gray-100 bg-gray-50/50"
        }`}
      >
        <div>
          <label className="block text-sm font-semibold text-gray-800">
            Is the seller currently occupying the property?
          </label>
          {showErrors && errors.sellerOccupying && (
            <span className="inline-flex items-center gap-1.5 mt-1.5 px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-200 uppercase tracking-wider">
              Required
            </span>
          )}
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <label className="flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all text-sm text-gray-700 font-medium">
            <input
              {...register("sellerOccupying", { required: true })}
              type="radio"
              value={0}
              className="accent-blue-600"
            />
            Yes, currently occupying
          </label>
          <label className="flex items-center gap-2.5 px-4 py-3 bg-white border border-gray-200 rounded-2xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all text-sm text-gray-700 font-medium">
            <input
              {...register("sellerOccupying", { required: true })}
              type="radio"
              value={1}
              className="accent-blue-600"
            />
            Not occupying
          </label>
        </div>
      </div>
      </div>

      {/* Initials */}
      <div
        className={`rounded-2xl border p-5 space-y-3 ${
          showErrors && (errors as any)?.initials?.sellerInitial1
            ? "border-amber-200 bg-amber-50/40"
            : "border-gray-100 bg-gray-50/50"
        }`}
      >
        {!hasSeller2Email ? (
          <>
            <div>
              <p className="text-sm font-semibold text-gray-800">Seller Initials <span className="text-red-500">*</span></p>
              <p className="text-xs text-gray-400">Enter the initials of each seller on this disclosure.</p>
              {showErrors && (errors as any)?.initials?.sellerInitial1 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-amber-700">At least Seller 1 initials required</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <input
                {...register("initials.sellerInitial1", { required: true })}
                maxLength={5}
                placeholder="JAD"
                readOnly={isSeller2}
                className={`w-20 border rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  isSeller2 ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 pointer-events-none" : "bg-white"
                } ${
                  showErrors && (errors as any)?.initials?.sellerInitial1
                    ? "border-amber-300 bg-amber-50"
                    : "border-gray-200"
                }`}
              />
              <input
                {...register("initials.sellerInitial2")}
                maxLength={5}
                placeholder="MS"
                readOnly={isSeller2}
                className={`w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                  isSeller2 ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 pointer-events-none" : "bg-white"
                }`}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-gray-800">Seller Initials <span className="text-red-500">*</span></p>
              <p className="text-xs text-gray-500">
                These initials will be automatically applied to the bottom of all pages of the generated PDF.
              </p>
              {showErrors && (errors as any)?.initials?.sellerInitial1 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-amber-700">Seller 1 initials required</span>
                </div>
              )}
              {showErrors && isSeller2 && (errors as any)?.initials?.sellerInitial2 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  <span className="text-xs font-semibold text-amber-700">Seller 2 initials required</span>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="block text-xs font-medium text-gray-500">Seller 1</label>
                 <input
                   {...register("initials.sellerInitial1", { required: true })}
                   maxLength={5}
                   placeholder="JAD"
                   readOnly={isSeller2}
                   className={`w-full border rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                     isSeller2 ? "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200 pointer-events-none" : "bg-white"
                   } ${
                     showErrors && (errors as any)?.initials?.sellerInitial1
                       ? "border-amber-300 bg-amber-50"
                       : "border-gray-200"
                   }`}
                 />
              </div>
              <div className="space-y-1.5">
                 <label className="block text-xs font-medium text-gray-500">Seller 2</label>
                 <input
                   {...register("initials.sellerInitial2", { required: isSeller2 })}
                   maxLength={5}
                   placeholder="MS"
                   readOnly={!isSeller2}
                   className={`w-full border border-gray-200 rounded-xl px-3 py-2.5 text-center text-sm font-semibold text-gray-900 uppercase focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all ${
                     !isSeller2 ? "bg-gray-100 text-gray-500 cursor-not-allowed pointer-events-none" : "bg-white"
                   } ${
                     showErrors && isSeller2 && (errors as any)?.initials?.sellerInitial2
                       ? "border-amber-300 bg-amber-50"
                       : "border-gray-200"
                   }`}
                 />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
