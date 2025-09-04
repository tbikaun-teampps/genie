import type { MarketingRequestEmailData } from "@/types/email";
import { supabase } from "./supabase";

export async function sendMarketingRequestEmail(
  data: MarketingRequestEmailData
) {
  try {
    // Add test flag when in development environment
    const requestData = {
      ...data,
      test: import.meta.env.DEV || data.test,
    };

    const { data: result, error } = await supabase.functions.invoke(
      "send-marketing-email",
      {
        body: requestData,
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
