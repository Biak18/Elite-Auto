import AnimatedSplash from "@/src/components/splashscreen/SplashScreen";
import { useAuthStore } from "@/src/store/authStore";
import MessageBox from "@/src/widgets/MessageBox";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import {
  Orbitron_400Regular,
  Orbitron_700Bold,
  Orbitron_900Black,
  useFonts,
} from "@expo-google-fonts/orbitron";
import { EventSubscription } from "expo-modules-core";
import * as Notifications from "expo-notifications";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useRef, useState } from "react";
import { StatusBar } from "react-native";
import "./global.css";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [notification, setNotification] =
    useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<EventSubscription | null>(null);
  const responseListener = useRef<EventSubscription | null>(null);

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📩 Notification received:", notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;

        console.log("👆 Notification tapped:", data);

        setTimeout(() => {
          if (
            data.type === "appointment_confirmed" ||
            data.type === "new_booking"
          ) {
            router.push(`/appointment/${data.appointmentId}`);
          } else if (
            data.type === "appointment_cancelled" ||
            data.type === "appointment_completed"
          ) {
            router.push("/(tabs)/appointments");
          } else if (data.type === "car_approved") {
            router.push(`/car/${data.carId}`);
          } else if (data.type === "car_rejected") {
            router.push("/(tabs)/seller");
          }
        }, 100);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const [showSplash, setShowSplash] = useState(true);
  const hasNavigated = useRef(false);

  const segments = useSegments();
  const router = useRouter();
  const { initialize, isAuthenticated, isLoading, profile } = useAuthStore();

  const [fontsLoaded] = useFonts({
    Orbitron_400Regular,
    Orbitron_700Bold,
    Orbitron_900Black,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  useEffect(() => {
    if (showSplash || isLoading || !fontsLoaded) return;

    if (hasNavigated.current) return;

    hasNavigated.current = true;

    if (!isAuthenticated) {
      router.replace("/(auth)/sign-in");
    } else if (!profile?.profile_completed) {
      router.replace("/complete-profile");
    } else {
      router.replace("/(tabs)");
    }
  }, [
    showSplash,
    isLoading,
    fontsLoaded,
    isAuthenticated,
    profile?.profile_completed,
  ]);

  useEffect(() => {
    if (!hasNavigated.current || isLoading) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inCompleteProfile = segments[0] === "complete-profile";
    if (!isAuthenticated && !inAuthGroup) {
      router.replace("/(auth)/sign-in");
    } else if (isAuthenticated) {
      if (!profile?.profile_completed && !inCompleteProfile) {
        router.replace("/complete-profile");
      } else if (profile?.profile_completed && inAuthGroup) {
        router.replace("/(tabs)");
      }
    }
  }, [isAuthenticated, profile?.profile_completed, segments, isLoading]);

  if (!fontsLoaded) {
    return null;
  }

  if (showSplash) {
    return <AnimatedSplash onFinish={handleSplashFinish} />;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
        }}
      >
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="complete-profile" />
      </Stack>
      <StatusBar backgroundColor="#020617" barStyle="light-content" />
      <MessageBox />
    </>
  );
}
