import { TAB_BAR_HEIGHT } from "@/src/constants/layout";
import { supabase } from "@/src/lib/supabase";
import { showMessage } from "@/src/lib/utils/dialog";
import { formatTime } from "@/src/lib/utils/formatters";
import { notifications } from "@/src/lib/utils/notifications";
import { useAppointmentStore } from "@/src/store/appointmentStore";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppointmentsScreen() {
  const { user, profile } = useAuthStore();
  const { appointments, profiles, isLoading, fetchAppointments } =
    useAppointmentStore();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");

  const isSeller = profile?.role === "seller";

  useEffect(() => {
    if (user && profile) {
      fetchAppointments(isSeller, user.id);
    }
  }, [user, profile]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return {
          bg: "bg-green-500/20",
          border: "border-green-500/30",
          text: "text-green-400",
        };
      case "pending":
        return {
          bg: "bg-yellow-500/20",
          border: "border-yellow-500/30",
          text: "text-yellow-400",
        };
      case "cancelled":
        return {
          bg: "bg-red-500/20",
          border: "border-red-500/30",
          text: "text-red-400",
        };
      case "completed":
        return {
          bg: "bg-blue-500/20",
          border: "border-blue-500/30",
          text: "text-blue-400",
        };
      default:
        return {
          bg: "bg-slate-700/20",
          border: "border-slate-700/30",
          text: "text-slate-400",
        };
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "pending" || a.status === "confirmed",
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === "cancelled" || a.status === "completed",
  );

  const displayedAppointments =
    activeTab === "upcoming" ? upcomingAppointments : pastAppointments;

  const updateAppointmentStatus = async (
    appointmentId: string,
    newStatus: "confirmed" | "cancelled" | "completed",
  ) => {
    try {
      const appointment = appointments.find((a) => a.id === appointmentId);
      if (!appointment) return;

      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", appointmentId);

      if (error) throw error;

      try {
        if (newStatus === "confirmed") {
          await notifications.appointmentConfirmed(
            appointment.user_id,
            appointment.cars.name,
            appointmentId,
          );
        } else if (newStatus === "cancelled") {
          const recipientId = isSeller
            ? appointment.user_id
            : appointment.seller_id;
          await notifications.appointmentCancelled(
            recipientId,
            appointment.cars.name,
          );
        } else if (newStatus === "completed") {
          await notifications.appointmentCompleted(
            appointment.user_id,
            appointment.cars.name,
          );
        }
      } catch (notifError) {
        console.error("Failed to send notification:", notifError);
      }

      showMessage(`Booking ${newStatus} successfully`, "success");

      if (user && profile) {
        fetchAppointments(isSeller, user.id);
      }
    } catch (error: any) {
      showMessage(error.message, "error");
    }
  };

  const AppointmentCard = ({ item }: { item: any }) => {
    const statusStyle = getStatusColor(item.status);
    const contactPerson = isSeller
      ? profiles.get(item.user_id)
      : profiles.get(item.seller_id);

    return (
      <View className="bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/30 mb-3">
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/appointment/[id]",
              params: { id: item.id },
            })
          }
          className="flex-row"
        >
          <Image
            source={{ uri: item.cars.image_url }}
            className="w-28 h-full"
            resizeMode="cover"
          />

          <View className="flex-1 p-4">
            <View className="flex-row justify-between items-start mb-2">
              <View className="flex-1">
                <Text className="text-slate-400 text-xs uppercase tracking-wider">
                  {item.cars.brand}
                </Text>
                <Text
                  className="text-white text-base font-semibold mt-0.5"
                  numberOfLines={1}
                >
                  {item.cars.name}
                </Text>
              </View>

              <View
                className={`${statusStyle.bg} border ${statusStyle.border} px-3 py-1 rounded-full ml-2`}
              >
                <Text
                  className={`${statusStyle.text} text-xs font-semibold capitalize`}
                >
                  {item.status}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center mt-2">
              <Ionicons name="calendar-outline" size={14} color="#64748b" />
              <Text className="text-slate-400 text-xs ml-1">
                {new Date(item.appointment_date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </Text>
              <Ionicons
                name="time-outline"
                size={14}
                color="#64748b"
                className="ml-3"
              />
              <Text className="text-slate-400 text-xs ml-1">
                {formatTime(item.appointment_time)}
              </Text>
            </View>

            {contactPerson && (
              <View className="flex-row items-center justify-between mt-2">
                <Text className="text-slate-500 text-xs">
                  {isSeller ? "Buyer" : "Seller"}:{" "}
                  {contactPerson.full_name || "N/A"}
                </Text>
              </View>
            )}

            {item.notes && (
              <View className="mt-2 bg-slate-900/50 rounded-lg p-2">
                <Text className="text-slate-400 text-xs italic">
                  "{item.notes}"
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {item.status === "pending" && (
          <View className="mt-2 px-4 pb-4 flex-row gap-2">
            {isSeller ? (
              <>
                <TouchableOpacity
                  onPress={() => updateAppointmentStatus(item.id, "confirmed")}
                  className="flex-1 bg-green-500/20 border border-green-500/30 rounded-xl py-2 flex-row items-center justify-center"
                >
                  <Ionicons name="checkmark-circle" size={16} color="#4ade80" />
                  <Text className="text-green-400 font-semibold ml-1 text-sm">
                    Confirm
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => updateAppointmentStatus(item.id, "cancelled")}
                  className="flex-1 bg-red-500/20 border border-red-500/30 rounded-xl py-2 flex-row items-center justify-center"
                >
                  <Ionicons name="close-circle" size={16} color="#f87171" />
                  <Text className="text-red-400 font-semibold ml-1 text-sm">
                    Decline
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity
                onPress={() => updateAppointmentStatus(item.id, "cancelled")}
                className="flex-1 bg-red-500/20 border border-red-500/30 rounded-xl py-2 flex-row items-center justify-center"
              >
                <Ionicons name="close-circle" size={16} color="#f87171" />
                <Text className="text-red-400 font-semibold ml-1 text-sm">
                  Cancel Booking
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {item.status === "confirmed" && isSeller && (
          <View className="mt-2 px-4 pb-4">
            <TouchableOpacity
              onPress={() => updateAppointmentStatus(item.id, "completed")}
              className="bg-blue-500/20 border border-blue-500/30 rounded-xl py-2 flex-row items-center justify-center"
            >
              <Ionicons name="checkmark-done" size={16} color="#60a5fa" />
              <Text className="text-blue-400 font-semibold ml-1 text-sm">
                Mark as Completed
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="px-6 pt-4 pb-2">
        <Text className="font-orbitron text-3xl text-accent mb-1">
          Bookings
        </Text>
        <Text className="text-slate-400 text-sm">
          {isSeller
            ? "Manage test drive requests"
            : "Your test drive appointments"}
        </Text>
      </View>

      <View className="flex-row px-6 mt-4 gap-2">
        <TouchableOpacity
          onPress={() => setActiveTab("upcoming")}
          className={`flex-1 py-3 rounded-xl border ${
            activeTab === "upcoming"
              ? "bg-accent border-accent"
              : "bg-slate-800/50 border-slate-700/30"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "upcoming" ? "text-primary" : "text-slate-300"
            }`}
          >
            Upcoming ({upcomingAppointments.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab("past")}
          className={`flex-1 py-3 rounded-xl border ${
            activeTab === "past"
              ? "bg-accent border-accent"
              : "bg-slate-800/50 border-slate-700/30"
          }`}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "past" ? "text-primary" : "text-slate-300"
            }`}
          >
            Past ({pastAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayedAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <AppointmentCard item={item} />}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: TAB_BAR_HEIGHT,
        }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={() =>
              user && profile && fetchAppointments(isSeller, user.id)
            }
            tintColor="#fbbf24"
          />
        }
        ListEmptyComponent={
          <View className="items-center mt-20 px-8">
            <View className="w-24 h-24 bg-slate-800/50 rounded-full items-center justify-center border border-slate-700/30">
              <Ionicons name="calendar-outline" size={48} color="#475569" />
            </View>
            <Text className="font-orbitron text-lg text-slate-300 mt-6">
              No {activeTab} bookings
            </Text>
            <Text className="text-slate-500 text-sm mt-2 text-center">
              {activeTab === "upcoming"
                ? "Book a test drive to get started"
                : "Your past bookings will appear here"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
