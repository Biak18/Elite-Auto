import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";

const Custombutton = ({
  title,
  handlePress,
  containerStyles,
  textStyles,
  isLoading,
}: {
  title: string;
  handlePress: (e: any) => void;
  containerStyles?: any;
  textStyles?: any;
  isLoading?: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-accent rounded-xl min-h-[62px] justify-center items-center ${containerStyles} 
      ${isLoading ? "opacity-50" : ""}`}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator color="#fff" size="large" />
      ) : (
        <Text
          className={`text-lg font-inter-semibold ${textStyles ? textStyles : "text-primary "}`}
        >
          {title}
        </Text>
      )}

      {/* {title.startsWith("Sign") && (
        <Ionicons name="right" size={20} />
      )} */}
    </TouchableOpacity>
  );
};

export default Custombutton;
