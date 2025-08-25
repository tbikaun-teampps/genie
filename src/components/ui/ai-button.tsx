import { useState } from "react";
import { Wand2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "./button";

interface AIButtonProps {
  onAssist: () => Promise<void>;
  disabled?: boolean;
}

type AIState = "idle" | "loading" | "success" | "error";

export function AIButton({ onAssist, disabled = false }: AIButtonProps) {
  const [state, setState] = useState<AIState>("idle");

  const handleClick = async () => {
    if (state === "loading" || disabled) return;

    setState("loading");

    try {
      await onAssist();
      setState("success");
      // Reset to idle after success feedback
      setTimeout(() => setState("idle"), 2000);
    } catch (error) {
      setState("error");
      // Reset to idle after error feedback
      setTimeout(() => setState("idle"), 3000);
    }
  };

  const getIcon = () => {
    switch (state) {
      case "loading":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Wand2 className="h-4 w-4" />;
    }
  };

  const getText = () => {
    switch (state) {
      case "loading":
        return "Analyzing...";
      case "success":
        return "Suggestions added!";
      case "error":
        return "Try again";
      default:
        return "AI Assist";
    }
  };

  const getVariant = () => {
    switch (state) {
      case "success":
        return "default" as const;
      case "error":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  };

  return (
    <Button
      type="button"
      variant={getVariant()}
      size="sm"
      onClick={handleClick}
      disabled={disabled || state === "loading"}
      className="flex items-center gap-2 text-sm"
    >
      {getIcon()}
      {getText()}
    </Button>
  );
}
