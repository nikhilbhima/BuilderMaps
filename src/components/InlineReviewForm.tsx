"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useApp } from "@/contexts/AppContext";

const MAX_REVIEW_LENGTH = 500;

interface InlineReviewFormProps {
  spotId: string;
  spotName: string;
  onReviewAdded?: () => void;
}

export function InlineReviewForm({ spotId, spotName, onReviewAdded }: InlineReviewFormProps) {
  const { user, openLoginModal } = useApp();
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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
      // Use API endpoint for proper validation and sanitization
      const response = await fetch(`/api/spots/${spotId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: reviewText.trim(),
          rating,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      setReviewText("");
      setRating(5);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      onReviewAdded?.();
    } catch (err) {
      console.error("Failed to submit review:", err);
      setError(err instanceof Error ? err.message : "Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Star Rating */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-[var(--text-secondary)] mr-2">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className="p-0.5 transition-colors"
            disabled={!user}
          >
            <svg
              className={`w-5 h-5 ${star <= rating ? "text-[var(--accent-lime)]" : "text-[var(--border)]"}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>

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
