import type { MarketingRequestEmailData } from "@/lib/email";

export const demoData: MarketingRequestEmailData = {
  background:
    "We're launching a new AI-powered project management tool and need to increase brand awareness among tech startups and small businesses. Our current market presence is limited, and we want to establish ourselves as a thought leader in the productivity space. The tool has unique features like smart task prioritization and automated workflow suggestions.",
  objectives:
    "1. Generate 500 qualified leads within 3 months\n2. Increase brand awareness by 40% in our target market\n3. Achieve 10,000 website visitors per month\n4. Build an email list of 2,000 subscribers\n5. Generate $50,000 in new revenue from the campaign",
  measurement: [
    "Lead Generation",
    "Website Traffic",
    "Brand Awareness",
    "Conversion Rate",
    "Email Open/Click Rates",
  ],
  ccEmails: [],
  contactEmail: "demo@teampps.com.au",
  targeting:
    "Tech-savvy entrepreneurs and small business owners (25-45 years old) who manage teams of 5-50 people. They're looking for productivity solutions and are comfortable with cloud-based tools. Primary focus on startup hubs like San Francisco, Austin, and remote-first companies.",
  examples:
    "I really like how Notion does their content marketing - they create educational content that shows the product in action. Also impressed by Monday.com's user-generated content campaigns and how they showcase real customer success stories.",
  exampleLinks: [
    "https://notion.so/blog",
    "https://monday.com/success-stories",
  ],
  actionSteps:
    "See LinkedIn ad → Visit landing page → Download free productivity guide → Sign up for product demo → Start free trial → Convert to paid subscription",
  activityType: "broader-campaign" as const,
  preferredChannels: [
    "LinkedIn Ads",
    "Content Marketing",
    "Email Marketing",
    "Webinars",
    "SEO",
  ],
  timeline: "3 months with potential to extend if successful",
  budget:
    "$25,000 total campaign budget ($15k for ads, $10k for content creation)",
};
