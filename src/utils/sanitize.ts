/**
 * Sanitization utilities to prevent XSS and other injection attacks
 */

// HTML entities to escape
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#x60;",
  "=": "&#x3D;",
};

/**
 * Escape HTML entities to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize user input for display
 * - Trims whitespace
 * - Removes null bytes
 * - Escapes HTML entities
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== "string") return "";

  return escapeHtml(
    input
      .trim()
      .replace(/\0/g, "") // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "") // Remove control characters
  );
}

/**
 * Sanitize for plain text display (no HTML escaping, just cleanup)
 */
export function sanitizeText(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .trim()
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .slice(0, 10000); // Max length safety
}

/**
 * Validate and sanitize a URL
 */
export function sanitizeUrl(url: string): string | null {
  if (typeof url !== "string") return null;

  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsed = new URL(trimmed);

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return null;
    }

    // Block javascript: and data: URLs that might bypass protocol check
    if (trimmed.toLowerCase().includes("javascript:") ||
        trimmed.toLowerCase().includes("data:")) {
      return null;
    }

    return parsed.href;
  } catch {
    return null;
  }
}

/**
 * Sanitize a social media handle (remove @ prefix, validate chars)
 */
export function sanitizeHandle(handle: string): string {
  if (typeof handle !== "string") return "";

  return handle
    .trim()
    .replace(/^@/, "") // Remove leading @
    .replace(/[^a-zA-Z0-9_]/g, "") // Only alphanumeric and underscore
    .slice(0, 50); // Max length
}

/**
 * Validate coordinates are within valid ranges
 */
export function validateCoordinates(
  coords: [number, number]
): coords is [number, number] {
  if (!Array.isArray(coords) || coords.length !== 2) return false;

  const [lng, lat] = coords;

  if (typeof lng !== "number" || typeof lat !== "number") return false;
  if (isNaN(lng) || isNaN(lat)) return false;
  if (lng < -180 || lng > 180) return false;
  if (lat < -90 || lat > 90) return false;

  return true;
}

/**
 * Sanitize review/description text
 * - Limit length
 * - Remove dangerous patterns
 * - Preserve basic formatting
 */
export function sanitizeReviewText(text: string, maxLength = 500): string {
  if (typeof text !== "string") return "";

  return text
    .trim()
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/<[^>]*>/g, "") // Strip HTML tags
    .slice(0, maxLength);
}

/**
 * Sanitize spot name
 */
export function sanitizeSpotName(name: string): string {
  if (typeof name !== "string") return "";

  return name
    .trim()
    .replace(/\0/g, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/<[^>]*>/g, "")
    .slice(0, 100);
}
