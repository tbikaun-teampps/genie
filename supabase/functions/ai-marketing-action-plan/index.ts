import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { EMAIL_CONFIG } from "../_shared/email-config.ts";
import {
  MarketingActionPlanRequest,
  MarketingActionPlanResponse,
  LinkedInCaptionsResponse,
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

// Handler for LinkedIn captions generation
// Handler for LinkedIn captions generation with improved reliability
async function handleLinkedInCaptions(
  request: MarketingActionPlanRequest
): Promise<LinkedInCaptionsResponse | null> {
  const systemPrompt = `You are a LinkedIn content specialist creating engaging post captions.

CRITICAL: You MUST respond with ONLY valid JSON. No additional text, explanations, or markdown formatting.

Based on the marketing request provided, create 3-4 draft LinkedIn post captions that would be relevant and engaging for the target audience.

BUSINESS PERSONA:
- Tone: Professional, candid, and confident. Speaking with authority from experience, direct, sharp (to the point) and value-driven. No "fluff" or salesy gimmicks, or overly technical language
- Identity: Consulting and technology partner that challenges traditional approaches to the asset management industry, striving to drive change and bring technology forward
- Audience: Senior Leaders to executives within asset-intensive industries. Decision makers who value efficiency, safety, productivity and profitability
- Messaging Style: Bold, Insight-Led positioning TEAM as thought leaders reframing asset management, not just service providers
- Outcome-Focused: Speak to results - clarity, capability, control, sustainable growth
- Authentic: Leaning on lived experience and avoiding 'buzzwords'
- Challenging but supportive: Courageous enough to question the status quo, but capable and connected to deliver lasting change and improvement
- Focus on long-term partnerships, not just one-off projects

RESPONSE FORMAT (STRICT JSON):
{
  "captions": ["caption1", "caption2", "caption3", "caption4"],
  "hashtags": ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"],
  "posting_strategy": "strategy text here",
  "engagement_tips": ["tip1", "tip2", "tip3"]
}

REQUIREMENTS:
- Each caption must be 100-300 characters
- Include 3-4 captions in the array
- Include 5-8 relevant hashtags (without # symbol)
- All captions MUST end with: "Your goals. Our TEAM. Let's go. teampps.com.au"
- posting_strategy: One brief strategy note (single string)
- engagement_tips: Array of 2-3 engagement tips (strings)

Remember: Output ONLY the JSON object, nothing else.`;

  const userMessage = `Create LinkedIn post captions based on this marketing request:
${JSON.stringify(request.formContent, null, 2)}

Respond with ONLY a JSON object following the exact structure specified.`;

  try {
    const aiResponse = await callAnthropicAPI(systemPrompt, userMessage, 1000);

    // Clean the response to ensure it's valid JSON
    const cleanedResponse = cleanJsonResponse(aiResponse);

    // Parse the JSON with validation
    const parsed = JSON.parse(cleanedResponse);

    return {
      type: "linkedin-captions",
      captions: parsed.captions,
      hashtags: parsed.hashtags,
      posting_strategy: parsed.posting_strategy,
      engagement_tips: parsed.engagement_tips,
    };
  } catch (error) {
    console.error("Failed to generate LinkedIn captions:", error);
    // Return null to indicate failure, email will show error message
    return null;
  }
}

// Helper function to clean JSON response
function cleanJsonResponse(response: string): string {
  // Remove any markdown code blocks
  let cleaned = response.replace(/```json\n?/gi, "").replace(/```\n?/gi, "");

  // Remove any leading/trailing whitespace
  cleaned = cleaned.trim();

  // Find the first { and last } to extract just the JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  // Remove any potential BOM or zero-width characters
  cleaned = cleaned.replace(/^\uFEFF/, "").replace(/\u200B/g, "");

  return cleaned;
}

// Handler for marketing action plan
async function handleMarketingActionPlan(
  request: MarketingActionPlanRequest
): Promise<MarketingActionPlanResponse> {
  const isLinkedInCampaign = request.formContent.isLinkedInCampaign;

  const systemPrompt = `You are a marketing strategist creating actionable marketing plans.

  Based on the form content provided, create a comprehensive marketing action plan${
    isLinkedInCampaign
      ? " with special focus on LinkedIn campaign strategies"
      : ""
  }.
  
  Respond with a JSON object containing:
  - actionPlan: array of 4-6 specific actionable steps${
    isLinkedInCampaign ? " (include LinkedIn-specific tactics)" : ""
  }
  - timeline: suggested timeline for implementation (e.g., "3-6 months")
  - recommendations: array of 3-4 strategic recommendations${
    isLinkedInCampaign ? " (emphasize LinkedIn best practices)" : ""
  }
  - priority: "high", "medium", or "low" based on urgency
  - budget_considerations: array of 2-3 budget-related considerations
  
  ${
    isLinkedInCampaign
      ? "Since this is a LinkedIn campaign, prioritize LinkedIn-native strategies like thought leadership content, professional networking, B2B engagement, and LinkedIn advertising options."
      : ""
  }
  
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

// Generate HTML email content for marketing action plan (with optional LinkedIn content)
function generateActionPlanEmailContent(
  actionPlan: MarketingActionPlanResponse,
  formContent: any,
  linkedInCaptions?: LinkedInCaptionsResponse | null
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
        .linkedin-section { background: #f0f9ff; border-left: 4px solid #0077b5; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .linkedin-section h3 { margin-top: 0; color: #0077b5; }
        .caption-item { background: #f3f4f6; padding: 12px; margin: 8px 0; border-left: 3px solid #0077b5; border-radius: 4px; font-style: italic; }
        .hashtag { background: #dbeafe; color: #1e40af; padding: 3px 6px; border-radius: 10px; font-size: 11px; margin: 2px; display: inline-block; }
        .linkedin-tip { background: #fef3c7; padding: 8px; margin: 5px 0; border-left: 3px solid #f59e0b; border-radius: 4px; font-size: 14px; }
        .linkedin-error { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 8px; color: #991b1b; }
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
          }${formContent.isLinkedInCampaign ? " (LinkedIn Campaign)" : ""}
        </div>
      </div>

      ${
        formContent.isLinkedInCampaign
          ? linkedInCaptions
            ? `
        <div class="linkedin-section">
          <h3>📱 LinkedIn Campaign Content</h3>
          
          <div class="section">
            <div class="section-title">✍️ Draft LinkedIn Captions</div>
            ${linkedInCaptions.captions
              .map(
                (caption, index) =>
                  `<div class="caption-item"><strong>Caption ${
                    index + 1
                  }:</strong><br>"${caption}"</div>`
              )
              .join("")}
          </div>

          <div class="section">
            <div class="section-title">#️⃣ Suggested Hashtags</div>
            <div style="margin: 10px 0;">
              ${linkedInCaptions.hashtags
                .map((tag) => `<span class="hashtag">${tag}</span>`)
                .join("")}
            </div>
          </div>

          <div style="background: #ecfdf5; padding: 12px; border-radius: 6px; margin: 15px 0;">
            <strong style="color: #065f46;">📈 Posting Strategy:</strong>
            <p style="margin: 5px 0 0 0;">${
              linkedInCaptions.posting_strategy
            }</p>
          </div>

          <div class="section">
            <div class="section-title">💡 Engagement Tips</div>
            ${linkedInCaptions.engagement_tips
              .map((tip) => `<div class="linkedin-tip">${tip}</div>`)
              .join("")}
          </div>
        </div>
      `
            : `
        <div class="linkedin-error">
          <h3>📱 LinkedIn Campaign Content</h3>
          <p><strong>⚠️ LinkedIn content generation failed.</strong></p>
          <p>The AI system encountered an error while generating LinkedIn captions for this campaign. Please create LinkedIn content manually or contact the technical team for assistance.</p>
        </div>
      `
          : ""
      }

      <div class="footer">
        <p>This action plan was generated by Genie AI based on the marketing request form submission.</p>
        <p>Review and adapt this plan according to your specific business needs and constraints.</p>
      </div>
    </body>
    </html>
  `;
}

// Send email with action plan (and LinkedIn content if applicable)
async function sendActionPlanEmail(
  actionPlan: MarketingActionPlanResponse,
  formContent: any,
  linkedInCaptions?: LinkedInCaptionsResponse | null
): Promise<void> {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured, skipping email");
    return;
  }

  const emailContent = generateActionPlanEmailContent(
    actionPlan,
    formContent,
    linkedInCaptions
  );

  const emailPayload = {
    from: EMAIL_CONFIG.FROM_ADDRESS,
    to: EMAIL_CONFIG.getToRecipients(),
    bcc: EMAIL_CONFIG.getBccRecipients(),
    subject: `${EMAIL_CONFIG.getSubjectPrefix()}🤖 AI Marketing Action Plan${
      formContent.isLinkedInCampaign ? " + LinkedIn Content" : ""
    } - ${actionPlan.priority.toUpperCase()} Priority`,
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

    let linkedInCaptions: LinkedInCaptionsResponse | null = null;

    // If this is a LinkedIn campaign, generate LinkedIn captions
    if (requestData.formContent.isLinkedInCampaign) {
      try {
        console.log("Generating LinkedIn captions for LinkedIn campaign...");
        linkedInCaptions = await handleLinkedInCaptions(requestData);
      } catch (linkedInError) {
        console.error("Failed to generate LinkedIn captions:", linkedInError);
        // linkedInCaptions remains null, which will trigger error message in email
      }
    }

    // Send email with the action plan (and LinkedIn content if applicable)
    try {
      await sendActionPlanEmail(
        response,
        requestData.formContent,
        linkedInCaptions
      );
    } catch (emailError) {
      console.error("Failed to send action plan email:", emailError);
      // Don't fail the entire request if email fails
    }

    // Return response with LinkedIn captions if generated
    const finalResponse = linkedInCaptions
      ? { ...response, linkedInCaptions }
      : response;

    return new Response(JSON.stringify(finalResponse), {
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
