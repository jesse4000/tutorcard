"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import type { TutorLink } from "@/components/TutorCard";
import { containsProfanity } from "@/lib/profanityFilter";

// ─── TYPES ──────────────────────────────────────────────
interface TutorRow {
  id: string;
  first_name: string;
  last_name: string;
  title: string | null;
  slug: string;
  avatar_color: string;
  exams: string[];
  subjects: string[];
  locations: string[];
  links: TutorLink[];
  email: string;
  business_name: string | null;
  years_experience: number | null;
  profile_image_url: string | null;
}

interface EditLink {
  id: number;
  type: string;
  icon: string;
  label: string;
  value: string;
}

interface CardData {
  name: string;
  headline: string;
  location: string;
  remote: boolean;
  slug: string;
  imageUrl: string;
  specialties: string[];
  links: EditLink[];
}

// ─── CONSTANTS ──────────────────────────────────────────
const ACCENT_PRESETS = [
  "#4f46e5", "#111111", "#0284c7", "#0d9488", "#e11d48",
  "#7c3aed", "#ea580c", "#059669", "#d97706", "#6366f1",
];

const SPECIALTY_SUGGESTIONS = [
  "SAT Math", "SAT R&W", "ACT", "ISEE", "SSAT", "SHSAT", "HSPT",
  "AP Calculus", "AP Chemistry", "AP Physics", "AP Biology", "AP English",
  "GRE", "GMAT", "PANCE", "MCAT",
];

const CITIES = [
  // ── US Cities ──
  "New York, NY","Los Angeles, CA","Chicago, IL","Houston, TX","Phoenix, AZ","Philadelphia, PA","San Antonio, TX","San Diego, CA","Dallas, TX","San Jose, CA",
  "Austin, TX","Jacksonville, FL","Fort Worth, TX","Columbus, OH","Indianapolis, IN","Charlotte, NC","San Francisco, CA","Seattle, WA","Denver, CO","Washington, DC",
  "Nashville, TN","Oklahoma City, OK","El Paso, TX","Boston, MA","Portland, OR","Las Vegas, NV","Memphis, TN","Louisville, KY","Baltimore, MD","Milwaukee, WI",
  "Albuquerque, NM","Tucson, AZ","Fresno, CA","Mesa, AZ","Sacramento, CA","Atlanta, GA","Kansas City, MO","Omaha, NE","Colorado Springs, CO","Raleigh, NC",
  "Virginia Beach, VA","Long Beach, CA","Miami, FL","Oakland, CA","Minneapolis, MN","Tampa, FL","Tulsa, OK","Arlington, TX","New Orleans, LA","Cleveland, OH",
  "Detroit, MI","St. Louis, MO","Pittsburgh, PA","Cincinnati, OH","Orlando, FL","St. Petersburg, FL","Newark, NJ","Jersey City, NJ","Honolulu, HI","Anchorage, AK",
  "Madison, WI","Salt Lake City, UT","Boise, ID","Richmond, VA","Charleston, SC","Savannah, GA","Scottsdale, AZ","Santa Fe, NM","Lexington, KY","Knoxville, TN",
  "Providence, RI","Hartford, CT","Des Moines, IA","Little Rock, AR","Baton Rouge, LA","Springfield, IL","Wichita, KS","Norfolk, VA","Spokane, WA","Tacoma, WA",
  "Bakersfield, CA","Riverside, CA","Stockton, CA","Irvine, CA","Santa Ana, CA","Anaheim, CA","Santa Clarita, CA","Pasadena, CA","Fremont, CA","Modesto, CA",
  "Huntsville, AL","Montgomery, AL","Mobile, AL","Birmingham, AL","Chattanooga, TN","Akron, OH","Toledo, OH","Dayton, OH","Durham, NC","Greensboro, NC",
  "Winston-Salem, NC","Wilmington, NC","Columbia, SC","Greenville, SC","Tallahassee, FL","Fort Lauderdale, FL","West Palm Beach, FL","Gainesville, FL",
  "Naperville, IL","Aurora, IL","Rockford, IL","Peoria, IL","Ann Arbor, MI","Grand Rapids, MI","Lansing, MI","Rochester, NY","Buffalo, NY","Syracuse, NY",
  "Albany, NY","Yonkers, NY","White Plains, NY","Stamford, CT","New Haven, CT","Bridgeport, CT","Trenton, NJ","Princeton, NJ","Hoboken, NJ",
  "Tempe, AZ","Gilbert, AZ","Chandler, AZ","Glendale, AZ","Laredo, TX","Lubbock, TX","Amarillo, TX","Plano, TX","Irving, TX","Frisco, TX","McKinney, TX",
  "Corpus Christi, TX","Brownsville, TX","McAllen, TX","Midland, TX","Reno, NV","Henderson, NV","Provo, UT","Ogden, UT","Eugene, OR","Salem, OR","Bend, OR",
  "Bellevue, WA","Olympia, WA","Vancouver, WA","Fargo, ND","Sioux Falls, SD","Billings, MT","Missoula, MT","Cheyenne, WY","Burlington, VT","Portland, ME",
  "Concord, NH","Santa Barbara, CA","San Luis Obispo, CA","Monterey, CA","Santa Cruz, CA","Napa, CA","Berkeley, CA","Palo Alto, CA","Mountain View, CA",
  "Coral Gables, FL","Boca Raton, FL","Naples, FL","Sarasota, FL","Clearwater, FL","Pensacola, FL","Key West, FL",
  "Charlottesville, VA","Alexandria, VA","Arlington, VA","Bethesda, MD","Silver Spring, MD","Annapolis, MD","Columbia, MD",
  "Ithaca, NY","Saratoga Springs, NY","New Rochelle, NY","Garden City, NY","Manhasset, NY","Great Neck, NY","Scarsdale, NY",
  // ── UK Cities ──
  "London, UK","Manchester, UK","Birmingham, UK","Edinburgh, UK","Glasgow, UK","Liverpool, UK","Bristol, UK","Leeds, UK","Oxford, UK","Cambridge, UK",
  "Brighton, UK","Cardiff, UK","Belfast, UK","Nottingham, UK","Sheffield, UK","Southampton, UK","Newcastle, UK","Reading, UK","Aberdeen, UK","Bath, UK",
  "Exeter, UK","Leicester, UK","Coventry, UK","Plymouth, UK","Dundee, UK","Swansea, UK","York, UK","Norwich, UK","Derby, UK","Bournemouth, UK",
  "Cheltenham, UK","Durham, UK","St Andrews, UK","Canterbury, UK","Warwick, UK","Winchester, UK","Stirling, UK","Inverness, UK","Peterborough, UK","Sunderland, UK",
  "Wolverhampton, UK","Milton Keynes, UK","Northampton, UK","Stoke-on-Trent, UK","Ipswich, UK","Colchester, UK","Guildford, UK","Harrogate, UK","Chester, UK","Lincoln, UK",
  "Worcester, UK","Hereford, UK","Salisbury, UK","Truro, UK","St Albans, UK","Kingston upon Thames, UK","Richmond, UK","Epsom, UK","Tunbridge Wells, UK","Margate, UK",
  // ── Online ──
  "Online",
];

