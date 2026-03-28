"use client";

import DisclosurePage from "@/app/disclosure/page";

export default function FillPage({
  params,
}: {
  params: { token: string };
}) {
  return <DisclosurePage sharedToken={params.token} />;
}