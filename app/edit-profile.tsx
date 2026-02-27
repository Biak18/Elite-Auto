import DropdownPicker from "@/src/components/ui/DropdownPicker";
import FormField from "@/src/components/ui/FormField";
import { uploadAvatar } from "@/src/lib/api/users";
import { supabase } from "@/src/lib/supabase";
import { showMessage } from "@/src/lib/utils/dialog";
import { normalizeMyanmarPhone } from "@/src/lib/utils/formatters";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EditProfile = () => {
  const { t } = useTranslation();
  const {
    profile,
    user,
    fetchProfile,
    isLoading: supabaseIsLoading,
  } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    bio: "",
    dateOfBirth: "",
    gender: "", // male | female | other
  });

  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.full_name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        bio: profile.bio || "",
        dateOfBirth: profile.date_of_birth || "",
        gender: profile.gender || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      showMessage(t("cannotEmmpty", { name: "Full Name" }), "warning");
      return;
    }

    // if (form.phone && !/^\+?[\d\s-()]{7,15}$/.test(form.phone)) {
    //   showMessage("Please enter a valid phone number", "warning");
    //   return;
    // }

    if (form.phone && !normalizeMyanmarPhone(form.phone.trim())) {
      showMessage(t("invalidPhoneNumber"));
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
          bio: form.bio,
          date_of_birth: form.dateOfBirth,
          gender: form.gender,
        })
        .eq("id", user?.id);

      if (error) throw error;

      if (user) await fetchProfile(user.id);
      showMessage(t("profileUpdated"), "success", {
        onClose: () => router.back(),
      });
    } catch (error: any) {
      showMessage(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showMessage(t("permissionsRequired"), "warning");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        selectionLimit: 1,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        handleUpload(
          result.assets[0].base64!,
          result.assets[0].mimeType ?? "image/png",
        );
      }
    } catch (error) {
      throw error;
    }
  };

  const handleUpload = async (base64: string, contentType: string) => {
    setIsLoading(true);
    try {
      if (!user) return;

      const public_url = await uploadAvatar(base64, contentType, user.id);
      const { error } = await supabase
        .from("profiles")
        .update({
          avatar_url: public_url,
        })
        .eq("id", user?.id);

      if (error) throw error;
      await fetchProfile(user.id);

      showMessage(t("profilePictureUpdated"), "success");
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  return (
    <SafeAreaView className="bg-primary flex-1">
      <View className="flex-1">
        <View className="bg-secondary h-16 flex-row justify-between items-center px-4">
          <TouchableOpacity onPress={() => router.back()} className="w-20">
            <Ionicons name="arrow-back" size={24} color="#fbbf24" />
          </TouchableOpacity>

          <Text className="text-xl font-orbitron-bold text-accent">
            {t("editProfile")}
          </Text>

          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            className="w-20 bg-accent rounded-xl h-9 justify-center items-center"
          >
            <Text className="font-inter-semibold text-primary text-sm">
              {isLoading ? "Saving..." : "Save"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="justify-center items-center mt-6 mb-2">
            <View className="relative">
              {profile?.avatarSignedUrl ? (
                <Image
                  source={{ uri: profile.avatarSignedUrl }}
                  className="w-32 h-32 rounded-full bg-secondary"
                />
              ) : (
                <View className="w-32 h-32 rounded-full bg-accent items-center justify-center">
                  <Text className="text-primary text-4xl font-bold">
                    {profile?.full_name?.[0]?.toUpperCase() ||
                      user?.email?.[0]?.toUpperCase() ||
                      "U"}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                className="absolute bottom-1 -right-1 w-10 h-10 justify-center bg-secondary border border-slate-700 items-center rounded-full"
                onPress={pickImage}
              >
                <Ionicons name="camera" size={22} color="#fbbf24" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="border-b border-accent mt-3"
              onPress={pickImage}
            >
              <Text className="text-accent font-inter">{t("changePhoto")}</Text>
            </TouchableOpacity>
          </View>
          <View className="px-6 mt-6">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2 pb-2">
              {t("personalInfo")}
            </Text>

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
              placeholder="+959 725 870 458"
              handleChangeText={(text) => setForm({ ...form, phone: text })}
              iconName="call-outline"
              keyboardType="phone-pad"
              otherStyles="mt-4"
            />

            <FormField
              title={t("dateOfBirth")}
              value={form.dateOfBirth}
              placeholder="DD / MM / YYYY"
              handleChangeText={(text) =>
                setForm({ ...form, dateOfBirth: text })
              }
              iconName="calendar-outline"
              keyboardType="numeric"
              otherStyles="mt-4"
            />
            <View className="mt-4">
              <DropdownPicker
                title={t("gender")}
                value={form.gender}
                placeholder={t("selectGender")}
                options={genderOptions}
                iconName="person-outline"
                showPicker={showGenderPicker}
                onToggle={() => {
                  setShowGenderPicker(!showGenderPicker);
                }}
                onSelect={(value) => {
                  setForm({ ...form, gender: value });
                  setShowGenderPicker(false);
                }}
              />
            </View>
          </View>

          <View className="px-6 mt-6">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
              {t("address")}
            </Text>

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
              otherStyles="mt-4"
            />
          </View>

          {/* <View className="px-6 mt-6">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
              About
            </Text>

            <View>
              <Text className="text-base text-gray-300 font-medium mb-2">
                Bio
              </Text>
              <View
                className="w-full px-4 py-3 bg-slate-900/60 rounded-2xl min-h-[120px] border border-slate-600"
                style={{
                  borderWidth: 1,
                  borderColor: "#475569",
                  minHeight: 120,
                }}
              >
                <View className="flex-row items-start mb-2">
                  <Ionicons
                    name="chatbubble-outline"
                    size={20}
                    color="#64748b"
                    style={{ marginRight: 12 }}
                  />
                  <Text className="text-slate-500 text-base">
                    {form.bio || "Tell us about yourself..."}
                  </Text>
                </View>
              </View>
            </View>
          </View> */}

          <View className="px-6 mt-6">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
              {t("accountType")}
            </Text>

            <View className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-accent/10 rounded-xl items-center justify-center mr-4">
                  <Ionicons
                    name={
                      profile?.role === "admin"
                        ? "person"
                        : profile?.role === "seller"
                          ? "car-sport"
                          : "search"
                    }
                    size={22}
                    color="#fbbf24"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-100 text-base font-semibold">
                    {profile?.role === "admin"
                      ? "Admin Account"
                      : profile?.role === "seller"
                        ? t("sellerAccount")
                        : t("buyerAccount")}
                  </Text>
                  {profile?.role === "admin" ? null : (
                    <Text className="text-slate-400 text-sm mt-0.5">
                      {profile?.role === "seller"
                        ? t("sellCars")
                        : t("buyCars")}
                    </Text>
                  )}
                </View>
                <Ionicons name="lock-closed" size={20} color="#64748b" />
              </View>
            </View>

            <Text className="text-slate-500 text-xs mt-2 ml-1 pb-2">
              {t("contactSupport")}
            </Text>
          </View>

          <View className="px-6 mt-6 mb-8">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-4">
              {t("account")}
            </Text>

            <FormField
              title={t("email")}
              value={form.email}
              placeholder="your@email.com"
              iconName="mail-outline"
              editable={false}
            />

            <Text className="text-slate-500 text-xs mt-2 ml-1">
              {t("changeEmail")}
            </Text>
          </View>
        </ScrollView>
        {isLoading && (
          <View className="absolute inset-0 bg-black/50 justify-center items-center rounded-xl">
            <View className="bg-secondary p-6 rounded-2xl items-center border border-slate-700">
              <ActivityIndicator color="#fbbf24" size="large" />
              <Text className="text-slate-300 text-sm mt-3">{t("saving")}</Text>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

export default EditProfile;
