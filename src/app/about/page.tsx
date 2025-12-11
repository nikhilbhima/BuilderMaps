import { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "About - Builder Maps",
  description: "Learn about Builder Maps - a community-driven platform to discover where founders, developers, and builders hang out in any city.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)]">
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--accent-lime)] transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Builder Maps
        </Link>

        {/* Header */}
        <h1 className="text-4xl font-bold mb-6">About Builder Maps</h1>

        {/* Content */}
        <div className="space-y-6 text-[var(--text-secondary)] leading-relaxed">
          <p className="text-lg">
            <span className="text-[var(--accent-lime)] font-semibold">Builder Maps</span> is a community-driven platform
            that helps founders, developers, and builders discover the best spots to work, meet, and
            collaborate in cities around the world.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--text-primary)] pt-4">The Problem</h2>
          <p>
            Every city has its hidden gems - the coworking spaces where startup founders gather,
            the cafes where developers write code late into the night, the hacker houses where
            side projects turn into companies, and the event venues where the community comes together.
          </p>
          <p>
            But finding these spots is surprisingly hard - even for locals. Whether living in a city
            or just visiting, most people end up at generic chains or work from home, missing out on
            the vibrant builder communities that exist nearby.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--text-primary)] pt-4">The Solution</h2>
          <p>
            Builder Maps solves this by crowdsourcing the best spots from the people who actually
            use them - the builders themselves.
          </p>

          <h2 className="text-2xl font-semibold text-[var(--text-primary)] pt-4">How It Works</h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><span className="text-[var(--text-primary)]">Browse spots</span> in 40+ cities across 5 regions</li>
            <li><span className="text-[var(--text-primary)]">Upvote</span> favorite places to help others find the best ones</li>
            <li><span className="text-[var(--text-primary)]">Nominate spots</span> that should be on the map</li>
            <li><span className="text-[var(--text-primary)]">Filter by vibe</span> - whether deep focus, loud debates, or 3am-friendly spots are needed</li>
          </ul>

          <h2 className="text-2xl font-semibold text-[var(--text-primary)] pt-4">Get in Touch</h2>
          <p>
            Have suggestions, want to add a city, or just want to say hi? Reach out on{" "}
            <a
              href="https://x.com/nikhilbhima"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-lime)] hover:text-[var(--accent-lime)]/80 transition-colors"
            >
              X @nikhilbhima
            </a>
            .
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
