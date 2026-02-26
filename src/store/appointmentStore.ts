// src/store/appointmentStore.ts
import { RealtimeChannel } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { appointmentService } from "../services/appointmentService";
import { Appointment, AppointmentDetail } from "../types/interfaces";

interface AppointmentState {
  appointments: Appointment[];
  appointmentDetails: AppointmentDetail | null;
  profiles: Map<string, any>;
  isLoading: boolean;

  realtimeChannel: RealtimeChannel | null;

  fetchAppointments: (isSeller: boolean, user_id: string) => Promise<void>;
  fetchAppointmentDetails: (id: string) => Promise<void>;

  updateAppointmentStatus: (
    id: string,
    newStatus: Appointment["status"],
  ) => void;

  subscribeToAppointments: (isSeller: boolean, userId: string) => void;
  unsubscribeFromAppointments: () => void;
}

export const useAppointmentStore = create<AppointmentState>((set, get) => ({
  appointments: [],
  appointmentDetails: null,
  profiles: new Map(),
  isLoading: false,
  realtimeChannel: null,

  fetchAppointments: async (isSeller: boolean, user_id: string) => {
    set({ isLoading: true });

    try {
      const { appointmentsData, profiles } = await appointmentService
        .getAppointmentsData(isSeller, user_id);

      set({
        appointments: appointmentsData,
        profiles,
      });
    } catch (error) {
      console.error("Fetch appointments error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchAppointmentDetails: async (id: string) => {
    set({ isLoading: true });
    try {
      const appointmentDetailsData = await appointmentService
        .getAppointmentDetail(id);

      set({
        appointmentDetails: appointmentDetailsData,
      });
    } catch (error) {
      console.error("Fetch appointment details error:", error);
    } finally {
      set({ isLoading: false });
    }
  },

  updateAppointmentStatus: (id, newStatus) => {
    set((state) => ({
      appointmentDetails: state.appointmentDetails?.id === id
        ? { ...state.appointmentDetails, status: newStatus }
        : state.appointmentDetails,

      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status: newStatus } : a
      ),
    }));
  },

  subscribeToAppointments: (isSeller: boolean, userId: string) => {
    get().unsubscribeFromAppointments();

    const channel = supabase
      .channel("appointments-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: isSeller ? `seller_id=eq.${userId}` : `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("📡 Appointment changed:", payload);
          get().fetchAppointments(isSeller, userId);
        },
      )
      .subscribe();

    set({ realtimeChannel: channel });
  },

  unsubscribeFromAppointments: () => {
    const channel = get().realtimeChannel;
    if (channel) {
      supabase.removeChannel(channel);
      set({ realtimeChannel: null });
    }
  },
}));
