"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface User {
  id: string;
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  provider: "x" | "linkedin" | "twitter";
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

function mapSupabaseUser(supabaseUser: SupabaseUser | null): User | null {
  if (!supabaseUser) return null;

  const metadata = supabaseUser.user_metadata || {};
  const rawProvider = supabaseUser.app_metadata?.provider || "x";

  // Normalize provider name
  let provider: "x" | "linkedin" | "twitter" = "x";
  if (rawProvider === "twitter") provider = "x";
  else if (rawProvider === "linkedin" || rawProvider === "linkedin_oidc") provider = "linkedin";

  return {
    id: supabaseUser.id,
    handle: metadata.user_name || metadata.preferred_username || metadata.name || "user",
    displayName: metadata.full_name || metadata.name,
    avatarUrl: metadata.avatar_url || metadata.picture,
    provider,
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [upvotedSpots, setUpvotedSpots] = useState<Set<string>>(new Set());

  // Memoize the Supabase client to prevent recreation on every render
  const supabase = useMemo(() => createClient(), []);
  const user = mapSupabaseUser(supabaseUser);

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSupabaseUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  // Fetch user's upvotes when logged in
  const refreshUpvotes = useCallback(async () => {
    if (!supabaseUser) {
      setUpvotedSpots(new Set());
      return;
    }

    try {
      const { data, error } = await supabase
        .from("upvotes")
        .select("spot_id")
        .eq("user_id", supabaseUser.id);

      if (!error && data) {
        setUpvotedSpots(new Set(data.map((u) => u.spot_id)));
      }
    } catch (error) {
      console.error("Failed to fetch upvotes:", error);
    }
  }, [supabaseUser, supabase]);

  useEffect(() => {
    if (supabaseUser) {
      refreshUpvotes();
    } else {
      setUpvotedSpots(new Set());
    }
  }, [supabaseUser, refreshUpvotes]);

  const openLoginModal = useCallback(() => setIsLoginModalOpen(true), []);
  const closeLoginModal = useCallback(() => setIsLoginModalOpen(false), []);

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
      }
      // Clear local state regardless of API response
      setSupabaseUser(null);
      setUpvotedSpots(new Set());
    } catch (err) {
      console.error("Sign out failed:", err);
      // Still clear local state on error
      setSupabaseUser(null);
      setUpvotedSpots(new Set());
    }
  }, [supabase]);

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
        if (willBeUpvoted) {
          // Add upvote - use upsert to prevent duplicates
          const { error } = await supabase.from("upvotes").upsert(
            {
              user_id: user.id,
              spot_id: spotId,
            },
            {
              onConflict: "user_id,spot_id",
              ignoreDuplicates: true,
            }
          );

          if (error) throw error;
        } else {
          // Remove upvote
          const { error } = await supabase
            .from("upvotes")
            .delete()
            .eq("user_id", user.id)
            .eq("spot_id", spotId);

          if (error) throw error;
        }

        return willBeUpvoted;
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
    [user, upvotedSpots, supabase]
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
