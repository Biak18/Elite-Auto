import Custombutton from "@/src/components/ui/Custombutton";
import FormField from "@/src/components/ui/FormField";
import { supabase } from "@/src/lib/supabase";
import { showMessage } from "@/src/lib/utils/dialog";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const { signOut } = useAuthStore();
  const { t } = useTranslation();
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      showMessage(t("fillAllFields"), "warning");
      return;
    }

    if (form.newPassword.length < 6) {
      showMessage(t("newPasswordMessage"), "warning");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      showMessage(t("passwordMatchMessage"), "error");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      showMessage(t("passwordDifferentMessage"), "warning");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: form.newPassword,
      });

      if (error) throw error;

      showMessage(t("passwordMessage"), "success", {
        onClose: async () => {
          await signOut();
        },
      });
    } catch (error: any) {
      showMessage(error.message || "Failed to change password", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-row items-center px-6 py-4 border-b border-slate-700/30">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <Ionicons name="chevron-back" size={24} color="#fbbf24" />
          </TouchableOpacity>
          <Text className="text-xl font-orbitron text-accent ml-2">
            {t("changePassword")}
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="mt-6">
            <View className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 mb-6">
              <View className="flex-row items-start">
                <Ionicons name="information-circle" size={20} color="#3b82f6" />
                <Text className="text-blue-400 text-sm ml-3 flex-1">
                  {t("passwordNote")}
                </Text>
              </View>
            </View>

            <FormField
              title={t("currentPassword")}
              placeholder={t("enterCurrentPassword")}
              value={form.currentPassword}
              handleChangeText={(text) =>
                setForm({ ...form, currentPassword: text })
              }
              iconName="lock-closed-outline"
              readOnly={isLoading}
            />

            <FormField
              title={t("newPassword")}
              placeholder={t("enterNewPassword")}
              value={form.newPassword}
              handleChangeText={(text) =>
                setForm({ ...form, newPassword: text })
              }
              iconName="key-outline"
              otherStyles="mt-4"
              readOnly={isLoading}
            />

            <FormField
              title={t("confirmNewPassword")}
              placeholder={t("enterConfirmNewPassword")}
              value={form.confirmPassword}
              handleChangeText={(text) =>
                setForm({ ...form, confirmPassword: text })
              }
              iconName="checkmark-circle-outline"
              otherStyles="mt-4"
              readOnly={isLoading}
            />

            <View className="mt-4 bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
              <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                {t("passwordRequiredments.1")}
              </Text>
              <View className="flex-row items-center mb-1">
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#10b981"
                  className="pb-1"
                />
                <Text className="text-slate-400 text-xs ml-2 pb-1">
                  {t("passwordRequiredments.2")}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons
                  name="checkmark-circle"
                  size={14}
                  color="#10b981"
                  className="pb-1"
                />
                <Text className="text-slate-400 text-xs ml-2 pb-1">
                  {t("passwordRequiredments.3")}
                </Text>
              </View>
            </View>

            <Custombutton
              title={t("changePassword")}
              handlePress={handleChangePassword}
              containerStyles="w-full mt-8"
              isLoading={isLoading}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
