// Service Worker for FocusFlow - Enhanced Version
const CACHE_NAME = "focusflow-cache-v2"
const STATIC_CACHE_NAME = "focusflow-static-v2"
const DATA_CACHE_NAME = "focusflow-data-v2"

// Assets to cache immediately
const STATIC_ASSETS = [
  "/",
  "/timer",
  "/notes",
  "/offline",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
  "/favicon.ico"
]

// Install event - cache assets with improved strategy
self.addEventListener("install", (event) => {
  // Skip waiting to activate the new service worker immediately
  self.skipWaiting()
  
  // More robust caching strategy that won't fail if a single resource fails
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Caching static assets')
      
      // Use a more resilient approach instead of cache.addAll
      // This will continue caching even if some resources fail
      return Promise.allSettled(
        STATIC_ASSETS.map(url => {
          return fetch(url)
            .then(response => {
              // Only cache valid responses (status in the 200 range)
              if (!response.ok) {
                throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
              }
              return cache.put(url, response);
            })
            .catch(error => {
              console.warn(`Failed to cache ${url}: ${error.message}`);
              // Don't reject the whole caching process for one failure
              return null;
            });
        })
      ).then(results => {
        // Log caching results for debugging
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        console.log(`Successfully cached ${successful} out of ${STATIC_ASSETS.length} assets. Failed: ${failed}`);
        return true; // Ensure the promise resolves successfully
      });
    }).catch(error => {
      console.error('Service worker installation failed:', error);
    })
  );
})

// Activate event - clean up old caches with improved strategy
self.addEventListener("activate", (event) => {
  // Claim clients to control all open tabs immediately
  event.waitUntil(clients.claim())
  
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME &&
            cacheName !== DATA_CACHE_NAME
          ) {
            console.log('Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        }).filter(Boolean)
      )
    })
  )
})

// Fetch event - implement stale-while-revalidate strategy for better performance
self.addEventListener("fetch", (event) => {
  // Skip cross-origin requests and non-HTTP/HTTPS requests
  if (!event.request.url.startsWith(self.location.origin) || 
      !event.request.url.startsWith('http')) {
    return
  }

  // Skip chrome-extension URLs
  if (event.request.url.startsWith('chrome-extension://')) {
    return
  }

  // Handle API requests separately with network-first strategy
  if (event.request.url.includes("/api/")) {
    event.respondWith(networkFirstStrategy(event.request))
    return
  }

  // For navigation requests, use network-first but update in background
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match("/offline")
        })
    )
    return
  }
  
  // For all other requests, use stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Clone the request for the fetch call
      const fetchRequest = event.request.clone()
      
      // Return cached response immediately, then update cache in background
      const fetchPromise = fetch(fetchRequest)
        .then(networkResponse => {
          // Check if we received a valid response
          if (
            !networkResponse || 
            networkResponse.status !== 200 || 
            networkResponse.type !== 'basic'
          ) {
            return networkResponse
          }
          
          // Clone the response to store in cache
          const responseToCache = networkResponse.clone()
          
          caches.open(STATIC_CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache)
          })
          
          return networkResponse
        })
        .catch(() => {
          // If fetch fails and we're offline, try to serve from cache
          // This is already handled by returning cachedResponse first
          console.log('Fetch failed, already serving from cache if available')
        })
      
      return cachedResponse || fetchPromise
    })
  )
})

// Network-first strategy for API requests
async function networkFirstStrategy(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request)
    const cacheCopy = networkResponse.clone()
    
    // Update the cache in the background
    caches.open(DATA_CACHE_NAME).then(cache => {
      cache.put(request, cacheCopy)
    })
    
    return networkResponse
  } catch (error) {
    // If network fails, try cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // If nothing in cache for API, return a JSON error
    return new Response(JSON.stringify({ error: 'Network error, offline mode' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 503
    })
  }
}

// Handle sync events for offline data with improved implementation
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    event.waitUntil(syncTasks())
  } else if (event.tag === "sync-notes") {
    event.waitUntil(syncNotes())
  } else if (event.tag === "sync-all") {
    event.waitUntil(Promise.all([syncTasks(), syncNotes()]))
  }
})

// Handle push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return
  
  const data = event.data.json()
  const options = {
    body: data.body || 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    data: {
      url: data.url || '/'
    },
    actions: data.actions || []
  }
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'FocusFlow', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  
  // Handle action buttons if clicked
  if (event.action) {
    // Handle specific actions
    console.log('Notification action clicked:', event.action)
    return
  }
  
  // Default behavior - open the app
  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Check if there is already a window/tab open with the target URL
        const matchingClient = windowClients.find(client => {
          return client.url.includes(urlToOpen)
        })
        
        // If so, focus it
        if (matchingClient) {
          return matchingClient.focus()
        }
        
        // If not, open a new window/tab
        return clients.openWindow(urlToOpen)
      })
  )
})

// Sync tasks when back online with improved implementation
async function syncTasks() {
  try {
    const tasksToSync = await getTasksToSync()

    if (tasksToSync.length > 0) {
      // In a real app, you would send these to your server
      console.log("Syncing tasks:", tasksToSync)
      
      // Simulate API call
      const response = await fetch('/api/tasks/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: tasksToSync }),
      }).catch(() => null)
      
      if (response && response.ok) {
        // Clear the sync queue after successful sync
        await clearTaskSyncQueue()
        return true
      } else {
        // Retry later
        return false
      }
    }
    return true
  } catch (error) {
    console.error('Error syncing tasks:', error)
    return false
  }
}

// Sync notes when back online with improved implementation
async function syncNotes() {
  try {
    const notesToSync = await getNotesToSync()

    if (notesToSync.length > 0) {
      // In a real app, you would send these to your server
      console.log("Syncing notes:", notesToSync)
      
      // Simulate API call
      const response = await fetch('/api/notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: notesToSync }),
      }).catch(() => null)
      
      if (response && response.ok) {
        // Clear the sync queue after successful sync
        await clearNoteSyncQueue()
        return true
      } else {
        // Retry later
        return false
      }
    }
    return true
  } catch (error) {
    console.error('Error syncing notes:', error)
    return false
  }
}

// Helper functions for sync with improved IndexedDB implementation
async function getTasksToSync() {
  // In a real app, you would get this from IndexedDB
  try {
    // This is a placeholder - in a real app we'd use IndexedDB
    return JSON.parse(localStorage.getItem('tasksToSync') || '[]')
  } catch (error) {
    console.error('Error getting tasks to sync:', error)
    return []
  }
}

async function getNotesToSync() {
  // In a real app, you would get this from IndexedDB
  try {
    // This is a placeholder - in a real app we'd use IndexedDB
    return JSON.parse(localStorage.getItem('notesToSync') || '[]')
  } catch (error) {
    console.error('Error getting notes to sync:', error)
    return []
  }
}

async function clearTaskSyncQueue() {
  // In a real app, you would clear the sync queue in IndexedDB
  try {
    localStorage.removeItem('tasksToSync')
  } catch (error) {
    console.error('Error clearing task sync queue:', error)
  }
}

async function clearNoteSyncQueue() {
  // In a real app, you would clear the sync queue in IndexedDB
  try {
    localStorage.removeItem('notesToSync')
  } catch (error) {
    console.error('Error clearing note sync queue:', error)
  }
}
