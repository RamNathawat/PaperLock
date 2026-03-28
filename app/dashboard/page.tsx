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

interface SharedLink {
  id: string;
  token: string;
  created_at: string;
  updated_at: string;
  is_submitted: boolean;
  form_data: any;
  disclosure_id: string | null;
}

function getProgress(formData: any): number {
  if (!formData) return 0;
  const steps = [
    formData.propertyIdentifier,
    formData.appliances,
    formData.inlineOptions,
    formData.page2Zoning,
    formData.questions,
    formData.additionalPages,
    formData.signatures,
  ];
  const filled = steps.filter(s => s !== undefined && s !== null).length;
  return Math.round((filled / steps.length) * 100);
}

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [disclosures, setDisclosures] = useState<Disclosure[]>([]);
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/auth/login");
      } else {
        setEmail(session.user.email ?? "");
        loadAll();
      }
    });
  }, []);

  async function loadAll() {
    const [discRes, { data: { user } }] = await Promise.all([
      fetch("/api/disclosures", { credentials: "include" }),
      supabase.auth.getUser(),
    ]);

    if (discRes.ok) {
      const data = await discRes.json();
      setDisclosures(data.disclosures || []);
    }

    if (user) {
      const { data: links } = await supabase
        .from("shared_links")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });
      setSharedLinks(links || []);
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

  async function handleDeleteLink(token: string) {
    if (!confirm("Delete this client link?")) return;
    const { error } = await supabase
      .from("shared_links")
      .delete()
      .eq("token", token);
    if (!error) {
      setSharedLinks(prev => prev.filter(l => l.token !== token));
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

  function copyLink(url: string) {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleCreateLink() {
    if (creating) return;
    setCreating(true);

    const token = crypto.randomUUID();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: newLink, error } = await supabase
      .from("shared_links")
      .insert({ token, created_by: user?.id || null })
      .select()
      .single();

    if (error) {
      alert(error.message);
      setCreating(false);
      return;
    }

    const url = `${window.location.origin}/fill/${token}`;
    setLink(url);
    copyLink(url);

    // add to list immediately
    if (newLink) setSharedLinks(prev => [newLink, ...prev]);

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
            <button
              onClick={() => { setShowModal(true); setLink(null); }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              + Send to Client
            </button>
            <button
              onClick={() => router.push("/disclosure")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              + New Disclosure
            </button>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* CLIENT LINKS SECTION */}
        {sharedLinks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
              Sent to Clients
            </h2>
            <div className="space-y-3">
              {sharedLinks.map(sl => {
                const progress = getProgress(sl.form_data);
                const url = `${window.location.origin}/fill/${sl.token}`;
                return (
                  <div key={sl.token} className="bg-white p-4 rounded-lg border border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-sm text-gray-800">
                          {sl.form_data?.propertyIdentifier || "No address yet"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Sent {formatDate(sl.created_at)}
                          {sl.is_submitted && (
                            <span className="ml-2 text-green-600 font-medium">✓ Submitted</span>
                          )}
                        </p>
                      </div>
                      <div className="flex gap-3 items-center">
                        <button
                          onClick={() => copyLink(url)}
                          className="text-blue-500 text-xs hover:underline"
                        >
                          {copied ? "Copied!" : "Copy Link"}
                        </button>
                        <button
                          onClick={() => handleDeleteLink(sl.token)}
                          className="text-red-400 text-xs hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Client progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MY DRAFTS SECTION */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            My Drafts
          </h2>
          {disclosures.length === 0 ? (
            <div className="bg-white p-10 rounded-xl text-center text-gray-400 text-sm">
              No drafts yet
            </div>
          ) : (
            <div className="space-y-3">
              {disclosures.map(d => (
                <div key={d.id} className="bg-white p-4 rounded-lg border border-gray-100 flex justify-between items-center">
                  <div>
                    <p className="font-medium text-sm">{d.property_identifier || "Untitled"}</p>
                    <p className="text-xs text-gray-400">Last updated {formatDate(d.updated_at)}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
                      {d.status || "draft"}
                    </span>
                    <button
                      onClick={() => router.push(`/disclosure?id=${d.id}`)}
                      className="text-blue-600 text-sm hover:underline"
                    >
                      Continue
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
        </div>

        {/* MODAL */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-xl w-[420px] space-y-4 shadow-xl">
              <h2 className="text-lg font-semibold">Send Form to Client</h2>
              <p className="text-sm text-gray-500">
                Generate a unique link for your client to fill out the disclosure form. No account needed on their end.
              </p>
              {!link ? (
                <button
                  onClick={handleCreateLink}
                  disabled={creating}
                  className="w-full bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                >
                  {creating ? "Creating..." : "Generate Link"}
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-green-600 font-medium">✅ Link created and copied to clipboard</p>
                  <div className="bg-gray-100 p-3 rounded-lg text-xs break-all text-gray-700">{link}</div>
                  <button
                    onClick={() => copyLink(link)}
                    className="w-full border py-2 rounded-lg text-sm hover:bg-gray-50"
                  >
                    {copied ? "Copied!" : "Copy Again"}
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