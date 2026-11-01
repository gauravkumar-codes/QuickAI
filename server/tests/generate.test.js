import test from 'node:test'
import assert from 'node:assert/strict'
import { createGenerate } from '../utils/generate.js'

const err = (status) => Object.assign(new Error(`status ${status}`), { status })

// Fake clock: sleeping advances time instantly, so tests run fast.
const setup = (script, opts = {}) => {
  let t = 0
  const sleeps = []
  const calls = []
  const call = async (model) => {
    calls.push(model)
    const step = script.shift()
    if (step instanceof Error) throw step
    return step ?? { text: 'ok' }
  }
  const generate = createGenerate({ call, now: () => t, sleep: async (ms) => { sleeps.push(ms); t += ms }, log: () => {}, ...opts })
  return { generate, calls, sleeps }
}

test('returns on the first success', async () => {
  const { generate, calls } = setup([{ text: 'hi' }])
  assert.deepEqual(await generate(['main', 'lite'], []), { text: 'hi' })
  assert.deepEqual(calls, ['main'])
})

test('busy main model falls back to the second model right away', async () => {
  const { generate, calls, sleeps } = setup([err(503), { text: 'from lite' }])
  assert.equal((await generate(['main', 'lite'], [])).text, 'from lite')
  assert.deepEqual(calls, ['main', 'lite'])
  assert.deepEqual(sleeps, [])
})

test('waits between rounds (5s, 15s) when every model is busy, then succeeds', async () => {
  const { generate, calls, sleeps } = setup([err(503), err(503), err(503), err(503), { text: 'finally' }])
  assert.equal((await generate(['main', 'lite'], [])).text, 'finally')
  assert.deepEqual(sleeps, [5000, 15000])
  assert.equal(calls.length, 5)
})

test('does not retry errors that waiting cannot fix', async () => {
  const { generate, calls } = setup([err(400)])
  await assert.rejects(generate(['main', 'lite'], []), { status: 400 })
  assert.equal(calls.length, 1)
})

test('skips a model that does not exist for this key (404)', async () => {
  const { generate, calls } = setup([err(404), { text: 'lite works' }, ])
  assert.equal((await generate(['main', 'lite'], [])).text, 'lite works')
  assert.deepEqual(calls, ['main', 'lite'])
})

test('throws the first error when all rounds fail', async () => {
  const script = Array.from({ length: 20 }, () => err(503))
  const { generate, sleeps } = setup(script)
  await assert.rejects(generate(['main'], []), { status: 503 })
  assert.deepEqual(sleeps, [5000, 15000, 30000, 60000])
})

test('stops at the overall deadline', async () => {
  const script = Array.from({ length: 20 }, () => err(503))
  const { generate, sleeps } = setup(script, { maxMs: 10_000, waits: [5, 15] })
  await assert.rejects(generate(['main'], []), { status: 503 })
  assert.deepEqual(sleeps, [5000]) // the 15s wait would pass the deadline, so it gives up
})

test('gives up after repeated 429 (possible daily quota)', async () => {
  const script = Array.from({ length: 20 }, () => err(429))
  const { generate, calls } = setup(script)
  await assert.rejects(generate(['main', 'lite'], []), { status: 429 })
  assert.equal(calls.length, 3)
})

test('a daily or zero quota fails at once, keeping the real message', async () => {
  const quotaErr = Object.assign(new Error('You exceeded your current quota. limit: 0, model: x'), { status: 429 })
  const { generate, calls, sleeps } = setup([quotaErr])
  await assert.rejects(generate(['main', 'lite'], []), /limit: 0/)
  assert.equal(calls.length, 1)
  assert.deepEqual(sleeps, [])
})
