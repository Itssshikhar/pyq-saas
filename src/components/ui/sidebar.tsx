"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

const SIDEBAR_WIDTH = "240px"
const SIDEBAR_COLLAPSED_WIDTH = "64px"

type SidebarContextValue = {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | undefined>(
  undefined
)

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

interface SidebarProviderProps {
  children: React.ReactNode
  defaultCollapsed?: boolean
}

export function SidebarProvider({
  children,
  defaultCollapsed = false,
}: SidebarProviderProps) {
  const [collapsed, setCollapsed] = React.useState(defaultCollapsed)

  const toggleSidebar = React.useCallback(() => {
    setCollapsed((prev) => !prev)
  }, [])

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

const sidebarVariants = cva(
  "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out overflow-hidden",
  {
    variants: {
      collapsed: {
        true: "w-[64px]",
        false: "w-[240px]",
      },
    },
    defaultVariants: {
      collapsed: false,
    },
  }
)

interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsible?: boolean
}

export const SidebarComponent = React.forwardRef<HTMLDivElement, SidebarProps>(
  ({ className, collapsible = true, ...props }, ref) => {
    const { collapsed, setCollapsed } = useSidebar()
    const isDesktop = useMediaQuery("(min-width: 768px)")

    React.useEffect(() => {
      if (!isDesktop) {
        setCollapsed(true)
      }
    }, [isDesktop, setCollapsed])

    return (
      <div
        ref={ref}
        className={cn(sidebarVariants({ collapsed }), className)}
        {...props}
      />
    )
  }
)
SidebarComponent.displayName = "Sidebar"

const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { collapsed } = useSidebar()
  return (
    <div 
      ref={ref} 
      className={cn(
        "p-4 transition-all duration-300 ease-in-out",
        collapsed && "p-2",
        className
      )} 
      {...props} 
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { collapsed } = useSidebar()
  return (
    <div 
      ref={ref} 
      className={cn(
        "px-3 py-2 transition-all duration-300 ease-in-out",
        collapsed && "px-2",
        className
      )} 
      {...props} 
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const { collapsed } = useSidebar()
  return (
    <div 
      ref={ref} 
      className={cn(
        "mt-auto p-4 transition-all duration-300 ease-in-out",
        collapsed && "p-2",
        className
      )} 
      {...props} 
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarToggle = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { collapsed, setCollapsed } = useSidebar()

  return (
    <button
      ref={ref}
      onClick={() => setCollapsed(!collapsed)}
      className={cn(
        "absolute -right-3 top-6 z-40 rounded-full border bg-background p-2 text-muted-foreground",
        className
      )}
      {...props}
    >
      <Slot>{collapsed ? ">" : "<"}</Slot>
    </button>
  )
})
SidebarToggle.displayName = "SidebarToggle"

export {
  SidebarComponent as Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarToggle,
}

