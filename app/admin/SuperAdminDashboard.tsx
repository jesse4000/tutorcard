"use client";

import { useState, useEffect } from "react";

// ─── MOCK DATA ──────────────────────────────────────────
const STATS = {
  totalTutors: 847,
  activeLast30: 412,
  totalReviews: 2341,
  totalVouches: 1893,
  totalInquiries: 5620,
  totalCardViews: 48200,
  signupsThisWeek: 34,
  signupsLastWeek: 28,
  reviewsThisWeek: 89,
  reviewsLastWeek: 71,
  vouchesThisWeek: 64,
  vouchesLastWeek: 52,
  inquiriesThisWeek: 218,
  inquiriesLastWeek: 191,
};

const FUNNEL = {
  signedUp: 847,
  cardComplete: 623,
  firstReviewSent: 389,
  firstReviewReceived: 284,
  firstVouchSent: 341,
  firstVouchReceived: 298,
  firstInquiry: 196,
};

const LOCATIONS = ["All locations", "New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Boston, MA", "San Francisco, CA", "Miami, FL", "Seattle, WA", "Austin, TX", "Denver, CO"];
const EXAMS = ["All exams", "SAT Math", "SAT R&W", "ACT", "AP Calculus", "AP Chemistry", "ISEE", "SSAT", "SHSAT", "GRE", "GMAT", "MCAT", "PANCE"];
const STATUSES = ["All", "Active", "Inactive", "Incomplete"];

const TUTORS = [
  { id: 1, name: "Sarah Mitchell", headline: "SAT & ACT Specialist", location: "New York, NY", specialties: ["SAT Math", "SAT R&W", "ACT", "AP Calculus"], reviews: 23, vouches: 14, badges: 3, inquiries: 87, cardViews: 1240, status: "active", joined: "2025-09-14", lastActive: "2026-03-10", cardComplete: true },
  { id: 2, name: "James Chen", headline: "SAT & GRE Specialist", location: "Boston, MA", specialties: ["SAT Math", "GRE"], reviews: 18, vouches: 11, badges: 2, inquiries: 62, cardViews: 890, status: "active", joined: "2025-10-02", lastActive: "2026-03-09", cardComplete: true },
  { id: 3, name: "Priya Patel", headline: "ISEE & SSAT Expert", location: "New York, NY", specialties: ["ISEE", "SSAT"], reviews: 31, vouches: 19, badges: 4, inquiries: 104, cardViews: 1560, status: "active", joined: "2025-08-21", lastActive: "2026-03-10", cardComplete: true },
  { id: 4, name: "Michael Torres", headline: "AP Math & Physics", location: "Los Angeles, CA", specialties: ["AP Calculus", "AP Chemistry"], reviews: 12, vouches: 8, badges: 1, inquiries: 34, cardViews: 520, status: "active", joined: "2025-11-15", lastActive: "2026-03-08", cardComplete: true },
  { id: 5, name: "Emily Nakamura", headline: "ACT Prep Coach", location: "San Francisco, CA", specialties: ["ACT"], reviews: 9, vouches: 6, badges: 1, inquiries: 28, cardViews: 410, status: "active", joined: "2025-12-01", lastActive: "2026-03-07", cardComplete: true },
  { id: 6, name: "Daniel Okafor", headline: "SAT Reading & Writing", location: "Chicago, IL", specialties: ["SAT R&W"], reviews: 7, vouches: 4, badges: 0, inquiries: 19, cardViews: 280, status: "active", joined: "2026-01-10", lastActive: "2026-03-06", cardComplete: true },
  { id: 7, name: "Rachel Kim", headline: "College Admissions", location: "New York, NY", specialties: ["SAT Math", "SAT R&W", "ACT"], reviews: 15, vouches: 9, badges: 2, inquiries: 53, cardViews: 760, status: "active", joined: "2025-10-18", lastActive: "2026-03-10", cardComplete: true },
  { id: 8, name: "Marcus Williams", headline: "MCAT Prep", location: "Houston, TX", specialties: ["MCAT"], reviews: 5, vouches: 3, badges: 1, inquiries: 15, cardViews: 190, status: "inactive", joined: "2025-11-22", lastActive: "2026-02-14", cardComplete: true },
  { id: 9, name: "Lisa Fernandez", headline: "Math Tutor", location: "Miami, FL", specialties: ["SAT Math", "AP Calculus"], reviews: 0, vouches: 0, badges: 0, inquiries: 0, cardViews: 12, status: "incomplete", joined: "2026-03-08", lastActive: "2026-03-08", cardComplete: false },
  { id: 10, name: "Andrew Park", headline: "Test Prep Coach", location: "Seattle, WA", specialties: ["SAT Math", "ACT", "ISEE"], reviews: 2, vouches: 1, badges: 0, inquiries: 8, cardViews: 95, status: "active", joined: "2026-02-15", lastActive: "2026-03-05", cardComplete: true },
  { id: 11, name: "Jasmine Howard", headline: "GMAT Specialist", location: "Austin, TX", specialties: ["GMAT", "GRE"], reviews: 11, vouches: 7, badges: 2, inquiries: 41, cardViews: 620, status: "active", joined: "2025-09-30", lastActive: "2026-03-09", cardComplete: true },
  { id: 12, name: "Robert Singh", headline: "PANCE Review", location: "Denver, CO", specialties: ["PANCE"], reviews: 8, vouches: 5, badges: 1, inquiries: 22, cardViews: 340, status: "inactive", joined: "2025-10-25", lastActive: "2026-01-30", cardComplete: true },
];

