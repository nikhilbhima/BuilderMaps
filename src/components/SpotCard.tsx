"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spot, spotTypeConfig } from "@/data/spots";
import { useApp } from "@/contexts/AppContext";

interface Upvoter {
  handle: string;
  displayName?: string;
  provider?: "x" | "linkedin";
  avatarUrl?: string;
}

interface SpotCardProps {
  spot: Spot;
  isSelected?: boolean;
  onClick?: () => void;
  index?: number;
}

const colorClasses: Record<string, { badge: string; text: string }> = {
  purple: {
    badge: "bg-[var(--accent-purple)]/20 text-[var(--accent-purple)] border border-[var(--accent-purple)]/30",
    text: "text-[var(--accent-purple)]",
  },
  orange: {
    badge: "bg-[var(--accent-orange)]/20 text-[var(--accent-orange)] border border-[var(--accent-orange)]/30",
    text: "text-[var(--accent-orange)]",
  },
  cyan: {
    badge: "bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30",
    text: "text-[var(--accent-cyan)]",
  },
  lime: {
    badge: "bg-[var(--accent-lime)]/15 text-[var(--accent-lime)] border border-[var(--accent-lime)]/30",
    text: "text-[var(--accent-lime)]",
  },
};

// Upvoters List Modal
function UpvotersModal({
  isOpen,
  onClose,
  spotId,
  spotName,
  upvoteCount,
}: {
  isOpen: boolean;
  onClose: () => void;
  spotId: string;
  spotName: string;
  upvoteCount: number;
}) {
  const [upvoters, setUpvoters] = useState<Upvoter[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchUpvoters = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/spot-upvoters?spotId=${spotId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to fetch upvoters");
          return;
        }

        setUpvoters(data.upvoters || []);
      } catch {
        setError("Failed to load upvoters");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUpvoters();
  }, [isOpen, spotId]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-xl z-[60] overflow-hidden"
          >
            <div className="p-4 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Upvoters
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                  aria-label="Close upvoters list"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                {upvoteCount} {upvoteCount === 1 ? "person" : "people"} upvoted {spotName}
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-[var(--brand-lime)] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              {error && (
                <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
                  {error}
                </div>
              )}
              {!isLoading && !error && upvoters.length === 0 && (
                <div className="text-center py-8 text-[var(--text-secondary)] text-sm">
                  No upvoters yet
                </div>
              )}
              {!isLoading && !error && upvoters.map((upvoter, index) => {
                const provider = upvoter.provider || "x";
                const profileUrl = provider === "linkedin"
                  ? `https://linkedin.com/in/${upvoter.handle}`
                  : `https://x.com/${upvoter.handle}`;

                return (
                  <a
                    key={`${upvoter.handle}-${index}`}
                    href={profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center text-sm font-medium text-[var(--brand-lime)]">
                      {upvoter.displayName?.[0]?.toUpperCase() || upvoter.handle[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        {provider === "x" ? (
                          <svg className="w-3 h-3 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        )}
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {upvoter.displayName || upvoter.handle}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">@{upvoter.handle}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SpotCard({ spot, isSelected, onClick, index = 0 }: SpotCardProps) {
  const { hasUpvoted, toggleUpvote, user, getSpotUpvoteCount } = useApp();
  const [showUpvoters, setShowUpvoters] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const isUpvoted = hasUpvoted(spot.id);
  const typeConfig = spotTypeConfig[spot.types[0]];
  const colors = colorClasses[typeConfig.color] || colorClasses.purple;

  // Get real upvote count from database
  const displayUpvotes = getSpotUpvoteCount(spot.id);

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isProcessing) return;

    if (!user) {
      toggleUpvote(spot.id);
      return;
    }

    setIsProcessing(true);
    try {
      await toggleUpvote(spot.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShowUpvoters = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUpvoters(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        onClick={onClick}
        className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
          isSelected
            ? "bg-[var(--bg-card-hover)] border-[var(--brand-lime)]/50"
            : "bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-card-hover)]"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xl ${colors.text}`}>{typeConfig.emoji}</span>
            <div>
              <h3 className="text-[var(--text-primary)] font-medium truncate max-w-[180px]">{spot.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${colors.badge}`}>
                {typeConfig.label}
              </span>
            </div>
          </div>
        </div>

        <p className="text-[var(--text-secondary)] text-sm mb-3 line-clamp-2">{spot.description}</p>

        {/* Vibe tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {spot.vibes.slice(0, 3).map((vibe) => (
            <span
              key={vibe}
              className="text-xs px-2 py-0.5 bg-[var(--bg-card-hover)] text-[var(--text-secondary)] rounded-full border border-[var(--border)]"
            >
              {vibe}
            </span>
          ))}
          {spot.vibes.length > 3 && (
            <span className="text-xs px-2 py-0.5 text-[var(--text-muted)]">
              +{spot.vibes.length - 3}
            </span>
          )}
        </div>

        {/* Upvotes and links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: isProcessing ? 1 : 1.05 }}
              whileTap={{ scale: isProcessing ? 1 : 0.95 }}
              disabled={isProcessing}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-colors group ${
                isUpvoted
                  ? "bg-[var(--brand-lime)]/20 border-[var(--brand-lime)]/50"
                  : "bg-[var(--bg-card-hover)] hover:bg-[var(--brand-lime)]/15 border-[var(--border)] hover:border-[var(--brand-lime)]/30"
              }`}
              onClick={handleUpvote}
            >
              <svg className={`w-4 h-4 text-[var(--brand-lime)] group-hover:scale-110 transition-transform`} fill={isUpvoted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-[var(--text-primary)] font-medium font-mono">{displayUpvotes}</span>
            </motion.button>

            {/* Upvoters display - clickable to show list (only for logged-in users) */}
            {displayUpvotes > 0 && user && (
              <button
                onClick={handleShowUpvoters}
                className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>View</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1">
            {spot.googleMapsUrl && (
              <a
                href={spot.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                aria-label="Open in Google Maps"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>
            )}
            {spot.lumaUrl && (
              <a
                href={spot.lumaUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                aria-label="View events"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </a>
            )}
            {spot.twitterUrl && (
              <a
                href={spot.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                aria-label="View on X (Twitter)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {spot.websiteUrl && (
              <a
                href={spot.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors"
                aria-label="Visit website"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* Upvoters Modal */}
      <UpvotersModal
        isOpen={showUpvoters}
        onClose={() => setShowUpvoters(false)}
        spotId={spot.id}
        spotName={spot.name}
        upvoteCount={displayUpvotes}
      />
    </>
  );
}
