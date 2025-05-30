import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  header?: React.ReactNode
  footer?: React.ReactNode
}

export const Card: React.FC<CardProps> = ({ children, className, header, footer }) => {
  return (
    <div className={cn('bg-white rounded-lg shadow-sm', className)}>
      {header && <div className="border-b border-gray-200 px-6 py-4">{header}</div>}
      <div className="p-6">{children}</div>
      {footer && (
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-lg">{footer}</div>
      )}
    </div>
  )
}
