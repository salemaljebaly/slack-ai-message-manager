import React from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react'

interface AlertProps {
  variant?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  children: React.ReactNode
  onClose?: () => void
  className?: string
}

const alertVariants = {
  info: {
    container: 'bg-blue-50 border-blue-200',
    icon: <Info className="text-blue-600" size={20} />,
    title: 'text-blue-800',
    content: 'text-blue-700',
  },
  success: {
    container: 'bg-green-50 border-green-200',
    icon: <CheckCircle className="text-green-600" size={20} />,
    title: 'text-green-800',
    content: 'text-green-700',
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200',
    icon: <AlertTriangle className="text-yellow-600" size={20} />,
    title: 'text-yellow-800',
    content: 'text-yellow-700',
  },
  error: {
    container: 'bg-red-50 border-red-200',
    icon: <AlertCircle className="text-red-600" size={20} />,
    title: 'text-red-800',
    content: 'text-red-700',
  },
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  onClose,
  className,
}) => {
  const variantStyles = alertVariants[variant]

  return (
    <div className={cn('relative rounded-lg border p-4', variantStyles.container, className)}>
      <div className="flex">
        <div className="flex-shrink-0">{variantStyles.icon}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className={cn('text-sm font-medium', variantStyles.title)}>{title}</h3>}
          <div className={cn('text-sm', variantStyles.content, title && 'mt-2')}>{children}</div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-3 inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        )}
      </div>
    </div>
  )
}
