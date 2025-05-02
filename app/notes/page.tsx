import { Suspense } from "react"
import { Notes } from "@/components/notes"
import { Skeleton } from "@/components/ui/skeleton"

export default function NotesPage() {
  return (
    <div className="p-4">
      <header className="mb-8">
        <h1 className="text-xl font-bold">Notes</h1>
        <p className="text-muted-foreground">Leave notes for your tomorrow self</p>
      </header>

      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-md" />
            ))}
          </div>
        }
      >
        <Notes />
      </Suspense>
    </div>
  )
}
