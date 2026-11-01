import { useAuth } from '@clerk/react'
import { demo } from './demo'

const BASE = import.meta.env.VITE_BASE_URL // e.g. http://localhost:3000 ; unset = demo mode
const REQUEST_LIMIT_MS = 330_000 // a little longer than the server's own 4.5 minute cap

// api(path) does a GET, api(path, body) does a POST (JSON or FormData). Clerk token attached.
export const useApi = () => {
  const { getToken } = useAuth()
  return async (path, body) => {
    if (!BASE) { await new Promise((r) => setTimeout(r, 1000)); return demo(path, body) }
    const isForm = body instanceof FormData
    const isGet = body === undefined
    let res
    try {
      res = await fetch(BASE + path, {
        method: isGet ? 'GET' : 'POST',
        headers: { Authorization: `Bearer ${await getToken()}`, ...(isForm || isGet ? {} : { 'Content-Type': 'application/json' }) },
        ...(isGet ? {} : { body: isForm ? body : JSON.stringify(body) }),
        signal: AbortSignal.timeout(REQUEST_LIMIT_MS),
      })
    } catch (e) {
      throw new Error(e.name === 'TimeoutError'
        ? 'The request took too long. Please try again.'
        : 'Cannot reach the server. Check that it is running and VITE_BASE_URL is correct.', { cause: e })
    }
    const data = await res.json().catch(() => ({}))
    if (!data.success) throw new Error(data.message || 'Request failed')
    return data
  }
}
