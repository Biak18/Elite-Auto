import FormField from "@/src/components/ui/FormField";
import { supabase } from "@/src/lib/supabase";
import { showMessage } from "@/src/lib/utils/dialog";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CompleteProfile() {
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
      showMessage("Full name is required");
      return;
    }

    if (!selectedRole) {
      showMessage("Please select your role");
      return;
    }

    if (!form.phone.trim()) {
      showMessage("Phone number is required");
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
          <Text className="font-orbitron text-3xl text-accent mb-2">
            Complete Your Profile
          </Text>
          <Text className="text-slate-400 text-sm">
            Just a few more details to get started
          </Text>
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

        {/* Role Selection */}
        <View className="px-6 mb-6">
          <Text className="text-slate-300 text-base font-semibold mb-3">
            I want to:
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
                Buy Cars
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                Browse and purchase vehicles
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
                Sell Cars
              </Text>
              <Text className="text-slate-400 text-xs mt-1">
                List vehicles for sale
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Form */}
        <View className="px-6 gap-4">
          <FormField
            title="Full Name"
            value={form.fullName}
            placeholder="Enter your full name"
            handleChangeText={(text) => setForm({ ...form, fullName: text })}
            iconName="person-outline"
          />

          <FormField
            title="Phone Number"
            value={form.phone}
            placeholder="09 234 567 890"
            handleChangeText={(text) => setForm({ ...form, phone: text })}
            iconName="call-outline"
            keyboardType="phone-pad"
          />

          <FormField
            title="Address (Optional)"
            value={form.address}
            placeholder="Enter your address"
            handleChangeText={(text) => setForm({ ...form, address: text })}
            iconName="location-outline"
          />

          <FormField
            title="City (Optional)"
            value={form.city}
            placeholder="Enter your city"
            handleChangeText={(text) => setForm({ ...form, city: text })}
            iconName="map-outline"
          />
        </View>

        {/* Submit Button */}
        <View className="px-6 py-8">
          <TouchableOpacity
            onPress={handleComplete}
            disabled={isLoading}
            className="bg-accent rounded-2xl py-4"
          >
            <Text className="text-primary text-center font-bold text-lg">
              {isLoading ? "Completing..." : "Complete Profile"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Loading Overlay */}
      {isLoading ||
        (!profile && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center">
            <View className="bg-secondary p-6 rounded-2xl items-center border border-slate-700">
              <Text className="text-slate-300 text-sm">
                Setting up your profile...
              </Text>
            </View>
          </View>
        ))}
    </SafeAreaView>
  );
}
