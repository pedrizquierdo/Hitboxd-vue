import { io } from 'socket.io-client'
import { logger } from '@/utils/logger'

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  withCredentials: true,
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
})

// Reset on each connect so a future expiry can trigger refresh again
let refreshAttempted = false

socket.on('connect', () => {
  refreshAttempted = false
  logger.log('[socket] connected', socket.id)
})

socket.on('disconnect', (reason) => {
  logger.log('[socket] disconnected', reason)
})

socket.on('connect_error', async (err) => {
  logger.error('[socket] connect_error', err.message)

  if (err.message === 'unauthorized' && !refreshAttempted) {
    refreshAttempted = true
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      })
      if (res.ok) {
        socket.connect()
      }
    } catch {
      // refresh failed — socket will not loop (refreshAttempted stays true)
    }
  }
})

export function connectSocket() {
  refreshAttempted = false
  if (!socket.connected) {
    socket.connect()
  }
}

export function disconnectSocket() {
  socket.disconnect()
}

export { socket }
