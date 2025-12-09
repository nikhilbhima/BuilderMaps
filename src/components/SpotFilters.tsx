"use client";

import { motion } from "framer-motion";
import { SpotType } from "@/data/spots";

interface SpotFiltersProps {
  activeFilter: SpotType | "all";
  onFilterChange: (filter: SpotType | "all") => void;
}

const filters: { value: SpotType | "all"; label: string; emoji: string; color: string }[] = [
  { value: "all", label: "All", emoji: "✨", color: "lime" },
  { value: "coworking", label: "Coworking", emoji: "💻", color: "purple" },
  { value: "hacker-house", label: "Hacker Houses", emoji: "🏠", color: "orange" },
  { value: "cafe", label: "Cafes", emoji: "☕", color: "cyan" },
  { value: "community", label: "Community", emoji: "👥", color: "lime" },
];

const colorMap: Record<string, { active: string; inactive: string }> = {
  lime: {
    active: "bg-[#c8ff00]/15 text-[#c8ff00] border-[#c8ff00]/30",
    inactive: "bg-[#131316] text-[#71717a] border-[#272727] hover:bg-[#1a1a1f] hover:text-[#fafafa]",
  },
  purple: {
    active: "bg-[#a855f7]/15 text-[#a855f7] border-[#a855f7]/30",
    inactive: "bg-[#131316] text-[#71717a] border-[#272727] hover:bg-[#1a1a1f] hover:text-[#fafafa]",
  },
  orange: {
    active: "bg-[#ff6b35]/15 text-[#ff6b35] border-[#ff6b35]/30",
    inactive: "bg-[#131316] text-[#71717a] border-[#272727] hover:bg-[#1a1a1f] hover:text-[#fafafa]",
  },
  cyan: {
    active: "bg-[#00d4ff]/15 text-[#00d4ff] border-[#00d4ff]/30",
    inactive: "bg-[#131316] text-[#71717a] border-[#272727] hover:bg-[#1a1a1f] hover:text-[#fafafa]",
  },
};

export function SpotFilters({ activeFilter, onFilterChange }: SpotFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        const colors = colorMap[filter.color];

        return (
          <motion.button
            key={filter.value}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onFilterChange(filter.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all duration-300 ${
              isActive ? colors.active : colors.inactive
            }`}
          >
            <span>{filter.emoji}</span>
            <span>{filter.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
