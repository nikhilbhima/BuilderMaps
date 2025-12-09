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
    <div className="flex flex-wrap gap-2 mb-8">
      {regions.map((region) => (
        <button
          key={region}
          onClick={() => onRegionChange(region)}
          className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
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
  );
}
