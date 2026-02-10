import { supabase } from "@/src/lib/supabase";
import { Appointment, AppointmentDetail } from "../types/interfaces";

export const appointmentService = {
  getAppointmentsData: async (isSeller: boolean, user_id: string) => {
    // First, fetch appointments
    let query = supabase
      .from("appointments")
      .select("*, cars (id, name, brand, image_url)")
      .order("appointment_date", { ascending: true });

    if (isSeller) {
      query = query.eq("seller_id", user_id);
    } else {
      query = query.eq("user_id", user_id);
    }

    const { data: appointmentsData, error: appointmentsError } = await query;
    if (appointmentsError) throw appointmentsError;

    let profiles;
    if (appointmentsData && appointmentsData.length > 0) {
      if (isSeller) {
        const buyerIds = [...new Set(appointmentsData.map((a) => a.user_id))];
        const { data: buyers, error: buyersError } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", buyerIds);

        if (!buyersError && buyers) {
          const buyerMap = new Map(buyers.map((b) => [b.id, b]));
          profiles = buyerMap;
        }
      } else {
        const sellerIds = [
          ...new Set(appointmentsData.map((a) => a.seller_id)),
        ];
        const { data: sellers, error: sellersError } = await supabase
          .from("profiles")
          .select("id, full_name, phone")
          .in("id", sellerIds);

        if (!sellersError && sellers) {
          const sellerMap = new Map(sellers.map((s) => [s.id, s]));
          profiles = sellerMap;
        }
      }
    }

    return {
      appointmentsData: appointmentsData as Appointment[],
      profiles: profiles as Map<string, any>,
    };
  },

  getAppointmentDetail: async (id: string) => {
    const { data: apptData, error: apptError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", id)
      .single();

    if (apptError) throw apptError;

    const { data: carData, error: carError } = await supabase
      .from("cars")
      .select("id, name, brand, image_url, price")
      .eq("id", apptData.car_id)
      .single();

    if (carError) throw carError;

    const { data: buyerData, error: buyerError } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone, avatar_url")
      .eq("id", apptData.user_id)
      .single();

    if (buyerError) throw buyerError;

    const { data: sellerData, error: sellerError } = await supabase
      .from("profiles")
      .select("id, full_name, email, phone")
      .eq("id", apptData.seller_id)
      .single();

    if (sellerError) throw sellerError;

    let avatarSignedUrl: string | null = null;
    if (buyerData.avatar_url) {
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(buyerData.avatar_url, 60 * 60);
      avatarSignedUrl = signed?.signedUrl ?? null;
    }

    const appointMentDetail = {
      id: apptData.id,
      appointment_date: apptData.appointment_date,
      appointment_time: apptData.appointment_time,
      status: apptData.status,
      notes: apptData.notes,
      created_at: apptData.created_at,
      car: carData,
      buyer: { ...buyerData, avatar_url: avatarSignedUrl },
      seller: sellerData,
    };
    return appointMentDetail as AppointmentDetail;
  },

  async getCount() {
    const { count, error } = await supabase
      .from("appointments")
      .select("*", { count: "exact", head: true });

    if (error) throw error;
    return count ?? 0;
  },

  async getByUser(userId: string) {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async create(payload: any) {
    const { data, error } = await supabase
      .from("appointments")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
