import test from 'node:test'
import assert from 'node:assert/strict'
import { checkEnv } from '../config/env.js'
import { limitFor } from '../config/limits.js'

const good = {
  CLERK_PUBLISHABLE_KEY: 'pk_test_x', CLERK_SECRET_KEY: 'sk_test_x', GEMINI_API_KEY: 'k',
  DATABASE_URL: 'postgresql://u:p@host/db', CLOUDINARY_URL: 'cloudinary://key:secret@cloud',
}

test('a complete env has no problems', () => assert.deepEqual(checkEnv(good), []))

test('reports missing and malformed values', () => {
  assert.ok(checkEnv({ ...good, GEMINI_API_KEY: '' }).some((p) => p.includes('GEMINI_API_KEY')))
  assert.ok(checkEnv({ ...good, DATABASE_URL: "psql 'postgresql://x'" }).some((p) => p.includes('DATABASE_URL')))
  assert.ok(checkEnv({ ...good, CLERK_SECRET_KEY: 'pk_test_x' }).some((p) => p.includes('sk_')))
  assert.ok(checkEnv({ ...good, CLOUDINARY_URL: 'nope' }).some((p) => p.includes('CLOUDINARY_URL')))
})

test('premium users get higher daily limits', () => {
  assert.ok(limitFor('image', true) > limitFor('image', false))
})

test('missing Cloudflare settings only produce a warning', async () => {
  const { checkOptionalEnv } = await import('../config/env.js')
  assert.equal(checkOptionalEnv({}).length, 1)
  assert.deepEqual(checkOptionalEnv({ CLOUDFLARE_ACCOUNT_ID: 'a', CLOUDFLARE_API_TOKEN: 't' }), [])
  assert.deepEqual(checkEnv({ ...good }), []) // still starts without Cloudflare
})
