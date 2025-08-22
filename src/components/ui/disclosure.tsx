import { Info, AlertTriangle, CheckCircle } from 'lucide-react'

interface DisclosureProps {
  content: string[]
  variant?: 'info' | 'warning' | 'success'
  label?: string
}

export function Disclosure({ content, variant = 'info', label }: DisclosureProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
      default:
        return <Info className="h-5 w-5 text-blue-600 flex-shrink-0" />
    }
  }

  return (
    <div className={`rounded-lg border p-4 ${getVariantStyles()}`}>
      <div className="flex gap-3">
        {getIcon()}
        <div className="flex-1">
          {label && (
            <h4 className="font-medium mb-2">{label}</h4>
          )}
          <div className="space-y-1">
            {content.map((line, index) => (
              <p key={index} className="text-sm leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}