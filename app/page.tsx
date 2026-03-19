import type { Metadata } from "next";
import HomepageClient from "./HomepageClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tutorcard.co";

export const metadata: Metadata = {
  title: {
    absolute: "TutorCard | Your professional identity, one link.",
  },
  description:
    "One link that shows who you are and how to reach you — plus a community that notifies you the moment a student matches your specialty.",
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        name: "TutorCard",
        url: SITE_URL,
        description:
          "Professional tutor profiles with verified reviews, peer endorsements, and credentials.",
      },
      {
        "@type": "Organization",
        name: "TutorCard",
        url: SITE_URL,
        logo: `${SITE_URL}/og-default.png`,
        parentOrganization: {
          "@type": "Organization",
          name: "StudySpaces",
          url: "https://studyspaces.com",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <HomepageClient />
    </>
  );
}
