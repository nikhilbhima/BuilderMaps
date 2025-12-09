export type Region =
  | "Asia & Pacific"
  | "Europe"
  | "Middle East & Africa"
  | "North America"
  | "South America";

export interface City {
  id: string;
  name: string;
  country: string;
  region: Region;
  spotCount: number;
  coordinates: [number, number]; // [lng, lat]
  icon: string;
  color: string;
}

export const cities: City[] = [
  // Asia & Pacific - Top tech hubs
  { id: "bangalore", name: "Bangalore", country: "India", region: "Asia & Pacific", spotCount: 7, coordinates: [77.5946, 12.9716], icon: "temple", color: "purple" },
  { id: "singapore", name: "Singapore", country: "Singapore", region: "Asia & Pacific", spotCount: 6, coordinates: [103.8198, 1.3521], icon: "building", color: "green" },
  { id: "tokyo", name: "Tokyo", country: "Japan", region: "Asia & Pacific", spotCount: 6, coordinates: [139.6917, 35.6895], icon: "torii", color: "pink" },
  { id: "seoul", name: "Seoul", country: "South Korea", region: "Asia & Pacific", spotCount: 5, coordinates: [126.978, 37.5665], icon: "palace", color: "blue" },
  { id: "jakarta", name: "Jakarta", country: "Indonesia", region: "Asia & Pacific", spotCount: 4, coordinates: [106.8456, -6.2088], icon: "monument", color: "orange" },
  { id: "hong-kong", name: "Hong Kong", country: "China", region: "Asia & Pacific", spotCount: 5, coordinates: [114.1694, 22.3193], icon: "skyline", color: "cyan" },
  { id: "sydney", name: "Sydney", country: "Australia", region: "Asia & Pacific", spotCount: 4, coordinates: [151.2093, -33.8688], icon: "opera", color: "yellow" },
  { id: "taipei", name: "Taipei", country: "Taiwan", region: "Asia & Pacific", spotCount: 3, coordinates: [121.5654, 25.033], icon: "tower", color: "blue" },
  { id: "shenzhen", name: "Shenzhen", country: "China", region: "Asia & Pacific", spotCount: 4, coordinates: [114.0579, 22.5431], icon: "tech", color: "cyan" },
  { id: "mumbai", name: "Mumbai", country: "India", region: "Asia & Pacific", spotCount: 5, coordinates: [72.8777, 19.076], icon: "gateway", color: "orange" },

  // Europe - Strong tech scenes
  { id: "london", name: "London", country: "UK", region: "Europe", spotCount: 5, coordinates: [-0.1276, 51.5074], icon: "bigben", color: "blue" },
  { id: "berlin", name: "Berlin", country: "Germany", region: "Europe", spotCount: 5, coordinates: [13.405, 52.52], icon: "gate", color: "yellow" },
  { id: "lisbon", name: "Lisbon", country: "Portugal", region: "Europe", spotCount: 5, coordinates: [-9.1393, 38.7223], icon: "tram", color: "orange" },
  { id: "amsterdam", name: "Amsterdam", country: "Netherlands", region: "Europe", spotCount: 5, coordinates: [4.9041, 52.3676], icon: "canal", color: "cyan" },
  { id: "tallinn", name: "Tallinn", country: "Estonia", region: "Europe", spotCount: 3, coordinates: [24.7536, 59.437], icon: "castle", color: "purple" },
  { id: "paris", name: "Paris", country: "France", region: "Europe", spotCount: 5, coordinates: [2.3522, 48.8566], icon: "eiffel", color: "pink" },
  { id: "stockholm", name: "Stockholm", country: "Sweden", region: "Europe", spotCount: 4, coordinates: [18.0686, 59.3293], icon: "crown", color: "blue" },
  { id: "dublin", name: "Dublin", country: "Ireland", region: "Europe", spotCount: 5, coordinates: [-6.2603, 53.3498], icon: "clover", color: "green" },
  { id: "barcelona", name: "Barcelona", country: "Spain", region: "Europe", spotCount: 4, coordinates: [2.1734, 41.3851], icon: "sagrada", color: "orange" },
  { id: "zurich", name: "Zurich", country: "Switzerland", region: "Europe", spotCount: 3, coordinates: [8.5417, 47.3769], icon: "alps", color: "cyan" },

  // Middle East & Africa - Growing ecosystems
  { id: "dubai", name: "Dubai", country: "UAE", region: "Middle East & Africa", spotCount: 5, coordinates: [55.2708, 25.2048], icon: "burj", color: "cyan" },
  { id: "tel-aviv", name: "Tel Aviv", country: "Israel", region: "Middle East & Africa", spotCount: 5, coordinates: [34.7818, 32.0853], icon: "beach", color: "blue" },
  { id: "lagos", name: "Lagos", country: "Nigeria", region: "Middle East & Africa", spotCount: 5, coordinates: [3.3792, 6.5244], icon: "bridge", color: "green" },
  { id: "nairobi", name: "Nairobi", country: "Kenya", region: "Middle East & Africa", spotCount: 5, coordinates: [36.8219, -1.2921], icon: "giraffe", color: "orange" },
  { id: "cape-town", name: "Cape Town", country: "South Africa", region: "Middle East & Africa", spotCount: 4, coordinates: [18.4241, -33.9249], icon: "mountain", color: "purple" },
  { id: "cairo", name: "Cairo", country: "Egypt", region: "Middle East & Africa", spotCount: 4, coordinates: [31.2357, 30.0444], icon: "pyramid", color: "yellow" },

  // North America - Major startup ecosystems
  { id: "san-francisco", name: "San Francisco", country: "USA", region: "North America", spotCount: 6, coordinates: [-122.4194, 37.7749], icon: "bridge", color: "orange" },
  { id: "new-york", name: "New York", country: "USA", region: "North America", spotCount: 5, coordinates: [-74.006, 40.7128], icon: "liberty", color: "green" },
  { id: "austin", name: "Austin", country: "USA", region: "North America", spotCount: 5, coordinates: [-97.7431, 30.2672], icon: "guitar", color: "purple" },
  { id: "los-angeles", name: "Los Angeles", country: "USA", region: "North America", spotCount: 4, coordinates: [-118.2437, 34.0522], icon: "palm", color: "pink" },
  { id: "seattle", name: "Seattle", country: "USA", region: "North America", spotCount: 4, coordinates: [-122.3321, 47.6062], icon: "needle", color: "cyan" },
  { id: "miami", name: "Miami", country: "USA", region: "North America", spotCount: 5, coordinates: [-80.1918, 25.7617], icon: "beach", color: "cyan" },
  { id: "toronto", name: "Toronto", country: "Canada", region: "North America", spotCount: 5, coordinates: [-79.3832, 43.6532], icon: "tower", color: "blue" },
  { id: "vancouver", name: "Vancouver", country: "Canada", region: "North America", spotCount: 3, coordinates: [-123.1216, 49.2827], icon: "mountain", color: "green" },
  { id: "boston", name: "Boston", country: "USA", region: "North America", spotCount: 4, coordinates: [-71.0589, 42.3601], icon: "university", color: "purple" },

  // South America - Emerging tech hubs
  { id: "sao-paulo", name: "São Paulo", country: "Brazil", region: "South America", spotCount: 5, coordinates: [-46.6333, -23.5505], icon: "skyline", color: "green" },
  { id: "mexico-city", name: "Mexico City", country: "Mexico", region: "South America", spotCount: 5, coordinates: [-99.1332, 19.4326], icon: "angel", color: "pink" },
  { id: "buenos-aires", name: "Buenos Aires", country: "Argentina", region: "South America", spotCount: 5, coordinates: [-58.3816, -34.6037], icon: "obelisk", color: "blue" },
  { id: "bogota", name: "Bogotá", country: "Colombia", region: "South America", spotCount: 5, coordinates: [-74.0721, 4.711], icon: "mountain", color: "yellow" },
  { id: "santiago", name: "Santiago", country: "Chile", region: "South America", spotCount: 3, coordinates: [-70.6693, -33.4489], icon: "andes", color: "purple" },
  { id: "lima", name: "Lima", country: "Peru", region: "South America", spotCount: 3, coordinates: [-77.0428, -12.0464], icon: "sun", color: "orange" },
];

export const regions: Region[] = [
  "Asia & Pacific",
  "Europe",
  "Middle East & Africa",
  "North America",
  "South America",
];

export function getCitiesByRegion(region: Region): City[] {
  return cities.filter(city => city.region === region);
}
