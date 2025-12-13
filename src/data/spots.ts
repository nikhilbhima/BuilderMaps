export type SpotType = "coworking" | "hacker-house" | "cafe" | "community";

export type VibeTag =
  | "deep focus"
  | "loud debates"
  | "3am friendly"
  | "good coffee"
  | "fast wifi"
  | "vc sightings"
  | "crypto crowd"
  | "ai builders"
  | "indie hackers"
  | "founders only"
  | "open community"
  | "rooftop vibes"
  | "quiet zone"
  | "networking"
  | "casual"
  | "outdoor seating"
  | "events"
  | "pet friendly"
  | "power outlets"
  | "meeting rooms"
  | "24/7 access"
  | "free parking"
  | "beginner friendly"
  | "demo days"
  | "mentorship";

export interface Upvoter {
  handle: string; // X or LinkedIn handle
  displayName?: string;
  avatarUrl?: string;
  provider?: "x" | "linkedin"; // Optional for backward compatibility
}

export interface Review {
  id: string;
  authorHandle: string; // X or LinkedIn handle
  authorName?: string;
  authorAvatarUrl?: string;
  provider?: "x" | "linkedin"; // Optional for backward compatibility
  rating: 1 | 2 | 3 | 4 | 5;
  text: string;
  createdAt: string; // ISO date string
}

export interface Spot {
  id: string;
  name: string;
  cityId: string;
  types: SpotType[]; // Supports multiple categories (e.g., hacker-house + community)
  description: string;
  coordinates: [number, number]; // [lng, lat]
  vibes: VibeTag[];
  upvotes: number;
  upvoters?: Upvoter[]; // List of people who upvoted
  reviews?: Review[]; // User reviews
  googleMapsUrl?: string;
  lumaUrl?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  addedBy: string; // Twitter handle
  approved: boolean;
}

export const spotTypeConfig: Record<SpotType, { label: string; color: string; emoji: string }> = {
  "coworking": { label: "Coworking", color: "purple", emoji: "💻" },
  "hacker-house": { label: "Hacker House", color: "orange", emoji: "🏠" },
  "cafe": { label: "Cafe", color: "cyan", emoji: "☕" },
  "community": { label: "Community", color: "lime", emoji: "👥" },
};
