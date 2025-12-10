"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";

interface User {
  id: string;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  provider: "x" | "linkedin" | "email";
}

interface AppContextType {
  user: User | null;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  logout: () => Promise<void>;
  upvotedSpots: Set<string>;
  toggleUpvote: (spotId: string) => Promise<boolean>;
  hasUpvoted: (spotId: string) => boolean;
  refreshUpvotes: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [upvotedSpots, setUpvotedSpots] = useState<Set<string>>(new Set());

  // Map NextAuth session to our User type
  const user: User | null = session?.user
    ? {
        id: session.user.id,
        handle: session.user.handle || session.user.name || "user",
        displayName: session.user.name || undefined,
        avatarUrl: session.user.image || undefined,
        provider: session.user.provider || "email",
      }
    : null;

  const isLoading = status === "loading";

  // Fetch user's upvotes when logged in
  const refreshUpvotes = useCallback(async () => {
    if (!session?.user) {
      setUpvotedSpots(new Set());
      return;
    }

    try {
      const response = await fetch("/api/user/upvotes");
      if (response.ok) {
        const data = await response.json();
        setUpvotedSpots(new Set(data.spotIds));
      }
    } catch (error) {
      console.error("Failed to fetch upvotes:", error);
    }
  }, [session?.user]);

  useEffect(() => {
    if (session?.user) {
      refreshUpvotes();
    } else {
      setUpvotedSpots(new Set());
    }
  }, [session?.user, refreshUpvotes]);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const logout = useCallback(async () => {
    await nextAuthSignOut({ redirect: false });
    setUpvotedSpots(new Set());
  }, []);

  const hasUpvoted = useCallback(
    (spotId: string) => {
      return upvotedSpots.has(spotId);
    },
    [upvotedSpots]
  );

  const toggleUpvote = useCallback(
    async (spotId: string): Promise<boolean> => {
      if (!user) {
        setIsLoginModalOpen(true);
        return false;
      }

      // Optimistic update
      const willBeUpvoted = !upvotedSpots.has(spotId);
      setUpvotedSpots((prev) => {
        const newSet = new Set(prev);
        if (willBeUpvoted) {
          newSet.add(spotId);
        } else {
          newSet.delete(spotId);
        }
        return newSet;
      });

      try {
        const response = await fetch(`/api/spots/${spotId}/upvote`, {
          method: "POST",
        });

        if (!response.ok) {
          // Revert on error
          setUpvotedSpots((prev) => {
            const newSet = new Set(prev);
            if (willBeUpvoted) {
              newSet.delete(spotId);
            } else {
              newSet.add(spotId);
            }
            return newSet;
          });
          return !willBeUpvoted;
        }

        const data = await response.json();
        return data.upvoted;
      } catch (error) {
        console.error("Failed to toggle upvote:", error);
        // Revert on error
        setUpvotedSpots((prev) => {
          const newSet = new Set(prev);
          if (willBeUpvoted) {
            newSet.delete(spotId);
          } else {
            newSet.add(spotId);
          }
          return newSet;
        });
        return !willBeUpvoted;
      }
    },
    [user, upvotedSpots]
  );

  return (
    <AppContext.Provider
      value={{
        user,
        isLoading,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        logout,
        upvotedSpots,
        toggleUpvote,
        hasUpvoted,
        refreshUpvotes,
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
