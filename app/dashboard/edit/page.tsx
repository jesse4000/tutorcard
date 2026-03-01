import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import EditClient from "./EditClient";

export const metadata: Metadata = {
  title: "Edit Card — TutorCard",
};

export default async function EditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?redirect=/dashboard/edit");
  }

  const { data: tutors } = await supabase
    .from("tutors")
    .select("*")
    .eq("user_id", user.id);

  const tutor = tutors?.[0];
  if (!tutor) redirect("/create");

  return <EditClient tutor={tutor} />;
}
