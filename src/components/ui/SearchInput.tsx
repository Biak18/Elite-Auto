import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TextInput, TouchableOpacity, View } from "react-native";

interface Props {
  placeholder: string;
  value?: string;
  onChangeText?: (text: string) => void;
}

const SearchInput = ({ placeholder, value, onChangeText }: Props) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View
      className={`flex-row items-center h-12 bg-slate-800/50 rounded-xl px-4 border ${
        isFocused ? "border-accent/50" : "border-slate-700/30"
      }`}
    >
      <Ionicons
        name="search-outline"
        size={20}
        color={isFocused ? "#fbbf24" : "#64748b"}
      />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="flex-1 ml-3 text-white text-base"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />

      {value && value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText?.("")}
          className="w-6 h-6 bg-slate-700 rounded-full items-center justify-center"
        >
          <Ionicons name="close" size={14} color="#94a3b8" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchInput;
