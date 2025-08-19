export interface AISuggestions {
  suggestedOptions: string[];
  customSuggestions: string[];
}

export interface FormContext {
  background?: string;
  objectives?: string;
  [key: string]: string | undefined;
}

// Keyword mappings for measurement suggestions
const MEASUREMENT_KEYWORDS = {
  "Website Traffic": ["traffic", "visitors", "pageviews", "visits", "website"],
  "Lead Generation": [
    "leads",
    "generate",
    "prospects",
    "qualified",
    "pipeline",
  ],
  "Revenue/Sales": ["revenue", "sales", "profit", "income", "purchase", "buy"],
  "Brand Awareness": [
    "awareness",
    "brand",
    "recognition",
    "visibility",
    "reach",
  ],
  "Engagement Rate": [
    "engagement",
    "interact",
    "participate",
    "social",
    "likes",
  ],
  "Conversion Rate": [
    "conversion",
    "convert",
    "signup",
    "register",
    "download",
  ],
  "Click-Through Rate (CTR)": ["click", "ctr", "email", "ad", "campaign"],
  "Social Media Metrics": [
    "social",
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "followers",
  ],
  "Email Open/Click Rates": [
    "email",
    "newsletter",
    "open",
    "click",
    "subscribe",
  ],
};

// Custom measurement suggestions based on context
const CUSTOM_SUGGESTIONS = {
  ecommerce: [
    "Cart Abandonment Rate",
    "Average Order Value",
    "Customer Lifetime Value",
  ],
  saas: ["Monthly Recurring Revenue", "Churn Rate", "Feature Adoption Rate"],
  content: ["Time on Page", "Bounce Rate", "Content Shares"],
  b2b: ["Sales Qualified Leads", "Demo Requests", "Pipeline Velocity"],
  webinar: ["Registration Rate", "Attendance Rate", "Post-Event Engagement"],
  launch: [
    "Pre-Launch Signups",
    "Launch Day Conversions",
    "Post-Launch Retention",
  ],
};

export function analyzeMeasurementContext(context: FormContext): AISuggestions {
  const text = `${context.background || ""} ${
    context.objectives || ""
  }`.toLowerCase();

  // Find matching measurement options
  const suggestedOptions: string[] = [];
  const scores: { [key: string]: number } = {};

  // Score each measurement option based on keyword matches
  Object.entries(MEASUREMENT_KEYWORDS).forEach(([measurement, keywords]) => {
    let score = 0;
    keywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi");
      const matches = text.match(regex);
      if (matches) {
        score += matches.length;
      }
    });
    if (score > 0) {
      scores[measurement] = score;
    }
  });

  // Sort by score and take top 3
  const sortedSuggestions = Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([measurement]) => measurement);

  suggestedOptions.push(...sortedSuggestions);

  // Generate custom suggestions based on context
  const customSuggestions: string[] = [];

  // Check for specific business types/contexts
  if (
    text.includes("ecommerce") ||
    text.includes("shop") ||
    text.includes("store")
  ) {
    customSuggestions.push(...getRandomItems(CUSTOM_SUGGESTIONS.ecommerce, 2));
  }

  if (
    text.includes("saas") ||
    text.includes("software") ||
    text.includes("subscription")
  ) {
    customSuggestions.push(...getRandomItems(CUSTOM_SUGGESTIONS.saas, 2));
  }

  if (
    text.includes("content") ||
    text.includes("blog") ||
    text.includes("article")
  ) {
    customSuggestions.push(...getRandomItems(CUSTOM_SUGGESTIONS.content, 2));
  }

  if (
    text.includes("b2b") ||
    text.includes("enterprise") ||
    text.includes("business")
  ) {
    customSuggestions.push(...getRandomItems(CUSTOM_SUGGESTIONS.b2b, 2));
  }

  if (
    text.includes("webinar") ||
    text.includes("event") ||
    text.includes("demo")
  ) {
    customSuggestions.push(...getRandomItems(CUSTOM_SUGGESTIONS.webinar, 2));
  }

  if (
    text.includes("launch") ||
    text.includes("product") ||
    text.includes("new")
  ) {
    customSuggestions.push(...getRandomItems(CUSTOM_SUGGESTIONS.launch, 2));
  }

  // If no specific context found, add some general suggestions
  if (customSuggestions.length === 0) {
    customSuggestions.push(
      "Cost Per Acquisition",
      "Return on Investment (ROI)"
    );
  }

  // Remove duplicates and limit
  const uniqueCustom = [...new Set(customSuggestions)].slice(0, 2);

  return {
    suggestedOptions,
    customSuggestions: uniqueCustom,
  };
}

// Simulate AI processing delay
export async function getAISuggestions(
  context: FormContext
): Promise<AISuggestions> {
  // Add realistic delay to simulate AI processing
  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + Math.random() * 1000)
  );

  return analyzeMeasurementContext(context);
}

// Utility function to get random items from array
function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}
