// These functions are simplified to avoid server-side localStorage access
export async function syncTasks() {
  try {
    return { success: true }
  } catch (error) {
    console.error("Error syncing tasks:", error)
    throw error
  }
}

export async function syncNotes() {
  try {
    return { success: true }
  } catch (error) {
    console.error("Error syncing notes:", error)
    throw error
  }
}

export async function saveTimerSession() {
  try {
    return { success: true }
  } catch (error) {
    console.error("Error saving timer session:", error)
    throw error
  }
}
