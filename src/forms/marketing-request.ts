import { z } from "zod";
import type { FormDefinition } from "@/lib/forms";

export const marketingRequestForm: FormDefinition = {
  id: "marketing-request",
  title: "Marketing Request",
  description: "Submit a request for marketing activities and campaigns",
  schema: z.object({
    background: z
      .string()
      .min(10, "Please provide background context (minimum 10 characters)"),
    objectives: z
      .string()
      .min(10, "Please describe the objectives (minimum 10 characters)"),
    measurement: z
      .array(z.string())
      .min(1, "Please select at least one measurement method"),
    ccEmails: z.array(z.string().email("Please enter valid email addresses")).optional(),
    targeting: z
      .string()
      .min(10, "Please describe your target audience (minimum 10 characters)"),
    examples: z.string().optional(),
    exampleLinks: z.array(z.string().url("Please enter valid URLs")).optional(),
    actionSteps: z
      .string()
      .min(10, "Please describe expected action steps (minimum 10 characters)"),
  }),
  fields: [
    {
      name: "background",
      label: "Background Information / Context / What would you like done?",
      type: "textarea",
      placeholder:
        "Provide background information and context for this marketing request...",
      required: true,
      help: [
        "Include relevant context like timeline, budget constraints, or previous efforts",
        "Explain the business problem you're trying to solve",
        "Mention any key stakeholders or departments involved"
      ],
      examples: [
        "We need to increase brand awareness for our new product launch",
        "Generate more qualified leads for our B2B software",
        "Drive more traffic to our e-commerce site during holiday season",
        "Promote our upcoming webinar to IT professionals"
      ],
    },
    {
      name: "objectives",
      label: "What are the objectives that we need to meet?",
      type: "textarea",
      placeholder:
        "Describe the specific objectives and goals. Please be as specific as possible. Consider using SMART goals...",
      required: true,
      help: [
        "Use SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound",
        "Be as specific as possible with numbers and timelines",
        "Align objectives with overall business goals"
      ],
      examples: [
        "Increase website traffic by 25% within 3 months",
        "Generate 100 qualified leads per month",
        "Achieve 10,000 social media followers by Q4",
        "Boost email open rates to 25%"
      ],
    },
    {
      name: "measurement",
      label: "How will we measure these objectives?",
      type: "multiselect",
      options: [
        "Conversion Rate",
        "Click-Through Rate (CTR)",
        "Lead Generation",
        "Brand Awareness",
        "Engagement Rate",
        "Revenue/Sales",
        "Website Traffic",
        "Social Media Metrics",
        "Email Open/Click Rates",
      ],
      required: true,
      allowCustom: true,
      includeNotSure: true,
      aiAssistance: true,
      help: [
        "Select multiple metrics that align with your objectives",
        "Add custom metrics if needed",
        "Choose 'I'm not sure' if you need guidance on measurement"
      ],
      examples: [
        "Awareness goals: Impressions, reach, brand mentions",
        "Engagement goals: CTR, time on page, social shares",
        "Lead generation: Conversion rate, cost per lead",
        "Sales goals: Revenue, ROI, customer acquisition cost"
      ],
    },
    {
      name: "ccEmails",
      label: "CC for Review/Comments",
      type: "emails",
      placeholder: "name@example.com",
      required: false,
      help: [
        "Add email addresses of people you want to CC for review and comments",
        "These people will receive notifications about this marketing request",
        "Optional - only add if you need specific stakeholders to be involved"
      ],
      examples: [
        "stakeholder@company.com",
        "manager@company.com", 
        "team-lead@company.com"
      ],
    },
    {
      name: "targeting",
      label: "Who are we targeting with this marketing activity?",
      type: "textarea",
      placeholder:
        "Describe your target audience, demographics, personas, etc...",
      required: true,
      help: [
        "Consider demographics: age, gender, location, income",
        "Include psychographics: interests, values, lifestyle",
        "Mention behavioral patterns: buying habits, brand loyalty",
        "For B2B: job titles, company size, industry"
      ],
      examples: [
        "Small business owners in tech, 25-45 years old",
        "Marketing managers at companies with 50-500 employees",
        "Parents with young children interested in healthy living",
        "IT professionals at enterprise companies"
      ],
    },
    {
      name: "examples",
      label: "Have you seen this marketing activity being used before? (optional)",
      type: "textarea",
      placeholder: "Describe examples, creative concepts, or inspiration you've seen...",
      required: false,
      help: [
        "This helps us understand your preferences and avoid reinventing the wheel",
        "Describe what specifically you liked about the examples",
        "Add any relevant links in the section below"
      ],
      examples: [
        "Competitor campaigns you admire",
        "Industry case studies or best practices",
        "Creative concepts or formats you've seen work well",
        "Specific tactics or messaging approaches"
      ],
    },
    {
      name: "exampleLinks",
      label: "Reference Links",
      type: "links",
      placeholder: "https://example.com/campaign",
      required: false,
      help: [
        "Add links to campaigns, case studies, or examples you mentioned above",
        "Include any competitor examples or inspiration sources",
        "Links help the team understand your vision better"
      ],
      examples: [
        "Campaign landing pages you admire",
        "Competitor marketing examples",
        "Industry articles or case studies",
        "Creative portfolios or inspiration sites"
      ],
    },
    {
      name: "actionSteps",
      label:
        "What are the expected action steps of your target persona once they have been reached by this marketing activity?",
      type: "textarea",
      placeholder: "Describe the customer journey and expected actions...",
      required: true,
      help: [
        "Map out the complete customer journey from awareness to conversion",
        "Think about each step in the funnel",
        "Consider what actions you want users to take at each stage"
      ],
      examples: [
        "See ad → Visit landing page → Download whitepaper → Schedule demo",
        "Read email → Click to website → Add to cart → Purchase",
        "View social post → Follow account → Sign up for newsletter",
        "Watch video → Visit website → Request quote → Become customer"
      ],
    },
    {
      name: "submission-info",
      label: "Before You Submit",
      type: "disclosure",
      variant: "info",
      content: [
        "Your marketing request will be automatically posted to the Marketing team's Microsoft Teams channel for review and assignment.",
        // "⏱️ You can expect an initial response within 1-2 business days.",
        // "📞 A team member may contact you for additional clarification or to schedule a brief planning session.",
        // "🔄 You'll receive updates on your request's progress via email and Teams notifications.",
        // "📊 All approved requests will be tracked in our project management system with regular status updates."
      ],
    },
  ],
};