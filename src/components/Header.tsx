"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";

export function Header() {
  const { user, openLoginModal, logout } = useApp();
  return (
    <header className="sticky top-0 z-50 border-b border-[#272727] bg-[#0a0a0b]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <motion.div
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#c8ff00] flex items-center justify-center"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg sm:text-xl">📍</span>
            </motion.div>
            <span className="text-base sm:text-lg font-semibold">
              <span className="text-[#fafafa]">Builder</span>
              <span className="text-[#71717a]">Maps</span>
            </span>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              /* Logged in state */
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  {user.provider === "x" ? (
                    <svg className="w-3.5 h-3.5 text-[#71717a]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  )}
                  <span className="text-xs sm:text-sm text-[#71717a]">
                    {user.displayName || `@${user.handle}`}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={logout}
                  className="px-2.5 sm:px-3 py-1.5 sm:py-2 bg-[#131316] hover:bg-[#1a1a1f] border border-[#272727] hover:border-[#3f3f46] text-[#fafafa] rounded-lg text-xs sm:text-sm font-medium transition-colors"
                >
                  Sign Out
                </motion.button>
              </div>
            ) : (
              /* Logged out state - Simple Sign in button */
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openLoginModal}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-[#131316] hover:bg-[#1a1a1f] border border-[#272727] hover:border-[#3f3f46] text-[#fafafa] rounded-lg text-xs sm:text-sm font-medium transition-colors"
              >
                Sign in
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