// ─── LINK TYPE OPTIONS & MAPPING ─────────────────────────
const LINK_TYPE_OPTIONS = [
  { key: "website", label: "Website", icon: "globe" },
  { key: "booking", label: "Booking", icon: "calendar" },
  { key: "phone", label: "Phone", icon: "phone" },
  { key: "zoom", label: "Zoom", icon: "video" },
  { key: "instagram", label: "Instagram", icon: "instagram" },
  { key: "linkedin", label: "LinkedIn", icon: "linkedin" },
  { key: "other", label: "Other", icon: "link2" },
];

const DB_TYPE_TO_KEY: Record<string, string> = {
  "🌐 Website": "website",
  "📅 Booking": "booking",
  "📞 Phone": "phone",
  "📧 Email": "website",
  "💼 LinkedIn": "linkedin",
  "📘 Facebook": "other",
  "📸 Instagram": "instagram",
  "💬 WhatsApp": "other",
  "📋 Resource": "other",
  Website: "website",
  Booking: "booking",
  Phone: "phone",
  Zoom: "zoom",
  Instagram: "instagram",
  LinkedIn: "linkedin",
};

const KEY_TO_DB_TYPE: Record<string, string> = {
  website: "Website",
  booking: "Booking",
  phone: "Phone",
  zoom: "Zoom",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  other: "Website",
};

