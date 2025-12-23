/**
 * Social Link Detection Utility
 * Auto-detects platform from URL and provides appropriate icon/metadata
 */

export interface SocialPlatform {
  id: string;
  name: string;
  icon: string; // SVG path or identifier
  color: string; // Brand color
  urlPatterns: RegExp[];
}

export interface DetectedSocialLink {
  url: string;
  platform: SocialPlatform;
  displayName: string;
}

export interface CustomLink {
  id: string;
  url: string;
  platformId: string;
  displayName?: string;
}

// Define supported social platforms with their patterns and icons
export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  substack: {
    id: "substack",
    name: "Substack",
    icon: "substack",
    color: "#FF6719",
    urlPatterns: [
      /^https?:\/\/([a-zA-Z0-9-]+\.)?substack\.com/i,
      /^https?:\/\/[a-zA-Z0-9-]+\.substack\.com/i,
    ],
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    icon: "youtube",
    color: "#FF0000",
    urlPatterns: [
      /^https?:\/\/(www\.)?youtube\.com/i,
      /^https?:\/\/youtu\.be/i,
    ],
  },
  tiktok: {
    id: "tiktok",
    name: "TikTok",
    icon: "tiktok",
    color: "#000000",
    urlPatterns: [/^https?:\/\/(www\.)?tiktok\.com/i],
  },
  discord: {
    id: "discord",
    name: "Discord",
    icon: "discord",
    color: "#5865F2",
    urlPatterns: [
      /^https?:\/\/(www\.)?discord\.(gg|com)/i,
      /^https?:\/\/discordapp\.com/i,
    ],
  },
  telegram: {
    id: "telegram",
    name: "Telegram",
    icon: "telegram",
    color: "#26A5E4",
    urlPatterns: [/^https?:\/\/(t\.me|telegram\.me)/i],
  },
  github: {
    id: "github",
    name: "GitHub",
    icon: "github",
    color: "#181717",
    urlPatterns: [/^https?:\/\/(www\.)?github\.com/i],
  },
  medium: {
    id: "medium",
    name: "Medium",
    icon: "medium",
    color: "#000000",
    urlPatterns: [
      /^https?:\/\/(www\.)?medium\.com/i,
      /^https?:\/\/[a-zA-Z0-9-]+\.medium\.com/i,
    ],
  },
  spotify: {
    id: "spotify",
    name: "Spotify",
    icon: "spotify",
    color: "#1DB954",
    urlPatterns: [/^https?:\/\/(open\.)?spotify\.com/i],
  },
  twitch: {
    id: "twitch",
    name: "Twitch",
    icon: "twitch",
    color: "#9146FF",
    urlPatterns: [/^https?:\/\/(www\.)?twitch\.tv/i],
  },
  calendly: {
    id: "calendly",
    name: "Calendly",
    icon: "calendly",
    color: "#006BFF",
    urlPatterns: [/^https?:\/\/(www\.)?calendly\.com/i],
  },
  notion: {
    id: "notion",
    name: "Notion",
    icon: "notion",
    color: "#000000",
    urlPatterns: [/^https?:\/\/(www\.)?notion\.(so|site)/i],
  },
  beehiiv: {
    id: "beehiiv",
    name: "Beehiiv",
    icon: "beehiiv",
    color: "#FFC700",
    urlPatterns: [/^https?:\/\/([a-zA-Z0-9-]+\.)?beehiiv\.com/i],
  },
  threads: {
    id: "threads",
    name: "Threads",
    icon: "threads",
    color: "#000000",
    urlPatterns: [/^https?:\/\/(www\.)?threads\.net/i],
  },
  bluesky: {
    id: "bluesky",
    name: "Bluesky",
    icon: "bluesky",
    color: "#0085FF",
    urlPatterns: [/^https?:\/\/bsky\.app/i],
  },
  facebook: {
    id: "facebook",
    name: "Facebook",
    icon: "facebook",
    color: "#1877F2",
    urlPatterns: [
      /^https?:\/\/(www\.)?(facebook|fb)\.com/i,
      /^https?:\/\/fb\.me/i,
    ],
  },
  whatsapp: {
    id: "whatsapp",
    name: "WhatsApp",
    icon: "whatsapp",
    color: "#25D366",
    urlPatterns: [
      /^https?:\/\/(wa\.me|api\.whatsapp\.com|chat\.whatsapp\.com)/i,
    ],
  },
  pinterest: {
    id: "pinterest",
    name: "Pinterest",
    icon: "pinterest",
    color: "#E60023",
    urlPatterns: [/^https?:\/\/(www\.)?pinterest\.(com|co\.[a-z]{2})/i],
  },
  snapchat: {
    id: "snapchat",
    name: "Snapchat",
    icon: "snapchat",
    color: "#FFFC00",
    urlPatterns: [/^https?:\/\/(www\.)?snapchat\.com/i],
  },
  patreon: {
    id: "patreon",
    name: "Patreon",
    icon: "patreon",
    color: "#FF424D",
    urlPatterns: [/^https?:\/\/(www\.)?patreon\.com/i],
  },
  producthunt: {
    id: "producthunt",
    name: "Product Hunt",
    icon: "producthunt",
    color: "#DA552F",
    urlPatterns: [/^https?:\/\/(www\.)?producthunt\.com/i],
  },
  dribbble: {
    id: "dribbble",
    name: "Dribbble",
    icon: "dribbble",
    color: "#EA4C89",
    urlPatterns: [/^https?:\/\/(www\.)?dribbble\.com/i],
  },
  behance: {
    id: "behance",
    name: "Behance",
    icon: "behance",
    color: "#1769FF",
    urlPatterns: [/^https?:\/\/(www\.)?behance\.net/i],
  },
  figma: {
    id: "figma",
    name: "Figma",
    icon: "figma",
    color: "#F24E1E",
    urlPatterns: [/^https?:\/\/(www\.)?figma\.com/i],
  },
  linktree: {
    id: "linktree",
    name: "Linktree",
    icon: "linktree",
    color: "#43E55E",
    urlPatterns: [/^https?:\/\/(linktr\.ee|www\.linktr\.ee)/i],
  },
  reddit: {
    id: "reddit",
    name: "Reddit",
    icon: "reddit",
    color: "#FF4500",
    urlPatterns: [/^https?:\/\/(www\.)?reddit\.com/i],
  },
  eventbrite: {
    id: "eventbrite",
    name: "Eventbrite",
    icon: "eventbrite",
    color: "#F05537",
    urlPatterns: [/^https?:\/\/(www\.)?eventbrite\.(com|co\.[a-z]{2})/i],
  },
  meetup: {
    id: "meetup",
    name: "Meetup",
    icon: "meetup",
    color: "#ED1C40",
    urlPatterns: [/^https?:\/\/(www\.)?meetup\.com/i],
  },
  generic: {
    id: "generic",
    name: "Link",
    icon: "link",
    color: "#6B7280",
    urlPatterns: [],
  },
};

