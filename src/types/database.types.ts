export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type CarStatus = "pending" | "approved" | "rejected";
export type UserRole = "buyer" | "seller" | "admin";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          phone: string | null;
          avatarSignedUrl?: string | null;
          address: string | null;
          city: string | null;
          bio: string | null;
          date_of_birth: string | null;
          gender: string | null;
          role: UserRole;
          profile_completed: boolean | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
          address: string | null;
          city: string | null;
          bio: string | null;
          date_of_birth: string | null;
          gender: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          phone?: string | null;
          created_at?: string;
          updated_at?: string;
          address: string | null;
          city: string | null;
          bio: string | null;
          date_of_birth: string | null;
          gender: string | null;
        };
      };
      cars: {
        Row: {
          id: string;
          name: string;
          brand: string;
          model: string;
          year: number;
          price: number;
          image_url: string;
          description: string;
          horsepower: string;
          acceleration: string;
          type: string;
          fuel_type: string;
          transmission: string;
          seats: number;
          featured: boolean;
          available: boolean;
          owner_id: string; // profiles.id
          status: CarStatus;
        };
        Insert: {
          id?: string;
          name: string;
          brand: string;
          model: string;
          year: number;
          price: number;
          image_url?: string | null;
          description?: string | null;
          horsepower?: string | null;
          acceleration?: string | null;
          type?: string | null;
          fuel_type?: string | null;
          transmission?: string | null;
          seats?: number | null;
          featured?: boolean;
          available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          brand?: string;
          model?: string;
          year?: number;
          price?: number;
          image_url?: string | null;
          description?: string | null;
          horsepower?: string | null;
          acceleration?: string | null;
          type?: string | null;
          fuel_type?: string | null;
          transmission?: string | null;
          seats?: number | null;
          featured?: boolean;
          available?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          car_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          car_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          car_id?: string;
          created_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          user_id: string;
          car_id: string;
          appointment_date: string;
          appointment_time: string;
          status: "pending" | "confirmed" | "completed" | "cancelled";
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          car_id: string;
          appointment_date: string;
          appointment_time: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          car_id?: string;
          appointment_date?: string;
          appointment_time?: string;
          status?: "pending" | "confirmed" | "completed" | "cancelled";
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
