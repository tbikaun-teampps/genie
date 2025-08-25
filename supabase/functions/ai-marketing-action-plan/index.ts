import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { 
  MarketingActionPlanRequest,
  MarketingActionPlanResponse
} from "../_shared/ai-types.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

// Helper function to call Anthropic API
async function callAnthropicAPI(systemPrompt: string, userMessage: string, maxTokens = 600) {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData: MarketingActionPlanRequest = await req.json()

    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured')
    }

    // Validate request type
    if (requestData.type !== 'marketing-action-plan') {
      throw new Error('Invalid request type for marketing action plan function')
    }

    const response = await handleMarketingActionPlan(requestData)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Marketing action plan error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})