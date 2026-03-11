"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ─── TYPES ──────────────────────────────────────────────
interface AdminStats {
  totalTutors: number;
  totalReviews: number;
  totalVouches: number;
  totalInquiries: number;
  signupsThisWeek: number;
  signupsLastWeek: number;
  reviewsThisWeek: number;
  reviewsLastWeek: number;
  vouchesThisWeek: number;
  vouchesLastWeek: number;
  inquiriesThisWeek: number;
  inquiriesLastWeek: number;
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
  name: string;
  headline: string;
  location: string;
  specialties: string[];
  reviews: number;
  vouches: number;
  badges: number;
  inquiries: number;
  status: "active" | "inactive" | "incomplete";
  joined: string;
  slug: string;
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

interface SuperAdminDashboardProps {
  stats: AdminStats;
  funnel: AdminFunnel;
  tutors: AdminTutor[];
  locations: string[];
  exams: string[];
  reviewReports: ReviewReport[];
}

const STATUSES = ["All", "Active", "Inactive", "Incomplete"];

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
  };
  const fill = name === "star" ? "currentColor" : "none";
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={fill === "none" ? "currentColor" : "none"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      {paths[name]}
    </svg>
  );
};

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

// ─── STATUS DOT ─────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { color: string; bg: string; label: string }> = {
    active: { color: "#059669", bg: "#ecfdf5", label: "Active" },
    inactive: { color: "#d97706", bg: "#fffbeb", label: "Inactive" },
    incomplete: { color: "#9ca3af", bg: "#f3f4f6", label: "Incomplete" },
  };
  const c = config[status] || config.incomplete;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 20, background: c.bg, fontSize: 11.5, fontWeight: 600, color: c.color }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />
      {c.label}
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

// ─── MAIN ───────────────────────────────────────────────
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
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color }} />
      {c.label}
    </span>
  );
}

