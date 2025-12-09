import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builder Maps - Where builders hang out",
  description: "Discover coworking spaces, hacker houses, cafes, and event venues where the builder community gathers in any city.",
  openGraph: {
    title: "Builder Maps - Where builders hang out",
    description: "Discover where founders, developers, and startup people hang out in any city.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Builder Maps - Where builders hang out",
    description: "Discover where founders, developers, and startup people hang out in any city.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-dark-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
