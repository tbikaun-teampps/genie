import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { HelpButton } from "@/components/ui/popover";
import { AIButton } from "@/components/ui/ai-button";
import { Disclosure } from "@/components/ui/disclosure";
import { LinksInput } from "@/components/ui/links-input";
import { EmailsInput } from "@/components/ui/emails-input";
import { getObjectiveMeasurementsSuggestions } from "@/lib/ai-assistance";
import type { ObjectiveMeasurementsOutput } from "@/types/ai-assistance";
import { sendMarketingRequestEmail } from "@/lib/email";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { demoData } from "./demo-data";
import { ObjectiveMeasurementOptions } from "@/config/data";

const marketingRequestSchema = z.object({
  background: z
    .string()
    .min(10, "Please provide background context (minimum 10 characters)"),
  objectives: z
    .string()
    .min(10, "Please describe the objectives (minimum 10 characters)"),
  measurement: z
    .array(z.string())
    .min(1, "Please select at least one measurement method"),
  ccEmails: z
    .array(z.string().email("Please enter valid email addresses"))
    .optional(),
  contactEmail: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Contact email is required"),
  targeting: z
    .string()
    .min(10, "Please describe your target audience (minimum 10 characters)"),
  examples: z.string().optional(),
  exampleLinks: z.array(z.string().url("Please enter valid URLs")).optional(),
  actionSteps: z
    .string()
    .min(10, "Please describe expected action steps (minimum 10 characters)"),
  activityType: z.enum(["once-off", "broader-campaign"]),
  preferredChannels: z.array(z.string()).optional(),
  timeline: z.string().optional(),
  budget: z.string().optional(),
});

type MarketingRequestData = z.infer<typeof marketingRequestSchema>;

interface MarketingRequestFormProps {
  onBack: () => void;
}

