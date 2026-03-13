"use client";

import { useFormContext } from "react-hook-form";

export default function Step1Property() {
  const { register, formState: { errors } } = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">Property Information</h2>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Location of Subject Property
        </label>
        <input
          {...register("propertyIdentifier", { required: "Property address is required" })}
          type="text"
          placeholder="1234 Elm Street, Tulsa, OK 74103"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.propertyIdentifier && (
          <p className="text-red-500 text-xs mt-1">
            {errors.propertyIdentifier.message as string}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Is the seller currently occupying the property?
        </label>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input
              {...register("sellerOccupying", { required: true })}
              type="radio"
              value={0}
              className="accent-blue-600"
            />
            Yes, currently occupying
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              {...register("sellerOccupying", { required: true })}
              type="radio"
              value={1}
              className="accent-blue-600"
            />
            Not occupying
          </label>
        </div>
        {errors.sellerOccupying && (
          <p className="text-red-500 text-xs mt-1">This field is required</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Initials
        </label>
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