function dbLinksToEdit(links: TutorLink[]): EditLink[] {
  return links.map((l, i) => {
    const key = DB_TYPE_TO_KEY[l.type] || "website";
    const opt = LINK_TYPE_OPTIONS.find((o) => o.key === key) || LINK_TYPE_OPTIONS[0];
    return {
      id: Date.now() + i,
      type: key,
      icon: opt.icon,
      label: l.label || opt.label,
      value: l.url,
    };
  });
}

function editLinksToDb(links: EditLink[]): TutorLink[] {
  return links
    .filter((l) => l.value)
    .map((l) => ({
      type: KEY_TO_DB_TYPE[l.type] || "Website",
      url: l.value,
      label: l.label,
    }));
}

// ─── HELPERS ────────────────────────────────────────────
function isLight(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 160;
}

function toac(hex: string) {
  return isLight(hex) ? "#111" : "white";
}

function buildInitialData(tutor: TutorRow): CardData {
  const name = [tutor.first_name, tutor.last_name].filter(Boolean).join(" ");
  const specialties = [...(tutor.exams || []), ...(tutor.subjects || [])];
  const nonOnlineLocations = (tutor.locations || []).filter(
    (l) => l.toLowerCase() !== "online"
  );
  const remote = (tutor.locations || []).some(
    (l) => l.toLowerCase() === "online"
  );

  return {
    name,
    headline: tutor.title || "",
    location: nonOnlineLocations.join(", "),
    remote,
    slug: tutor.slug,
    imageUrl: tutor.profile_image_url || "",
    specialties,
    links:
      tutor.links?.length > 0
        ? dbLinksToEdit(tutor.links)
        : [{ id: 1, type: "website", icon: "globe", label: "Website", value: "" }],
  };
}

