import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Builder Maps",
  description: "Terms of Service for Builder Maps",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0b] text-[#fafafa] flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#71717a] hover:text-[#fafafa] transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </Link>

        <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

        <div className="space-y-6 text-[#a1a1aa]">
          <p>Last updated: December 2025</p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#fafafa]">1. Acceptance of Terms</h2>
            <p>By accessing and using Builder Maps, you agree to be bound by these Terms of Service.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#fafafa]">2. Use of Service</h2>
            <p>Builder Maps is a community-driven platform for discovering workspaces and spots for builders. You may use the service to browse, upvote, review, and nominate spots.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#fafafa]">3. User Accounts</h2>
            <p>You may sign in using X (Twitter) or LinkedIn. You are responsible for maintaining the security of your account and for all activities under your account.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#fafafa]">4. User Content</h2>
            <p>By submitting reviews or nominations, you grant Builder Maps a license to display this content on the platform. You are responsible for the accuracy and appropriateness of your submissions.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#fafafa]">5. Prohibited Conduct</h2>
            <p>You agree not to submit false information, spam, or content that is offensive, defamatory, or violates any laws.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#fafafa]">6. Disclaimer</h2>
            <p>Builder Maps is provided &quot;as is&quot; without warranties. We do not guarantee the accuracy of spot information or reviews.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#fafafa]">7. Changes</h2>
            <p>We may update these terms at any time. Continued use of the service constitutes acceptance of updated terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-[#fafafa]">8. Contact</h2>
            <p>Questions? Reach out on <a href="https://x.com/nikhilbhima" target="_blank" rel="noopener noreferrer" className="text-[#c8ff00] hover:underline">X @nikhilbhima</a>.</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
