import test from 'node:test'
import assert from 'node:assert/strict'
import { createFlux } from '../services/cloudflare.js'

const res = (status, body, headers = {}) => ({
  ok: status >= 200 && status < 300, status,
  headers: { get: (k) => headers[k.toLowerCase()] ?? null },
  json: async () => body, text: async () => JSON.stringify(body ?? ''),
  arrayBuffer: async () => Buffer.from('raw-image'),
})
const make = (responses, extra = {}) => {
  const calls = []
  const fetchFn = async (url, opts) => { calls.push({ url, opts }); const r = responses.shift(); if (r instanceof Error) throw r; return r }
  const flux = createFlux({ accountId: 'acc', token: 'tok', fetchFn, sleep: async () => {}, ...extra })
  return { flux, calls }
}
const originalWarn = console.warn
test.before(() => { console.warn = () => {} })
test.after(() => { console.warn = originalWarn })

test('decodes the base64 image from the JSON reply', async () => {
  const { flux, calls } = make([res(200, { result: { image: Buffer.from('hello').toString('base64') } })])
  assert.equal((await flux('a cat')).toString(), 'hello')
  assert.ok(calls[0].url.includes('/accounts/acc/ai/run/@cf/black-forest-labs/flux-1-schnell'))
  assert.equal(calls[0].opts.headers.Authorization, 'Bearer tok')
})

test('accepts a raw image reply too', async () => {
  const { flux } = make([res(200, null, { 'content-type': 'image/png' })])
  assert.equal((await flux('a cat')).toString(), 'raw-image')
})

test('the free allowance being used up fails at once with a clear message', async () => {
  const { flux, calls } = make([res(429, { errors: [{ code: 4006 }] })])
  await assert.rejects(flux('x'), { status: 429, message: /allowance is used up/ })
  assert.equal(calls.length, 1)
})

test('retries temporary server errors, then succeeds', async () => {
  const { flux, calls } = make([res(503, {}), res(200, { result: { image: Buffer.from('ok').toString('base64') } })])
  assert.equal((await flux('x')).toString(), 'ok')
  assert.equal(calls.length, 2)
})

test('a bad token is reported as a configuration problem, without retrying', async () => {
  const { flux, calls } = make([res(401, {})])
  await assert.rejects(flux('x'), { status: 503, message: /not configured/ })
  assert.equal(calls.length, 1)
})

test('network failures are retried and then reported', async () => {
  const { flux, calls } = make([new Error('down'), new Error('down'), new Error('down')])
  await assert.rejects(flux('x'), { status: 503 })
  assert.equal(calls.length, 3)
})

test('missing credentials give a clear message', async () => {
  const flux = createFlux({ accountId: '', token: '' })
  await assert.rejects(flux('x'), { status: 503, message: /not set up/ })
})
