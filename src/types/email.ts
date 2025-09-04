
export interface MarketingRequestEmailData {
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
  isLinkedInCampaign?: boolean;
}

