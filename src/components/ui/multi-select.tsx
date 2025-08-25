import { useState } from "react";
import type { KeyboardEvent } from "react";
import { X, Plus, Check, Trash2 } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

interface MultiSelectProps {
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  allowCustom?: boolean;
  includeNotSure?: boolean;
  className?: string;
  suggestedOptions?: string[];
  customSuggestions?: string[];
}

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Select options...",
  allowCustom = false,
  includeNotSure = false,
  className = "",
  suggestedOptions = [],
  customSuggestions = [],
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const allOptions = [
    ...options,
    ...customSuggestions,
    ...(includeNotSure ? ["I'm not sure"] : []),
  ];

  const handleToggleOption = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  };

  const handleAddCustom = () => {
    if (customInput.trim() && !value.includes(customInput.trim())) {
      onChange([...value, customInput.trim()]);
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  const handleCustomInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddCustom();
    } else if (e.key === "Escape") {
      setCustomInput("");
      setShowCustomInput(false);
    }
  };

  const removeValue = (valueToRemove: string) => {
    onChange(value.filter((v) => v !== valueToRemove));
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected values display */}
      <div
        className="min-h-[42px] w-full px-3 py-2 border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length === 0 ? (
          <span className="text-gray-500">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1">
            {value.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-sm"
              >
                {item}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeValue(item);
                  }}
                  className="hover:bg-blue-200 rounded-sm p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {allOptions.map((option) => {
            const isSuggested = suggestedOptions.includes(option);
            const isCustomSuggestion = customSuggestions.includes(option);
            const isNotSure = option === "I'm not sure";

            return (
              <div
                key={option}
                className={`flex items-center px-3 py-2 cursor-pointer ${
                  isSuggested
                    ? "bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-400"
                    : isCustomSuggestion
                    ? "bg-purple-50 hover:bg-purple-100 border-l-4 border-purple-400"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => handleToggleOption(option)}
              >
                <div className="flex items-center justify-center w-4 h-4 mr-2 border border-gray-300 rounded">
                  {value.includes(option) && (
                    <Check className="h-3 w-3 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <span className={isNotSure ? "italic text-gray-600" : ""}>
                    {option}
                  </span>
                  {isSuggested && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                      AI Suggested
                    </span>
                  )}
                  {isCustomSuggestion && (
                    <span className="ml-2 text-xs bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded">
                      AI Custom
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Clear all button */}
          {value.length > 0 && (
            <div className="border-t border-gray-200">
              <button
                type="button"
                className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 text-red-600"
                onClick={() => onChange([])}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear all (this will remove custom options)
              </button>
            </div>
          )}

          {allowCustom && (
            <div className="border-t border-gray-200">
              {!showCustomInput ? (
                <button
                  type="button"
                  className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 text-blue-600"
                  onClick={() => setShowCustomInput(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add custom option
                </button>
              ) : (
                <div className="p-3 space-y-2">
                  <Input
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    onKeyDown={handleCustomInputKeyDown}
                    placeholder="Enter custom option..."
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleAddCustom}
                      disabled={!customInput.trim()}
                    >
                      Add
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomInput("");
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
