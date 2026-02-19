import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "../locales/en";
import my from "../locales/my";

const LANGUAGE_KEY = "@elite_auto_language";

// Get saved language
const getInitialLanguage = async () => {
    try {
        const saved = await AsyncStorage.getItem(LANGUAGE_KEY);
        return saved || "en"; // Default to English
    } catch {
        return "en";
    }
};

// Initialize
getInitialLanguage().then((lng) => {
    i18n.changeLanguage(lng);
});

i18n.use(initReactI18next).init({
    compatibilityJSON: "v3",
    resources: {
        en: { translation: en },
        my: { translation: my },
    },
    lng: "en",
    fallbackLng: "en",
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;

export const changeLanguage = async (languageCode: string) => {
    try {
        await i18n.changeLanguage(languageCode);
        await AsyncStorage.setItem(LANGUAGE_KEY, languageCode);
    } catch (error) {
        console.error("Change language error:", error);
    }
};
