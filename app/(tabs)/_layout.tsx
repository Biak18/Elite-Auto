import { useAppointmentStore } from "@/src/store/appointmentStore";
import { useAuthStore } from "@/src/store/authStore";
import { useFavoriteStore } from "@/src/store/favoriteStore";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React, { useEffect } from "react";
import { Platform, Text, View } from "react-native";

const TabIcon = ({
  name,
  color,
  focused,
  badge,
}: {
  name: keyof typeof Ionicons.glyphMap;
  color: string;
  focused: boolean;
  badge?: number;
}) => {
  return (
    <View className="relative mb-2">
      <View
        className={`w-12 h-12 justify-center items-center rounded-full ${
          focused ? "bg-accent/10" : ""
        }`}
      >
        <Ionicons name={name} size={24} color={color} />
      </View>
      {badge !== undefined && badge > 0 && (
        <View className="absolute -top-1 -right-1 bg-red-500 rounded-2xl min-w-[18px] h-[18px] items-center justify-center px-1">
          <Text className="text-white text-[10px] font-bold">
            {badge > 9 ? "9+" : badge}
          </Text>
        </View>
      )}
    </View>
  );
};

const TabsLayout = () => {
  const { user, profile } = useAuthStore();
  const isSeller = profile?.role === "seller";
  const favoriteCount = useFavoriteStore((state) => state.favoriteIds.size);
  const appointments = useAppointmentStore((state) => state.appointments);

  const appointmentCount = appointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed",
  ).length;

  const fetchAppointments = useAppointmentStore(
    (state) => state.fetchAppointments,
  );

  useEffect(() => {
    if (user && profile) {
      fetchAppointments(isSeller, user.id);
    }
  }, [user, profile]);

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#fbbf24",
        tabBarInactiveTintColor: "#64748b",

        tabBarStyle: {
          backgroundColor: "#0f172a",
          borderTopColor: "#334155",
          // borderTopWidth: 1,
          height: Platform.OS === "ios" ? 88 : 65,
          paddingBottom: Platform.OS === "ios" ? 28 : 10,
          paddingTop: 10,
          position: "absolute",
          borderRadius: 50,
          marginBottom: 20,
          marginLeft: 5,
          marginRight: 5,
        },

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginTop: 4,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "home" : "home-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "search" : "search-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: "Favorites",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "heart" : "heart-outline"}
              color={color}
              focused={focused}
              badge={favoriteCount}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: "Bookings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "calendar" : "calendar-outline"}
              color={color}
              focused={focused}
              badge={appointmentCount}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="seller"
        options={{
          title: "My Cars",
          href: isSeller ? "/seller" : null,
          tabBarIcon: ({ color }) => (
            <Ionicons name="car-sport-outline" size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name={focused ? "person" : "person-outline"}
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
