// Check if we're in demo mode
const DEMO_MODE = Deno?.env?.get("DEMO_MODE") === "true";

export const EMAIL_CONFIG = {
  TO_MARKETING_RECIPIENTS: [
    "tbikaun@teampps.com.au"
    // "talicia@teampps.com.au",
    // "jolivier@teampps.com.au",
  ],
  BCC_MARKETING_RECIPIENTS: ["tbikaun@teampps.com.au"],
  FROM_ADDRESS: "Genie AI <noreply@mail.teampps.com.au>",
  FORM_FROM_ADDRESS: "Genie Form <noreply@mail.teampps.com.au>",
  
  // Demo mode configuration
  DEMO_MODE,
  DEMO_TO_RECIPIENTS: ["tbikaun+demo@teampps.com.au"],
  DEMO_BCC_RECIPIENTS: ["tbikaun+demo@teampps.com.au"],
  
  // Helper functions to get appropriate recipients
  getToRecipients: () => DEMO_MODE ? EMAIL_CONFIG.DEMO_TO_RECIPIENTS : EMAIL_CONFIG.TO_MARKETING_RECIPIENTS,
  getBccRecipients: () => DEMO_MODE ? EMAIL_CONFIG.DEMO_BCC_RECIPIENTS : EMAIL_CONFIG.BCC_MARKETING_RECIPIENTS,
  getSubjectPrefix: () => DEMO_MODE ? "[DEMO] " : "",
} as const;
