import React, { useEffect } from "react";
import { Animated, Dimensions, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  RadialGradient,
  Stop,
} from "react-native-svg";

const { width, height } = Dimensions.get("window");

const AnimatedSplash = ({ onFinish }: { onFinish?: () => void }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      onFinish?.();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-primary items-center justify-center">
      {/* Background gradient effect */}
      {/* <View className="absolute top-0 left-0 right-0 h-1/2 bg-accent/5 blur-3xl" /> */}
      {/* <View className="absolute bottom-0 left-0 right-0 h-1/3 bg-accent/10 blur-3xl" /> */}
      <View className="absolute inset-0 bg-accent/5 blur-3xl" />

      {/* Animated Logo Container */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
      >
        {/* Logo SVG */}
        <View
          style={{
            width: 280,
            height: 280,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Svg width="280" height="280" viewBox="0 0 400 400">
            {/* Background Circle */}
            <Circle
              cx="200"
              cy="200"
              r="180"
              fill="url(#gradient1)"
              opacity="0.1"
            />

            {/* Outer Ring */}
            <Circle
              cx="200"
              cy="200"
              r="160"
              stroke="url(#gradient2)"
              strokeWidth="2"
              fill="none"
              opacity="0.3"
            />

            {/* Car Icon */}
            <Path
              d="M 140 180 L 150 160 L 180 155 L 220 155 L 250 160 L 260 180 L 260 210 L 140 210 Z"
              fill="url(#gradient3)"
              stroke="#fbbf24"
              strokeWidth="2"
            />

            {/* Windshield Left */}
            <Path
              d="M 155 160 L 170 158 L 190 158 L 190 180 L 155 180 Z"
              fill="rgba(251, 191, 36, 0.3)"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />

            {/* Windshield Right */}
            <Path
              d="M 210 158 L 230 158 L 245 160 L 245 180 L 210 180 Z"
              fill="rgba(251, 191, 36, 0.3)"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />

            {/* Left Wheel */}
            <Circle
              cx="160"
              cy="210"
              r="12"
              fill="#0f172a"
              stroke="#fbbf24"
              strokeWidth="3"
            />
            <Circle cx="160" cy="210" r="6" fill="url(#gradient4)" />

            {/* Right Wheel */}
            <Circle
              cx="240"
              cy="210"
              r="12"
              fill="#0f172a"
              stroke="#fbbf24"
              strokeWidth="3"
            />
            <Circle cx="240" cy="210" r="6" fill="url(#gradient4)" />

            {/* Headlight */}
            <Circle cx="258" cy="195" r="4" fill="#fbbf24" opacity="0.8" />

            {/* Details */}
            <Line
              x1="190"
              y1="180"
              x2="190"
              y2="200"
              stroke="#fbbf24"
              strokeWidth="1"
              opacity="0.5"
            />
            <Line
              x1="210"
              y1="180"
              x2="210"
              y2="200"
              stroke="#fbbf24"
              strokeWidth="1"
              opacity="0.5"
            />

            {/* Gradients */}
            <Defs>
              <LinearGradient id="gradient1" x1="0" y1="0" x2="400" y2="400">
                <Stop offset="0" stopColor="#fbbf24" stopOpacity="1" />
                <Stop offset="1" stopColor="#d97706" stopOpacity="1" />
              </LinearGradient>

              <LinearGradient id="gradient2" x1="0" y1="0" x2="400" y2="400">
                <Stop offset="0" stopColor="#fbbf24" />
                <Stop offset="0.5" stopColor="#f59e0b" />
                <Stop offset="1" stopColor="#d97706" />
              </LinearGradient>

              <LinearGradient id="gradient3" x1="0" y1="0" x2="400" y2="400">
                <Stop offset="0" stopColor="#1e293b" />
                <Stop offset="1" stopColor="#0f172a" />
              </LinearGradient>

              <RadialGradient id="gradient4" cx="50%" cy="50%">
                <Stop offset="0" stopColor="#fbbf24" />
                <Stop offset="1" stopColor="#d97706" />
              </RadialGradient>
            </Defs>
          </Svg>
        </View>
      </Animated.View>

      {/* Animated Text */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text
          className="font-orbitron text-5xl text-center mt-4 mb-2"
          style={{ color: "#fbbf24" }}
        >
          ELITE
        </Text>
        <Text className="font-orbitron-regular text-xl text-slate-400 text-center tracking-widest">
          AUTO
        </Text>
        <Text className="font-inter text-sm text-slate-500 text-center mt-4">
          Premium Collection
        </Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View
        className="absolute bottom-20"
        style={{ opacity: fadeAnim }}
      >
        <View className="flex-row gap-2">
          <View className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <View
            className="w-2 h-2 bg-accent rounded-full animate-pulse"
            style={{ animationDelay: "200ms" }}
          />
          <View
            className="w-2 h-2 bg-accent rounded-full animate-pulse"
            style={{ animationDelay: "400ms" }}
          />
        </View>
      </Animated.View>
    </View>
  );
};

export default AnimatedSplash;
