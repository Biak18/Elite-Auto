export type UserRole = "buyer" | "seller" | "admin";

export interface Profile {
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
}

export type CarStatus = "pending" | "approved" | "rejected";

interface Car {
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
}

// export type AppointmentStatus =
//   | "pending"
//   | "confirmed"
//   | "completed"
//   | "cancelled";

// export interface Appointment {
//   id: string;
//   user_id: string; // auth.users.id
//   car_id: string; // cars.id
//   appointment_date: string; // YYYY-MM-DD
//   appointment_time: string; // HH:mm:ss
//   status: AppointmentStatus;
//   notes: string | null;
// }

export interface Favorite {
  id: string;
  user_id: string;
  car_id: string;
}

export interface SellerProfile {
  id: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  avatarSignedUrl?: string | null;
}

export interface CarImage {
  id: string;
  car_id: string; // cars.id
  image_url: string;
  is_primary: boolean;
}

export interface CarWithImages extends Car {
  car_images: CarImage[];
}

export interface SelectedImage {
  uri: string;
  base64: string;
  mimeType: string;
  isPrimary: boolean;
  isExisting?: boolean;
}

export interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  user_id: string;
  seller_id: string;
  created_at: string;
  cars: {
    id: string;
    name: string;
    brand: string;
    image_url: string;
  };
}

export interface AppointmentDetail {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  notes: string | null;
  created_at: string;
  car: {
    id: string;
    name: string;
    brand: string;
    image_url: string;
    price: number;
  };
  buyer: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
    avatar_url: string | null;
  };
  seller: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
}