const Icon = ({ name, size = 16, ...props }: { name: string; size?: number; [key: string]: unknown }) => {
  const paths: Record<string, React.ReactNode> = {
    users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
    star: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />,
    trendUp: <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
    inbox: <><polyline points="22 12 16 12 14 15 10 15 8 12 2 12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
    award: <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    chevDown: <polyline points="6 9 12 15 18 9" />,
    arrowUp: <><line x1="12" y1="19" x2="12" y2="5" /><polyline points="5 12 12 5 19 12" /></>,
    arrowDown: <><line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" /></>,
    ext: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></>,
    filter: <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />,
    check: <polyline points="20 6 9 17 4 12" />,
    activity: <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    zap: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
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
  const pct = Math.round((count / total) * 100);
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
export default function SuperAdminDashboard() {
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("All locations");
  const [examFilter, setExamFilter] = useState("All exams");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState<string>("inquiries");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [isMobile, setIsMobile] = useState(false);

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

  const filtered = TUTORS
    .filter((t) => {
      if (search && !t.name.toLowerCase().includes(search.toLowerCase()) && !t.headline.toLowerCase().includes(search.toLowerCase())) return false;
      if (locationFilter !== "All locations" && t.location !== locationFilter) return false;
      if (examFilter !== "All exams" && !t.specialties.includes(examFilter)) return false;
      if (statusFilter !== "All" && t.status !== statusFilter.toLowerCase()) return false;
      return true;
    })
    .sort((a, b) => {
      const m = sortDir === "desc" ? -1 : 1;
      return ((a as Record<string, unknown>)[sortKey] as number - ((b as Record<string, unknown>)[sortKey] as number)) * m;
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
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 10, color: "white", fontWeight: 600 }}>JM</span>
            </div>
          </div>
        </header>

        <div style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "20px 16px 40px" : "32px 32px 60px" }}>
          {/* Page title */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: isMobile ? 24 : 30, fontWeight: 800, color: "#111", letterSpacing: "-0.02em", margin: "0 0 4px" }}>Dashboard</h1>
            <p style={{ fontSize: 15, color: "#9ca3af", margin: 0 }}>Platform overview and tutor management.</p>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
            <StatCard label="Total tutors" value={STATS.totalTutors} change={wkChange(STATS.signupsThisWeek, STATS.signupsLastWeek)} icon="users" color="#4f46e5" />
            <StatCard label="Total reviews" value={STATS.totalReviews} change={wkChange(STATS.reviewsThisWeek, STATS.reviewsLastWeek)} icon="star" color="#f59e0b" />
            <StatCard label="Total vouches" value={STATS.totalVouches} change={wkChange(STATS.vouchesThisWeek, STATS.vouchesLastWeek)} icon="shield" color="#0d9488" />
            <StatCard label="Inquiries" value={STATS.totalInquiries} change={wkChange(STATS.inquiriesThisWeek, STATS.inquiriesLastWeek)} icon="inbox" color="#059669" />
            <StatCard label="Card views" value={STATS.totalCardViews} icon="eye" color="#6b7280" />
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
                <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{Math.round((FUNNEL.firstInquiry / FUNNEL.signedUp) * 100)}% end-to-end</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <FunnelStep label="Signed up" count={FUNNEL.signedUp} total={FUNNEL.signedUp} color="#111" />
              <FunnelStep label="Card complete" count={FUNNEL.cardComplete} total={FUNNEL.signedUp} color="#374151" />
              <FunnelStep label="Sent review req" count={FUNNEL.firstReviewSent} total={FUNNEL.signedUp} color="#4f46e5" />
              <FunnelStep label="Got first review" count={FUNNEL.firstReviewReceived} total={FUNNEL.signedUp} color="#0284c7" />
              <FunnelStep label="Got first vouch" count={FUNNEL.firstVouchReceived} total={FUNNEL.signedUp} color="#0d9488" />
              <FunnelStep label="Got first inquiry" count={FUNNEL.firstInquiry} total={FUNNEL.signedUp} color="#059669" />
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
                <Dropdown value={locationFilter} options={LOCATIONS} onChange={setLocationFilter} />
                <Dropdown value={examFilter} options={EXAMS} onChange={setExamFilter} />
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
                    <SortHeader label="Card views" sortField="cardViews" />
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
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 13, color: "#6b7280" }}>{t.cardViews.toLocaleString()}</td>
                      <td style={{ padding: "14px 12px", borderBottom: "1px solid #f9fafb", fontSize: 12.5, color: "#9ca3af" }}>{new Date(t.joined).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                      <td style={{ padding: "14px 24px 14px 12px", borderBottom: "1px solid #f9fafb" }}>
                        <button style={{ background: "none", border: "none", color: "#d1d5db", cursor: "pointer", padding: 4, display: "flex" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#374151"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#d1d5db"; }}>
                          <Icon name="ext" size={14} />
                        </button>
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
        </div>
      </div>
    </>
  );
}
