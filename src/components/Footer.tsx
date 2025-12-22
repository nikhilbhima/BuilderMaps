"use client";

import Link from "next/link";

interface FooterProps {
  onNominate?: () => void;
}

export function Footer({ onNominate }: FooterProps) {
  return (
    <footer className="border-t border-[var(--border)] py-6 sm:py-8 mt-12 sm:mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:gap-6">
          {/* Main row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <a
              href="https://x.com/nikhilbhima"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Follow on X"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-6 text-xs sm:text-sm">
              <Link
                href="/about"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                About
              </Link>
              <button
                onClick={onNominate}
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Nominate
              </button>
              <Link
                href="/terms"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/become-admin"
                className="text-[var(--text-secondary)] hover:text-[var(--accent-lime)] transition-colors"
              >
                Become a City Admin
              </Link>
            </div>
          </div>

          {/* Copyright row */}
          <div className="text-center text-[var(--text-secondary)] text-[10px] sm:text-xs">
            <p>&copy; {new Date().getFullYear()} Builder Maps. Community-driven.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
