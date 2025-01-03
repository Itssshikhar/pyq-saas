'use client'

import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { HelpCircle, Star, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarToggle,
  useSidebar,
} from '@/components/ui/sidebar'

export default function SidebarComponent() {
  const { user, signOutUser } = useAuth()
  const { collapsed } = useSidebar()

  if (!user) return null

  return (
    <Sidebar className="border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <SidebarHeader className="border-b border-gray-200 dark:border-gray-800">
        <div className={cn(
          "flex items-center space-x-3 transition-all duration-300 ease-in-out",
          collapsed && "space-x-0"
        )}>
          <Avatar className={cn(
            "transition-all duration-300",
            collapsed ? "h-8 w-8" : "h-10 w-10"
          )}>
            <AvatarImage src={user.photoURL || ''} />
            <AvatarFallback>{user.displayName?.[0] || 'U'}</AvatarFallback>
          </Avatar>
          <div className={cn(
            "flex flex-col transition-all duration-300 overflow-hidden",
            collapsed && "w-0 opacity-0"
          )}>
            <span className="font-medium text-gray-900 dark:text-white truncate">{user.displayName}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <div className="space-y-2">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start transition-all duration-300 text-gray-600 dark:text-gray-300",
              collapsed && "px-2"
            )}
          >
            <Star className={cn(
              "mr-2 h-4 w-4 transition-all duration-300",
              collapsed && "mr-0"
            )} />
            <span className={cn(
              "transition-all duration-300",
              collapsed && "w-0 opacity-0 hidden"
            )}>
              Course Enrollment
            </span>
          </Button>
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start transition-all duration-300 text-gray-600 dark:text-gray-300",
              collapsed && "px-2"
            )}
          >
            <HelpCircle className={cn(
              "mr-2 h-4 w-4 transition-all duration-300",
              collapsed && "mr-0"
            )} />
            <span className={cn(
              "transition-all duration-300",
              collapsed && "w-0 opacity-0 hidden"
            )}>
              Need Help
            </span>
          </Button>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all duration-300",
            collapsed && "px-2"
          )}
          onClick={signOutUser}
        >
          <LogOut className={cn(
            "mr-2 h-4 w-4 transition-all duration-300",
            collapsed && "mr-0"
          )} />
          <span className={cn(
            "transition-all duration-300",
            collapsed && "w-0 opacity-0 hidden"
          )}>
            Logout
          </span>
        </Button>
      </SidebarFooter>

      <SidebarToggle />
    </Sidebar>
  )
}
