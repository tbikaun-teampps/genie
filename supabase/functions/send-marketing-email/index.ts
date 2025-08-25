import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { FormSummarisationResponse } from "../_shared/ai-types.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

// Helper function to call Anthropic API for form summarization
async function generateFormSummary(
  formData: MarketingRequestEmailData
): Promise<FormSummarisationResponse | null> {

  if (!ANTHROPIC_API_KEY) {
    console.warn("ANTHROPIC_API_KEY not configured, skipping AI summary");
    return null;
  }

  try {
    const systemPrompt = `You are an expert at analyzing marketing request forms and extracting key insights.

    Analyze the provided form content and create a comrehensive summary.
    
    Respond with a JSON object containing:
    - summary: concise overview of the marketing request (2-3 sentences)
    - confidence: number between 0-100 indicating confidence in the analysis
    
    Focus on extracting meaningful information that would be useful for decision-making.`;

    const userMessage = `Marketing request form to analyze: ${JSON.stringify(
      formData,
      null,
      2
    )}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 500,
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(
        "Anthropic API error:",
        response.status,
        response.statusText
      );
      console.error("Error response body:", errorBody);
      console.error("Request headers:", response.headers);
      return null;
    }

    const data = await response.json();
    const aiResponse = data.content[0]?.text || "";

    try {
      const parsed = JSON.parse(aiResponse);
      return {
        type: "form-summarisation",
        summary: parsed.summary || "Marketing request analyzed.",
        confidence: parsed.confidence || 75,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return null;
  }
}

interface MarketingRequestEmailData {
  background: string;
  objectives: string;
  measurement: string[];
  ccEmails?: string[];
  contactEmail: string;
  targeting: string;
  examples?: string;
  exampleLinks?: string[];
  actionSteps: string;
  activityType: "once-off" | "broader-campaign";
  preferredChannels?: string[];
  timeline?: string;
  budget?: string;
  submittedBy: string;
  submittedAt: string;
}

function generateEmailContent(
  data: MarketingRequestEmailData,
  aiSummary?: FormSummarisationResponse | null
): string {
  const {
    background,
    objectives,
    measurement,
    targeting,
    examples,
    exampleLinks,
    actionSteps,
    activityType,
    preferredChannels,
    timeline,
    budget,
    submittedBy,
    submittedAt,
  } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Marketing Request</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .section { margin-bottom: 25px; }
        .section-title { color: #2563eb; font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px; }
        .field-label { font-weight: bold; color: #374151; margin-bottom: 5px; }
        .field-value { background: #f9fafb; padding: 10px; border-radius: 4px; margin-bottom: 15px; }
        .list-item { background: #f3f4f6; padding: 8px; margin: 5px 0; border-radius: 4px; }
        .activity-type { background: #dbeafe; color: #1e40af; padding: 10px; border-radius: 6px; font-weight: bold; text-align: center; }
        .campaign-details { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
        .ai-summary { background: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .ai-summary h3 { margin-top: 0; color: #0c4a6e; display: flex; align-items: center; }
        .ai-summary .confidence { background: #e0f2fe; color: #0c4a6e; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin-left: 10px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; }
        a { color: #2563eb; text-decoration: none; }
        a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 style="margin: 0; color: #1f2937;">🧞‍♂️ New Marketing Request</h1>
        <p style="margin: 10px 0 0 0; color: #6b7280;">Submitted by: ${submittedBy} • ${new Date(
    submittedAt
  ).toLocaleString()}</p>
      </div>

      <div class="activity-type">
        ${
          activityType === "broader-campaign"
            ? "📊 Broader Targeted Campaign"
            : "⚡ Once Off Activity"
        }
      </div>

      ${
        aiSummary
          ? `
        <div class="ai-summary">
          <h3>🤖 AI Analysis <span class="confidence">${
            aiSummary.confidence
          }% confidence</span></h3>
          
          <div class="field-value">
            <strong>Summary:</strong> ${aiSummary.summary}
          </div>
        </div>
      `
          : ""
      }

      <div class="section">
        <div class="section-title">Background & Context</div>
        <div class="field-value">${background.replace(/\n/g, "<br>")}</div>
      </div>

      <div class="section">
        <div class="section-title">Objectives</div>
        <div class="field-value">${objectives.replace(/\n/g, "<br>")}</div>
      </div>

      <div class="section">
        <div class="section-title">Measurement Methods</div>
        ${measurement
          .map((item) => `<div class="list-item">${item}</div>`)
          .join("")}
      </div>

      <div class="section">
        <div class="section-title">Target Audience</div>
        <div class="field-value">${targeting.replace(/\n/g, "<br>")}</div>
      </div>

      <div class="section">
        <div class="section-title">Expected Action Steps</div>
        <div class="field-value">${actionSteps.replace(/\n/g, "<br>")}</div>
      </div>

      ${
        examples
          ? `
        <div class="section">
          <div class="section-title">Examples & Inspiration</div>
          <div class="field-value">${examples.replace(/\n/g, "<br>")}</div>
        </div>
      `
          : ""
      }

      ${
        exampleLinks?.length
          ? `
        <div class="section">
          <div class="section-title">Reference Links</div>
          ${exampleLinks
            .map(
              (link) =>
                `<div class="list-item"><a href="${link}" target="_blank">${link}</a></div>`
            )
            .join("")}
        </div>
      `
          : ""
      }

      ${
        activityType === "broader-campaign"
          ? `
        <div class="campaign-details">
          <h3 style="margin-top: 0; color: #92400e;">📈 Campaign Details</h3>
          
          ${
            preferredChannels?.length
              ? `
            <div class="field-label">Preferred Channels:</div>
            ${preferredChannels
              .map((channel) => `<div class="list-item">${channel}</div>`)
              .join("")}
          `
              : ""
          }
          
          ${
            timeline
              ? `
            <div class="field-label">Timeline:</div>
            <div class="field-value">${timeline}</div>
          `
              : ""
          }
          
          ${
            budget
              ? `
            <div class="field-label">Budget:</div>
            <div class="field-value">${budget}</div>
          `
              : ""
          }
        </div>
      `
          : ""
      }

      <div class="footer">
        <p>This request was submitted through the Genie marketing request form.</p>
        <p>Reply to this email or contact the submitter directly for any questions.</p>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const data: MarketingRequestEmailData = await req.json();

    // Generate AI summary of the form data
    console.log("Generating AI summary for marketing request...");
    const aiSummary = await generateFormSummary(data);

    if (aiSummary) {
      console.log(
        "AI summary generated successfully with confidence:",
        aiSummary.confidence
      );
    } else {
      console.log("AI summary generation failed or skipped");
    }

    const emailContent = generateEmailContent(data, aiSummary);

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY not found");
    }

    // Combine CC emails with user's contact email
    const allCcEmails = [...(data.ccEmails || []), data.contactEmail];

    const subjectPrefix = aiSummary ? "🤖 " : "";
    const activityTypeText =
      data.activityType === "broader-campaign" ? "Campaign" : "Activity";

    const emailPayload = {
      from: "Genie Form <noreply@mail.teampps.com.au>",
      to: ["tbikaun@teampps.com.au"],
      cc: allCcEmails,
      subject: `${subjectPrefix}New Marketing Request: ${activityTypeText}`,
      html: emailContent,
    };

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify(emailPayload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
