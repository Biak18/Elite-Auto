import { supabase } from "@/src/lib/supabase";

export const favoritesService = {
  // Get user favorites
  getUserFavorites: async (userId: string) => {
    const { data, error } = await supabase
      .from("favorites")
      .select(
        `
        *,
        cars (*)
      `,
      )
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  },

  // Add to favorites
  addFavorite: async (userId: string, carId: string) => {
    const { data, error } = await supabase
      .from("favorites")
      .insert({ user_id: userId, car_id: carId })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Remove from favorites
  removeFavorite: async (userId: string, carId: string) => {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("car_id", carId);

    if (error) throw error;
  },

  // Check if car is favorited
  isFavorited: async (userId: string, carId: string) => {
    const { data, error } = await supabase
      .from("favorites")
      .select("id")
      .eq("user_id", userId)
      .eq("car_id", carId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },
};
