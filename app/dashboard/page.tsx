"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Disclosure {
  id: string;
  property_identifier: string;
  status: string;
  updated_at: string;
}

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login");
      } else {
        setEmail(session.user.email ?? "");
        loadDisclosures();
      }
    });
  }, []);

  async function loadDisclosures() {
    const res = await fetch("/api/disclosures", { credentials: "include" });
    if (res.ok) {
      const data = await res.json();
      setDisclosures(data.disclosures || []);
    }
    setLoading(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this disclosure?")) return;
    const res = await fetch(`/api/disclosures/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (res.ok) {
      setDisclosures(prev => prev.filter(d => d.id !== id));
    } else {
      alert("Failed to delete. Please try again.");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric"
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4">

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">My Disclosures</h1>
            <p className="text-gray-500 text-sm mt-1">{email}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/disclosure")}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              + New Disclosure
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
            >
              Sign out
            </button>
          </div>
        </div>

        {disclosures.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <p className="text-gray-400 text-sm mb-4">No disclosures yet</p>
            <button
              onClick={() => router.push("/disclosure")}
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Start New Disclosure
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {disclosures.map(d => (
              <div key={d.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{d.property_identifier || "Untitled"}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Last updated {formatDate(d.updated_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                    d.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {d.status === "completed" ? "Completed" : "Draft"}
                  </span>
                  <button
                    onClick={() => router.push(`/disclosure?id=${d.id}`)}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {d.status === "completed" ? "View" : "Continue"}
                  </button>
                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}