import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { supabase } from "@/src/lib/supabase";
import { showConfirm, showMessage } from "@/src/lib/utils/dialog";
import { useAppointmentStore } from "@/src/store/appointmentStore";
import { useAuthStore } from "@/src/store/authStore";
import { useFavoriteStore } from "@/src/store/favoriteStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Image,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Profile = () => {
  const { user, profile, signOut, fetchProfile } = useAuthStore();

  const isSeller = profile?.role === "seller";
  const favoriteCount = useFavoriteStore((state) => state.favoriteIds.size);
  const appointments = useAppointmentStore((state) => state.appointments);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    profile?.notifications_enabled ?? true,
  );
  const { t } = useTranslation();
  // const [darkModeEnabled, setDarkModeEnabled] = useState(true);
  useEffect(() => {
    async function prepare() {
      if (user) await fetchProfile(user.id);
    }
    prepare();
  }, [user]);

  const appointmentCount = appointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed",
  ).length;

  const fetchAppointments = useAppointmentStore(
    (state) => state.fetchAppointments,
  );

  useEffect(() => {
    if (user && profile) {
      fetchAppointments(isSeller, user.id);
    }
  }, [user, profile]);

  const handleSignOut = async () => {
    showConfirm(
      t("signOutConfirm"),
      async () => {
        await signOut();
      },
      {
        confirmText: t("signOut"),
        cancelText: t("cancel"),
      },
    );
  };

  const handleToggleNotifications = async (value: boolean) => {
    if (!user) return;
    setNotificationsEnabled(value);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ notifications_enabled: value })
        .eq("id", user.id);

      if (error) showMessage(error.message, "error");

      await fetchProfile(user.id);

      showMessage(
        value
          ? "Notifications enabled ✅"
          : "Notifications disabled. You won't receive push notifications.",
        "success",
      );
    } catch (error: any) {
      setNotificationsEnabled(!value);
      showMessage("Failed to update notification settings", "error");
      console.error("Toggle notifications error:", error);
    }
  };

  const MenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    rightComponent,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    showArrow?: boolean;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-between bg-slate-800/50 rounded-2xl p-4 mb-3 border border-slate-700/30"
      activeOpacity={0.7}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 bg-accent/10 rounded-xl items-center justify-center mr-4">
          <Ionicons name={icon} size={22} color="#fbbf24" />
        </View>
        <View className="flex-1">
          <Text className="text-slate-100 text-base font-semibold">
            {title}
          </Text>
          {subtitle && (
            <Text className="text-slate-400 text-sm mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>
      {rightComponent ||
        (showArrow && (
          <Ionicons name="chevron-forward" size={20} color="#64748b" />
        ))}
    </TouchableOpacity>
  );

  const StatCard = ({
    value,
    label,
    icon,
  }: {
    value: string | number;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
  }) => (
    <View className="flex-1 bg-slate-800/50 rounded-2xl p-4 border border-slate-700/30 items-center">
      <View className="w-10 h-10 bg-accent/10 rounded-full items-center justify-center mb-2">
        <Ionicons name={icon} size={20} color="#fbbf24" />
      </View>
      <Text className="text-2xl font-bold text-accent">{value}</Text>
      <Text className="text-slate-400 text-xs mt-1">{label}</Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT }}
      >
        <View className="px-6 pt-4 pb-6">
          <Text className="font-orbitron text-3xl text-accent mb-1 align-middle min-h-11">
            {t("profile")}
          </Text>
          {/* <Text className="text-slate-400 text-sm">Manage your account</Text> */}
          <Text className="text-slate-400 text-sm">{t("manageAccount")}</Text>
        </View>

        <View className="mx-6 mb-6">
          <View className="bg-slate-800/50 rounded-3xl p-6 border border-slate-700/30">
            <View className="flex-row items-center mb-6">
              <View className="relative">
                {profile?.avatarSignedUrl ? (
                  <Image
                    source={{ uri: profile.avatarSignedUrl }}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <View className="w-20 h-20 rounded-full bg-accent items-center justify-center">
                    <Text className="text-primary text-2xl font-bold">
                      {profile?.full_name?.[0]?.toUpperCase() ||
                        user?.email?.[0]?.toUpperCase() ||
                        "U"}
                    </Text>
                  </View>
                )}
                <View className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-xl border-2 border-primary" />
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-xl font-bold text-slate-100">
                  {profile?.full_name || "Elite Member"}
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                  {user?.email}
                </Text>

                {profile?.phone && (
                  <Text className="text-slate-400 text-sm mt-0.5">
                    {profile.phone}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                className="w-10 h-10 bg-accent/10 rounded-full items-center justify-center"
                onPress={() => router.push("/edit-profile")}
              >
                <Ionicons name="pencil" size={18} color="#fbbf24" />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
              <StatCard value={favoriteCount} label="Favorites" icon="heart" />
              <StatCard
                value={appointmentCount}
                label="Bookings"
                icon="calendar"
              />
              {/* <StatCard value="12" label="Test Drives" icon="car-sport" /> */}
            </View>
          </View>
        </View>

        <View className="px-6 mb-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Account
          </Text>
          <MenuItem
            icon="person-outline"
            title={t("editProfile")}
            subtitle={t("subtitle.profile")}
            onPress={() => router.push("/edit-profile")}
          />
          <MenuItem
            icon="lock-closed-outline"
            title={t("changePassword")}
            subtitle={t("subtitle.password")}
            onPress={() => router.push("/change-password")}
          />
          {/* <MenuItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage your payment options"
            onPress={() => showMessage("Payment Methods")}
          /> */}
        </View>

        <View className="px-6 mb-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Preferences
          </Text>
          <MenuItem
            icon="notifications-outline"
            title={t("pushNotifications")}
            subtitle={t("subtitle.noti")}
            showArrow={false}
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleToggleNotifications}
                trackColor={{ false: "#334155", true: "#fbbf24" }}
                thumbColor={notificationsEnabled ? "#fff" : "#94a3b8"}
              />
            }
          />
          {/* <MenuItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Always enabled"
            showArrow={false}
            rightComponent={
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                trackColor={{ false: "#334155", true: "#fbbf24" }}
                thumbColor={darkModeEnabled ? "#fff" : "#94a3b8"}
              />
            }
          /> */}
          <MenuItem
            icon="language-outline"
            title={t("language")}
            subtitle={t("subtitle.lang")}
            onPress={() => router.push("/language")}
          />
        </View>

        <View className="px-6 mb-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            More
          </Text>
          <MenuItem
            icon="help-circle-outline"
            title="Help & Support"
            subtitle="Get help and contact us"
            onPress={() => showMessage("Help & Support")}
          />
          {/* <MenuItem
            icon="document-text-outline"
            title="Terms & Conditions"
            onPress={() => showMessage("Terms & Conditions")}
          /> */}
          {/* <MenuItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            onPress={() => showMessage("Privacy Policy")}
          /> */}
          <MenuItem
            icon="information-circle-outline"
            title="About Elite Auto"
            subtitle="Version 1.0.0"
            onPress={() =>
              showMessage(
                "About \n Elite Auto v1.0.0\nPremium Car Showroom App",
              )
            }
          />
        </View>

        <View className="px-6 pb-8">
          <TouchableOpacity
            onPress={handleSignOut}
            className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="log-out-outline" size={22} color="#ef4444" />
            <Text className="text-red-500 font-bold text-base ml-2">
              {t("signOut")}
            </Text>
          </TouchableOpacity>
        </View>

        <View className="items-center pb-8">
          <Text className="text-slate-500 text-xs">© 2024 Elite Auto</Text>
          <Text className="text-slate-600 text-xs mt-1">
            All rights reserved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
