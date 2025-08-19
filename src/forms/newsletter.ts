import { z } from 'zod'
import type { FormDefinition } from '@/lib/forms'

export const newsletterForm: FormDefinition = {
  id: 'newsletter',
  title: 'Newsletter Signup',
  description: 'Subscribe to our newsletter for updates',
  schema: z.object({
    email: z.string().email('Please enter a valid email address'),
    firstName: z.string().min(1, 'First name is required'),
    interests: z.string().min(1, 'Please select your interests'),
    frequency: z.string().min(1, 'Please select your preferred frequency'),
  }),
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      placeholder: 'Enter your first name',
      required: true,
    },
    {
      name: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'Enter your email address',
      required: true,
    },
    {
      name: 'interests',
      label: 'Areas of Interest',
      type: 'select',
      options: ['Technology', 'Business', 'Design', 'Marketing', 'General News'],
      required: true,
    },
    {
      name: 'frequency',
      label: 'Email Frequency',
      type: 'select',
      options: ['Daily', 'Weekly', 'Bi-weekly', 'Monthly'],
      required: true,
    },
  ],
}