"use client";

import { useFormContext } from "react-hook-form";
import { useState } from "react";

function SignatureUpload({ name }: { name: string }) {
  const { setValue } = useFormContext();
  const [preview, setPreview] = useState<string | null>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      setValue(name, base64);
      setPreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        accept="image/png, image/jpeg"
        onChange={handleFile}
        className="block w-full text-sm"
      />

      {preview && (
        <img
          src={preview}
          alt="Signature preview"
          className="h-24 border rounded"
        />
      )}
    </div>
  );
}

export default function Step7Signatures() {
  const { register } = useFormContext();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Signatures</h2>
        <p className="text-sm text-gray-500 mt-1">
          Upload your signature image to complete the disclosure.
        </p>
      </div>

      {/* Seller Signature */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Seller Signature
        </label>

        <SignatureUpload name="signatures.sellerSignatureBase64" />

        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Seller Printed Name
            </label>
            <input
              {...register("signatures.sellerName")}
              type="text"
              placeholder="Full name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Date
            </label>
            <input
              {...register("signatures.sellerDate")}
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
            />
          </div>
        </div>
      </div>

      {/* Buyer Signature */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Buyer Signature
        </label>

        <SignatureUpload name="signatures.buyerSignatureBase64" />

        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Buyer Printed Name
            </label>
            <input
              {...register("signatures.buyerName")}
              type="text"
              placeholder="Full name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Date
            </label>
            <input
              {...register("signatures.buyerDate")}
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black"
            />
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center">
        By signing, you certify that all information provided is accurate to the best of your knowledge.
      </p>
    </div>
  );
}