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
              className="w-full" 
              disabled={azureLoading}
            >
              {azureLoading ? "Redirecting..." : "Login with Microsoft"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
