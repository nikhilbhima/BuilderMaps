"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface User {
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  provider: "x" | "linkedin";
}

interface AppContextType {
  user: User | null;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  login: (user: User) => void;
  logout: () => void;
  upvotedSpots: Set<string>;
  toggleUpvote: (spotId: string) => boolean; // returns new state (true = upvoted)
  hasUpvoted: (spotId: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [upvotedSpots, setUpvotedSpots] = useState<Set<string>>(new Set());

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const login = useCallback((newUser: User) => {
    setUser(newUser);
    setIsLoginModalOpen(false);
    // In production, load user's upvoted spots from API
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setUpvotedSpots(new Set());
  }, []);

  const hasUpvoted = useCallback((spotId: string) => {
    return upvotedSpots.has(spotId);
  }, [upvotedSpots]);

  const toggleUpvote = useCallback((spotId: string): boolean => {
    if (!user) {
      setIsLoginModalOpen(true);
      return false;
    }

    // Calculate return value before setState to avoid stale closure
    const willBeUpvoted = !upvotedSpots.has(spotId);

    setUpvotedSpots((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(spotId)) {
        newSet.delete(spotId);
      } else {
        newSet.add(spotId);
      }
      return newSet;
    });

    return willBeUpvoted;
  }, [user, upvotedSpots]);

  return (
    <AppContext.Provider
      value={{
        user,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        login,
        logout,
        upvotedSpots,
        toggleUpvote,
        hasUpvoted,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
