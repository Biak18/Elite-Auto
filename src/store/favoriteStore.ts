// src/store/favoriteStore.ts
import { favoritesService } from "@/src/services/favoritesService";
import { create } from "zustand";

type FavoriteStore = {
  favoriteIds: Set<string>;
  isLoading: boolean;
  loadFavorites: (userId: string) => Promise<void>;
  toggleFavorite: (userId: string, carId: string) => Promise<void>;
  clearFavorites: () => void;
};

export const useFavoriteStore = create<FavoriteStore>((set, get) => ({
  favoriteIds: new Set(),
  isLoading: false,

  loadFavorites: async (userId) => {
    set({ isLoading: true });
    try {
      const data = await favoritesService.getUserFavorites(userId);
      set({ favoriteIds: new Set(data.map((f) => f.car_id)) });
    } finally {
      set({ isLoading: false });
    }
  },

  toggleFavorite: async (userId, carId) => {
    const { favoriteIds } = get();
    const isFavorited = favoriteIds.has(carId);

    // Optimistic update
    set((state) => {
      const next = new Set(state.favoriteIds);
      isFavorited ? next.delete(carId) : next.add(carId);
      return { favoriteIds: next };
    });

    try {
      if (isFavorited) {
        await favoritesService.removeFavorite(userId, carId);
      } else {
        await favoritesService.addFavorite(userId, carId);
      }
    } catch (error) {
      // Rollback
      set((state) => {
        const next = new Set(state.favoriteIds);
        isFavorited ? next.add(carId) : next.delete(carId);
        return { favoriteIds: next };
      });
      throw error;
    }
  },

  clearFavorites: () => set({ favoriteIds: new Set() }),
}));
