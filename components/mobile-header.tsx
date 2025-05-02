"use client"

import { Button } from "@/components/ui/button"
import { Icons } from "@/components/icons"
import { ThemeToggle } from "@/components/theme-toggle"
import Link from "next/link"

interface MobileHeaderProps {
  onMenuToggle: () => void
  isSidebarOpen: boolean
}

export function MobileHeader({ onMenuToggle, isSidebarOpen }: MobileHeaderProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 md:hidden">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        onClick={onMenuToggle}
        aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
      >
        {isSidebarOpen ? (
          <Icons.close className="h-5 w-5" />
        ) : (
          <Icons.menu className="h-5 w-5" />
        )}
      </Button>
      
      <Link href="/" className="flex items-center gap-2">
        <Icons.logo className="h-6 w-6" />
        <span className="font-semibold">FocusFlow</span>
      </Link>
      
      <ThemeToggle />
    </div>
  )
}
