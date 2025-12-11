import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Builder Maps",
  description: "Privacy Policy for Builder Maps",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-dark)] text-[var(--text-primary)] flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>

        <div className="space-y-6 text-[var(--text-secondary)]">
          <p>Last updated: December 2025</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">1. Information We Collect</h2>
            <p>When you sign in with X (Twitter) or LinkedIn, we receive your public profile information including your username, display name, and profile picture.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Display your name and profile on reviews you submit</li>
              <li>Track your upvotes and nominations</li>
              <li>Improve the platform experience</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">3. Data Storage</h2>
            <p>Your data is stored securely using Supabase. We do not sell your personal information to third parties.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">4. Cookies</h2>
            <p>We use cookies to maintain your login session. These are essential for the service to function properly.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">5. Third-Party Services</h2>
            <p>We use X (Twitter) and LinkedIn for authentication. Their privacy policies govern how they handle your data during sign-in.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">6. Your Rights</h2>
            <p>You can request deletion of your account and associated data by contacting us.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">7. Changes</h2>
            <p>We may update this policy. Changes will be posted on this page.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">8. Contact</h2>
            <p>Questions? Reach out on <a href="https://x.com/nikhilbhima" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-lime)] hover:underline">X @nikhilbhima</a>.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
