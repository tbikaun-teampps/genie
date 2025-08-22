// Auto-export all forms
export { marketingRequestForm } from "./marketing-request";

// Form registry - automatically collects all exported forms
import { marketingRequestForm } from "./marketing-request";
import type { FormDefinition } from "@/lib/forms";

export const allForms: FormDefinition[] = [
  // contactForm,
  // feedbackForm,
  // surveyForm,
  // newsletterForm,
  marketingRequestForm,
];
