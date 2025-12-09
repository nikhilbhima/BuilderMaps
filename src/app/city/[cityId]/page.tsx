"use client";

import { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SpotCard } from "@/components/SpotCard";
import { SpotFilters } from "@/components/SpotFilters";
import { MapView } from "@/components/MapView";
import { EmptyState } from "@/components/EmptyState";
import { cities } from "@/data/cities";
import { getSpotsByCity, Spot, SpotType } from "@/data/spots";

export default function CityPage() {
  const params = useParams();
  const cityId = params.cityId as string;

  const city = cities.find((c) => c.id === cityId);
  const allSpots = getSpotsByCity(cityId);

  const [activeFilter, setActiveFilter] = useState<SpotType | "all">("all");
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);

  const filteredSpots = useMemo(() => {
    if (activeFilter === "all") return allSpots;
    return allSpots.filter((spot) => spot.type === activeFilter);
  }, [allSpots, activeFilter]);

  // Sort by upvotes
  const sortedSpots = useMemo(() => {
    return [...filteredSpots].sort((a, b) => b.upvotes - a.upvotes);
  }, [filteredSpots]);

  if (!city) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0b]">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-[#fafafa] mb-4">
              City not found
            </h1>
            <Link
              href="/"
              className="text-[#c8ff00] hover:text-[#c8ff00]/80 transition-colors"
            >
              ← Back to all cities
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b]">
      <Header />

      <main className="flex-1">
        {/* City Header */}
        <section className="border-b border-[#272727]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center gap-2 text-[#71717a] text-sm mb-4">
              <Link href="/" className="hover:text-[#fafafa] transition-colors">
                Cities
              </Link>
              <span>/</span>
              <span className="text-[#fafafa]">{city.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-[#fafafa] mb-1">
                  {city.name}
                </h1>
                <p className="text-[#71717a]">
                  {allSpots.length > 0
                    ? `${allSpots.length} spots where builders hang out`
                    : "No spots yet — be the first to add one"}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 bg-[#c8ff00] hover:bg-[#c8ff00]/90 text-[#0a0a0b] rounded-lg font-semibold transition-colors"
              >
                <span className="text-lg">+</span>
                <span>Nominate a Spot</span>
              </motion.button>
            </div>
          </div>
        </section>

        {allSpots.length === 0 ? (
          <EmptyState cityName={city.name} />
        ) : (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Filters */}
            <div className="mb-6">
              <SpotFilters
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spot list */}
              <div className="space-y-4 order-2 lg:order-1">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-[#fafafa]">
                    {sortedSpots.length} spots
                  </h2>
                  <span className="text-sm text-[#71717a] font-mono">
                    Sorted by upvotes
                  </span>
                </div>

                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {sortedSpots.map((spot, index) => (
                    <SpotCard
                      key={spot.id}
                      spot={spot}
                      index={index}
                      isSelected={selectedSpot?.id === spot.id}
                      onClick={() => setSelectedSpot(spot)}
                    />
                  ))}
                </div>
              </div>

              {/* Map */}
              <div className="order-1 lg:order-2 sticky top-24 h-[400px] lg:h-[600px]">
                <MapView
                  spots={sortedSpots}
                  center={city.coordinates}
                  selectedSpot={selectedSpot}
                  onSpotSelect={setSelectedSpot}
                />
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
