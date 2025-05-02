'use client'

import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  text?: string
  fullScreen?: boolean
}

export function Loading({
  className,
  size = 'md',
  text = 'Loading...',
  fullScreen = false,
}: LoadingProps) {
  const sizeClass = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  }

  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-2', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClass[size])} />
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    )
  }

  return content
}
