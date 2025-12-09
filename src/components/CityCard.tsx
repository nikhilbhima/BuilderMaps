"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { City } from "@/data/cities";
import { CityIcon } from "./CityIcon";

interface CityCardProps {
  city: City;
  index: number;
}

export function CityCard({ city, index }: CityCardProps) {
  const hasSpots = city.spotCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link href={`/city/${city.id}`}>
        <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-[#1a1a1f] transition-all duration-300 cursor-pointer">
          <CityIcon icon={city.icon} color={city.color} />
          <div className="flex flex-col">
            <span className="text-[#fafafa] font-medium group-hover:text-[#c8ff00] transition-colors">
              {city.name}
            </span>
            {hasSpots ? (
              <span className="text-[#71717a] text-sm font-mono">
                {city.spotCount} {city.spotCount === 1 ? "Spot" : "Spots"}
              </span>
            ) : (
              <span className="text-[#3f3f46] text-sm italic">
                Be first to add
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
