import { useState } from "react";
import { Plus, X, Mail } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

interface EmailsInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function EmailsInput({
  value = [],
  onChange,
  placeholder = "name@example.com",
  className = "",
}: EmailsInputProps) {
  const [newEmail, setNewEmail] = useState("");

  const addEmail = () => {
    if (
      newEmail.trim() &&
      isValidEmail(newEmail.trim()) &&
      !value.includes(newEmail.trim())
    ) {
      onChange([...value, newEmail.trim()]);
      setNewEmail("");
    }
  };

  const removeEmail = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addEmail();
    }
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Existing emails */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((email, index) => (
            <div
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border"
            >
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span
                className="flex-1 text-sm text-gray-700 truncate"
                title={email}
              >
                {email}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeEmail(index)}
                className="p-1 h-auto text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new email */}
      <div className="flex gap-2">
        <Input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addEmail}
          disabled={!newEmail.trim()}
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {newEmail && !isValidEmail(newEmail) && (
        <p className="text-xs text-gray-500">
          💡 Tip: Enter a valid email address (e.g., name@example.com)
        </p>
      )}
    </div>
  );
}
