import { useState } from 'react'
import { Plus, X, ExternalLink } from 'lucide-react'
import { Button } from './button'
import { Input } from './input'

interface LinksInputProps {
  value: string[]
  onChange: (links: string[]) => void
  placeholder?: string
  className?: string
}

export function LinksInput({ 
  value = [], 
  onChange, 
  placeholder = "https://example.com",
  className = ""
}: LinksInputProps) {
  const [newLink, setNewLink] = useState("")

  const addLink = () => {
    if (newLink.trim() && !value.includes(newLink.trim())) {
      onChange([...value, newLink.trim()])
      setNewLink("")
    }
  }

  const removeLink = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLink()
    }
  }

  const isValidUrl = (url: string) => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Existing links */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((link, index) => (
            <div 
              key={index}
              className="flex items-center gap-2 p-2 bg-gray-50 rounded-md border"
            >
              <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <a
                href={isValidUrl(link) ? link : `https://${link}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-blue-600 hover:text-blue-800 hover:underline truncate"
                title={link}
              >
                {link}
              </a>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeLink(index)}
                className="p-1 h-auto text-gray-400 hover:text-red-500"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add new link */}
      <div className="flex gap-2">
        <Input
          type="url"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          onClick={addLink}
          disabled={!newLink.trim()}
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {newLink && !isValidUrl(newLink) && !newLink.includes('.') && (
        <p className="text-xs text-gray-500">
          💡 Tip: Include the full URL (e.g., https://example.com)
        </p>
      )}
    </div>
  )
}