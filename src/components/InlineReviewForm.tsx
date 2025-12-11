"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { createClient } from "@/lib/supabase/client";

const MAX_REVIEW_LENGTH = 500;

interface InlineReviewFormProps {
  spotId: string;
  spotName: string;
  onReviewAdded?: () => void;
}

export function InlineReviewForm({ spotId, spotName, onReviewAdded }: InlineReviewFormProps) {
  const { user, openLoginModal } = useApp();
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!user) {
      openLoginModal();
      return;
    }

    if (!reviewText.trim()) {
      setError("Please write a review");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: insertError } = await supabase.from("reviews").insert({
        user_id: user.id,
        spot_id: spotId,
        text: reviewText.trim(),
        author_handle: user.handle,
        author_name: user.displayName || user.handle,
        provider: user.provider,
      });

      if (insertError) throw insertError;

      setReviewText("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onReviewAdded?.();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
          placeholder={user ? `Share your experience at ${spotName}...` : "Sign in to leave a review"}
          rows={3}
          maxLength={MAX_REVIEW_LENGTH}
          disabled={isSubmitting || !user}
          onClick={() => !user && openLoginModal()}
          className="w-full px-3 py-2 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50 transition-colors resize-none disabled:opacity-50 text-sm"
        />
        <div className="absolute bottom-2 right-2 text-xs text-[var(--text-muted)]">
          {reviewText.length}/{MAX_REVIEW_LENGTH}
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {success && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-[var(--accent-lime)]"
        >
          Review submitted successfully!
        </motion.p>
      )}

      <div className="flex items-center justify-between">
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--border)] flex items-center justify-center text-xs font-medium text-[var(--accent-lime)]">
              {user.displayName?.[0]?.toUpperCase() || user.handle[0].toUpperCase()}
            </div>
            <span className="text-xs text-[var(--text-secondary)]">
              {user.displayName || `@${user.handle}`}
            </span>
          </div>
        )}
        <motion.button
          type="submit"
          disabled={isSubmitting || !reviewText.trim()}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="px-3 py-1.5 bg-[var(--brand-lime)] hover:opacity-90 text-[#0a0a0b] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
        >
          {isSubmitting ? "Posting..." : "Post Review"}
        </motion.button>
      </div>
    </form>
  );
}
