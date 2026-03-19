import type { Metadata } from "next";
import ForAssociationsClient from "./ForAssociationsClient";

export const metadata: Metadata = {
  title: "For Tutoring Associations",
  description:
    "Partner with TutorCard to give your members verified professional profiles, peer endorsements, and credential badges — included with membership.",
  alternates: {
    canonical: "/for-associations",
  },
  openGraph: {
    title: "TutorCard for Tutoring Associations",
    description:
      "Give your members a professional edge with verified tutor profiles.",
    type: "website",
  },
};

export default function ForAssociationsPage() {
  return <ForAssociationsClient />;
}
