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
                <span className="text-xs sm:text-sm text-[#71717a]">
                  @{user.handle}
                </span>
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
