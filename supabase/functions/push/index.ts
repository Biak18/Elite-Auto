import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { userId, title, body, data } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("push_token")
      .eq("id", userId)
      .single();

    if (profileError || !profile?.push_token) {
      console.error("No push token found:", profileError);
      throw new Error("No push token found for user");
    }

    console.log("Sending to Expo Push API...");

    const message = {
      to: profile.push_token,
      sound: "default",
      title: title,
      body: body,
      data: data || {},
    };

    const expoPushResponse = await fetch(
      "https://exp.host/--/api/v2/push/send",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Accept-encoding": "gzip, deflate",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      },
    );

    const expoPushResult = await expoPushResponse.json();

    console.log("✅ Expo response:", expoPushResult);

    // Check for errors in Expo response
    if (expoPushResult.data && expoPushResult.data[0]?.status === "error") {
      console.error("❌ Expo Push error:", expoPushResult.data[0].message);
      throw new Error(expoPushResult.data[0].message);
    }

    // Save notification to database
    const { error: insertError } = await supabase.from("notifications").insert({
      user_id: userId,
      title,
      body,
      data,
    });

    if (insertError) {
      console.error("⚠️ Failed to save notification:", insertError);
    }

    return new Response(
      JSON.stringify({ success: true, expoPushResult }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      },
    );
  } catch (error) {
    console.error("🔥 Edge function error:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Unknown error",
        details: error,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
