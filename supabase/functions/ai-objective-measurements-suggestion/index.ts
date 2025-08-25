import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import {
  ObjectiveMeasurementsRequest,
  ObjectiveMeasurementsResponse,
} from "../_shared/ai-types.ts";
import { ObjectiveMeasurementOptions } from "../_shared/measurement-options.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

// Helper function to call Anthropic API
async function callAnthropicAPI(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 400
) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": ANTHROPIC_API_KEY,
      "Content-Type": "application/json",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-haiku-20240307",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Anthropic API request failed");
  }

  return (
    data.content[0]?.text || "I apologize, but I could not generate a response."
  );
}

// Handler for objective measurements suggestions
async function handleObjectiveMeasurements(
  request: ObjectiveMeasurementsRequest
): Promise<ObjectiveMeasurementsResponse> {
  const systemPrompt = `You are a marketing analytics expert helping to identify relevant KPIs and measurements for marketing campaigns.

  Based on the provided context, objectives, and existing measurements, suggest appropriate metrics that would help track campaign success.
  
  Available predefined measurement options (use ONLY these for suggestedOptions):
  ${ObjectiveMeasurementOptions.map(option => `- ${option}`).join('\n  ')}
  
  Respond with a JSON object containing:
  - suggestedOptions: array of 3-5 KPI names selected ONLY from the predefined options above
  - customSuggestions: array of 2-3 specialized/custom metrics specific to this context (these can be creative and specific)
  - reasoning: a brief string explanation of why these metrics are recommended (NOT an object)
  
  Focus on actionable, measurable metrics that align with the stated objectives.`;

  const userMessage = `
  Context: ${request.context}
  Objectives: ${request.objectives}
  Current measurements being considered: ${request.measurements.join(", ")}
  
  Please suggest relevant KPIs and measurements.`;

  const aiResponse = await callAnthropicAPI(systemPrompt, userMessage, 400);

  try {
    const parsed = JSON.parse(aiResponse);
    
    // Filter suggested options to only include predefined options
    const validSuggestedOptions = (parsed.suggestedOptions || [])
      .filter((option: string) => ObjectiveMeasurementOptions.includes(option));
    
    // Ensure reasoning is a string (handle both string and object formats)
    let reasoning = "AI-generated measurement suggestions based on context analysis.";
    if (typeof parsed.reasoning === "string") {
      reasoning = parsed.reasoning;
    } else if (typeof parsed.reasoning === "object" && parsed.reasoning?.overall) {
      reasoning = parsed.reasoning.overall;
    } else if (typeof parsed.reasoning === "object" && parsed.reasoning) {
      // If it's an object but no 'overall' field, try to extract meaningful text
      const reasoningValues = Object.values(parsed.reasoning).filter(v => typeof v === "string");
      if (reasoningValues.length > 0) {
        reasoning = reasoningValues.join(" ");
      }
    }
    
    return {
      type: "objective-measurements-suggestion",
      suggestedOptions: validSuggestedOptions,
      customSuggestions: parsed.customSuggestions || [],
      reasoning,
    };
  } catch {
    // Fallback if JSON parsing fails - use only predefined options
    return {
      type: "objective-measurements-suggestion",
      suggestedOptions: [
        "Conversion Rate",
        "Click-Through Rate (CTR)",
        "Lead Generation",
      ],
      customSuggestions: ["Return on Investment", "Customer Lifetime Value"],
      reasoning: aiResponse.substring(0, 200) + "...",
    };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData: ObjectiveMeasurementsRequest = await req.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error("Anthropic API key not configured");
    }

    // Validate request type
    if (requestData.type !== "objective-measurements-suggestion") {
      throw new Error(
        "Invalid request type for objective-measurements function"
      );
    }

    const response = await handleObjectiveMeasurements(requestData);

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Objective measurements error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
