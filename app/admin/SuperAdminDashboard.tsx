"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ─── TYPES ──────────────────────────────────────────────
interface AdminStats {
  totalTutors: number;
  totalReviews: number;
  totalVouches: number;
  totalInquiries: number;
  totalCardViews: number;
  uniqueCardViewers: number;
  signupsThisWeek: number;
  signupsLastWeek: number;
  reviewsThisWeek: number;
  reviewsLastWeek: number;
  vouchesThisWeek: number;
  vouchesLastWeek: number;
  inquiriesThisWeek: number;
  inquiriesLastWeek: number;
  viewsThisWeek: number;
  viewsLastWeek: number;
}

interface AdminFunnel {
  signedUp: number;
  cardComplete: number;
  firstReviewReceived: number;
  firstVouchReceived: number;
  firstInquiry: number;
}

interface AdminTutor {
  id: string;
  userId: string;
  name: string;
  headline: string;
  email: string;
  location: string;
  specialties: string[];
  reviews: number;
  vouches: number;
  badges: number;
  inquiries: number;
  views: number;
  uniqueVisitors: number;
  status: "active" | "inactive" | "incomplete";
  joined: string;
  slug: string;
  avatarColor: string;
  allLocations: string[];
  subjects: string[];
  businessName: string | null;
  yearsExperience: number | null;
  profileImageUrl: string | null;
  links: { label: string; url: string; icon?: string }[];
  isSuspended: boolean;
}

interface ReviewReport {
  id: string;
  reviewId: string;
  tutorName: string;
  tutorSlug: string;
  reviewerName: string;
  reviewerEmail: string | null;
  reviewExam: string | null;
  reviewQuote: string;
  reviewRating: number;
  reason: string;
  reviewerResponse: string | null;
  status: string;
  createdAt: string;
  deadlineAt: string;
  respondedAt: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
}

interface RecentActivityData {
  reviews: { reviewerName: string; exam: string | null; rating: number; quote: string; date: string }[];
  vouches: { voucherName: string; date: string }[];
  inquiries: { studentName: string | null; date: string }[];
}

interface SuperAdminDashboardProps {
  stats: AdminStats;
  funnel: AdminFunnel;
  tutors: AdminTutor[];
  locations: string[];
  exams: string[];
  reviewReports: ReviewReport[];
  recentActivity: Record<string, RecentActivityData>;
}

interface Toast {
  id: string;
  message: string;
  type: "success" | "error";
}

type ModalState =
  | null
  | { type: "userDetail"; tutor: AdminTutor }
  | { type: "changeEmail"; tutor: AdminTutor }
  | { type: "resetPassword"; tutor: AdminTutor }
  | { type: "suspend"; tutor: AdminTutor }
  | { type: "delete"; tutor: AdminTutor }
  | { type: "bulkDelete"; tutors: AdminTutor[] }
  | { type: "bulkSuspend"; tutors: AdminTutor[] };

const STATUSES = ["All", "Active", "Inactive", "Incomplete", "Suspended"];

const Icon = ({ name, size = 16, ...props }: { name: string; size?: number; [key: string]: unknown }) => {
  const paths: Record<string, React.ReactNode> = {
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    trendUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    arrowUp: <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>,
    arrowDown: <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>,
    ext: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    flag: <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
    clock: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
    check: <polyline points="20 6 9 17 4 12" />,
    x: <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>,
    mail: <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>,
    trash: <><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>,
    key: <><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" /></>,
    moreVertical: <><circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" /></>,
    ban: <><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    link2: <><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" /><line x1="8" y1="12" x2="16" y2="12" /></>,
    mapPin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
    briefcase: <><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></>,
  };
  const fill = name === "star" ? "currentColor" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
};

function isLight(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

// ─── STAT CARD ──────────────────────────────────────────
function StatCard({ label, value, change, icon, color }: { label: string; value: number | string; change?: number; icon: string; color?: string }) {
  const isPositive = (change ?? 0) > 0;
  return (
    <div style={{ background: "white", borderRadius: 14, padding: "18px 20px", border: "1px solid #f3f4f6", flex: 1, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: 10, background: color || "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={icon} size={16} style={{ color: "white" }} />
        </div>
        {change !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 12, fontWeight: 600, color: isPositive ? "#059669" : "#dc2626" }}>
            <Icon name={isPositive ? "arrowUp" : "arrowDown"} size={11} />
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p style={{ fontSize: 26, fontWeight: 800, color: "#111", margin: "0 0 2px", letterSpacing: "-0.02em" }}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p style={{ fontSize: 12.5, color: "#9ca3af", margin: 0 }}>{label}</p>
    </div>
  );
}

// ─── FUNNEL BAR ─────────────────────────────────────────
function FunnelStep({ label, count, total, color }: { label: string; count: number; total: number; color?: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#111" }}>{count}</span>
      </div>
      <div style={{ height: 6, background: "#f3f4f6", borderRadius: 3 }}>
        <div style={{ height: 6, background: color || "#111", borderRadius: 3, width: `${pct}%`, transition: "width 0.3s ease" }} />
      </div>
      <p style={{ fontSize: 11, color: "#9ca3af", margin: "3px 0 0" }}>{pct}% of signups</p>
    </div>
  );
}

// ─── STATUS BADGE ───────────────────────────────────────
function StatusBadge({ status, suspended }: { status: string; suspended?: boolean }) {
  if (suspended) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: "#fef2f2", fontSize: 11.5, fontWeight: 600, color: "#dc2626" }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#dc2626" }} />Suspended
      </span>
    );
  }
  const config: Record<string, { color: string; bg: string; label: string }> = {
    active: { color: "#059669", bg: "#ecfdf5", label: "Active" },
    inactive: { color: "#d97706", bg: "#fffbeb", label: "Inactive" },
    incomplete: { color: "#9ca3af", bg: "#f3f4f6", label: "Incomplete" },
  };
  const c = config[status] || config.incomplete;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: c.bg, fontSize: 11.5, fontWeight: 600, color: c.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />{c.label}
    </span>
  );
}