export default function SuperAdminDashboard({ stats, funnel, tutors, locations, exams, reviewReports }: SuperAdminDashboardProps) {
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

  useEffect(() => {
    const ck = () => setIsMobile(window.innerWidth < 900);
    ck();
    window.addEventListener("resize", ck);
    return () => window.removeEventListener("resize", ck);
  }, []);

  const toggleSort = (key: string) => {
    if (sortKey === key) { setSortDir(sortDir === "desc" ? "asc" : "desc"); }
    else { setSortKey(key); setSortDir("desc"); }
  };

  const filtered = tutors
    .filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.headline.toLowerCase().includes(search.toLowerCase())) return false;
      if (locationFilter !== "All locations" && t.location !== locationFilter) return false;
      if (examFilter !== "All exams" && !t.specialties.includes(examFilter)) return false;
      if (statusFilter !== "All" && t.status !== statusFilter.toLowerCase()) return false;
      return true;
    })
    .sort((a, b) => {
      const m = sortDir === "desc" ? -1 : 1;
      const av = (a as unknown as Record<string, number>)[sortKey] ?? 0;
      const bv = (b as unknown as Record<string, number>)[sortKey] ?? 0;
      return (av - bv) * m;
    });

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
      }
    } catch {
      // Silently handle
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        table { border-collapse: collapse; width: 100%; }
        .row-hover:hover { background: #fafafa !important; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

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
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                {/* Search */}
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
                    <th style={{ padding: "10px 12px 10px 24px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6", minWidth: 220 }}>Tutor</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6", minWidth: 120 }}>Location</th>
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6" }}>Status</th>
                    <SortHeader label="Reviews" sortField="reviews" />
                    <SortHeader label="Vouches" sortField="vouches" />
                    <SortHeader label="Badges" sortField="badges" />
                    <SortHeader label="Inquiries" sortField="inquiries" />
                    <th style={{ padding: "10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6", minWidth: 100 }}>Joined</th>
                    <th style={{ padding: "10px 24px 10px 12px", textAlign: "left", fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #f3f4f6", width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="row-hover" style={{ cursor: "pointer", transition: "background 0.1s" }}>
                      <td style={{ padding: "14px 12px 14px 24px", borderBottom: "1px solid #f9fafb" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <span style={{ fontSize: 12, color: "white", fontWeight: 600 }}>{t.name.split(" ").map((w) => w[0]).join("")}</span>
                          </div>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: "#111", margin: 0, lineHeight: 1.3 }}>{t.name}</p>
                            <p style={{ fontSize: 11.5, color: "#9ca3af", margin: 0 }}>{t.headline}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#6b7280" }}>{t.location}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb" }}><StatusBadge status={t.status} /></td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.reviews}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.vouches}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.badges}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, fontWeight: 600, color: "#111" }}>{t.inquiries}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 12.5, color: "#9ca3af" }}>{new Date(t.joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td style={{ padding: "14px 24px 14px 12px", borderBottom: "1px solid #f9fafb" }}>
                        <Link href={`/${t.slug}`} target="_blank" style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", padding: 4, display: "flex" }}>
                          <Icon name="ext" size={14} />
                        </Link>
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
                          {/* Left: report info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {/* Header: tutor name, reviewer name, status */}
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111" }}>{report.tutorName}</span>
                              <span style={{ fontSize: 12, color: "#d1d5db" }}>reported</span>
                              <span style={{ fontSize: 13.5, fontWeight: 600, color: "#111" }}>{report.reviewerName}</span>
                              <ReportStatusBadge status={currentStatus} />
                              {report.reviewExam && (
                                <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#6b7280", background: "#e5e7eb", padding: "2px 7px", borderRadius: 4 }}>{report.reviewExam}</span>
                              )}
                            </div>

                            {/* Review quote */}
                            <div style={{ background: "#fafafa", borderRadius: 10, padding: "10px 14px", border: "1px solid #f0f0f0", marginBottom: 10 }}>
                              <p style={{ fontSize: 12.5, color: "#374151", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>&ldquo;{report.reviewQuote.slice(0, 200)}{report.reviewQuote.length > 200 ? "..." : ""}&rdquo;</p>
                            </div>

                            {/* Report reason */}
                            <div style={{ marginBottom: 10 }}>
                              <p style={{ fontSize: 11, fontWeight: 600, color: "#dc2626", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Report reason</p>
                              <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0 }}>{report.reason}</p>
                            </div>

                            {/* Reviewer response */}
                            {report.reviewerResponse && (
                              <div style={{ marginBottom: 10 }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: "#0284c7", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Reviewer response</p>
                                <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, margin: 0 }}>{report.reviewerResponse}</p>
                              </div>
                            )}

                            {/* Meta info */}
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

                          {/* Right: action buttons */}
                          {isActionable && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
                              <button
                                onClick={() => handleResolve(report.id, "revoke")}
                                disabled={actionLoading === report.id}
                                style={{
                                  padding: "8px 16px", borderRadius: 10, border: "none",
                                  background: "#dc2626", color: "white",
                                  fontSize: 12.5, fontWeight: 600, cursor: actionLoading === report.id ? "default" : "pointer",
                                  fontFamily: "'DM Sans', sans-serif",
                                  display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                                  opacity: actionLoading === report.id ? 0.6 : 1,
                                }}
                              >
                                <Icon name="x" size={12} />Revoke Review
                              </button>
                              <button
                                onClick={() => handleResolve(report.id, "deny")}
                                disabled={actionLoading === report.id}
                                style={{
                                  padding: "8px 16px", borderRadius: 10,
                                  border: "1px solid #e5e7eb", background: "white", color: "#374151",
                                  fontSize: 12.5, fontWeight: 600, cursor: actionLoading === report.id ? "default" : "pointer",
                                  fontFamily: "'DM Sans', sans-serif",
                                  display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                                  opacity: actionLoading === report.id ? 0.6 : 1,
                                }}
                              >
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
    </>
  );
}
