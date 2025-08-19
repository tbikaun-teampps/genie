import { z } from "zod";

export interface FormDefinition {
  id: string;
  title: string;
  description: string;
  schema: z.ZodSchema;
  fields: FormField[];
}

export interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "number" | "textarea" | "select" | "multiselect";
  placeholder?: string;
  options?: string[];
  required?: boolean;
  allowCustom?: boolean;
  includeNotSure?: boolean;
  help?: string[];
  examples?: string[];
  aiAssistance?: boolean;
}