"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function Analytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Simple page view tracking
    const url = pathname + searchParams.toString()
    // Analytics implementation would go here
    console.log(`Page view: ${url}`)
  }, [pathname, searchParams])

  return null
}
