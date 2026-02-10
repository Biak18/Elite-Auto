import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";
import { View } from "react-native-animatable";

const DropdownPicker = ({
  title,
  value,
  placeholder,
  options,
  iconName,
  showPicker,
  onToggle,
  onSelect,
}: {
  title: string;
  value: string;
  placeholder: string;
  options: string[];
  iconName: keyof typeof Ionicons.glyphMap;
  showPicker: boolean;
  onToggle: () => void;
  onSelect: (value: string) => void;
}) => (
  <View>
    <Text className="text-base text-gray-300 font-medium mb-2">{title}</Text>
    <TouchableOpacity
      onPress={onToggle}
      className="w-full h-16 px-4 bg-slate-900/60 rounded-2xl flex-row items-center border border-slate-600"
      activeOpacity={0.7}
    >
      <Ionicons name={iconName} size={20} color="#64748b" className="mr-4" />
      <Text
        className={`flex-1 text-base ${value ? "text-white" : "text-slate-500"}`}
      >
        {value || placeholder}
      </Text>
      <Ionicons
        name={showPicker ? "chevron-up" : "chevron-down"}
        size={20}
        color="#64748b"
      />
    </TouchableOpacity>

    {showPicker && (
      <View className="mt-2 bg-secondary rounded-2xl border border-slate-700 overflow-hidden">
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            className={`px-4 py-3 flex-row items-center ${value === option ? "bg-accent/10" : ""}`}
          >
            <Ionicons
              name={value === option ? "checkmark-circle" : "radio-button-off"}
              size={20}
              color={value === option ? "#fbbf24" : "#64748b"}
              className="mr-4"
            />
            <Text
              className={`text-base ${value === option ? "text-accent" : "text-slate-300"}`}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}
  </View>
);

export default DropdownPicker;
