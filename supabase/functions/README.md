# Supabase Edge Functions

This directory contains the Edge Functions for the Genie application.

## Available Functions

- **objective-measurements** - AI-powered KPI and measurement suggestions for marketing campaigns
- **ai-marketing-action-plan** - AI-generated marketing action plans and strategic recommendations  
- **process-form** - Form submission processing with JSONB storage and Teams notifications
- **send-marketing-email** - Marketing request email generation with embedded AI form summarization
- **teams-webhook** - Dedicated Teams webhook sender

## Setup

1. Install Supabase CLI if not already installed:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Environment Variables

Set the following secrets for your Supabase project:

```bash
# For AI functions (objective-measurements, marketing-action-plan, send-marketing-email)
supabase secrets set ANTHROPIC_API_KEY=your_anthropic_api_key_here

# For Teams notifications
supabase secrets set TEAMS_WEBHOOK_URL=your_teams_webhook_url_here
```

## Deployment

Deploy all functions:
```bash
supabase functions deploy
```

Deploy a specific function:
```bash
supabase functions deploy objective-measurements
supabase functions deploy ai-marketing-action-plan
supabase functions deploy process-form
supabase functions deploy send-marketing-email
supabase functions deploy teams-webhook
```

## Local Development

Start local development server:
```bash
supabase functions serve
```

Serve a specific function:
```bash
supabase functions serve objective-measurements --env-file .env.local
supabase functions serve ai-marketing-action-plan --env-file .env.local
```

## Testing

Test the objective measurements function:
```bash
curl -X POST 'http://localhost:54321/functions/v1/objective-measurements' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"type": "objective-measurements-suggestion", "context": "E-commerce website", "objectives": "Increase sales", "measurements": ["traffic"]}'
```

Test the marketing action plan function:
```bash
curl -X POST 'http://localhost:54321/functions/v1/ai-marketing-action-plan' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"type": "marketing-action-plan", "formContent": {"background": "New product launch", "objectives": "Generate awareness"}}'
```

Test the form processing function:
```bash
curl -X POST 'http://localhost:54321/functions/v1/process-form' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"formId": "contact", "formData": {"name": "John", "email": "john@example.com"}, "userId": "user-123"}'
```