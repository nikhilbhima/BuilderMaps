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
import { SpotDetailModal } from "@/components/SpotDetailModal";
import { NominationModal } from "@/components/NominationModal";
import { cities } from "@/data/cities";
import { getSpotsByCity, Spot, SpotType } from "@/data/spots";

export default function CityPage() {
  const params = useParams();
  const cityId = params.cityId as string;

  const city = cities.find((c) => c.id === cityId);
  const allSpots = getSpotsByCity(cityId);

  const [activeFilter, setActiveFilter] = useState<SpotType | "all">("all");
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [panTrigger, setPanTrigger] = useState(0);
  const [detailSpot, setDetailSpot] = useState<Spot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNominationOpen, setIsNominationOpen] = useState(false);

  // Select spot and trigger pan (works even if same spot is selected again)
  const handleSelectSpot = (spot: Spot) => {
    setSelectedSpot(spot);
    setPanTrigger((prev) => prev + 1);
  };

  const openSpotDetail = (spot: Spot) => {
    setDetailSpot(spot);
    setIsModalOpen(true);
  };

  const closeSpotDetail = () => {
    setIsModalOpen(false);
  };

  const filteredSpots = useMemo(() => {
    if (activeFilter === "all") return allSpots;
    return allSpots.filter((spot) => spot.types.includes(activeFilter));
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
        <Footer onNominate={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b]">
      <Header />

      <main className="flex-1">
        {/* City Header */}
        <section className="border-b border-[#272727]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <div className="flex items-center gap-2 text-[#71717a] text-xs sm:text-sm mb-3 sm:mb-4">
              <Link href="/" className="hover:text-[#fafafa] transition-colors">
                Cities
              </Link>
              <span>/</span>
              <span className="text-[#fafafa]">{city.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#fafafa] mb-0.5 sm:mb-1">
                  {city.name}
                </h1>
                <p className="text-sm sm:text-base text-[#71717a]">
                  {allSpots.length > 0
                    ? `${allSpots.length} spots where builders hang out`
                    : "No spots yet — be the first to add one"}
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsNominationOpen(true)}
                className="flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#c8ff00] hover:bg-[#c8ff00]/90 text-[#0a0a0b] rounded-lg font-semibold text-sm sm:text-base transition-colors"
              >
                <span className="text-base sm:text-lg">+</span>
                <span>Nominate a Spot</span>
              </motion.button>
            </div>
          </div>
        </section>

        {allSpots.length === 0 ? (
          <EmptyState cityName={city.name} onNominate={() => setIsNominationOpen(true)} />
        ) : (
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            {/* Main content grid - Map left, List right */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Map */}
              <div className="order-1 h-[250px] sm:h-[350px] lg:h-[600px] lg:sticky lg:top-20 rounded-xl overflow-hidden">
                <MapView
                  spots={sortedSpots}
                  center={city.coordinates}
                  selectedSpot={selectedSpot}
                  panTrigger={panTrigger}
                  onSpotSelect={handleSelectSpot}
                  onSpotClick={openSpotDetail}
                />
              </div>

              {/* Spot list */}
              <div className="space-y-3 sm:space-y-4 order-2">
                {/* Filters - above list on right side */}
                <div className="mb-2">
                  <SpotFilters
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                  />
                </div>

                <div className="flex items-center justify-between mb-2 sm:mb-4">
                  <h2 className="text-base sm:text-lg font-medium text-[#fafafa]">
                    {sortedSpots.length} spots
                  </h2>
                  <span className="text-xs sm:text-sm text-[#71717a] font-mono">
                    Sorted by upvotes
                  </span>
                </div>

                <div className="space-y-2 sm:space-y-3 lg:max-h-[530px] lg:overflow-y-auto lg:pr-2">
                  {sortedSpots.length > 0 ? (
                    sortedSpots.map((spot, index) => (
                      <SpotCard
                        key={spot.id}
                        spot={spot}
                        index={index}
                        isSelected={selectedSpot?.id === spot.id}
                        onClick={() => handleSelectSpot(spot)}
                        onExpand={() => openSpotDetail(spot)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#71717a]">No spots found for this filter.</p>
                      <button
                        onClick={() => setActiveFilter("all")}
                        className="mt-2 text-sm text-[#c8ff00] hover:text-[#c8ff00]/80 transition-colors"
                      >
                        Show all spots
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer onNominate={() => setIsNominationOpen(true)} />

      {/* Spot Detail Modal */}
      <SpotDetailModal
        spot={detailSpot}
        isOpen={isModalOpen}
        onClose={closeSpotDetail}
      />

      {/* Nomination Modal */}
      <NominationModal
        isOpen={isNominationOpen}
        onClose={() => setIsNominationOpen(false)}
        defaultCityId={cityId}
      />
    </div>
  );
}
