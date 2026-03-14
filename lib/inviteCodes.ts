import { createAdminClient } from "@/lib/supabase/admin";

export interface ReferrerData {
  tutorId: string;
  firstName: string;
  lastName: string;
  initials: string;
  headline: string;
  locations: string[];
  specialties: string[];
  avatarColor: string;
  profileImageUrl: string | null;
  slug: string;
  vouchCount: number;
}

const CODE_PREFIX = "TC-";
const CODE_LENGTH = 6;
const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid ambiguity
const CODES_PER_USER = 5;

export function generateCodeString(): string {
  let result = "";
  for (let i = 0; i < CODE_LENGTH; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return CODE_PREFIX + result;
}

export async function generateCodesForUser(
  userId: string,
  retries = 3
): Promise<void> {
  const admin = createAdminClient();

  // Check how many codes already exist for this user
  const { count, error: countError } = await admin
    .from("invite_codes")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", userId);

  if (countError) throw countError;

  const existing = count ?? 0;
  const needed = CODES_PER_USER - existing;
  if (needed <= 0) return;

  const codes = [];
  for (let i = 0; i < needed; i++) {
    codes.push({
      code: generateCodeString(),
      owner_id: userId,
    });
  }
  const { error } = await admin.from("invite_codes").insert(codes);
  if (error) {
    // Retry with fresh codes on uniqueness collision
    if (error.code === "23505" && retries > 0) {
      return generateCodesForUser(userId, retries - 1);
    }
    throw error;
  }
}

export async function validateInviteCode(
  code: string
): Promise<{ valid: boolean; error?: string }> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("invite_codes")
    .select("id, claimed")
    .eq("code", code.toUpperCase().trim())
    .single();

  if (error || !data) return { valid: false, error: "Invalid invite code" };
  if (data.claimed)
    return { valid: false, error: "This code has already been used" };
  return { valid: true };
}

export async function getReferrerByInviteCode(
  code: string
): Promise<ReferrerData | null> {
  const admin = createAdminClient();

  const { data: codeRow } = await admin
    .from("invite_codes")
    .select("owner_id")
    .eq("code", code.toUpperCase().trim())
    .eq("claimed", false)
    .single();
  if (!codeRow) return null;

  const { data: tutor } = await admin
    .from("tutors")
    .select("id, first_name, last_name, title, locations, exams, avatar_color, profile_image_url, slug")
    .eq("user_id", codeRow.owner_id)
    .single();
  if (!tutor) return null;

  const { count } = await admin
    .from("vouches")
    .select("id", { count: "exact", head: true })
    .eq("vouched_tutor_id", tutor.id);

  return {
    tutorId: tutor.id,
    firstName: tutor.first_name,
    lastName: tutor.last_name || "",
    initials: (tutor.first_name[0] + (tutor.last_name?.[0] || "")).toUpperCase(),
    headline: tutor.title || "",
    locations: tutor.locations || [],
    specialties: tutor.exams || [],
    avatarColor: tutor.avatar_color || "#4f46e5",
    profileImageUrl: tutor.profile_image_url || null,
    slug: tutor.slug,
    vouchCount: count ?? 0,
  };
}

export async function claimInviteCode(
  code: string,
  claimedByUserId: string,
  claimedName: string,
  claimedSlug: string
): Promise<boolean> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("invite_codes")
    .update({
      claimed: true,
      claimed_by_user_id: claimedByUserId,
      claimed_name: claimedName,
      claimed_slug: claimedSlug,
      claimed_at: new Date().toISOString(),
    })
    .eq("code", code.toUpperCase().trim())
    .eq("claimed", false);
  return !error;
}
