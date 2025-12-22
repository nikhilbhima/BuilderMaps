import { Metadata } from "next";
import { cities } from "@/data/cities";

interface CityLayoutProps {
  children: React.ReactNode;
  params: Promise<{ cityId: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cityId: string }>;
}): Promise<Metadata> {
  const { cityId } = await params;
  const city = cities.find((c) => c.id === cityId);

  if (!city) {
    return {
      title: "City Not Found - Builder Maps",
      description: "The requested city could not be found.",
    };
  }

  const title = `${city.name} - Builder Spots & Coworking | Builder Maps`;
  const description = `Discover ${city.spotCount}+ coworking spaces, hacker houses, cafes, and communities where builders hang out in ${city.name}, ${city.country}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "Builder Maps",
      url: `https://builder-maps.vercel.app/city/${cityId}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@nikhilbhima",
    },
    alternates: {
      canonical: `https://builder-maps.vercel.app/city/${cityId}`,
    },
  };
}

export async function generateStaticParams() {
  return cities.map((city) => ({
    cityId: city.id,
  }));
}

export default async function CityLayout({ children }: CityLayoutProps) {
  return <>{children}</>;
}
