import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const LEGACY_FAVORITES_KEY = "stadium-world:favorites";
const STORAGE_KEY = "stadium-world:collections";

type StadiumCollections = {
  favorites: string[];
  visited: string[];
  wishlist: string[];
};

type FavoritesContextValue = {
  favorites: string[];
  visited: string[];
  wishlist: string[];
  isFavorite: (id: string) => boolean;
  isVisited: (id: string) => boolean;
  isWishlisted: (id: string) => boolean;
  loading: boolean;
  toggleFavorite: (id: string) => void;
  toggleVisited: (id: string) => void;
  toggleWishlist: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function normalizeIds(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return [...new Set(value.filter((item): item is string => typeof item === "string"))];
}

function normalizeCollections(value: unknown): StadiumCollections {
  if (!value || typeof value !== "object") {
    return { favorites: [], visited: [], wishlist: [] };
  }

  const collections = value as Partial<StadiumCollections>;

  return {
    favorites: normalizeIds(collections.favorites),
    visited: normalizeIds(collections.visited),
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

  function updateCollection(key: keyof StadiumCollections, id: string) {
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

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites: collections.favorites,
      visited: collections.visited,
      wishlist: collections.wishlist,
      loading,
      isFavorite: (id: string) => collections.favorites.includes(id),
      isVisited: (id: string) => collections.visited.includes(id),
      isWishlisted: (id: string) => collections.wishlist.includes(id),
      toggleFavorite: (id: string) => updateCollection("favorites", id),
      toggleVisited: (id: string) => updateCollection("visited", id),
      toggleWishlist: (id: string) => updateCollection("wishlist", id),
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
