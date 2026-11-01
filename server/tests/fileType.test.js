import test from 'node:test'
import assert from 'node:assert/strict'
import { detectType } from '../utils/fileType.js'

test('detects real file types from their first bytes', () => {
  assert.equal(detectType(Buffer.from('%PDF-1.7 rest')), 'pdf')
  assert.equal(detectType(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0])), 'png')
  assert.equal(detectType(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), 'jpeg')
  assert.equal(detectType(Buffer.concat([Buffer.from('RIFF'), Buffer.from([1, 2, 3, 4]), Buffer.from('WEBP')])), 'webp')
})

test('rejects disguised or unknown files', () => {
  assert.equal(detectType(Buffer.from('<html>fake.png</html>')), null)
  assert.equal(detectType(Buffer.from('MZ executable')), null)
  assert.equal(detectType(Buffer.alloc(0)), null)
})
