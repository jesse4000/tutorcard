/* eslint-disable @next/next/no-page-custom-font */
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tutorcard.co";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TutorCard | Your professional identity, one link.",
    template: "%s | TutorCard",
  },
  description:
    "Professional tutor profiles with verified reviews, peer endorsements, and credentials. Easy to share.",
  openGraph: {
    type: "website",
    siteName: "TutorCard",
    locale: "en_US",
    url: SITE_URL,
    title: "TutorCard | Your professional identity, one link.",
    description:
      "Professional tutor profiles with verified reviews, peer endorsements, and credentials. Easy to share.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "TutorCard | Professional tutor profiles",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TutorCard | Your professional identity, one link.",
    description:
      "Professional tutor profiles with verified reviews, peer endorsements, and credentials. Easy to share.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=Lora:ital,wght@0,400;1,400;1,600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
