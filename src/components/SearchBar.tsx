"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { cities } from "@/data/cities";
import { spots, spotTypeConfig } from "@/data/spots";

interface SearchResult {
  type: "city" | "spot";
  id: string;
  name: string;
  subtitle: string;
  href: string;
  emoji?: string;
}

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const results = useMemo<SearchResult[]>(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase().trim();
    const matches: SearchResult[] = [];

    // Search cities
    cities.forEach((city) => {
      if (
        city.name.toLowerCase().includes(q) ||
        city.country.toLowerCase().includes(q)
      ) {
        matches.push({
          type: "city",
          id: city.id,
          name: city.name,
          subtitle: `${city.country} · ${city.spotCount} spots`,
          href: `/city/${city.id}`,
        });
      }
    });

    // Search spots
    spots
      .filter((s) => s.approved)
      .forEach((spot) => {
        if (
          spot.name.toLowerCase().includes(q) ||
          spot.description.toLowerCase().includes(q) ||
          spot.vibes.some((v) => v.toLowerCase().includes(q))
        ) {
          const city = cities.find((c) => c.id === spot.cityId);
          const typeConfig = spotTypeConfig[spot.types[0]];
          matches.push({
            type: "spot",
            id: spot.id,
            name: spot.name,
            subtitle: city?.name || spot.cityId,
            href: `/city/${spot.cityId}?spot=${spot.id}`,
            emoji: typeConfig?.emoji,
          });
        }
      });

    // Limit results
    return matches.slice(0, 8);
  }, [query]);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
        break;
      case "Enter":
        e.preventDefault();
        if (results[selectedIndex]) {
          window.location.href = results[selectedIndex].href;
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search cities or spots..."
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-lime)]/50 transition-colors text-sm"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="py-1">
              {results.map((result, index) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 transition-colors ${
                    index === selectedIndex
                      ? "bg-[var(--accent-lime)]/10"
                      : "hover:bg-[var(--bg-card-hover)]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      result.type === "city"
                        ? "bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]"
                        : "bg-[var(--bg-card-hover)]"
                    }`}
                  >
                    {result.type === "city" ? "🌆" : result.emoji || "📍"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                      {result.name}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">
                      {result.subtitle}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] bg-[var(--bg-card-hover)] px-1.5 py-0.5 rounded">
                    {result.type}
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}

        {isOpen && query.trim() && results.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg shadow-xl overflow-hidden z-50"
          >
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No results found for &ldquo;{query}&rdquo;</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Try searching for a city or spot name</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
