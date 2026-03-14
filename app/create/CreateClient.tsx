"use client";

import { Suspense } from "react";
import TutorCardOnboarding from "@/components/TutorCardOnboarding";

export default function CreateClient() {
  return (
    <Suspense>
      <TutorCardOnboarding />
    </Suspense>
  );
}
