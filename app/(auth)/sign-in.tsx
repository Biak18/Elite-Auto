import Custombutton from "@/src/components/ui/Custombutton";
import FormField from "@/src/components/ui/FormField";
import { supabase } from "@/src/lib/supabase";
import { showConfirm, showMessage } from "@/src/lib/utils/dialog";
import { useAuthStore } from "@/src/store/authStore";
import { Link } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { StatusBar, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const SignIn = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const { signIn, isLoading: signInLoading } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const handleSignIn = async () => {
    if (!form.email || !form.password) {
      showMessage(t("fillAllFields"), "warning");
      return;
    }
    setIsLoading(true);
    try {
      await signIn(form.email, form.password);
    } catch (error: any) {
      showMessage(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    showConfirm(
      "Reset Password?\n\nWe'll send a password reset link to your email address.",
      async () => {
        if (!form.email) {
          showMessage("Please enter your email address first", "warning");
          return;
        }

        try {
          const { error } = await supabase.auth.resetPasswordForEmail(
            form.email,
            {
              redirectTo: "eliteauto://change-password", // Deep link
            },
          );

          if (error) throw error;

          showMessage(
            "Password reset email sent!\n\nPlease check your email and follow the instructions.",
            "success",
          );
        } catch (error: any) {
          showMessage(error.message, "error");
        }
      },
      {
        confirmText: "Send Reset Link",
        cancelText: "Cancel",
      },
    );
  };

  return (
    <SafeAreaView className="bg-primary flex-1">
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        enableOnAndroid={true}
        enableAutomaticScroll={true}
        extraScrollHeight={10}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="w-full justify-center min-h-screen px-4 py-6">
          <Text className="font-orbitron text-4xl text-accent mb-2 min-h-[56px] align-middle">
            {t("joinElite")} {/* Join Elite */}
          </Text>
          <Text className="text-gray-300 mt-2 font-inter-medium text-base">
            {t("welcomeBack")}
            {/* Welcome back! Please sign in to your account. */}
          </Text>

          <FormField
            title={t("email")}
            placeholder="your@email.com"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            iconName="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            readOnly={isLoading}
          />

          <FormField
            title={t("password")}
            placeholder={t("passwordPlaceholder")}
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
            iconName="lock-closed-outline"
            readOnly={isLoading}
          />

          <Custombutton
            title={t("signIn")}
            handlePress={handleSignIn}
            containerStyles="w-full mt-7"
            isLoading={isLoading}
          />

          {/* <TouchableOpacity onPress={handleForgotPassword} className="mt-4">
            <Text className="text-accent text-sm text-center underline">
              Forgot Password?
            </Text>
          </TouchableOpacity> */}

          <View className="flex-row justify-center items-center pt-5 gap-2">
            <Text className="text-lg text-gray-100 font-inter">
              {t("dontHaveAccount")}
            </Text>
            <Link
              href={"/sign-up"}
              className="text-accent-light text-lg font-inter-semibold"
            >
              {t("signUp")}
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
      <StatusBar barStyle="light-content" />
    </SafeAreaView>
  );
};

export default SignIn;
