"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import type { AccountSummary, MemberProfile, SavedAddress, ShopperContextType } from "@/lib/types";

const FAVORITES_STORAGE_KEY = "ckkorea-favorites";
const RECENT_STORAGE_KEY = "ckkorea-recently-viewed";
const RECENT_LIMIT = 24;

const ShopperContext = createContext<ShopperContextType | undefined>(undefined);

function readStoredIds(key: string) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const parsed = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(parsed) ? parsed.map((item) => String(item)).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeStoredIds(key: string, ids: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  localStorage.setItem(key, JSON.stringify(Array.from(new Set(ids))));
}

function moveIdToFront(ids: string[], id: string, limit = RECENT_LIMIT) {
  return [id, ...ids.filter((item) => item !== id)].slice(0, limit);
}

export function ShopperProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<MemberProfile | null>(null);
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const applySummary = (summary: AccountSummary) => {
    if (!mountedRef.current) {
      return;
    }

    setProfile(summary.profile);
    setAddresses(summary.addresses);
    const nextFavoriteIds = summary.favoriteProducts.map((product) => product.id);
    const nextRecentIds = summary.recentlyViewedProducts.map((product) => product.id);
    setFavoriteIds(nextFavoriteIds);
    setRecentIds(nextRecentIds);
    writeStoredIds(FAVORITES_STORAGE_KEY, nextFavoriteIds);
    writeStoredIds(RECENT_STORAGE_KEY, nextRecentIds);
  };

  const loadGuestState = () => {
    if (!mountedRef.current) {
      return;
    }

    setProfile(null);
    setAddresses([]);
    setFavoriteIds(readStoredIds(FAVORITES_STORAGE_KEY));
    setRecentIds(readStoredIds(RECENT_STORAGE_KEY));
  };

  const reloadAccount = async (currentSession?: Session | null) => {
    const activeSession = currentSession ?? session;

    if (!activeSession?.user) {
      loadGuestState();
      setLoading(false);
      return;
    }

    try {
      const localFavorites = readStoredIds(FAVORITES_STORAGE_KEY);
      const localRecent = readStoredIds(RECENT_STORAGE_KEY);

      if (localFavorites.length > 0) {
        await fetch("/api/account/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productIds: localFavorites }),
        });
      }

      if (localRecent.length > 0) {
        await fetch("/api/account/recently-viewed", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productIds: localRecent }),
        });
      }

      const response = await fetch("/api/account/summary", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("회원 요약 정보를 불러오지 못했습니다.");
      }

      const data = await response.json();
      applySummary(data.summary as AccountSummary);
    } catch (error) {
      console.error("SHOPPER ACCOUNT RELOAD ERROR:", error);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    mountedRef.current = true;

    const initialize = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (!mountedRef.current) {
        return;
      }

      setSession(initialSession);
      await reloadAccount(initialSession);
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(true);
      void reloadAccount(nextSession);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const toggleFavorite = useCallback(async (productId: string) => {
    const nextIds = favoriteIds.includes(productId)
      ? favoriteIds.filter((item) => item !== productId)
      : [productId, ...favoriteIds];

    setFavoriteIds(nextIds);
    writeStoredIds(FAVORITES_STORAGE_KEY, nextIds);

    if (!session?.user) {
      return;
    }

    try {
      if (favoriteIds.includes(productId)) {
        await fetch(`/api/account/favorites?productId=${encodeURIComponent(productId)}`, {
          method: "DELETE",
        });
      } else {
        await fetch("/api/account/favorites", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId }),
        });
      }
    } catch (error) {
      console.error("TOGGLE FAVORITE ERROR:", error);
    }
  }, [favoriteIds, session?.user]);

  const recordRecentlyViewed = useCallback(async (productId: string) => {
    const nextIds = moveIdToFront(recentIds, productId);
    setRecentIds(nextIds);
    writeStoredIds(RECENT_STORAGE_KEY, nextIds);

    if (!session?.user) {
      return;
    }

    try {
      await fetch("/api/account/recently-viewed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId }),
      });
    } catch (error) {
      console.error("RECENTLY VIEWED RECORD ERROR:", error);
    }
  }, [recentIds, session?.user]);

  const signOut = useCallback(async () => {
    writeStoredIds(FAVORITES_STORAGE_KEY, favoriteIds);
    writeStoredIds(RECENT_STORAGE_KEY, recentIds);
    await supabase.auth.signOut();
  }, [favoriteIds, recentIds, supabase]);

  const value: ShopperContextType = {
    userId: session?.user?.id ?? null,
    userEmail: session?.user?.email ?? null,
    profile,
    addresses,
    favoriteIds,
    recentIds,
    loading,
    isLoggedIn: Boolean(session?.user),
    isBusinessMember: profile?.role === "business",
    businessApproved: profile?.businessStatus === "approved",
    signOut,
    toggleFavorite,
    recordRecentlyViewed,
    reloadAccount: async () => {
      setLoading(true);
      await reloadAccount();
    },
  };

  return <ShopperContext.Provider value={value}>{children}</ShopperContext.Provider>;
}

export function useShopper() {
  const context = useContext(ShopperContext);

  if (!context) {
    throw new Error("useShopper must be used within a ShopperProvider");
  }

  return context;
}
