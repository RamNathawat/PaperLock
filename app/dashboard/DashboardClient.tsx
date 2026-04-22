"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getPortalCache, setPortalCache, invalidatePortalCache } from "@/lib/portal-cache";

interface Disclosure {
  id: string;
  property_identifier: string;
  status: string;
  updated_at: string;
  form_data: any;
}
interface SharedLink {
  id: string;
  token: string;
  created_at: string;
  updated_at: string;
  is_submitted: boolean;
  form_data: any;
  disclosure_id: string | null;
  seller_email?: string;
}

function getProgress(formData: any, isSubmitted?: boolean): number {
  if (isSubmitted) return 100;
  if (!formData) return 0;
  const steps = [formData.propertyIdentifier, formData.appliances, formData.inlineOptions, formData.page2Zoning, formData.questions, formData.signatures];
  return Math.round((steps.filter(s => s !== undefined && s !== null).length / steps.length) * 100);
}

// ─── Icons ───────────────────────────────────────────────────────────────────
const Icon = {
  grid: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  doc: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="12" y2="17"/></svg>,
  plus: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  share: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  check: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  copy: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  new: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
};

// ─── Status Badge (pill) ─────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "submitted" || s === "completed")
    return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider">{Icon.check} Completed</span>;
  if (s === "sent" || s === "in_progress")
    return <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-wider inline-block">Sent</span>;
  return <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full border border-orange-100 uppercase tracking-wider inline-block">Draft</span>;
}

