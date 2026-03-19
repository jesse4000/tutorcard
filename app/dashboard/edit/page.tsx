import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import EditClient from "./EditClient";

export const metadata: Metadata = {
  title: "Edit Card",
  robots: { index: false, follow: false },
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

  // Fetch vouch count and reviews for the preview card
  const [{ count: vouchCount }, { data: reviewsRaw }] = await Promise.all([
    supabase
      .from("vouches")
      .select("id", { count: "exact", head: true })
      .eq("vouched_tutor_id", tutor.id),
    supabase
      .from("reviews")
      .select("rating")
      .eq("tutor_id", tutor.id),
  ]);

  const reviewCount = reviewsRaw?.length ?? 0;
  const averageRating =
    reviewCount > 0
      ? (reviewsRaw || []).reduce(
          (sum: number, r: { rating: number }) => sum + r.rating,
          0
        ) / reviewCount
      : null;

  return (
    <EditClient
      tutor={tutor}
      vouchCount={vouchCount ?? 0}
      reviewCount={reviewCount}
      averageRating={averageRating}
    />
  );
}
