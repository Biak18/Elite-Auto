// src/widgets/MessageBox.tsx
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import Modal from "react-native-modal";
import { useUIStore } from "../store/uiStore";

const MessageBox = () => {
  const {
    show,
    message,
    type,
    hideMessage,
    onConfirm,
    onCancel,
    confirmText,
    cancelText,
  } = useUIStore();

  const [isLoading, setIsLoading] = useState(false);

  const getIcon = () => {
    switch (type) {
      case "error":
        return { name: "close-circle", color: "#ef4444" };
      case "success":
        return { name: "checkmark-circle", color: "#22c55e" };
      case "warning":
      case "confirm":
        return { name: "warning", color: "#f59e0b" };
      default:
        return { name: "information-circle", color: "#fbbf24" };
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsLoading(true);
      try {
        await onConfirm();
        hideMessage();
      } catch (error) {
        console.error("Confirm action failed:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    hideMessage();
  };

  const icon = getIcon();
  const isConfirmDialog = type === "confirm";

  return (
    <Modal
      isVisible={show}
      animationIn="zoomIn"
      animationOut="zoomOut"
      backdropOpacity={0.6}
      onBackdropPress={isConfirmDialog ? undefined : hideMessage}
      useNativeDriver
    >
      <View className="items-center justify-center">
        <View className="bg-slate-900 w-[85%] rounded-3xl p-6 border border-slate-700">
          <View className="items-center">
            <Ionicons name={icon.name as any} size={64} color={icon.color} />
          </View>
          <Text
            className="text-white text-base font-medium mt-4 text-center"
            style={{ lineHeight: 24 }}
          >
            {message}
          </Text>

          {isConfirmDialog ? (
            <View className="flex-row gap-3 mt-6">
              <TouchableOpacity
                onPress={handleCancel}
                disabled={isLoading}
                className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl py-3"
              >
                <Text className="text-center text-slate-300 font-semibold text-base">
                  {cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirm}
                disabled={isLoading}
                className="flex-1 bg-red-500 rounded-xl py-3 flex-row items-center justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text className="text-center text-white font-bold text-base">
                    {confirmText}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={hideMessage}
              className="mt-6 bg-accent rounded-xl py-3"
            >
              <Text className="text-center text-primary font-bold text-base">
                OK
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default MessageBox;
