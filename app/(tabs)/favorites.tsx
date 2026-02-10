import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { formatPrice } from "@/src/lib/utils/formatters";
import { useAuthStore } from "@/src/store/authStore";
import { useCarStore } from "@/src/store/carStore";
import { useFavoriteStore } from "@/src/store/favoriteStore";
import { Car } from "@/src/types/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2; // 2 cards per row

const Favorite = () => {
  const { user } = useAuthStore();
  const { isLoading, favoriteIds, loadFavorites, toggleFavorite } =
    useFavoriteStore();
  const { allCars } = useCarStore();

  useEffect(() => {
    loadFavorites(user?.id || "");
  }, []);

  const favoriteCars = allCars.filter((car) => favoriteIds.has(car.id));

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fbbf24" />
          <Text className="text-slate-400 mt-4">
            Loading favorite collection...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const CarGridCard = ({ car }: { car: Car }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/car/${car.id}`)}
      className="mb-3"
      style={{ width: CARD_WIDTH }}
    >
      <View className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/30">
        {/* Image */}
        <View className="relative h-36">
          <Image
            source={
              car.image_url
                ? { uri: car.image_url }
                : require("@/assets/images/splashscreen.png")
            }
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

          {/* Heart Button */}
          <TouchableOpacity
            className="absolute top-2 right-2 w-8 h-8 bg-slate-900/60 backdrop-blur-md rounded-full items-center justify-center"
            onPress={() => toggleFavorite(user?.id || "", car.id)}
          >
            <Ionicons
              name={favoriteIds.has(car.id) ? "heart" : "heart-outline"}
              size={16}
              color={favoriteIds.has(car.id) ? "#ef4444" : "#fbbf24"}
            />
          </TouchableOpacity>

          {/* Year Badge */}
          <View className="absolute bottom-2 left-2 bg-accent/90 px-2 py-0.5 rounded-md">
            <Text className="text-primary text-xs font-bold">{car.year}</Text>
          </View>
        </View>

        {/* Info */}
        <View className="p-3 flex-1">
          <Text className="text-slate-400 text-xs uppercase tracking-wider">
            {car.brand}
          </Text>
          <Text
            className="text-slate-100 text-sm font-semibold mt-0.5"
            numberOfLines={1}
          >
            {car.name}
          </Text>
          <Text className="text-accent text-base font-bold mt-1">
            {formatPrice(car.price)}
          </Text>

          {/* Quick Specs */}
          <View className="flex-row justify-between mt-2 pt-2 border-t border-slate-700/30">
            <View className="flex-row items-center">
              <Ionicons name="speedometer-outline" size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">
                {car.horsepower}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="flash-outline" size={12} color="#64748b" />
              <Text className="text-slate-500 text-xs ml-1">
                {car.acceleration}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-6 pt-4 pb-4 flex-row justify-between items-end">
        <View>
          <Text className="font-orbitron text-3xl text-accent mb-1">
            Favorites
          </Text>
          <Text className="text-slate-400 text-sm">Your saved collection</Text>
        </View>

        {favoriteCars.length > 0 && (
          <View className="bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
            <Text className="text-accent text-sm font-bold">
              {favoriteCars.length} {favoriteCars.length === 1 ? "car" : "cars"}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={favoriteCars}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingBottom: TAB_BAR_HEIGHT,
        }}
        renderItem={({ item }) => <CarGridCard car={item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center mt-24 px-8">
            <View className="w-24 h-24 bg-slate-800/50 rounded-full items-center justify-center border border-slate-700/30">
              <Ionicons name="heart-outline" size={48} color="#475569" />
            </View>

            <Text className="font-orbitron text-lg text-slate-300 mt-6">
              No Favorites Yet
            </Text>
            <Text className="text-slate-500 text-sm mt-2 text-center leading-5">
              Tap the heart icon on any car to save it to your collection
            </Text>

            <TouchableOpacity
              className="mt-6 bg-accent px-8 py-3 rounded-xl flex-row items-center"
              onPress={() => router.push("/(tabs)")}
            >
              <Ionicons name="car-sport-outline" size={18} color="#020617" />
              <Text className="text-primary font-bold ml-2">Browse Cars</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
};

export default Favorite;
