'use client'

import { useTheme } from 'next-themes'
import { useAuth } from '@/hooks/useAuth'
import { HelpCircle, Star, LogOut } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function Sidebar() {
  const { theme, setTheme } = useTheme()
  const { user, signOutUser } = useAuth()

  return (
    <div className="w-64 h-screen border-r bg-white dark:bg-gray-800">
      {user && (
        <div className="flex flex-col h-full">
          {/* User Profile */}
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3 white:text-black">
              <Avatar>
                <AvatarImage src={user.photoURL || ''} />
                <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-gray-900 dark:text-white">{user.displayName}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">{user.email}</span>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4 space-y-4">
            <div className="space-y-1">
              <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300">
                <Star className="mr-2 h-4 w-4" />
                Course Enrollment
              </Button>
              <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-300">
                <HelpCircle className="mr-2 h-4 w-4" />
                Need Help
              </Button>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="p-4 border-t space-y-4">
            <div className="text-black flex items-center justify-between">
              <span className='text-gray-900 dark:text-white'>Dark Mode</span>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'white')}
              />
            </div>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
              onClick={signOutUser}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

