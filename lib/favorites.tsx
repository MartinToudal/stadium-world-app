import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const LEGACY_FAVORITES_KEY = "stadium-world:favorites";
const STORAGE_KEY = "stadium-world:collections";

export type VisitedEntry = {
  stadiumId: string;
  visitedOn: string | null;
};

type StadiumCollections = {
  favorites: string[];
  visited: VisitedEntry[];
  wishlist: string[];
};

type FavoritesContextValue = {
  favorites: string[];
  visited: VisitedEntry[];
  wishlist: string[];
  isFavorite: (id: string) => boolean;
  isVisited: (id: string) => boolean;
  isWishlisted: (id: string) => boolean;
  getVisitedDate: (id: string) => string | null;
  loading: boolean;
  toggleFavorite: (id: string) => void;
  toggleVisited: (id: string) => void;
  setVisitedDate: (id: string, visitedOn: string | null) => void;
  clearVisited: (id: string) => void;
  toggleWishlist: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function normalizeIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item): item is string => typeof item === "string"))];
}

function normalizeVisited(value: unknown): VisitedEntry[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const deduped = new Map<string, VisitedEntry>();

  for (const item of value) {
    if (typeof item === "string") {
      deduped.set(item, { stadiumId: item, visitedOn: null });
      continue;
    }

    if (!item || typeof item !== "object") {
      continue;
    }

    const candidate = item as Partial<VisitedEntry>;
    if (typeof candidate.stadiumId !== "string") {
      continue;
    }

    deduped.set(candidate.stadiumId, {
      stadiumId: candidate.stadiumId,
      visitedOn: typeof candidate.visitedOn === "string" ? candidate.visitedOn : null,
    });
  }

  return [...deduped.values()];
}

function normalizeCollections(value: unknown): StadiumCollections {
  if (!value || typeof value !== "object") {
    return { favorites: [], visited: [], wishlist: [] };
  }

  const collections = value as Partial<StadiumCollections>;

  return {
    favorites: normalizeIds(collections.favorites),
    visited: normalizeVisited(collections.visited),
    wishlist: normalizeIds(collections.wishlist),
  };
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [collections, setCollections] = useState<StadiumCollections>({
    favorites: [],
    visited: [],
    wishlist: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCollections() {
      try {
        const [storedCollections, legacyFavorites] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(LEGACY_FAVORITES_KEY),
        ]);
        if (!active) {
          return;
        }

        if (storedCollections) {
          setCollections(normalizeCollections(JSON.parse(storedCollections)));
          return;
        }

        if (legacyFavorites) {
          const migrated = {
            favorites: normalizeIds(JSON.parse(legacyFavorites)),
            visited: [],
            wishlist: [],
          };
          setCollections(migrated);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated)).catch(() => undefined);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCollections();

    return () => {
      active = false;
    };
  }, []);

  function updateIdCollection(key: "favorites" | "wishlist", id: string) {
    setCollections((current) => {
      const currentValues = current[key];
      const nextValues = currentValues.includes(id)
        ? currentValues.filter((item) => item !== id)
        : [...currentValues, id];
      const next = { ...current, [key]: nextValues };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }

  function getTodayString() {
    return new Date().toISOString().slice(0, 10);
  }

  function setVisitedDate(stadiumId: string, visitedOn: string | null) {
    setCollections((current) => {
      const existing = current.visited.find((item) => item.stadiumId === stadiumId);
      const nextVisited = existing
        ? current.visited.map((item) =>
            item.stadiumId === stadiumId ? { ...item, visitedOn } : item
          )
        : [...current.visited, { stadiumId, visitedOn }];
      const next = { ...current, visited: nextVisited };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }

  function clearVisited(stadiumId: string) {
    setCollections((current) => {
      const next = {
        ...current,
        visited: current.visited.filter((item) => item.stadiumId !== stadiumId),
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites: collections.favorites,
      visited: collections.visited,
      wishlist: collections.wishlist,
      loading,
      isFavorite: (id: string) => collections.favorites.includes(id),
      isVisited: (id: string) => collections.visited.some((item) => item.stadiumId === id),
      isWishlisted: (id: string) => collections.wishlist.includes(id),
      getVisitedDate: (id: string) =>
        collections.visited.find((item) => item.stadiumId === id)?.visitedOn ?? null,
      toggleFavorite: (id: string) => updateIdCollection("favorites", id),
      toggleVisited: (id: string) => {
        const existing = collections.visited.find((item) => item.stadiumId === id);
        if (existing) {
          clearVisited(id);
          return;
        }
        setVisitedDate(id, getTodayString());
      },
      setVisitedDate,
      clearVisited,
      toggleWishlist: (id: string) => updateIdCollection("wishlist", id),
    }),
    [collections, loading]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useStadiumCollections() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useStadiumCollections must be used within FavoritesProvider");
  }
  return context;
}

export function useFavorites() {
  const { favorites, isFavorite, loading, toggleFavorite } = useStadiumCollections();

  return { favorites, isFavorite, loading, toggleFavorite };
}
