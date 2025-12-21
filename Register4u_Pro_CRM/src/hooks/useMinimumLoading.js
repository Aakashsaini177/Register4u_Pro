import { useState, useCallback } from 'react'

/**
 * Custom hook to ensure minimum loading time
 * This makes sure loader is visible even for fast API calls
 * 
 * @param {number} minimumTime - Minimum time in milliseconds (default: 500ms)
 * @returns {[boolean, function]} - [isLoading, withMinimumLoading]
 */
export const useMinimumLoading = (minimumTime = 500) => {
  const [isLoading, setIsLoading] = useState(false)
  
  const withMinimumLoading = useCallback(async (asyncFunction) => {
    const startTime = Date.now()
    setIsLoading(true)
    
    try {
      const result = await asyncFunction()
      
      // Calculate remaining time to show loader
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(minimumTime - elapsedTime, 0)
      
      // Wait for remaining time before hiding loader
      await new Promise(resolve => setTimeout(resolve, remainingTime))
      
      return result
    } catch (error) {
      // Still show loader for minimum time even on error
      const elapsedTime = Date.now() - startTime
      const remainingTime = Math.max(minimumTime - elapsedTime, 0)
      await new Promise(resolve => setTimeout(resolve, remainingTime))
      
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [minimumTime])
  
  return [isLoading, withMinimumLoading]
}

