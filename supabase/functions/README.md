# Supabase Edge Functions

This directory contains the Edge Functions for the Genie application.

## Available Functions

- **ai-assistance** - AI-powered form assistance using Anthropic's Claude API
- **process-form** - Form submission processing with JSONB storage and Teams notifications
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
# For AI assistance function
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
supabase functions deploy ai-assistance
supabase functions deploy process-form
supabase functions deploy teams-webhook
```

## Local Development

Start local development server:
```bash
supabase functions serve
```

Serve a specific function:
```bash
supabase functions serve ai-assistance --env-file .env.local
```

## Testing

Test the AI assistance function:
```bash
curl -X POST 'http://localhost:54321/functions/v1/ai-assistance' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"message": "Help me fill out a contact form"}'
```

Test the form processing function:
```bash
curl -X POST 'http://localhost:54321/functions/v1/process-form' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"formId": "contact", "formData": {"name": "John", "email": "john@example.com"}, "userId": "user-123"}'
```