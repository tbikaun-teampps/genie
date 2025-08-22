import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { 
  AIAssistanceRequest, 
  AIAssistanceResponse, 
  ObjectiveMeasurementsRequest,
  FormSummarisationRequest,
  MarketingActionPlanRequest,
  GenericRequest,
  ObjectiveMeasurementsResponse,
  FormSummarisationResponse,
  MarketingActionPlanResponse,
  GenericResponse
} from "../_shared/ai-types.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

// Helper function to call Anthropic API
async function callAnthropicAPI(systemPrompt: string, userMessage: string, maxTokens = 300) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-haiku-20240307',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userMessage }
      ],
    }),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error?.message || 'Anthropic API request failed')
  }

  return data.content[0]?.text || 'I apologize, but I could not generate a response.'
}

// Handler for objective measurements suggestions
async function handleObjectiveMeasurements(request: ObjectiveMeasurementsRequest): Promise<ObjectiveMeasurementsResponse> {
  const systemPrompt = `You are a marketing analytics expert helping to identify relevant KPIs and measurements for marketing campaigns.

  Based on the provided context, objectives, and existing measurements, suggest appropriate metrics that would help track campaign success.
  
  Respond with a JSON object containing:
  - suggestedOptions: array of 3-5 relevant KPI names
  - customSuggestions: array of 2-3 specialized metrics for this specific context
  - reasoning: brief explanation of why these metrics are recommended
  
  Focus on actionable, measurable metrics that align with the stated objectives.`

  const userMessage = `
  Context: ${request.context}
  Objectives: ${request.objectives}
  Current measurements being considered: ${request.measurements.join(', ')}
  
  Please suggest relevant KPIs and measurements.`

  const aiResponse = await callAnthropicAPI(systemPrompt, userMessage, 400)
  
  try {
    const parsed = JSON.parse(aiResponse)
    return {
      type: 'objective-measurements-suggestion',
      suggestedOptions: parsed.suggestedOptions || [],
      customSuggestions: parsed.customSuggestions || [],
      reasoning: parsed.reasoning || 'AI-generated measurement suggestions based on context analysis.'
    }
  } catch {
    // Fallback if JSON parsing fails
    return {
      type: 'objective-measurements-suggestion',
      suggestedOptions: ['Conversion Rate', 'Click-Through Rate', 'Cost Per Acquisition'],
      customSuggestions: ['Return on Investment', 'Customer Lifetime Value'],
      reasoning: aiResponse.substring(0, 200) + '...'
    }
  }
}

// Handler for form summarisation
async function handleFormSummarisation(request: FormSummarisationRequest): Promise<FormSummarisationResponse> {
  const systemPrompt = `You are an expert at analyzing form submissions and extracting key insights.

  Analyze the provided form content and create a comprehensive summary.
  
  Respond with a JSON object containing:
  - summary: concise overview of the form content (2-3 sentences)
  - keyPoints: array of 3-5 most important points from the form
  - insights: array of 2-3 strategic insights or observations
  - confidence: number between 0-100 indicating confidence in the analysis
  
  Focus on extracting meaningful information that would be useful for decision-making.`

  const userMessage = `Form content to analyze: ${JSON.stringify(request.formContent, null, 2)}`

  const aiResponse = await callAnthropicAPI(systemPrompt, userMessage, 500)
  
  try {
    const parsed = JSON.parse(aiResponse)
    return {
      type: 'form-summarisation',
      summary: parsed.summary || 'Form submission analyzed.',
      keyPoints: parsed.keyPoints || [],
      insights: parsed.insights || [],
      confidence: parsed.confidence || 75
    }
  } catch {
    return {
      type: 'form-summarisation',
      summary: 'Unable to parse form content summary.',
      keyPoints: ['Form data received', 'Analysis pending'],
      insights: ['Further review recommended'],
      confidence: 50
    }
  }
}

// Handler for marketing action plan
async function handleMarketingActionPlan(request: MarketingActionPlanRequest): Promise<MarketingActionPlanResponse> {
  const systemPrompt = `You are a marketing strategist creating actionable marketing plans.

  Based on the form content provided, create a comprehensive marketing action plan.
  
  Respond with a JSON object containing:
  - actionPlan: array of 4-6 specific actionable steps
  - timeline: suggested timeline for implementation (e.g., "3-6 months")
  - recommendations: array of 3-4 strategic recommendations
  - priority: "high", "medium", or "low" based on urgency
  - budget_considerations: array of 2-3 budget-related considerations
  
  Make recommendations specific and actionable based on the provided information.`

  const userMessage = `Create a marketing action plan based on this form submission: ${JSON.stringify(request.formContent, null, 2)}`

  const aiResponse = await callAnthropicAPI(systemPrompt, userMessage, 600)
  
  try {
    const parsed = JSON.parse(aiResponse)
    return {
      type: 'marketing-action-plan',
      actionPlan: parsed.actionPlan || [],
      timeline: parsed.timeline || '3-6 months',
      recommendations: parsed.recommendations || [],
      priority: parsed.priority || 'medium',
      budget_considerations: parsed.budget_considerations || []
    }
  } catch {
    return {
      type: 'marketing-action-plan',
      actionPlan: ['Analyze current marketing position', 'Develop target audience strategy', 'Create content calendar'],
      timeline: '3-6 months',
      recommendations: ['Focus on digital channels', 'Track key metrics'],
      priority: 'medium',
      budget_considerations: ['Consider cost per acquisition', 'Allocate budget for testing']
    }
  }
}

// Handler for generic assistance (backward compatibility)
async function handleGenericAssistance(request: GenericRequest): Promise<GenericResponse> {
  const systemPrompt = `You are an AI assistant helping users fill out forms. 
  ${request.formContext ? `The user is working on form "${request.formContext.formId}" and currently has these fields filled: ${JSON.stringify(request.formContext.currentFields, null, 2)}` : ''}
  
  Provide helpful, concise assistance. If the user asks about a specific field, provide relevant examples or guidance.
  Keep responses brief and actionable.`

  const aiMessage = await callAnthropicAPI(systemPrompt, request.message, 200)
  
  return {
    type: 'generic',
    message: aiMessage
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData: AIAssistanceRequest = await req.json()

    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured')
    }

    let response: AIAssistanceResponse

    // Route to appropriate handler based on type
    switch (requestData.type) {
      case 'objective-measurements-suggestion':
        response = await handleObjectiveMeasurements(requestData as ObjectiveMeasurementsRequest)
        break
      case 'form-summarisation':
        response = await handleFormSummarisation(requestData as FormSummarisationRequest)
        break
      case 'marketing-action-plan':
        response = await handleMarketingActionPlan(requestData as MarketingActionPlanRequest)
        break
      case 'generic':
        response = await handleGenericAssistance(requestData as GenericRequest)
        break
      default:
        // Backward compatibility - treat as generic if no type specified
        const genericRequest: GenericRequest = {
          type: 'generic',
          message: (requestData as any).message || 'How can I help you?',
          formContext: (requestData as any).formContext
        }
        response = await handleGenericAssistance(genericRequest)
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('AI assistance error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})