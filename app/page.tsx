import { Suspense } from "react"
import Dashboard from "@/components/dashboard"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="p-4">
          <header className="mb-8">
            <Skeleton className="h-8 w-32 mb-2 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </header>

          <div className="mb-6 space-y-4">
            <Skeleton className="h-10 w-full rounded-md" />
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-8 w-24 rounded-md" />
              <Skeleton className="h-8 w-32 rounded-md" />
              <Skeleton className="h-8 w-28 rounded-md" />
            </div>
          </div>

          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </div>
      }
    >
      <Dashboard />
    </Suspense>
  )
}
