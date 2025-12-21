import React from 'react'
import { cn } from '@/lib/utils'

const Badge = ({ className, variant = 'default', children, ...props }) => {
  const variants = {
    default: 'bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-300',
    success: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
    warning: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
    danger: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
    secondary: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    info: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
    destructive: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200',
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export { Badge }

