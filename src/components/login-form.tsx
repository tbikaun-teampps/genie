import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { MicrosoftIcon } from "./microsoft-icon";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [azureLoading, setAzureLoading] = useState(false);
  const { signInWithAzure } = useAuth();

  const handleAzureLogin = async () => {
    setAzureLoading(true);
    setError(null);

    try {
      await signInWithAzure();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAzureLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Click below to login with your Microsoft account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            {error && (
              <div className="p-3 text-sm bg-red-50 border border-red-200 rounded-md text-red-700">
                {error}
              </div>
            )}

            <Button 
              onClick={handleAzureLogin} 
              className="w-full bg-[#0078d4] hover:bg-[#106ebe] text-white border-0 h-12 text-base font-medium" 
              disabled={azureLoading}
            >
              {azureLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Redirecting to Microsoft...
                </>
              ) : (
                <>
                  <MicrosoftIcon className="mr-2 h-5 w-5" />
                  Continue with Microsoft
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
