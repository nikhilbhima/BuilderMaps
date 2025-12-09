"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Spot, spotTypeConfig, Review } from "@/data/spots";
import { useApp } from "@/contexts/AppContext";

interface SpotDetailModalProps {
  spot: Spot | null;
  isOpen: boolean;
  onClose: () => void;
}

const StarRating = ({ rating, interactive = false, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform`}
          onMouseEnter={() => interactive && setHovered(star)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onRate?.(star)}
        >
          <svg
            className={`w-5 h-5 ${
              (interactive ? hovered || rating : rating) >= star
                ? "text-[#c8ff00]"
                : "text-[#3f3f46]"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <div className="p-4 bg-[#1a1a1f] rounded-lg border border-[#272727]">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <a
            href={`https://x.com/${review.authorHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full bg-[#272727] flex items-center justify-center text-sm font-medium text-[#c8ff00] hover:border-[#c8ff00] border border-transparent transition-colors"
          >
            {review.authorName?.[0]?.toUpperCase() || review.authorHandle[0].toUpperCase()}
          </a>
          <div>
            <a
              href={`https://x.com/${review.authorHandle}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-[#fafafa] hover:text-[#c8ff00] transition-colors"
            >
              {review.authorName || `@${review.authorHandle}`}
            </a>
            <p className="text-xs text-[#71717a]">@{review.authorHandle}</p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>
      <p className="text-sm text-[#a1a1aa]">{review.text}</p>
      <p className="text-xs text-[#71717a] mt-2">
        {new Date(review.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </p>
    </div>
  );
};

export function SpotDetailModal({ spot, isOpen, onClose }: SpotDetailModalProps) {
  const { user, openLoginModal } = useApp();
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  if (!spot) return null;

  const typeConfig = spotTypeConfig[spot.type];

  const handleSubmitReview = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // In production, submit to API
    setIsSubmitting(false);
    setSubmitSuccess(true);
    setNewReview({ rating: 0, text: "" });

    // Reset success message after a delay
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-2xl md:max-h-[85vh] bg-[#131316] border border-[#272727] rounded-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#272727]">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{typeConfig.emoji}</span>
                  <div>
                    <h2 className="text-xl font-bold text-[#fafafa]">{spot.name}</h2>
                    <span className="text-sm text-[#71717a] capitalize">{spot.type.replace("-", " ")}</span>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f] rounded-lg transition-colors"
                  aria-label="Close spot details"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-[#a1a1aa] mt-3">{spot.description}</p>

              {/* Vibes */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {spot.vibes.map((vibe) => (
                  <span
                    key={vibe}
                    className="text-xs px-2 py-1 bg-[#1a1a1f] text-[#71717a] rounded-full border border-[#272727]"
                  >
                    {vibe}
                  </span>
                ))}
              </div>

              {/* Links */}
              <div className="flex items-center gap-2 mt-4">
                {spot.googleMapsUrl && (
                  <a
                    href={spot.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1f] hover:bg-[#272727] border border-[#272727] rounded-lg text-sm text-[#fafafa] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Maps
                  </a>
                )}
                {spot.websiteUrl && (
                  <a
                    href={spot.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1f] hover:bg-[#272727] border border-[#272727] rounded-lg text-sm text-[#fafafa] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Website
                  </a>
                )}
                {spot.twitterUrl && (
                  <a
                    href={spot.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1a1a1f] hover:bg-[#272727] border border-[#272727] rounded-lg text-sm text-[#fafafa] transition-colors"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X
                  </a>
                )}
              </div>
            </div>

            {/* Reviews Section */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-[#fafafa] mb-4">
                Reviews {spot.reviews?.length ? `(${spot.reviews.length})` : ""}
              </h3>

              {/* Add Review Form */}
              <div className="mb-6 p-4 bg-[#0d0d0d] rounded-lg border border-[#272727]">
                {submitSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-4"
                  >
                    <div className="w-10 h-10 bg-[#c8ff00]/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-[#c8ff00]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-[#a1a1aa]">Review submitted! Thanks for sharing.</p>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-[#71717a]">
                        {user ? `Reviewing as @${user.handle}` : "Your rating"}
                      </span>
                      <StarRating
                        rating={newReview.rating}
                        interactive
                        onRate={(r) => setNewReview({ ...newReview, rating: r })}
                      />
                    </div>
                    <textarea
                      value={newReview.text}
                      onChange={(e) => setNewReview({ ...newReview, text: e.target.value })}
                      placeholder="Share your experience at this spot..."
                      className="w-full p-3 bg-[#131316] border border-[#272727] rounded-lg text-[#fafafa] placeholder-[#71717a] text-sm resize-none focus:outline-none focus:border-[#c8ff00]/50"
                      rows={3}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={handleSubmitReview}
                        disabled={!newReview.rating || !newReview.text.trim() || isSubmitting}
                        className="px-4 py-2 bg-[#c8ff00] hover:bg-[#c8ff00]/90 disabled:bg-[#272727] disabled:text-[#52525b] text-[#0d0d0d] rounded-lg font-medium text-sm transition-colors flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Submitting...
                          </>
                        ) : user ? (
                          "Submit Review"
                        ) : (
                          "Sign in to Review"
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Reviews List */}
              {spot.reviews && spot.reviews.length > 0 ? (
                <div className="space-y-3">
                  {spot.reviews.map((review) => (
                    <ReviewCard key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-[#71717a]">No reviews yet. Be the first to share your experience!</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
