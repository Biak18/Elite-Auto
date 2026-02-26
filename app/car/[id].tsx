// app/car/[id].tsx
import BookingModal from "@/src/components/BookingModal";
import { supabase } from "@/src/lib/supabase";
import { showConfirm, showMessage } from "@/src/lib/utils/dialog";
import { formatPrice } from "@/src/lib/utils/formatters";
import { useAppointmentStore } from "@/src/store/appointmentStore";
import { useAuthStore } from "@/src/store/authStore";
import { useCarStore } from "@/src/store/carStore";
import { useFavoriteStore } from "@/src/store/favoriteStore";
import { SellerProfile } from "@/src/types/interfaces";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// interface SellerProfile {
//   id: string;
//   full_name: string;
//   phone: string | null;
//   avatarSignedUrl: string | null;
// }

export default function CarDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, profile } = useAuthStore();
  const { favoriteIds, toggleFavorite, loadFavorites } = useFavoriteStore();
  const { selectedCar, isLoading, getCarById, getCarByOwnerId } = useCarStore();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const [showBookingModal, setShowBookingModal] = useState(false);

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [isSellerLoading, setIsSellerLoading] = useState(true);
  const { fetchAppointments, appointments } = useAppointmentStore();

  const isOwner = profile?.id === selectedCar?.owner_id;
  const isBuyer = profile?.role === "buyer";
  const isSeller = profile?.role === "seller";

  const hasActiveBooking = appointments.some(
    (appt) =>
      appt.cars.id === selectedCar?.id &&
      (appt.status === "pending" || appt.status === "confirmed"),
  );

  const canBookTestDrive =
    isBuyer && !isOwner && selectedCar?.available === true && !hasActiveBooking;

  const canEditCar = isSeller && isOwner;

  useEffect(() => {
    const prepare = async () => {
      if (id) {
        await getCarById(id);
      }
    };
    prepare();
  }, [id]);

  useEffect(() => {
    if (user) loadFavorites(user.id);
  }, [user]);

  // Set main image when car loads
  useEffect(() => {
    if (selectedCar) {
      if (selectedCar.car_images && selectedCar.car_images.length > 0) {
        const primary = selectedCar.car_images.find((img) => img.is_primary);
        setSelectedImage(
          primary?.image_url || selectedCar.car_images[0].image_url,
        );
      } else {
        setSelectedImage(selectedCar.image_url);
      }
    }
  }, [selectedCar]);

  useEffect(() => {
    const fetchSeller = async () => {
      if (!selectedCar?.owner_id || canEditCar) {
        setIsSellerLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, phone, avatar_url")
          .eq("id", selectedCar.owner_id)
          .single();

        if (error) throw error;

        let avatarSignedUrl: string | null = null;
        if (data.avatar_url) {
          const { data: signed } = await supabase.storage
            .from("avatars")
            .createSignedUrl(data.avatar_url, 60 * 60);
          avatarSignedUrl = signed?.signedUrl ?? null;
        }

        setSeller({
          id: data.id,
          full_name: data.full_name,
          phone: data.phone,
          avatar_url: data.avatar_url,
          avatarSignedUrl,
        });
      } catch (err) {
        console.error("Fetch seller error:", err);
      } finally {
        setIsSellerLoading(false);
      }
    };
    fetchSeller();
  }, [selectedCar?.owner_id, canEditCar]);

  useEffect(() => {
    if (user && profile) {
      fetchAppointments(isSeller, user.id);
    }
  }, [user, profile]);

  const handleCall = async () => {
    const phone = seller?.phone;
    if (!phone) return;
    // const url = `tel:${phone.replace(/[^0-9+]/g, "")}`;
    // const supported = await Linking.canOpenURL(url);
    // if (supported) {
    //   await Linking.openURL(url);
    // }

    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    await Linking.openURL(`tel:${cleanPhone}`);
  };

  const handleMessage = async () => {
    const phone = seller?.phone;
    if (!phone) return;
    // const url = `sms:${phone}`;
    // const supported = await Linking.canOpenURL(url);
    // if (supported) {
    //   await Linking.openURL(url);
    // }

    const cleanPhone = phone.replace(/[^0-9+]/g, "");
    await Linking.openURL(`sms:${cleanPhone}`);
  };

  const handleDeleteCar = async () => {
    if (!selectedCar) return;

    showConfirm(
      t("deleteConfirm", { name: selectedCar.name }),
      async () => {
        try {
          const getStoragePath = (url: string) => {
            const marker = "/car-images/";
            const parts = url.split(marker);
            return parts.length > 1 ? parts[1] : null;
          };

          const { data: images } = await supabase
            .from("car_images")
            .select("image_url")
            .eq("car_id", selectedCar.id);

          if (images && images.length > 0) {
            const paths = images
              .map((img) => getStoragePath(img.image_url))
              .filter(Boolean) as string[];

            if (paths.length > 0) {
              await supabase.storage.from("car-images").remove(paths);
            }
          }

          await supabase
            .from("car_images")
            .delete()
            .eq("car_id", selectedCar.id);

          await supabase
            .from("appointments")
            .delete()
            .eq("car_id", selectedCar.id);

          const { error } = await supabase
            .from("cars")
            .delete()
            .eq("id", selectedCar.id);

          if (error) throw error;

          showMessage("Car deleted successfully", "success", {
            onClose: () => {
              if (user) {
                getCarByOwnerId(user.id);
              }
              router.replace("/(tabs)/seller");
            },
          });
        } catch (error: any) {
          showMessage(error.message || "Failed to delete car", "error");
        }
      },
      {
        confirmText: t("deleteForever"),
        cancelText: t("keepCar"),
      },
    );
  };

  // Loading
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fbbf24" />
          <Text className="text-slate-400 mt-4">Loading car details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Not found
  if (!selectedCar) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="car-sport-outline" size={64} color="#475569" />
          <Text className="text-slate-400 text-base mt-4">Car not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-accent px-6 py-3 rounded-xl"
          >
            <Text className="text-primary font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="relative">
          {selectedImage && (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-80"
              resizeMode="cover"
            />
          )}
          <View className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

          <View className="absolute top-4 left-0 right-0 flex-row justify-between items-center px-4">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-slate-900/80 backdrop-blur-md rounded-full items-center justify-center border border-slate-700/50"
            >
              <Ionicons name="arrow-back" size={20} color="#f1f5f9" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => toggleFavorite(user?.id || "", id)}
              className="w-10 h-10 bg-slate-900/80 backdrop-blur-md rounded-full items-center justify-center border border-slate-700/50"
            >
              <Ionicons
                name={favoriteIds.has(id) ? "heart" : "heart-outline"}
                size={20}
                color={favoriteIds.has(id) ? "#ef4444" : "#fbbf24"}
              />
            </TouchableOpacity>
          </View>

          <View className="absolute bottom-4 left-4 bg-accent px-3 py-1.5 rounded-full">
            <Text className="text-primary text-sm font-bold">
              {selectedCar.year}
            </Text>
          </View>
        </View>

        {selectedCar.car_images && selectedCar.car_images.length > 0 && (
          <View className="px-6 mt-4">
            <FlatList
              horizontal
              data={selectedCar.car_images}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => setSelectedImage(item.image_url)}
                  className={`mr-3 rounded-xl overflow-hidden border-2 ${
                    selectedImage === item.image_url
                      ? "border-accent"
                      : "border-slate-700/30"
                  }`}
                >
                  {item.image_url && (
                    <Image
                      source={{ uri: item.image_url }}
                      className="w-20 h-20"
                      resizeMode="cover"
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        <View className="px-6 mt-6">
          <Text className="text-slate-400 text-sm uppercase tracking-wider">
            {selectedCar.brand}
          </Text>
          <Text className="text-white text-3xl font-bold mt-1">
            {selectedCar.name}
          </Text>

          <View className="flex-row items-baseline mt-4 mb-6">
            <Text className="text-accent text-4xl font-bold">
              {formatPrice(selectedCar.price)}
            </Text>
            <Text className="text-slate-400 text-sm ml-2">total price</Text>
          </View>

          <View className="flex-row flex-wrap gap-3 mb-6">
            <SpecCard
              title={t("power")}
              icon="speedometer-outline"
              value={selectedCar.horsepower}
            />
            <SpecCard
              title={t("acceleration")}
              icon="flash-outline"
              value={selectedCar.acceleration}
            />
            <SpecCard
              title={t("type")}
              icon="car-sport-outline"
              value={selectedCar.type}
            />
            <SpecCard
              title={t("fuel")}
              icon="water-outline"
              value={selectedCar.fuel_type}
            />
          </View>

          {selectedCar.description && (
            <View className="mb-6">
              <Text className="text-slate-100 text-lg font-semibold mb-3">
                {t("aboutThisCar")}
              </Text>
              <Text className="text-slate-400 text-base leading-6">
                {selectedCar.description}
              </Text>
            </View>
          )}

          <View className="mb-6">
            <Text className="text-slate-100 text-lg font-semibold mb-4">
              {t("specifications")}
            </Text>
            <View className="bg-slate-800/50 rounded-2xl border border-slate-700/30 overflow-hidden">
              <SpecRow
                label={t("transmission")}
                value={selectedCar.transmission}
              />
              <SpecRow
                label={t("seats")}
                value={`${selectedCar.seats} Passengers`}
              />
              <SpecRow label={t("fuelType")} value={selectedCar.fuel_type} />
              <SpecRow label={t("bodyType")} value={selectedCar.type} />
              <SpecRow
                label={t("year")}
                value={selectedCar.year.toString()}
                isLast
              />
            </View>
          </View>

          {canEditCar && (
            <View className="mb-8">
              <TouchableOpacity
                onPress={() => router.push(`/seller/${selectedCar.id}`)}
                className="bg-accent/10 border border-accent/30 rounded-2xl py-4 items-center"
              >
                <Text className="text-accent font-bold text-lg">
                  {t("editCarListing")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDeleteCar}
                disabled={isLoading}
                className="bg-red-500/20 border border-red-500/30 rounded-2xl mt-2 py-4 flex-row items-center justify-center mb-3"
              >
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
                <Text className="text-red-400 font-bold text-lg ml-2">
                  {t("deleteCar")}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {!canEditCar && (
            <View className="mb-8">
              <Text className="text-slate-100 text-lg font-semibold mb-4">
                {t("interested")}
              </Text>
              <View className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/30">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-accent/10 rounded-full items-center justify-center overflow-hidden border border-accent/30">
                    {seller?.avatarSignedUrl ? (
                      <Image
                        source={{ uri: seller.avatarSignedUrl }}
                        className="w-12 h-12"
                        resizeMode="cover"
                      />
                    ) : (
                      <Ionicons name="person" size={24} color="#fbbf24" />
                    )}
                  </View>

                  <View className="ml-4 flex-1">
                    <Text className="text-white text-base font-semibold">
                      {isSellerLoading
                        ? "Loading..."
                        : seller?.full_name || "Seller"}
                    </Text>
                    <Text className="text-slate-400 text-sm">
                      {isSellerLoading
                        ? ""
                        : seller?.phone || "No phone listed"}
                    </Text>
                  </View>
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={handleCall}
                    disabled={!seller?.phone}
                    className={`flex-1 rounded-xl py-3 flex-row items-center justify-center border ${
                      seller?.phone
                        ? "bg-accent/10 border-accent/30"
                        : "bg-slate-700/20 border-slate-700/30"
                    }`}
                  >
                    <Ionicons
                      name="call"
                      size={20}
                      color={seller?.phone ? "#fbbf24" : "#64748b"}
                    />
                    <Text
                      className={`font-semibold ml-2 ${seller?.phone ? "text-accent" : "text-slate-500"}`}
                    >
                      {t("call")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleMessage}
                    disabled={!seller?.phone}
                    className={`flex-1 rounded-xl py-3 flex-row items-center justify-center border ${
                      seller?.phone
                        ? "bg-accent/10 border-accent/30"
                        : "bg-slate-700/20 border-slate-700/30"
                    }`}
                  >
                    <Ionicons
                      name="chatbubble"
                      size={20}
                      color={seller?.phone ? "#fbbf24" : "#64748b"}
                    />
                    <Text
                      className={`font-semibold ml-2 ${seller?.phone ? "text-accent" : "text-slate-500"}`}
                    >
                      {t("message")}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {isBuyer && !isOwner && selectedCar?.available && (
        <View className="px-6 py-4 border-t border-slate-700/50 bg-primary">
          {hasActiveBooking ? (
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/appointments")}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl py-4 flex-row items-center justify-center"
            >
              <Ionicons name="checkmark-circle" size={20} color="#eab308" />
              <Text className="text-yellow-400 font-bold text-lg ml-2">
                {t("viewYourBooking")}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => setShowBookingModal(true)}
              className="bg-accent rounded-2xl py-4 flex-row items-center justify-center"
            >
              <Ionicons name="calendar" size={20} color="#020617" />
              <Text className="text-primary font-bold text-lg ml-2">
                {t("bookTestDrive")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <BookingModal
        visible={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        carId={id}
        carName={selectedCar.name}
        sellerId={selectedCar.owner_id}
        onSuccess={() => {
          setShowBookingModal(false);
          router.push("/(tabs)/appointments");
        }}
      />
    </SafeAreaView>
  );
}

const SpecCard = ({ title, icon, value }: any) => (
  <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30 flex-1 min-w-[45%]">
    <View className="flex-row items-center mb-2">
      <Ionicons name={icon} size={20} color="#fbbf24" />
      <Text className="text-slate-400 text-xs uppercase tracking-wider ml-2">
        {title}
      </Text>
    </View>
    <Text className="text-white text-lg font-bold">{value}</Text>
  </View>
);

const SpecRow = ({ label, value, isLast = false }: any) => (
  <View
    className={`flex-row justify-between items-center px-4 py-4 ${!isLast ? "border-b border-slate-700/30" : ""}`}
  >
    <Text className="text-slate-400 text-sm">{label}</Text>
    <Text className="text-white font-semibold">{value}</Text>
  </View>
);
