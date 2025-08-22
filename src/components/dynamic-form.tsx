import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { FormDefinition } from "@/lib/forms";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { HelpButton } from "@/components/ui/popover";
import { AIButton } from "@/components/ui/ai-button";
import { Disclosure } from "@/components/ui/disclosure";
import { LinksInput } from "@/components/ui/links-input";
import { EmailsInput } from "@/components/ui/emails-input";
import { getAISuggestions } from "@/lib/ai-assistance";
import type { AISuggestions } from "@/lib/ai-assistance";
import { ArrowLeft, CheckCircle } from "lucide-react";

interface DynamicFormProps {
  form: FormDefinition;
  onBack: () => void;
}

export function DynamicForm({ form, onBack }: DynamicFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestions, setAISuggestions] = useState<
    Record<string, AISuggestions>
  >({});
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(form.schema as never),
    mode: "onChange", // Enable validation on change for real-time feedback
  });

  const handleAIAssistance = async (fieldName: string) => {
    const formValues = watch();
    const context = {
      background: formValues.background,
      objectives: formValues.objectives,
    };

    const suggestions = await getAISuggestions(context);
    setAISuggestions((prev) => ({
      ...prev,
      [fieldName]: suggestions,
    }));

    // Auto-select suggested options for better UX
    const currentValue = watch(fieldName) || [];
    const newSelections = [
      ...new Set([...currentValue, ...suggestions.suggestedOptions]),
    ];
    setValue(fieldName, newSelections);
  };

  const onSubmit = async (data: unknown) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const { error: submitError } = await supabase.from("form_data").insert({
        data: {
          formId: form.id,
          formTitle: form.title,
          responses: data,
          submittedAt: new Date().toISOString(),
        } as never,
        created_by: user?.id,
      });

      if (submitError) throw submitError;

      setIsSubmitted(true);
      reset();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting the form"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Form Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for your submission.
              </p>
              <Button onClick={onBack} className="w-full">
                Back to Forms
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center gap-2 mr-4"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {form.title}
              </h1>
              <p className="text-sm text-gray-600">{form.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>{form.title}</CardTitle>
            <CardDescription>{form.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-700">
                  {error}
                </div>
              )}

              {form.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  {field.type === "disclosure" ? (
                    <Disclosure
                      content={field.content || []}
                      variant={field.variant}
                      label={field.label}
                    />
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={field.name}>
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        <div className="flex items-center gap-2">
                          {field.aiAssistance && (
                            <AIButton
                              onAssist={() => handleAIAssistance(field.name)}
                              disabled={
                                !watch("background") && !watch("objectives")
                              }
                            />
                          )}
                          {(field.help || field.examples) && (
                            <HelpButton
                              help={field.help}
                              examples={field.examples}
                            />
                          )}
                        </div>
                      </div>

                      {field.type === "textarea" ? (
                        <textarea
                          id={field.name}
                          className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder={field.placeholder}
                          {...register(field.name)}
                        />
                      ) : field.type === "select" ? (
                        <select
                          id={field.name}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          {...register(field.name)}
                        >
                          <option value="">Please select...</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                      ) : field.type === "multiselect" ? (
                        <MultiSelect
                          options={field.options || []}
                          value={watch(field.name) || []}
                          onChange={(value) => setValue(field.name, value)}
                          placeholder={field.placeholder}
                          allowCustom={field.allowCustom}
                          includeNotSure={field.includeNotSure}
                          suggestedOptions={
                            aiSuggestions[field.name]?.suggestedOptions || []
                          }
                          customSuggestions={
                            aiSuggestions[field.name]?.customSuggestions || []
                          }
                        />
                      ) : field.type === "links" ? (
                        <LinksInput
                          value={watch(field.name) || []}
                          onChange={(links) => setValue(field.name, links)}
                          placeholder={field.placeholder}
                        />
                      ) : field.type === "emails" ? (
                        <EmailsInput
                          value={watch(field.name) || []}
                          onChange={(emails) => setValue(field.name, emails)}
                          placeholder={field.placeholder}
                        />
                      ) : (
                        <Input
                          id={field.name}
                          type={field.type}
                          placeholder={field.placeholder}
                          {...register(field.name)}
                        />
                      )}

                      {errors[field.name] && (
                        <p className="text-sm text-red-600">
                          {errors[field.name]?.message as string}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ))}

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <div className="flex-1">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="w-full"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Form"}
                  </Button>
                  {!isValid &&
                    !isSubmitting &&
                    Object.keys(errors).length > 0 && (
                      <p className="text-sm text-gray-500 mt-1 text-center">
                        Please fix the errors above to submit
                      </p>
                    )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
