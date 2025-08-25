import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";

interface WebhookRequest {
  title: string;
  message: string;
  data?: Record<string, any>;
  color?: string;
  type?: "marketing-request" | "general";
  formData?: MarketingRequestData;
}

interface MarketingRequestData {
  background: string;
  objectives: string;
  activityType: "once-off" | "broader-campaign";
  submittedBy: string;
  submittedAt: string;
  targeting?: string;
  timeline?: string;
  budget?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      title,
      message,
      data,
      color = "0078d4",
      type = "general",
      formData,
    }: WebhookRequest = await req.json();

    const teamsWebhookUrl = Deno.env.get("TEAMS_WEBHOOK_URL");

    if (!teamsWebhookUrl) {
      throw new Error("Teams webhook URL not configured");
    }

    let teamsPayload;

    if (type === "marketing-request" && formData) {
      // Enhanced Adaptive Card for marketing requests
      const cardColor = formData.activityType === "broader-campaign" ? "Attention" : "Good";
      
      teamsPayload = {
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            contentUrl: null,
            content: {
              $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
              type: "AdaptiveCard",
              version: "1.4",
              body: [
                {
                  type: "TextBlock",
                  text: `🧞‍♂️ ${title}`,
                  weight: "Bolder",
                  size: "Large",
                  color: cardColor,
                },
                {
                  type: "TextBlock",
                  text: message,
                  wrap: true,
                  spacing: "Small",
                },
                {
                  type: "FactSet",
                  facts: [
                    {
                      title: "👤 Submitted By:",
                      value: formData.submittedBy,
                    },
                    {
                      title: "📅 Submitted At:",
                      value: new Date(formData.submittedAt).toLocaleString(),
                    },
                    {
                      title: "🎯 Activity Type:",
                      value: formData.activityType === "broader-campaign" 
                        ? "📊 Broader Targeted Campaign" 
                        : "⚡ Once Off Activity",
                    },
                    ...(formData.timeline ? [{
                      title: "⏰ Timeline:",
                      value: formData.timeline,
                    }] : []),
                    ...(formData.budget ? [{
                      title: "💰 Budget:",
                      value: formData.budget,
                    }] : []),
                  ],
                },
                {
                  type: "TextBlock",
                  text: "📝 **Request Details**",
                  weight: "Bolder",
                  spacing: "Medium",
                },
                {
                  type: "TextBlock",
                  text: `**Background:** ${formData.background.length > 200 ? formData.background.substring(0, 197) + "..." : formData.background}`,
                  wrap: true,
                  spacing: "Small",
                },
                {
                  type: "TextBlock",
                  text: `**Objectives:** ${formData.objectives.length > 200 ? formData.objectives.substring(0, 197) + "..." : formData.objectives}`,
                  wrap: true,
                  spacing: "Small",
                },
                ...(formData.targeting ? [{
                  type: "TextBlock",
                  text: `**Target Audience:** ${formData.targeting.length > 150 ? formData.targeting.substring(0, 147) + "..." : formData.targeting}`,
                  wrap: true,
                  spacing: "Small",
                }] : []),
              ],
              actions: [
                {
                  type: "Action.OpenUrl",
                  title: "📧 Check Email",
                  url: "mailto:tbikaun@teampps.com.au",
                },
              ],
            },
          },
        ],
      };
    } else {
      // Standard Adaptive Card for general messages
      teamsPayload = {
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            contentUrl: null,
            content: {
              $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
              type: "AdaptiveCard",
              version: "1.4",
              body: [
                {
                  type: "TextBlock",
                  text: title,
                  weight: "Bolder",
                  size: "Large",
                },
                {
                  type: "TextBlock",
                  text: message,
                  wrap: true,
                  spacing: "Small",
                },
                ...(data ? [{
                  type: "FactSet",
                  facts: Object.entries(data).map(([key, value]) => ({
                    title: `${key}:`,
                    value: String(value),
                  })),
                }] : []),
              ],
            },
          },
        ],
      };
    }

    const response = await fetch(teamsWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(teamsPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Teams webhook failed: ${response.status}`, errorText);
      
      // Parse error to provide helpful guidance
      try {
        const errorData = JSON.parse(errorText);
        if (errorData?.error?.code === "WorkflowTriggerIsNotEnabled") {
          throw new Error(`Teams webhook URL is invalid or workflow is deleted. Please update TEAMS_WEBHOOK_URL environment variable with a valid Teams incoming webhook URL.`);
        }
      } catch (parseError) {
        // If we can't parse the error, use the original message
      }
      
      throw new Error(`Teams webhook failed: ${response.status} ${errorText}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Teams notification sent successfully",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Teams webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
