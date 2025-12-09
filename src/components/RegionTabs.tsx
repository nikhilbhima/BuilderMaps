"use client";

import { motion } from "framer-motion";
import { Region } from "@/data/cities";

interface RegionTabsProps {
  regions: Region[];
  activeRegion: Region;
  onRegionChange: (region: Region) => void;
}

export function RegionTabs({ regions, activeRegion, onRegionChange }: RegionTabsProps) {
  return (
    <div className="relative mb-6 sm:mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* Scroll container */}
      <div className="overflow-x-auto scrollbar-hide pb-2">
        <div className="flex gap-2 min-w-max sm:flex-wrap sm:min-w-0">
          {regions.map((region) => (
            <button
              key={region}
              onClick={() => onRegionChange(region)}
              className={`relative px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                activeRegion === region
                  ? "text-[#0a0a0b]"
                  : "text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f]"
              }`}
            >
              {activeRegion === region && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-[#c8ff00] rounded-lg"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{region}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Fade indicators for scroll */}
      <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-[#0a0a0b] to-transparent pointer-events-none sm:hidden" />
    </div>
  );
}
