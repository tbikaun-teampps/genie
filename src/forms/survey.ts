import { z } from 'zod'
import type { FormDefinition } from '@/lib/forms'

export const surveyForm: FormDefinition = {
  id: 'survey',
  title: 'Customer Survey',
  description: 'Help us understand your needs',
  schema: z.object({
    age: z.string().min(1, 'Please enter your age'),
    occupation: z.string().min(2, 'Please enter your occupation'),
    experience: z.string().min(1, 'Please select your experience level'),
    suggestions: z.string().optional(),
  }),
  fields: [
    {
      name: 'age',
      label: 'Age',
      type: 'number',
      placeholder: 'Enter your age',
      required: true,
    },
    {
      name: 'occupation',
      label: 'Occupation',
      type: 'text',
      placeholder: 'Enter your occupation',
      required: true,
    },
    {
      name: 'experience',
      label: 'Experience Level',
      type: 'select',
      options: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true,
    },
    {
      name: 'suggestions',
      label: 'Additional Suggestions',
      type: 'textarea',
      placeholder: 'Any suggestions for improvement?',
      required: false,
    },
  ],
}