export function MarketingRequestForm({ onBack }: MarketingRequestFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiSuggestions, setAISuggestions] = useState<
    Record<string, ObjectiveMeasurementsOutput>
  >({});
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm<MarketingRequestData>({
    resolver: zodResolver(marketingRequestSchema),
    mode: "onChange",
    defaultValues: {
      activityType: "once-off",
      contactEmail: user?.email || "",
    },
  });

  const handleAIAssistance = async (fieldName: string) => {
    try {
      const formValues = watch();
      const input = {
        context: formValues.background || "",
        objectives: formValues.objectives || "",
        measurements: formValues.measurement || [],
      };

      const suggestions = await getObjectiveMeasurementsSuggestions(input);
      setAISuggestions((prev) => ({
        ...prev,
        [fieldName]: suggestions,
      }));

      // Auto-select suggested options for better UX
      const currentValue = watch("measurement") || [];
      const newSelections = [
        ...new Set([...currentValue, ...suggestions.suggestedOptions]),
      ];
      setValue("measurement", newSelections);
    } catch (error) {
      console.error("Failed to get AI suggestions:", error);
      // Could add user-facing error handling here if needed
    }
  };

  const fillDemoData = () => {
    Object.entries(demoData).forEach(([key, value]) => {
      if (key in marketingRequestSchema.shape) {
        setValue(key as keyof MarketingRequestData, value as any);
      }
    });
  };

  const onSubmit = async (data: MarketingRequestData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Save to database
      const { error: submitError } = await supabase.from("form_data").insert({
        data: {
          formId: "marketing-request",
          formTitle: "Marketing Request",
          responses: data,
          submittedAt: new Date().toISOString(),
        } as never,
        created_by: user?.id,
      });

      if (submitError) throw submitError;

      // Send email notification - critical step, fail if email fails
      const emailResult = await sendMarketingRequestEmail({
        ...data,
        submittedBy: user?.email || "Unknown user",
        submittedAt: new Date().toISOString(),
      });

      if (!emailResult.success) {
        throw new Error(
          "Failed to send email notification. Please try again or contact admin."
        );
      }

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
                Form Submitted Successfully!
              </h2>
              <p className="text-gray-600 mb-6">
                Your marketing request has been submitted and email
                notifications have been sent. You should receive a confirmation
                copy shortly.
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
                Marketing Request
              </h1>
              <p className="text-sm text-gray-600">
                Submit a request for marketing activities and campaigns
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Marketing Request</CardTitle>
            <CardDescription>
              Submit a request for marketing activities and campaigns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {error && (
                <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-700">
                  {error}
                </div>
              )}

              {/* Background Information */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="background">
                    Background Information / Context / What would you like done?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <HelpButton
                    help={[
                      "Include relevant context like timeline, budget constraints, or previous efforts",
                      "Explain the business problem you're trying to solve",
                      "Mention any key stakeholders or departments involved",
                    ]}
                    examples={[
                      "We need to increase brand awareness for our new product launch",
                      "Generate more qualified leads for our B2B software",
                      "Drive more traffic to our e-commerce site during holiday season",
                      "Promote our upcoming webinar to IT professionals",
                    ]}
                  />
                </div>
                <textarea
                  id="background"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Provide background information and context for this marketing request..."
                  {...register("background")}
                />
                {errors.background && (
                  <p className="text-sm text-red-600">
                    {errors.background.message}
                  </p>
                )}
              </div>

              {/* Objectives */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="objectives">
                    What are the objectives that we need to meet?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <HelpButton
                    help={[
                      "Use SMART goals: Specific, Measurable, Achievable, Relevant, Time-bound",
                      "Be as specific as possible with numbers and timelines",
                      "Align objectives with overall business goals",
                    ]}
                    examples={[
                      "Increase website traffic by 25% within 3 months",
                      "Generate 100 qualified leads per month",
                      "Achieve 10,000 social media followers by Q4",
                      "Boost email open rates to 25%",
                    ]}
                  />
                </div>
                <textarea
                  id="objectives"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the specific objectives and goals. Please be as specific as possible. Consider using SMART goals..."
                  {...register("objectives")}
                />
                {errors.objectives && (
                  <p className="text-sm text-red-600">
                    {errors.objectives.message}
                  </p>
                )}
              </div>

              {/* Measurement */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>
                    How will we measure these objectives?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <AIButton
                      onAssist={() => handleAIAssistance("measurement")}
                      disabled={!watch("background") && !watch("objectives")}
                    />
                    <HelpButton
                      help={[
                        "Select multiple metrics that align with your objectives",
                        "Add custom metrics if needed",
                        "Choose 'I'm not sure' if you need guidance on measurement",
                      ]}
                      examples={[
                        "Awareness goals: Impressions, reach, brand mentions",
                        "Engagement goals: CTR, time on page, social shares",
                        "Lead generation: Conversion rate, cost per lead",
                        "Sales goals: Revenue, ROI, customer acquisition cost",
                      ]}
                    />
                  </div>
                </div>
                <MultiSelect
                  options={ObjectiveMeasurementOptions}
                  value={watch("measurement") || []}
                  onChange={(value) => setValue("measurement", value)}
                  placeholder="Select options..."
                  allowCustom={true}
                  includeNotSure={true}
                  suggestedOptions={
                    aiSuggestions.measurement?.suggestedOptions || []
                  }
                  customSuggestions={
                    aiSuggestions.measurement?.customSuggestions || []
                  }
                />
                {errors.measurement && (
                  <p className="text-sm text-red-600">
                    {errors.measurement.message}
                  </p>
                )}
              </div>

              {/* CC Emails */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Do you want to copy anyone in review/comments?</Label>
                  <HelpButton
                    help={[
                      "Add email addresses of people you want to CC for review and comments",
                      "These people will receive notifications about this marketing request",
                      "Optional - only add if you need specific stakeholders to be involved",
                    ]}
                  />
                </div>
                <EmailsInput
                  value={watch("ccEmails") || []}
                  onChange={(emails) => setValue("ccEmails", emails)}
                  placeholder="name@example.com"
                />
                {errors.ccEmails && (
                  <p className="text-sm text-red-600">
                    {errors.ccEmails.message}
                  </p>
                )}
              </div>

              {/* Targeting */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="targeting">
                    Who are we targeting with this marketing activity?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <HelpButton
                    help={[
                      "Consider demographics: age, gender, location, income",
                      "Include psychographics: interests, values, lifestyle",
                      "Mention behavioral patterns: buying habits, brand loyalty",
                      "For B2B: job titles, company size, industry",
                    ]}
                    examples={[
                      "Small business owners in tech, 25-45 years old",
                      "Marketing managers at companies with 50-500 employees",
                      "Parents with young children interested in healthy living",
                      "IT professionals at enterprise companies",
                    ]}
                  />
                </div>
                <textarea
                  id="targeting"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe your target audience, demographics, personas, etc..."
                  {...register("targeting")}
                />
                {errors.targeting && (
                  <p className="text-sm text-red-600">
                    {errors.targeting.message}
                  </p>
                )}
              </div>

              {/* Examples */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="examples">
                    Have you seen this marketing activity being used before?
                    (optional)
                  </Label>
                  <HelpButton
                    help={[
                      "This helps us understand your preferences and avoid reinventing the wheel",
                      "Describe what specifically you liked about the examples",
                      "Add any relevant links in the section below",
                    ]}
                    examples={[
                      "Competitor campaigns you admire",
                      "Industry case studies or best practices",
                      "Creative concepts or formats you've seen work well",
                      "Specific tactics or messaging approaches",
                    ]}
                  />
                </div>
                <textarea
                  id="examples"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe examples, creative concepts, or inspiration you've seen..."
                  {...register("examples")}
                />
              </div>

              {/* Example Links */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Reference Links</Label>
                  <HelpButton
                    help={[
                      "Add links to campaigns, case studies, or examples you mentioned above",
                      "Include any competitor examples or inspiration sources",
                      "Links help the team understand your vision better",
                    ]}
                    examples={[
                      "Campaign landing pages you admire",
                      "Competitor marketing examples",
                      "Industry articles or case studies",
                      "Creative portfolios or inspiration sites",
                    ]}
                  />
                </div>
                <LinksInput
                  value={watch("exampleLinks") || []}
                  onChange={(links) => setValue("exampleLinks", links)}
                  placeholder="https://example.com/campaign"
                />
                {errors.exampleLinks && (
                  <p className="text-sm text-red-600">
                    {errors.exampleLinks.message}
                  </p>
                )}
              </div>

              {/* Action Steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="actionSteps">
                    What are the expected action steps of your target persona
                    once they have been reached by this marketing activity?
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <HelpButton
                    help={[
                      "Map out the complete customer journey from awareness to conversion",
                      "Think about each step in the funnel",
                      "Consider what actions you want users to take at each stage",
                    ]}
                    examples={[
                      "See ad → Visit landing page → Download whitepaper → Schedule demo",
                      "Read email → Click to website → Add to cart → Purchase",
                      "View social post → Follow account → Sign up for newsletter",
                      "Watch video → Visit website → Request quote → Become customer",
                    ]}
                  />
                </div>
                <textarea
                  id="actionSteps"
                  className="w-full min-h-[100px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the customer journey and expected actions..."
                  {...register("actionSteps")}
                />
                {errors.actionSteps && (
                  <p className="text-sm text-red-600">
                    {errors.actionSteps.message}
                  </p>
                )}
              </div>

              {/* Activity Type */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>
                    Activity Type
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <HelpButton
                    help={[
                      "Select whether this is a one-time activity or a broader campaign",
                      "This helps us understand the scope and resources needed",
                    ]}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      id="once-off"
                      type="radio"
                      value="once-off"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      {...register("activityType")}
                    />
                    <Label
                      htmlFor="once-off"
                      className="text-sm font-normal flex-1"
                    >
                      Once off activity
                    </Label>
                    <HelpButton
                      help={[
                        "Single marketing pieces like one email, one social post, or one ad",
                        "Quick turnaround, focused execution",
                      ]}
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      id="broader-campaign"
                      type="radio"
                      value="broader-campaign"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      {...register("activityType")}
                    />
                    <Label
                      htmlFor="broader-campaign"
                      className="text-sm font-normal flex-1"
                    >
                      Broader targeted campaign (min. 3 different pieces)
                    </Label>
                    <HelpButton
                      help={[
                        "Comprehensive campaigns with multiple touchpoints",
                        "Coordinated messaging across different channels",
                        "Longer timeline, strategic planning required",
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Conditional fields for broader campaign */}
              {watch("activityType") === "broader-campaign" && (
                <>
                  {/* Preferred Channels */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>
                        Are there any specific mediums, channels you'd like to
                        use?
                      </Label>
                      <HelpButton
                        help={[
                          "Select the marketing channels that align with your target audience",
                          "Consider where your audience is most active",
                          "Add custom channels if your preferred option isn't listed",
                        ]}
                        examples={[
                          "B2B: LinkedIn, Email, Webinars, Industry events",
                          "B2C: Instagram, Facebook, Google Ads, Influencer partnerships",
                          "Mixed: Content marketing, SEO, PR, Direct mail",
                        ]}
                      />
                    </div>
                    <MultiSelect
                      options={[
                        "Email Marketing",
                        "Social Media (Organic)",
                        "Paid Social Media",
                        "Google Ads (Search)",
                        "Google Ads (Display)",
                        "Content Marketing",
                        "SEO",
                        "Webinars",
                        "Events/Trade Shows",
                        "PR/Media Relations",
                        "Direct Mail",
                        "Influencer Marketing",
                        "Partnerships",
                        "Retargeting/Remarketing",
                        "Video Marketing",
                      ]}
                      value={watch("preferredChannels") || []}
                      onChange={(value) => setValue("preferredChannels", value)}
                      placeholder="Select preferred channels..."
                      allowCustom={true}
                    />
                    {errors.preferredChannels && (
                      <p className="text-sm text-red-600">
                        {errors.preferredChannels.message}
                      </p>
                    )}
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="timeline">
                        What timeline are you expecting for this?
                      </Label>
                      <HelpButton
                        help={[
                          "Consider campaign planning, content creation, and execution phases",
                          "Factor in any key dates, product launches, or seasonal timing",
                          "Be realistic about the time needed for quality execution",
                        ]}
                        examples={[
                          "3 months (standard campaign)",
                          "6 weeks (quick turnaround)",
                          "Q2 2024 (quarterly campaign)",
                          "By end of year (annual goal)",
                          "Ongoing (evergreen campaign)",
                        ]}
                      />
                    </div>
                    <Input
                      id="timeline"
                      placeholder="e.g., 3 months, Q2 2024, by end of year"
                      {...register("timeline")}
                    />
                    {errors.timeline && (
                      <p className="text-sm text-red-600">
                        {errors.timeline.message}
                      </p>
                    )}
                  </div>

                  {/* Budget */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="budget">What is the budget?</Label>
                      <HelpButton
                        help={[
                          "Include total campaign budget including ad spend, content creation, and tools",
                          "Provide a range if exact amount isn't determined",
                          "Indicate if budget is monthly, quarterly, or total campaign",
                        ]}
                        examples={[
                          "$10,000 total campaign budget",
                          "$5k-15k (depending on scope)",
                          "$2,000/month for 6 months",
                          "TBD - need recommendations",
                          "Under $25,000",
                        ]}
                      />
                    </div>
                    <Input
                      id="budget"
                      placeholder="e.g., $10,000, $50k-100k, TBD"
                      {...register("budget")}
                    />
                    {errors.budget && (
                      <p className="text-sm text-red-600">
                        {errors.budget.message}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Contact Email */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="contactEmail">
                    Your Contact Email
                    <span className="text-red-500 ml-1">*</span>
                  </Label>
                  <HelpButton
                    help={[
                      "Your email address will be used for correspondence on this marketing request.",
                    ]}
                    examples={["your.work@company.com"]}
                  />
                </div>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="your.email@company.com"
                  {...register("contactEmail")}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-600">
                    {errors.contactEmail.message}
                  </p>
                )}
              </div>

              {/* Submission Info */}
              <Disclosure
                content={[
                  "Your marketing request will be automatically posted to the Marketing team's Microsoft Teams channel for review and assignment.",
                ]}
                variant="info"
                label="Before You Submit"
              />

              <div className="flex gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onBack}
                  className="flex-1"
                >
                  Cancel
                </Button>
                {import.meta.env.DEV && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={fillDemoData}
                    className="flex-shrink-0"
                  >
                    Fill Demo Data
                  </Button>
                )}
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
