import { Spot } from "@/data/spots";

/**
 * Calculate the Haversine distance between two coordinates in meters
 */
export function calculateDistance(
  coord1: [number, number],
  coord2: [number, number]
): number {
  const R = 6371000; // Earth's radius in meters
  const [lng1, lat1] = coord1;
  const [lng2, lat2] = coord2;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * Normalize a string for comparison (lowercase, remove special chars)
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Calculate similarity between two strings (0-1)
 */
function stringSimilarity(str1: string, str2: string): number {
  const s1 = normalizeString(str1);
  const s2 = normalizeString(str2);

  if (s1 === s2) return 1;
  if (s1.length === 0 || s2.length === 0) return 0;

  // Check if one contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  // Levenshtein distance
  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  const maxLength = Math.max(s1.length, s2.length);
  return 1 - matrix[s1.length][s2.length] / maxLength;
}

export interface DuplicateMatch {
  spot: Spot;
  similarity: number;
  distance: number;
  reason: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matches: DuplicateMatch[];
}

/**
 * Check if a new spot might be a duplicate of existing spots
 */
export function checkForDuplicates(
  newSpotName: string,
  newSpotCoordinates: [number, number],
  cityId: string,
  existingSpots: Spot[],
  options: {
    nameThreshold?: number; // 0-1, how similar names need to be
    distanceThreshold?: number; // meters, how close spots need to be
  } = {}
): DuplicateCheckResult {
  const { nameThreshold = 0.7, distanceThreshold = 100 } = options;

  const spotsInCity = existingSpots.filter((s) => s.cityId === cityId);
  const matches: DuplicateMatch[] = [];

  for (const spot of spotsInCity) {
    const nameSimilarity = stringSimilarity(newSpotName, spot.name);
    const distance = calculateDistance(newSpotCoordinates, spot.coordinates);

    let reason = "";

    // Check for name similarity
    if (nameSimilarity >= nameThreshold) {
      reason = `Name is ${Math.round(nameSimilarity * 100)}% similar`;
    }

    // Check for proximity
    if (distance <= distanceThreshold) {
      const distanceStr =
        distance < 1000 ? `${Math.round(distance)}m` : `${(distance / 1000).toFixed(1)}km`;
      reason = reason
        ? `${reason}, and only ${distanceStr} away`
        : `Only ${distanceStr} away`;
    }

    // If either condition is met, it's a potential duplicate
    if (nameSimilarity >= nameThreshold || distance <= distanceThreshold) {
      matches.push({
        spot,
        similarity: nameSimilarity,
        distance,
        reason,
      });
    }
  }

  // Sort by relevance (highest similarity first, then closest distance)
  matches.sort((a, b) => {
    if (Math.abs(a.similarity - b.similarity) > 0.1) {
      return b.similarity - a.similarity;
    }
    return a.distance - b.distance;
  });

  return {
    isDuplicate: matches.length > 0,
    matches,
  };
}

/**
 * Validate that required fields for a spot are present
 */
export interface SpotValidationResult {
  isValid: boolean;
  errors: string[];
}

export function validateSpotSubmission(data: {
  name?: string;
  cityId?: string;
  type?: string;
  description?: string;
  coordinates?: [number, number];
}): SpotValidationResult {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push("Name is required (at least 2 characters)");
  }

  if (!data.cityId) {
    errors.push("City is required");
  }

  if (!data.type) {
    errors.push("Spot type is required");
  }

  if (!data.description || data.description.trim().length < 10) {
    errors.push("Description is required (at least 10 characters)");
  }

  if (!data.coordinates || data.coordinates.length !== 2) {
    errors.push("Location coordinates are required");
  } else {
    const [lng, lat] = data.coordinates;
    if (typeof lng !== "number" || typeof lat !== "number") {
      errors.push("Invalid coordinates format");
    } else if (lng < -180 || lng > 180 || lat < -90 || lat > 90) {
      errors.push("Coordinates are out of valid range");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
