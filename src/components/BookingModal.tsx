// src/components/BookingModal.tsx
import { supabase } from "@/src/lib/supabase";
import { useAuthStore } from "@/src/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import React, { useState } from "react";
import {
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { showMessage } from "../lib/utils/dialog";
import { formatTime } from "../lib/utils/formatters";
import { notifications } from "../lib/utils/notifications";
import { useAppointmentStore } from "../store/appointmentStore";

interface BookingModalProps {
  visible: boolean;
  onClose: () => void;
  carId: string;
  carName: string;
  sellerId: string;
  onSuccess: () => void;
}

export default function BookingModal({
  visible,
  onClose,
  carId,
  carName,
  sellerId,
  onSuccess,
}: BookingModalProps) {
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedTime, setSelectedTime] = useState("10:00");
  const [notes, setNotes] = useState("");
  const { fetchAppointments, appointments } = useAppointmentStore();

  const timeSlots = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
  ];

  // const formatTimeDisplay = (time: string) => {
  //   const hour = parseInt(time.split(":")[0]);
  //   const isPM = hour >= 12;
  //   const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  //   return `${displayHour}:${time.split(":")[1]} ${isPM ? "PM" : "AM"}`;
  // };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert({
          user_id: user.id,
          car_id: carId,
          seller_id: sellerId,
          appointment_date: selectedDate.toISOString().split("T")[0],
          appointment_time: selectedTime,
          notes: notes.trim() || null,
          status: "pending",
        })
        .select()
        .single();

      if (error) throw error;
      await fetchAppointments(false, user.id);

      try {
        const { profile } = useAuthStore.getState();
        await notifications.newBookingRequest(
          sellerId,
          profile?.full_name || "A buyer",
          carName,
          data.id,
        );
      } catch (notifError) {
        showMessage("Failed to send notification:" + notifError, "error");
      }

      showMessage(
        "Booking Sent! \n Your test drive request has been sent. The seller will contact you soon.",
        "success",
        {
          onClose: () => {
            onSuccess();
          },
        },
      );

      onClose();
    } catch (error: any) {
      showMessage(error.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-black/60 justify-end">
        <View className="bg-secondary rounded-t-3xl max-h-[85%]">
          <View className="flex-row justify-between items-center p-6 border-b border-slate-700/50">
            <Text className="text-xl font-orbitron text-accent">
              Book Test Drive
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#fbbf24" />
            </TouchableOpacity>
          </View>

          <ScrollView
            className="px-6 py-4"
            showsVerticalScrollIndicator={false}
          >
            <View className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 mb-6">
              <Text className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                Test Drive For
              </Text>
              <Text className="text-white text-lg font-semibold">
                {carName}
              </Text>
            </View>

            <View className="mb-6">
              <Text className="text-slate-400 text-xs uppercase tracking-wider mb-3">
                Preferred Date
              </Text>
              <TouchableOpacity
                disabled={isSubmitting}
                onPress={() => setShowDatePicker(true)}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 flex-row items-center justify-between"
              >
                <View className="flex-row items-center">
                  <Ionicons name="calendar-outline" size={20} color="#fbbf24" />
                  <Text className="text-white ml-3">
                    {selectedDate.toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
                <Ionicons name="chevron-down" size={20} color="#64748b" />
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={selectedDate}
                  mode="date"
                  minimumDate={new Date()}
                  onChange={(event, date) => {
                    setShowDatePicker(Platform.OS === "ios");
                    if (date) setSelectedDate(date);
                  }}
                />
              )}
            </View>

            <View className="mb-6">
              <Text className="text-slate-400 text-xs uppercase tracking-wider mb-3">
                Preferred Time
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {timeSlots.map((time) => (
                  <TouchableOpacity
                    disabled={isSubmitting}
                    key={time}
                    onPress={() => setSelectedTime(time)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedTime === time
                        ? "bg-accent border-accent"
                        : "bg-slate-800/50 border-slate-700/30"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selectedTime === time
                          ? "text-primary"
                          : "text-slate-300"
                      }`}
                    >
                      {formatTime(time)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-slate-400 text-xs uppercase tracking-wider mb-3">
                Notes (Optional)
              </Text>
              <TextInput
                readOnly={isSubmitting}
                value={notes}
                onChangeText={setNotes}
                placeholder="Any specific requests or questions?"
                placeholderTextColor="#64748b"
                multiline
                numberOfLines={4}
                className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/30 text-white text-base"
                style={{ minHeight: 100, textAlignVertical: "top" }}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              className="bg-accent rounded-xl py-4 flex-row items-center justify-center mb-4"
            >
              <Ionicons name="checkmark-circle" size={20} color="#020617" />
              <Text className="text-primary font-bold text-base ml-2">
                {isSubmitting ? "Sending..." : "Send Booking Request"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
