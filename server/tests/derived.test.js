import test from 'node:test'
import assert from 'node:assert/strict'
import { waitForDerived } from '../utils/waitForDerived.js'

const res = (status, headers = {}) => ({ ok: status === 200, status, headers: { get: (k) => headers[k.toLowerCase()] ?? null }, body: { cancel: async () => {} } })
const run = (responses, opts = {}) => {
  const sleeps = []
  const fetchFn = async () => { const r = responses.shift(); if (r instanceof Error) throw r; return r }
  return { sleeps, promise: waitForDerived('https://x/y', { fetchFn, sleep: async (ms) => { sleeps.push(ms) }, ...opts }) }
}
const originalWarn = console.warn
test.before(() => { console.warn = () => {} })
test.after(() => { console.warn = originalWarn })

test('returns as soon as the edited image is ready', async () => {
  const { promise, sleeps } = run([res(200)])
  await promise
  assert.deepEqual(sleeps, [])
})

test('waits while Cloudinary is still processing (423), then succeeds', async () => {
  const { promise, sleeps } = run([res(423), res(423), res(200)])
  await promise
  assert.deepEqual(sleeps, [3000, 3000])
})

test('reports a failure with a helpful message', async () => {
  const { promise } = run([res(400, { 'x-cld-error': 'Could not find object' })])
  await assert.rejects(promise, { status: 502, message: /different object name/ })
})

test('gives up if it never finishes', async () => {
  const { promise } = run(Array.from({ length: 5 }, () => res(423)), { attempts: 3 })
  await assert.rejects(promise, { status: 502 }) // last attempt is not retried, so it reports a failure
})

test('network errors are reported clearly', async () => {
  const { promise } = run([new Error('boom')])
  await assert.rejects(promise, { status: 502, message: /could not reach/ })
})
