"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { OfflineBanner } from "@/components/offline-banner"
import { ServiceWorkerRegistration } from "@/components/service-worker"
import { useState, useEffect } from "react"
import { GeistSans, GeistMono } from 'geist/font'
import { ClientOnly } from "@/components/client-only"
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use state for sidebar with a client-only wrapper to prevent hydration mismatch
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Use state to track if we're mounted on the client
  const [mounted, setMounted] = useState(false)
  
  // Set mounted to true after hydration
  useEffect(() => {
    setMounted(true)
  }, [])
  
  return (
    // suppressHydrationWarning helps avoid console errors for minor mismatches
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head />
      <body className="font-sans antialiased">
        {/* ThemeProvider already handles hydration correctly */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen justify-center bg-background transition-colors duration-300">
            <div className="flex w-full max-w-4xl border-x border-border">
              {/* Wrap components that depend on client-side state in ClientOnly */}
              <ClientOnly>
                {/* Mobile Header - only visible on mobile */}
                <MobileHeader 
                  onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                  isSidebarOpen={sidebarOpen}
                />
              </ClientOnly>
              
              {/* Responsive Sidebar */}
              <ClientOnly>
                <Sidebar 
                  isOpen={sidebarOpen} 
                  onClose={() => setSidebarOpen(false)} 
                />
              </ClientOnly>
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
            </div>
          </div>
          <Toaster />
          <ClientOnly>
            <OfflineBanner />
          </ClientOnly>
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  )
}
