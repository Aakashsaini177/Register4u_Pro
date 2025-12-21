import React, { useEffect } from 'react'
import { useThemeStore } from '@/store/themeStore'

const ThemeProvider = ({ children }) => {
  const theme = useThemeStore((state) => state.theme)
  
  useEffect(() => {
    // Apply theme on mount
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])
  
  return <>{children}</>
}

export default ThemeProvider

