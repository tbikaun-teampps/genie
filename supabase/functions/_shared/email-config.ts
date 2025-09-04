// Email configuration with test mode support

export const EMAIL_CONFIG = {
  TO_MARKETING_RECIPIENTS: [
    "talicia@teampps.com.au",
    "jolivier@teampps.com.au",
  ],
  BCC_MARKETING_RECIPIENTS: ["tbikaun@teampps.com.au"],
  FROM_ADDRESS: "Genie AI <noreply@mail.teampps.com.au>",
  FORM_FROM_ADDRESS: "Genie Form <noreply@mail.teampps.com.au>",

  // Test mode configuration
  TEST_TO_RECIPIENTS: ["tbikaun+test@teampps.com.au"],
  TEST_BCC_RECIPIENTS: ["tbikaun+test@teampps.com.au"],

  // Helper functions to get appropriate recipients based on test flag
  getToRecipients: (isTest = false) =>
    isTest
      ? EMAIL_CONFIG.TEST_TO_RECIPIENTS
      : EMAIL_CONFIG.TO_MARKETING_RECIPIENTS,
  getBccRecipients: (isTest = false) =>
    isTest
      ? EMAIL_CONFIG.TEST_BCC_RECIPIENTS
      : EMAIL_CONFIG.BCC_MARKETING_RECIPIENTS,
  getSubjectPrefix: (isTest = false) => (isTest ? "[TEST] " : ""),
} as const;
