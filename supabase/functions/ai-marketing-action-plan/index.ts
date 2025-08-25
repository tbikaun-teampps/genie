import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { EMAIL_CONFIG } from "../_shared/email-config.ts";
import {
  MarketingActionPlanRequest,
  MarketingActionPlanResponse,
} from "../_shared/ai-types.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Helper function to call Anthropic API
async function callAnthropicAPI(
  systemPrompt: string,
  userMessage: string,
  maxTokens = 600
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

// Handler for marketing action plan
async function handleMarketingActionPlan(
  request: MarketingActionPlanRequest
): Promise<MarketingActionPlanResponse> {
  const systemPrompt = `You are a marketing strategist creating actionable marketing plans.

  Based on the form content provided, create a comprehensive marketing action plan.
  
  Respond with a JSON object containing:
  - actionPlan: array of 4-6 specific actionable steps
  - timeline: suggested timeline for implementation (e.g., "3-6 months")
  - recommendations: array of 3-4 strategic recommendations
  - priority: "high", "medium", or "low" based on urgency
  - budget_considerations: array of 2-3 budget-related considerations
  
  Make recommendations specific and actionable based on the provided information.`;

  const userMessage = `Create a marketing action plan based on this form submission: ${JSON.stringify(
    request.formContent,
    null,
    2
  )}`;

  const aiResponse = await callAnthropicAPI(systemPrompt, userMessage, 600);

  try {
    const parsed = JSON.parse(aiResponse);
    return {
      type: "marketing-action-plan",
      actionPlan: parsed.actionPlan || [],
      timeline: parsed.timeline || "3-6 months",
      recommendations: parsed.recommendations || [],
      priority: parsed.priority || "medium",
      budget_considerations: parsed.budget_considerations || [],
    };
  } catch {
    return {
      type: "marketing-action-plan",
      actionPlan: [
        "Analyze current marketing position",
        "Develop target audience strategy",
        "Create content calendar",
      ],
      timeline: "3-6 months",
      recommendations: ["Focus on digital channels", "Track key metrics"],
      priority: "medium",
      budget_considerations: [
        "Consider cost per acquisition",
        "Allocate budget for testing",
      ],
    };
  }
}

// Generate HTML email content for marketing action plan
function generateActionPlanEmailContent(
  actionPlan: MarketingActionPlanResponse,
  formContent: any
): string {
  const priorityColor =
    actionPlan.priority === "high"
      ? "#dc2626"
      : actionPlan.priority === "medium"
      ? "#f59e0b"
      : "#10b981";
  const priorityIcon =
    actionPlan.priority === "high"
      ? "🔥"
      : actionPlan.priority === "medium"
      ? "⚡"
      : "✅";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Marketing Action Plan</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .priority { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; color: white; background: ${priorityColor}; margin-bottom: 20px; }
        .section { margin-bottom: 25px; }
        .section-title { color: #2563eb; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .action-item { background: #f3f4f6; padding: 12px; margin: 8px 0; border-left: 4px solid #2563eb; border-radius: 4px; }
        .recommendation { background: #fef3c7; padding: 10px; margin: 5px 0; border-left: 3px solid #f59e0b; border-radius: 4px; }
        .budget-item { background: #ecfdf5; padding: 10px; margin: 5px 0; border-left: 3px solid #10b981; border-radius: 4px; }
        .timeline { background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center; font-weight: bold; color: #1e40af; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        .form-summary { background: #f9fafb; border: 1px solid #e5e7eb; padding: 15px; border-radius: 6px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; color: #1f2937;">🧞‍♂️ AI Marketing Action Plan</h1>
        <p style="margin: 10px 0 0 0; color: #6b7280;">Generated: ${new Date().toLocaleString()}</p>
      </div>

      <div class="priority">
        ${priorityIcon} ${actionPlan.priority.toUpperCase()} PRIORITY
      </div>

      <div class="timeline">
        📅 Recommended Timeline: ${actionPlan.timeline}
      </div>

      <div class="section">
        <div class="section-title">📋 Action Plan</div>
        ${actionPlan.actionPlan
          .map(
            (item, index) =>
              `<div class="action-item"><strong>${
                index + 1
              }.</strong> ${item}</div>`
          )
          .join("")}
      </div>

      <div class="section">
        <div class="section-title">💡 Strategic Recommendations</div>
        ${actionPlan.recommendations
          .map((rec) => `<div class="recommendation">${rec}</div>`)
          .join("")}
      </div>

      <div class="section">
        <div class="section-title">💰 Budget Considerations</div>
        ${actionPlan.budget_considerations
          .map((budget) => `<div class="budget-item">${budget}</div>`)
          .join("")}
      </div>

      <div class="section">
        <div class="section-title">📝 Original Form Context</div>
        <div class="form-summary">
          <strong>Background:</strong> ${
            formContent.background || "Not provided"
          }<br><br>
          <strong>Objectives:</strong> ${
            formContent.objectives || "Not provided"
          }<br><br>
          <strong>Activity Type:</strong> ${
            formContent.activityType || "Not specified"
          }
        </div>
      </div>

      <div class="footer">
        <p>This action plan was generated by Genie AI based on the marketing request form submission.</p>
        <p>Review and adapt this plan according to your specific business needs and constraints.</p>
      </div>
    </body>
    </html>
  `;
}

// Send email with action plan
async function sendActionPlanEmail(
  actionPlan: MarketingActionPlanResponse,
  formContent: any
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const emailContent = generateActionPlanEmailContent(actionPlan, formContent);

  const emailPayload = {
    from: EMAIL_CONFIG.FROM_ADDRESS,
    to: [EMAIL_CONFIG.MARKETING_RECIPIENT],
    subject: `🤖 AI Marketing Action Plan - ${actionPlan.priority.toUpperCase()} Priority`,
    html: emailContent,
  };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(emailPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Resend API error: ${response.status} - ${errorText}`);
  }

  console.log("Action plan email sent successfully");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const requestData: MarketingActionPlanRequest = await req.json();

    if (!ANTHROPIC_API_KEY) {
      throw new Error("Anthropic API key not configured");
    }

    // Validate request type
    if (requestData.type !== "marketing-action-plan") {
      throw new Error(
        "Invalid request type for marketing action plan function"
      );
    }

    const response = await handleMarketingActionPlan(requestData);

    // Send email with the action plan
    try {
      await sendActionPlanEmail(response, requestData.formContent);
    } catch (emailError) {
      console.error("Failed to send action plan email:", emailError);
      // Don't fail the entire request if email fails
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Marketing action plan error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
