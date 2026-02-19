import { supabase } from "@/src/lib/supabase";
import { authService } from "@/src/services/authService";
import { Session, User } from "@supabase/supabase-js";
import { router } from "expo-router";
import { create } from "zustand";
import { notificationService } from "../services/notificationService";
import { Profile } from "../types/interfaces";

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;

  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchProfile: (userId: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,

  fetchProfile: async (userId: string) => {
    if (!userId) {
      console.warn("⚠️ Cannot fetch profile: userId is empty");
      set({ profile: null });
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) {
      set({ profile: null });
      return;
    }

    let avatarSignedUrl: string | null = null;

    if (data.avatar_url) {
      const { data: signed } = await supabase.storage
        .from("avatars")
        .createSignedUrl(data.avatar_url, 60 * 60);

      avatarSignedUrl = signed?.signedUrl ?? null;
    }

    set({
      profile: {
        ...data,
        avatarSignedUrl,
      },
    });
  },

  initialize: async () => {
    set({ isLoading: true });

    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) console.log("Initialize error", error);
    const user = session?.user ?? null;

    set({ session, user, isAuthenticated: !!session });

    if (user) {
      await get().fetchProfile(user.id);
      // Register for push notifications
      try {
        const token = await notificationService.registerForPushNotifications();
        if (token) {
          await notificationService.savePushToken(user.id, token);
        }
      } catch (error) {
        console.error("Push notification setup failed:", error);
      }
    }

    set({ isLoading: false });

    supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (event === "PASSWORD_RECOVERY") {
        console.log("🔑 Password recovery detected");
        router.replace("/change-password");
        return;
      }

      if (event === "SIGNED_IN") {
        set({ isLoading: true });
        const newUser = newSession?.user ?? null;

        set({
          session: newSession,
          user: newUser,
          isAuthenticated: !!newSession,
        });
        if (newUser) {
          await get().fetchProfile(newUser.id);

          try {
            const token = await notificationService
              .registerForPushNotifications();
            if (token) {
              await notificationService.savePushToken(newUser.id, token);
            }
          } catch (error) {
            console.error("Push notification setup failed:", error);
          }
        }

        set({ isLoading: false });
      } else if (event === "SIGNED_OUT") {
        set({
          session: null,
          user: null,
          profile: null,
          isAuthenticated: false,
        });
      }
    });
  },

  signIn: async (email, password) => {
    await authService.signIn(email, password);
  },

  signUp: async (email, password, fullName) => {
    const data = await authService.signUp(email, password, fullName);
    if (data.user) {
      await get().fetchProfile(data.user.id);

      try {
        const token = await notificationService.registerForPushNotifications();

        if (token) {
          await notificationService.savePushToken(data.user.id, token);
        }
      } catch (error) {
        console.error("Push notification setup failed:", error);
      }
    }
  },

  signOut: async () => {
    await authService.signOut();
  },
}));
