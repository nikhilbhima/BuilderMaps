"use client";

import Link from "next/link";

interface FooterProps {
  onNominate?: () => void;
}

export function Footer({ onNominate }: FooterProps) {
  return (
    <footer className="border-t border-[#272727] py-6 sm:py-8 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Main row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[#71717a] text-xs sm:text-sm">
              <span>Built by</span>
              <a
                href="https://x.com/nikhilbhima"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#c8ff00] hover:text-[#c8ff00]/80 transition-colors font-medium"
              >
                @nikhilbhima
              </a>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-6 text-xs sm:text-sm">
              <Link
                href="/about"
                className="text-[#71717a] hover:text-[#fafafa] transition-colors"
              >
                About
              </Link>
              <button
                onClick={onNominate}
                className="text-[#71717a] hover:text-[#fafafa] transition-colors"
              >
                Nominate
              </button>
            </div>
          </div>

          {/* Copyright row */}
          <div className="text-center text-[#71717a] text-[10px] sm:text-xs">
            <p>&copy; {new Date().getFullYear()} Builder Maps. Community-driven.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
