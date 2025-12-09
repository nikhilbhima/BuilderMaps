"use client";

interface CityIconProps {
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
}

const colorMap: Record<string, { bg: string; stroke: string }> = {
  purple: { bg: "bg-purple-500", stroke: "#ffffff" },
  blue: { bg: "bg-blue-500", stroke: "#ffffff" },
  green: { bg: "bg-green-600", stroke: "#ffffff" },
  orange: { bg: "bg-orange-500", stroke: "#ffffff" },
  pink: { bg: "bg-pink-500", stroke: "#ffffff" },
  yellow: { bg: "bg-yellow-500", stroke: "#ffffff" },
  cyan: { bg: "bg-cyan-500", stroke: "#ffffff" },
};

const sizeMap = {
  sm: { container: "w-10 h-10", svg: 20 },
  md: { container: "w-12 h-12", svg: 24 },
  lg: { container: "w-16 h-16", svg: 32 },
};

// City-specific SVG icons - line art style like Luma
const CityIconSVG = ({ icon, color }: { icon: string; color: string }) => {
  const stroke = color;
  const strokeWidth = 1.5;

  switch (icon) {
    // Bangalore - Vidhana Soudha (Government building with dome)
    case "temple":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21v-8l7-4 7 4v8" />
          <path d="M9 21v-4h6v4" />
          <path d="M12 9v-2" />
          <circle cx="12" cy="5" r="2" />
          <path d="M8 13h8" />
        </svg>
      );

    // Singapore - Merlion / Marina Bay
    case "building":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21h16" />
          <path d="M6 21v-10l3-3v-4l3 2 3-2v4l3 3v10" />
          <path d="M10 21v-3h4v3" />
          <circle cx="12" cy="11" r="1.5" />
          <path d="M9 15h6" />
        </svg>
      );

    // Tokyo - Torii Gate
    case "torii":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16" />
          <path d="M3 4c0 0 4 3 9 3s9-3 9-3" />
          <path d="M6 6v15" />
          <path d="M18 6v15" />
          <path d="M6 10h12" />
        </svg>
      );

    // Seoul - Korean Palace (Gyeongbokgung)
    case "palace":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21v-6h14v6" />
          <path d="M7 15v-4h10v4" />
          <path d="M4 15h16" />
          <path d="M6 11l6-5 6 5" />
          <path d="M10 21v-3h4v3" />
        </svg>
      );

    // Jakarta - Monas Monument
    case "monument":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l-1 4h2l-1-4z" fill={stroke} />
          <path d="M11 7h2v6h-2z" />
          <path d="M9 13h6v2H9z" />
          <path d="M7 15h10v2H7z" />
          <path d="M5 17h14v4H5z" />
        </svg>
      );

    // Hong Kong / São Paulo - City Skyline
    case "skyline":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21v-8h3v8" />
          <path d="M9 21v-12h3v12" />
          <path d="M13 21v-6h3v6" />
          <path d="M17 21v-10h3v10" />
          <path d="M10.5 6v3" />
          <path d="M18.5 8v3" />
        </svg>
      );

    // Sydney - Opera House
    case "opera":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 18h20" />
          <path d="M4 18c0 0 2-8 5-8s3 8 3 8" />
          <path d="M10 18c0 0 2-10 5-10s4 10 4 10" />
          <path d="M14 18c0 0 2-6 4-6s3 6 3 6" />
        </svg>
      );

    // Taipei 101 / Toronto CN Tower
    case "tower":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v2" />
          <path d="M10 5h4l-1 4h-2l-1-4z" />
          <path d="M9 9h6v2H9z" />
          <path d="M9 11h6v2H9z" />
          <path d="M9 13h6v2H9z" />
          <path d="M9 15h6v2H9z" />
          <path d="M8 17h8v4H8z" />
        </svg>
      );

    // Shenzhen - Tech/Circuit
    case "tech":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="6" width="12" height="12" rx="1" />
          <path d="M9 6v-2" />
          <path d="M15 6v-2" />
          <path d="M9 20v-2" />
          <path d="M15 20v-2" />
          <path d="M6 9h-2" />
          <path d="M6 15h-2" />
          <path d="M20 9h-2" />
          <path d="M20 15h-2" />
          <circle cx="12" cy="12" r="2" />
        </svg>
      );

    // Mumbai - Gateway of India
    case "gateway":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21h16" />
          <path d="M6 21v-10h12v10" />
          <path d="M6 11l6-5 6 5" />
          <path d="M10 21v-6h4v6" />
          <path d="M12 6v-2" />
          <circle cx="12" cy="3" r="1" />
          <path d="M8 14h2" />
          <path d="M14 14h2" />
        </svg>
      );

    // London - Big Ben
    case "bigben":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 21h8" />
          <path d="M9 21v-12h6v12" />
          <path d="M8 9h8" />
          <path d="M10 9v-3h4v3" />
          <path d="M11 6l1-3 1 3" />
          <circle cx="12" cy="14" r="2" />
          <path d="M12 14v-1" />
        </svg>
      );

    // Berlin - Brandenburg Gate
    case "gate":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21v-10" />
          <path d="M9 21v-10" />
          <path d="M15 21v-10" />
          <path d="M19 21v-10" />
          <path d="M3 11h18" />
          <path d="M5 11v-3h14v3" />
          <path d="M9 8l3-4 3 4" />
        </svg>
      );

    // Lisbon - Tram
    case "tram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="6" width="12" height="12" rx="2" />
          <path d="M6 12h12" />
          <path d="M9 6v-3" />
          <path d="M15 6v-3" />
          <path d="M4 3h16" />
          <circle cx="9" cy="15" r="1" />
          <circle cx="15" cy="15" r="1" />
          <path d="M10 9h4" />
        </svg>
      );

    // Amsterdam - Canal Houses
    case "canal":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 21c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
          <path d="M4 20v-8l2-3 2 3v8" />
          <path d="M10 20v-9l2-4 2 4v9" />
          <path d="M16 20v-7l2-2 2 2v7" />
          <path d="M5 15h2" />
          <path d="M11 14h2" />
          <path d="M17 15h2" />
        </svg>
      );

    // Tallinn - Medieval Castle
    case "castle":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21v-10h4v10" />
          <path d="M15 21v-10h4v10" />
          <path d="M9 21v-6h6v6" />
          <path d="M5 11v-3h2v-2h-2v-2h4v2h-2v2h2v3" />
          <path d="M15 11v-3h2v-2h-2v-2h4v2h-2v2h2v3" />
          <path d="M9 15h6v-4l-3-2-3 2v4" />
        </svg>
      );

    // Paris - Eiffel Tower
    case "eiffel":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v4" />
          <path d="M12 7l-4 14" />
          <path d="M12 7l4 14" />
          <path d="M6 21h12" />
          <path d="M9 12h6" />
          <path d="M8 16h8" />
          <path d="M10 7h4" />
        </svg>
      );

    // Stockholm - Crown / City Hall
    case "crown":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17h14v3H5z" />
          <path d="M5 17l2-8 5 4 5-4 2 8" />
          <circle cx="7" cy="7" r="1" />
          <circle cx="12" cy="11" r="1" />
          <circle cx="17" cy="7" r="1" />
        </svg>
      );

    // Dublin - Shamrock / Harp
    case "clover":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21v-8" />
          <circle cx="12" cy="8" r="3" />
          <circle cx="8.5" cy="11" r="3" />
          <circle cx="15.5" cy="11" r="3" />
        </svg>
      );

    // Barcelona - Sagrada Familia
    case "sagrada":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 21h16" />
          <path d="M6 21v-10" />
          <path d="M10 21v-14" />
          <path d="M14 21v-14" />
          <path d="M18 21v-10" />
          <path d="M6 11l2-4" />
          <path d="M18 11l-2-4" />
          <path d="M10 7l2-4 2 4" />
          <path d="M8 16h8" />
        </svg>
      );

    // Zurich - Alps / Mountains
    case "alps":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 20h18" />
          <path d="M5 20l5-10 3 4 4-8 4 14" />
          <path d="M8 15l2-2 2 2" />
        </svg>
      );

    // Dubai - Burj Khalifa
    case "burj":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v18" />
          <path d="M12 3l-2 6h4l-2-6z" />
          <path d="M10 9l-2 8h8l-2-8" />
          <path d="M7 17l-2 4h14l-2-4" />
          <path d="M9 13h6" />
        </svg>
      );

    // Tel Aviv / Miami - Beach
    case "beach":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="17" cy="5" r="2" />
          <path d="M3 18c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
          <path d="M12 6l-6 12" />
          <path d="M12 6l6 12" />
          <path d="M7.5 15h9" />
        </svg>
      );

    // Lagos / San Francisco - Bridge
    case "bridge":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18h18" />
          <path d="M6 18v-6" />
          <path d="M18 18v-6" />
          <path d="M6 12c0-4 6-6 6-6s6 2 6 6" />
          <path d="M6 12h12" />
          <path d="M9 12v6" />
          <path d="M12 12v6" />
          <path d="M15 12v6" />
        </svg>
      );

    // Nairobi - Giraffe / Safari
    case "giraffe":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 4c0 0 1 1 1 3v5" />
          <path d="M13 4l-1 2" />
          <path d="M17 4l1 2" />
          <ellipse cx="15" cy="6" rx="2" ry="1.5" />
          <path d="M16 12l2 9" />
          <path d="M14 12l-2 9" />
          <path d="M11 21h2" />
          <path d="M17 21h2" />
          <path d="M15 12v4" />
          <circle cx="14" cy="6" r="0.5" fill={stroke} />
        </svg>
      );

    // Cape Town / Vancouver / Bogotá - Table Mountain
    case "mountain":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 20h18" />
          <path d="M5 20l4-10h6l4 10" />
          <path d="M9 10h6" />
          <path d="M13 14l3 6" />
        </svg>
      );

    // Cairo - Pyramids
    case "pyramid":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20h20" />
          <path d="M4 20l6-12 6 12" />
          <path d="M12 20l6-10 4 10" />
          <path d="M10 12l-2 8" />
          <circle cx="18" cy="6" r="2" />
        </svg>
      );

    // New York - Statue of Liberty
    case "liberty":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 6v10" />
          <circle cx="12" cy="5" r="2" />
          <path d="M10 4l-2-2" />
          <path d="M14 4l2-2" />
          <path d="M11 4v-1" />
          <path d="M13 4v-1" />
          <path d="M9 8l-3 1v3" />
          <path d="M15 8l3 3" />
          <path d="M10 16h4v5h-4z" />
          <path d="M8 21h8" />
        </svg>
      );

    // Austin - Guitar
    case "guitar":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v6" />
          <path d="M10 3h4" />
          <path d="M10 5h4" />
          <ellipse cx="12" cy="15" rx="5" ry="6" />
          <circle cx="12" cy="15" r="2" />
          <path d="M12 9c-2 0-3 1-3 2" />
          <path d="M12 9c2 0 3 1 3 2" />
        </svg>
      );

    // Los Angeles - Palm Tree
    case "palm":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v13" />
          <path d="M12 8c-4-1-6 2-6 2" />
          <path d="M12 8c4-1 6 2 6 2" />
          <path d="M12 8c-3-3-1-6-1-6" />
          <path d="M12 8c3-3 1-6 1-6" />
          <path d="M12 8c-5 0-4-4-4-4" />
          <path d="M12 8c5 0 4-4 4-4" />
        </svg>
      );

    // Seattle - Space Needle
    case "needle":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v3" />
          <ellipse cx="12" cy="8" rx="6" ry="2" />
          <path d="M10 10l-1 11h6l-1-11" />
          <path d="M8 21h8" />
          <path d="M11 8v2" />
          <path d="M13 8v2" />
        </svg>
      );

    // Boston - University/Dome
    case "university":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" />
          <path d="M5 21v-8h14v8" />
          <path d="M5 13l7-5 7 5" />
          <path d="M9 21v-4h6v4" />
          <path d="M7 17v-2" />
          <path d="M17 17v-2" />
          <circle cx="12" cy="6" r="1" />
        </svg>
      );

    // Mexico City - Angel of Independence
    case "angel":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21v-6" />
          <path d="M10 21h4" />
          <path d="M11 15h2v-3h-2z" />
          <circle cx="12" cy="10" r="2" />
          <path d="M9 9l-2-2" />
          <path d="M15 9l2-2" />
          <path d="M10 10c-2 1-3 3-3 3" />
          <path d="M14 10c2 1 3 3 3 3" />
          <path d="M9 15l-2 4" />
          <path d="M15 15l2 4" />
        </svg>
      );

    // Buenos Aires - Obelisk
    case "obelisk":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l-2 4v14h4V7l-2-4z" />
          <path d="M10 11h4" />
          <path d="M10 15h4" />
          <path d="M8 21h8" />
        </svg>
      );

    // Santiago - Andes Mountains
    case "andes":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20h20" />
          <path d="M4 20l4-8 2 3 4-9 3 6 5-4v12" />
          <path d="M14 6l-1 2 2 1" />
        </svg>
      );

    // Lima - Sun
    case "sun":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 3v2" />
          <path d="M12 19v2" />
          <path d="M3 12h2" />
          <path d="M19 12h2" />
          <path d="M5.6 5.6l1.4 1.4" />
          <path d="M17 17l1.4 1.4" />
          <path d="M5.6 18.4l1.4-1.4" />
          <path d="M17 7l1.4-1.4" />
        </svg>
      );

    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9z" />
          <path d="M12 13v-2" />
          <circle cx="12" cy="16" r="0.5" fill={stroke} />
        </svg>
      );
  }
};

export function CityIcon({ icon, color, size = "md" }: CityIconProps) {
  const colors = colorMap[color] || colorMap.purple;
  const sizeConfig = sizeMap[size];

  return (
    <div
      className={`${colors.bg} ${sizeConfig.container} rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110`}
    >
      <div style={{ width: sizeConfig.svg, height: sizeConfig.svg }}>
        <CityIconSVG icon={icon} color={colors.stroke} />
      </div>
    </div>
  );
}
