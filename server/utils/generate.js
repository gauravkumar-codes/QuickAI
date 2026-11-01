import { HttpError } from './HttpError.js'
import { withTimeout } from './withTimeout.js'

// Patient retry for overloaded AI models:
//  - each round tries every model in order (so a lighter fallback model can answer while the main one is busy)
//  - between rounds it waits 5s, 15s, 30s, 60s
//  - the whole request is capped at 4.5 minutes
//  - errors that retrying cannot fix (bad request, bad key) fail immediately
const RETRYABLE = new Set([429, 500, 502, 503, 504])
const WAITS_SECONDS = [5, 15, 30, 60]
const MAX_QUOTA_HITS = 3 // a 429 may be a quota, so don't keep waiting on it
// A daily or zero quota will not clear by waiting, so fail at once and keep Google's real message
const isHardQuota = (err) => err.status === 429 && /PerDay|limit:\s*0/i.test(String(err.message))

const realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const logRetry = (info) => console.warn(JSON.stringify({ level: 'warn', msg: 'ai retry', ...info }))

export const createGenerate = ({ call, sleep = realSleep, now = Date.now, waits = WAITS_SECONDS, maxMs = 270_000, log = logRetry }) =>
  async (models, contents, config) => {
    const deadline = now() + maxMs
    const alive = [...new Set(models.filter(Boolean))]
    let firstErr
    let quotaHits = 0

    for (let round = 0; round <= waits.length; round++) {
      for (const model of [...alive]) {
        const remaining = deadline - now()
        if (remaining <= 0) throw firstErr ?? new HttpError(504, 'The AI took too long to respond. Try again.')
        try {
          return await withTimeout(call(model, contents, config), remaining)
        } catch (err) {
          firstErr ??= err
          log({ model, status: err.status, round })
          if (err.status === 404) { alive.splice(alive.indexOf(model), 1); continue } // model not available to this key
          if (isHardQuota(err)) throw err
          if (err.status === 429 && ++quotaHits >= MAX_QUOTA_HITS) throw err
          if (!RETRYABLE.has(err.status)) throw err
        }
      }
      if (!alive.length || round === waits.length) break
      const wait = waits[round] * 1000
      if (deadline - now() <= wait) break
      await sleep(wait)
    }
    throw firstErr
  }

// The Gemini client is loaded lazily so this file can be tested without the SDK installed.
const geminiCall = async (model, contents, config) => {
  const { ai } = await import('../config/gemini.js')
  return ai.models.generateContent({ model, contents, config })
}
export const generate = createGenerate({ call: geminiCall })
