import { supabase } from "@/src/lib/supabase";
import { showMessage } from "./dialog";

const sendNotification = async (
  userId: string,
  title: string,
  body: string,
  data?: any,
) => {
  try {
    // console.log("📤 Sending notification to:", userId);
    // console.log("📝 Title:", title);
    // console.log("📝 Body:", body);

    const { data: result, error } = await supabase.functions.invoke(
      "push",
      {
        body: { userId, title, body, data },
      },
    );

    // console.log("📦 Response:", result);
    // console.log("❌ Error:", error);
    if (error) {
      console.error("Edge function error details:", {
        message: error.message,
        context: error.context,
      });
      showMessage(error.message, "error");
    }

    return result;
  } catch (error: any) {
    console.error("Send notification error:", {
      message: error.message,
      stack: error.stack,
      full: error,
    });
    showMessage(error.message, "error");
  }
};

export const notifications = {
  appointmentConfirmed: async (
    userId: string,
    carName: string,
    appointmentId: string,
  ) => {
    return sendNotification(
      userId,
      "Appointment Confirmed! 🎉",
      `Your test drive for ${carName} has been confirmed!`,
      {
        type: "appointment_confirmed",
        appointmentId,
        screen: "appointment",
      },
    );
  },

  newBookingRequest: async (
    sellerId: string,
    buyerName: string,
    carName: string,
    appointmentId: string,
  ) => {
    return sendNotification(
      sellerId,
      "New Booking Request 📅",
      `${buyerName} wants to book a test drive for ${carName}`,
      {
        type: "new_booking",
        appointmentId,
        screen: "appointment",
      },
    );
  },

  appointmentCancelled: async (userId: string, carName: string) => {
    return sendNotification(
      userId,
      "Appointment Cancelled ❌",
      `Your test drive for ${carName} has been cancelled by the seller.`,
      {
        type: "appointment_cancelled",
        screen: "appointments",
      },
    );
  },

  appointmentCompleted: async (userId: string, carName: string) => {
    return sendNotification(
      userId,
      "Test Drive Completed ✅",
      `Thank you for test driving ${carName}! We hope you enjoyed it.`,
      {
        type: "appointment_completed",
        screen: "appointments",
      },
    );
  },

  carApproved: async (sellerId: string, carName: string, carId: string) => {
    return sendNotification(
      sellerId,
      "Car Listing Approved! ✅",
      `Your ${carName} is now live on the marketplace!`,
      {
        type: "car_approved",
        carId,
        screen: "car",
      },
    );
  },

  carRejected: async (sellerId: string, carName: string, reason?: string) => {
    return sendNotification(
      sellerId,
      "Car Listing Rejected ❌",
      reason || `Your ${carName} listing needs some changes before approval.`,
      {
        type: "car_rejected",
        screen: "seller",
      },
    );
  },
};
