// supabase/functions/car-status-webhook/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
};

interface CarStatusPayload {
    type: "UPDATE";
    table: "cars";
    record: {
        id: string;
        name: string;
        owner_id: string;
        status: "pending" | "approved" | "rejected";
    };
    old_record: {
        status: "pending" | "approved" | "rejected";
    };
}

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const payload: CarStatusPayload = await req.json();

        if (payload.record.status === payload.old_record.status) {
            return new Response(
                JSON.stringify({ message: "No status change" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        let title = "";
        let body = "";
        let type = "";

        if (payload.record.status === "approved") {
            title = "Car Listing Approved!";
            body =
                `Your ${payload.record.name} is now live on the marketplace!`;
            type = "car_approved";
        } else if (payload.record.status === "rejected") {
            title = "Car Listing Rejected";
            body =
                `Your ${payload.record.name} listing needs some changes before approval.`;
            type = "car_rejected";
        } else {
            return new Response(
                JSON.stringify({ message: "No notification needed" }),
                {
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                },
            );
        }

        const { error: pushError } = await supabase.functions.invoke("push", {
            body: {
                userId: payload.record.owner_id,
                title,
                body,
                data: {
                    type,
                    carId: payload.record.id,
                    screen: type === "car_approved" ? "car" : "seller",
                },
            },
        });

        if (pushError) {
            console.error("Push notification error:", pushError);
            throw pushError;
        }

        return new Response(
            JSON.stringify({ success: true, message: "Notification sent" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            },
        );
    }
});
