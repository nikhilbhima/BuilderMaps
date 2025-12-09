"use client";

interface CityIconProps {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const colorMap: Record<string, { bg: string; text: string }> = {
  purple: { bg: "bg-purple-500/20", text: "text-purple-400" },
  blue: { bg: "bg-blue-500/20", text: "text-blue-400" },
  green: { bg: "bg-green-500/20", text: "text-green-400" },
  orange: { bg: "bg-orange-500/20", text: "text-orange-400" },
  pink: { bg: "bg-pink-500/20", text: "text-pink-400" },
  yellow: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
  cyan: { bg: "bg-cyan-500/20", text: "text-cyan-400" },
};

const sizeMap = {
  sm: "w-10 h-10 text-lg",
  md: "w-14 h-14 text-2xl",
  lg: "w-20 h-20 text-4xl",
};

// Simple icon representations using emoji/unicode
const iconMap: Record<string, string> = {
  temple: "🛕",
  torii: "⛩️",
  building: "🏛️",
  skyline: "🏙️",
  palace: "🏯",
  opera: "🎭",
  gateway: "🚪",
  monument: "🗿",
  gate: "🚧",
  tram: "🚋",
  bridge: "🌉",
  liberty: "🗽",
  guitar: "🎸",
  needle: "🪡",
  palm: "🌴",
  star: "⭐",
  tower: "🗼",
  mountain: "🏔️",
  peak: "⛰️",
  brick: "🧱",
  bigben: "🕰️",
  canal: "🚣",
  sagrada: "⛪",
  clover: "☘️",
  crown: "👑",
  alps: "🏔️",
  castle: "🏰",
  obelisk: "📍",
  angel: "👼",
  plaza: "🏛️",
  burj: "🏗️",
  beach: "🏖️",
  giraffe: "🦒",
};

export function CityIcon({ icon, color, size = "md" }: CityIconProps) {
  const colors = colorMap[color] || colorMap.purple;
  const sizeClasses = sizeMap[size];
  const iconChar = iconMap[icon] || "📍";

  return (
    <div
      className={`${colors.bg} ${colors.text} ${sizeClasses} rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110`}
    >
      <span role="img" aria-label={icon}>
        {iconChar}
      </span>
    </div>
  );
}
