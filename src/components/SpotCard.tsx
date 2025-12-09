"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spot, spotTypeConfig } from "@/data/spots";
import { useApp } from "@/contexts/AppContext";

interface SpotCardProps {
  spot: Spot;
  isSelected?: boolean;
  onClick?: () => void;
  onExpand?: () => void;
  index?: number;
}

const colorClasses: Record<string, { badge: string; text: string }> = {
  purple: {
    badge: "bg-[#a855f7]/20 text-[#a855f7] border border-[#a855f7]/30",
    text: "text-[#a855f7]",
  },
  orange: {
    badge: "bg-[#ff6b35]/20 text-[#ff6b35] border border-[#ff6b35]/30",
    text: "text-[#ff6b35]",
  },
  cyan: {
    badge: "bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30",
    text: "text-[#00d4ff]",
  },
  lime: {
    badge: "bg-[#c8ff00]/15 text-[#c8ff00] border border-[#c8ff00]/30",
    text: "text-[#c8ff00]",
  },
};

// Upvoters List Modal
function UpvotersModal({
  isOpen,
  onClose,
  upvoters,
  spotName,
}: {
  isOpen: boolean;
  onClose: () => void;
  upvoters: { handle: string; displayName?: string }[];
  spotName: string;
}) {
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-[#131316] border border-[#272727] rounded-xl z-[60] overflow-hidden"
          >
            <div className="p-4 border-b border-[#272727]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#fafafa]">
                  Upvoters
                </h3>
                <button
                  onClick={onClose}
                  className="p-1.5 text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f] rounded-lg transition-colors"
                  aria-label="Close upvoters list"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-[#71717a] mt-1">
                {upvoters.length} people upvoted {spotName}
              </p>
            </div>
            <div className="max-h-64 overflow-y-auto p-2">
              {upvoters.map((upvoter) => (
                <a
                  key={upvoter.handle}
                  href={`https://x.com/${upvoter.handle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 hover:bg-[#1a1a1f] rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[#272727] flex items-center justify-center text-sm font-medium text-[#c8ff00]">
                    {upvoter.displayName?.[0]?.toUpperCase() || upvoter.handle[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#fafafa]">
                      {upvoter.displayName || upvoter.handle}
                    </p>
                    <p className="text-xs text-[#71717a]">@{upvoter.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export function SpotCard({ spot, isSelected, onClick, onExpand, index = 0 }: SpotCardProps) {
  const { hasUpvoted, toggleUpvote, user } = useApp();
  const [localUpvotes, setLocalUpvotes] = useState(spot.upvotes);
  const [showUpvoters, setShowUpvoters] = useState(false);
  const isUpvoted = hasUpvoted(spot.id);
  const typeConfig = spotTypeConfig[spot.type];
  const colors = colorClasses[typeConfig.color] || colorClasses.purple;

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleUpvote(spot.id);
    if (user) {
      setLocalUpvotes((prev) => newState ? prev + 1 : prev - 1);
    }
  };

  const handleShowUpvoters = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUpvoters(true);
  };

  const handleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onExpand?.();
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
            ? "bg-[#1a1a1f] border-[#c8ff00]/50"
            : "bg-[#131316] border-[#272727] hover:border-[#3f3f46] hover:bg-[#1a1a1f]"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={`text-xl ${colors.text}`}>{typeConfig.emoji}</span>
            <div>
              <h3 className="text-[#fafafa] font-medium truncate max-w-[180px]">{spot.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${colors.badge}`}>
                {typeConfig.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {spot.featured && (
              <span className="text-xs px-2 py-1 bg-[#c8ff00]/15 text-[#c8ff00] rounded-full font-mono">
                Featured
              </span>
            )}
            {/* Expand button */}
            <button
              onClick={handleExpand}
              className="p-1.5 text-[#71717a] hover:text-[#c8ff00] hover:bg-[#272727] rounded-lg transition-colors"
              aria-label="View spot details"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-[#71717a] text-sm mb-3 line-clamp-2">{spot.description}</p>

        {/* Vibe tags */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {spot.vibes.slice(0, 3).map((vibe) => (
            <span
              key={vibe}
              className="text-xs px-2 py-0.5 bg-[#1a1a1f] text-[#71717a] rounded-full border border-[#272727]"
            >
              {vibe}
            </span>
          ))}
          {spot.vibes.length > 3 && (
            <span className="text-xs px-2 py-0.5 text-[#3f3f46]">
              +{spot.vibes.length - 3}
            </span>
          )}
        </div>

        {/* Upvotes and links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm transition-colors group ${
                isUpvoted
                  ? "bg-[#c8ff00]/20 border-[#c8ff00]/50"
                  : "bg-[#1a1a1f] hover:bg-[#c8ff00]/15 border-[#272727] hover:border-[#c8ff00]/30"
              }`}
              onClick={handleUpvote}
            >
              <svg className={`w-4 h-4 ${isUpvoted ? "text-[#c8ff00]" : "text-[#c8ff00]"} group-hover:scale-110 transition-transform`} fill={isUpvoted ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
              <span className="text-[#fafafa] font-medium font-mono">{localUpvotes}</span>
            </motion.button>

            {/* Upvoters display - clickable to show list */}
            {spot.upvoters && spot.upvoters.length > 0 && (
              <button
                onClick={handleShowUpvoters}
                className="flex items-center hover:opacity-80 transition-opacity"
              >
                <div className="flex -space-x-1.5">
                  {spot.upvoters.slice(0, 3).map((upvoter, i) => (
                    <div
                      key={upvoter.handle}
                      className="relative"
                      style={{ zIndex: 3 - i }}
                    >
                      <div className="w-6 h-6 rounded-full bg-[#272727] border-2 border-[#131316] flex items-center justify-center text-[10px] font-medium text-[#c8ff00]">
                        {upvoter.displayName?.[0]?.toUpperCase() || upvoter.handle[0].toUpperCase()}
                      </div>
                    </div>
                  ))}
                </div>
                {spot.upvoters.length > 3 && (
                  <span className="ml-1.5 text-xs text-[#52525b]">
                    +{spot.upvoters.length - 3}
                  </span>
                )}
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
                className="p-2 text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f] rounded-lg transition-colors"
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
                className="p-2 text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f] rounded-lg transition-colors"
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
                className="p-2 text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f] rounded-lg transition-colors"
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
                className="p-2 text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f] rounded-lg transition-colors"
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
      {spot.upvoters && (
        <UpvotersModal
          isOpen={showUpvoters}
          onClose={() => setShowUpvoters(false)}
          upvoters={spot.upvoters}
          spotName={spot.name}
        />
      )}
    </>
  );
}
