"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RegionTabs } from "@/components/RegionTabs";
import { CityCard } from "@/components/CityCard";
import { NominationModal } from "@/components/NominationModal";
import { regions, getCitiesByRegion, Region } from "@/data/cities";

export default function Home() {
  const [activeRegion, setActiveRegion] = useState<Region>("Asia & Pacific");
  const [isNominationOpen, setIsNominationOpen] = useState(false);
  const citiesInRegion = getCitiesByRegion(activeRegion);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0b]">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Gradient background with lime accent */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#c8ff00]/5 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c8ff00]/10 rounded-full blur-[120px]" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 pb-8 sm:pb-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#fafafa] mb-4">
                Where builders{" "}
                <span className="text-[#c8ff00]">
                  hang out
                </span>
              </h1>
              <p className="text-[#71717a] text-lg sm:text-xl max-w-2xl mx-auto">
                Discover coworking spaces, hacker houses, cafes, and communities
                where founders and developers gather in any city.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Cities Grid */}
        <section className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 pt-8 sm:pt-12 pb-16">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-[#fafafa] mb-4 sm:mb-5">
              Explore Cities
            </h2>

            <RegionTabs
              regions={regions}
              activeRegion={activeRegion}
              onRegionChange={setActiveRegion}
            />

            <motion.div
              key={activeRegion}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-4"
            >
              {citiesInRegion.map((city, index) => (
                <CityCard key={city.id} city={city} index={index} />
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="max-w-5xl mx-auto px-8 sm:px-12 lg:px-16 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-[#131316] rounded-xl p-6 sm:p-8 border border-[#272727]"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-[#fafafa] mb-1.5">
                  Know a spot builders love?
                </h3>
                <p className="text-sm text-[#71717a]">
                  Help the community by nominating your favorite coworking spaces,
                  cafes, or hacker houses.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsNominationOpen(true)}
                className="flex-shrink-0 px-5 py-2.5 bg-[#c8ff00] text-[#0a0a0b] rounded-lg text-sm font-semibold hover:bg-[#c8ff00]/90 transition-colors"
              >
                Nominate a Spot
              </motion.button>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer onNominate={() => setIsNominationOpen(true)} />

      {/* Nomination Modal */}
      <NominationModal
        isOpen={isNominationOpen}
        onClose={() => setIsNominationOpen(false)}
      />
    </div>
  );
}
