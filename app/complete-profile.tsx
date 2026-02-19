import FormField from "@/src/components/ui/FormField";
import { supabase } from "@/src/lib/supabase";
import { showMessage } from "@/src/lib/utils/dialog";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteProfile() {
  const { t } = useTranslation();
  const { user, profile, fetchProfile } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<"buyer" | "seller" | null>(
    null,
  );

  // useEffect(() => {
  //   const prepare = async () => {
  //     if (user) {
  //       await fetchProfile(user.id);
  //     }
  //   };
  //   prepare();
  // }, [user]);

  const [form, setForm] = useState({
    fullName: profile?.full_name || "",
    phone: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      fullName: profile.full_name ?? "",
      phone: profile.phone ?? "",
      address: profile.address ?? "",
      city: profile.city ?? "",
    });
  }, [profile]);

  // useEffect(() => {
  //   if (profile?.full_name) {
  //     setForm((prev) => ({
  //       ...prev,
  //       fullName: profile.full_name ?? "",
  //       phone: profile.phone ?? "",
  //       address: profile.address ?? "",
  //       city: profile.city ?? "",
  //     }));
  //   }
  // }, [profile]);

  const handleComplete = async () => {
    if (!form.fullName.trim()) {
      showMessage(t("requiredField", { name: t("fullName") }));
      return;
    }

    if (!selectedRole) {
      showMessage(t("selectRole"));
      return;
    }

    if (!form.phone.trim()) {
      showMessage(t("requiredField", { name: t("phoneNumber") }));
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          role: selectedRole,
          profile_completed: true,
        })
        .eq("id", user?.id!);

      if (error) throw error;

      if (user) await fetchProfile(user.id);
      router.replace("/(tabs)");
    } catch (error: any) {
      showMessage(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 pt-6 pb-4">
          <Text className="font-orbitron text-3xl text-accent mb-2 pt-2">
            {t("completeProfiel")}
          </Text>
          <Text className="text-slate-400 text-sm">{t("fewMoreDetail")}</Text>
        </View>

        <View className="items-center py-6">
          <View className="w-24 h-24 rounded-full bg-accent items-center justify-center">
            <Text className="text-primary text-3xl font-bold">
              {form.fullName?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                "U"}
            </Text>
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-slate-300 text-base font-semibold mb-3">
            {t("iWantTo")}
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setSelectedRole("buyer")}
              className={`flex-1 rounded-2xl p-4 border-2 ${
                selectedRole === "buyer"
                  ? "border-accent bg-accent/10"
                  : "border-slate-700 bg-slate-800/50"
              }`}
            >
              <Ionicons
                name="search-outline"
                size={28}
                color={selectedRole === "buyer" ? "#fbbf24" : "#64748b"}
              />
              <Text
                className={`text-lg font-bold mt-2 ${
                  selectedRole === "buyer" ? "text-accent" : "text-slate-300"
                }`}
              >
                {t("category.buy.main")}
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                {t("category.buy.sub")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setSelectedRole("seller")}
              className={`flex-1 rounded-2xl p-4 border-2 ${
                selectedRole === "seller"
                  ? "border-accent bg-accent/10"
                  : "border-slate-700 bg-slate-800/50"
              }`}
            >
              <Ionicons
                name="car-sport-outline"
                size={28}
                color={selectedRole === "seller" ? "#fbbf24" : "#64748b"}
              />
              <Text
                className={`text-lg font-bold mt-2 ${
                  selectedRole === "seller" ? "text-accent" : "text-slate-300"
                }`}
              >
                {t("category.sell.main")}
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                {t("category.sell.sub")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View className="px-6 gap-4">
          <FormField
            title={t("fullName")}
            value={form.fullName}
            placeholder={t("fullNamePlaceHolder")}
            handleChangeText={(text) => setForm({ ...form, fullName: text })}
            iconName="person-outline"
          />

          <FormField
            title={t("phoneNumber")}
            value={form.phone}
            placeholder="09 234 567 890"
            handleChangeText={(text) => setForm({ ...form, phone: text })}
            iconName="call-outline"
            keyboardType="phone-pad"
          />

          <FormField
            title={t("address")}
            value={form.address}
            placeholder={t("addressPlaceHolder")}
            handleChangeText={(text) => setForm({ ...form, address: text })}
            iconName="location-outline"
          />

          <FormField
            title={t("city")}
            value={form.city}
            placeholder={t("cityPlaceHolder")}
            handleChangeText={(text) => setForm({ ...form, city: text })}
            iconName="map-outline"
          />
        </View>

        <View className="px-6 py-8">
          <TouchableOpacity
            onPress={handleComplete}
            disabled={isLoading}
            className="bg-accent rounded-2xl py-4"
          >
            <Text className="text-primary text-center font-bold text-lg">
              {isLoading ? t("completingMessage") : t("completeMessage")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {isLoading ||
        (!profile && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center">
            <View className="bg-secondary p-6 rounded-2xl items-center border border-slate-700">
              <Text className="text-slate-300 text-sm">
                {t("settingProfile")}
              </Text>
            </View>
          </View>
        ))}
    </SafeAreaView>
  );
}
