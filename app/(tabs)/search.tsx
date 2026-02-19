import SearchInput from "@/src/components/ui/SearchInput";
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
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 52) / 2;

const Search = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { allCars, fetchCars } = useCarStore();
  const { favoriteIds, toggleFavorite } = useFavoriteStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["All", "Sedan", "SUV", "Sports", "Luxury", "Electric"];

  const brands = ["All Brands", ...new Set(allCars.map((car) => car.brand))];
  const [selectedBrand, setSelectedBrand] = useState("All Brands");

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    setIsSearching(true);
    const timeout = setTimeout(() => {
      let results = [...allCars];

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        results = results.filter(
          (car) =>
            car.name.toLowerCase().includes(query) ||
            car.brand.toLowerCase().includes(query) ||
            car.model.toLowerCase().includes(query),
        );
      }

      if (selectedCategory !== "All") {
        results = results.filter(
          (car) => car.type.toLowerCase() === selectedCategory.toLowerCase(),
        );
      }

      if (selectedBrand !== "All Brands") {
        results = results.filter((car) => car.brand === selectedBrand);
      }

      setFilteredCars(results);
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, selectedCategory, selectedBrand, allCars]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("All");
    setSelectedBrand("All Brands");
  };

  const hasActiveFilters =
    selectedCategory !== "All" || selectedBrand !== "All Brands";

  const CarGridCard = ({ car }: { car: Car }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push(`/car/${car.id}`)}
      className="mb-3"
      style={{ width: CARD_WIDTH }}
    >
      <View className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/30">
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
    <SafeAreaView className="bg-primary flex-1">
      <View className="px-6 pt-4 pb-2">
        <Text className="font-orbitron text-3xl text-accent mb-1 align-middle min-h-11">
          {t("searchCars")}
        </Text>
        <Text className="text-slate-400 text-sm">{t("findYourDreamCar")}</Text>
      </View>

      <View className="px-6 flex-row items-center gap-3 mt-2">
        <View className="flex-1">
          <SearchInput
            value={searchQuery}
            placeholder={t("searchPlaceholder")}
            onChangeText={(text: string) => setSearchQuery(text)}
          />
        </View>

        <TouchableOpacity
          onPress={() => setShowFilters(!showFilters)}
          className={`w-12 h-12 rounded-xl items-center justify-center border ${
            hasActiveFilters
              ? "bg-accent border-accent"
              : "bg-slate-800/50 border-slate-700/30"
          }`}
        >
          <Ionicons
            name="options-outline"
            size={22}
            color={hasActiveFilters ? "#020617" : "#fbbf24"}
          />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View className="mx-4 px-6 mt-4 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
          <View className="mb-4">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Brand
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {brands.map((brand) => (
                <TouchableOpacity
                  key={brand}
                  onPress={() => setSelectedBrand(brand)}
                  className={`mr-2 px-4 py-2 rounded-full border ${
                    selectedBrand === brand
                      ? "bg-accent border-accent"
                      : "bg-slate-700/50 border-slate-600/30"
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selectedBrand === brand
                        ? "text-primary"
                        : "text-slate-300"
                    }`}
                  >
                    {brand}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity
              onPress={resetFilters}
              className="flex-row items-center mt-2"
            >
              <Ionicons name="refresh-outline" size={16} color="#fbbf24" />
              <Text className="text-accent text-sm ml-1">Reset Filters</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View className="mt-4 mb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: TAB_BAR_HEIGHT,
          }}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => setSelectedCategory(category)}
              className={`mr-2 h-10 px-5 rounded-full items-center justify-center border ${
                selectedCategory === category
                  ? "bg-accent border-accent"
                  : "bg-slate-800/50 border-slate-700/30"
              }`}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedCategory === category
                    ? "text-primary"
                    : "text-slate-300"
                }`}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {hasActiveFilters && (
        <View className="px-6 flex-row flex-wrap gap-2 mt-2 mb-1">
          {selectedCategory !== "All" && (
            <View className="flex-row items-center bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
              <Text className="text-accent text-xs font-semibold">
                {selectedCategory}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedCategory("All")}
                className="ml-2"
              >
                <Ionicons name="close" size={14} color="#fbbf24" />
              </TouchableOpacity>
            </View>
          )}
          {selectedBrand !== "All Brands" && (
            <View className="flex-row items-center bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
              <Text className="text-accent text-xs font-semibold">
                {selectedBrand}
              </Text>
              <TouchableOpacity
                onPress={() => setSelectedBrand("All Brands")}
                className="ml-2"
              >
                <Ionicons name="close" size={14} color="#fbbf24" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      <View className="px-6 py-2 flex-row justify-between items-center">
        <Text className="text-slate-400 text-sm">
          <Text className="text-accent font-bold">{filteredCars.length}</Text>{" "}
          {filteredCars.length === 1 ? "car" : "cars"} found
        </Text>
      </View>

      {isSearching ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingBottom: 32,
          }}
          renderItem={({ item }) => <CarGridCard car={item} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="items-center mt-20 px-8">
              <View className="w-24 h-24 bg-slate-800/50 rounded-full items-center justify-center border border-slate-700/30">
                <Ionicons name="search-outline" size={48} color="#475569" />
              </View>
              <Text className="font-orbitron text-lg text-slate-300 mt-6">
                {t("noResultsFound")}
              </Text>
              <Text className="text-slate-500 text-sm mt-2 text-center leading-5">
                {t("tryDifferentFilters")}
              </Text>
              <TouchableOpacity
                className="mt-6 bg-accent px-8 py-3 rounded-xl flex-row items-center"
                onPress={resetFilters}
              >
                <Ionicons name="refresh-outline" size={18} color="#020617" />
                <Text className="text-primary font-bold ml-2">
                  Reset Filters
                </Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default Search;
