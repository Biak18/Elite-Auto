import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { formatPrice } from "@/src/lib/utils/formatters";
import { useAuthStore } from "@/src/store/authStore";
import { useCarStore } from "@/src/store/carStore";
import { useFavoriteStore } from "@/src/store/favoriteStore";
import { Car } from "@/src/types/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function HomeScreen() {
  const { t } = useTranslation();
  const { profile, user } = useAuthStore();
  const {
    isLoading: isLoadingFavorite,
    favoriteIds,
    loadFavorites,
    toggleFavorite,
  } = useFavoriteStore();

  const [activeSlide, setActiveSlide] = useState(0);

  const { fetchCars, isLoading, allCars, featuredCars } = useCarStore();

  useEffect(() => {
    async function prepare() {
      if (user) {
        await fetchCars();
        await loadFavorites(user.id);
      }
    }
    prepare();
  }, [user]);

  const FeaturedCarCard = ({ car }: { car: Car }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/car/${car.id}`)}
      className="mr-4"
      style={{ width: width - 60 }}
    >
      <View className="bg-slate-800/50 rounded-3xl overflow-hidden border border-slate-700/30">
        <View className="relative h-64">
          <Image
            source={
              car.image_url
                ? { uri: car.image_url }
                : require("@/assets/images/splashscreen.png")
            }
            className="w-full h-full"
            resizeMode="cover"
          />
          <View className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

          <View className="absolute top-4 right-4 bg-accent px-3 py-1.5 rounded-full">
            <Text className="text-primary text-xs font-bold uppercase tracking-wider">
              Featured
            </Text>
          </View>

          <TouchableOpacity
            className="absolute top-4 left-4 w-10 h-10 bg-slate-900/60 backdrop-blur-md rounded-full items-center justify-center border border-slate-700/50"
            onPress={() => toggleFavorite(user?.id || "", car.id)}
          >
            <Ionicons
              name={favoriteIds.has(car.id) ? "heart" : "heart-outline"}
              size={20}
              color={favoriteIds.has(car.id) ? "#ef4444" : "#fbbf24"}
            />
          </TouchableOpacity>

          <View className="absolute bottom-0 left-0 right-0 p-6">
            <Text className="text-white text-2xl font-bold mb-1">
              {car.name}
            </Text>
            <Text className="text-accent text-3xl font-bold">
              {formatPrice(car.price)}
            </Text>
          </View>
        </View>

        <View className="p-4 flex-row justify-between">
          <View className="flex-1">
            <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
              Power
            </Text>
            <Text className="text-accent text-sm font-semibold">
              {car.horsepower}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
              0-60
            </Text>
            <Text className="text-accent text-sm font-semibold">
              {car.acceleration}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-slate-500 text-xs uppercase tracking-wider mb-1">
              Type
            </Text>
            <Text className="text-accent text-sm font-semibold">
              {car.type}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CarGridCard = ({ car }: { car: Car }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/car/${car.id}`)}
      className="mb-4"
      style={{ width: CARD_WIDTH }}
    >
      <View className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/30">
        <View className="relative h-32">
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

          <View className="absolute bottom-2 left-2 bg-accent/90 px-2 py-0.5 rounded-md">
            <Text className="text-primary text-xs font-bold">{car.year}</Text>
          </View>
        </View>

        <View className="p-3">
          <Text
            className="text-slate-100 text-sm font-semibold mb-1"
            numberOfLines={1}
          >
            {car.brand}
          </Text>
          <Text className="text-accent text-lg font-bold mb-2">
            {formatPrice(car.price)}
          </Text>

          <View className="flex-row justify-between">
            <View className="flex-1">
              <Text className="text-slate-500 text-xs">{car.horsepower}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-slate-500 text-xs text-right">
                {car.acceleration}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const CarouselDots = () => (
    <View className="flex-row justify-center mt-4 gap-2">
      {featuredCars.map((_, index) => (
        <View
          key={index}
          className={`h-2 rounded-full ${
            index === activeSlide ? "w-6 bg-accent" : "w-2 bg-slate-600"
          }`}
        />
      ))}
    </View>
  );

  if (isLoading || isLoadingFavorite) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fbbf24" />
          <Text className="text-slate-400 mt-4">
            Loading luxury collection...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRefresh = async () => {
    await fetchCars();
    if (user) await loadFavorites(user.id);
    setActiveSlide(0);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <FlatList
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            {...(Platform.OS === "android" && {
              colors: ["#fbbf24"],
              progressBackgroundColor: "#020617",
            })}
          />
        }
        data={allCars}
        renderItem={({ item }) => <CarGridCard car={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        className="px-5"
        columnWrapperStyle={{
          justifyContent: "space-between",
        }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <>
            <View className="items-center py-12">
              <Ionicons name="car-sport-outline" size={64} color="#475569" />
              <Text className="text-slate-400 text-base mt-4">
                No cars available
              </Text>
              <Text className="text-slate-500 text-sm mt-1">
                Check back soon for new arrivals
              </Text>
            </View>
          </>
        }
        ListHeaderComponent={
          <>
            <View className=" pt-4 pb-2 flex-row justify-between items-center">
              <View>
                <Text className="text-slate-400 text-sm">
                  {t("homeWelcomBack")}
                </Text>
                <Text className="font-orbitron text-2xl text-accent">
                  {profile?.full_name || "Elite Member"}
                </Text>
              </View>
              <TouchableOpacity
                className="w-12 h-12 bg-accent/10 rounded-full items-center justify-center border border-accent/20"
                onPress={() => router.push("/(tabs)/profile")}
              >
                {profile?.avatarSignedUrl ? (
                  <Image
                    source={{ uri: profile.avatarSignedUrl }}
                    className="w-full h-full rounded-full"
                    resizeMode="contain"
                  />
                ) : (
                  <Text className="text-accent text-xl font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() || "U"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <View className="mt-5 mb-4 flex-row justify-between items-center">
              <Text className="text-slate-100 text-lg font-semibold">
                {t("featuredCars")}
              </Text>
              <View className="bg-accent px-3 py-1 rounded-full">
                <Text className="text-primary text-xs font-bold uppercase tracking-wider">
                  {t("new")}
                </Text>
              </View>
            </View>

            <FlatList
              horizontal
              data={featuredCars}
              renderItem={({ item, index }) => <FeaturedCarCard car={item} />}
              keyExtractor={(item) => item.id}
              onScroll={(event) => {
                const SLIDE_WIDTH = width - 60;

                const slideIndex = Math.round(
                  event.nativeEvent.contentOffset.x / SLIDE_WIDTH,
                );
                setActiveSlide(slideIndex);
              }}
              scrollEventThrottle={16}
              showsHorizontalScrollIndicator={false}
              removeClippedSubviews={false}
              pagingEnabled={false}
              snapToInterval={width - 60}
              snapToAlignment="start"
              decelerationRate="fast"
            />

            <CarouselDots />

            <View className="mt-5 mb-4 flex-row justify-between items-center">
              <Text className="text-slate-100 text-lg font-semibold">
                {t("browseCollection")}
              </Text>
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => router.push("/(tabs)/search")}
              >
                <Text className="text-accent text-sm mr-1">{t("viewAll")}</Text>
                <Ionicons name="arrow-forward" size={16} color="#fbbf24" />
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
}
