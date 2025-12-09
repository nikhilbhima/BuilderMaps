"use client";

import { motion } from "framer-motion";

interface EmptyStateProps {
  cityName: string;
}

export function EmptyState({ cityName }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="w-20 h-20 bg-[#131316] border border-[#272727] rounded-full flex items-center justify-center mb-6">
        <span className="text-4xl">🗺️</span>
      </div>
      <h2 className="text-2xl font-semibold text-[#fafafa] mb-2">
        No spots in {cityName} yet
      </h2>
      <p className="text-[#71717a] max-w-md mb-8">
        Be the first to add your favorite builder hangouts in {cityName}. Help
        the community discover where to work and connect.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-6 py-3 bg-[#c8ff00] text-[#0a0a0b] rounded-lg font-semibold hover:bg-[#c8ff00]/90 transition-colors"
      >
        <span className="text-xl">+</span>
        <span>Nominate the First Spot</span>
      </motion.button>

      <div className="mt-12 text-sm text-[#3f3f46]">
        <p>Want to be the city admin for {cityName}?</p>
        <a
          href="https://x.com/nikhilbhima"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#c8ff00] hover:text-[#c8ff00]/80 transition-colors"
        >
          DM @nikhilbhima on X
        </a>
      </div>
    </motion.div>
  );
}
