import { HttpError } from './HttpError.js'

const realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Cloudinary creates an AI-edited image the first time its URL is requested. It answers 423 while it is still working.
// Requesting the URL here makes the work happen on the server, so the browser gets a finished image.
export const waitForDerived = async (url, { fetchFn = fetch, sleep = realSleep, attempts = 8, delayMs = 3000 } = {}) => {
  for (let i = 0; i < attempts; i++) {
    let res
    try {
      res = await fetchFn(url, { signal: AbortSignal.timeout(60_000) })
    } catch {
      throw new HttpError(502, 'Object removal could not reach the image service. Please try again.')
    }
    if (res.ok) { await res.body?.cancel?.(); return }
    if (res.status === 423 && i < attempts - 1) { await sleep(delayMs); continue } // still processing
    console.warn(JSON.stringify({ level: 'warn', msg: 'derived image failed', status: res.status, reason: res.headers.get('x-cld-error') }))
    throw new HttpError(502, 'Object removal failed. Try a clearer photo or a different object name.')
  }
  throw new HttpError(504, 'Object removal is taking too long. Please try again.')
}
