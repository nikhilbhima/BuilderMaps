"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpotCard } from "@/components/SpotCard";
import { SpotFilters } from "@/components/SpotFilters";
import { EmptyState } from "@/components/EmptyState";
import { NominationModal } from "@/components/NominationModal";
import { InlineReviewForm } from "@/components/InlineReviewForm";
import { cities } from "@/data/cities";
import { getSpotsByCity, Spot, SpotType, spotTypeConfig } from "@/data/spots";
import { useApp } from "@/contexts/AppContext";

// Inline detail panel component
function SpotDetailPanel({ spot, onClose }: { spot: Spot; onClose: () => void }) {
  const typeConfig = spotTypeConfig[spot.types[0]];
  const { getSpotUpvoteCount } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl overflow-hidden h-fit sticky top-20"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-[var(--border)]">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{typeConfig.emoji}</span>
              <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)] truncate">
                {spot.name}
              </h2>
            </div>
            <p className="text-sm text-[var(--text-secondary)] capitalize">
              {spot.types.map(t => t.replace("-", " ")).join(" · ")}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors shrink-0"
            aria-label="Close detail panel"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {/* Description */}
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          {spot.description}
        </p>

        {/* Vibes */}
        {spot.vibes && spot.vibes.length > 0 && (
          <div>
            <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Vibes
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {spot.vibes.map((vibe) => (
                <span
                  key={vibe}
                  className="px-2 py-1 bg-[var(--accent-lime)]/10 text-[var(--accent-lime)] rounded-md text-xs font-medium"
                >
                  {vibe}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 py-3 border-y border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-[var(--text-primary)]">
            <svg className="w-4 h-4 text-[var(--accent-lime)]" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            <span className="text-sm font-medium">{getSpotUpvoteCount(spot.id)}</span>
            <span className="text-xs text-[var(--text-secondary)]">upvotes</span>
          </div>
        </div>

        {/* Links */}
        <div className="space-y-2">
          {spot.googleMapsUrl && (
            <a
              href={spot.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm transition-colors group"
            >
              <svg className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-lime)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Open in Google Maps</span>
              <svg className="w-3 h-3 ml-auto text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {spot.websiteUrl && (
            <a
              href={spot.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2.5 bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] text-sm transition-colors group"
            >
              <svg className="w-4 h-4 text-[var(--text-secondary)] group-hover:text-[var(--accent-lime)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              <span>Visit Website</span>
              <svg className="w-3 h-3 ml-auto text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Social Links */}
          <div className="flex items-center gap-2 pt-1">
            {spot.twitterUrl && (
              <a
                href={spot.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Twitter/X"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {spot.instagramUrl && (
              <a
                href={spot.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}
            {spot.linkedinUrl && (
              <a
                href={spot.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="border-t border-[var(--border)] pt-4">
          <h3 className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-3">
            Reviews {spot.reviews && spot.reviews.length > 0 && `(${spot.reviews.length})`}
          </h3>

          {/* Inline Review Form */}
          <div className="mb-4">
            <InlineReviewForm spotId={spot.id} spotName={spot.name} />
          </div>

          {/* Existing Reviews */}
          {spot.reviews && spot.reviews.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {spot.reviews.map((review) => {
                const provider = review.provider || "x";
                const profileUrl = provider === "linkedin"
                  ? `https://linkedin.com/in/${review.authorHandle}`
                  : `https://x.com/${review.authorHandle}`;

                return (
                  <div
                    key={review.id}
                    className="p-3 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg"
                  >
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center text-sm font-medium text-[var(--accent-lime)] shrink-0">
                        {review.authorName?.[0]?.toUpperCase() || review.authorHandle[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          {provider === "x" ? (
                            <svg className="w-3 h-3 text-[var(--text-secondary)] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                            </svg>
                          ) : (
                            <svg className="w-3 h-3 text-[#0a66c2] shrink-0" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                          )}
                          <a
                            href={profileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-medium text-[var(--text-primary)] hover:text-[var(--accent-lime)] transition-colors truncate"
                          >
                            {review.authorName || review.authorHandle}
                          </a>
                          <span className="text-xs text-[var(--text-muted)]">
                            · {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          {review.text}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No reviews message */}
          {(!spot.reviews || spot.reviews.length === 0) && (
            <p className="text-sm text-[var(--text-muted)] text-center py-4">
              No reviews yet. Be the first to share your experience!
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function CityPage() {
  const params = useParams();
  const cityId = params.cityId as string;
  const { spotUpvoteCounts } = useApp();

  const city = cities.find((c) => c.id === cityId);
  const allSpots = getSpotsByCity(cityId);

  const [activeFilter, setActiveFilter] = useState<SpotType | "all">("all");
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [isNominationOpen, setIsNominationOpen] = useState(false);

  const filteredSpots = useMemo(() => {
    if (activeFilter === "all") return allSpots;
    return allSpots.filter((spot) => spot.types.includes(activeFilter));
  }, [allSpots, activeFilter]);

  // Sort by upvotes (using real counts from database)
  const sortedSpots = useMemo(() => {
    return [...filteredSpots].sort((a, b) => {
      const countA = spotUpvoteCounts[a.id] || 0;
      const countB = spotUpvoteCounts[b.id] || 0;
      return countB - countA;
    });
  }, [filteredSpots, spotUpvoteCounts]);

  if (!city) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--bg-dark)]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-4">
              City not found
            </h1>
            <Link
              href="/"
              className="text-[var(--accent-lime)] hover:text-[var(--accent-lime)]/80 transition-colors"
            >
              ← Back to all cities
            </Link>
          </div>
        </main>
        <Footer onNominate={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-dark)]">
      <Header />

      <main className="flex-1">
        {/* City Header */}
        <section className="border-b border-[var(--border)]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="flex items-center gap-2 text-[var(--text-secondary)] text-xs sm:text-sm mb-3 sm:mb-4">
              <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
                Cities
              </Link>
              <span>/</span>
              <span className="text-[var(--text-primary)]">{city.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-0.5 sm:mb-1">
                  {city.name}
                </h1>
                <p className="text-sm sm:text-base text-[var(--text-secondary)]">
                  {allSpots.length > 0
                    ? `${allSpots.length} spots where builders hang out`
                    : "No spots yet — be the first to add one"}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsNominationOpen(true)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 text-[#0a0a0b] rounded-lg font-semibold text-sm sm:text-base transition-colors"
              >
                <span className="text-base sm:text-lg">+</span>
                <span>Nominate a Spot</span>
              </motion.button>
            </div>
          </div>
        </section>

        {allSpots.length === 0 ? (
          <EmptyState cityName={city.name} onNominate={() => setIsNominationOpen(true)} />
        ) : (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Main content grid - List left, Detail right */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
              {/* Spot list - takes 3 columns on large screens */}
              <div className="lg:col-span-3 space-y-3 sm:space-y-4">
                {/* Filters */}
                <div className="mb-2">
                  <SpotFilters
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />
                </div>

                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-medium text-[var(--text-primary)]">
                    {sortedSpots.length} spots
                  </h2>
                  <span className="text-xs sm:text-sm text-[var(--text-secondary)] font-mono">
                    Sorted by upvotes
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  {sortedSpots.length > 0 ? (
                    sortedSpots.map((spot, index) => (
                      <SpotCard
                        key={spot.id}
                        spot={spot}
                        index={index}
                        isSelected={selectedSpot?.id === spot.id}
                        onClick={() => setSelectedSpot(spot)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[var(--text-secondary)]">No spots found for this filter.</p>
                      <button
                        onClick={() => setActiveFilter("all")}
                        className="mt-2 text-sm text-[var(--accent-lime)] hover:text-[var(--accent-lime)]/80 transition-colors"
                      >
                        Show all spots
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Detail panel - takes 2 columns on large screens */}
              <div className="lg:col-span-2 hidden lg:block">
                <AnimatePresence mode="wait">
                  {selectedSpot ? (
                    <SpotDetailPanel
                      key={selectedSpot.id}
                      spot={selectedSpot}
                      onClose={() => setSelectedSpot(null)}
                    />
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-8 text-center sticky top-20"
                    >
                      <div className="w-16 h-16 bg-[var(--bg-card-hover)] rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      </div>
                      <h3 className="text-[var(--text-secondary)] font-medium mb-1">Select a spot</h3>
                      <p className="text-sm text-[var(--text-muted)]">
                        Click on any spot to see details
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile: Show detail modal instead of panel */}
            <AnimatePresence>
              {selectedSpot && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                  onClick={() => setSelectedSpot(null)}
                >
                  <motion.div
                    initial={{ opacity: 0, y: "100%" }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: "100%" }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <SpotDetailPanel
                      spot={selectedSpot}
                      onClose={() => setSelectedSpot(null)}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        )}
      </main>

      <Footer onNominate={() => setIsNominationOpen(true)} />

      {/* Nomination Modal */}
      <NominationModal
        isOpen={isNominationOpen}
        onClose={() => setIsNominationOpen(false)}
        defaultCityId={cityId}
      />
    </div>
  );
}
