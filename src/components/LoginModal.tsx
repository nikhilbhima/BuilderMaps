"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { useApp } from "@/contexts/AppContext";

export function LoginModal() {
  const { isLoginModalOpen, closeLoginModal } = useApp();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleXLogin = () => {
    signIn("twitter", { callbackUrl: window.location.href });
  };

  const handleLinkedInLogin = () => {
    signIn("linkedin", { callbackUrl: window.location.href });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (isRegistering) {
        // Register new user
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, handle }),
        });

        const data = await response.json();
        if (!response.ok) {
          setError(data.error || "Registration failed");
          setIsLoading(false);
          return;
        }

        // Auto sign in after registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Registration successful but sign-in failed. Please try signing in.");
        } else {
          closeLoginModal();
          resetForm();
        }
      } else {
        // Sign in existing user
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid email or password");
        } else {
          closeLoginModal();
          resetForm();
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setHandle("");
    setError("");
    setShowEmailForm(false);
    setIsRegistering(false);
  };

  const handleClose = () => {
    closeLoginModal();
    resetForm();
  };

  return (
    <AnimatePresence>
      {isLoginModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-sm bg-[#131316] border border-[#272727] rounded-2xl z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-[#272727]">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-[#fafafa]">
                  {showEmailForm ? (isRegistering ? "Create Account" : "Sign In") : "Sign In"}
                </h2>
                <button
                  onClick={handleClose}
                  className="p-2 text-[#71717a] hover:text-[#fafafa] hover:bg-[#1a1a1f] rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-[#71717a] mt-2">
                Sign in to upvote spots, leave reviews, and nominate new places.
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-3">
              {showEmailForm ? (
                <form onSubmit={handleEmailSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <label htmlFor="email" className="block text-sm text-[#a1a1aa] mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-[#1a1a1f] border border-[#272727] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#c8ff00] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>

                  {isRegistering && (
                    <div>
                      <label htmlFor="handle" className="block text-sm text-[#a1a1aa] mb-1">
                        Handle
                      </label>
                      <input
                        type="text"
                        id="handle"
                        value={handle}
                        onChange={(e) => setHandle(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-[#1a1a1f] border border-[#272727] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#c8ff00] transition-colors"
                        placeholder="your_handle"
                      />
                    </div>
                  )}

                  <div>
                    <label htmlFor="password" className="block text-sm text-[#a1a1aa] mb-1">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-3 py-2 bg-[#1a1a1f] border border-[#272727] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#c8ff00] transition-colors"
                      placeholder={isRegistering ? "Min 8 characters" : "••••••••"}
                    />
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-4 py-3 bg-[#c8ff00] hover:bg-[#b8ef00] text-[#0d0d0d] rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Loading..." : isRegistering ? "Create Account" : "Sign In"}
                  </motion.button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(false)}
                      className="text-[#71717a] hover:text-[#fafafa]"
                    >
                      Back to options
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsRegistering(!isRegistering);
                        setError("");
                      }}
                      className="text-[#c8ff00] hover:underline"
                    >
                      {isRegistering ? "Already have account?" : "Create account"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  {/* X Login */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleXLogin}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#fafafa] hover:bg-[#e4e4e7] text-[#0d0d0d] rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Continue with X
                  </motion.button>

                  {/* LinkedIn Login */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleLinkedInLogin}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#0a66c2] hover:bg-[#004182] text-white rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    Continue with LinkedIn
                  </motion.button>

                  {/* Divider */}
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-[#272727]" />
                    <span className="text-xs text-[#52525b]">or</span>
                    <div className="flex-1 h-px bg-[#272727]" />
                  </div>

                  {/* Email Login */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setShowEmailForm(true)}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#1a1a1f] hover:bg-[#222228] text-[#fafafa] border border-[#272727] rounded-lg font-medium transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Continue with Email
                  </motion.button>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6">
              <p className="text-xs text-[#52525b] text-center">
                By signing in, you agree to help the builder community discover great spots.
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
