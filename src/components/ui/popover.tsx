import { useState, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { HelpCircle, X } from 'lucide-react'
import { Button } from './button'
import { Tooltip } from './tooltip'

interface PopoverProps {
  content: ReactNode
  children?: ReactNode
  title?: string
}

export function Popover({ content, children, title }: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  return (
    <div className="relative inline-block">
      {children ? (
        <button
          ref={triggerRef}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center"
        >
          {children}
        </button>
      ) : (
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 h-auto text-gray-400 hover:text-gray-600"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      )}

      {isOpen && (
        <div
          ref={popoverRef}
          className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4"
          style={{ maxWidth: 'calc(100vw - 32px)' }}
        >
          <div className="flex items-start justify-between mb-3">
            {title && (
              <h4 className="font-medium text-gray-900 text-sm">{title}</h4>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="text-sm text-gray-600 space-y-2">
            {content}
          </div>
        </div>
      )}
    </div>
  )
}

interface HelpButtonProps {
  help?: string[]
  examples?: string[]
}

export function HelpButton({ help, examples }: HelpButtonProps) {
  if (!help && !examples) return null
  
  const content = (
    <div className="space-y-3">
      {help && help.length > 0 && (
        <div>
          <p className="mb-2 font-medium text-white">Help:</p>
          <ul className="list-disc pl-4 space-y-1">
            {help.map((item, index) => (
              <li key={index} className="text-sm text-gray-200">{item}</li>
            ))}
          </ul>
        </div>
      )}
      {examples && examples.length > 0 && (
        <div>
          <p className="mb-2 font-medium text-white">Examples:</p>
          <ul className="list-disc pl-4 space-y-1">
            {examples.map((example, index) => (
              <li key={index} className="text-sm text-gray-200">{example}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )

  return (
    <Tooltip content={content} position="left">
      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help" />
    </Tooltip>
  )
}