"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { WifiOff, Home, FileText, Timer, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useCallback } from "react"

export default function OfflinePage() {
  // Function to attempt reconnection - memoized to prevent unnecessary re-renders
  const attemptReconnect = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md shadow-lg animate-in fade-in-50 duration-500">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-muted rounded-full w-16 h-16 flex items-center justify-center mb-4">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">You're Offline</CardTitle>
          <CardDescription className="text-muted-foreground">
            It looks like you're not connected to the internet.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-6">
            Don't worry, you can still access your tasks and notes that were previously loaded.
            Some features may be limited until your connection is restored.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-6">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2 h-auto py-4">
                <Home className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Tasks</span>
                  <span className="text-xs text-muted-foreground">View your tasks</span>
                </div>
              </Button>
            </Link>
            <Link href="/notes" className="w-full">
              <Button variant="outline" className="w-full flex items-center gap-2 h-auto py-4">
                <FileText className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Notes</span>
                  <span className="text-xs text-muted-foreground">Access your notes</span>
                </div>
              </Button>
            </Link>
            <Link href="/timer" className="w-full col-span-2">
              <Button variant="outline" className="w-full flex items-center gap-2 h-auto py-4">
                <Timer className="h-5 w-5" />
                <div className="flex flex-col items-start">
                  <span className="font-medium">Timer</span>
                  <span className="text-xs text-muted-foreground">Use the Pomodoro timer</span>
                </div>
              </Button>
            </Link>
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={attemptReconnect} 
            className="w-full flex items-center gap-2"
            variant="default"
          >
            <RefreshCw className="h-4 w-4" />
            Check Connection
          </Button>
        </CardFooter>
      </Card>
      <p className="text-sm text-muted-foreground mt-8">
        FocusFlow works offline thanks to Progressive Web App technology
      </p>
    </div>
  )
}
