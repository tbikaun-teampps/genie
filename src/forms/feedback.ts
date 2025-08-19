import { z } from 'zod'
import type { FormDefinition } from '@/lib/forms'

export const feedbackForm: FormDefinition = {
  id: 'feedback',
  title: 'Feedback Form',
  description: 'Share your feedback with us',
  schema: z.object({
    rating: z.string().min(1, 'Please select a rating'),
    category: z.string().min(1, 'Please select a category'),
    feedback: z.string().min(5, 'Feedback must be at least 5 characters'),
  }),
  fields: [
    {
      name: 'rating',
      label: 'Rating',
      type: 'select',
      options: ['1 - Poor', '2 - Fair', '3 - Good', '4 - Great', '5 - Excellent'],
      required: true,
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      options: ['Product', 'Service', 'Support', 'Website', 'Other'],
      required: true,
    },
    {
      name: 'feedback',
      label: 'Your Feedback',
      type: 'textarea',
      placeholder: 'Tell us what you think...',
      required: true,
    },
  ],
}