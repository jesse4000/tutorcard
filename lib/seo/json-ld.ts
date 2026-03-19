const BASE_URL = "https://tutorcard.co";

interface TutorSeoData {
  firstName: string;
  lastName: string;
  title?: string;
  slug: string;
  exams?: string[];
  subjects?: string[];
  locations?: string[];
  businessName?: string;
  facebook?: string;
  linkedin?: string;
  instagram?: string;
}

interface ReviewStats {
  averageRating: number | null;
  reviewCount: number;
}

export function buildTutorJsonLd(
  tutor: TutorSeoData,
  reviewStats: ReviewStats
): Record<string, unknown> {
  const name = `${tutor.firstName} ${tutor.lastName}`;
  const url = `${BASE_URL}/${tutor.slug}`;
  const allExpertise = [
    ...(tutor.exams || []),
    ...(tutor.subjects || []),
  ];

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#tutor`,
    name,
    url,
    image: `${url}/opengraph-image`,
  };

  if (tutor.title) {
    jsonLd.jobTitle = tutor.title;
  }

  if (tutor.businessName) {
    jsonLd.worksFor = {
      "@type": "Organization",
      name: tutor.businessName,
    };
  }

  if (allExpertise.length > 0) {
    jsonLd.knowsAbout = allExpertise;
  }

  jsonLd.hasOccupation = {
    "@type": "Occupation",
    name: "Tutor",
    occupationalCategory: "25-3041.00",
  };

  // Build service offers — combine exams into a single service per area
  const locations = tutor.locations || [];
  if (allExpertise.length > 0) {
    const offer: Record<string, unknown> = {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: `${allExpertise.slice(0, 3).join(", ")} Tutoring`,
        serviceType: "Tutoring",
        ...(locations.length > 0 && { areaServed: locations }),
      },
    };
    jsonLd.makesOffer = offer;
  }

  // Aggregate rating — only if reviews exist
  if (reviewStats.averageRating !== null && reviewStats.reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Math.round(reviewStats.averageRating * 10) / 10,
      bestRating: 5,
      ratingCount: reviewStats.reviewCount,
    };
  }

  // Social links (sameAs) — only public profile URLs
  const sameAs: string[] = [];
  if (tutor.facebook) sameAs.push(tutor.facebook);
  if (tutor.linkedin) sameAs.push(tutor.linkedin);
  if (tutor.instagram) sameAs.push(tutor.instagram);
  if (sameAs.length > 0) {
    jsonLd.sameAs = sameAs;
  }

  return jsonLd;
}

export function buildBreadcrumbJsonLd(
  tutorName: string,
  slug: string
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${BASE_URL}/${slug}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "TutorCard",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: tutorName,
        item: `${BASE_URL}/${slug}`,
      },
    ],
  };
}

export function buildProfilePageJsonLd(slug: string): Record<string, unknown> {
  const url = `${BASE_URL}/${slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: { "@id": `${url}#tutor` },
    breadcrumb: { "@id": `${url}#breadcrumb` },
  };
}

/**
 * Build a keyword-rich SEO description for a tutor card.
 * Short version (~155 chars) for SERP, long version for OG.
 */
export function buildSeoDescription(
  tutor: TutorSeoData,
  reviewStats: ReviewStats
): { short: string; long: string } {
  const name = `${tutor.firstName} ${tutor.lastName}`;
  const allExpertise = [
    ...(tutor.exams || []),
    ...(tutor.subjects || []),
  ];

  const parts: string[] = [];

  // "{Name} is a {exam1, exam2} tutor"
  if (allExpertise.length > 0) {
    const expertiseStr = allExpertise.slice(0, 3).join(", ");
    parts.push(`${name} is a ${expertiseStr} tutor`);
  } else {
    parts.push(`${name} is a tutor`);
  }

  // "in {Location1, Location2}"
  const locations = tutor.locations || [];
  if (locations.length > 0) {
    parts[parts.length - 1] += ` in ${locations.slice(0, 2).join(" & ")}`;
  }

  // "Rated {X}/5 from {N} reviews"
  if (reviewStats.averageRating !== null && reviewStats.reviewCount > 0) {
    const rating = Math.round(reviewStats.averageRating * 10) / 10;
    parts.push(`Rated ${rating}/5 from ${reviewStats.reviewCount} review${reviewStats.reviewCount === 1 ? "" : "s"}`);
  }

  const shortBase = parts.join(". ") + ".";

  // Long version includes title
  const longParts = [...parts];
  if (tutor.title && !longParts[0].includes(tutor.title)) {
    longParts.splice(1, 0, tutor.title);
  }
  const longBase = longParts.join(". ") + " View their TutorCard.";

  // Cap short at ~155 chars
  const short = shortBase.length > 155
    ? shortBase.slice(0, 152) + "..."
    : shortBase;

  return { short, long: longBase };
}

/**
 * Build a keyword-rich SEO title for a tutor card.
 */
export function buildSeoTitle(tutor: TutorSeoData): string {
  const name = `${tutor.firstName} ${tutor.lastName}`;
  const primaryExam = tutor.exams?.[0] || tutor.subjects?.[0];

  if (primaryExam) {
    return `${name} | ${primaryExam} Tutor | TutorCard`;
  }
  return `${name} | TutorCard`;
}
