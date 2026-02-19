import Custombutton from "@/src/components/ui/Custombutton";
import FormField from "@/src/components/ui/FormField";
import { showMessage } from "@/src/lib/utils/dialog";
import { useAuthStore } from "@/src/store/authStore";
import { Link } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const { signUp, isLoading } = useAuthStore();

  const submit = async () => {
    if (!form.fullname || !form.email || !form.password) {
      showMessage(t("fillAllFields"), "warning");
      return;
    }

    try {
      await signUp(form.email, form.password, form.fullname);
    } catch (error: any) {
      showMessage(error.message, "error");
    }
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
        <View className="w-full justify-center min-h-screen  px-4 py-6">
          <Text className="font-orbitron text-4xl text-accent mb-2 min-h-[56px] align-middle">
            {t("joinElite")} {/* Join Elite */}
          </Text>
          <Text className="text-slate-400 mb-8">{t("createAccount")}</Text>

          <FormField
            title={t("username")}
            placeholder="Enter your name"
            value={form.fullname}
            handleChangeText={(e) => setForm({ ...form, fullname: e })}
            otherStyles="mt-7"
            iconName="person-outline"
            autoCapitalize="none"
            readOnly={isLoading}
          />

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
            title={t("signUp")}
            handlePress={submit}
            containerStyles="w-full mt-7"
            isLoading={isLoading}
          />

          <View className="flex-row justify-center items-center pt-5 gap-2">
            <Text className="text-lg text-gray-100 font-inter">
              {t("alreadyHaveAccount")}
            </Text>
            <Link
              href={"/sign-in"}
              className="text-accent-light textt-lg font-inter-semibold"
            >
              {t("signIn")}
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
