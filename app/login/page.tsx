import type { Metadata } from "next";
import TutorCardAuth from "@/components/TutorCardAuth";

export const metadata: Metadata = {
  title: "Log In",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <TutorCardAuth defaultMode="login" />;
}
