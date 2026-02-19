// src/lib/utils/layout.ts
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useBottomTabHeight = () => {
    const insets = useSafeAreaInsets();

    if (Platform.OS === "ios") {
        return {
            height: 88,
            paddingBottom: 28,
        };
    }

    // Android
    return {
        height: 65 + insets.bottom,
        paddingBottom: Math.max(insets.bottom, 10),
    };
};

export const useBottomCTAPadding = () => {
    const insets = useSafeAreaInsets();
    return Math.max(insets.bottom, 16);
};
