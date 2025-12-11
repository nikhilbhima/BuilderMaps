"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useApp } from "@/contexts/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { cities } from "@/data/cities";

export default function BecomeAdminPage() {
  const { user, openLoginModal } = useApp();
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [socialProof, setSocialProof] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCityToggle = (cityId: string) => {
    setSelectedCities((prev) =>
      prev.includes(cityId)
        ? prev.filter((id) => id !== cityId)
        : [...prev, cityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      openLoginModal();
      return;
    }

    if (selectedCities.length === 0) {
      setError("Please select at least one city");
      return;
    }

    if (reason.length < 20) {
      setError("Please provide a more detailed reason (at least 20 characters)");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/admin/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedCities: selectedCities,
          reason,
          socialProof,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit application");
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)]">
      <Header />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
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

        {isSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 bg-[var(--accent-lime)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-[var(--accent-lime)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-4">Application Submitted!</h1>
            <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
              Thanks for your interest in becoming a city admin. We&apos;ll review your application
              and get back to you soon.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 text-[#0a0a0b] rounded-lg font-semibold transition-colors"
            >
              Back to Home
            </Link>
          </motion.div>
        ) : (
          <>
            {/* Header */}
            <h1 className="text-3xl font-bold mb-4">Become a City Admin</h1>
            <p className="text-[var(--text-secondary)] mb-8">
              Help grow the builder community in your city by moderating spots, reviewing nominations,
              and keeping information up-to-date.
            </p>

            {/* Benefits */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl p-6 mb-8">
              <h2 className="text-lg font-semibold mb-4">What city admins do:</h2>
              <ul className="space-y-3 text-[var(--text-secondary)]">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--accent-lime)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Review and approve spot nominations for your city</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--accent-lime)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Keep spot information accurate and up-to-date</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--accent-lime)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Handle user reports about spots in your city</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[var(--accent-lime)] mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Help grow the builder community locally</span>
                </li>
              </ul>
            </div>

            {/* Application Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* City Selection */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-3">
                  Which cities would you like to manage? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-64 overflow-y-auto p-1">
                  {cities.map((city) => (
                    <button
                      key={city.id}
                      type="button"
                      onClick={() => handleCityToggle(city.id)}
                      className={`px-3 py-2 rounded-lg text-sm text-left border transition-colors ${
                        selectedCities.includes(city.id)
                          ? "bg-[var(--accent-lime)]/15 border-[var(--accent-lime)]/50 text-[var(--text-primary)]"
                          : "bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)]"
                      }`}
                    >
                      {city.name}
                    </button>
                  ))}
                </div>
                {selectedCities.length > 0 && (
                  <p className="text-xs text-[var(--text-secondary)] mt-2">
                    Selected: {selectedCities.length} {selectedCities.length === 1 ? "city" : "cities"}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Why do you want to be a city admin? *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Tell us about your connection to the builder community in this city..."
                  rows={4}
                  className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50 resize-none"
                  required
                />
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {reason.length}/1000 characters (minimum 20)
                </p>
              </div>

              {/* Social Proof */}
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                  Social proof (optional)
                </label>
                <textarea
                  value={socialProof}
                  onChange={(e) => setSocialProof(e.target.value)}
                  placeholder="Links to your work, community involvement, social profiles, etc."
                  rows={2}
                  className="w-full px-4 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50 resize-none"
                />
              </div>

              {/* User Info */}
              {user ? (
                <div className="flex items-center gap-3 p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-[var(--border)] flex items-center justify-center text-sm font-medium text-[var(--accent-lime)]">
                    {user.displayName?.[0]?.toUpperCase() || user.handle[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {user.displayName || user.handle}
                    </p>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Applying as @{user.handle}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-center">
                  <p className="text-[var(--text-secondary)] mb-3">
                    Sign in to submit your application
                  </p>
                  <button
                    type="button"
                    onClick={openLoginModal}
                    className="px-4 py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 text-[#0a0a0b] rounded-lg text-sm font-semibold transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting || !user}
                className="w-full px-6 py-3 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 disabled:opacity-50 disabled:cursor-not-allowed text-[#0a0a0b] rounded-lg font-semibold transition-colors"
              >
                {isSubmitting ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
