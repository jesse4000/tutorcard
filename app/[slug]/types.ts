export interface ReviewData {
  id: string;
  reviewerName: string;
  reviewerRole?: string;
  exam?: string;
  scoreBefore?: string;
  scoreAfter?: string;
  months?: number;
  rating: number;
  quote: string;
  recommends?: boolean;
  reviewerEmail?: string;
  reportStatus?: "pending" | "responded" | "revoked" | "denied";
}

export interface VoucherData {
  id: string;
  firstName: string;
  lastName: string;
  slug: string;
  title?: string;
  avatarColor: string;
  profileImageUrl?: string;
}

export interface BadgeData {
  id: string;
  name: string;
  organization?: string;
  badgeType: "certification" | "membership";
  sinceYear?: number;
  description?: string;
}
