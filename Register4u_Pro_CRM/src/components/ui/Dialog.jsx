import React from 'react'
import { cn } from '@/lib/utils'
import { XMarkIcon } from '@heroicons/react/24/outline'

const Dialog = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-auto">
        {children}
      </div>
    </div>
  )
}

const DialogHeader = ({ className, children, onClose, ...props }) => (
  <div className={cn('flex items-center justify-between p-6 border-b', className)} {...props}>
    <div className="flex-1">{children}</div>
    {onClose && (
      <button
        onClick={onClose}
        className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <XMarkIcon className="h-5 w-5" />
      </button>
    )}
  </div>
)

const DialogTitle = ({ className, ...props }) => (
  <h2
    className={cn('text-lg font-semibold text-gray-900', className)}
    {...props}
  />
)

const DialogContent = ({ className, ...props }) => (
  <div className={cn('p-6', className)} {...props} />
)

const DialogFooter = ({ className, ...props }) => (
  <div
    className={cn('flex items-center justify-end gap-3 p-6 border-t bg-gray-50', className)}
    {...props}
  />
)

export { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter }

