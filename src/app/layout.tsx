import type { Metadata, Viewport } from "next";
import { AppProvider } from "@/contexts/AppContext";
import { LoginModal } from "@/components/LoginModal";
import "./globals.css";

export const metadata: Metadata = {
  title: "Builder Maps - Where builders hang out",
  description: "Discover coworking spaces, hacker houses, cafes, and event venues where the builder community gathers in any city.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "Builder Maps - Where builders hang out",
    description: "Discover where founders, developers, and startup people hang out in any city.",
    type: "website",
    siteName: "Builder Maps",
  },
  twitter: {
    card: "summary_large_image",
    title: "Builder Maps - Where builders hang out",
    description: "Discover where founders, developers, and startup people hang out in any city.",
    creator: "@nikhilbhima",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Builder Maps",
  },
};

export const viewport: Viewport = {
  themeColor: "#c8ff00",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-dark-900 min-h-screen">
        <AppProvider>
          {children}
          <LoginModal />
        </AppProvider>
      </body>
    </html>
  );
}