// ─── ICON COMPONENT ─────────────────────────────────────
function Icon({
  name,
  size = 16,
  ...props
}: {
  name: string;
  size?: number;
} & React.SVGProps<SVGSVGElement>) {
  const paths: Record<string, React.ReactNode> = {
    calendar: (
      <>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </>
    ),
    globe: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="2" y1="12" x2="22" y2="12" />
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </>
    ),
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    mail: (
      <>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </>
    ),
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    wifi: (
      <>
        <path d="M5 12.55a11 11 0 0 1 14.08 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </>
    ),
    chevron: <polyline points="9 18 15 12 9 6" />,
    check: <polyline points="20 6 9 17 4 12" />,
    x: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
    plus: (
      <>
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
      </>
    ),
    arrowLeft: (
      <>
        <line x1="19" y1="12" x2="5" y2="12" />
        <polyline points="12 19 5 12 12 5" />
      </>
    ),
    camera: (
      <>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
    ext: (
      <>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </>
    ),
    video: (
      <>
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </>
    ),
    instagram: (
      <>
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </>
    ),
    linkedin: (
      <>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect x="2" y="9" width="4" height="12" />
        <circle cx="4" cy="4" r="2" />
      </>
    ),
    link2: (
      <>
        <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3" />
        <line x1="8" y1="12" x2="16" y2="12" />
      </>
    ),
    chevDown: <polyline points="6 9 12 15 18 9" />,
  };

  const fill = name === "star" ? "currentColor" : "none";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={fill === "none" ? "currentColor" : "none"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}

// ─── CARD PREVIEW ───────────────────────────────────────
function CardPreview({
  data,
  accent,
  vouchCount,
  averageRating,
  reviewCount,
}: {
  data: CardData;
  accent: string;
  vouchCount: number;
  averageRating: number | null;
  reviewCount: number;
}) {
  const t = toac(accent);
  const initials = data.name
    ? data.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "TC";

  return (
    <div
      style={{
        background: "white",
        borderRadius: 20,
        boxShadow: "0 4px 40px rgba(0,0,0,0.25)",
        overflow: "hidden",
        width: "100%",
        maxWidth: 340,
      }}
    >
      <div style={{ padding: "28px 24px 18px", textAlign: "center" }}>
        {data.imageUrl ? (
          <img
            src={data.imageUrl}
            alt=""
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              objectFit: "cover",
              margin: "0 auto 12px",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              width: 68,
              height: 68,
              borderRadius: "50%",
              background: accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
            }}
          >
            <span style={{ fontSize: 22, color: t, fontWeight: 600 }}>
              {initials}
            </span>
          </div>
        )}
        <h2
          style={{
            fontSize: 21,
            fontWeight: 700,
            color: "#111",
            margin: "0 0 1px",
            letterSpacing: "-0.02em",
          }}
        >
          {data.name || "Your Name"}
        </h2>
        <p
          style={{
            fontSize: 13.5,
            color: data.headline ? "#6b7280" : "#d1d5db",
            margin: "0 0 8px",
          }}
        >
          {data.headline || "Your headline"}
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            fontSize: 12.5,
            color: "#9ca3af",
          }}
        >
          <span>{data.location || "Your city"}</span>
          {data.remote && (
            <>
              <span style={{ color: "#d1d5db" }}>·</span>
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: accent,
                  fontWeight: 500,
                }}
              >
                <Icon name="wifi" size={12} style={{ color: accent }} />
                Remote
              </span>
            </>
          )}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            marginTop: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 11px",
              borderRadius: 20,
              border: "1px solid #e5e7eb",
              fontSize: 12.5,
            }}
          >
            <Icon name="users" size={12} style={{ color: "#6b7280" }} />
            <span style={{ fontWeight: 600, color: "#111" }}>{vouchCount}</span>
            <span style={{ color: "#9ca3af" }}>vouches</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              padding: "4px 11px",
              borderRadius: 20,
              border: "1px solid #e5e7eb",
              fontSize: 12.5,
            }}
          >
            <Icon name="star" size={11} style={{ color: "#f59e0b" }} />
            <span style={{ fontWeight: 600, color: "#111" }}>
              {averageRating !== null ? averageRating.toFixed(1) : "-"}
            </span>
            <span style={{ color: "#9ca3af" }}>({reviewCount})</span>
          </div>
        </div>
        {data.specialties.length > 0 && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 5,
              marginTop: 12,
            }}
          >
            {data.specialties.map((s) => (
              <span
                key={s}
                style={{
                  padding: "3px 10px",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#374151",
                  background: "#f3f4f6",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <div style={{ height: 1, background: "#f3f4f6", margin: "0 20px" }} />
      <div style={{ padding: "8px 12px" }}>
        {data.links
          .filter((l) => l.label || l.value)
          .map((lk) => (
            <div
              key={lk.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 12px",
                borderRadius: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: "#f3f4f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon name={lk.type} size={15} style={{ color: "#374151" }} />
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#111",
                  flex: 1,
                }}
              >
                {lk.label || lk.value}
              </span>
              <Icon name="chevron" size={13} style={{ color: "#d1d5db" }} />
            </div>
          ))}
      </div>
      <div style={{ padding: "4px 20px 12px" }}>
        <div
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 14,
            background: accent,
            color: t,
            fontSize: 14,
            fontWeight: 600,
            textAlign: "center",
          }}
        >
          Share card
        </div>
      </div>
      <div style={{ textAlign: "center", paddingBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: 0 }}>
          <span style={{ fontWeight: 600 }}>tutorcard</span>.co/{data.slug}
        </p>
      </div>
    </div>
  );
}

