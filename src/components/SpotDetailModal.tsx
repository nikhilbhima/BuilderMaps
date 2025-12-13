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

const REPORT_TYPES = [
  { value: "wrong_address", label: "Wrong Address" },
  { value: "permanently_closed", label: "Permanently Closed" },
  { value: "temporarily_closed", label: "Temporarily Closed" },
  { value: "wrong_info", label: "Wrong Information" },
  { value: "fake_spam", label: "Fake/Spam" },
  { value: "duplicate", label: "Duplicate" },
  { value: "other", label: "Other" },
];

export function SpotDetailModal({ spot, isOpen, onClose }: SpotDetailModalProps) {
  const { user, openLoginModal } = useApp();
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportType, setReportType] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  if (!spot) return null;

  const primaryType = spot.types?.[0] || "coworking";
  const typeConfig = spotTypeConfig[primaryType as keyof typeof spotTypeConfig] || spotTypeConfig.coworking;

  const handleSubmitReview = async () => {
    if (!user) {
      openLoginModal();
      return;
    }

    if (!newReview.rating || !newReview.text.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/spots/${spot.id}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: newReview.rating,
          text: newReview.text.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error("Review submission failed:", data.error);
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setNewReview({ rating: 0, text: "" });

      // Reset success message after a delay
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = () => {
    if (!user) {
      openLoginModal();
      return;
    }
    setShowReportModal(true);
    setReportError(null);
    setReportSuccess(false);
  };

  const handleSubmitReport = async () => {
    if (!reportType) {
      setReportError("Please select a report type");
      return;
    }

    setIsReporting(true);
    setReportError(null);

    try {
      const response = await fetch(`/api/spots/${spot.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportType,
          details: reportDetails.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setReportError(data.error || "Failed to submit report");
        setIsReporting(false);
        return;
      }

      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportType("");
        setReportDetails("");
        setReportSuccess(false);
      }, 2000);
    } catch {
      setReportError("Failed to submit report");
    } finally {
      setIsReporting(false);
    }
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
                    <span className="text-sm text-[#71717a] capitalize">{primaryType.replace("-", " ")}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleReport}
                    className="p-2 text-[#71717a] hover:text-red-400 hover:bg-[#1a1a1f] rounded-lg transition-colors"
                    aria-label="Report spot"
                    title="Report this spot"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </button>
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

          {/* Report Modal */}
          {showReportModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowReportModal(false)}
                className="fixed inset-0 bg-black/60 z-[60]"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-[#131316] border border-[#272727] rounded-xl z-[60] p-6"
              >
                {reportSuccess ? (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-[#fafafa] font-medium">Report Submitted</p>
                    <p className="text-sm text-[#71717a] mt-1">Thanks for helping keep BuilderMaps accurate!</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-[#fafafa] mb-1">Report this spot</h3>
                    <p className="text-sm text-[#71717a] mb-4">Help us keep BuilderMaps accurate</p>

                    {reportError && (
                      <div className="mb-4 p-3 bg-red-500/15 border border-red-500/30 rounded-lg text-red-400 text-sm">
                        {reportError}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">Issue Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {REPORT_TYPES.map((type) => (
                            <button
                              key={type.value}
                              onClick={() => setReportType(type.value)}
                              className={`px-3 py-2 text-sm rounded-lg border transition-colors text-left ${
                                reportType === type.value
                                  ? "bg-red-500/15 border-red-500/50 text-red-400"
                                  : "bg-[#1a1a1f] border-[#272727] text-[#a1a1aa] hover:border-[#3f3f46]"
                              }`}
                            >
                              {type.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#fafafa] mb-2">
                          Additional Details <span className="text-[#71717a] font-normal">(optional)</span>
                        </label>
                        <textarea
                          value={reportDetails}
                          onChange={(e) => setReportDetails(e.target.value)}
                          placeholder="Tell us more about the issue..."
                          rows={3}
                          maxLength={500}
                          className="w-full p-3 bg-[#1a1a1f] border border-[#272727] rounded-lg text-[#fafafa] placeholder-[#71717a] text-sm resize-none focus:outline-none focus:border-[#3f3f46]"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={handleSubmitReport}
                        disabled={!reportType || isReporting}
                        className="flex-1 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 disabled:bg-[#272727] text-red-400 disabled:text-[#52525b] rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                      >
                        {isReporting ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          "Submit Report"
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setShowReportModal(false);
                          setReportType("");
                          setReportDetails("");
                          setReportError(null);
                        }}
                        className="px-4 py-2 bg-[#1a1a1f] text-[#a1a1aa] rounded-lg font-semibold text-sm transition-colors hover:text-[#fafafa]"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </>
          )}
        </>
      )}
    </AnimatePresence>
  );
}