// ─── DROPDOWN ───────────────────────────────────────────
function Dropdown({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{
        padding: "8px 32px 8px 12px", borderRadius: 10, border: "1.5px solid #e5e7eb",
        fontSize: 13, fontWeight: 500, color: "#374151", background: "white",
        outline: "none", fontFamily: "'DM Sans', sans-serif",
        appearance: "none", cursor: "pointer",
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%239ca3af' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
      }}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ─── REPORT STATUS BADGE ────────────────────────────────
function ReportStatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: "#d97706", bg: "#fffbeb", label: "Pending" },
    responded: { color: "#0284c7", bg: "#f0f9ff", label: "Responded" },
    revoked: { color: "#dc2626", bg: "#fef2f2", label: "Revoked" },
    denied: { color: "#6b7280", bg: "#f3f4f6", label: "Denied" },
  };
  const c = config[status] || config.pending;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: c.bg, fontSize: 11.5, fontWeight: 600, color: c.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />{c.label}
    </span>
  );
}

// ─── MODAL OVERLAY ──────────────────────────────────────
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 18, maxWidth: 560, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        {children}
      </div>
    </div>
  );
}

// ─── TOAST CONTAINER ────────────────────────────────────
function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div style={{ position: "fixed", top: 72, right: 16, zIndex: 2000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div key={t.id} onClick={() => onDismiss(t.id)} style={{
          padding: "12px 20px", borderRadius: 12, background: t.type === "success" ? "#059669" : "#dc2626",
          color: "white", fontSize: 13, fontWeight: 600, cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)", maxWidth: 320, fontFamily: "'DM Sans', sans-serif",
          animation: "slideIn 0.2s ease",
        }}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────
export default function SuperAdminDashboard({ stats, funnel, tutors: initialTutors, locations, exams, reviewReports, recentActivity }: SuperAdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "reports">("dashboard");
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [examFilter, setExamFilter] = useState("All exams");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<string>("inquiries");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [isMobile, setIsMobile] = useState(false);
  const [reportActions, setReportActions] = useState<Record<string, string>>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [tutors, setTutors] = useState(initialTutors);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ck = () => setIsMobile(window.innerWidth < 900);
    ck();
    window.addEventListener("resize", ck);
    return () => window.removeEventListener("resize", ck);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!openMenuId) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openMenuId]);

  const addToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleSort = (key: string) => {
    if (sortKey === key) { setSortDir(sortDir === "desc" ? "asc" : "desc"); }
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = tutors
    .filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.headline.toLowerCase().includes(search.toLowerCase()) && !t.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (locationFilter !== "All locations" && t.location !== locationFilter) return false;
      if (examFilter !== "All exams" && !t.specialties.includes(examFilter)) return false;
      if (statusFilter === "Suspended" && !t.isSuspended) return false;
      else if (statusFilter !== "All" && statusFilter !== "Suspended" && t.status !== statusFilter.toLowerCase()) return false;
      return true;
    })
    .sort((a, b) => {
      const m = sortDir === "desc" ? -1 : 1;
      const av = (a as unknown as Record<string, number>)[sortKey] ?? 0;
      const bv = (b as unknown as Record<string, number>)[sortKey] ?? 0;
      return (av - bv) * m;
    });

  const allFilteredSelected = filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const SortHeader = ({ label, sortField, width }: { label: string; sortField: string; width?: number | string }) => (
    <th onClick={() => toggleSort(sortField)} style={{
      padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600,
      letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af",
      cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", width,
      borderBottom: "1px solid #f3f4f6",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
        {label}
        {sortKey === sortField && <Icon name={sortDir === "desc" ? "arrowDown" : "arrowUp"} size={10} style={{ color: "#6b7280" }} />}
      </div>
    </th>
  );

  const wkChange = (curr: number, prev: number) => prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 100);
  const endToEnd = funnel.signedUp > 0 ? Math.round((funnel.firstInquiry / funnel.signedUp) * 100) : 0;
  const pendingReports = reviewReports.filter(r => (reportActions[r.id] || r.status) === "pending" || (reportActions[r.id] || r.status) === "responded").length;

  const handleResolve = async (reportId: string, action: "revoke" | "deny") => {
    setActionLoading(reportId);
    try {
      const res = await fetch("/api/admin/review-reports/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, action }),
      });
      if (res.ok) {
        setReportActions(prev => ({ ...prev, [reportId]: action === "revoke" ? "revoked" : "denied" }));
        addToast(action === "revoke" ? "Review revoked" : "Report denied");
      }
    } catch {
      addToast("Failed to resolve report", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // ─── API action handlers ───────────────────────────────
  const handleDeleteUser = async (tutor: AdminTutor) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tutor.userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTutors((prev) => prev.filter((t) => t.id !== tutor.id));
      setSelectedIds((prev) => { const next = new Set(prev); next.delete(tutor.id); return next; });
      setModal(null);
      addToast(`${tutor.name}'s account deleted`);
    } catch (err) {
      addToast(`Failed to delete: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    }
  };

  const handleUpdateEmail = async (tutor: AdminTutor, newEmail: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tutor.userId, email: newEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTutors((prev) => prev.map((t) => t.id === tutor.id ? { ...t, email: newEmail } : t));
      setModal(null);
      addToast(`Email updated for ${tutor.name}`);
    } catch (err) {
      addToast(`Failed to update email: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    }
  };

  const handleResetPassword = async (tutor: AdminTutor, newPassword: string) => {
    try {
      const res = await fetch("/api/admin/users/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tutor.userId, password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setModal(null);
      addToast(`Password reset for ${tutor.name}`);
    } catch (err) {
      addToast(`Failed to reset password: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    }
  };

  const handleSuspendUser = async (tutor: AdminTutor) => {
    const action = tutor.isSuspended ? "unban" : "ban";
    try {
      const res = await fetch("/api/admin/users/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: tutor.userId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setTutors((prev) => prev.map((t) => t.id === tutor.id ? { ...t, isSuspended: !t.isSuspended } : t));
      setModal(null);
      addToast(action === "ban" ? `${tutor.name} suspended` : `${tutor.name} unsuspended`);
    } catch (err) {
      addToast(`Failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    }
  };

  const handleBulkDelete = async (tutorList: AdminTutor[]) => {
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: tutorList.map((t) => t.userId), action: "delete" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const deletedIds = new Set(tutorList.map((t) => t.id));
      setTutors((prev) => prev.filter((t) => !deletedIds.has(t.id)));
      setSelectedIds(new Set());
      setModal(null);
      addToast(`${data.succeeded} accounts deleted${data.failed > 0 ? `, ${data.failed} failed` : ""}`);
    } catch (err) {
      addToast(`Bulk delete failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    }
  };

  const handleBulkSuspend = async (tutorList: AdminTutor[]) => {
    try {
      const res = await fetch("/api/admin/users/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userIds: tutorList.map((t) => t.userId), action: "suspend" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const suspendedIds = new Set(tutorList.map((t) => t.id));
      setTutors((prev) => prev.map((t) => suspendedIds.has(t.id) ? { ...t, isSuspended: true } : t));
      setSelectedIds(new Set());
      setModal(null);
      addToast(`${data.succeeded} accounts suspended`);
    } catch (err) {
      addToast(`Bulk suspend failed: ${err instanceof Error ? err.message : "Unknown error"}`, "error");
    }
  };

  const exportCsv = () => {
    const headers = ["Name", "Email", "Location", "Status", "Reviews", "Vouches", "Badges", "Inquiries", "Views", "Unique Visitors", "Joined", "Slug"];
    const rows = filtered.map((t) => [
      t.name, t.email, t.location, t.isSuspended ? "Suspended" : t.status,
      t.reviews, t.vouches, t.badges, t.inquiries, t.views, t.uniqueVisitors,
      new Date(t.joined).toLocaleDateString("en-US"), t.slug,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tutorcard-tutors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    addToast(`Exported ${filtered.length} tutors`);
  };

  // ─── 3-dot menu items ─────────────────────────────────
  const menuItems = (tutor: AdminTutor) => [
    { label: "View Profile", icon: "ext", onClick: () => { window.open(`/${tutor.slug}`, "_blank"); setOpenMenuId(null); } },
    { label: "Change Email", icon: "mail", onClick: () => { setModal({ type: "changeEmail", tutor }); setOpenMenuId(null); } },
    { label: "Reset Password", icon: "key", onClick: () => { setModal({ type: "resetPassword", tutor }); setOpenMenuId(null); } },
    { label: tutor.isSuspended ? "Unsuspend" : "Suspend", icon: "ban", onClick: () => { setModal({ type: "suspend", tutor }); setOpenMenuId(null); } },
    { label: "Delete Account", icon: "trash", color: "#dc2626", onClick: () => { setModal({ type: "delete", tutor }); setOpenMenuId(null); } },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        table { border-collapse: collapse; width: 100%; }
        .row-hover:hover { background: #fafafa !important; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .menu-item:hover { background: #f3f4f6 !important; }
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      <div style={{ minHeight: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f5f5f4" }}>
        {/* Header */}
        <header style={{ background: "white", borderBottom: "1px solid #f3f4f6", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>tc</span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>tutorcard</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", background: "#f3f4f6", padding: "2px 8px", borderRadius: 5, marginLeft: 4 }}>ADMIN</span>
          </div>
        </header>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 16px 40px" : "32px 32px 60px" }}>
          {/* Page title */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 4px" }}>Admin</h1>
            <p style={{ fontSize: 15, color: "#9ca3af", margin: 0 }}>Platform overview and tutor management.</p>
          </div>

          {/* Tab bar */}
          <div style={{ display: "flex", gap: 2, borderBottom: "1px solid #e5e7eb", marginBottom: 24 }}>
            {([
              { key: "dashboard" as const, label: "Dashboard", icon: "activity" },
              { key: "reports" as const, label: "Review Reports", icon: "flag", badge: pendingReports },
            ]).map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
                padding: "10px 18px", border: "none", background: "none",
                borderBottom: activeTab === t.key ? "2px solid #111" : "2px solid transparent",
                color: activeTab === t.key ? "#111" : "#9ca3af",
                fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                display: "flex", alignItems: "center", gap: 6, marginBottom: -1,
              }}>
                <Icon name={t.icon} size={14} />{t.label}
                {t.badge ? (
                  <span style={{ background: "#dc2626", color: "white", fontSize: 10, fontWeight: 700, width: 18, height: 18, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{t.badge}</span>
                ) : null}
              </button>
            ))}
          </div>

          {activeTab === "dashboard" && (<>
          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <StatCard label="Total tutors" value={stats.totalTutors} change={wkChange(stats.signupsThisWeek, stats.signupsLastWeek)} icon="users" color="#4f46e5" />
            <StatCard label="Total reviews" value={stats.totalReviews} change={wkChange(stats.reviewsThisWeek, stats.reviewsLastWeek)} icon="star" color="#f59e0b" />
            <StatCard label="Total vouches" value={stats.totalVouches} change={wkChange(stats.vouchesThisWeek, stats.vouchesLastWeek)} icon="shield" color="#0d9488" />
            <StatCard label="Inquiries" value={stats.totalInquiries} change={wkChange(stats.inquiriesThisWeek, stats.inquiriesLastWeek)} icon="inbox" color="#059669" />
            <StatCard label="Card views" value={stats.totalCardViews} change={wkChange(stats.viewsThisWeek, stats.viewsLastWeek)} icon="trendUp" color="#7c3aed" />
            {pendingReports > 0 && <StatCard label="Pending reports" value={pendingReports} icon="flag" color="#dc2626" />}
          </div>

          {/* Activation funnel */}
          <div style={{ background: "white", borderRadius: 16, padding: "22px 24px", border: "1px solid #f3f4f6", marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: "0 0 2px" }}>Activation funnel</h3>
                <p style={{ fontSize: 12.5, color: "#9ca3af", margin: 0 }}>How tutors progress from signup to first inquiry.</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 8, background: "#f3f4f6" }}>
                <Icon name="activity" size={13} style={{ color: "#6b7280" }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{endToEnd}% end-to-end</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <FunnelStep label="Signed up" count={funnel.signedUp} total={funnel.signedUp} color="#111" />
              <FunnelStep label="Card complete" count={funnel.cardComplete} total={funnel.signedUp} color="#374151" />
              <FunnelStep label="Got first review" count={funnel.firstReviewReceived} total={funnel.signedUp} color="#0284c7" />
              <FunnelStep label="Got first vouch" count={funnel.firstVouchReceived} total={funnel.signedUp} color="#0d9488" />
              <FunnelStep label="Got first inquiry" count={funnel.firstInquiry} total={funnel.signedUp} color="#059669" />
            </div>
          </div>

          {/* Tutor directory */}
          <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", overflow: "hidden" }}>
            {/* Toolbar */}
            <div style={{ padding: "18px 24px", borderBottom: "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0 }}>
                  Tutors <span style={{ fontWeight: 500, color: "#9ca3af" }}>({filtered.length})</span>
                </h3>
                <button onClick={exportCsv} style={{
                  display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10,
                  border: "1px solid #e5e7eb", background: "white", color: "#374151",
                  fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                }}>
                  <Icon name="download" size={13} />Export CSV
                </button>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                <div style={{ position: "relative", flex: "1 1 200px", maxWidth: 280 }}>
                  <Icon name="search" size={15} style={{ position: "absolute", left: 12, top: 10, color: "#9ca3af" }} />
                  <input value={search} onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search tutors..."
                    style={{
                      width: "100%", padding: "8px 12px 8px 36px", borderRadius: 10,
                      border: "1.5px solid #e5e7eb", fontSize: 13, color: "#111",
                      outline: "none", background: "white", fontFamily: "'DM Sans', sans-serif",
                    }}
                    onFocus={(e) => { e.target.style.borderColor = "#111"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }} />
                </div>
                <Dropdown value={locationFilter} options={["All locations", ...locations]} onChange={setLocationFilter} />
                <Dropdown value={examFilter} options={["All exams", ...exams]} onChange={setExamFilter} />
                <Dropdown value={statusFilter} options={STATUSES} onChange={setStatusFilter} />
              </div>
            </div>

            {/* Table */}
            <div className="hide-scrollbar" style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th style={{ padding: "10px 8px 10px 24px", textAlign: "left", borderBottom: "1px solid #f3f4f6", width: 32 }}>
                      <input type="checkbox" checked={allFilteredSelected && filtered.length > 0} onChange={toggleSelectAll}
                        style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#111" }} />
                    </th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6", minWidth: 180 }}>Tutor</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6", minWidth: 200 }}>Email</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6", minWidth: 120 }}>Location</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6" }}>Status</th>
                    <SortHeader label="Reviews" sortField="reviews" />
                    <SortHeader label="Vouches" sortField="vouches" />
                    <SortHeader label="Badges" sortField="badges" />
                    <SortHeader label="Inquiries" sortField="inquiries" />
                    <SortHeader label="Views" sortField="views" />
                    <SortHeader label="Unique" sortField="uniqueVisitors" />
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6", minWidth: 100 }}>Joined</th>
                    <th style={{ padding: "10px 24px 10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6", width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="row-hover" style={{ cursor: "pointer", transition: "background 0.1s", background: selectedIds.has(t.id) ? "#f0f9ff" : undefined }}
                      onClick={() => setModal({ type: "userDetail", tutor: t })}>
                      <td style={{ padding: "14px 8px 14px 24px", borderBottom: "1px solid #f9fafb" }} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={selectedIds.has(t.id)} onChange={() => toggleSelect(t.id)}
                          style={{ width: 15, height: 15, cursor: "pointer", accentColor: "#111" }} />
                      </td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: t.avatarColor || "#111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 12, color: isLight(t.avatarColor || "#111") ? "#111" : "white", fontWeight: 600 }}>{t.name.split(" ").map((w) => w[0]).join("")}</span>
                          </div>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: "#111", margin: 0, lineHeight: 1.3 }}>{t.name}</p>
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#6b7280" }}>{t.email}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#6b7280" }}>{t.location}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb" }}><StatusBadge status={t.status} suspended={t.isSuspended} /></td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.reviews}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.vouches}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.badges}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.inquiries}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.views}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.uniqueVisitors}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 12.5, color: "#9ca3af" }}>{new Date(t.joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td style={{ padding: "14px 24px 14px 12px", borderBottom: "1px solid #f9fafb", position: "relative" }} onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => setOpenMenuId(openMenuId === t.id ? null : t.id)} style={{
                          background: openMenuId === t.id ? "#f3f4f6" : "none", border: "none", color: "#9ca3af",
                          cursor: "pointer", padding: 4, display: "flex", borderRadius: 6,
                        }}>
                          <Icon name="moreVertical" size={16} />
                        </button>
                        {openMenuId === t.id && (
                          <div ref={menuRef} style={{
                            position: "absolute", right: 24, top: 44, background: "white", borderRadius: 12,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.12)", border: "1px solid #f3f4f6",
                            minWidth: 180, zIndex: 50, overflow: "hidden",
                          }}>
                            {menuItems(t).map((item, i) => (
                              <button key={i} className="menu-item" onClick={item.onClick} style={{
                                display: "flex", alignItems: "center", gap: 10, width: "100%",
                                padding: "10px 16px", border: "none", background: "none",
                                fontSize: 13, fontWeight: 500, color: item.color || "#374151",
                                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", textAlign: "left",
                                borderTop: i === menuItems(t).length - 1 ? "1px solid #f3f4f6" : "none",
                              }}>
                                <Icon name={item.icon} size={14} style={{ color: item.color || "#9ca3af" }} />{item.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filtered.length === 0 && (
              <div style={{ padding: "48px 24px", textAlign: "center" }}>
                <p style={{ fontSize: 14, color: "#9ca3af" }}>No tutors match your filters.</p>
              </div>
            )}
          </div>

          {/* Bulk action bar */}
          {selectedIds.size > 0 && (
            <div style={{
              position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
              background: "#111", color: "white", borderRadius: 14, padding: "12px 20px",
              display: "flex", alignItems: "center", gap: 16, boxShadow: "0 8px 30px rgba(0,0,0,0.2)",
              zIndex: 200, fontFamily: "'DM Sans', sans-serif",
            }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{selectedIds.size} selected</span>
              <button onClick={() => {
                const selected = tutors.filter((t) => selectedIds.has(t.id));
                setModal({ type: "bulkSuspend", tutors: selected });
              }} style={{
                padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent", color: "white", fontSize: 12.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5,
              }}>
                <Icon name="ban" size={12} />Suspend
              </button>
              <button onClick={() => {
                const selected = tutors.filter((t) => selectedIds.has(t.id));
                setModal({ type: "bulkDelete", tutors: selected });
              }} style={{
                padding: "7px 14px", borderRadius: 8, border: "none",
                background: "#dc2626", color: "white", fontSize: 12.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5,
              }}>
                <Icon name="trash" size={12} />Delete
              </button>
              <button onClick={() => setSelectedIds(new Set())} style={{
                padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)",
                background: "transparent", color: "#9ca3af", fontSize: 12.5, fontWeight: 600,
                cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
              }}>
                Clear
              </button>
            </div>
          )}
          </>)}

          {activeTab === "reports" && (
            <div style={{ background: "white", borderRadius: 16, border: "1px solid #f3f4f6", overflow: "hidden" }}>
              <div style={{ padding: "18px 24px", borderBottom: "1px solid #f3f4f6" }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111", margin: 0 }}>
                  Review Reports <span style={{ fontWeight: 500, color: "#9ca3af" }}>({reviewReports.length})</span>
                </h3>
                <p style={{ fontSize: 12.5, color: "#9ca3af", margin: "4px 0 0" }}>Review flagged reviews and take action.</p>
              </div>

              {reviewReports.length === 0 ? (
                <div style={{ padding: "48px 24px", textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <Icon name="flag" size={22} style={{ color: "#d1d5db" }} />
                  </div>
                  <p style={{ fontSize: 14, color: "#9ca3af" }}>No review reports yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {reviewReports.map((report) => {
                    const currentStatus = reportActions[report.id] || report.status;
                    const isActionable = currentStatus === "pending" || currentStatus === "responded";
                    const isExpired = new Date(report.deadlineAt) < new Date();

                    return (
                      <div key={report.id} style={{ padding: "20px 24px", borderBottom: "1px solid #f9fafb" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111" }}>{report.tutorName}</span>
                              <span style={{ fontSize: 12, color: "#d1d5db" }}>reported</span>
                              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111" }}>{report.reviewerName}</span>
                              <ReportStatusBadge status={currentStatus} />
                              {report.reviewExam && (
                                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4 }}>{report.reviewExam}</span>
                              )}
                            </div>
                            <div style={{ background: "#fafafa", borderRadius: 10, padding: "10px 14px", border: "1px solid #f0f0f0", marginBottom: 10 }}>
                              <p style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>&ldquo;{report.reviewQuote.slice(0, 200)}{report.reviewQuote.length > 200 ? "..." : ""}&rdquo;</p>
                            </div>
                            <div style={{ marginBottom: 10 }}>
                              <p style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Report reason</p>
                              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0 }}>{report.reason}</p>
                            </div>
                            {report.reviewerResponse && (
                              <div style={{ marginBottom: 10 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "#0284c7", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Reviewer response</p>
                                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0 }}>{report.reviewerResponse}</p>
                              </div>
                            )}
                            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#9ca3af", flexWrap: "wrap" }}>
                              <span>Reported {new Date(report.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                              {currentStatus === "pending" && (
                                <span style={{ color: isExpired ? "#dc2626" : "#d97706" }}>
                                  <Icon name="clock" size={11} style={{ verticalAlign: "-1px", marginRight: 3 }} />
                                  {isExpired ? "Expired" : `Deadline: ${new Date(report.deadlineAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
                                </span>
                              )}
                              {report.respondedAt && (
                                <span>Responded {new Date(report.respondedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                              )}
                              {report.resolvedBy && (
                                <span>Resolved by {report.resolvedBy}</span>
                              )}
                            </div>
                          </div>
                          {isActionable && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                              <button onClick={() => handleResolve(report.id, "revoke")} disabled={actionLoading === report.id}
                                style={{ padding: "8px 16px", borderRadius: 10, border: "none", background: "#dc2626", color: "white", fontSize: 12.5, fontWeight: 600, cursor: actionLoading === report.id ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", opacity: actionLoading === report.id ? 0.6 : 1 }}>
                                <Icon name="x" size={12} />Revoke Review
                              </button>
                              <button onClick={() => handleResolve(report.id, "deny")} disabled={actionLoading === report.id}
                                style={{ padding: "8px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", color: "#374151", fontSize: 12.5, fontWeight: 600, cursor: actionLoading === report.id ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", opacity: actionLoading === report.id ? 0.6 : 1 }}>
                                <Icon name="check" size={12} />Deny Report
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── USER DETAIL POPUP ──────────────────────────── */}
      {modal?.type === "userDetail" && (() => {
        const t = modal.tutor;
        const activity = recentActivity[t.id];
        return (
          <div onClick={() => setModal(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
            <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: 18, maxWidth: 640, width: "100%", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
              {/* Header */}
              <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #f3f4f6" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 52, height: 52, borderRadius: "50%", background: t.avatarColor || "#111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span style={{ fontSize: 18, color: isLight(t.avatarColor || "#111") ? "#111" : "white", fontWeight: 700 }}>{t.name.split(" ").map((w) => w[0]).join("")}</span>
                    </div>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: 0 }}>{t.name}</h2>
                      <p style={{ fontSize: 13, color: "#9ca3af", margin: "2px 0 0" }}>{t.headline || "No headline"}</p>
                    </div>
                  </div>
                  <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}>
                    <Icon name="x" size={16} />
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <StatusBadge status={t.status} suspended={t.isSuspended} />
                  <span style={{ fontSize: 12, color: "#d1d5db" }}>|</span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Joined {new Date(t.joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, padding: "8px 12px", background: "#f9fafb", borderRadius: 8 }}>
                  <Icon name="mail" size={14} style={{ color: "#6b7280", flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: "#374151", fontWeight: 500, userSelect: "all" }}>{t.email}</span>
                </div>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: 1, background: "#f3f4f6", padding: "0" }}>
                {[
                  { label: "Reviews", value: t.reviews, icon: "star" },
                  { label: "Vouches", value: t.vouches, icon: "shield" },
                  { label: "Badges", value: t.badges, icon: "award" },
                  { label: "Inquiries", value: t.inquiries, icon: "inbox" },
                  { label: "Views", value: t.views, icon: "trendUp" },
                  { label: "Unique", value: t.uniqueVisitors, icon: "trendUp" },
                ].map((s) => (
                  <div key={s.label} style={{ flex: 1, background: "white", padding: "14px 16px", textAlign: "center" }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: "#111", margin: "0 0 2px" }}>{s.value}</p>
                    <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Details */}
              <div style={{ padding: "20px 28px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 24px", marginBottom: 20 }}>
                  {t.slug && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Profile</p>
                      <Link href={`/${t.slug}`} target="_blank" style={{ fontSize: 13, color: "#0284c7", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
                        /{t.slug} <Icon name="ext" size={11} />
                      </Link>
                    </div>
                  )}
                  {t.businessName && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Business</p>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{t.businessName}</p>
                    </div>
                  )}
                  {t.yearsExperience && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Experience</p>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{t.yearsExperience} years</p>
                    </div>
                  )}
                  {t.allLocations.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Locations</p>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{t.allLocations.join(", ")}</p>
                    </div>
                  )}
                  {t.specialties.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Exams</p>
                      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {t.specialties.map((e) => (
                          <span key={e} style={{ fontSize: 11, fontWeight: 600, color: "#6b7280", background: "#f3f4f6", padding: "2px 8px", borderRadius: 4 }}>{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {t.subjects.length > 0 && (
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.04em", margin: "0 0 4px" }}>Subjects</p>
                      <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>{t.subjects.join(", ")}</p>
                    </div>
                  )}
                </div>

                {/* Recent Activity */}
                {activity && (
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#111", margin: "0 0 10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Recent Activity</p>
                    {activity.reviews.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#f59e0b", margin: "0 0 6px" }}>REVIEWS</p>
                        {activity.reviews.map((r, i) => (
                          <div key={i} style={{ padding: "8px 0", borderBottom: i < activity.reviews.length - 1 ? "1px solid #f9fafb" : "none", display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ display: "flex", gap: 1, flexShrink: 0 }}>
                              {[1,2,3,4,5].map((s) => <Icon key={s} name="star" size={9} style={{ color: r.rating >= s ? "#f59e0b" : "#e5e7eb" }} />)}
                            </div>
                            <span style={{ fontSize: 12, color: "#374151", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.reviewerName}{r.exam ? ` · ${r.exam}` : ""}</span>
                            <span style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activity.vouches.length > 0 && (
                      <div style={{ marginBottom: 14 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#0d9488", margin: "0 0 6px" }}>VOUCHES</p>
                        {activity.vouches.map((v, i) => (
                          <div key={i} style={{ padding: "6px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, color: "#374151" }}>{v.voucherName}</span>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(v.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activity.inquiries.length > 0 && (
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: "#059669", margin: "0 0 6px" }}>INQUIRIES</p>
                        {activity.inquiries.map((inq, i) => (
                          <div key={i} style={{ padding: "6px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, color: "#374151" }}>{inq.studentName || "Anonymous"}</span>
                            <span style={{ fontSize: 11, color: "#9ca3af" }}>{new Date(inq.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {activity.reviews.length === 0 && activity.vouches.length === 0 && activity.inquiries.length === 0 && (
                      <p style={{ fontSize: 12, color: "#9ca3af", fontStyle: "italic" }}>No recent activity</p>
                    )}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div style={{ padding: "16px 28px 24px", borderTop: "1px solid #f3f4f6", display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Link href={`/${t.slug}`} target="_blank" style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", color: "#374151", fontSize: 12.5, fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", gap: 6, fontFamily: "'DM Sans', sans-serif" }}>
                  <Icon name="ext" size={13} />View Profile
                </Link>
                <button onClick={() => setModal({ type: "changeEmail", tutor: t })} style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", color: "#374151", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="mail" size={13} />Email
                </button>
                <button onClick={() => setModal({ type: "resetPassword", tutor: t })} style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", color: "#374151", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="key" size={13} />Password
                </button>
                <button onClick={() => setModal({ type: "suspend", tutor: t })} style={{ padding: "9px 16px", borderRadius: 10, border: "1px solid #e5e7eb", background: "white", color: t.isSuspended ? "#059669" : "#d97706", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                  <Icon name="ban" size={13} />{t.isSuspended ? "Unsuspend" : "Suspend"}
                </button>
                <button onClick={() => setModal({ type: "delete", tutor: t })} style={{ padding: "9px 16px", borderRadius: 10, border: "none", background: "#dc2626", color: "white", fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
                  <Icon name="trash" size={13} />Delete
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── CHANGE EMAIL MODAL ─────────────────────────── */}
      {modal?.type === "changeEmail" && (() => {
        const ChangeEmailInner = () => {
          const [email, setEmail] = useState(modal.tutor.email);
          const [loading, setLoading] = useState(false);
          const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email !== modal.tutor.email;
          return (
            <ModalOverlay onClose={() => setModal(null)}>
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#f0f9ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="mail" size={18} style={{ color: "#0284c7" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Change Email</h3>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{modal.tutor.name}</p>
                  </div>
                  <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><Icon name="x" size={15} /></button>
                </div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>New email address</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}
                  onFocus={(e) => { e.target.style.borderColor = "#111"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={async () => { setLoading(true); await handleUpdateEmail(modal.tutor, email); setLoading(false); }} disabled={!valid || loading}
                    style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: valid && !loading ? "#111" : "#e5e7eb", color: valid && !loading ? "white" : "#9ca3af", fontSize: 14, fontWeight: 600, cursor: valid && !loading ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif" }}>
                    {loading ? "Updating..." : "Update Email"}
                  </button>
                  <button onClick={() => setModal(null)} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #e5e7eb", background: "white", color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                </div>
              </div>
            </ModalOverlay>
          );
        };
        return <ChangeEmailInner />;
      })()}

      {/* ─── RESET PASSWORD MODAL ───────────────────────── */}
      {modal?.type === "resetPassword" && (() => {
        const ResetPasswordInner = () => {
          const [password, setPassword] = useState("");
          const [show, setShow] = useState(false);
          const [loading, setLoading] = useState(false);
          const valid = password.length >= 6;
          return (
            <ModalOverlay onClose={() => setModal(null)}>
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fefce8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="key" size={18} style={{ color: "#d97706" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Reset Password</h3>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{modal.tutor.name}</p>
                  </div>
                  <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><Icon name="x" size={15} /></button>
                </div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>New password</label>
                <div style={{ position: "relative", marginBottom: 6 }}>
                  <input value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"}
                    style={{ width: "100%", padding: "12px 44px 12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif" }}
                    onFocus={(e) => { e.target.style.borderColor = "#111"; }}
                    onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }} />
                  <button onClick={() => setShow(!show)} style={{ position: "absolute", right: 12, top: 12, background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}>
                    <Icon name={show ? "eye" : "eye"} size={16} />
                  </button>
                </div>
                <p style={{ fontSize: 12, color: password.length > 0 && password.length < 6 ? "#dc2626" : "#9ca3af", margin: "0 0 20px" }}>Minimum 6 characters</p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={async () => { setLoading(true); await handleResetPassword(modal.tutor, password); setLoading(false); }} disabled={!valid || loading}
                    style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: valid && !loading ? "#111" : "#e5e7eb", color: valid && !loading ? "white" : "#9ca3af", fontSize: 14, fontWeight: 600, cursor: valid && !loading ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif" }}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                  <button onClick={() => setModal(null)} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #e5e7eb", background: "white", color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                </div>
              </div>
            </ModalOverlay>
          );
        };
        return <ResetPasswordInner />;
      })()}

      {/* ─── SUSPEND MODAL ──────────────────────────────── */}
      {modal?.type === "suspend" && (() => {
        const t = modal.tutor;
        const isBanned = t.isSuspended;
        const SuspendInner = () => {
          const [loading, setLoading] = useState(false);
          return (
            <ModalOverlay onClose={() => setModal(null)}>
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: isBanned ? "#ecfdf5" : "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="ban" size={18} style={{ color: isBanned ? "#059669" : "#d97706" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>{isBanned ? "Unsuspend" : "Suspend"} Account</h3>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{t.name}</p>
                  </div>
                  <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><Icon name="x" size={15} /></button>
                </div>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 24 }}>
                  {isBanned
                    ? `This will restore ${t.name}'s ability to log in and access their account.`
                    : `This will prevent ${t.name} from logging in. Their profile and data will be preserved but they won't be able to access their account.`
                  }
                </p>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={async () => { setLoading(true); await handleSuspendUser(t); setLoading(false); }} disabled={loading}
                    style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: isBanned ? "#059669" : "#d97706", color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.6 : 1 }}>
                    {loading ? "Processing..." : isBanned ? "Unsuspend Account" : "Suspend Account"}
                  </button>
                  <button onClick={() => setModal(null)} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #e5e7eb", background: "white", color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                </div>
              </div>
            </ModalOverlay>
          );
        };
        return <SuspendInner />;
      })()}

      {/* ─── DELETE MODAL ───────────────────────────────── */}
      {modal?.type === "delete" && (() => {
        const t = modal.tutor;
        const DeleteInner = () => {
          const [confirm, setConfirm] = useState("");
          const [loading, setLoading] = useState(false);
          const confirmed = confirm === t.name;
          return (
            <ModalOverlay onClose={() => setModal(null)}>
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="trash" size={18} style={{ color: "#dc2626" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Delete Account</h3>
                    <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{t.name}</p>
                  </div>
                  <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><Icon name="x" size={15} /></button>
                </div>
                <div style={{ background: "#fef2f2", borderRadius: 12, padding: "14px 16px", marginBottom: 20 }}>
                  <p style={{ fontSize: 13, color: "#dc2626", lineHeight: 1.6, margin: 0 }}>
                    This will permanently delete <strong>{t.name}</strong>&apos;s account and all associated data including reviews, vouches, badges, and inquiries. This action cannot be undone.
                  </p>
                </div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Type <strong>{t.name}</strong> to confirm</label>
                <input value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}
                  onFocus={(e) => { e.target.style.borderColor = "#dc2626"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={async () => { setLoading(true); await handleDeleteUser(t); setLoading(false); }} disabled={!confirmed || loading}
                    style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: confirmed && !loading ? "#dc2626" : "#e5e7eb", color: confirmed && !loading ? "white" : "#9ca3af", fontSize: 14, fontWeight: 600, cursor: confirmed && !loading ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif" }}>
                    {loading ? "Deleting..." : "Delete Account"}
                  </button>
                  <button onClick={() => setModal(null)} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #e5e7eb", background: "white", color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                </div>
              </div>
            </ModalOverlay>
          );
        };
        return <DeleteInner />;
      })()}

      {/* ─── BULK DELETE MODAL ──────────────────────────── */}
      {modal?.type === "bulkDelete" && (() => {
        const list = modal.tutors;
        const BulkDeleteInner = () => {
          const [confirm, setConfirm] = useState("");
          const [loading, setLoading] = useState(false);
          const target = `DELETE ${list.length}`;
          const confirmed = confirm === target;
          return (
            <ModalOverlay onClose={() => setModal(null)}>
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="trash" size={18} style={{ color: "#dc2626" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Delete {list.length} Accounts</h3>
                  </div>
                  <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><Icon name="x" size={15} /></button>
                </div>
                <div style={{ background: "#fef2f2", borderRadius: 12, padding: "14px 16px", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "#dc2626", lineHeight: 1.6, margin: 0 }}>
                    You are about to permanently delete <strong>{list.length}</strong> accounts and all associated data. This cannot be undone.
                  </p>
                </div>
                <div style={{ maxHeight: 120, overflow: "auto", marginBottom: 16 }}>
                  {list.map((t) => (
                    <p key={t.id} style={{ fontSize: 12, color: "#374151", margin: "2px 0" }}>{t.name} ({t.email})</p>
                  ))}
                </div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Type <strong>{target}</strong> to confirm</label>
                <input value={confirm} onChange={(e) => setConfirm(e.target.value)} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid #e5e7eb", fontSize: 14, color: "#111", outline: "none", boxSizing: "border-box", fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}
                  onFocus={(e) => { e.target.style.borderColor = "#dc2626"; }}
                  onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={async () => { setLoading(true); await handleBulkDelete(list); setLoading(false); }} disabled={!confirmed || loading}
                    style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: confirmed && !loading ? "#dc2626" : "#e5e7eb", color: confirmed && !loading ? "white" : "#9ca3af", fontSize: 14, fontWeight: 600, cursor: confirmed && !loading ? "pointer" : "default", fontFamily: "'DM Sans', sans-serif" }}>
                    {loading ? "Deleting..." : `Delete ${list.length} Accounts`}
                  </button>
                  <button onClick={() => setModal(null)} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #e5e7eb", background: "white", color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                </div>
              </div>
            </ModalOverlay>
          );
        };
        return <BulkDeleteInner />;
      })()}

      {/* ─── BULK SUSPEND MODAL ─────────────────────────── */}
      {modal?.type === "bulkSuspend" && (() => {
        const list = modal.tutors;
        const BulkSuspendInner = () => {
          const [loading, setLoading] = useState(false);
          return (
            <ModalOverlay onClose={() => setModal(null)}>
              <div style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "#fffbeb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name="ban" size={18} style={{ color: "#d97706" }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#111", margin: 0 }}>Suspend {list.length} Accounts</h3>
                  </div>
                  <button onClick={() => setModal(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#6b7280" }}><Icon name="x" size={15} /></button>
                </div>
                <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>
                  This will suspend {list.length} accounts. Users will not be able to log in but their data will be preserved.
                </p>
                <div style={{ maxHeight: 120, overflow: "auto", marginBottom: 20 }}>
                  {list.map((t) => (
                    <p key={t.id} style={{ fontSize: 12, color: "#374151", margin: "2px 0" }}>{t.name} ({t.email})</p>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={async () => { setLoading(true); await handleBulkSuspend(list); setLoading(false); }} disabled={loading}
                    style={{ padding: "12px 24px", borderRadius: 12, border: "none", background: loading ? "#e5e7eb" : "#d97706", color: "white", fontSize: 14, fontWeight: 600, cursor: loading ? "default" : "pointer", fontFamily: "'DM Sans', sans-serif", opacity: loading ? 0.6 : 1 }}>
                    {loading ? "Suspending..." : `Suspend ${list.length} Accounts`}
                  </button>
                  <button onClick={() => setModal(null)} style={{ padding: "12px 20px", borderRadius: 12, border: "1px solid #e5e7eb", background: "white", color: "#9ca3af", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>Cancel</button>
                </div>
              </div>
            </ModalOverlay>
          );
        };
        return <BulkSuspendInner />;
      })()}
    </>
  );
}
