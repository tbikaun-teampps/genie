import type { MarketingRequestEmailData } from "@/types/email";
import { supabase } from "./supabase";

export async function sendMarketingRequestEmail(
  data: MarketingRequestEmailData
) {
  try {
    const { data: result, error } = await supabase.functions.invoke(
      "send-marketing-email",
      {
        body: data,
      }
    );

    if (error) {
      throw error;
    }

    return { success: true, data: result };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
