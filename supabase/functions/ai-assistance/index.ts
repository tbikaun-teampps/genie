import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')

interface AIAssistanceRequest {
  message: string
  formContext?: {
    formId: string
    currentFields: Record<string, any>
    fieldType?: string
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { message, formContext }: AIAssistanceRequest = await req.json()

    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured')
    }

    const systemPrompt = `You are an AI assistant helping users fill out forms. 
    ${formContext ? `The user is working on form "${formContext.formId}" and currently has these fields filled: ${JSON.stringify(formContext.currentFields, null, 2)}` : ''}
    
    Provide helpful, concise assistance. If the user asks about a specific field, provide relevant examples or guidance.
    Keep responses brief and actionable.`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANTHROPIC_API_KEY}`,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        system: systemPrompt,
        messages: [
          { role: 'user', content: message }
        ],
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error?.message || 'Anthropic API request failed')
    }

    const aiMessage = data.content[0]?.text || 'I apologize, but I could not generate a response.'

    return new Response(
      JSON.stringify({ message: aiMessage }),
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