"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  cityName: string;
  onNominate?: () => void;
}

export function EmptyState({ cityName, onNominate }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 bg-[var(--bg-card)] border border-[var(--border)] rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🗺️</span>
      </div>
      <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
        No spots in {cityName} yet
      </h2>
      <p className="text-[var(--text-secondary)] max-w-md mb-8">
        Be the first to add your favorite builder hangouts in {cityName}. Help
        the community discover where to work and connect.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onNominate}
        className="flex items-center gap-2 px-6 py-3 bg-[var(--brand-lime)] text-[#0a0a0b] rounded-lg font-semibold hover:opacity-90 transition-colors"
      >
        <span className="text-xl">+</span>
        <span>Nominate the First Spot</span>
      </motion.button>

      <div className="mt-12 text-sm text-[var(--text-muted)]">
        <p>Want to be the city admin for {cityName}?</p>
        <a
          href="https://x.com/nikhilbhima"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[var(--accent-lime)] hover:opacity-80 transition-colors"
        >
          DM @nikhilbhima on X
        </a>
      </div>
    </motion.div>
  );
}
