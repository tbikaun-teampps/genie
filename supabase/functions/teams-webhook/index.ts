import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { corsHeaders } from "../_shared/cors.ts"

interface WebhookRequest {
  title: string
  message: string
  data?: Record<string, any>
  color?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { title, message, data, color = "0078d4" }: WebhookRequest = await req.json()
    
    const teamsWebhookUrl = Deno.env.get('TEAMS_WEBHOOK_URL')
    
    if (!teamsWebhookUrl) {
      throw new Error('Teams webhook URL not configured')
    }

    const teamsPayload = {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      "themeColor": color,
      "summary": title,
      "sections": [{
        "activityTitle": title,
        "activitySubtitle": message,
        "facts": data ? Object.entries(data).map(([key, value]) => ({
          "name": key,
          "value": String(value)
        })) : [],
        "markdown": true
      }]
    }

    const response = await fetch(teamsWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(teamsPayload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Teams webhook failed: ${response.status} ${errorText}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Teams notification sent successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Teams webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})