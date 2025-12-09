"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spot, spotTypeConfig } from "@/data/spots";

interface MapViewProps {
  spots: Spot[];
  center: [number, number];
  selectedSpot: Spot | null;
  panTrigger?: number; // Increment to force pan even if same spot is selected
  onSpotSelect: (spot: Spot) => void;
  onSpotClick?: (spot: Spot) => void; // For opening modal when marker is clicked
}

const typeColorMap: Record<string, string> = {
  purple: "#a855f7",
  orange: "#ff6b35",
  cyan: "#00d4ff",
  lime: "#c8ff00",
};

export function MapView({ spots, center, selectedSpot, panTrigger, onSpotSelect, onSpotClick }: MapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  // Load Leaflet dynamically (client-side only)
  useEffect(() => {
    const loadLeaflet = async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      setL(leaflet.default);
    };
    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;

    // Create map - zoom 12 for a wider city view
    mapRef.current = L.map(mapContainerRef.current, {
      center: [center[0], center[1]],
      zoom: 12,
      zoomControl: false,
      minZoom: 3,
      maxBoundsViscosity: 1.0,
    });

    // Add dark tile layer - Stadia Alidade Smooth Dark (better labels visibility)
    L.tileLayer("https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 20,
    }).addTo(mapRef.current);

    // Add zoom control to bottom right
    L.control.zoom({ position: "bottomright" }).addTo(mapRef.current);

    setIsLoaded(true);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L]);

  // Update center when city changes
  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.flyTo([center[0], center[1]], 12, { duration: 1.5 });
    }
  }, [center]);

  // Update markers when spots or selection changes
  useEffect(() => {
    if (!mapRef.current || !L || !isLoaded) return;

    // Remove old markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    // Add new markers
    spots.forEach((spot) => {
      const isSelected = selectedSpot?.id === spot.id;
      const typeConfig = spotTypeConfig[spot.type];
      const color = typeColorMap[typeConfig.color] || typeColorMap.lime;

      // Create custom icon
      const iconHtml = `
        <div style="
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          cursor: pointer;
          transition: all 0.2s ease;
          background: ${isSelected ? color : "#1a1a1f"};
          border: 2px solid ${isSelected ? color : "#272727"};
          box-shadow: ${isSelected ? `0 0 20px ${color}80` : "0 2px 8px rgba(0,0,0,0.3)"};
          transform: translate(-50%, -50%);
        ">
          ${typeConfig.emoji}
        </div>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        className: "custom-marker",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([spot.coordinates[0], spot.coordinates[1]], { icon })
        .addTo(mapRef.current!)
        .on("click", () => {
          onSpotSelect(spot);
          // If onSpotClick is provided, call it to open modal
          if (onSpotClick) {
            onSpotClick(spot);
          }
        });

      // Add tooltip
      marker.bindTooltip(spot.name, {
        direction: "top",
        offset: [0, -20],
        className: "custom-tooltip",
      });

      markersRef.current.set(spot.id, marker);
    });
  }, [spots, selectedSpot, isLoaded, L, onSpotSelect, onSpotClick]);

  // Pan to selected spot (also triggers when panTrigger changes)
  useEffect(() => {
    if (mapRef.current && selectedSpot) {
      mapRef.current.flyTo(
        [selectedSpot.coordinates[0], selectedSpot.coordinates[1]],
        Math.max(mapRef.current.getZoom(), 14),
        { duration: 0.8 }
      );
    }
  }, [selectedSpot, panTrigger]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden border border-[#272727]">
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Loading state */}
      <AnimatePresence>
        {!isLoaded && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#131316] flex items-center justify-center z-[1000]"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[#c8ff00] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#71717a] font-mono">Loading map...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spot count badge */}
      <div className="absolute top-4 left-4 bg-[#0a0a0b]/90 backdrop-blur px-3 py-1.5 rounded-lg text-xs text-[#71717a] border border-[#272727] font-mono z-[1000]">
        {spots.length} spots
      </div>

      {/* Custom styles for Leaflet */}
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .custom-tooltip {
          background: #0a0a0b !important;
          border: 1px solid #272727 !important;
          border-radius: 6px !important;
          color: #fafafa !important;
          font-size: 12px !important;
          padding: 4px 8px !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3) !important;
        }
        .custom-tooltip::before {
          border-top-color: #272727 !important;
        }
        .leaflet-control-zoom {
          border: 1px solid #272727 !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-control-zoom a {
          background: #131316 !important;
          color: #fafafa !important;
          border-color: #272727 !important;
          width: 32px !important;
          height: 32px !important;
          line-height: 32px !important;
          font-size: 16px !important;
        }
        .leaflet-control-zoom a:hover {
          background: #1a1a1f !important;
        }
        .leaflet-control-attribution {
          background: rgba(10, 10, 11, 0.8) !important;
          backdrop-filter: blur(4px);
          border-radius: 4px !important;
          padding: 2px 6px !important;
          font-size: 10px !important;
        }
        .leaflet-control-attribution a {
          color: #71717a !important;
        }
        .leaflet-control-attribution a:hover {
          color: #c8ff00 !important;
        }
      `}</style>
    </div>
  );
}
