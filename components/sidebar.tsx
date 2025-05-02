"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { motion, AnimatePresence } from "framer-motion"

type NavItem = {
  href: string
  label: string
  icon: keyof typeof Icons
  shortcut?: string
}

interface SidebarProps {
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isMobile = false, isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const isMobileView = useMediaQuery("(max-width: 768px)")

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Define navigation items
  const navItems: NavItem[] = [
    {
      href: "/",
      label: "Tasks",
      icon: "home",
      shortcut: "Alt+1"
    },
    {
      href: "/timer",
      label: "Timer",
      icon: "timer",
      shortcut: "Alt+2"
    },
    {
      href: "/notes",
      label: "Notes",
      icon: "fileText",
      shortcut: "Alt+3"
    }
  ]

  // Add keyboard shortcuts
  useEffect(() => {
    if (!mounted) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey) {
        switch (e.key) {
          case "1":
            window.location.href = "/"
            break
          case "2":
            window.location.href = "/timer"
            break
          case "3":
            window.location.href = "/notes"
            break
          case "e":
            if (!isMobileView) {
              setExpanded(prev => !prev)
            }
            break
          case "m":
            // Toggle mobile menu with Alt+M
            if (isMobileView && onClose) {
              onClose()
            }
            break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [mounted, isMobileView, onClose])
  
  // Handle clicks outside sidebar on mobile
  useEffect(() => {
    if (!isMobileView || !isOpen) return
    
    const handleClickOutside = (e: MouseEvent) => {
      // Close sidebar when clicking outside on mobile
      if (onClose) {
        onClose()
      }
    }
    
    // Add a small delay to avoid closing immediately when opening
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 100)
    
    return () => {
      clearTimeout(timer)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMobileView, isOpen, onClose])

  if (!mounted) {
    return <div className="hidden md:flex w-16 flex-col border-r bg-background"></div>
  }

  // Common sidebar structure (content)
  const sidebarContent = (isForMobile: boolean = false) => (
    <>
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link href="/" className="flex items-center justify-center gap-2">
          <Icons.logo className="h-6 w-6" />
          {(expanded || isForMobile) && <span className="font-semibold">FocusFlow</span>}
        </Link>
        {/* Show close button on mobile at the top */}
        {isForMobile && onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-9 w-9"
            aria-label="Close menu"
          >
            <Icons.close className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-auto py-6">
        <nav className="grid gap-4 px-2">
          <TooltipProvider delayDuration={300}>
            {navItems.map((item) => {
              const Icon = Icons[item.icon]
              const isActive = pathname === item.href
              
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>
                    <Link href={item.href} passHref>
                      <Button
                        variant="ghost"
                        size={(expanded || isForMobile) ? "default" : "icon"}
                        className={cn(
                          "rounded-md transition-all",
                          (expanded || isForMobile) ? "justify-start w-full" : "h-10 w-10",
                          isActive && "bg-accent"
                        )}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                      >
                        <Icon className={cn("h-5 w-5", (expanded || isForMobile) && "mr-2")} />
                        {(expanded || isForMobile) && <span>{item.label}</span>}
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  {!(expanded || isForMobile) && (
                    <TooltipContent side="right">
                      <div className="flex flex-col">
                        <span>{item.label}</span>
                        {item.shortcut && (
                          <span className="text-xs text-muted-foreground">{item.shortcut}</span>
                        )}
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>
      </div>
      <div className="border-t p-2 flex items-center justify-center">
        {/* Only show theme toggle on desktop */}
        {!isMobileView && <ThemeToggle />}
      </div>
    </>
  );


  return (
    <>
      {/* Mobile Sidebar with Framer Motion */}
      <AnimatePresence>
        {isMobileView && isOpen && (
          <motion.div
            key="mobile-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", ease: "easeInOut", duration: 0.3 }}
            className={cn(
              "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-background shadow-lg"
            )}
            aria-modal="true" 
            role="dialog"
          >
            {sidebarContent(true)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div 
        className={cn(
          "hidden md:flex flex-col border-r bg-background transition-all duration-300 ease-in-out",
          // Desktop sidebar styling
          expanded ? "w-48" : "w-16",
        )}
      >
        {sidebarContent(false)}
      </div>
    </>
  )
}
