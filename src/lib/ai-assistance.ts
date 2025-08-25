import type {
  AISuggestions,
  FormContext,
  MarketingActionPlanInput,
  MarketingActionPlanOutput,
  ObjectiveMeasurementsInput,
  ObjectiveMeasurementsOutput,
} from "@/types/ai-assistance";
import { supabase } from "./supabase";

// Configuration for API calls
const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "http://localhost:54321";
const OBJECTIVE_MEASUREMENTS_ENDPOINT = `${SUPABASE_URL}/functions/v1/ai-objective-measurements-suggestion`;
const MARKETING_ACTION_PLAN_ENDPOINT = `${SUPABASE_URL}/functions/v1/ai-marketing-action-plan`;

// Note: Each AI assistance type now has its own dedicated Edge Function

// New API-based functions for different assistance types
export async function getObjectiveMeasurementsSuggestions(
  input: ObjectiveMeasurementsInput
): Promise<ObjectiveMeasurementsOutput> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const request = {
    type: "objective-measurements-suggestion" as const,
    context: input.context,
    objectives: input.objectives,
    measurements: input.measurements,
  };

  const response = await fetch(OBJECTIVE_MEASUREMENTS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      `Objective measurements request failed: ${response.statusText}`
    );
  }

  return response.json();
}

// Note: Form summarisation is now handled directly in the send-marketing-email Edge Function
// and no longer needs a separate client-side function

export async function getMarketingActionPlan(
  input: MarketingActionPlanInput
): Promise<MarketingActionPlanOutput> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  const request = {
    type: "marketing-action-plan" as const,
    formContent: input.formContent,
  };

  const response = await fetch(MARKETING_ACTION_PLAN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(
      `Marketing action plan request failed: ${response.statusText}`
    );
  }

  return response.json();
}

// Backward compatibility exports for any cached imports
export async function getAISuggestions(
  context: FormContext
): Promise<AISuggestions> {
  try {
    const input: ObjectiveMeasurementsInput = {
      context: context.background || "",
      objectives: context.objectives || "",
      measurements: [], // No measurements provided in legacy format
    };

    const result = await getObjectiveMeasurementsSuggestions(input);
    return {
      suggestedOptions: result.suggestedOptions,
      customSuggestions: result.customSuggestions,
    };
  } catch (error) {
    console.error("Error calling AI assistance:", error);
    // Fallback to simple suggestions if API fails
    return {
      suggestedOptions: [
        "Conversion Rate",
        "Click-Through Rate",
        "Cost Per Acquisition",
      ],
      customSuggestions: ["Return on Investment", "Customer Lifetime Value"],
    };
  }
}
