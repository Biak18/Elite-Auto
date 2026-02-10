import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";

import { TextInputProps } from "react-native";

type FormFieldProps = TextInputProps & {
  title: string;
  value: string;
  placeholder: string;
  handleChangeText?: (text: string) => void;
  otherStyles?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
};

const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  iconName, // Add icon prop
  ...props
}: FormFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setshowPassword] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-base text-gray-300 font-inter-medium">{title}</Text>

      <View
        className={`border w-full h-16 px-4 bg-slate-900/60 rounded-2xl flex-row items-center mt-2 ${
          isFocused ? "border-accent" : "border-slate-700/50"
        }`}
        style={{
          borderWidth: isFocused ? 2 : 1,
          borderColor: isFocused ? "#fbbf24" : "#475569",
        }}
      >
        {iconName && (
          <Ionicons
            name={iconName}
            size={20}
            color={isFocused ? "#fbbf24" : "#64748b"}
            style={{ marginRight: 12 }}
          />
        )}
        <TextInput
          className="flex-1 text-white text-base font-inter"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#64748b"
          onChangeText={handleChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={title === "Password" && !showPassword}
          {...props}
        />

        {title === "Password" && (
          <TouchableOpacity onPress={() => setshowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-outline" : "eye-off-outline"}
              size={20}
              color={isFocused ? "#fbbf24" : "#64748b"}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default FormField;
