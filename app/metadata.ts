import type { Metadata, Viewport } from "next"

export const metadata: Metadata = {
  title: "FocusFlow",
  description: "Manage tasks based on your energy levels and boost productivity",
  generator: 'v0.dev',
  applicationName: 'FocusFlow',
  keywords: ['productivity', 'focus', 'tasks', 'energy', 'pomodoro', 'notes'],
  authors: [{ name: 'FocusFlow Team' }],
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' }
  ]
}
