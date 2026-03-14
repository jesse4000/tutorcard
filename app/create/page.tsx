import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CreateClient from "./CreateClient";

export default async function CreatePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: tutors } = await supabase
      .from("tutors")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (tutors && tutors.length > 0) {
      redirect("/dashboard");
    }
  }

  return <CreateClient />;
}
