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
    active: "bg-[var(--accent-lime)]/15 text-[var(--accent-lime)] border-[var(--accent-lime)]/30",
    inactive: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]",
  },
  purple: {
    active: "bg-[var(--accent-purple)]/15 text-[var(--accent-purple)] border-[var(--accent-purple)]/30",
    inactive: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]",
  },
  orange: {
    active: "bg-[var(--accent-orange)]/15 text-[var(--accent-orange)] border-[var(--accent-orange)]/30",
    inactive: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]",
  },
  cyan: {
    active: "bg-[var(--accent-cyan)]/15 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/30",
    inactive: "bg-[var(--bg-card)] text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]",
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
