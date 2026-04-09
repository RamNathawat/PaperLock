import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  const [discRes, linksRes] = await Promise.all([
    supabase
      .from("disclosures")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("shared_links")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false })
  ]);

  return (
    <DashboardClient 
      email={user.email ?? ""} 
      initialDisclosures={discRes.data || []} 
      initialSharedLinks={linksRes.data || []} 
    />
  );
}