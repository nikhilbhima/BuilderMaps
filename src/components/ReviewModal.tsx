"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useApp } from "@/contexts/AppContext";
import { sanitizeReviewText } from "@/utils/sanitize";
import { useToast } from "@/components/Toast";

const MAX_REVIEW_LENGTH = 500;

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  spotName: string;
  spotId: string;
}

export function ReviewModal({ isOpen, onClose, spotName, spotId }: ReviewModalProps) {
  const { user } = useApp();
  const { showToast } = useToast();
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || rating === 0 || !reviewText.trim()) {
      return;
    }

    // Sanitize input before submission
    const sanitizedText = sanitizeReviewText(reviewText, MAX_REVIEW_LENGTH);
    if (!sanitizedText) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/spots/${spotId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating,
          text: sanitizedText,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit review");
      }

      // Reset form and close
      setRating(0);
      setReviewText("");
      showToast("Review submitted successfully!", "success");
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
      showToast("Failed to submit review. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(0);
      setReviewText("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[var(--bg-card)] border border-[var(--border)] rounded-xl z-[60] overflow-hidden"
          >
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="p-4 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                      Leave a Review
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-0.5">
                      {spotName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] rounded-lg transition-colors disabled:opacity-50"
                    aria-label="Close review modal"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Rating <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => {
                      const starValue = i + 1;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setRating(starValue)}
                          onMouseEnter={() => setHoverRating(starValue)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-110"
                        >
                          <svg
                            className={`w-8 h-8 transition-colors ${
                              starValue <= (hoverRating || rating)
                                ? "text-[var(--accent-lime)]"
                                : "text-[var(--border)]"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Review Text */}
                <div>
                  <label htmlFor="review-text" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                    Your Review <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="review-text"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value.slice(0, MAX_REVIEW_LENGTH))}
                    placeholder="Share your experience at this spot..."
                    rows={4}
                    maxLength={MAX_REVIEW_LENGTH}
                    disabled={isSubmitting}
                    className="w-full px-3 py-2 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--brand-lime)]/50 transition-colors resize-none disabled:opacity-50"
                    required
                  />
                  <p className={`text-xs mt-1 ${reviewText.length >= MAX_REVIEW_LENGTH ? "text-red-500" : "text-[var(--text-secondary)]"}`}>
                    {reviewText.length}/{MAX_REVIEW_LENGTH} characters
                  </p>
                </div>

                {/* User Info */}
                {user && (
                  <div className="flex items-center gap-2 p-3 bg-[var(--bg-card-hover)] border border-[var(--border)] rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-[var(--border)] flex items-center justify-center text-sm font-medium text-[var(--accent-lime)]">
                      {user.displayName?.[0]?.toUpperCase() || user.handle[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        {user.provider === "x" ? (
                          <svg className="w-3 h-3 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 text-[#0a66c2]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                        )}
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          {user.displayName || user.handle}
                        </p>
                      </div>
                      <p className="text-xs text-[var(--text-secondary)]">Posting as</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-[var(--border)] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-[var(--bg-card-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0 || !reviewText.trim()}
                  className="px-4 py-2 bg-[var(--brand-lime)] hover:bg-[var(--brand-lime)]/90 text-[#0a0a0b] rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
