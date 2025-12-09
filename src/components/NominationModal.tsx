"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SpotType, spotTypeConfig } from "@/data/spots";
import { cities } from "@/data/cities";

interface NominationModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCityId?: string;
}

const spotTypes: SpotType[] = ["coworking", "cafe", "hacker-house", "event-venue"];

const vibeOptions = [
  "deep focus",
  "networking",
  "casual",
  "late night",
  "fast wifi",
  "outdoor seating",
  "good coffee",
  "events",
  "community",
  "quiet",
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

// Location picker component
function LocationPicker({
  cityId,
  coordinates,
  onCoordinatesChange,
  error,
}: {
  cityId: string;
  coordinates: [number, number] | null;
  onCoordinatesChange: (coords: [number, number] | null) => void;
  error: string | null;
}) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const city = cities.find((c) => c.id === cityId);
  // City coordinates are [lng, lat], convert to [lat, lng] for Leaflet
  const cityCenter: [number, number] = city
    ? [city.coordinates[1], city.coordinates[0]]
    : [0, 0];

  // Load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      setL(leaflet.default);
    };
    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainerRef.current || !cityId) return;

    // Clean up previous map
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    mapRef.current = L.map(mapContainerRef.current, {
      center: cityCenter,
      zoom: 12,
      zoomControl: true,
    });

    L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>',
        maxZoom: 20,
      }
    ).addTo(mapRef.current);

    // Add click handler
    mapRef.current.on("click", (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onCoordinatesChange([lat, lng]);
    });

    setIsLoaded(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L, cityId]);

  // Update marker when coordinates change
  useEffect(() => {
    if (!mapRef.current || !L || !isLoaded) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add new marker if we have coordinates
    if (coordinates) {
      const iconHtml = `
        <div style="
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          background: #c8ff00;
          border: 2px solid #c8ff00;
          box-shadow: 0 0 15px rgba(200, 255, 0, 0.5);
          transform: translate(-50%, -50%);
        ">
          📍
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-picker-marker",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      markerRef.current = L.marker([coordinates[0], coordinates[1]], { icon }).addTo(
        mapRef.current
      );
    }
  }, [coordinates, isLoaded, L]);

  // Recenter map when city changes
  useEffect(() => {
    if (mapRef.current && cityCenter[0] !== 0) {
      mapRef.current.flyTo(cityCenter, 12, { duration: 0.8 });
      onCoordinatesChange(null);
    }
  }, [cityId]);

  if (!cityId) {
    return (
      <div className="w-full h-48 bg-[#0d0d0d] border border-[#272727] rounded-lg flex items-center justify-center">
        <p className="text-[#52525b] text-sm">Select a city first</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        ref={mapContainerRef}
        className="w-full h-48 rounded-lg overflow-hidden border border-[#272727]"
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#0d0d0d] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#c8ff00] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {coordinates ? (
        <p className="text-xs text-[#71717a]">
          📍 {coordinates[0].toFixed(5)}, {coordinates[1].toFixed(5)}
        </p>
      ) : (
        <p className="text-xs text-[#71717a]">Click on the map to pin the exact location</p>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
      <style jsx global>{`
        .custom-picker-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </div>
  );
}

export function NominationModal({ isOpen, onClose, defaultCityId }: NominationModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    cityId: defaultCityId || "",
    type: "" as SpotType | "",
    description: "",
    vibes: [] as string[],
    coordinates: null as [number, number] | null,
    googleMapsUrl: "",
    websiteUrl: "",
    twitterHandle: "",
    nominatorTwitter: "",
  });
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showRequestCity, setShowRequestCity] = useState(false);
  const [requestedCity, setRequestedCity] = useState("");
  const [cityRequestSubmitted, setCityRequestSubmitted] = useState(false);

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

  const handleCoordinatesChange = (coords: [number, number] | null) => {
    setFormData((prev) => ({ ...prev, coordinates: coords }));
    validateLocation(coords);
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
    // Simulate submission delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // In production, this would submit to an API

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleRequestCity = async () => {
    if (!requestedCity.trim()) return;
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // In production, submit to API
    setCityRequestSubmitted(true);
  };

  const handleClose = () => {
    onClose();
    // Reset form after animation completes
    setTimeout(() => {
      setFormData({
        name: "",
        cityId: defaultCityId || "",
        type: "" as SpotType | "",
        description: "",
        vibes: [],
        coordinates: null,
        googleMapsUrl: "",
        websiteUrl: "",
        twitterHandle: "",
        nominatorTwitter: "",
      });
      setStep(1);
      setIsSubmitted(false);
      setLocationError(null);
      setShowRequestCity(false);
      setRequestedCity("");
      setCityRequestSubmitted(false);
    }, 300);
  };

  const isStep1Valid =
    formData.name &&
    formData.cityId &&
    formData.type &&
    formData.coordinates &&
    !locationError;
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
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-[#131316] border border-[#272727] rounded-2xl z-50 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#272727]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-[#fafafa]">
                    {isSubmitted
                      ? "Thanks!"
                      : showRequestCity
                      ? "Request a City"
                      : "Nominate a Spot"}
                  </h2>
                  {!isSubmitted && !showRequestCity && (
                    <p className="text-sm text-[#71717a] mt-1">Step {step} of 3</p>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f] rounded-lg transition-colors"
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
                    <div className="w-16 h-16 bg-[#c8ff00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-[#c8ff00]"
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
                    <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
                      Request Received!
                    </h3>
                    <p className="text-[#71717a] text-sm">
                      We&apos;ll review your city request and add it soon if there&apos;s demand.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-4"
                  >
                    <p className="text-[#71717a] text-sm">
                      Don&apos;t see your city in the list? Request it and we&apos;ll consider adding it.
                    </p>
                    <div>
                      <label className="block text-sm font-medium text-[#fafafa] mb-2">
                        City Name *
                      </label>
                      <input
                        type="text"
                        value={requestedCity}
                        onChange={(e) => setRequestedCity(e.target.value)}
                        placeholder="e.g., Denver, USA"
                        className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#272727] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#c8ff00]/50"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowRequestCity(false)}
                        className="flex-1 px-4 py-2 text-[#71717a] hover:text-[#fafafa] border border-[#272727] rounded-lg transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleRequestCity}
                        disabled={!requestedCity.trim()}
                        className="flex-1 px-4 py-2 bg-[#c8ff00] hover:bg-[#c8ff00]/90 disabled:bg-[#272727] disabled:text-[#52525b] text-[#0d0d0d] rounded-lg font-medium transition-colors"
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
                  <div className="w-16 h-16 bg-[#c8ff00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-[#c8ff00]"
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
                  <h3 className="text-lg font-semibold text-[#fafafa] mb-2">
                    Nomination Received!
                  </h3>
                  <p className="text-[#71717a] text-sm">
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
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Spot Name *
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g., The Hacker House"
                          className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#272727] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#c8ff00]/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          City *
                          {isCityLocked && (
                            <span className="ml-2 text-xs text-[#71717a] font-normal">
                              (locked)
                            </span>
                          )}
                        </label>
                        <select
                          value={formData.cityId}
                          onChange={(e) =>
                            setFormData({ ...formData, cityId: e.target.value, coordinates: null })
                          }
                          disabled={isCityLocked}
                          className={`w-full px-4 py-3 bg-[#0d0d0d] border border-[#272727] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#c8ff00]/50 ${
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
                            className="mt-2 text-xs text-[#c8ff00] hover:text-[#c8ff00]/80 transition-colors"
                          >
                            City not listed? Request it →
                          </button>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Type *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {spotTypes.map((type) => {
                            const config = spotTypeConfig[type];
                            return (
                              <button
                                key={type}
                                type="button"
                                onClick={() => setFormData({ ...formData, type })}
                                className={`flex items-center gap-2 px-4 py-3 rounded-lg border transition-colors ${
                                  formData.type === type
                                    ? "bg-[#c8ff00]/15 border-[#c8ff00]/50 text-[#fafafa]"
                                    : "bg-[#0d0d0d] border-[#272727] text-[#71717a] hover:border-[#3f3f46]"
                                }`}
                              >
                                <span>{config.emoji}</span>
                                <span className="text-sm">{config.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Location Picker */}
                      <div>
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Location * <span className="text-[#71717a] font-normal">(click map to pin)</span>
                        </label>
                        <LocationPicker
                          cityId={formData.cityId}
                          coordinates={formData.coordinates}
                          onCoordinatesChange={handleCoordinatesChange}
                          error={locationError}
                        />
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
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Description *
                        </label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          placeholder="What makes this spot great for builders?"
                          rows={3}
                          className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#272727] rounded-lg text-[#fafafa] placeholder-[#52525b] resize-none focus:outline-none focus:border-[#c8ff00]/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Vibes * <span className="text-[#71717a] font-normal">(select up to 5)</span>
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {vibeOptions.map((vibe) => (
                            <button
                              key={vibe}
                              type="button"
                              onClick={() => handleVibeToggle(vibe)}
                              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                                formData.vibes.includes(vibe)
                                  ? "bg-[#c8ff00]/15 border-[#c8ff00]/50 text-[#c8ff00]"
                                  : "bg-[#0d0d0d] border-[#272727] text-[#71717a] hover:border-[#3f3f46]"
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
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Google Maps Link
                        </label>
                        <input
                          type="url"
                          value={formData.googleMapsUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, googleMapsUrl: e.target.value })
                          }
                          placeholder="https://maps.google.com/..."
                          className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#272727] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#c8ff00]/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Website
                        </label>
                        <input
                          type="url"
                          value={formData.websiteUrl}
                          onChange={(e) =>
                            setFormData({ ...formData, websiteUrl: e.target.value })
                          }
                          placeholder="https://..."
                          className="w-full px-4 py-3 bg-[#0d0d0d] border border-[#272727] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#c8ff00]/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Spot&apos;s X Handle
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]">
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
                            className="w-full pl-8 pr-4 py-3 bg-[#0d0d0d] border border-[#272727] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#c8ff00]/50"
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-[#272727]">
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Your X Handle{" "}
                          <span className="text-[#71717a] font-normal">(for credit)</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#52525b]">
                            @
                          </span>
                          <input
                            type="text"
                            value={formData.nominatorTwitter}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                nominatorTwitter: e.target.value.replace("@", ""),
                              })
                            }
                            placeholder="yourhandle"
                            className="w-full pl-8 pr-4 py-3 bg-[#0d0d0d] border border-[#272727] rounded-lg text-[#fafafa] placeholder-[#52525b] focus:outline-none focus:border-[#c8ff00]/50"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {!isSubmitted && !showRequestCity && (
              <div className="p-6 border-t border-[#272727]">
                <div className="flex items-center justify-between gap-3">
                  {step > 1 ? (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="px-4 py-2 text-[#71717a] hover:text-[#fafafa] transition-colors"
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
                      className="px-6 py-2 bg-[#c8ff00] hover:bg-[#c8ff00]/90 disabled:bg-[#272727] disabled:text-[#52525b] text-[#0d0d0d] rounded-lg font-medium transition-colors"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="px-6 py-2 bg-[#c8ff00] hover:bg-[#c8ff00]/90 disabled:opacity-50 text-[#0d0d0d] rounded-lg font-medium transition-colors flex items-center gap-2"
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