// ─── SECTION ────────────────────────────────────────────
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 32 }}>
      <h3
        style={{ fontSize: 14, fontWeight: 700, color: "#111", margin: "0 0 16px" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── LOCATION AUTOCOMPLETE ──────────────────────────────
function LocationInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [query, setQuery] = useState(value);
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleChange = (v: string) => {
    setQuery(v);
    onChange(v);
    if (v.length >= 2) {
      const lv = v.toLowerCase();
      setFiltered(CITIES.filter((c) => c.toLowerCase().includes(lv)).slice(0, 8));
      setOpen(true);
    } else {
      setOpen(false);
    }
  };

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 12 }}>
      <label
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#374151",
          display: "block",
          marginBottom: 5,
        }}
      >
        Location
      </label>
      <input
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Start typing your city..."
        style={{
          width: "100%",
          padding: "11px 14px",
          borderRadius: 10,
          border: "1.5px solid #e5e7eb",
          fontSize: 14,
          color: "#111",
          outline: "none",
          boxSizing: "border-box",
          fontFamily: "'DM Sans', sans-serif",
          transition: "border-color 0.15s",
          background: "white",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "#111";
          if (query.length >= 2) setOpen(true);
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "#e5e7eb";
        }}
      />
      {open && filtered.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
            marginTop: 4,
            boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            zIndex: 50,
            overflow: "hidden",
          }}
        >
          {filtered.map((c) => (
            <div
              key={c}
              onClick={() => {
                onChange(c);
                setQuery(c);
                setOpen(false);
              }}
              style={{
                padding: "10px 14px",
                fontSize: 14,
                color: "#111",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "white";
              }}
            >
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── LINK ROW ───────────────────────────────────────────
function LinkRow({
  link,
  onChange,
  onRemove,
}: {
  link: EditLink;
  onChange: (updated: EditLink) => void;
  onRemove: () => void;
}) {
  const [typeOpen, setTypeOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setTypeOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const currentType =
    LINK_TYPE_OPTIONS.find((o) => o.key === link.type) || LINK_TYPE_OPTIONS[0];
  const placeholder =
    link.type === "phone"
      ? "(555) 123-4567"
      : link.type === "instagram"
        ? "@username"
        : "https://...";

  return (
    <div
      style={{
        background: "white",
        border: "1.5px solid #e5e7eb",
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 10,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div ref={ref} style={{ position: "relative", flexShrink: 0 }}>
        <button
          onClick={() => setTypeOpen(!typeOpen)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            border: "1px solid #e5e7eb",
            background: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            position: "relative",
          }}
        >
          <Icon
            name={currentType.icon}
            size={16}
            style={{ color: "#374151" }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "white",
              border: "1px solid #e5e7eb",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon name="chevDown" size={8} style={{ color: "#9ca3af" }} />
          </div>
        </button>
        {typeOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              zIndex: 50,
              overflow: "hidden",
              minWidth: 150,
            }}
          >
            {LINK_TYPE_OPTIONS.map((o) => (
              <div
                key={o.key}
                onClick={() => {
                  onChange({
                    ...link,
                    type: o.key,
                    icon: o.icon,
                    label:
                      link.label ===
                      (LINK_TYPE_OPTIONS.find((x) => x.key === link.type)
                        ?.label || "")
                        ? o.label
                        : link.label,
                  });
                  setTypeOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  color: o.key === link.type ? "#111" : "#6b7280",
                  cursor: "pointer",
                  transition: "background 0.1s",
                  background: o.key === link.type ? "#f9fafb" : "white",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#f9fafb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    o.key === link.type ? "#f9fafb" : "white";
                }}
              >
                <Icon name={o.icon} size={14} style={{ color: "#6b7280" }} />
                {o.label}
                {o.key === link.type && (
                  <Icon
                    name="check"
                    size={12}
                    style={{ color: "#059669", marginLeft: "auto" }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          value={link.value}
          onChange={(e) => onChange({ ...link, value: e.target.value })}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: 0,
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            color: "#111",
            outline: "none",
            background: "transparent",
            lineHeight: 1.4,
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
        <input
          value={link.label}
          onChange={(e) => onChange({ ...link, label: e.target.value })}
          placeholder="Button label..."
          style={{
            width: "100%",
            padding: "2px 0 0",
            border: "none",
            fontSize: 12,
            color: "#9ca3af",
            outline: "none",
            background: "transparent",
            lineHeight: 1.4,
            fontFamily: "'DM Sans', sans-serif",
          }}
        />
      </div>
      <button
        onClick={onRemove}
        style={{
          background: "none",
          border: "none",
          color: "#d1d5db",
          cursor: "pointer",
          padding: 4,
          flexShrink: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "#9ca3af";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "#d1d5db";
        }}
      >
        <Icon name="x" size={15} />
      </button>
    </div>
  );
}

// ─── MAIN ───────────────────────────────────────────────
interface EditClientProps {
  tutor: TutorRow;
  vouchCount: number;
  reviewCount: number;
  averageRating: number | null;
}

export default function EditClient({
  tutor,
  vouchCount,
  reviewCount,
  averageRating,
}: EditClientProps) {
  const router = useRouter();
  const [data, setData] = useState<CardData>(() => buildInitialData(tutor));
  const [accent, setAccent] = useState(
    ACCENT_PRESETS.includes(tutor.avatar_color)
      ? tutor.avatar_color
      : "#111111"
  );
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [customSpec, setCustomSpec] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const ck = () => setIsMobile(window.innerWidth < 900);
    ck();
    window.addEventListener("resize", ck);
    return () => window.removeEventListener("resize", ck);
  }, []);

  const set =
    <K extends keyof CardData>(key: K) =>
    (val: CardData[K]) =>
      setData((d) => ({ ...d, [key]: val }));

  const toggleSpec = (s: string) =>
    setData((d) => ({
      ...d,
      specialties: d.specialties.includes(s)
        ? d.specialties.filter((x) => x !== s)
        : [...d.specialties, s],
    }));

  const addCustomSpec = () => {
    if (customSpec.trim() && !data.specialties.includes(customSpec.trim())) {
      setData((d) => ({
        ...d,
        specialties: [...d.specialties, customSpec.trim()],
      }));
      setCustomSpec("");
    }
  };

  const updateLink = (id: number, u: EditLink) =>
    setData((d) => ({
      ...d,
      links: d.links.map((l) => (l.id === id ? u : l)),
    }));

  const removeLink = (id: number) =>
    setData((d) => ({ ...d, links: d.links.filter((l) => l.id !== id) }));

  const addLink = () =>
    setData((d) => ({
      ...d,
      links: [
        ...d.links,
        { id: Date.now(), type: "website", icon: "globe", label: "Website", value: "" },
      ],
    }));

  const [profanityError, setProfanityError] = useState("");

  const handleSave = async () => {
    // Profanity check
    const fieldsToCheck = [
      data.name,
      data.headline,
      ...data.specialties,
      ...data.links.map((l) => l.label),
    ];
    for (const field of fieldsToCheck) {
      if (containsProfanity(field)) {
        setProfanityError("Please remove inappropriate language from your card before saving.");
        return;
      }
    }
    setProfanityError("");

    setSaving(true);
    try {
      const nameParts = data.name.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const locations: string[] = [];
      if (data.location.trim()) {
        locations.push(
          ...data.location
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean)
        );
      }
      if (data.remote && !locations.some((l) => l.toLowerCase() === "online")) {
        locations.push("Online");
      }

      const payload = {
        id: tutor.id,
        firstName,
        lastName,
        title: data.headline.trim(),
        slug: data.slug,
        avatarColor: accent,
        exams: data.specialties,
        subjects: [],
        locations,
        links: editLinksToDb(data.links),
        profileImageUrl: data.imageUrl || null,
      };

      const res = await fetch("/api/tutors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const resData = await res.json();
        if (resData.error?.includes("slug")) {
          alert("That card URL is already taken. Please choose another.");
        } else {
          alert("Something went wrong. Please try again.");
        }
        setSaving(false);
        return;
      }

      setSaved(true);
      setTimeout(() => router.push("/dashboard"), 800);
    } catch {
      alert("Network error. Please try again.");
    }
    setSaving(false);
  };

  const handleDiscard = () => {
    router.push("/dashboard");
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2MB");
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (res.ok) {
        const resData = await res.json();
        set("imageUrl")(resData.url);
      } else {
        alert("Upload failed. Please try again.");
      }
    } catch {
      alert("Upload failed. Please try again.");
    }
    setUploading(false);
  };

  const inp: React.CSSProperties = {
    width: "100%",
    padding: "11px 14px",
    borderRadius: 10,
    border: "1.5px solid #e5e7eb",
    fontSize: 14,
    color: "#111",
    outline: "none",
    boxSizing: "border-box",
    background: "white",
    fontFamily: "'DM Sans', sans-serif",
  };

  function renderForm() {
    return (
      <>
        <Section title="About you">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: data.imageUrl ? "transparent" : accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {data.imageUrl ? (
                <img
                  src={data.imageUrl}
                  alt=""
                  style={{ width: 64, height: 64, objectFit: "cover" }}
                />
              ) : (
                <span
                  style={{
                    fontSize: 22,
                    color: toac(accent),
                    fontWeight: 600,
                  }}
                >
                  {data.name
                    ? data.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()
                    : "TC"}
                </span>
              )}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <label
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: uploading ? "wait" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: uploading ? 0.6 : 1,
                }}
              >
                <Icon name="camera" size={14} style={{ color: "#6b7280" }} />
                {uploading ? "Uploading..." : "Change photo"}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  disabled={uploading}
                  onChange={handlePhotoUpload}
                />
              </label>
              {data.imageUrl && (
                <button
                  onClick={() => set("imageUrl")("")}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 8,
                    border: "1px solid #e5e7eb",
                    background: "white",
                    color: "#9ca3af",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          {[
            { key: "name" as const, label: "Full name", ph: "Your full name" },
            {
              key: "headline" as const,
              label: "Professional headline",
              ph: "e.g. SAT & ACT Specialist",
            },
          ].map((f) => (
            <div key={f.key} style={{ marginBottom: 12 }}>
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#374151",
                  display: "block",
                  marginBottom: 5,
                }}
              >
                {f.label}
              </label>
              <input
                value={data[f.key]}
                onChange={(e) => set(f.key)(e.target.value)}
                placeholder={f.ph}
                style={inp}
                onFocus={(e) => {
                  e.target.style.borderColor = "#111";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e5e7eb";
                }}
              />
            </div>
          ))}
          <LocationInput
            value={data.location}
            onChange={set("location")}
          />
          <div style={{ marginBottom: 12 }}>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 5,
              }}
            >
              Card URL
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                overflow: "hidden",
                background: "white",
              }}
            >
              <span
                style={{
                  padding: "11px 0 11px 14px",
                  fontSize: 14,
                  color: "#9ca3af",
                  whiteSpace: "nowrap",
                }}
              >
                tutorcard.co/
              </span>
              <input
                value={data.slug}
                onChange={(e) =>
                  set("slug")(
                    e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "")
                  )
                }
                style={{
                  flex: 1,
                  padding: "11px 14px 11px 0",
                  border: "none",
                  fontSize: 14,
                  color: "#111",
                  outline: "none",
                  background: "white",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              />
            </div>
          </div>
          <div>
            <label
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "#374151",
                display: "block",
                marginBottom: 6,
              }}
            >
              Remote tutoring
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[true, false].map((v) => (
                <button
                  key={String(v)}
                  onClick={() => set("remote")(v)}
                  style={{
                    padding: "8px 20px",
                    borderRadius: 10,
                    cursor: "pointer",
                    border:
                      data.remote === v
                        ? "1.5px solid #111"
                        : "1.5px solid #e5e7eb",
                    background: data.remote === v ? "#111" : "white",
                    color: data.remote === v ? "white" : "#6b7280",
                    fontSize: 13,
                    fontWeight: 600,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {v ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        </Section>

        <Section title="Specialties">
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 6,
              marginBottom: 12,
            }}
          >
            {SPECIALTY_SUGGESTIONS.map((s) => {
              const sel = data.specialties.includes(s);
              return (
                <button
                  key={s}
                  onClick={() => toggleSpec(s)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    cursor: "pointer",
                    border: sel
                      ? "1.5px solid #111"
                      : "1.5px solid #e5e7eb",
                    background: sel ? "#111" : "white",
                    color: sel ? "white" : "#374151",
                    fontSize: 12.5,
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  {sel && <span style={{ marginRight: 4 }}>{"✓"}</span>}
                  {s}
                </button>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              value={customSpec}
              onChange={(e) => setCustomSpec(e.target.value)}
              placeholder="Add a custom specialty..."
              onKeyDown={(e) => e.key === "Enter" && addCustomSpec()}
              style={{ ...inp, flex: 1 }}
              onFocus={(e) => {
                e.target.style.borderColor = "#111";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e5e7eb";
              }}
            />
            <button
              onClick={addCustomSpec}
              style={{
                padding: "11px 14px",
                borderRadius: 10,
                border: "1.5px solid #e5e7eb",
                background: "white",
                color: "#374151",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Icon name="plus" size={13} />
              Add
            </button>
          </div>
        </Section>

        <Section title="Links">
          {data.links.map((lk) => (
            <LinkRow
              key={lk.id}
              link={lk}
              onChange={(u) => updateLink(lk.id, u)}
              onRemove={() => removeLink(lk.id)}
            />
          ))}
          <button
            onClick={addLink}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 12,
              border: "1.5px dashed #d1d5db",
              background: "transparent",
              color: "#9ca3af",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#111";
              e.currentTarget.style.color = "#111";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db";
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <Icon name="plus" size={14} />
            Add another link
          </button>
        </Section>

        <Section title="Card color">
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {ACCENT_PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: c,
                  border: "none",
                  cursor: "pointer",
                  boxShadow:
                    accent === c
                      ? `0 0 0 2px white, 0 0 0 4px ${c}`
                      : "none",
                }}
              />
            ))}
          </div>
        </Section>

        {profanityError && (
          <p style={{ color: "#dc2626", fontSize: 13, fontWeight: 500, margin: "0 0 12px" }}>
            {profanityError}
          </p>
        )}
        <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: "13px 28px",
              borderRadius: 14,
              border: "none",
              background: saved ? "#ecfdf5" : "#111",
              color: saved ? "#059669" : "white",
              fontSize: 15,
              fontWeight: 600,
              cursor: saving ? "wait" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: saving ? 0.7 : 1,
            }}
          >
            <Icon name="check" size={16} />
            {saving ? "Saving..." : saved ? "Saved!" : "Save changes"}
          </button>
          <button
            onClick={handleDiscard}
            style={{
              padding: "13px 20px",
              borderRadius: 14,
              border: "1px solid #e5e7eb",
              background: "white",
              color: "#9ca3af",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f9fafb";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "white";
            }}
          >
            Discard
          </button>
        </div>
      </>
    );
  }

  // ─── MOBILE LAYOUT ──────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
          * { box-sizing: border-box; margin: 0; padding: 0; }
        `}</style>
        <div
          style={{
            minHeight: "100vh",
            fontFamily: "'DM Sans', sans-serif",
            background: "white",
          }}
        >
          <header
            style={{
              padding: "16px 20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid #f3f4f6",
            }}
          >
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                background: "none",
                border: "none",
                color: "#9ca3af",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Icon name="arrowLeft" size={16} />
              Back
            </button>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleDiscard}
                style={{
                  padding: "7px 14px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  color: "#9ca3af",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "7px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: saved ? "#ecfdf5" : "#111",
                  color: saved ? "#059669" : "white",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: saving ? "wait" : "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                <Icon name="check" size={14} />
                {saving ? "Saving..." : saved ? "Saved!" : "Save"}
              </button>
            </div>
          </header>
          <div
            style={{
              background: "#111",
              padding: "32px 20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <CardPreview
              data={data}
              accent={accent}
              vouchCount={vouchCount}
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
          </div>
          <div style={{ padding: "28px 20px 40px" }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: "#111",
                letterSpacing: "-0.02em",
                margin: "0 0 4px",
              }}
            >
              Edit your card
            </h1>
            <p
              style={{
                fontSize: 14,
                color: "#9ca3af",
                margin: "0 0 28px",
              }}
            >
              Changes update your public card in real time.
            </p>
            {renderForm()}
          </div>
        </div>
      </>
    );
  }

  // ─── DESKTOP LAYOUT ─────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        {/* Dashboard header */}
        <header
          style={{
            background: "white",
            borderBottom: "1px solid #f3f4f6",
            padding: "0 24px",
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                background: "#111",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: "white" }}>
                tc
              </span>
            </div>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>
              tutorcard
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => {
                const url = `${window.location.origin}/${data.slug}`;
                navigator.clipboard?.writeText(url).catch(() => {});
              }}
              style={{
                padding: "7px 14px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "white",
                color: "#374151",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Icon name="ext" size={14} />
              Share
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              style={{
                padding: "7px 14px",
                borderRadius: 10,
                border: "none",
                background: "transparent",
                color: "#9ca3af",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "'DM Sans', sans-serif",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Icon name="arrowLeft" size={14} />
              Dashboard
            </button>
          </div>
        </header>

        {/* 50/50 split */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* LEFT: White form panel */}
          <div
            className="hide-scrollbar"
            style={{ width: "50%", background: "white", overflow: "auto" }}
          >
            <div
              className="hide-scrollbar"
              style={{
                padding: "36px 48px 60px",
                overflow: "auto",
                height: "100%",
              }}
            >
              <button
                onClick={() => router.push("/dashboard")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: "none",
                  border: "none",
                  color: "#9ca3af",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  marginBottom: 20,
                  padding: 0,
                }}
              >
                <Icon name="arrowLeft" size={14} />
                Back to dashboard
              </button>
              <h1
                style={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: "#111",
                  letterSpacing: "-0.02em",
                  margin: "0 0 4px",
                }}
              >
                Edit your card
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "#9ca3af",
                  margin: "0 0 36px",
                }}
              >
                Changes update your public card in real time.
              </p>
              {renderForm()}
            </div>
          </div>

          {/* RIGHT: Black preview panel */}
          <div
            style={{
              width: "50%",
              background: "#111",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <CardPreview
              data={data}
              accent={accent}
              vouchCount={vouchCount}
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
          </div>
        </div>
      </div>
    </>
  );
}
