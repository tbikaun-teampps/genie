// Re-export types from the Edge Function shared types for consistency
export type AssistanceType =
  | "ai-objective-measurements-suggestion"
  | "ai-marketing-action-plan";

// Legacy interface for backward compatibility
export interface AISuggestions {
  suggestedOptions: string[];
  customSuggestions: string[];
}

export interface FormContext {
  background?: string;
  objectives?: string;
  [key: string]: string | undefined;
}

// Client-side input interfaces that match the Edge Function types
export interface ObjectiveMeasurementsInput {
  context: string;
  objectives: string;
  measurements: string[];
}

export interface FormContent {
  [key: string]: any;
}

export interface MarketingActionPlanInput {
  formContent: FormContent;
}

// Output types that match Edge Function responses
export interface ObjectiveMeasurementsOutput extends AISuggestions {
  reasoning: string;
}

// FormSummarisationOutput is no longer needed - handled directly in send-marketing-email

export interface MarketingActionPlanOutput {
  actionPlan: string[];
  timeline: string;
  recommendations: string[];
  priority: "high" | "medium" | "low";
  budget_considerations: string[];
}
