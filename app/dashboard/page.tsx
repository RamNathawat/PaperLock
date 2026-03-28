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

  // 🔥 NEW STATES
  const [showModal, setShowModal] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
      alert("Failed to delete.");
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // 🔥 CREATE LINK (IMPROVED)
  async function handleCreateLink() {
    if (creating) return;
    setCreating(true);

    const token = crypto.randomUUID();

    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("shared_links")
      .insert({
        token,
        created_by: user?.id || null,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      setCreating(false);
      return;
  }

    const url = `${window.location.origin}/fill/${token}`;
    setLink(url);

    // auto copy
    navigator.clipboard.writeText(url);

    setCreating(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-10 px-4">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">My Disclosures</h1>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          <div className="flex gap-3">
            {/* 🔥 PRIMARY BUTTON */}
            <button
              onClick={() => {
                setShowModal(true);
                setLink(null);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              + Send to Client
            </button>

            {/* SECONDARY */}
            <button
              onClick={() => router.push("/disclosure")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + Create Draft
            </button>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* LIST */}
        {disclosures.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center">
            No disclosures yet
          </div>
        ) : (
          <div className="space-y-3">
            {disclosures.map(d => (
              <div
                key={d.id}
                className="bg-white p-4 rounded-lg flex justify-between"
              >
                <div>
                  <p className="font-medium">
                    {d.property_identifier || "Untitled"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(d.updated_at)}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      router.push(`/disclosure?id=${d.id}`)
                    }
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Open
                  </button>

                  <button
                    onClick={() => handleDelete(d.id)}
                    className="text-red-400 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 🔥 MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">

              <h2 className="text-lg font-semibold">
                Send Form to Client
              </h2>

              {!link ? (
                <button
                  onClick={handleCreateLink}
                  disabled={creating}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Create Link"}
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-green-600 font-medium">
                    ✅ Link Created & Copied
                  </p>

                  <div className="bg-gray-100 p-2 rounded text-xs break-all">
                    {link}
                  </div>

                  <button
                    onClick={() => navigator.clipboard.writeText(link)}
                    className="w-full border py-2 rounded-lg text-sm hover:bg-gray-100"
                  >
                    Copy Again
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowModal(false)}
                className="text-sm text-gray-400 w-full hover:underline"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}