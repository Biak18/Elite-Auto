// src/store/carStore.ts
import { carService } from "@/src/services/carService";
import { create } from "zustand";
import { Car, CarWithImages } from "../types/interfaces";

interface CarState {
  featuredCars: Car[];
  allCars: Car[];
  selectedCar: CarWithImages | null;
  isLoading: boolean;
  sellerCars: Car[];

  fetchCars: () => Promise<void>;
  getCarById: (id: string) => Promise<void>;
  getCarByOwnerId: (owner_id: string) => Promise<void>;
}

export const useCarStore = create<CarState>((set) => ({
  featuredCars: [],
  allCars: [],
  selectedCar: null,
  isLoading: false,
  sellerCars: [],

  fetchCars: async () => {
    set({ isLoading: true });
    try {
      const [featured, all] = await Promise.all([
        carService.getFeaturedCars(),
        carService.getAllCars(),
      ]);

      set({
        featuredCars: featured,
        allCars: all,
        isLoading: false,
      });
    } catch (error) {
      console.error("Fetch cars error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  getCarById: async (id: string) => {
    set({ isLoading: true });
    try {
      const data = await carService.getCarById(id);

      set({
        selectedCar: data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Fetch car error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  getCarByOwnerId: async (owner_id: string) => {
    set({ isLoading: true });
    try {
      const data = await carService.getCarByOwnerId(owner_id);

      set({
        sellerCars: data,
        isLoading: false,
      });
    } catch (error) {
      console.error("Fetch car error:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
