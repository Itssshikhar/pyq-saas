'use client'

import { Switch } from '@/components/ui/switch'
import { useTheme } from 'next-themes'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSidebar } from '@/components/ui/sidebar'

export function TopBar() {
  const { theme, setTheme } = useTheme()
  const { toggleSidebar } = useSidebar()

  return (
    <div className="h-14 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between bg-white dark:bg-gray-900">
      <Button variant="ghost" size="icon" onClick={toggleSidebar}>
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Toggle Sidebar</span>
      </Button>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">Dark Mode</span>
        <Switch
          checked={theme === 'dark'}
          onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
        />
      </div>
    </div>
  )
}

