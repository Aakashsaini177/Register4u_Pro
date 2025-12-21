import React from 'react'
import { cn } from '@/lib/utils'

export const Loading = ({ className, size = 'default' }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    default: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }
  
  return (
    <div className="flex items-center justify-center">
      <div
        className={cn(
          'animate-spin rounded-full border-primary-600 dark:border-primary-400 border-t-transparent',
          sizes[size],
          className
        )}
      />
    </div>
  )
}

export const PageLoading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="text-center">
        {/* Animated Logo Loader */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          {/* Outer rotating ring */}
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-900 rounded-full animate-spin"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 dark:border-t-primary-400 rounded-full animate-spin"></div>
          
          {/* Inner pulsing circle */}
          <div className="absolute inset-3 bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 rounded-full animate-pulse flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
        </div>
        
        {/* Loading text with dots animation */}
        <div className="flex items-center justify-center gap-1">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">Loading</p>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
        
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait...</p>
      </div>
    </div>
  )
}

export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex space-x-4">
          {[...Array(columns)].map((_, j) => (
            <div
              key={j}
              className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// Full Page Loader with Brand
export const FullPageLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated circles */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer circle 1 */}
          <div className="absolute inset-0 border-8 border-blue-200 dark:border-blue-900 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-transparent border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin" style={{ animationDuration: '1s' }}></div>
          
          {/* Outer circle 2 */}
          <div className="absolute inset-2 border-8 border-purple-200 dark:border-purple-900 rounded-full"></div>
          <div className="absolute inset-2 border-8 border-transparent border-t-purple-600 dark:border-t-purple-400 rounded-full animate-spin" style={{ animationDuration: '1.5s', animationDirection: 'reverse' }}></div>
          
          {/* Inner gradient circle with icon */}
          <div className="absolute inset-6 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 dark:from-blue-600 dark:via-purple-600 dark:to-pink-600 rounded-full animate-pulse flex items-center justify-center shadow-lg">
            <svg className="w-12 h-12 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
        </div>
        
        {/* Loading text with animated dots */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            {message}
          </h2>
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-pink-600 dark:bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Please wait while we load your data...</p>
        
        {/* Progress bar */}
        <div className="w-64 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-6 mx-auto">
          <div className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 rounded-full animate-shimmer-progress"></div>
        </div>
      </div>
    </div>
  )
}

