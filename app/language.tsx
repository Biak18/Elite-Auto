// app/language.tsx
import { changeLanguage } from "@/src/lib/i18n";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const languageOptions = [
  { code: "en", label: "English (US)", flag: "🇺🇸" },
  { code: "my", label: "မြန်မာ", flag: "🇲🇲" }, // ✅ Enabled
];

const Language = () => {
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language);

  const handleLanguageSelect = async (code: string) => {
    setSelectedLanguage(code);
    await changeLanguage(code);
  };

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row items-center px-6 py-4 border-b border-slate-700/30">
        <TouchableOpacity
          onPress={() => router.back()}
          className="w-10 h-10 items-center justify-center -ml-2"
        >
          <Ionicons name="chevron-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        <Text className="text-xl font-orbitron text-accent ml-2">
          {t("language")}
        </Text>
      </View>

      <ScrollView
        className="flex-1 px-6 mt-6"
        showsVerticalScrollIndicator={false}
      >
        <View className="bg-slate-800/50 rounded-2xl border border-slate-700/30 overflow-hidden">
          {languageOptions.map((lang, index) => (
            <TouchableOpacity
              key={lang.code}
              onPress={() => handleLanguageSelect(lang.code)}
              className={`flex-row items-center justify-between p-4 ${
                index !== languageOptions.length - 1
                  ? "border-b border-slate-700/30"
                  : ""
              }`}
            >
              <View className="flex-row items-center flex-1">
                <Text className="text-2xl mr-3">{lang.flag}</Text>
                <Text
                  className={`text-base font-semibold ${
                    selectedLanguage === lang.code
                      ? "text-accent"
                      : "text-white"
                  }`}
                >
                  {lang.label}
                </Text>
              </View>

              {selectedLanguage === lang.code && (
                <Ionicons name="checkmark-circle" size={24} color="#fbbf24" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View className="mt-4 items-center pb-8">
          <Text className="text-slate-500 text-xs">{t("loading")}</Text>
          <Text className="text-slate-400 text-sm font-semibold mt-1">
            {languageOptions.find((l) => l.code === selectedLanguage)?.label}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Language;
