// app/appointment/[id].tsx
import { supabase } from "@/src/lib/supabase";
import { showMessage } from "@/src/lib/utils/dialog";
import { formatPrice, formatTime } from "@/src/lib/utils/formatters";
import { notifications } from "@/src/lib/utils/notifications";
import { useAppointmentStore } from "@/src/store/appointmentStore";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  Image,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AppointmentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { profile } = useAuthStore();
  const {
    isLoading,
    appointmentDetails: appointment,
    fetchAppointmentDetails,
    fetchAppointments,
    updateAppointmentStatus,
  } = useAppointmentStore();

  const isSeller = profile?.role === "seller";

  useEffect(() => {
    fetchAppointmentDetails(id);
  }, [id]);

  const updateStatus = async (
    newStatus: "confirmed" | "cancelled" | "completed",
  ) => {
    try {
      const { error } = await supabase
        .from("appointments")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;

      try {
        if (!appointment) return;
        if (newStatus === "confirmed") {
          await notifications.appointmentConfirmed(
            appointment.buyer.id,
            appointment.car.name,
            id,
          );
        } else if (newStatus === "cancelled") {
          const recipientId = isSeller
            ? appointment.buyer.id
            : appointment.seller.id;
          await notifications.appointmentCancelled(
            recipientId,
            appointment.car.name,
          );
        } else if (newStatus === "completed") {
          await notifications.appointmentCompleted(
            appointment.buyer.id,
            appointment.car.name,
          );
        }
      } catch (notifError) {
        showMessage("Notification failed:" + notifError, "error");
      }

      updateAppointmentStatus(id, newStatus);
      showMessage(`Appointment ${newStatus} successfully`, "success");
      fetchAppointmentDetails(id); // Refresh detail
      if (user) fetchAppointments(isSeller, user.id); // Refresh the appointment page
    } catch (error: any) {
      showMessage(error.message, "error");
    }
  };

  const handleCall = async (phone: string | null) => {
    if (!phone) {
      showMessage("This user hasn't added a phone number", "warning");
      return;
    }
    const url = `tel:${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

  const handleMessage = async (phone: string | null) => {
    if (!phone) {
      showMessage("This user hasn't added a phone number", "warning");
      return;
    }
    const url = `sms:${phone}`;
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  };

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

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#fbbf24" />
        </View>
      </SafeAreaView>
    );
  }

  if (!appointment) {
    return (
      <SafeAreaView className="flex-1 bg-primary">
        <View className="flex-1 justify-center items-center">
          <Ionicons name="calendar-outline" size={64} color="#475569" />
          <Text className="text-slate-400 mt-4">Appointment not found</Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 bg-accent px-6 py-3 rounded-xl"
          >
            <Text className="text-primary font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(appointment.status);
  const contactPerson = isSeller ? appointment.buyer : appointment.seller;

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <View className="flex-row justify-between items-center px-6 py-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fbbf24" />
        </TouchableOpacity>
        <Text className="text-xl font-orbitron text-accent">
          Appointment Details
        </Text>
        <View className="w-6" />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-6 mb-4">
          <View
            className={`${statusStyle.bg} border ${statusStyle.border} px-4 py-2 rounded-xl self-start`}
          >
            <Text className={`${statusStyle.text} font-semibold capitalize`}>
              {appointment.status}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/car/${appointment.car.id}`)}
          className="mx-6 bg-slate-800/50 rounded-2xl overflow-hidden border border-slate-700/30 mb-6"
        >
          <View className="flex-row">
            <Image
              source={{ uri: appointment.car.image_url }}
              className="w-32 h-32"
              resizeMode="cover"
            />
            <View className="flex-1 p-4 justify-center">
              <Text className="text-slate-400 text-xs uppercase tracking-wider">
                {appointment.car.brand}
              </Text>
              <Text className="text-white text-lg font-semibold mt-1">
                {appointment.car.name}
              </Text>
              <Text className="text-accent text-base font-bold mt-2">
                {formatPrice(appointment.car.price)}
              </Text>
            </View>
            <View className="justify-center pr-4">
              <Ionicons name="chevron-forward" size={24} color="#64748b" />
            </View>
          </View>
        </TouchableOpacity>

        <View className="px-6 mb-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Appointment Time
          </Text>
          <View className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar" size={20} color="#fbbf24" />
              <Text className="text-white text-base ml-3">
                {new Date(appointment.appointment_date).toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  },
                )}
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="time" size={20} color="#fbbf24" />
              <Text className="text-white text-base ml-3">
                {formatTime(appointment.appointment_time)}
              </Text>
            </View>
          </View>
        </View>

        {appointment.notes && (
          <View className="px-6 mb-6">
            <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Notes
            </Text>
            <View className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30">
              <Text className="text-slate-300 text-base">
                {appointment.notes}
              </Text>
            </View>
          </View>
        )}

        <View className="px-6 mb-6">
          <Text className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
            {isSeller ? "Buyer Information" : "Seller Information"}
          </Text>
          <View className="bg-slate-800/50 rounded-xl p-5 border border-slate-700/30">
            {/* Avatar & Name */}
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-accent/10 rounded-full items-center justify-center overflow-hidden border border-accent/30">
                {isSeller && appointment.buyer.avatar_url ? (
                  <Image
                    source={{ uri: appointment.buyer.avatar_url }}
                    className="w-16 h-16"
                    resizeMode="cover"
                  />
                ) : (
                  <Ionicons name="person" size={32} color="#fbbf24" />
                )}
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-white text-lg font-semibold">
                  {contactPerson.full_name}
                </Text>
                <Text className="text-slate-400 text-sm">
                  {contactPerson.email}
                </Text>
              </View>
            </View>

            {contactPerson.phone && (
              <View className="flex-row items-center py-3 border-t border-slate-700/30">
                <Ionicons name="call" size={18} color="#64748b" />
                <Text className="text-slate-300 ml-3 flex-1">
                  {contactPerson.phone}
                </Text>
              </View>
            )}

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => handleCall(contactPerson.phone)}
                className="flex-1 bg-accent/10 border border-accent/30 rounded-xl py-3 flex-row items-center justify-center"
              >
                <Ionicons name="call" size={20} color="#fbbf24" />
                <Text className="text-accent font-semibold ml-2">Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleMessage(contactPerson.phone)}
                className="flex-1 bg-accent/10 border border-accent/30 rounded-xl py-3 flex-row items-center justify-center"
              >
                <Ionicons name="chatbubble" size={20} color="#fbbf24" />
                <Text className="text-accent font-semibold ml-2">Message</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {appointment.status === "pending" && (
          <View className="px-6 mb-8">
            {isSeller ? (
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => updateStatus("confirmed")}
                  className="flex-1 bg-green-500/20 border border-green-500/30 rounded-xl py-4 flex-row items-center justify-center"
                >
                  <Ionicons name="checkmark-circle" size={20} color="#4ade80" />
                  <Text className="text-green-400 font-bold ml-2">Confirm</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => updateStatus("cancelled")}
                  className="flex-1 bg-red-500/20 border border-red-500/30 rounded-xl py-4 flex-row items-center justify-center"
                >
                  <Ionicons name="close-circle" size={20} color="#f87171" />
                  <Text className="text-red-400 font-bold ml-2">Decline</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => updateStatus("cancelled")}
                className="bg-red-500/20 border border-red-500/30 rounded-xl py-4 flex-row items-center justify-center"
              >
                <Ionicons name="close-circle" size={20} color="#f87171" />
                <Text className="text-red-400 font-bold ml-2">
                  Cancel Booking
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {appointment.status === "confirmed" && isSeller && (
          <View className="px-6 mb-8">
            <TouchableOpacity
              onPress={() => updateStatus("completed")}
              className="bg-blue-500/20 border border-blue-500/30 rounded-xl py-4 flex-row items-center justify-center"
            >
              <Ionicons name="checkmark-done" size={20} color="#60a5fa" />
              <Text className="text-blue-400 font-bold ml-2">
                Mark as Completed
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
