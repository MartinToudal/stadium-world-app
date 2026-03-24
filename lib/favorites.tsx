import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "stadium-world:favorites";

type FavoritesContextValue = {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  loading: boolean;
  toggleFavorite: (id: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadFavorites() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active) {
          return;
        }
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setFavorites(parsed.filter((value): value is string => typeof value === "string"));
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadFavorites();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favorites,
      loading,
      isFavorite: (id: string) => favorites.includes(id),
      toggleFavorite: (id: string) => {
        setFavorites((current) => {
          const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => undefined);
          return next;
        });
      },
    }),
    [favorites, loading]
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error("useFavorites must be used within FavoritesProvider");
  }
  return context;
}
