"use client";

import { useFormContext } from "react-hook-form";
import { useRef, useEffect, useState } from "react";

function SignaturePad({ name }: { name: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const { setValue } = useFormContext();
  const [signed, setSigned] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#1d4ed8";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
  }, []);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDrawing(e: React.MouseEvent | React.TouchEvent) {
    isDrawing.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing.current) return;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setSigned(true);
  }

  function stopDrawing() {
    if (!isDrawing.current) return;
    isDrawing.current = false;
    const canvas = canvasRef.current!;
    const base64 = canvas.toDataURL("image/png").split(",")[1];
    setValue(name, base64);
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setValue(name, "");
    setSigned(false);
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={120}
        className="border border-gray-300 rounded-lg cursor-crosshair touch-none w-full"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
      {signed && (
        <button
          type="button"
          onClick={clear}
          className="mt-1 text-xs text-red-500 hover:underline"
        >
          Clear signature
        </button>
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
          Sign below to complete the disclosure. Click and drag to sign.
        </p>
      </div>

      {/* Seller Signature */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Seller Signature
        </label>
        <SignaturePad name="signatures.sellerSignatureBase64" />
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Seller Printed Name</label>
            <input
              {...register("signatures.sellerName")}
              type="text"
              placeholder="Full name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              {...register("signatures.sellerDate")}
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Buyer Signature */}
      <div className="border border-gray-200 rounded-lg p-4 bg-white">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Buyer Signature
        </label>
        <SignaturePad name="signatures.buyerSignatureBase64" />
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Buyer Printed Name</label>
            <input
              {...register("signatures.buyerName")}
              type="text"
              placeholder="Full name"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              {...register("signatures.buyerDate")}
              type="date"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
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
