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
 * Build an SEO description for a tutor card.
 * Format: exam1, exam2, subject1 | View TutorCard
 */
export function buildSeoDescription(
  tutor: TutorSeoData,
  _reviewStats: ReviewStats
): { short: string; long: string } {
  const allExpertise = [
    ...(tutor.exams || []),
    ...(tutor.subjects || []),
  ];

  let description: string;
  if (allExpertise.length > 0) {
    description = `${allExpertise.join(", ")} | View TutorCard`;
  } else {
    description = "View TutorCard";
  }

  return { short: description, long: description };
}

/**
 * Build a keyword-rich SEO title for a tutor card.
 * Format: Full Name | Title | Location | TutorCard
 */
export function buildSeoTitle(tutor: TutorSeoData): string {
  const name = `${tutor.firstName} ${tutor.lastName}`;
  const parts: string[] = [name];

  if (tutor.title) {
    parts.push(tutor.title);
  }

  const locations = tutor.locations || [];
  if (locations.length > 0) {
    parts.push(locations[0]);
  }

  parts.push("TutorCard");

  return parts.join(" | ");
}
