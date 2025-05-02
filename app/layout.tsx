"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { MobileHeader } from "@/components/mobile-header"
import { OfflineBanner } from "@/components/offline-banner"
import { ServiceWorkerRegistration } from "@/components/service-worker"
import { useState } from "react"
import { GeistSans, GeistMono } from 'geist/font'
import "./globals.css"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head />
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen justify-center bg-background transition-colors duration-300">
            <div className="flex w-full max-w-4xl border-x border-border">
              {/* Mobile Header - only visible on mobile */}
              <MobileHeader 
                onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
                isSidebarOpen={sidebarOpen}
              />
              
              {/* Responsive Sidebar */}
              <Sidebar 
                isOpen={sidebarOpen} 
                onClose={() => setSidebarOpen(false)} 
              />
              
              {/* Main Content */}
              <main className="flex-1 overflow-auto pt-14 md:pt-0">{children}</main>
            </div>
          </div>
          <Toaster />
          <OfflineBanner />
          <ServiceWorkerRegistration />
        </ThemeProvider>
      </body>
    </html>
  )
}
