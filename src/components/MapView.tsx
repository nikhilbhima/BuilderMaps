"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Spot, spotTypeConfig } from "@/data/spots";

interface MapViewProps {
  spots: Spot[];
  center: [number, number];
  selectedSpot: Spot | null;
  onSpotSelect: (spot: Spot) => void;
}

const typeColorMap: Record<string, { bg: string; glow: string }> = {
  purple: { bg: "bg-[#a855f7]", glow: "shadow-[#a855f7]/50" },
  orange: { bg: "bg-[#ff6b35]", glow: "shadow-[#ff6b35]/50" },
  cyan: { bg: "bg-[#00d4ff]", glow: "shadow-[#00d4ff]/50" },
  lime: { bg: "bg-[#c8ff00]", glow: "shadow-[#c8ff00]/50" },
};

// This is a placeholder map component
// Replace with actual Mapbox implementation when you add your API key
export function MapView({ spots, center, selectedSpot, onSpotSelect }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={mapRef}
      className="relative w-full h-full bg-[#131316] rounded-xl overflow-hidden border border-[#272727]"
    >
      {/* Placeholder gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#131316] via-[#0a0a0b] to-[#131316]">
        {/* Grid pattern with lime tint */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(rgba(200, 255, 0, 0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(200, 255, 0, 0.05) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Map placeholder message */}
      <div className="absolute top-4 left-4 bg-[#0a0a0b]/80 backdrop-blur px-3 py-2 rounded-lg text-sm text-[#71717a] border border-[#272727] font-mono">
        Add Mapbox API key for interactive map
      </div>

      {/* Spot pins visualization */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-[80%] h-[80%]">
          {spots.map((spot, index) => {
            const typeConfig = spotTypeConfig[spot.type];
            const isSelected = selectedSpot?.id === spot.id;
            const colors = typeColorMap[typeConfig.color] || typeColorMap.lime;

            return (
              <motion.div
                key={spot.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSpotSelect(spot)}
                className={`absolute cursor-pointer transition-all duration-300 group ${
                  isSelected ? "z-20" : "z-10"
                }`}
                style={{
                  left: `${20 + (index * 15) % 60}%`,
                  top: `${20 + (index * 20) % 60}%`,
                }}
              >
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  className={`relative flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                    isSelected
                      ? `${colors.bg} shadow-lg ${colors.glow}`
                      : "bg-[#1a1a1f] border border-[#272727] hover:border-[#3f3f46]"
                  }`}
                >
                  <span className="text-lg">{typeConfig.emoji}</span>

                  {/* Pulse effect for featured spots */}
                  {spot.featured && !isSelected && (
                    <motion.div
                      className={`absolute inset-0 rounded-full ${colors.bg} opacity-30`}
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Tooltip on hover */}
                <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#0a0a0b] border border-[#272727] rounded text-xs text-[#fafafa] whitespace-nowrap pointer-events-none transition-opacity ${
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                }`}>
                  {spot.name}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button className="w-8 h-8 bg-[#131316] hover:bg-[#1a1a1f] border border-[#272727] hover:border-[#3f3f46] rounded-lg flex items-center justify-center text-[#fafafa] transition-colors font-mono">
          +
        </button>
        <button className="w-8 h-8 bg-[#131316] hover:bg-[#1a1a1f] border border-[#272727] hover:border-[#3f3f46] rounded-lg flex items-center justify-center text-[#fafafa] transition-colors font-mono">
          −
        </button>
      </div>
    </div>
  );
}
