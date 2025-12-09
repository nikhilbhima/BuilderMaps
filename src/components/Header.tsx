"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#272727] bg-[#0a0a0b]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <motion.div
              className="w-9 h-9 rounded-xl bg-[#c8ff00] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-xl">📍</span>
            </motion.div>
            <span className="text-lg font-semibold">
              <span className="text-[#fafafa]">Builder</span>
              <span className="text-[#71717a]">Maps</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 bg-[#131316] hover:bg-[#1a1a1f] border border-[#272727] hover:border-[#3f3f46] text-[#fafafa] rounded-lg text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              <span>Login with X</span>
            </motion.button>
          </div>
        </div>
      </div>
    </header>
  );
}
