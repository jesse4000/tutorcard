import { createAdminClient } from "@/lib/supabase/admin";

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
