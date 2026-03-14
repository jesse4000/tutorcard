export interface OnboardingLink {
  id: number;
  type: string;
  icon: string;
  value: string;
  label: string;
}

export interface OnboardingReferrer {
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

export interface OnboardingData {
  name: string;
  headline: string;
  location: string;
  remote: boolean;
  slug: string;
  imageUrl: string | null;
  specialties: string[];
  links: OnboardingLink[];
  accent: string;
  inviteCode?: string;
  referrer?: OnboardingReferrer;
}

const DRAFT_KEY = "tutorcard_draft";

export function saveCardDraft(data: OnboardingData): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // localStorage unavailable or full — silently fail
  }
}

export function loadCardDraft(): OnboardingData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OnboardingData;
  } catch {
    return null;
  }
}

export function clearCardDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // ignore
  }
}
