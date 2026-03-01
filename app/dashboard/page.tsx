import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard — TutorCard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard");
  }

  const { data: tutors } = await supabase
    .from("tutors")
    .select("*")
    .eq("user_id", user.id);

  const tutor = tutors?.[0] || null;

  return <DashboardClient tutor={tutor} userEmail={user.email || ""} />;
}
