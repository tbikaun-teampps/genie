import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"
import { 
  ObjectiveMeasurementsRequest,
  ObjectiveMeasurementsResponse
} from "../_shared/ai-types.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

// Helper function to call Anthropic API
async function callAnthropicAPI(systemPrompt: string, userMessage: string, maxTokens = 400) {
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData: ObjectiveMeasurementsRequest = await req.json()

    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured')
    }

    // Validate request type
    if (requestData.type !== 'objective-measurements-suggestion') {
      throw new Error('Invalid request type for objective-measurements function')
    }

    const response = await handleObjectiveMeasurements(requestData)

    return new Response(
      JSON.stringify(response),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Objective measurements error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})