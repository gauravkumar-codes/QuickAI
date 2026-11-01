import { HttpError } from '../utils/HttpError.js'

const MODEL = '@cf/black-forest-labs/flux-1-schnell'
const realSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Text-to-image with Cloudflare Workers AI (FLUX.1 schnell). Retries only temporary server errors.
// A factory so it can be tested without the network.
export const createFlux = ({ accountId, token, fetchFn = fetch, sleep = realSleep, waits = [3000, 8000] }) => async (prompt) => {
  if (!accountId || !token) throw new HttpError(503, 'Image generation is not set up on this server yet.')
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${MODEL}`

  for (let attempt = 0; ; attempt++) {
    let res
    try {
      res = await fetchFn(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, steps: 4 }),
        signal: AbortSignal.timeout(60_000),
      })
    } catch {
      if (attempt < waits.length) { await sleep(waits[attempt]); continue }
      throw new HttpError(503, 'The image service is unreachable right now. Please try again.')
    }

    if (res.ok) {
      if ((res.headers.get('content-type') || '').startsWith('image/')) return Buffer.from(await res.arrayBuffer())
      const data = await res.json().catch(() => ({}))
      if (!data?.result?.image) throw new HttpError(502, 'The image service returned no image. Try again.')
      return Buffer.from(data.result.image, 'base64')
    }

    const body = await res.text().catch(() => '')
    console.warn(JSON.stringify({ level: 'warn', msg: 'image service error', status: res.status, body: body.slice(0, 500) }))
    if (res.status === 429) throw new HttpError(429, 'The free image allowance is used up for now. It resets at 00:00 UTC.')
    if (res.status === 401 || res.status === 403) throw new HttpError(503, 'Image generation is not configured correctly.')
    if (res.status >= 500 && attempt < waits.length) { await sleep(waits[attempt]); continue }
    throw new HttpError(res.status >= 500 ? 503 : 502, 'The image service could not create that image. Try rewording the description.')
  }
}

export const generateImage = (prompt) =>
  createFlux({ accountId: process.env.CLOUDFLARE_ACCOUNT_ID, token: process.env.CLOUDFLARE_API_TOKEN })(prompt)