/**
 * Detect the platform from a given URL
 */
export function detectPlatform(url: string): SocialPlatform {
  const normalizedUrl = url.trim().toLowerCase();

  for (const platform of Object.values(SOCIAL_PLATFORMS)) {
    if (platform.id === "generic") continue;

    for (const pattern of platform.urlPatterns) {
      if (pattern.test(normalizedUrl)) {
        return platform;
      }
    }
  }

  return SOCIAL_PLATFORMS.generic;
}

/**
 * Parse a URL and return detected social link info
 */
export function parseCustomLink(url: string): DetectedSocialLink | null {
  if (!url || typeof url !== "string") return null;

  const trimmedUrl = url.trim();
  if (!trimmedUrl) return null;

  // Add https:// if no protocol is specified
  let normalizedUrl = trimmedUrl;
  if (!normalizedUrl.match(/^https?:\/\//i)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return null;
  }

  const platform = detectPlatform(normalizedUrl);

  return {
    url: normalizedUrl,
    platform,
    displayName: platform.name,
  };
}

/**
 * Generate a unique ID for a custom link
 */
export function generateLinkId(): string {
  return `link_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Validate and sanitize custom links array
 */
export function sanitizeCustomLinks(links: CustomLink[]): CustomLink[] {
  if (!Array.isArray(links)) return [];

  const result: CustomLink[] = [];

  for (const link of links) {
    if (!link || typeof link !== "object") continue;
    if (!link.url || typeof link.url !== "string") continue;

    const detected = parseCustomLink(link.url);
    if (!detected) continue;

    result.push({
      id: link.id || generateLinkId(),
      url: detected.url,
      platformId: detected.platform.id,
      displayName: link.displayName || detected.displayName,
    });

    if (result.length >= 10) break; // Limit to 10 custom links
  }

  return result;
}
