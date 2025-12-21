import React from 'react'
import { useThemeStore } from '@/store/themeStore'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import { Button } from './ui/Button'

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore()
  
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative"
      title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
      ) : (
        <SunIcon className="h-5 w-5 text-yellow-500" />
      )}
    </Button>
  )
}

export default ThemeToggle

