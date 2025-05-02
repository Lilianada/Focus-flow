import { Suspense } from "react"
import { PomodoroTimer } from "@/components/pomodoro-timer"
import { Skeleton } from "@/components/ui/skeleton"

export default function TimerPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense
        fallback={
          <div className="container mx-auto flex min-h-screen flex-col items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="flex flex-col items-center p-6 space-y-6">
                <Skeleton className="h-20 w-40 rounded-md" />
                <Skeleton className="h-16 w-32 rounded-md" />
                <div className="flex space-x-4">
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        }
      >
        <PomodoroTimer />
      </Suspense>
    </div>
  )
}
