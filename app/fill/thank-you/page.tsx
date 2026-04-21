"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ThankYouContent() {
  const searchParams = useSearchParams();
  const isSharedLink = searchParams.get("shared") === "1";

  const nextSteps = isSharedLink
    ? [
        "Your realtor has been notified",
        "A copy of the PDF has been sent to your email",
        "You can safely close this tab",
      ]
    : [
        "PDF saved to your downloads",
        "Buyer & seller automatically emailed a copy",
        "Disclosure saved to your dashboard",
      ];

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4">
      <div className="max-w-sm w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-8 text-center space-y-6">

        {/* Success icon — squircle with soft glow */}
        <div className="flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center shadow-[0_0_0_8px_rgba(16,185,129,0.08)]">
            <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Submitted!</h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            {isSharedLink
              ? "Your disclosure has been submitted and the PDF has been sent to your realtor."
              : "The completed disclosure PDF has been downloaded and emailed to both parties."}
          </p>
        </div>

        {/* What happens next */}
        <div className="bg-gray-50 rounded-2xl p-5 text-left space-y-3">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">What happens next</p>
          <ul className="space-y-2.5">
            {nextSteps.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* CTA */}
        {!isSharedLink && (
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 active:scale-[0.97] transition-all"
          >
            Go to Dashboard
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        )}

        <p className="text-[10px] text-gray-300 font-medium">Oklahoma RPCD Disclosure · Form 01-01-2026</p>
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