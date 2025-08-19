import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from "../_shared/cors.ts"

interface FormSubmissionRequest {
  formId: string
  formData: Record<string, any>
  userId: string
}

interface TeamsWebhookPayload {
  type: string
  attachments: Array<{
    contentType: string
    content: {
      type: string
      body: Array<{
        type: string
        text?: string
        columns?: any[]
      }>
    }
  }>
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { formId, formData, userId }: FormSubmissionRequest = await req.json()

    // Store form submission in database
    const { data: submission, error: dbError } = await supabaseClient
      .from('form_submissions')
      .insert({
        form_id: formId,
        user_id: userId,
        form_data: formData,
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (dbError) {
      throw new Error(`Database error: ${dbError.message}`)
    }

    // Send Teams webhook notification
    const teamsWebhookUrl = Deno.env.get('TEAMS_WEBHOOK_URL')
    
    if (teamsWebhookUrl) {
      const teamsPayload: TeamsWebhookPayload = {
        type: "message",
        attachments: [{
          contentType: "application/vnd.microsoft.card.adaptive",
          content: {
            type: "AdaptiveCard",
            body: [
              {
                type: "TextBlock",
                text: `New Form Submission: ${formId}`
              },
              {
                type: "ColumnSet",
                columns: Object.entries(formData).map(([key, value]) => ({
                  type: "Column",
                  width: "auto",
                  items: [
                    {
                      type: "TextBlock",
                      text: `**${key}:** ${value}`
                    }
                  ]
                }))
              }
            ]
          }
        }]
      }

      const teamsResponse = await fetch(teamsWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(teamsPayload),
      })

      if (!teamsResponse.ok) {
        console.error('Teams webhook failed:', await teamsResponse.text())
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        submissionId: submission.id,
        message: 'Form submitted successfully' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Form processing error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})