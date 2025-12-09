"use client";

import { motion } from "framer-motion";
import { Spot, spotTypeConfig } from "@/data/spots";

interface SpotCardProps {
  spot: Spot;
  isSelected?: boolean;
  onClick?: () => void;
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

export function SpotCard({ spot, isSelected, onClick, index = 0 }: SpotCardProps) {
  const typeConfig = spotTypeConfig[spot.type];
  const colors = colorClasses[typeConfig.color] || colorClasses.purple;

  return (
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
            <h3 className="text-[#fafafa] font-medium">{spot.name}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${colors.badge}`}>
              {typeConfig.label}
            </span>
          </div>
        </div>
        {spot.featured && (
          <span className="text-xs px-2 py-1 bg-[#c8ff00]/15 text-[#c8ff00] rounded-full font-mono">
            Featured
          </span>
        )}
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1f] hover:bg-[#c8ff00]/15 border border-[#272727] hover:border-[#c8ff00]/30 rounded-lg text-sm transition-colors group"
          onClick={(e) => {
            e.stopPropagation();
            // Upvote logic will go here
          }}
        >
          <svg className="w-4 h-4 text-[#c8ff00] group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          <span className="text-[#fafafa] font-medium font-mono">{spot.upvotes}</span>
        </motion.button>

        <div className="flex items-center gap-1">
          {spot.googleMapsUrl && (
            <a
              href={spot.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f] rounded-lg transition-colors"
              title="Open in Maps"
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
              title="Events"
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
              title="Twitter"
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
              title="Website"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
