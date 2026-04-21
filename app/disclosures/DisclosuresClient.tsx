"use client";

import { useState, useMemo, useEffect } from "react";
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
interface ActivityItem {
  type: "shared" | "draft";
  id: string;
  address: string;
  date: string;
  status: string;
  progress: number | null;
  token: string | null;
  sellerEmail?: string;
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
  logout: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
  share: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>,
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  check: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  copy: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  trash: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  new: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>,
  search: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "submitted" || s === "completed")
    return <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider">{Icon.check} Completed</span>;
  if (s === "sent" || s === "in_progress")
    return <span className="px-3 py-1.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-full border border-blue-100 uppercase tracking-wider inline-block">Sent</span>;
  return <span className="px-3 py-1.5 bg-orange-50 text-orange-600 text-[10px] font-bold rounded-full border border-orange-100 uppercase tracking-wider inline-block">Draft</span>;
}

// ─── Disclosure Card ──────────────────────────────────────────────────────────
function DisclosureCard({ item, onDownload, onCopy, onDelete, formatDate }: {
  item: ActivityItem; onDownload: (item: ActivityItem) => void;
  onCopy: (url: string) => void; onDelete: (item: ActivityItem) => void; formatDate: (d: string) => string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const isComplete = item.status === "submitted" || item.status === "completed";
  const hasProgress = item.progress !== null && item.progress > 0 && !isComplete;
  const copyUrl = item.type === "draft"
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/disclosure?id=${item.id}`
    : `${typeof window !== "undefined" ? window.location.origin : ""}/fill/${item.token}`;

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 relative">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div className="flex-1 min-w-0">
          {item.status === "draft" && (
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-orange-500 block mb-2">Draft</span>
          )}
          <h3 className="text-lg font-bold text-gray-900 leading-snug">{item.address}</h3>
          <p className="text-xs text-gray-400 mt-1">
            {item.type === "shared" ? "Sent to client" : "My draft"}
            {item.sellerEmail && <span className="ml-1 text-gray-300">·</span>}
            {item.sellerEmail && <span className="ml-1">{item.sellerEmail}</span>}
            <span className="mx-1.5 text-gray-200">·</span>
            {formatDate(item.date)}
          </p>
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="More actions"
          >
            <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor"><circle cx="2" cy="2" r="2"/><circle cx="2" cy="8" r="2"/><circle cx="2" cy="14" r="2"/></svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} aria-hidden="true" />
              <div className="absolute right-0 top-10 z-20 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden py-1">
                {isComplete && (
                  <button onClick={() => { onDownload(item); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                    {Icon.download} Download PDF
                  </button>
                )}
                <button onClick={() => { onCopy(copyUrl); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left">
                  {Icon.copy} Copy link
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button onClick={() => { onDelete(item); setMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                  {Icon.trash} Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-gray-50 pt-4 flex items-center gap-4">
        <StatusBadge status={item.status} />
        {hasProgress && (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${item.progress}%` }} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 tabular-nums">{item.progress}%</span>
          </div>
        )}
        {isComplete && (
          <button onClick={() => onDownload(item)}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full hover:bg-blue-100 transition-colors">
            {Icon.download} <span>PDF</span>
          </button>
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
        <Link href="/dashboard" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
          <span>{Icon.grid}</span> Dashboard
        </Link>
        <Link href="/disclosures" className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold bg-blue-50 text-blue-700 rounded-xl">
          <span className="text-blue-600">{Icon.doc}</span> Disclosures
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
function BottomNav({ onShareOpen, onSignOut }: { onShareOpen: () => void; onSignOut: () => void }) {
  const router = useRouter();
  const items = [
    { label: "Overview", icon: Icon.grid, href: "/dashboard", active: false },
    { label: "Disclosures", icon: Icon.doc, href: "/disclosures", active: true },
    { label: "New Draft", icon: Icon.new, href: "/disclosure", active: false },
    { label: "Sign Out", icon: Icon.logout, onClick: onSignOut, active: false },
  ];
  return (
    <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-50 bg-white/85 backdrop-blur-2xl border-t border-gray-100" aria-label="Bottom navigation">
      <div className="flex justify-around items-center px-2 pt-2" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        {items.map(item => (
          <button key={item.label} onClick={item.onClick ?? (() => router.push(item.href!))}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-2xl transition-colors ${item.active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-[60] p-0 sm:p-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
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
                <label htmlFor="disc-sellerEmail" className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block">Seller Email</label>
                <input id="disc-sellerEmail" type="email" placeholder="seller@example.com" value={sellerEmail} onChange={e => onSellerEmail(e.target.value)} autoComplete="email"
                  className="w-full h-11 px-4 bg-gray-50 border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-xl transition-all" />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="disc-seller2Email" className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400 block">
                  Secondary Email <span className="normal-case font-normal text-gray-300">(optional)</span>
                </label>
                <input id="disc-seller2Email" type="email" placeholder="co-seller@example.com" value={seller2Email} onChange={e => onSeller2Email(e.target.value)} autoComplete="email"
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

// ─── Filter chips ─────────────────────────────────────────────────────────────
type Filter = "all" | "sent" | "completed" | "draft";
const FILTER_LABELS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "sent", label: "Sent" },
  { key: "completed", label: "Completed" },
  { key: "draft", label: "Draft" },
];

const PAGE_SIZE = 10;

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DisclosuresClient({ email, initialDisclosures, initialSharedLinks }: {
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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState<Filter>("all");
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

  async function handleDelete(item: ActivityItem) {
    if (!confirm("Delete this disclosure?")) return;
    if (item.type === "draft") {
      const res = await fetch(`/api/disclosures/${item.id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) { setDisclosures(prev => prev.filter(d => d.id !== item.id)); invalidatePortalCache(); }
      else alert("Failed to delete.");
    } else {
      const { error } = await supabase.from("shared_links").delete().eq("token", item.token!);
      if (!error) { setSharedLinks(prev => prev.filter(l => l.token !== item.token)); invalidatePortalCache(); }
    }
  }

  async function handleSignOut() { await supabase.auth.signOut(); router.push("/auth/login"); }
  function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
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
    try { await fetch("/api/send-invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipients: [sellerEmail.trim(), seller2Email.trim()].filter(Boolean), link: url }) }); } catch { /* non-fatal */ }
    setCreating(false);
  }

  const allActivity: ActivityItem[] = useMemo(() => [
    ...sharedLinks.map(sl => ({
      type: "shared" as const, id: sl.token,
      address: sl.form_data?.propertyIdentifier || "No address yet",
      date: sl.created_at,
      status: sl.is_submitted ? "submitted" : "sent",
      progress: getProgress(sl.form_data, sl.is_submitted),
      token: sl.token,
      sellerEmail: sl.seller_email,
    })),
    ...disclosures.map(d => ({
      type: "draft" as const, id: d.id,
      address: d.property_identifier || "Untitled",
      date: d.updated_at,
      status: d.status || "draft",
      progress: getProgress(d.form_data, d.status === "submitted" || d.status === "completed"),
      token: null,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
  [sharedLinks, disclosures]);

  // Counts per filter for badge
  const counts = useMemo(() => ({
    all: allActivity.length,
    sent: allActivity.filter(i => i.status === "sent" || i.status === "in_progress").length,
    completed: allActivity.filter(i => i.status === "submitted" || i.status === "completed").length,
    draft: allActivity.filter(i => i.status === "draft").length,
  }), [allActivity]);

  const filtered = useMemo(() => {
    let items = allActivity;
    if (filterStatus === "sent") items = items.filter(i => i.status === "sent" || i.status === "in_progress");
    else if (filterStatus === "completed") items = items.filter(i => i.status === "submitted" || i.status === "completed");
    else if (filterStatus === "draft") items = items.filter(i => i.status === "draft");
    if (search.trim()) items = items.filter(i => i.address.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [allActivity, filterStatus, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function downloadPdf(item: ActivityItem) {
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

  function openShare() { setShowModal(true); setLink(null); setSellerEmail(""); setSeller2Email(""); }
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
                <p className="text-xl font-bold text-gray-900 leading-tight tracking-tight">Disclosures</p>
              </div>
            </div>
          </div>
        </header>

        {/* ── Desktop page header ── */}
        <div className="hidden lg:block px-10 pt-10 pb-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Management Hub</p>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Disclosures</h1>
        </div>

        <main className="flex-1 px-4 sm:px-5 lg:px-10 pt-6 pb-36 lg:pb-10 space-y-5">

          {/* ── Search ── */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">{Icon.search}</span>
            <input
              type="search"
              placeholder="Search by property address…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-11 pl-10 pr-4 bg-white border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-2xl shadow-sm transition-all"
            />
          </div>

          {/* ── Filter chips ── */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar" style={{ scrollbarWidth: "none" }}>
            {FILTER_LABELS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => { setFilterStatus(key); setPage(1); }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all active:scale-95 flex-shrink-0 ${
                  filterStatus === key
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {label}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  filterStatus === key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                }`}>
                  {counts[key]}
                </span>
              </button>
            ))}
          </div>

          {/* ── Card feed ── */}
          {paginated.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
              <p className="text-4xl mb-4">🔍</p>
              <p className="text-sm font-semibold text-gray-500">
                {search ? `No results for "${search}"` : "No disclosures yet"}
              </p>
              <p className="text-xs text-gray-400 mt-1">Send a form to a client or create a draft.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginated.map(item => (
                <DisclosureCard
                  key={item.id}
                  item={item}
                  onDownload={downloadPdf}
                  onCopy={copyLink}
                  onDelete={handleDelete}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
              <p className="text-[11px] text-gray-400 text-center sm:text-left">
                Page {page} of {totalPages} · {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex gap-2 justify-center">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-xl">
                  ← Previous
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="px-4 py-2 text-xs font-semibold bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors rounded-xl">
                  Next →
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ── FAB (mobile only) ── */}
      <button onClick={openShare}
        className="fixed bottom-24 right-5 lg:hidden w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40 active:scale-90 transition-transform hover:bg-blue-700"
        aria-label="Send to client">
        {Icon.share}
      </button>

      {/* ── Bottom nav (mobile only) ── */}
      <BottomNav onShareOpen={openShare} onSignOut={handleSignOut} />

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
