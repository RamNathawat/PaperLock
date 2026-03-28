"use client";

import DisclosurePage from "@/app/disclosure/page";
import { use } from "react";

export default function FillPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  return <DisclosurePage sharedToken={token} />;
}