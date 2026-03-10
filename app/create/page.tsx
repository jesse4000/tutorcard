"use client";

import { Suspense } from "react";
import TutorCardOnboarding from "@/components/TutorCardOnboarding";

export default function CreatePage() {
  return (
    <Suspense>
      <TutorCardOnboarding />
    </Suspense>
  );
}
