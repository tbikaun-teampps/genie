// Auto-export all forms
export { contactForm } from "./contact";
export { feedbackForm } from "./feedback";
export { surveyForm } from "./survey";
export { newsletterForm } from "./newsletter";
export { marketingRequestForm } from "./marketing-request";

// Form registry - automatically collects all exported forms
// import { contactForm } from "./contact";
// import { feedbackForm } from "./feedback";
// import { surveyForm } from "./survey";
// import { newsletterForm } from "./newsletter";
import { marketingRequestForm } from "./marketing-request";
import type { FormDefinition } from "@/lib/forms";

export const allForms: FormDefinition[] = [
  // contactForm,
  // feedbackForm,
  // surveyForm,
  // newsletterForm,
  marketingRequestForm,
];
