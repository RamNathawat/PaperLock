"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "submitted" || s === "completed") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Completed
      </span>
    );
  }
  if (s === "sent" || s === "in_progress") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
        Sent
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 border border-gray-200 rounded-full">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Draft
    </span>
  );
}

function Sidebar({ email, onSignOut }: { email: string; onSignOut: () => void }) {
  const router = useRouter();
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 flex flex-col py-8 px-4 z-40">
      <div className="px-2 mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Oklahoma</p>
        <h1 className="text-base font-bold text-gray-900 leading-tight">RPCD Disclosure</h1>
      </div>
      <nav className="flex-1 space-y-1">
        <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg">
          Dashboard
        </Link>
        <Link href="/disclosures" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
          Disclosures
        </Link>
      </nav>
      <div className="space-y-2 mt-4">
        <button
          onClick={() => router.push("/disclosures?modal=share")}
          className="w-full px-3 py-2.5 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors rounded-lg"
        >
          + Send to Client
        </button>
        <button
          onClick={() => router.push("/disclosure")}
          className="w-full px-3 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors rounded-lg"
        >
          + New Draft
        </button>
      </div>
      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-xs text-gray-400 truncate px-2 mb-3">{email}</p>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        >
          ↪ Sign out
        </button>
      </div>
    </aside>
  );
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

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth/login");
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
    if (error) { alert(error.message); setCreating(false); return; }
    const url = `${window.location.origin}/fill/${token}`;
    setLink(url);
    copyLink(url);
    if (newLink) setSharedLinks(prev => [newLink, ...prev]);
    setCreating(false);
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  }

  const recentActivity = [
    ...sharedLinks.map(sl => ({
      type: "shared" as const,
      id: sl.token,
      address: sl.form_data?.propertyIdentifier || "No address yet",
      date: sl.created_at,
      status: sl.is_submitted ? "submitted" : "sent",
      progress: getProgress(sl.form_data),
      token: sl.token,
    })),
    ...disclosures.map(d => ({
      type: "draft" as const,
      id: d.id,
      address: d.property_identifier || "Untitled",
      date: d.updated_at,
      status: d.status || "draft",
      progress: null,
      token: null,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalSent = sharedLinks.length;
  const totalSubmitted = sharedLinks.filter(sl => sl.is_submitted).length;
  const totalDrafts = disclosures.length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f9fb]">
        <p className="text-sm text-gray-400 font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f7f9fb] font-[Inter,sans-serif]">
      <Sidebar email={email} onSignOut={handleSignOut} />

      <main className="ml-60 flex-1 px-10 py-10">
        <div className="mb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-1">Overview</p>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Sent", value: totalSent },
            { label: "Submitted", value: totalSubmitted },
            { label: "My Drafts", value: totalDrafts },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-100 px-6 py-5 rounded-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">Recent Activity</p>
            <Link href="/disclosures" className="text-xs font-semibold text-blue-600 hover:underline">
              View all →
            </Link>
          </div>

          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
            <div className="col-span-5 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">Property Address</div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">Status</div>
            <div className="col-span-3 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">Progress</div>
            <div className="col-span-2 text-[10px] font-bold uppercase tracking-[0.08em] text-gray-400">Date</div>
          </div>

          {recentActivity.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">
              No activity yet. Create a draft or send a form to a client.
            </div>
          ) : (
            recentActivity.map((item, i) => (
              <div
                key={item.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${
                  i < recentActivity.length - 1 ? "border-b border-gray-50" : ""
                }`}
              >
                <div className="col-span-5">
                  <p className="text-sm font-semibold text-gray-900 truncate">{item.address}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {item.type === "shared" ? "Sent to client" : "My draft"}
                  </p>
                </div>
                <div className="col-span-2">
                  <StatusBadge status={item.status} />
                </div>
                <div className="col-span-3">
                  {item.progress !== null ? (
                    <div>
                      <div className="text-[10px] text-gray-400 mb-1">{item.progress}%</div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full">
                        <div className="bg-blue-500 h-1.5 rounded-full transition-all" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <span className="text-[11px] text-gray-300">—</span>
                  )}
                </div>
                <div className="col-span-2">
                  <p className="text-[11px] text-gray-400">{formatDate(item.date)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Share modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-6">
          <div className="bg-white w-full max-w-md border border-gray-100 shadow-[0_24px_48px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-6 border-b border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 tracking-tight">Share Disclosure</h3>
                  <p className="text-sm text-gray-400 mt-1">Generate a unique link for your client</p>
                </div>
                <button onClick={() => setShowModal(false)} className="text-gray-300 hover:text-gray-600 text-lg">✕</button>
              </div>
            </div>
            <div className="px-8 py-8 space-y-6">
              {!link ? (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Generate a unique link your client can use to fill out the disclosure form. No account required.
                  </p>
                  <button
                    onClick={handleCreateLink}
                    disabled={creating}
                    className="w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {creating ? "Generating..." : "Generate Link"}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex items-center gap-3 bg-gray-50 px-4 py-3 border border-gray-100 rounded-lg">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Link Created</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Copied to clipboard automatically</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block">Generated Link</label>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={link}
                        className="flex-1 h-10 px-3 bg-gray-50 border border-gray-200 text-xs text-gray-700 focus:outline-none focus:border-blue-500 rounded-md"
                      />
                      <button
                        onClick={() => copyLink(link)}
                        className="px-4 h-10 border border-blue-600 text-blue-600 text-xs font-bold rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-3 p-4 bg-gray-50 border border-gray-100 rounded-lg">
                    <span className="text-blue-500 text-sm flex-shrink-0">ℹ</span>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      No account needed. Progress appears on your dashboard in real time.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-medium px-4 py-2 rounded-lg z-50">
          Link copied to clipboard
        </div>
      )}
    </div>
  );
}