// ─── Activity Card ───────────────────────────────────────────────────────────
function ActivityCard({ item, onDownload, formatDate }: {
  item: any; onDownload: (item: any) => void; formatDate: (d: string) => string;
}) {
  const isComplete = item.status === "submitted" || item.status === "completed";
  const hasProgress = item.progress !== null && item.progress > 0 && !isComplete;

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 pr-3">
          {item.status === "draft" && (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-500 block mb-2">Draft</span>
          )}
          <h3 className="text-base font-bold text-gray-900 leading-snug line-clamp-2">{item.address}</h3>
          <p className="text-xs text-gray-400 mt-1">
            {item.type === "shared" ? "Sent to client" : "My draft"} <span className="mx-1 text-gray-300">·</span> {formatDate(item.date)}
          </p>
        </div>
        {isComplete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(item); }}
            title="Download PDF"
            className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {Icon.download}
          </button>
        )}
      </div>

      <div className="border-t border-gray-50 pt-4 flex items-center gap-3">
        <StatusBadge status={item.status} />
        {hasProgress && (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${item.progress}%` }} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 tabular-nums">{item.progress}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Desktop Sidebar ─────────────────────────────────────────────────────────
function DesktopSidebar({ email, onSignOut, onShare }: { email: string; onSignOut: () => void; onShare: () => void }) {
  const router = useRouter();
  const initials = email ? email[0].toUpperCase() : "A";
  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 hidden lg:flex flex-col py-8 px-4 z-40">
      <div className="px-3 mb-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Oklahoma</p>
        <h1 className="text-base font-bold text-gray-900 leading-tight">RPCD Disclosure</h1>
      </div>

      <nav className="flex-1 space-y-1" aria-label="Main navigation">
        <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold bg-blue-50 text-blue-700 rounded-xl">
          <span className="text-blue-600">{Icon.grid}</span> Dashboard
        </Link>
        <Link href="/disclosures" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
          <span>{Icon.doc}</span> Disclosures
        </Link>
      </nav>

      <div className="space-y-2 mt-4">
        <button onClick={onShare} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors rounded-xl">
          {Icon.share} Send to Client
        </button>
        <button onClick={() => router.push("/disclosure")} className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors rounded-xl">
          {Icon.new} New Draft
        </button>
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{initials}</div>
          <p className="text-xs text-gray-500 truncate">{email}</p>
        </div>
        <button onClick={onSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
          {Icon.logout} Sign out
        </button>
      </div>
    </aside>
  );
}

// ─── Mobile Bottom Nav ───────────────────────────────────────────────────────
function BottomNav({ onSignOut }: { onSignOut: () => void }) {
  const router = useRouter();
  const items = [
    { label: "Overview", icon: Icon.grid, href: "/dashboard", active: true },
    { label: "Disclosures", icon: Icon.doc, href: "/disclosures", active: false },
    { label: "New Draft", icon: Icon.new, href: "/disclosure", active: false },
    { label: "Sign Out", icon: Icon.logout, onClick: onSignOut, active: false },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-white/85 backdrop-blur-2xl border-t border-gray-100" aria-label="Bottom navigation">
      <div className="flex justify-around items-center px-2 pt-2 pb-safe" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {items.map((item) => (
          <button
            key={item.label}
            onClick={item.onClick ?? (() => router.push(item.href!))}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-colors ${item.active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}
          >
            {item.icon}
            <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
            {item.active && <div className="w-1 h-1 rounded-full bg-blue-600 mt-0.5" />}
          </button>
        ))}
      </div>
    </nav>
  );
}

// ─── Share Modal ─────────────────────────────────────────────────────────────
function ShareModal({ link, creating, copied, sellerEmail, seller2Email, onSellerEmail, onSeller2Email, onCreate, onCopy, onClose }: any) {
  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-gray-100 shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-5 sm:px-8 sm:pt-8 sm:pb-6 border-b border-gray-50">
          <div className="sm:hidden w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 tracking-tight">Share Disclosure</h3>
              <p className="text-sm text-gray-400 mt-1">Generate a unique link for your client</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors" aria-label="Close">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8 sm:py-8 space-y-5">
          {!link ? (
            <>
              <div className="space-y-1.5">
                <label htmlFor="db-sellerEmail" className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block">Seller Email</label>
                <input id="db-sellerEmail" type="email" placeholder="seller@example.com" value={sellerEmail} onChange={e => onSellerEmail(e.target.value)} autoComplete="email"
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="db-seller2Email" className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block">
                  Secondary Email <span className="normal-case font-normal text-gray-300">(optional)</span>
                </label>
                <input id="db-seller2Email" type="email" placeholder="co-seller@example.com" value={seller2Email} onChange={e => onSeller2Email(e.target.value)} autoComplete="email"
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all" />
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">The completed PDF is automatically emailed to the seller when they submit.</p>
              <button onClick={onCreate} disabled={creating}
                className="w-full py-3.5 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50">
                {creating ? "Generating…" : "Generate Link"}
              </button>
            </>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center gap-3 bg-emerald-50 px-4 py-3.5 rounded-2xl border border-emerald-100">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">{Icon.check}</div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Link Created</p>
                  <p className="text-[11px] text-emerald-600 mt-0.5">Copied to clipboard & email sent</p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block">Generated Link</label>
                <div className="flex gap-2">
                  <input readOnly value={link} className="flex-1 min-w-0 h-11 px-4 bg-gray-50 border border-gray-200 text-xs text-gray-600 focus:outline-none rounded-xl" />
                  <button onClick={onCopy} className="flex-shrink-0 px-4 h-11 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors">
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>
              <div className="flex gap-3 p-4 bg-blue-50 rounded-2xl">
                <span className="text-blue-400 text-base flex-shrink-0">ℹ</span>
                <p className="text-xs text-blue-700 leading-relaxed">No account needed — the seller fills the form directly via this link.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DashboardClient({ email, initialDisclosures, initialSharedLinks }: {
  email: string; initialDisclosures: Disclosure[]; initialSharedLinks: SharedLink[];
}) {
  const [disclosures, setDisclosures] = useState<Disclosure[]>(() =>
    (typeof window !== "undefined" ? getPortalCache()?.disclosures : null) ?? initialDisclosures
  );
  const [sharedLinks, setSharedLinks] = useState<SharedLink[]>(() =>
    (typeof window !== "undefined" ? getPortalCache()?.sharedLinks : null) ?? initialSharedLinks
  );
  const [showModal, setShowModal] = useState(false);
  const [link, setLink] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sellerEmail, setSellerEmail] = useState("");
  const [seller2Email, setSeller2Email] = useState("");

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (!getPortalCache()) setPortalCache({ disclosures: initialDisclosures, sharedLinks: initialSharedLinks });
    async function refresh() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [dR, lR] = await Promise.all([
        supabase.from("disclosures").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
        supabase.from("shared_links").select("*").eq("created_by", user.id).order("created_at", { ascending: false }),
      ]);
      const fresh = { disclosures: dR.data ?? [], sharedLinks: lR.data ?? [] };
      setPortalCache(fresh); setDisclosures(fresh.disclosures); setSharedLinks(fresh.sharedLinks);
    }
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSignOut() { await supabase.auth.signOut(); router.push("/auth/login"); }

  function copyLink(url: string) { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }

  async function handleCreateLink() {
    if (creating || !sellerEmail.trim()) { if (!sellerEmail.trim()) alert("Please enter the seller's email."); return; }
    setCreating(true);
    const token = crypto.randomUUID();
    const { data: { user } } = await supabase.auth.getUser();
    const { data: newLink, error } = await supabase.from("shared_links")
      .insert({ token, created_by: user?.id || null, seller_email: sellerEmail.trim(), seller2_email: seller2Email.trim() || null })
      .select().single();
    if (error) { alert(error.message); setCreating(false); return; }
    const url = `${window.location.origin}/fill/${token}`;
    setLink(url); copyLink(url);
    if (newLink) { setSharedLinks(prev => [newLink, ...prev]); invalidatePortalCache(); }
    // Only invite Seller 1 at link-creation time.
    // Seller 2 gets their invite later (via PATCH route) once Seller 1 has submitted.
    try { await fetch("/api/send-invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipients: [sellerEmail.trim()], link: url }) }); } catch { /* non-fatal */ }
    setCreating(false);
  }

  function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }

  function openShare() { setShowModal(true); setLink(null); setSellerEmail(""); setSeller2Email(""); }

  const recentActivity = [
    ...sharedLinks.map(sl => ({ type: "shared" as const, id: sl.token, address: sl.form_data?.propertyIdentifier || "No address yet", date: sl.created_at, status: sl.is_submitted ? "submitted" : "sent", progress: getProgress(sl.form_data, sl.is_submitted), token: sl.token })),
    ...disclosures.map(d => ({ type: "draft" as const, id: d.id, address: d.property_identifier || "Untitled", date: d.updated_at, status: d.status || "draft", progress: getProgress(d.form_data, d.status === "submitted" || d.status === "completed"), token: null })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  async function downloadPdf(item: any) {
    const fd = item.type === "draft" ? disclosures.find(d => d.id === item.id)?.form_data : sharedLinks.find(l => l.token === item.token)?.form_data;
    if (!fd) return;
    try {
      const res = await fetch("/api/disclosure/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(fd) });
      if (!res.ok) throw new Error();
      const blob = await res.blob(); const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `Disclosure-${item.address}.pdf`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    } catch { alert("Failed to download PDF."); }
  }

  const stats = [
    { label: "Total Sent", value: sharedLinks.length },
    { label: "Submitted", value: sharedLinks.filter(sl => sl.is_submitted).length },
    { label: "My Drafts", value: disclosures.length },
  ];

  const initials = email ? email[0].toUpperCase() : "A";

  return (
    <div className="min-h-screen bg-[#f7f9fb]">
      <DesktopSidebar email={email} onSignOut={handleSignOut} onShare={openShare} />

      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* ── Mobile top bar ── */}
        <header className="lg:hidden sticky top-0 z-20 bg-[#f7f9fb]/90 backdrop-blur-lg px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center">{initials}</div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 leading-none">Oklahoma RPCD</p>
                <p className="text-xl font-bold text-gray-900 leading-tight tracking-tight">Dashboard</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Desktop page header ── */}
        <div className="hidden lg:block px-10 pt-10 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Overview</p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
        </div>

        {/* ── Main ── */}
        <main className="flex-1 px-4 sm:px-5 lg:px-10 pt-6 pb-36 lg:pb-10 space-y-8">

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 leading-tight">{s.label}</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 tabular-nums">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Activity feed */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 tracking-tight">Recent Activity</h2>
              <Link href="/disclosures" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">View all →</Link>
            </div>

            {recentActivity.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-sm font-semibold text-gray-500">No activity yet</p>
                <p className="text-xs text-gray-400 mt-1">Send a form to a client or create your first draft.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivity.map(item => (
                  <ActivityCard key={item.id} item={item} onDownload={downloadPdf} formatDate={formatDate} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── FAB (mobile only) ── */}
      <button
        onClick={openShare}
        className="fixed bottom-24 right-5 lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform hover:bg-blue-700"
        aria-label="Send to client"
      >
        {Icon.share}
      </button>

      {/* ── Bottom nav (mobile only) ── */}
      <BottomNav onSignOut={handleSignOut} />

      {/* ── Share modal ── */}
      {showModal && (
        <ShareModal
          link={link} creating={creating} copied={copied}
          sellerEmail={sellerEmail} seller2Email={seller2Email}
          onSellerEmail={setSellerEmail} onSeller2Email={setSeller2Email}
          onCreate={handleCreateLink} onCopy={() => link && copyLink(link)}
          onClose={() => { setShowModal(false); setSellerEmail(""); setSeller2Email(""); }}
        />
      )}

      {/* ── Copy toast ── */}
      {copied && (
        <div className="fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 bg-gray-900/95 text-white text-xs font-semibold px-5 py-2.5 rounded-full z-[70] shadow-xl">
          Copied to clipboard
        </div>
      )}
    </div>
  );
}
