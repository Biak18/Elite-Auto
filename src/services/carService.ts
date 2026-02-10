import { supabase } from "@/src/lib/supabase";
import { Car } from "../types/interfaces";

// type Car = Database["public"]["Tables"]["cars"]["Row"];

export const carService = {
  // Get all cars
  getAllCars: async () => {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("available", true)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as Car[];
  },

  // Get featured cars
  getFeaturedCars: async () => {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("featured", true)
      .eq("available", true)
      .eq("status", "approved")
      .limit(10);

    if (error) throw error;
    return data as Car[];
  },

  // Get car by ID
  getCarById: async (id: string) => {
    const { data, error } = await supabase
      .from("cars")
      .select(
        `
        *,
        car_images (*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get car by Owner ID
  getCarByOwnerId: async (owner_id: string) => {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .eq("owner_id", owner_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  // Search cars
  searchCars: async (query: string) => {
    const { data, error } = await supabase
      .from("cars")
      .select("*")
      .or(`name.ilike.%${query}%,brand.ilike.%${query}%,model.ilike.%${query}%`)
      .eq("available", true)
      .eq("status", "approved");

    if (error) throw error;
    return data as Car[];
  },

  // Filter cars
  filterCars: async (filters: {
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    type?: string;
    fuelType?: string;
  }) => {
    let query = supabase
      .from("cars")
      .select("*")
      .eq("available", true)
      .eq("status", "approved");

    if (filters.brand) {
      query = query.eq("brand", filters.brand);
    }
    if (filters.minPrice) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice) {
      query = query.lte("price", filters.maxPrice);
    }
    if (filters.type) {
      query = query.eq("type", filters.type);
    }
    if (filters.fuelType) {
      query = query.eq("fuel_type", filters.fuelType);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as Car[];
  },
};
