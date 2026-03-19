import type { Metadata } from "next";
import TutorCardAuth from "@/components/TutorCardAuth";

export const metadata: Metadata = {
  title: "Sign Up",
  robots: { index: false, follow: false },
};

export default function SignUpPage() {
  return <TutorCardAuth defaultMode="signup" />;
}
