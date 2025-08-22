// Shared types for AI assistance across Supabase Edge Functions

export type AssistanceType = 'objective-measurements-suggestion' | 'form-summarisation' | 'marketing-action-plan' | 'generic';

// Input interfaces for each assistance type
export interface ObjectiveMeasurementsRequest {
  type: 'objective-measurements-suggestion';
  context: string;
  objectives: string;
  measurements: string[];
}

export interface FormSummarisationRequest {
  type: 'form-summarisation';
  formContent: Record<string, any>;
}

export interface MarketingActionPlanRequest {
  type: 'marketing-action-plan';
  formContent: Record<string, any>;
}

export interface GenericRequest {
  type: 'generic';
  message: string;
  formContext?: {
    formId: string;
    currentFields: Record<string, any>;
    fieldType?: string;
  };
}

// Union type for all request types
export type AIAssistanceRequest = 
  | ObjectiveMeasurementsRequest 
  | FormSummarisationRequest 
  | MarketingActionPlanRequest 
  | GenericRequest;

// Output interfaces for each assistance type
export interface ObjectiveMeasurementsResponse {
  type: 'objective-measurements-suggestion';
  suggestedOptions: string[];
  customSuggestions: string[];
  reasoning: string;
}

export interface FormSummarisationResponse {
  type: 'form-summarisation';
  summary: string;
  keyPoints: string[];
  insights: string[];
  confidence: number;
}

export interface MarketingActionPlanResponse {
  type: 'marketing-action-plan';
  actionPlan: string[];
  timeline: string;
  recommendations: string[];
  priority: 'high' | 'medium' | 'low';
  budget_considerations: string[];
}

export interface GenericResponse {
  type: 'generic';
  message: string;
}

// Union type for all response types
export type AIAssistanceResponse = 
  | ObjectiveMeasurementsResponse 
  | FormSummarisationResponse 
  | MarketingActionPlanResponse 
  | GenericResponse;

// Error response type
export interface AIAssistanceError {
  error: string;
  type?: AssistanceType;
}