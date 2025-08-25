import type { FormDefinition } from "@/types/forms";

// Simple form definitions for the forms list UI
// Actual form logic is in dedicated components
export const allForms: FormDefinition[] = [
  {
    id: "marketing-request",
    title: "Marketing Request",
    description: "Submit a request for marketing activities and campaigns",
    schema: {} as any, // Not used with dedicated components
    fields: [], // Not used with dedicated components - just for display count
  },
];
