// src/store/appointmentStore.ts
import { create } from "zustand";
import { appointmentService } from "../services/appointmentService";
import { Appointment, AppointmentDetail } from "../types/interfaces";

interface AppointmentState {
  appointments: Appointment[];
  appointmentDetails: AppointmentDetail | null;
  profiles: Map<string, any>;
  isLoading: boolean;

  fetchAppointments: (isSeller: boolean, user_id: string) => Promise<void>;
  fetchAppointmentDetails: (id: string) => Promise<void>;

  updateAppointmentStatus: (
    id: string,
    newStatus: Appointment["status"],
  ) => void;
}

export const useAppointmentStore = create<AppointmentState>((set) => ({
  appointments: [],
  appointmentDetails: null,
  profiles: new Map(),
  isLoading: false,

  fetchAppointments: async (isSeller: boolean, user_id: string) => {
    set({ isLoading: true });

    try {
      const { appointmentsData, profiles } =
        await appointmentService.getAppointmentsData(isSeller, user_id);

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
      const appointmentDetailsData =
        await appointmentService.getAppointmentDetail(id);

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
      appointmentDetails:
        state.appointmentDetails?.id === id
          ? { ...state.appointmentDetails, status: newStatus }
          : state.appointmentDetails,

      appointments: state.appointments.map((a) =>
        a.id === id ? { ...a, status: newStatus } : a,
      ),
    }));
  },
}));
