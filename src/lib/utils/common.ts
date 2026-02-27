import { Linking } from "react-native";
import { showMessage } from "./dialog";

export const handleCall = async (
    phone: string | null,
    t: (key: string) => string,
) => {
    if (!phone) {
        showMessage(t("phoneAlert"), "warning");
        return;
    }

    try {
        await Linking.openURL(`tel:${phone}`);
    } catch {
        showMessage(t("phoneError"), "warning");
    }
};

export const handleMessage = async (
    phone: string | null,
    t: (key: string) => string,
) => {
    if (!phone) {
        showMessage(t("phoneAlert"), "warning");
        return;
    }

    try {
        await Linking.openURL(`sms:${phone}`);
    } catch {
        showMessage(t("smsError"), "warning");
    }
};
