"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const isSharedLink = searchParams.get("shared") === "1";

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center space-y-6">

        {/* Success icon */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            Disclosure Submitted
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            {isSharedLink
              ? "Your disclosure has been submitted and the PDF has been sent to your realtor. You can close this tab."
              : "The completed disclosure PDF has been downloaded and emailed to both the buyer and seller."}
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            What happens next
          </p>
          <ul className="space-y-2">
            {[
              "PDF saved to your downloads",
              "Buyer & seller automatically emailed a copy",
              "Disclosure saved to your dashboard",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-[#2463EB] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        {!isSharedLink && (
          <Link
            href="/dashboard"
            className="block w-full py-3 bg-[#2463EB] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
        )}

        <p className="text-[11px] text-gray-400">
          Oklahoma RPCD Disclosure — Form 01-01-2026
        </p>
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7f9fb]" />}>
      <ThankYouContent />
    </Suspense>
  );
}