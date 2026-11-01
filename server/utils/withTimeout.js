import { HttpError } from './HttpError.js'

// Rejects with a clear message after `ms`, and always clears its timer.
export const withTimeout = (promise, ms) => new Promise((resolve, reject) => {
  const timer = setTimeout(() => reject(new HttpError(504, 'The AI took too long to respond. Try again.')), ms)
  promise.then((v) => { clearTimeout(timer); resolve(v) }, (e) => { clearTimeout(timer); reject(e) })
})
