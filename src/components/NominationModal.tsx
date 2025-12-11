"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotType, spotTypeConfig } from "@/data/spots";
import { cities } from "@/data/cities";
import { useToast } from "@/components/Toast";

interface NominationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCityId?: string;
}

const spotTypes: SpotType[] = ["coworking", "cafe", "hacker-house", "community"];

const vibeOptions = [
  "deep focus",
  "networking",
  "fast wifi",
  "good coffee",
  "3am friendly",
  "quiet zone",
  "loud debates",
  "outdoor seating",
  "pet friendly",
  "power outlets",
  "meeting rooms",
  "24/7 access",
  "events",
  "demo days",
  "mentorship",
  "beginner friendly",
  "ai builders",
  "crypto crowd",
  "indie hackers",
  "vc sightings",
];

// Calculate distance between two points using Haversine formula
function getDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Extract coordinates from Google Maps URL
function extractCoordsFromGoogleMapsUrl(url: string): [number, number] | null {
  try {
    // Pattern 1: @lat,lng (most common)
    const atPattern = /@(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const atMatch = url.match(atPattern);
    if (atMatch) {
      return [parseFloat(atMatch[1]), parseFloat(atMatch[2])];
    }

    // Pattern 2: ?q=lat,lng or place/lat,lng
    const qPattern = /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const qMatch = url.match(qPattern);
    if (qMatch) {
      return [parseFloat(qMatch[1]), parseFloat(qMatch[2])];
    }

    // Pattern 3: /place/.../data=...!3d{lat}!4d{lng}
    const dataPattern = /!3d(-?\d+\.?\d*)!4d(-?\d+\.?\d*)/;
    const dataMatch = url.match(dataPattern);
    if (dataMatch) {
      return [parseFloat(dataMatch[1]), parseFloat(dataMatch[2])];
    }

    // Pattern 4: ll=lat,lng
    const llPattern = /[?&]ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/;
    const llMatch = url.match(llPattern);
    if (llMatch) {
      return [parseFloat(llMatch[1]), parseFloat(llMatch[2])];
    }

    return null;
  } catch {
    return null;
  }
}

export function NominationModal({ isOpen, onClose, defaultCityId }: NominationModalProps) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    cityId: defaultCityId || "",
    types: [] as SpotType[],
    description: "",
    vibes: [] as string[],
    coordinates: null as [number, number] | null,
    googleMapsUrl: "",
    websiteUrl: "",
    twitterHandle: "",
    instagramHandle: "",
    linkedinUrl: "",
  });
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showRequestCity, setShowRequestCity] = useState(false);
  const [requestedCity, setRequestedCity] = useState("");
  const [cityRequestSubmitted, setCityRequestSubmitted] = useState(false);
  const [isResolvingUrl, setIsResolvingUrl] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Lock city if defaultCityId is provided
  const isCityLocked = !!defaultCityId;

  // Validate location is within city bounds (50km)
  const validateLocation = useCallback(
    (coords: [number, number] | null) => {
      if (!coords || !formData.cityId) {
        setLocationError(null);
        return true;
      }

      const city = cities.find((c) => c.id === formData.cityId);
      if (!city) return true;

      // City coordinates are [lng, lat], coords are [lat, lng]
      const distance = getDistanceKm(
        coords[0],
        coords[1],
        city.coordinates[1],
        city.coordinates[0]
      );

      if (distance > 50) {
        setLocationError(
          `Location is ${distance.toFixed(0)}km from ${city.name} center. Please select a location within the city.`
        );
        return false;
      }

      setLocationError(null);
      return true;
    },
    [formData.cityId]
  );

  // Handle Google Maps URL change
  const handleUrlChange = async (url: string) => {
    setFormData((prev) => ({ ...prev, googleMapsUrl: url }));
    setUrlError(null);

    if (!url.trim()) {
      setFormData((prev) => ({ ...prev, coordinates: null }));
      return;
    }

    // Check if it's a valid Google Maps URL
    const isShortUrl = url.includes("maps.app.goo.gl") || url.includes("goo.gl/maps");
    const isFullUrl = url.includes("google.com/maps");

    if (!isShortUrl && !isFullUrl) {
      setUrlError("Please paste a valid Google Maps link");
      return;
    }

    // Try to extract coordinates directly first
    let coords = extractCoordsFromGoogleMapsUrl(url);

    // If it's a short URL and we couldn't extract coords, resolve it
    if (!coords && isShortUrl) {
      setIsResolvingUrl(true);
      try {
        const response = await fetch(`/api/resolve-maps-url?url=${encodeURIComponent(url)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.resolvedUrl) {
            coords = extractCoordsFromGoogleMapsUrl(data.resolvedUrl);
          }
        }
      } catch (err) {
        console.error("Failed to resolve short URL:", err);
      } finally {
        setIsResolvingUrl(false);
      }
    }

    if (coords) {
      setFormData((prev) => ({ ...prev, coordinates: coords }));
      validateLocation(coords);
    } else {
      setUrlError("Could not extract location from this link. Try copying a different Google Maps link.");
    }
  };

  const handleVibeToggle = (vibe: string) => {
    setFormData((prev) => ({
      ...prev,
      vibes: prev.vibes.includes(vibe)
        ? prev.vibes.filter((v) => v !== vibe)
        : [...prev.vibes, vibe].slice(0, 5),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/nominations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          cityId: formData.cityId,
          types: formData.types,
          description: formData.description,
          vibes: formData.vibes,
          lng: formData.coordinates?.[1] || null,
          lat: formData.coordinates?.[0] || null,
          googleMapsUrl: formData.googleMapsUrl,
          websiteUrl: formData.websiteUrl || null,
          twitterHandle: formData.twitterHandle || null,
          instagramHandle: formData.instagramHandle || null,
          linkedinUrl: formData.linkedinUrl || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit nomination");
      }

      setIsSubmitted(true);
      showToast("Nomination submitted successfully!", "success");
    } catch (error) {
      console.error("Failed to submit nomination:", error);
      showToast("Failed to submit nomination. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestCity = async () => {
    if (!requestedCity.trim()) return;

    try {
      const response = await fetch("/api/city-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cityName: requestedCity }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit city request");
      }

      setCityRequestSubmitted(true);
      showToast("City request submitted!", "success");
    } catch (error) {
      console.error("Failed to submit city request:", error);
      showToast("Failed to submit city request. Please try again.", "error");
    }
  };

  const handleClose = () => {
    onClose();
    // Reset form after animation completes
    setTimeout(() => {
      setFormData({
        name: "",
        cityId: defaultCityId || "",
        types: [],
        description: "",
        vibes: [],
        coordinates: null,
        googleMapsUrl: "",
        websiteUrl: "",
        twitterHandle: "",
        instagramHandle: "",
        linkedinUrl: "",
      });
      setStep(1);
      setIsSubmitted(false);
      setLocationError(null);
      setShowRequestCity(false);
      setRequestedCity("");
      setCityRequestSubmitted(false);
      setUrlError(null);
    }, 300);
  };

  const isStep1Valid =
    formData.name &&
    formData.cityId &&
    formData.types.length > 0 &&
    formData.googleMapsUrl &&
    !locationError &&
    !urlError;
  const isStep2Valid = formData.description && formData.vibes.length > 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)]">
                    {isSubmitted
                      ? "Thanks!"
                      : showRequestCity
                      ? "Request a City"
                      : "Nominate a Spot"}
                  </h2>
                  {!isSubmitted && !showRequestCity && (
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Step {step} of 3</p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                  aria-label="Close nomination form"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Request City Form */}
              {showRequestCity ? (
                cityRequestSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8"
                  >
                    <div className="w-16 h-16 bg-[var(--brand-lime)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-[var(--brand-lime)]"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                      Request Received!
                    </h3>
                    <p className="text-[var(--text-secondary)] text-sm">
                      We&apos;ll review your city request and add it soon if there&apos;s demand.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-[var(--text-secondary)] text-sm">
                      Don&apos;t see your city in the list? Request it and we&apos;ll consider adding it.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        City Name *
                      </label>
                      <input
                        type="text"
                        value={requestedCity}
                        onChange={(e) => setRequestedCity(e.target.value)}
                        placeholder="e.g., Denver, USA"
                        className="w-full px-4 py-3 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowRequestCity(false)}
                        className="flex-1 px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] rounded-lg transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleRequestCity}
                        disabled={!requestedCity.trim()}
                        className="flex-1 px-4 py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 disabled:bg-[var(--border)] disabled:text-[var(--text-muted)] text-[#0a0a0b] rounded-lg font-medium transition-colors"
                      >
                        Submit Request
                      </button>
                    </div>
                  </motion.div>
                )
              ) : isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-[var(--brand-lime)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-[var(--brand-lime)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                    Nomination Received!
                  </h3>
                  <p className="text-[var(--text-secondary)] text-sm">
                    Thanks for helping the builder community. Your nomination will be reviewed and
                    added soon.
                  </p>
                </motion.div>
              ) : (
                <>
                  {/* Step 1: Basic Info + Location */}
                  {step === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Spot Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., The Hacker House"
                          className="w-full px-4 py-3 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          City *
                          {isCityLocked && (
                            <span className="ml-2 text-xs text-[var(--text-secondary)] font-normal">
                              (locked)
                            </span>
                          )}
                        </label>
                        <select
                          value={formData.cityId}
                          onChange={(e) =>
                            setFormData({ ...formData, cityId: e.target.value, coordinates: null, googleMapsUrl: "" })
                          }
                          disabled={isCityLocked}
                          className={`w-full px-4 py-3 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--brand-lime)]/50 ${
                            isCityLocked ? "opacity-60 cursor-not-allowed" : ""
                          }`}
                        >
                          <option value="">Select a city</option>
                          {cities.map((city) => (
                            <option key={city.id} value={city.id}>
                              {city.name}, {city.country}
                            </option>
                          ))}
                        </select>
                        {/* Only show request city option when opened from homepage (no defaultCityId) */}
                        {!isCityLocked && (
                          <button
                            type="button"
                            onClick={() => setShowRequestCity(true)}
                            className="mt-2 text-xs text-[var(--brand-lime)] hover:text-[var(--brand-lime)]/80 transition-colors"
                          >
                            City not listed? Request it →
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Type * <span className="text-[var(--text-secondary)] font-normal">(select all that apply)</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {spotTypes.map((type) => {
                            const config = spotTypeConfig[type];
                            const isSelected = formData.types.includes(type);
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setFormData((prev) => ({
                                  ...prev,
                                  types: isSelected
                                    ? prev.types.filter((t) => t !== type)
                                    : [...prev.types, type],
                                }))}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                                  isSelected
                                    ? "bg-[var(--brand-lime)]/15 border-[var(--brand-lime)]/50 text-[var(--text-primary)]"
                                    : "bg-[var(--bg-dark)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                                }`}
                              >
                                <span>{config.emoji}</span>
                                <span className="text-sm">{config.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Location - Just Google Maps URL input */}
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Google Maps Link *
                        </label>
                        <div className="space-y-2">
                          <div className="relative">
                            <svg
                              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <input
                              type="text"
                              value={formData.googleMapsUrl}
                              onChange={(e) => handleUrlChange(e.target.value)}
                              placeholder="Paste Google Maps link here..."
                              className="w-full pl-10 pr-10 py-3 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--brand-lime)]/50"
                            />
                            {isResolvingUrl && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <div className="w-4 h-4 border-2 border-[var(--brand-lime)] border-t-transparent rounded-full animate-spin" />
                              </div>
                            )}
                          </div>
                          {urlError && <p className="text-xs text-red-400">{urlError}</p>}
                          {formData.coordinates ? (
                            <p className="text-xs text-[var(--brand-lime)]">
                              ✓ Location detected
                            </p>
                          ) : (
                            <p className="text-xs text-[var(--text-secondary)]">
                              Go to Google Maps, find the spot, click &quot;Share&quot; → &quot;Copy link&quot; and paste above
                            </p>
                          )}
                          {locationError && <p className="text-xs text-red-400">{locationError}</p>}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 2: Details */}
                  {step === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Brief Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="What makes this spot great for builders? (e.g., fast wifi, great coffee, friendly community)"
                          rows={3}
                          className="w-full px-4 py-3 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:border-[var(--brand-lime)]/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Vibes * <span className="text-[var(--text-secondary)] font-normal">(select up to 5)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {vibeOptions.map((vibe) => (
                            <button
                              key={vibe}
                              type="button"
                              onClick={() => handleVibeToggle(vibe)}
                              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                formData.vibes.includes(vibe)
                                  ? "bg-[var(--brand-lime)]/15 border-[var(--brand-lime)]/50 text-[var(--brand-lime)]"
                                  : "bg-[var(--bg-dark)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                              }`}
                            >
                              {vibe}
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Step 3: Links */}
                  {step === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.websiteUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, websiteUrl: e.target.value })
                          }
                          placeholder="https://..."
                          className="w-full px-4 py-3 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          X (Twitter)
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            @
                          </span>
                          <input
                            type="text"
                            value={formData.twitterHandle}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                twitterHandle: e.target.value.replace("@", ""),
                              })
                            }
                            placeholder="spothandle"
                            className="w-full pl-8 pr-4 py-3 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          Instagram
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                            @
                          </span>
                          <input
                            type="text"
                            value={formData.instagramHandle}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                instagramHandle: e.target.value.replace("@", ""),
                              })
                            }
                            placeholder="spothandle"
                            className="w-full pl-8 pr-4 py-3 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={formData.linkedinUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, linkedinUrl: e.target.value })
                          }
                          placeholder="https://linkedin.com/company/..."
                          className="w-full px-4 py-3 bg-[var(--bg-dark)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50"
                        />
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!isSubmitted && !showRequestCity && (
              <div className="p-6 border-t border-[var(--border)]">
                <div className="flex items-center justify-between gap-3">
                  {step > 1 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-4 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 3 ? (
                    <button
                      onClick={() => setStep(step + 1)}
                      disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                      className="px-6 py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 disabled:bg-[var(--border)] disabled:text-[var(--text-muted)] text-[#0a0a0b] rounded-lg font-medium transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 disabled:opacity-50 text-[#0a0a0b] rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        "Submit Nomination"
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
