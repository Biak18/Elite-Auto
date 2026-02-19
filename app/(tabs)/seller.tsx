import { formatPrice } from "@/src/lib/utils/formatters";
import { useAuthStore } from "@/src/store/authStore";
import { useCarStore } from "@/src/store/carStore";
import { Car } from "@/src/types/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SellerDashboard() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { isLoading, sellerCars, getCarByOwnerId } = useCarStore();

  useEffect(() => {
    const prepare = async () => {
      if (user) await getCarByOwnerId(user.id);
    };
    prepare();
  }, [user]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "approved":
        return {
          bg: "bg-green-500/20",
          border: "border-green-500/30",
          text: "text-green-400",
        };
      case "pending":
        return {
          bg: "bg-yellow-500/20",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
        };
      case "rejected":
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/30",
          text: "text-red-400",
        };
      default:
        return {
          bg: "bg-slate-700/20",
          border: "border-slate-700/30",
          text: "text-slate-400",
        };
    }
  };

  const CarsCard = ({ item }: { item: Car }) => {
    const status = getStatusStyle(item.status);
    return (
      <TouchableOpacity
        className="mb-4 bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/30"
        onPress={() => router.push(`/car/${item.id}`)}
      >
        <View className="flex-row">
          <Image
            source={
              item.image_url
                ? { uri: item.image_url }
                : require("@/assets/images/splashscreen.png")
            }
            className="w-28 h-full"
            resizeMode="cover"
          />

          <View className="flex-1 p-4 justify-between">
            <View className="flex-row justify-between items-start">
              <View className="w-3/5">
                <Text className="text-slate-400 text-xs uppercase tracking-wider">
                  {item.brand}
                </Text>
                <Text
                  className="text-white text-base font-semibold mt-0.5"
                  // numberOfLines={1}
                >
                  {item.name}
                </Text>
              </View>

              <View
                className={`${status.bg} border ${status.border} px-3 py-1 rounded-full`}
              >
                <Text
                  className={`${status.text} text-xs font-semibold capitalize`}
                >
                  {t(item.status)}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between items-center mt-2">
              <Text className="text-accent font-bold">
                {formatPrice(item.price)}
              </Text>
              <Text className="text-slate-500 text-xs">{item.year}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fbbf24" />
          <Text className="text-slate-400 mt-4">Loading your cars...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleRefresh = async () => {
    if (user) await getCarByOwnerId(user.id);
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
        data={sellerCars}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <CarsCard item={item} />}
        ListHeaderComponent={
          <>
            <View className="pt-4 pb-2 flex-row justify-between items-end">
              <View>
                <Text className="font-orbitron text-3xl text-accent mb-1 align-middle min-h-11">
                  {t("myCars")}
                </Text>
                <Text className="text-slate-400 text-sm">
                  {t("manageListings")}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => router.push("/seller/add-car")}
                className="bg-accent w-12 h-12 rounded-xl items-center justify-center"
              >
                <Ionicons name="add" size={24} color="#020617" />
              </TouchableOpacity>
            </View>

            <View className="mt-4 mb-4 flex-row gap-3">
              <View className="flex-1 bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 items-center">
                <Text className="text-accent text-xl font-bold">
                  {sellerCars.filter((c) => c.status === "approved").length}
                </Text>
                <Text className="text-slate-400 text-xs mt-1 align-middle h-4">
                  {t("approved")}
                </Text>
              </View>
              <View className="flex-1 bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 items-center">
                <Text className="text-yellow-400 text-xl font-bold">
                  {sellerCars.filter((c) => c.status === "pending").length}
                </Text>
                <Text className="text-slate-400 text-xs mt-1  align-middle h-4">
                  {t("pending")}
                </Text>
              </View>
              <View className="flex-1 bg-slate-800/50 rounded-xl p-3 border border-slate-700/30 items-center">
                <Text className="text-red-400 text-xl font-bold">
                  {sellerCars.filter((c) => c.status === "rejected").length}
                </Text>
                <Text className="text-slate-400 text-xs mt-1  align-middle h-4">
                  {t("rejected")}
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View className="items-center mt-20 px-8">
            <View className="w-24 h-24 bg-slate-800/50 rounded-full items-center justify-center border border-slate-700/30">
              <Ionicons name="car-sport-outline" size={48} color="#475569" />
            </View>
            <Text className="font-orbitron text-lg text-slate-300 mt-6">
              {t("noCarsYet")}
            </Text>
            <Text className="text-slate-500 text-sm mt-2 text-center leading-5">
              {t("addFirstCar")}
            </Text>
            <TouchableOpacity
              className="mt-6 bg-accent px-8 py-3 rounded-xl flex-row items-center"
              onPress={() => router.push("/seller/add-car")}
            >
              <Ionicons name="add" size={18} color="#020617" />
              <Text className="text-primary font-bold ml-2">{t("addCar")}</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}
